'use client'

import React, { useState } from 'react'
import { useSalesOfOneDay } from '@/hooks/useDashboard'
import { formatINRCurrency } from '@/lib/services/formatters'
import MonthSelector from '@/components/custom/MonthSelector'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

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
    <div className="flex max-[1300px]:gap-2 max-[1300px]:flex-col min-[1300px]:items- justify-between p-6 rounded-sm border border-slate-200 dark:border-slate-800 bg-white transition-all duration-300 hover:scale-[1.02]">
      <div className="flex flex-col gap-1 h-full items-start mb-0 justify-center">
        {isLoading ?
          <Loader2 className="animate-spin text-purple-500" />
          : <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{formattedSales}</p>
        } <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sales - Month</p>
      </div>
      <div className="flex min-[1300px]:flex-col gap-2 items-center min-[1300px]:items-end text-sm text-slate-500 dark:text-slate-400">
        <MonthSelector onChange={setRange} />
      </div>
    </div>
  )
}

export default SalesOfOneMonth
