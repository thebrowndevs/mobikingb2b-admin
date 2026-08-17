'use client';

import { Loader2 } from "lucide-react";
import { CartesianGrid, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuotationCount } from '@/hooks/useDashboard'
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { format, startOfMonth } from "date-fns"
import DateRangeSelector from '@/components/custom/DateRangeSelector'

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-sm border border-slate-100 dark:border-slate-800 text-sm">
                <p className="font-semibold text-slate-500 dark:text-slate-400 mb-1">{format(new Date(label), 'dd MMM yyyy')}</p>
                <p className="text-amber-500 font-extrabold">Quotations: {payload[0].value}</p>
            </div>
        );
    }
    return null;
}

export function QuotationsChart() {
    const today = new Date()
    const initialRange = { from: startOfMonth(today), to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const { isLoading, error, data: quotationsData } = useQuotationCount(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'))

    const chartData = quotationsData?.dates?.map((date, index) => ({
        month: date,
        desktop: quotationsData.dailyCounts[index] || 0,
    })) || []

    return (
        <Card className="border border-slate-100 dark:border-slate-800 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Quotations Flow</CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                        Timeline of requested B2B quotations
                    </CardDescription>
                </div>
                <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                    </div>
                ) : error ? (
                    <div className="w-full h-[300px] flex items-center justify-center text-red-500 text-xs">
                        Error loading chart data
                    </div>
                ) : (
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                                    className="text-[10px] fill-slate-400"
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                <Line
                                    type="monotone"
                                    dataKey="desktop"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 1, fill: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex-col items-start gap-2 text-xs text-slate-400">
                <div className="leading-none">
                    Showing data between {formattedStart} to {formattedEnd}
                </div>
            </CardFooter>
        </Card>
    );
}
