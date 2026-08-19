'use client';

import { TrendingUp, CalendarIcon, Loader2, Users } from "lucide-react";
import { CartesianGrid, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useCustomerCount } from '@/hooks/useDashboard'
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

export const description = "An area gradient chart"

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 border border-slate-100 p-2.5 rounded-xl shadow-lg shadow-slate-200/50 text-xs backdrop-blur-sm z-50">
                <p className="font-semibold text-slate-500 mb-0.5">{format(new Date(label), 'dd MMM yyyy')}</p>
                <p className="font-extrabold text-indigo-600 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Customers: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
}

export function CustomersChart() {
    const today = new Date()
    const initialRange = { from: startOfMonth(today), to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const { isLoading, error, data: customersData } = useCustomerCount(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'))

    const chartData = customersData?.dates?.map((date, index) => ({
        month: date,
        desktop: customersData.customerCounts[index] || 0,
    })) || []

    return (
        <Card className="py-0 overflow-hidden border border-slate-100 shadow-sm shadow-slate-100 hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 px-6 pt-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">New Customers</CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                            Growth of customer base over time
                        </CardDescription>
                    </div>
                </div>
                <div className="scale-90 origin-left sm:origin-right">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-2">
                {isLoading ? (
                    <div className="w-full h-[240px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="w-full h-[240px] flex items-center justify-center text-rose-500 text-xs font-semibold">
                        Error loading chart data
                    </div>
                ) : (
                    <div className="w-full h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#f8fafc" strokeWidth={1.5} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                                    tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="desktop"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorCustomer)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 pb-4 px-6 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Showing data: {formattedStart} - {formattedEnd}</span>
            </CardFooter>
        </Card>
    );
}
