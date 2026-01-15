import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Sale from '../models/sale.model.js';
import Expense from '../models/expense.model.js';
import Event from '../models/event.model.js';
import Settings from '../models/settings.model.js';

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Get user by ID (admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Cannot delete your own account');
        }
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all products (admin only - across all users)
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
    res.json(products);
});

// @desc    Get all sales (admin only - across all users)
// @route   GET /api/admin/sales
// @access  Private/Admin
export const getAllSales = asyncHandler(async (req, res) => {
    const sales = await Sale.find({})
        .populate('user', 'name email')
        .populate('event', 'name')
        .sort({ timestamp: -1 });
    res.json(sales);
});

// @desc    Get all expenses (admin only - across all users)
// @route   GET /api/admin/expenses
// @access  Private/Admin
export const getAllExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find({})
        .populate('user', 'name email')
        .populate('event', 'name')
        .sort({ date: -1 });
    res.json(expenses);
});

// @desc    Get all events (admin only - across all users)
// @route   GET /api/admin/events
// @access  Private/Admin
export const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({})
        .populate('user', 'name email')
        .sort({ date: -1 });
    res.json(events);
});

// @desc    Create event (admin - global event)
// @route   POST /api/admin/events
// @access  Private/Admin
export const createGlobalEvent = asyncHandler(async (req, res) => {
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

// @desc    Update event (admin only)
// @route   PUT /api/admin/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.name = req.body.name || event.name;
        event.location = req.body.location || event.location;
        event.date = req.body.date ? new Date(req.body.date) : event.date;
        event.status = req.body.status || event.status;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event (admin only)
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        await Event.deleteOne({ _id: req.params.id });
        res.json({ message: 'Event removed' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalExpenses = await Expense.countDocuments();
    const totalEvents = await Event.countDocuments();

    const allSales = await Sale.find({});
    const allExpenses = await Expense.find({});

    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalExpenseAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Recent activity
    const recentSales = await Sale.find({})
        .populate('user', 'name')
        .sort({ timestamp: -1 })
        .limit(5);

    const recentUsers = await User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
        counts: {
            users: totalUsers,
            products: totalProducts,
            sales: totalSales,
            expenses: totalExpenses,
            events: totalEvents,
        },
        financials: {
            totalRevenue,
            totalExpenses: totalExpenseAmount,
            netProfit: totalRevenue - totalExpenseAmount,
        },
        recentSales,
        recentUsers,
    });
});

// @desc    Update sale (admin only)
// @route   PUT /api/admin/sales/:id
// @access  Private/Admin
export const updateSale = asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id);

    if (sale) {
        sale.soldBy = req.body.soldBy || sale.soldBy;
        sale.type = req.body.type || sale.type;
        sale.comboName = req.body.comboName !== undefined ? req.body.comboName : sale.comboName;
        sale.totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : sale.totalAmount;

        if (req.body.event !== undefined) {
            sale.event = req.body.event || null;
        }

        const updatedSale = await sale.save();
        const populatedSale = await Sale.findById(updatedSale._id)
            .populate('user', 'name email')
            .populate('event', 'name');

        res.json(populatedSale);
    } else {
        res.status(404);
        throw new Error('Sale not found');
    }
});

// @desc    Delete sale (admin only)
// @route   DELETE /api/admin/sales/:id
// @access  Private/Admin
export const deleteSale = asyncHandler(async (req, res) => {
    const sale = await Sale.findById(req.params.id);

    if (sale) {
        await Sale.deleteOne({ _id: req.params.id });
        res.json({ message: 'Sale removed' });
    } else {
        res.status(404);
        throw new Error('Sale not found');
    }
});

// @desc    Update expense (admin only)
// @route   PUT /api/admin/expenses/:id
// @access  Private/Admin
export const updateExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
        expense.description = req.body.description || expense.description;
        expense.category = req.body.category || expense.category;
        expense.amount = req.body.amount !== undefined ? req.body.amount : expense.amount;
        expense.date = req.body.date ? new Date(req.body.date) : expense.date;

        if (req.body.event !== undefined) {
            expense.event = req.body.event || null;
        }

        const updatedExpense = await expense.save();
        const populatedExpense = await Expense.findById(updatedExpense._id)
            .populate('user', 'name email')
            .populate('event', 'name');

        res.json(populatedExpense);
    } else {
        res.status(404);
        throw new Error('Expense not found');
    }
});

// @desc    Delete expense (admin only)
// @route   DELETE /api/admin/expenses/:id
// @access  Private/Admin
export const deleteExpense = asyncHandler(async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
        await Expense.deleteOne({ _id: req.params.id });
        res.json({ message: 'Expense removed' });
    } else {
        res.status(404);
        throw new Error('Expense not found');
    }
});

