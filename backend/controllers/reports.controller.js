import mongoose from 'mongoose';
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

    // 1. Total Revenue (Aggregation)
    const revenueResult = await Sale.aggregate([
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // 2. Operational Expenses (Aggregation)
    const expensesResult = await Expense.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const operationalExpenses = expensesResult[0]?.total || 0;

    // 3. COGS (Global Aggregation)
    const cogsResult = await Product.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$costPrice", "$soldQuantity"] } }
            }
        }
    ]);
    const cogs = cogsResult[0]?.total || 0;

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
    const { eventId } = req.query;
    const matchFilter = {};
    if (eventId) {
        matchFilter.event = new mongoose.Types.ObjectId(eventId);
    }

    const settings = await Settings.findOne({}).lean() || { openingBalance: 0 };

    // Parallelize independent queries for better performance
    const [
        revenueResult,
        expensesResult,
        cogsResult,
        salesCount,
        productsCount,
        recentSales,
        lowStockProducts
    ] = await Promise.all([
        // 1. Revenue
        Sale.aggregate([
            { $match: matchFilter },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]),
        // 2. Expenses
        Expense.aggregate([
            { $match: matchFilter },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // 3. COGS (Global for now, as per original logic)
        Product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ["$costPrice", "$soldQuantity"] } }
                }
            }
        ]),
        // 4. Counts
        Sale.countDocuments(matchFilter),
        Product.estimatedDocumentCount(),
        // 5. Recent Sales
        Sale.find(matchFilter)
            .sort({ timestamp: -1 })
            .limit(7)
            .select('totalAmount timestamp')
            .lean(),
        // 6. Low Stock
        Product.find({ stockQuantity: { $lte: 10 } }) // Only fetch actually low stock items
            .sort({ stockQuantity: 1 })
            .limit(5)
            .select('name stockQuantity')
            .lean()
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const operationalExpenses = expensesResult[0]?.total || 0;
    const cogs = cogsResult[0]?.total || 0;
    const totalExpenses = cogs + operationalExpenses;
    const currentBalance = settings.openingBalance + totalRevenue - operationalExpenses;

    const formattedRecentSales = recentSales.reverse().map(s => ({
        name: new Date(s.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
        amount: s.totalAmount,
    }));

    const formattedLowStock = lowStockProducts.map(p => ({
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
        recentSales: formattedRecentSales,
        lowStockProducts: formattedLowStock,
        salesCount,
        productsCount,
    });
});

// @desc    Get comprehensive event-based reports with chart data
// @route   GET /api/reports/events-summary
// @access  Private
export const getEventsReport = asyncHandler(async (req, res) => {
    // 1. Fetch Events
    const events = await Event.find({}).sort({ date: -1 }).lean();

    // 2. Sales Aggregation (Revenue & Count per Event)
    const salesByEvent = await Sale.aggregate([
        {
            $group: {
                _id: "$event",
                revenue: { $sum: "$totalAmount" },
                count: { $sum: 1 }
            }
        }
    ]);

    // 3. Expenses Aggregation (Total per Event)
    const expensesByEvent = await Expense.aggregate([
        {
            $group: {
                _id: "$event",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        }
    ]);

    // 4. COGS Aggregation per Event
    // Unwind items, lookup product to get costPrice, calculate cost, group by event
    const cogsByEvent = await Sale.aggregate([
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" }, // Lookup returns an array
        {
            $group: {
                _id: "$event", // Group by Sale's event reference
                cogs: {
                    $sum: { $multiply: ["$items.quantity", "$productDetails.costPrice"] }
                }
            }
        }
    ]);

    // Create maps for easier lookup O(1)
    const salesMap = new Map(salesByEvent.map(s => [s._id?.toString(), s]));
    const expenseMap = new Map(expensesByEvent.map(e => [e._id?.toString(), e]));
    const cogsMap = new Map(cogsByEvent.map(c => [c._id?.toString(), c]));

    // Merge data into events
    const eventSummaries = events.map(event => {
        const eventId = event._id.toString();
        const saleData = salesMap.get(eventId) || { revenue: 0, count: 0 };
        const expenseData = expenseMap.get(eventId) || { total: 0, count: 0 };
        const cogsData = cogsMap.get(eventId) || { cogs: 0 };

        const revenue = saleData.revenue;
        const expenseTotal = expenseData.total;
        const cogs = cogsData.cogs;
        const profit = revenue - expenseTotal - cogs;

        return {
            event: { // Clean event object
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
            saleCount: saleData.count,
            expenseCount: expenseData.count,
        };
    });

    // 5. Staff Performance (Aggregation)
    const staffPerformance = await Sale.aggregate([
        {
            $group: {
                _id: "$soldBy",
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { totalRevenue: -1 } },
        {
            $project: {
                staffName: "$_id",
                totalSales: 1,
                totalRevenue: 1,
                averageOrderValue: {
                    $cond: [
                        { $gt: ["$totalSales", 0] },
                        { $round: [{ $divide: ["$totalRevenue", "$totalSales"] }, 0] },
                        0
                    ]
                },
                _id: 0
            }
        }
    ]);

    // 6. Expenses by Category (Aggregation)
    const expensesByCategory = await Expense.aggregate([
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { total: -1 } },
        {
            $project: {
                category: "$_id",
                total: 1,
                count: 1,
                _id: 0
            }
        }
    ]);

    // 7. Sales Timeline (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Reset time to start of day to ensure consistent grouping
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const timelineData = await Sale.aggregate([
        { $match: { timestamp: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                amount: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates
    const salesTimeline = [];
    const timelineMap = new Map(timelineData.map(t => [t._id, t.amount]));

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        salesTimeline.push({
            date: dateKey,
            amount: timelineMap.get(dateKey) || 0,
        });
    }

    // 8. Totals (Global)
    const [totalRevenueResult, totalExpensesResult] = await Promise.all([
        Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
        Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
    ]);

    const totals = {
        revenue: totalRevenueResult[0]?.total || 0,
        expenses: totalExpensesResult[0]?.total || 0,
    };
    totals.profit = totals.revenue - totals.expenses;

    res.json({
        events: eventSummaries,
        staffPerformance,
        expensesByCategory,
        salesTimeline,
        totals,
    });
});
