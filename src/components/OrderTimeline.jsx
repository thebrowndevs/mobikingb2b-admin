'use client'
import React from 'react'
import PCard from '@/components/custom/PCard'
import { format } from 'date-fns'
import CallAttemptDialog from './CallAttemptDialog'
import { PhoneCall, Clock, CheckCircle2 } from 'lucide-react'

export default function OrderTimeline({ order }) {
    if (!order) return null

    const noOfAttempts = order?.callAttempts?.noOfAttempts || 0
    const history = order?.callAttempts?.history || []
    const sortedHistory = [...history].sort((a, b) => (a?.attemptNo || 0) - (b?.attemptNo || 0))

    return (
        <PCard className="px-5 bg-white mb-6 py-4">
            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Order Timeline & Tracking History
                    </h2>
                    <p className="text-xs text-gray-500">Track call attempts and order milestones</p>
                </div>
            </div>

            {/* SECTION 1: Call Attempts Detail (Above) */}
            {/* <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6"> */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-gray-800">
                        Call Attempts Details ({noOfAttempts}/3)
                    </h3>
                </div>
                <CallAttemptDialog order={order} />
            </div>

            {sortedHistory.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No call attempts recorded yet. Click the call icons above to record an attempt.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {sortedHistory.map((item, idx) => {
                        const empName = item?.employeeId?.name || 'User'
                        const empRole = item?.employeeId?.role ? ` (${item.employeeId.role})` : ''
                        return (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-xs space-y-1">
                                <div className="flex items-center justify-between border-b pb-1 border-gray-100">
                                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        Attempt #{item?.attemptNo}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {item?.date ? format(new Date(item.date), 'dd MMM, hh:mm a') : '—'}
                                    </span>
                                </div>
                                <p className="text-gray-800 font-medium italic pt-1">
                                    "{item?.remarks || 'No remarks'}"
                                </p>
                                <div className="text-[10px] text-gray-500 pt-1">
                                    By: <span className="font-semibold text-gray-700">{empName}{empRole}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            {/* </div> */}

            {/* SECTION 2: Order Tracking Details (Below) */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Order Milestones & Status Dates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Accepted At</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.acceptedAt ? format(new Date(order?.acceptedAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                        {order?.acceptedReason && (
                            <span className="mt-1 block text-xs text-emerald-600 font-medium italic">
                                "{order.acceptedReason}"
                            </span>
                        )}
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Shiprocket Created</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.shiprocketOrderCreatedAt ? format(new Date(order?.shiprocketOrderCreatedAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Shipped At</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.shippedAt ? format(new Date(order?.shippedAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                        {order?.shippingReason && (
                            <span className="mt-1 block text-xs text-blue-600 font-medium italic">
                                "{order.shippingReason}"
                            </span>
                        )}
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Label Generated</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.labelGeneratedAt ? format(new Date(order?.labelGeneratedAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Manifest Generated</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.manifestGeneratedAt ? format(new Date(order?.manifestGeneratedAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                        <span className="block text-xs font-medium uppercase text-gray-400">Delivered At</span>
                        <span className="mt-1 block text-sm font-semibold text-gray-900">
                            {order?.deliveredAt ? format(new Date(order?.deliveredAt), 'dd MMM yyyy, hh:mm a') : "—"}
                        </span>
                    </div>
                </div>
            </div>
        </PCard>
    )
}
