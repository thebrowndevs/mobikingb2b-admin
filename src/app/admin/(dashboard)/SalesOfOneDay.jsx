'use client'

import React, { useState } from "react"
import { CalendarDays, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { useSalesOfOneDay } from "@/hooks/useDashboard"
import { formatINRCurrency } from "@/lib/services/formatters"
import { Button } from "@/components/ui/button"

function SalesOfOneDay() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')
    const { isLoading, error, data } = useSalesOfOneDay(formattedDate, formattedDate)
    const formattedSales = formatINRCurrency(data?.salesInRange || 0)

    return (
        <div className="flex max-[1150px]:gap-2 max-[1150px]:flex-col min-[1150px]:items-center justify-between p-6 rounded-sm border border-slate-200 dark:border-slate-800 bg-white transition-all duration-300 hover:scale-[1.02]">
            <div className="flex flex-col gap-1 h-full items-start mb-0 justify-center">
                {isLoading ?
                    <Loader2 className="animate-spin text-sky-500" />
                    : <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{formattedSales}</p>
                }
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sales - Day</p>
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 flex min-[1300px]:flex-col gap-2 items-center min-[1300px]:items-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex gap-2 items-center p-2 rounded-xl">
                            <CalendarDays className="h-4 w-4 text-sky-500" />
                        </Button>
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
                <p className="text-xs font-semibold">
                    {format(selectedDate, "PPP")}
                </p>
            </div>

        </div>
    )
}

export default SalesOfOneDay
