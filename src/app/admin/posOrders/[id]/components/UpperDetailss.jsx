import PCard from '@/components/custom/PCard'
import { Badge } from '@/components/ui/badge'
import React from 'react'

export default function UpperDetailss({ order }) {
    const STATUS_VARIANTS = {
        New: 'yellow',           // yellow
        Accepted: 'success',      // green
        Rejected: 'warning',      // green
        Shipped: 'yellow',       // yellow/orange
        Delivered: 'success',     // green
        Cancelled: 'destructive', // red
        Returned: 'destructive',  // red
        Replaced: 'outline',      // purple/outline
        Hold: 'secondary',        // gray or custom secondary
    }
    const variant = STATUS_VARIANTS[order.status] || 'default'

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Order ID</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">{order.orderId}</span>
                </div>
            </PCard>

            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Order Status</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">
                        <Badge variant={variant}>
                            {order.status}
                        </Badge>
                    </span>
                    {order.status === 'Rejected' &&
                    <span className='mt-2 text-xs text-gray-500'>{order?.reason}</span>
                    }
                </div>
            </PCard>

            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Type</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">{order.type}</span>
                    {order.type === 'Regular' && 
                    <span className="text-xs font-semibold text-gray-500">{order.isAppOrder ? "App" : "Website"}</span>
                    }
                </div>
            </PCard>

            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Payment Method</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">{order.method}</span>
                </div>
            </PCard>

            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Payment Status</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">{order.paymentStatus}</span>
                </div>
            </PCard>

            <PCard className="px-5 bg-white">
                <div className="flex flex-col">
                    <span className="text-xs font-medium uppercase text-gray-400">Order Amount</span>
                    <span className="mt-2 text-lg font-semibold text-gray-900">₹{order.orderAmount}</span>
                </div>
            </PCard>
        </div>
    )
}
