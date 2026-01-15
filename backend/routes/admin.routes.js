import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllProducts,
    getAllSales,
    getAllExpenses,
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
router.get('/products', getAllProducts);

// Sales
router.get('/sales', getAllSales);

// Expenses
router.get('/expenses', getAllExpenses);

// Events
router.route('/events')
    .get(getAllEvents)
    .post(createGlobalEvent);

router.route('/events/:id')
    .put(updateEvent)
    .delete(deleteEvent);

export default router;
