'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, Eye, HeadphoneOff, MessageSquare, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { FaWhatsapp } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import CancelDialog from './CancelDialog'
import { OrderViewDialog } from './OrderViewDialog'

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Accepted':
        case 'Delivered':
            return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case 'Rejected':
        case 'Cancelled':
        case 'Returned':
            return 'bg-rose-50 text-rose-800 border-rose-200';
        case 'Hold':
            return 'bg-purple-50 text-purple-800 border-purple-200';
        case 'New':
            return 'bg-blue-50 text-blue-800 border-blue-200';
        default:
            return 'bg-slate-50 text-slate-800 border-slate-200';
    }
};

const getRequestBadgeClass = (status) => {
    switch (status) {
        case 'Accepted':
            return 'bg-emerald-50 text-emerald-800 border-emerald-200';
        case 'Rejected':
            return 'bg-rose-50 text-rose-800 border-rose-200';
        case 'Pending':
            return 'bg-amber-50 text-amber-800 border-amber-200';
        default:
            return 'bg-slate-50 text-slate-800 border-slate-200';
    }
};

export default function CancelOrdersTable({ error, orders = [], canEditCancel }) {
    const router = useRouter()
    const [cancelDialog, setCancelDialog] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(undefined)

    if (error) {
        return (
            <div className="text-red-600 p-4">
                Error: {error.message}
            </div>
        )
    }

    if (orders?.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-200 rounded-xl">
                <HeadphoneOff className="w-12 h-12 text-slate-400" />
                <h3 className="mt-4 text-xl font-bold text-slate-700">No Cancel Requests Found</h3>
                <p className="mt-1 text-sm text-slate-500">There are no cancel requests to display right now.</p>
            </div>
        )
    }

    const openWhatsApp = (phone) => {
        // sanitize phone: remove non-digits
        const digits = phone.replace(/\D/g, '')
        const url = `https://wa.me/${digits}`
        window.open(url, '_blank')
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <Table className="overflow-hidden scrollbar-hide">
                <TableHeader>
                    <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 w-10">#</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Order No.</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Name</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Phone</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Amount</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Method</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Status</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Created At</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Cancel Request</TableHead>
                        <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {orders?.map((o, i) => {
                            const customerOrderNumber = o?.userId?.orders?.length || 0

                            const cancelledOrders = (o?.userId?.orders?.filter(item => item.status === 'Cancelled'))?.length || 0;
                            const cancelPercent = ((cancelledOrders / customerOrderNumber) * 100).toFixed(1) || 0;

                            return (
                                <motion.tr
                                    key={o._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="hover:bg-slate-50/50 border-b border-slate-100 last:border-b-0 cursor-pointer scrollbar-hide"
                                >
                                    <TableCell className="px-4 py-3">{i + 1}</TableCell>

                                    <TableCell className="px-4 py-3 font-mono font-bold text-indigo-600">
                                        {o.orderId.toUpperCase()}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 capitalize flex-col font-bold text-slate-800">
                                        {o.name || '—'}
                                        <div className='flex gap-1 mt-1'>
                                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-1 font-semibold rounded text-[10px]">
                                                Cancel: {cancelPercent} %
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center space-x-2 font-semibold text-slate-700">
                                            <span>{o.phoneNo}</span>
                                            {o.phoneNo &&
                                                <FaWhatsapp
                                                    className="cursor-pointer text-emerald-500 hover:text-emerald-600 transition-colors"
                                                    size={16}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openWhatsApp(o.phoneNo);
                                                    }}
                                                />
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3">
                                        <div className="flex flex-col font-bold text-slate-900">
                                            <span>₹{o.orderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            {o.refundAmount > 0 && (
                                                <span className="text-red-600 text-[10px] font-bold">
                                                    Refunded: -₹{o.refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 font-semibold text-slate-600">{o.method}</TableCell>
                                    <TableCell className="px-4 py-3">
                                        <Badge className={`text-[10px] font-bold uppercase border ${getStatusBadgeClass(o.status)}`}>
                                            {o.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-slate-500 text-xs">
                                        <div className="font-bold text-slate-750">{format(new Date(o.createdAt), 'dd MMM yyyy')}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {format(new Date(o.createdAt), 'hh:mm a')}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-3">
                                        <Badge className={`text-[10px] font-bold uppercase border ${getRequestBadgeClass(o?.requests[o?.requests.length - 1]?.status)}`}>
                                            {o?.requests[o?.requests.length - 1]?.status}
                                        </Badge>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <OrderViewDialog order={o} canEditCancel={canEditCancel}>
                                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 px-2 rounded-lg gap-1.5 font-bold text-xs">
                                                <Eye className="w-3.5 h-3.5 text-slate-500" /> View Details
                                            </Button>
                                        </OrderViewDialog>
                                    </TableCell>
                                </motion.tr>
                            )
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>
            <CancelDialog
                open={cancelDialog}
                onOpenChange={setCancelDialog}
                order={selectedOrder}
            />
        </div>
    )
}
