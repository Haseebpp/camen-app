import asyncHandler from 'express-async-handler';
import Sale from '../models/sale.model.js';
import Product from '../models/product.model.js';

// @desc    Get all sales for user
// @route   GET /api/sales
// @access  Private
export const getSales = asyncHandler(async (req, res) => {
    const sales = await Sale.find({ user: req.user._id })
        .populate('event', 'name')
        .sort({ timestamp: -1 });
    res.json(sales);
});

// @desc    Get sales by event
// @route   GET /api/sales/event/:eventId
// @access  Private
export const getSalesByEvent = asyncHandler(async (req, res) => {
    const sales = await Sale.find({
        user: req.user._id,
        event: req.params.eventId
    }).sort({ timestamp: -1 });
    res.json(sales);
});

// @desc    Create a sale
// @route   POST /api/sales
// @access  Private
export const createSale = asyncHandler(async (req, res) => {
    const { items, type, comboName, eventId } = req.body;

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Verify stock and update products
    for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, user: req.user._id });

        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.stockQuantity < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
        }

        // Update product stock
        product.stockQuantity -= item.quantity;
        product.soldQuantity += item.quantity;
        await product.save();
    }

    // Create the sale
    const sale = await Sale.create({
        user: req.user._id,
        timestamp: new Date(),
        type: type || 'INDIVIDUAL',
        items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        })),
        totalAmount,
        comboName: type === 'COMBO' ? comboName : null,
        soldBy: req.user.email,
        event: eventId || null,
    });

    res.status(201).json(sale);
});
