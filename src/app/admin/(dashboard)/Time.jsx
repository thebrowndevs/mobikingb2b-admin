'use client'

import React, { useEffect, useState } from 'react'
import PCard from '@/components/custom/PCard'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'

export default function Time() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formattedTime = format(now, 'hh:mm a')        // e.g., 08:52 PM
  const formattedDate = format(now, 'MMMM dd, yyyy')  // e.g., June 28, 2025

  return (
    <PCard className="flex items-center justify-between h-full">
      <div className="flex flex-col items-start mb-0">
        <p className="text-2xl font-bold leading-tight">{formattedTime}</p>
        <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
      </div>
      <Clock className="h-8 w-8 text-primary" />
    </PCard>
  )
}
