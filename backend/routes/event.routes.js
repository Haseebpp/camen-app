import express from 'express';
import {
    getEvents,
    getEventStats,
    createEvent,
    updateEventStatus,
    deleteEvent,
} from '../controllers/event.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateEvent, validateEventStatus } from '../validation/event.validation.js';

const router = express.Router();

router.route('/')
    .get(protect, getEvents)
    .post(protect, validateEvent, createEvent);

router.get('/:id/stats', protect, getEventStats);

router.route('/:id/status')
    .put(protect, validateEventStatus, updateEventStatus);

router.route('/:id')
    .delete(protect, deleteEvent);

export default router;
