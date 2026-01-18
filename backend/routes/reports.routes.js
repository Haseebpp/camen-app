import express from 'express';
import {
    getFinancials,
    getDashboardData,
    getEventsReport,
} from '../controllers/reports.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Dashboard is accessible to all authenticated users
router.get('/dashboard', protect, getDashboardData);

// Financials and Events Report are admin-only
router.get('/financials', protect, admin, getFinancials);
router.get('/events-summary', protect, admin, getEventsReport);

export default router;

