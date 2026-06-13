import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Please add an event name'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Please add an event date'],
        },
        location: {
            type: String,
            required: [true, 'Please add a location'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['OPEN', 'CLOSED'],
            default: 'OPEN',
        },
        clearedSalesAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster querying
eventSchema.index({ user: 1, date: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
