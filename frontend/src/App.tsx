import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './state/store';
import { getProfile } from './state/slices/authSlice';
import { fetchSettings } from './state/slices/settingsSlice';
import { fetchProducts } from './state/slices/productSlice';
import { fetchSales } from './state/slices/saleSlice';
import { fetchEvents } from './state/slices/eventSlice';

// Site components
import Layout from './components/site/Layout';
import ProtectedRoute from './components/site/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Events from './pages/Events';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // Try to get user profile on app load (checks if already logged in via cookie)
        dispatch(getProfile());
    }, [dispatch]);

    useEffect(() => {
        // Fetch initial data when authenticated
        if (isAuthenticated) {
            dispatch(fetchSettings());
            dispatch(fetchProducts());
            dispatch(fetchSales());
            dispatch(fetchEvents());
        }
    }, [dispatch, isAuthenticated]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/events" element={<Events />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
