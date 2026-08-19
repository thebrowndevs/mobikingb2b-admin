'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Clock, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

export default function SMSCredit() {
    const [now, setNow] = useState(new Date())
    const [isLoading, setIsLoading] = useState(true)
    const [credit, setCredit] = useState(null)
    const [error, setError] = useState(null)
    const [lowCredit, setLowCredit] = useState(false)

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // SMS Balance effect
    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await axios.get('/api/sms-balance')
                const rawCredit = response?.data?.Data?.[0]?.Credits
                if (!rawCredit) throw new Error("No data")

                const numericCredit = parseFloat(rawCredit.replace('INR', ''))

                // Check for low balance
                if (numericCredit < 50) {
                    setLowCredit(true)
                }

                // Format with commas and 2 decimal places
                const formatted = numericCredit.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })

                setCredit(formatted)
            } catch (err) {
                setError('FAIL')
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCredits()
    }, [])

    const formattedTime = format(now, 'hh:mm:ss a')
    const formattedDate = format(now, 'dd MMM yyyy')

    return (
        <div className="flex items-center gap-3 bg-white border border-grey-100 px-3.5 py-1.5 rounded-full text-xs font-medium text-grey-600 w-fit md:ml-auto select-none">
            {/* Live Clock Section */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-semibold">{formattedDate}</span>
                <span className="text-slate-700 font-bold tabular-nums tracking-wide">{formattedTime}</span>
            </div>

            {/* SMS Balance Section */}
            <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${isLoading
                    ? 'bg-amber-400 animate-pulse'
                    : error
                        ? 'bg-rose-400'
                        : lowCredit
                            ? 'bg-rose-400 animate-pulse'
                            : 'bg-emerald-400'
                    }`}></span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">SMS:</span>
                <span className={`font-bold tracking-tight ${isLoading
                    ? 'text-amber-500'
                    : error
                        ? 'text-rose-500'
                        : lowCredit
                            ? 'text-rose-500'
                            : 'text-slate-800'
                    }`}>
                    {isLoading ? '...' : error ? 'FAIL' : `₹${credit}`}
                </span>
            </div>
        </div>
    )
}
