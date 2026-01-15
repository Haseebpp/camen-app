import express from 'express';
import {
    getFinancials,
    getDashboardData,
} from '../controllers/reports.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/financials', protect, getFinancials);
router.get('/dashboard', protect, getDashboardData);

export default router;
