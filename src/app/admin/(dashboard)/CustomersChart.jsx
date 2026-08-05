'use client';

import { TrendingUp, CalendarIcon, Loader2 } from "lucide-react";
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
      <div className="bg-white p-2 rounded-md shadow text-sm">
        <p className="font-medium text-muted-foreground">{format(new Date(label), 'dd MMM yyyy')}</p>
        <p className="text-primary">Customers: {payload[0].value}</p>
      </div>
    );
  }
  return null;
}

export function CustomersChart() {
    const today = new Date()
    const initialRange = { from: startOfMonth(today), to: today }
    const [range, setRange] = useState(initialRange)

    // Ensure chart renders on initial mount
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Customer</CardTitle>
                    <CardDescription>
                        Data shows the number of customers
                    </CardDescription>
                </div>
                <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
            </CardHeader>

            <CardContent>
                {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="w-full h-[300px] flex items-center justify-center text-red-500">
                        Error loading chart data
                    </div>
                ) : (
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                                <defs>
                                    <linearGradient id="colorCustomer" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.6} />
                                        <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                      tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => format(new Date(value), 'dd MMM')}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={false} />
                                <Area
                                    type="monotone"
                                    dataKey="desktop"
                                    stroke="var(--color-chart-2)"
                                    fillOpacity={1}
                                    fill="url(#colorCustomer)"
                                    strokeWidth={1}
                                    dot={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="text-muted-foreground leading-none">
                    Showing data between {formattedStart} to {formattedEnd}
                </div>
            </CardFooter>
        </Card>
    );
}
