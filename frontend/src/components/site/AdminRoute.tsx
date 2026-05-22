import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/state/store';
import { AppSkeleton } from '@/components/skeletons/AppSkeleton';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (isLoading) {
        return <AppSkeleton />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user?.isAdmin) {
        // Redirect non-admin users to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
