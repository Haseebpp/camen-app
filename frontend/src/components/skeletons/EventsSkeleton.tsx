import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const EventsSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded" />
                    </div>
                    <Skeleton className="h-9 w-full rounded-lg mt-2" />
                </div>
            </div>
        ))}
    </div>
);
