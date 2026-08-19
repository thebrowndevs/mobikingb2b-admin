'use client'

import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from '@/components/ui/chart'
import { useFilteredQuotationCount } from '@/hooks/useDashboard';
import { format, startOfMonth } from "date-fns"
import DateRangeSelector from '@/components/custom/DateRangeSelector'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart'
import { FileSpreadsheet, Loader2, CalendarIcon } from 'lucide-react'

function FilteredQuotationsChart() {
    const today = new Date()
    const initialRange = { from: startOfMonth(today), to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const { isLoading, error, data: quotationsFilteredData } = useFilteredQuotationCount(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'))

    const chartData = quotationsFilteredData?.dates?.map((date, index) => ({
        date,
        app: quotationsFilteredData.appQuotations[index] || 0,
        pos: quotationsFilteredData.posQuotations[index] || 0,
        website: quotationsFilteredData.websiteQuotations[index] || 0,
    })) || []

    const chartConfig = {
        app: {
            label: "App Quotations",
            color: "#6366f1",
        },
        pos: {
            label: "POS Quotations",
            color: "#10b981",
        },
        website: {
            label: "Website Quotations",
            color: "#f97316",
        },
    }

    return (
        <Card className="py-0 overflow-hidden border border-slate-100 shadow-sm shadow-slate-100 hover:shadow-md transition-shadow duration-300 rounded-2xl bg-white">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 px-6 pt-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">Quotations Distribution</CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                            Comparison between App, POS, and Website requested quotations
                        </CardDescription>
                    </div>
                </div>
                <div className="scale-90 origin-left sm:origin-right">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-2">
                {isLoading ? (
                    <div className="w-full h-[320px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="w-full h-[320px] flex items-center justify-center text-rose-500 text-xs font-semibold">
                        Error loading chart data
                    </div>
                ) : (
                    <div className="w-full h-[320px]">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="fillAppQ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                                    </linearGradient>
                                    <linearGradient id="fillPOSQ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                                    </linearGradient>
                                    <linearGradient id="fillWebsiteQ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid vertical={false} stroke="#f8fafc" strokeWidth={1.5} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                                    tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                                />
                                <YAxis hide />
                                <ChartTooltip
                                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    content={
                                        <ChartTooltipContent
                                            className="bg-white/95 border border-slate-100 p-2.5 rounded-xl shadow-lg shadow-slate-200/50 text-xs backdrop-blur-sm"
                                            labelFormatter={(value) =>
                                                new Date(value).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })
                                            }
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="app"
                                    stroke="#6366f1"
                                    fill="url(#fillAppQ)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pos"
                                    stroke="#10b981"
                                    fill="url(#fillPOSQ)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="website"
                                    stroke="#f97316"
                                    fill="url(#fillWebsiteQ)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <ChartLegend content={<ChartLegendContent config={chartConfig} className="flex justify-center gap-4 text-xs font-semibold text-slate-500 mt-2" />} />
                            </AreaChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 pb-4 px-6 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Showing data: {formattedStart} - {formattedEnd}</span>
            </CardFooter>
        </Card>
    )
}

export default FilteredQuotationsChart
