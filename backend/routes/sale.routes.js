import express from 'express';
import {
    getSales,
    getSalesByEvent,
    createSale,
} from '../controllers/sale.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateSale } from '../validation/sale.validation.js';

const router = express.Router();

router.route('/')
    .get(protect, getSales)
    .post(protect, validateSale, createSale);

router.get('/event/:eventId', protect, getSalesByEvent);

export default router;
