import asyncHandler from 'express-async-handler';
import Settings from '../models/settings.model.js';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ user: req.user._id });

    // Create default settings if not found
    if (!settings) {
        settings = await Settings.create({
            user: req.user._id,
            openingBalance: 0,
            currency: 'SAR',
            clearedSalesAmount: 0,
        });
    }

    res.json({
        openingBalance: settings.openingBalance,
        currency: settings.currency,
        clearedSalesAmount: settings.clearedSalesAmount,
        userEmail: req.user.email,
    });
});

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
        settings = await Settings.create({
            user: req.user._id,
            openingBalance: 0,
            currency: 'SAR',
            clearedSalesAmount: 0,
        });
    }

    if (req.body.clearedSalesAmount !== undefined) {
        const amt = Number(req.body.clearedSalesAmount);
        if (isNaN(amt) || amt < 0) {
            res.status(400);
            throw new Error('Cleared sales amount must be a non-negative number');
        }
        settings.clearedSalesAmount = amt;
    }

    settings.openingBalance = req.body.openingBalance ?? settings.openingBalance;
    settings.currency = req.body.currency ?? settings.currency;

    const updatedSettings = await settings.save();

    res.json({
        openingBalance: updatedSettings.openingBalance,
        currency: updatedSettings.currency,
        clearedSalesAmount: updatedSettings.clearedSalesAmount,
        userEmail: req.user.email,
    });
});
