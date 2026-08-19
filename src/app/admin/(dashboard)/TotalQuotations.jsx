'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { useTotalQuotations } from '@/hooks/useDashboard'
import { Loader2, FileText } from 'lucide-react'

export default function TotalQuotations() {
  const { data, isLoading, isError } = useTotalQuotations()

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50/80 via-white to-amber-50/20 border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2 group">
      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex flex-col items-start z-10 min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-amber-600/80 uppercase tracking-wider truncate w-full">Total Quotations</p>
        {isLoading ? (
          <div className="h-7 flex items-center mt-0.5">
            <Loader2 className="animate-spin h-5 w-5 text-amber-500" />
          </div>
        ) : isError ? (
          <p className="text-xs font-semibold text-rose-500 mt-0.5">Error</p>
        ) : (
          <p className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 truncate">
            {data?.totalQuotations ?? 0}
          </p>
        )}
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-350 shadow-inner z-10 shrink-0">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </Card>
  )
}
