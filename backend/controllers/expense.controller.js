import asyncHandler from 'express-async-handler';
import Expense from '../models/expense.model.js';

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ user: req.user._id })
        .populate('event', 'name')
        .sort({ date: -1 });
    res.json(expenses);
});

// @desc    Get expenses by event
// @route   GET /api/expenses/event/:eventId
// @access  Private
export const getExpensesByEvent = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({
        user: req.user._id,
        event: req.params.eventId
    }).sort({ date: -1 });
    res.json(expenses);
});

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = asyncHandler(async (req, res) => {
    const { description, category, amount, date, eventId } = req.body;

    const expense = await Expense.create({
        user: req.user._id,
        description,
        category: category || 'General',
        amount,
        date: date ? new Date(date) : new Date(),
        event: eventId || null,
    });

    res.status(201).json(expense);
});

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });

    if (expense) {
        await Expense.deleteOne({ _id: req.params.id });
        res.json({ message: 'Expense removed' });
    } else {
        res.status(404);
        throw new Error('Expense not found');
    }
});
