'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { useTotalOrders } from '@/hooks/useDashboard'
import { Loader2, ShoppingCart } from 'lucide-react'

export default function TotalOrders() {
  const { data, isLoading, isError } = useTotalOrders()

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-blue-50/20 border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2 group">
      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex flex-col items-start z-10 min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-blue-600/80 uppercase tracking-wider truncate w-full">Total Orders</p>
        {isLoading ? (
          <div className="h-7 flex items-center mt-0.5">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
          </div>
        ) : isError ? (
          <p className="text-xs font-semibold text-rose-500 mt-0.5">Error</p>
        ) : (
          <p className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight mt-0.5 truncate">
            {data?.totalOrders ?? 0}
          </p>
        )}
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-350 shadow-inner z-10 shrink-0">
        <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </Card>
  )
}
