import express from 'express';
import {
    getSettings,
    updateSettings,
} from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getSettings)
    .put(protect, updateSettings);

export default router;
