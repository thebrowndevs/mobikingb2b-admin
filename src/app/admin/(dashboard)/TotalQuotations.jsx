'use client'

import React from 'react'
import { useTotalQuotations } from '@/hooks/useDashboard'
import { Loader2, FileText } from 'lucide-react'

export default function TotalQuotations() {
  const { data, isLoading, isError } = useTotalQuotations()

  return (
    <div className="flex items-center justify-between p-6 rounded-sm border border-slate-200 dark:border-slate-800 bg-white transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col items-start mb-0">
        {isLoading ? (
          <Loader2 className="animate-spin h-8 w-8 text-amber-500" />
        ) : isError ? (
          <p className="text-sm text-red-500">Error loading</p>
        ) : (
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {data?.totalQuotations ?? 0}
          </p>
        )}
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Total Quotations</p>
      </div>
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
        <FileText className="h-6 w-6 text-amber-500" />
      </div>
    </div>
  )
}
