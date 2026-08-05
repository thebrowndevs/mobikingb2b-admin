'use client'

import React from 'react'
import PCard from '@/components/custom/PCard'
import { useTotalSales } from '@/hooks/useDashboard'
import { Loader2, IndianRupee } from 'lucide-react'

export default function TotalSales() {
  const { data, isLoading, isError } = useTotalSales()

  const formattedSales = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(data?.totalSales || 0)

  return (
    <PCard className="flex items-center justify-between">
      <div className="flex flex-col items-start mb-0">
        {isLoading ? (
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        ) : isError ? (
            <p className="text-sm text-red-500">Error loading</p>
        ) : (
            <p className="text-2xl font-bold">{formattedSales}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">Total Sales</p>
      </div>
      <IndianRupee className="h-8 w-8 text-primary" />
    </PCard>
  )
}
