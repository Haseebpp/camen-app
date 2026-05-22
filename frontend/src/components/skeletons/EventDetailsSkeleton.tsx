import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const EventDetailsSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-20" />
                </div>
            ))}
        </div>
        <div className="border-t border-slate-100 pt-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="flex gap-4">
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-64 mt-3" />
        </div>
    </div>
);
