import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ReportsSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-3">
                <Skeleton className="h-10 w-28 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
        </div>

        <Skeleton className="h-14 w-full rounded-xl" />

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-8">
            <div>
                <Skeleton className="h-6 w-64 mb-4" />
                <Skeleton className="h-80 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-6 w-48 mb-4" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);
