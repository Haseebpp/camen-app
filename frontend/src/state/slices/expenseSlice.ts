import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '@/lib/types';
import expenseService from '../services/expenseService';

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ExpenseState = {
    expenses: [],
    isLoading: false,
    error: null,
};

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await expenseService.getExpenses();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const createExpense = createAsyncThunk(
    'expenses/create',
    async (
        expenseData: { description: string; category: string; amount: number; date: number; eventId?: string },
        { rejectWithValue }
    ) => {
        try {
            return await expenseService.createExpense(expenseData);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteExpense = createAsyncThunk(
    'expenses/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await expenseService.deleteExpense(id);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const expenseSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Expenses
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
                state.isLoading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Expense
            .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
                state.expenses.unshift(action.payload);
            })
            // Delete Expense
            .addCase(deleteExpense.fulfilled, (state, action: PayloadAction<string>) => {
                state.expenses = state.expenses.filter(e => e._id !== action.payload);
            });
    },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
