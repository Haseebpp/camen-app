import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import saleReducer from './slices/saleSlice';
import expenseReducer from './slices/expenseSlice';
import eventReducer from './slices/eventSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        sales: saleReducer,
        expenses: expenseReducer,
        events: eventReducer,
        settings: settingsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
