'use client'

import React from 'react'
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
    <div className="flex items-center justify-between p-6 rounded-sm border border-slate-200 dark:border-slate-800 bg-white transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col items-start mb-0">
        {isLoading ? (
          <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
        ) : isError ? (
          <p className="text-sm text-red-500">Error loading</p>
        ) : (
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{formattedSales}</p>
        )}
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Total Sales</p>
      </div>
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
        <IndianRupee className="h-6 w-6 text-emerald-500" />
      </div>
    </div>
  )
}
