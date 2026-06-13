import express from 'express';
import {
    getEvents,
    getEventStats,
    createEvent,
    updateEventStatus,
    deleteEvent,
    updateEventClearedSales,
} from '../controllers/event.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { validateEvent, validateEventStatus } from '../validation/event.validation.js';

const router = express.Router();

router.route('/')
    .get(protect, getEvents)
    .post(protect, admin, validateEvent, createEvent);

router.get('/:id/stats', protect, admin, getEventStats);

router.route('/:id/status')
    .put(protect, admin, validateEventStatus, updateEventStatus);

router.route('/:id/cleared-sales')
    .put(protect, updateEventClearedSales);

router.route('/:id')
    .delete(protect, admin, deleteEvent);

export default router;
