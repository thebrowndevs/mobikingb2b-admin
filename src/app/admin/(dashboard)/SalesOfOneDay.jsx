'use client'

import React, { useState } from "react"
import { CalendarDays, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import PCard from "@/components/custom/PCard"
import { useSalesOfOneDay } from "@/hooks/useDashboard"
import { formatINRCurrency } from "@/lib/services/formatters"
import { Button } from "@/components/ui/button"

function SalesOfOneDay() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')
    const { isLoading, error, data } = useSalesOfOneDay(formattedDate, formattedDate)
    const formattedSales = formatINRCurrency(data?.salesInRange || 0)

    return (
        <PCard className="flex max-[1150px]:gap-2 max-[1150px]:flex-col min-[1150px]:items-center justify-between">
            <div className="flex flex-col gap-1 h-full items-start mb-0 justify-center">
                {isLoading ?
                    <Loader2 className="animate-spin" />
                    : <p className="text-2xl font-semibold">{formattedSales}</p>
                }
                <p className="text-muted-foreground text-sm">Sales - Day</p>
            </div>

            <div className="text-sm text-muted-foreground flex min-[1300px]:flex-col gap-2 items-center min-[1300px]:items-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="flex gap-2 items-center">
                            <CalendarDays className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            // captionLayout="dropdown"
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
                <p>
                    {format(selectedDate, "PPP")}
                </p>
            </div>

        </PCard>
    )
}

export default SalesOfOneDay
