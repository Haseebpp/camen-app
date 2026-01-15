import express from 'express';
import {
    getExpenses,
    getExpensesByEvent,
    createExpense,
    deleteExpense,
} from '../controllers/expense.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateExpense } from '../validation/expense.validation.js';

const router = express.Router();

router.route('/')
    .get(protect, getExpenses)
    .post(protect, validateExpense, createExpense);

router.get('/event/:eventId', protect, getExpensesByEvent);

router.route('/:id')
    .delete(protect, deleteExpense);

export default router;
