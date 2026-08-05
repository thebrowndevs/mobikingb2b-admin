'use client'

import React, { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

export default function MonthSelector({ onChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleYearChange = (delta) => {
    const newDate = new Date(selectedDate.getFullYear() + delta, selectedDate.getMonth(), 1)
    setSelectedDate(newDate)
  }

  const handleMonthSelect = (monthIndex) => {
    const year = selectedDate.getFullYear()
    const date = new Date(year, monthIndex, 1)

    const start = format(startOfMonth(date), 'yyyy-MM-dd')
    const end = format(endOfMonth(date), 'yyyy-MM-dd')

    setSelectedDate(date)
    onChange({
      startDate: start,
      endDate: end,
      monthLabel: format(date, 'LLLL yyyy'),
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <CalendarDays className="h-4 w-4" />
          {format(selectedDate, 'LLLL yyyy')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        {/* Year navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(-1)}
            aria-label="Previous Year"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{selectedDate.getFullYear()}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleYearChange(1)}
            aria-label="Next Year"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Months grid */}
        <div className="grid grid-cols-2 gap-2">
          {months.map((month, idx) => (
            <Button
              key={month}
              variant={idx === selectedDate.getMonth() ? 'secondary' : 'ghost'}
              className="w-full"
              onClick={() => handleMonthSelect(idx)}
            >
              {month}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
