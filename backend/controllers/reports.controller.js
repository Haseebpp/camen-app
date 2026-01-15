import asyncHandler from 'express-async-handler';
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';
import Expense from '../models/expense.model.js';
import Settings from '../models/settings.model.js';

// @desc    Get financial summary
// @route   GET /api/reports/financials
// @access  Private
export const getFinancials = asyncHandler(async (req, res) => {
    const settings = await Settings.findOne({ user: req.user._id }) || { openingBalance: 0 };
    const sales = await Sale.find({ user: req.user._id });
    const products = await Product.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });

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
export const getDashboardData = asyncHandler(async (req, res) => {
    const settings = await Settings.findOne({ user: req.user._id }) || { openingBalance: 0 };
    const sales = await Sale.find({ user: req.user._id }).sort({ timestamp: -1 });
    const products = await Product.find({ user: req.user._id });
    const expenses = await Expense.find({ user: req.user._id });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const cogs = products.reduce((sum, product) => sum + (product.costPrice * product.soldQuantity), 0);
    const operationalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = cogs + operationalExpenses;
    const currentBalance = settings.openingBalance + totalRevenue - operationalExpenses;

    // Recent sales for chart (last 7)
    const recentSales = sales.slice(0, 7).reverse().map(s => ({
        name: new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
        amount: s.totalAmount,
    }));

    // Lowest stock products
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
