import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Sale, CartItem, SaleType } from '@/lib/types';
import saleService from '../services/saleService';

interface SaleState {
    sales: Sale[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SaleState = {
    sales: [],
    isLoading: false,
    error: null,
};

export const fetchSales = createAsyncThunk('sales/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await saleService.getSales();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const createSale = createAsyncThunk(
    'sales/create',
    async (
        saleData: { items: CartItem[]; type: SaleType; comboName?: string; eventId?: string },
        { rejectWithValue }
    ) => {
        try {
            return await saleService.createSale(saleData);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const saleSlice = createSlice({
    name: 'sales',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Sales
            .addCase(fetchSales.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSales.fulfilled, (state, action: PayloadAction<Sale[]>) => {
                state.isLoading = false;
                state.sales = action.payload;
            })
            .addCase(fetchSales.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Sale
            .addCase(createSale.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSale.fulfilled, (state, action: PayloadAction<Sale>) => {
                state.isLoading = false;
                state.sales.unshift(action.payload);
            })
            .addCase(createSale.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = saleSlice.actions;
export default saleSlice.reducer;
