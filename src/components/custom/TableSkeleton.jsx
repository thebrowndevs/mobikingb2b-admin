// components/TableSkeleton.jsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = ({
    rows = 5,
    columns = 4,
    showHeader = true,
    showPagination = true
}) => {
    return (
        <div className="w-full space-y-6" style={{ backgroundColor: '#F3F4F6' }}>
            {/* Table Header Controls */}
            {showHeader && (
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-[150px] rounded-lg bg-gray-300" />
                        <Skeleton className="h-10 w-[100px] rounded-lg bg-gray-300" />
                    </div>
                    <Skeleton className="h-10 w-[120px] rounded-lg bg-gray-300" />
                </div>
            )}

            {/* Table Structure */}
            <div className="overflow-hidden rounded border border-gray-200 bg-white">
                {/* Table Headers */}
                <div className="bg-gray-50 p-4 grid grid-cols-12 gap-4">
                    {Array.from({ length: columns }).map((_, idx) => (
                        <div
                            key={`header-${idx}`}
                            className="col-span-3" // 12 / 4 = 3 columns each
                        >
                            <Skeleton className="h-5 w-3/4 rounded-md bg-gray-300" />
                        </div>
                    ))}
                </div>

                {/* Table Rows */}
                <div className="bg-white divide-y divide-gray-100">
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <div
                            key={`row-${rowIdx}`}
                            className="grid grid-cols-12 gap-4 p-4"
                        >
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <div
                                    key={`cell-${rowIdx}-${colIdx}`}
                                    className="col-span-3"
                                >
                                    <Skeleton
                                        className="h-5 rounded-md bg-gray-200 animate-pulse"
                                        style={{
                                            animationDelay: `${rowIdx * 0.05}s`,
                                            animationDuration: "1.5s",
                                            width: colIdx % 2 === 0 ? '90%' : '70%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            {showPagination && (
                <div className="flex items-center justify-between px-2 py-4">
                    <Skeleton className="h-5 w-32 rounded-md bg-gray-300" />
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24 rounded-lg bg-gray-300" />
                        <Skeleton className="h-9 w-24 rounded-lg bg-gray-300" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableSkeleton;