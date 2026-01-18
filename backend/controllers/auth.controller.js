import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Settings from '../models/settings.model.js';
import { generateToken } from '../middleware/auth.middleware.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // First user becomes admin
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = await User.create({
        name,
        email,
        password,
        isAdmin: isFirstUser,
    });

    if (user) {
        // Create default settings for the user
        await Settings.create({
            user: user._id,
            openingBalance: 0,
            currency: 'SAR',
        });

        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Email: ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
        console.log(`[LOGIN FAILED] User not found: ${email}`);
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (await user.matchPassword(password)) {
        console.log(`[LOGIN SUCCESS] User: ${user.name}`);
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        console.log(`[LOGIN FAILED] Password mismatch for: ${email}`);
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
    try {
        console.log('[LOGOUT ATTEMPT]');
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        console.log('[LOGOUT SUCCESS]');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('[LOGOUT ERROR]', err);
        res.status(500).json({ message: 'Logout failed', error: err.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});
