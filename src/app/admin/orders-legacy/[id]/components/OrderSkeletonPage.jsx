import React from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrderSkeletonPage() {
    return (
        <InnerDashboardLayout>
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6">
                <h1 className="text-primary font-semibold text-2xl">
                    View Order
                </h1>
                {/* Skeleton Button */}
                <Skeleton className="h-8 w-24 rounded" />
            </div>

            {/* Six Boxes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Skeleton key={idx} className="h-32 w-full rounded" />
                ))}
            </div>

            {/* Big Box */}
            <div className="w-full mb-6">
                <Skeleton className="h-64 w-full rounded" />
            </div>

            <div className="w-full">
                <Skeleton className="h-64 w-full rounded" />
            </div>
        </InnerDashboardLayout>
    )
}
