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
import { useFilteredOrderCount } from '@/hooks/useDashboard';
import { format, startOfMonth } from "date-fns"
import DateRangeSelector from '@/components/custom/DateRangeSelector'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart'

function FilteredOrdersChart() {
    const today = new Date()
    const initialRange = { from: startOfMonth(today), to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const { isLoading, error, data: ordersFilteredData } = useFilteredOrderCount(format(range.from, 'yyyy-MM-dd'), format(range.to, 'yyyy-MM-dd'))

    const chartData = ordersFilteredData?.dates?.map((date, index) => ({
        date,
        app: ordersFilteredData.appOrders[index] || 0,
        pos: ordersFilteredData.posOrders[index] || 0,
        website: ordersFilteredData.websiteOrders[index] || 0,
    })) || []

    const chartConfig = {
        app: {
            label: "App",
            color: "#6366f1",
        },
        pos: {
            label: "POS",
            color: "#10b981",
        },
        website: {
            label: "Website",
            color: "#f97316",
        },
    }

    return (
        <Card className="border border-slate-200 dark:border-slate-800 rounded-sm shadow-none transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>
                        Data shows the number of orders
                    </CardDescription>
                </div>
                <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
            </CardHeader>
            <CardContent>
                <div className="w-full h-[300px]">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                            <defs>
                                <linearGradient id="fillApp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="fillPOS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="fillWebsite" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                            />
                            <YAxis hide />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) =>
                                            new Date(value).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
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
                                fill="url(#fillApp)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="pos"
                                stroke="#10b981"
                                fill="url(#fillPOS)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="website"
                                stroke="#f97316"
                                fill="url(#fillWebsite)"
                                strokeWidth={2}
                                dot={false}
                            />
                            <ChartLegend content={<ChartLegendContent config={chartConfig} />} />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>

            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="text-muted-foreground leading-none">
                    Showing data between {formattedStart} to {formattedEnd}
                </div>
            </CardFooter>
        </Card>
    )
}

export default FilteredOrdersChart
