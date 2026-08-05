'use client'

import React from 'react'
import PCard from '@/components/custom/PCard'
import { useTotalOrders } from '@/hooks/useDashboard'
import { Loader2, ShoppingCart } from 'lucide-react'

export default function TotalOrders() {
  const { data, isLoading, isError } = useTotalOrders()

  return (
    <PCard className="flex items-center justify-between">
      <div className="flex flex-col items-start mb-0">
        {isLoading ? (
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        ) : isError ? (
            <p className="text-sm text-red-500">Error loading</p>
        ) : (
            <p className="text-2xl font-bold">{data?.totalOrders ?? 0}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
      </div>
      <ShoppingCart className="h-8 w-8 text-primary" />
    </PCard>
  )
}
