import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

interface TableSkeletonProps {
    columns: number;
    rows?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 5 }) => {
    return (
        <>
            {[...Array(rows)].map((_, rowIndex) => (
                <TableRow key={rowIndex} className="animate-pulse">
                    {[...Array(columns)].map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton className="h-6 w-full rounded" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
};
