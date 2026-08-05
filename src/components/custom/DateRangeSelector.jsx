'use client'

import React, { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { startOfToday, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

const quickRanges = [
  { label: 'Today', range: () => [startOfToday(), startOfToday()] },
  { label: 'Yesterday', range: () => [subDays(startOfToday(), 1), subDays(startOfToday(), 1)] },
  { label: 'Last 7 Days', range: () => [subDays(startOfToday(), 6), startOfToday()] },
  { label: 'Last 28 Days', range: () => [subDays(startOfToday(), 27), startOfToday()] },
  { label: 'This Month', range: () => [startOfMonth(new Date()), new Date()] },
  { label: 'This Year', range: () => [startOfYear(new Date()), new Date()] },
]

export default function DateRangeSelector({ onChange, defaultRange }) {
  const [range, setRange] = React.useState(defaultRange ?? { from: new Date(), to: new Date() })
  const hasSetDefault = React.useRef(false)

  React.useEffect(() => {
    if (defaultRange && !hasSetDefault.current) {
      setRange(defaultRange)
      hasSetDefault.current = true // ✅ Only set default once
    }
  }, [defaultRange])

  const handleRangeSelect = (selected) => {
    if (!selected?.from || !selected?.to) return

    setRange(selected)
    onChange && onChange(selected)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 flex gap-6" align="start">
        <div className="flex flex-col gap-2 text-sm w-40">
          {quickRanges.map((item) => {
            const [from, to] = item.range()
            return (
              <Button
                key={item.label}
                variant="ghost"
                className="justify-start w-full"
                onClick={() => {
                  handleRangeSelect({ from, to })
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </div>
        <div>
          <Calendar
            mode="range"
            // captionLayout="dropdown"
            selected={range}
            onSelect={handleRangeSelect}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
