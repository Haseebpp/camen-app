import asyncHandler from 'express-async-handler';
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import Expense from '../models/expense.model.js';
import Event from '../models/event.model.js';
import Settings from '../models/settings.model.js';

// @desc    Get financial summary
// @route   GET /api/reports/financials
// @access  Private
export const getFinancials = asyncHandler(async (req, res) => {
    // Global visibility: Removed user filters
    const settings = await Settings.findOne({}) || { openingBalance: 0 };
    const sales = await Sale.find({});
    const products = await Product.find({});
    const expenses = await Expense.find({});

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Cost of Goods Sold
    const cogs = products.reduce((sum, product) => sum + (product.costPrice * product.soldQuantity), 0);

    // Operational Expenses
    const operationalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = cogs + operationalExpenses;

    // Current Balance = Opening + Revenue - Operational Expenses
    const currentBalance = settings.openingBalance + totalRevenue - operationalExpenses;

    res.json({
        openingBalance: settings.openingBalance,
        totalRevenue,
        totalExpenses,
        cogs,
        operationalExpenses,
        currentBalance,
    });
});

// @desc    Get dashboard data
// @route   GET /api/reports/dashboard
// @access  Private
// @access  Private
export const getDashboardData = asyncHandler(async (req, res) => {
    // Global visibility: Removed user filters
    // Check for optional eventId filter
    const { eventId } = req.query;
    const filter = {};
    if (eventId) {
        filter.event = eventId;
    }

    const settings = await Settings.findOne({}) || { openingBalance: 0 };
    const sales = await Sale.find(filter).sort({ timestamp: -1 });
    const products = await Product.find({});
    const expenses = await Expense.find(filter);

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const cogs = products.reduce((sum, product) => sum + (product.costPrice * product.soldQuantity), 0);
    const operationalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = cogs + operationalExpenses;

    // If filtering by event, opening balance might not make sense to include, or should just be 0 for 'Current Balance' calc context?
    // For now, we will keep the calculation standard but be aware that 'currentBalance' with event filter means "Event Profit + Global Opening Balance" which might be weird.
    // However, user just asked for "data of that particular event".
    // Better interpretation: Current Balance usually tracks the *store's* cash. 
    // If I filter by event, Revenue and Expenses are event specific.
    // Opening Balance is Global.
    // So Current Balance = Global Opening + Event Revenue - Event Expenses? No, that's partial.
    // If filtering by event, maybe Current Balance should just be Event Profit (Revenue - Expenses).
    // Let's stick to the formula but understand the context.
    const currentBalance = settings.openingBalance + totalRevenue - operationalExpenses;

    // Recent sales for chart (last 7)
    const recentSales = sales.slice(0, 7).reverse().map(s => ({
        name: new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
        amount: s.totalAmount,
    }));

    // Lowest stock products
    // Products are global, but maybe we could show products sold *in this event*?
    // User requirement: "inventory pages based on the current seleted event which shows data of that particular event"
    // But modifying getDashboardData, let's keep products global for the "Low Stock" widget unless we want to filter it too. 
    // Given the widget is "Low Stock Alerts", it's about what we need to buy. That's global.
    const lowStockProducts = [...products]
        .sort((a, b) => a.stockQuantity - b.stockQuantity)
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            stock: p.stockQuantity,
        }));

    res.json({
        financials: {
            openingBalance: settings.openingBalance,
            totalRevenue,
            totalExpenses,
            currentBalance,
        },
        recentSales,
        lowStockProducts,
        salesCount: sales.length,
        productsCount: products.length,
    });
});

// @desc    Get comprehensive event-based reports with chart data
// @route   GET /api/reports/events-summary
// @access  Private
export const getEventsReport = asyncHandler(async (req, res) => {
    // Global visibility: Removed user filters
    const events = await Event.find({}).sort({ date: -1 });
    const sales = await Sale.find({}).populate('event', 'name');
    const expenses = await Expense.find({}).populate('event', 'name');
    const products = await Product.find({});

    // Create product lookup for COGS calculation
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // =============== EVENT SUMMARIES ===============
    const eventSummaries = events.map(event => {
        const eventSales = sales.filter(s => s.event?._id?.toString() === event._id.toString());
        const eventExpenses = expenses.filter(e => e.event?._id?.toString() === event._id.toString());

        const revenue = eventSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const expenseTotal = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Calculate COGS for this event
        let cogs = 0;
        for (const sale of eventSales) {
            for (const item of sale.items) {
                const product = productMap.get(item.productId.toString());
                if (product) {
                    cogs += product.costPrice * item.quantity;
                }
            }
        }

        const profit = revenue - expenseTotal - cogs;

        return {
            event: {
                _id: event._id,
                name: event.name,
                date: event.date,
                location: event.location,
                status: event.status,
            },
            revenue,
            expenses: expenseTotal,
            cogs,
            profit,
            saleCount: eventSales.length,
            expenseCount: eventExpenses.length,
        };
    });

    // =============== STAFF PERFORMANCE ===============
    const staffPerformanceMap = new Map();

    for (const sale of sales) {
        const staffName = sale.soldBy || 'Unknown';
        if (!staffPerformanceMap.has(staffName)) {
            staffPerformanceMap.set(staffName, {
                staffName,
                totalSales: 0,
                totalRevenue: 0,
            });
        }
        const staff = staffPerformanceMap.get(staffName);
        staff.totalSales++;
        staff.totalRevenue += sale.totalAmount;
    }

    const staffPerformance = Array.from(staffPerformanceMap.values())
        .map(staff => ({
            ...staff,
            averageOrderValue: staff.totalSales > 0
                ? Math.round(staff.totalRevenue / staff.totalSales)
                : 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // =============== EXPENSES BY CATEGORY ===============
    const categoryMap = new Map();

    for (const expense of expenses) {
        const category = expense.category || 'General';
        if (!categoryMap.has(category)) {
            categoryMap.set(category, { category, total: 0, count: 0 });
        }
        const cat = categoryMap.get(category);
        cat.total += expense.amount;
        cat.count++;
    }

    const expensesByCategory = Array.from(categoryMap.values())
        .sort((a, b) => b.total - a.total);

    // =============== SALES TIMELINE ===============
    // Group sales by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDate = new Map();

    for (const sale of sales) {
        const saleDate = new Date(sale.timestamp);
        if (saleDate >= thirtyDaysAgo) {
            const dateKey = saleDate.toISOString().split('T')[0];
            if (!salesByDate.has(dateKey)) {
                salesByDate.set(dateKey, 0);
            }
            salesByDate.set(dateKey, salesByDate.get(dateKey) + sale.totalAmount);
        }
    }

    // Generate array for last 30 days (fill missing days with 0)
    const salesTimeline = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        salesTimeline.push({
            date: dateKey,
            amount: salesByDate.get(dateKey) || 0,
        });
    }

    // =============== TOTALS ===============
    const totals = {
        revenue: sales.reduce((sum, s) => sum + s.totalAmount, 0),
        expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        profit: 0,
    };
    totals.profit = totals.revenue - totals.expenses;

    // =============== RESPONSE ===============
    res.json({
        events: eventSummaries,
        staffPerformance,
        expensesByCategory,
        salesTimeline,
        totals,
    });
});
