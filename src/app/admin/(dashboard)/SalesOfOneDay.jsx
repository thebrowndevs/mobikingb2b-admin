'use client'

import React, { useState } from "react"
import { CalendarDays, Loader2, Landmark } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import { useSalesOfOneDay } from "@/hooks/useDashboard"
import { formatINRCurrency } from "@/lib/services/formatters"
import { Button } from "@/components/ui/button"

function SalesOfOneDay() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')
    const { isLoading, error, data } = useSalesOfOneDay(formattedDate, formattedDate)
    const formattedSales = formatINRCurrency(data?.salesInRange || 0)

    return (
        <Card className="relative overflow-hidden bg-gradient-to-br from-violet-50/80 via-white to-violet-50/20 border-violet-100 hover:border-violet-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-xl p-3 sm:p-4 flex flex-row items-center justify-between gap-2 group">
            {/* Decorative background glow */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-violet-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            
            <div className="flex flex-col items-start z-10 min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-violet-600/80 uppercase tracking-wider truncate w-full">Sales - Daily</p>
                {isLoading ? (
                    <div className="h-7 flex items-center mt-0.5">
                        <Loader2 className="animate-spin h-5 w-5 text-violet-500" />
                    </div>
                ) : error ? (
                    <p className="text-xs font-semibold text-rose-500 mt-0.5">Error</p>
                ) : (
                    <p className="text-base sm:text-xl font-extrabold text-slate-800 tracking-tight mt-0.5 truncate">
                        {formattedSales}
                    </p>
                )}
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-semibold">
                    <span>{format(selectedDate, "PP")}</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="text-violet-500 hover:text-violet-700 hover:underline flex items-center gap-0.5">
                                (Change)
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (!date) return
                                    if (format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) return
                                    setSelectedDate(date)
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition-all duration-350 shadow-inner z-10 shrink-0">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
        </Card>
    )
}

export default SalesOfOneDay
