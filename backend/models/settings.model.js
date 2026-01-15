import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        openingBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        currency: {
            type: String,
            default: 'SAR',
        },
    },
    {
        timestamps: true,
    }
);

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
