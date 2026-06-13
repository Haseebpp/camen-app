import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        itemCode: {
            type: String,
            required: [true, 'Please add an item code'],
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            default: 'General',
        },
        costPrice: {
            type: Number,
            required: [true, 'Please add a cost price'],
            min: 0,
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Please add a selling price'],
            min: 0,
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        initialStock: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        soldQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        image: {
            type: String,
            default: '/images/products/box.png',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster querying
productSchema.index({ user: 1, itemCode: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
