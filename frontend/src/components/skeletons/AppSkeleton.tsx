import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const AppSkeleton: React.FC = () => (
    <div className="flex min-h-screen bg-slate-50 animate-pulse">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-64 flex-col bg-indigo-900">
            <div className="h-16 flex items-center px-6 border-b border-indigo-800">
                <Skeleton className="h-8 w-32 bg-indigo-800/50" />
            </div>
            <div className="p-4 space-y-2">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg bg-indigo-800/50" />
                ))}
            </div>
            <div className="mt-auto p-4 border-t border-indigo-800">
                <Skeleton className="h-12 w-full rounded-lg bg-indigo-800/50" />
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {/* Header Skeleton */}
            <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
                <Skeleton className="h-8 w-8 md:hidden" />
                <div className="flex items-center gap-4 ml-auto">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>

            {/* Body Skeleton (Generic Dashboard-like) */}
            <div className="flex-1 p-4 md:p-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    </div>
);
