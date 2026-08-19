'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { useSalesOfOneDay } from '@/hooks/useDashboard'
import { formatINRCurrency } from '@/lib/services/formatters'
import MonthSelector from '@/components/custom/MonthSelector'
import { format } from 'date-fns'
import { Loader2, Calendar } from 'lucide-react'

function SalesOfOneMonth() {
  const [range, setRange] = useState(() => {
    const today = new Date()
    return {
      startDate: format(today, 'yyyy-MM-01'),
      endDate: format(today, 'yyyy-MM-dd'),
      monthLabel: format(today, 'LLLL yyyy'),
    }
  })

  const { startDate, endDate, monthLabel } = range
  const { isLoading, error, data } = useSalesOfOneDay(startDate, endDate)
  const formattedSales = formatINRCurrency(data?.salesInRange || 0)

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-rose-50/80 via-white to-rose-50/20 border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2 group">
      {/* Decorative background glow */}
      <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
      
      <div className="flex flex-col items-start z-10 min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-rose-600/80 uppercase tracking-wider truncate w-full">Sales - Monthly</p>
        {isLoading ? (
          <div className="h-7 flex items-center mt-0.5">
            <Loader2 className="animate-spin h-5 w-5 text-rose-500" />
          </div>
        ) : error ? (
          <p className="text-xs font-semibold text-rose-500 mt-0.5">Error</p>
        ) : (
          <p className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight mt-0.5 truncate">
            {formattedSales}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold w-full">
          <span className="truncate max-w-[80px]">{monthLabel}</span>
          <div className="scale-75 origin-left shrink-0">
            <MonthSelector onChange={setRange} />
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-3 rounded-xl bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-all duration-350 shadow-inner z-10 shrink-0">
        <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </Card>
  )
}

export default SalesOfOneMonth
