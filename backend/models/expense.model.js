import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            trim: true,
        },
        category: {
            type: String,
            default: 'General',
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
            min: 0,
        },
        date: {
            type: Date,
            default: Date.now,
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
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ event: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
