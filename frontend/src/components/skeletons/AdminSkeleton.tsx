import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
        </div>
    </div>
);
