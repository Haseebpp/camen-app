import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/state/store';
import { AppSkeleton } from '@/components/skeletons/AppSkeleton';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (isLoading) {
        return <AppSkeleton />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
