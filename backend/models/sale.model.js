import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const saleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        type: {
            type: String,
            enum: ['INDIVIDUAL', 'COMBO'],
            default: 'INDIVIDUAL',
        },
        items: [cartItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        comboName: {
            type: String,
            default: null,
        },
        soldBy: {
            type: String,
            required: true,
        },
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster querying
saleSchema.index({ user: 1, timestamp: -1 });
saleSchema.index({ event: 1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
