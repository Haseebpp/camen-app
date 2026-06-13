import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AppSettings } from '@/lib/types';
import settingsService from '../services/settingsService';

interface SettingsState {
    settings: AppSettings | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    settings: null,
    isLoading: false,
    error: null,
};

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
    try {
        return await settingsService.getSettings();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const updateSettings = createAsyncThunk(
    'settings/update',
    async (data: { openingBalance?: number; currency?: string; clearedSalesAmount?: number }, { rejectWithValue }) => {
        try {
            return await settingsService.updateSettings(data);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Settings
            .addCase(fetchSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<AppSettings>) => {
                state.isLoading = false;
                state.settings = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Settings
            .addCase(updateSettings.fulfilled, (state, action: PayloadAction<AppSettings>) => {
                state.settings = action.payload;
            });
    },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
