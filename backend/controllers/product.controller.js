import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';

// @desc    Get all products for user
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
    // Removed user filter to allow all staff to see products
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = asyncHandler(async (req, res) => {
    // Removed user filter
    const product = await Product.findOne({ _id: req.params.id });

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
    const { itemCode, name, description, category, costPrice, sellingPrice, stockQuantity, image } = req.body;

    const product = await Product.create({
        user: req.user._id,
        itemCode,
        name,
        description: description || '',
        category: category || 'General',
        costPrice,
        sellingPrice,
        stockQuantity,
        initialStock: stockQuantity,
        soldQuantity: 0,
        image: image || '/images/products/box.png',
    });

    res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (product) {
        product.itemCode = req.body.itemCode ?? product.itemCode;
        product.name = req.body.name ?? product.name;
        product.description = req.body.description ?? product.description;
        product.category = req.body.category ?? product.category;
        product.costPrice = req.body.costPrice ?? product.costPrice;
        product.sellingPrice = req.body.sellingPrice ?? product.sellingPrice;
        product.stockQuantity = req.body.stockQuantity ?? product.stockQuantity;
        product.initialStock = req.body.initialStock ?? product.initialStock;
        product.soldQuantity = req.body.soldQuantity ?? product.soldQuantity;
        product.image = req.body.image ?? product.image;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });

    if (product) {
        await Product.deleteOne({ _id: req.params.id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});
