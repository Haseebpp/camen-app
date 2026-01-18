import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getAllSales,
    updateSale,
    deleteSale,
    getAllExpenses,
    updateExpense,
    deleteExpense,
    getAllEvents,
    createGlobalEvent,
    updateEvent,
    deleteEvent,
    getAdminStats,
} from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Stats
router.get('/stats', getAdminStats);

// Users
router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

// Products
// Products
router.route('/products')
    .get(getAllProducts);

router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

// Sales
router.route('/sales')
    .get(getAllSales);

router.route('/sales/:id')
    .put(updateSale)
    .delete(deleteSale);

// Expenses
router.route('/expenses')
    .get(getAllExpenses);

router.route('/expenses/:id')
    .put(updateExpense)
    .delete(deleteExpense);

// Events
router.route('/events')
    .get(getAllEvents)
    .post(createGlobalEvent);

router.route('/events/:id')
    .put(updateEvent)
    .delete(deleteEvent);

export default router;

