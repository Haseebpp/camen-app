import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/lib/types';
import productService from '../services/productService';

interface ProductState {
    products: Product[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    isLoading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async (_, { rejectWithValue }) => {
    try {
        return await productService.getProducts();
    } catch (error) {
        return rejectWithValue((error as Error).message);
    }
});

export const createProduct = createAsyncThunk(
    'products/create',
    async (product: Omit<Product, '_id' | 'soldQuantity'>, { rejectWithValue }) => {
        try {
            return await productService.createProduct(product);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, updates }: { id: string; updates: Partial<Product> }, { rejectWithValue }) => {
        try {
            return await productService.updateProduct(id, updates);
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await productService.deleteProduct(id);
            return id;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateProductStock: (state, action: PayloadAction<{ productId: string; soldQuantity: number }>) => {
            const product = state.products.find(p => p._id === action.payload.productId);
            if (product) {
                product.stockQuantity -= action.payload.soldQuantity;
                product.soldQuantity += action.payload.soldQuantity;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Product
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.products.unshift(action.payload);
            })
            // Update Product
            .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            // Delete Product
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
                state.products = state.products.filter(p => p._id !== action.payload);
            });
    },
});

export const { clearError, updateProductStock } = productSlice.actions;
export default productSlice.reducer;
