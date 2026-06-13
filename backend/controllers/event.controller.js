import asyncHandler from 'express-async-handler';
import Event from '../models/event.model.js';
import Sale from '../models/sale.model.js';
import Expense from '../models/expense.model.js';
import Product from '../models/product.model.js';

// @desc    Get all events (Global)
// @route   GET /api/events
// @access  Private
export const getEvents = asyncHandler(async (req, res) => {
    // Global visibility: Removed user filter
    const events = await Event.find({}).sort({ date: -1 });
    res.json(events);
});

// @desc    Get event statistics
// @route   GET /api/events/:id/stats
// @access  Private
export const getEventStats = asyncHandler(async (req, res) => {
    // Global visibility: Show stats for any event
    const event = await Event.findOne({ _id: req.params.id });

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Aggregate global sales/expenses for this event
    const eventSales = await Sale.find({ event: req.params.id });
    const eventExpenses = await Expense.find({ event: req.params.id });
    const products = await Product.find({}); // Global products for COGS

    const revenue = eventSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const expenses = eventExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Calculate COGS
    let cogs = 0;
    for (const sale of eventSales) {
        for (const item of sale.items) {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            if (product) {
                cogs += product.costPrice * item.quantity;
            }
        }
    }

    const totalCost = expenses + cogs;
    const profit = revenue - totalCost;

    res.json({
        revenue,
        expenses,
        cogs,
        profit,
        saleCount: eventSales.length,
        expenseCount: eventExpenses.length,
    });
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private
export const createEvent = asyncHandler(async (req, res) => {
    const { name, date, location } = req.body;

    const event = await Event.create({
        user: req.user._id,
        name,
        date: new Date(date),
        location,
        status: 'OPEN',
    });

    res.status(201).json(event);
});

// @desc    Update event status
// @route   PUT /api/events/:id/status
// @access  Private
export const updateEventStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });

    if (event) {
        event.status = status;
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findOne({ _id: req.params.id, user: req.user._id });

    if (event) {
        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Update event cleared sales amount
// @route   PUT /api/events/:id/cleared-sales
// @access  Private
export const updateEventClearedSales = asyncHandler(async (req, res) => {
    const { clearedSalesAmount } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (clearedSalesAmount !== undefined) {
        const amt = Number(clearedSalesAmount);
        if (isNaN(amt) || amt < 0) {
            res.status(400);
            throw new Error('Cleared sales amount must be a non-negative number');
        }
        event.clearedSalesAmount = amt;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
});
