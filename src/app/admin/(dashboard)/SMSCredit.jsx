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
                if (numericCredit < 50) {
                    setLowCredit(true)
                }

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
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-sm font-mono text-sm tracking-wider text-slate-800 dark:text-slate-200">
            {/* Live Clock Section */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-800">
                <Clock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none mr-1">{formattedDate}</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold tabular-nums min-w-[95px]">{formattedTime}</span>
            </div>

            {/* SMS Balance Section */}
            <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${isLoading
                        ? 'bg-amber-500 animate-pulse'
                        : error
                            ? 'bg-red-500'
                            : lowCredit
                                ? 'bg-red-500 animate-pulse'
                                : 'bg-emerald-500 animate-pulse'
                    }`}></span>

                <div className="flex items-center gap-1 select-none">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase font-bold tracking-normal">SMS:</span>
                </div>

                <span className={`font-extrabold ${isLoading
                        ? 'text-amber-500'
                        : error
                            ? 'text-red-600 dark:text-red-500'
                            : lowCredit
                                ? 'text-red-600 dark:text-red-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {isLoading ? 'LOADING...' : error ? 'FAIL' : `₹${credit}`}
                </span>
            </div>
        </div>
    )
}
