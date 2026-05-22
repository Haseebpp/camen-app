import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const SettingsSkeleton: React.FC = () => (
    <div className="space-y-6 max-w-2xl animate-pulse">
        <Skeleton className="h-10 w-48" />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
            <div>
                <Skeleton className="h-6 w-56 mb-4" />
                <div className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-3 w-72 mt-2" />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-3 w-64 mt-2" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
