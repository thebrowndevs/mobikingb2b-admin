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

// Map each order status to a Badge variant
const STATUS_VARIANTS = {
    New: 'default',           // neutral
    Accepted: 'success',      // green
    Shipped: 'warning',       // yellow/orange
    Delivered: 'success',     // green
    Cancelled: 'destructive', // red
    Returned: 'destructive',  // red
    Replaced: 'outline',      // purple/outline
    Hold: 'secondary',        // gray or custom secondary
}

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
            <div className="flex flex-col items-center justify-center py-12 bg-white border">
                <HeadphoneOff className="w-12 h-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Cancel Requests Found</h3>
                <p className="mt-2 text-sm text-gray-500">There are no cancel requests to display right now.</p>
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
        <div>
            <Table className={'p-4 rounded-none shadow-none overflow-hidden scrollbar-hide'}>
                <TableHeader className={''}>
                    <TableRow className="bg-gray-50">
                        <TableHead>#</TableHead>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Cancel Request</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={' scrollbar-hide'}>
                    <AnimatePresence mode="wait">
                        {orders?.map((o, i) => {
                            const customerOrderNumber = o?.userId?.orders?.length || 0
                            const variant = STATUS_VARIANTS[o.status] || 'default'

                            const cancelledOrders = (o?.userId?.orders?.filter(item => item.status === 'Cancelled'))?.length || 0;
                            const cancelPercent = ((cancelledOrders / customerOrderNumber) * 100).toFixed(1) || 0;

                            return (
                                <motion.tr
                                    key={o._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-100 scrollbar-hide"
                                >
                                    <TableCell>{i + 1}</TableCell>

                                    <TableCell className={''}>
                                        {o.orderId.slice(0, 6).toUpperCase()}
                                    </TableCell>

                                    <TableCell className="capitalize flex-col">
                                        {o.name || '—'}
                                        <div className='flex gap-1 mt-1'>
                                            <span className="bg-amber-100 text-amber-700 px-1 font-medium rounded text-[10px]">
                                                Cancel: {cancelPercent} %
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell >
                                        <div className="flex items-center space-x-2">
                                            <span>{o.phoneNo}</span>
                                            {o.phoneNo &&
                                                <FaWhatsapp
                                                    className="cursor-pointer text-green-500 hover:text-green-600"
                                                    size={18}
                                                    onClick={() => openWhatsApp(o.phoneNo)}
                                                />
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>₹{o.orderAmount.toFixed(2)}</span>
                                            {o.refundAmount > 0 && (
                                                <span className="text-red-500 text-[10px] font-bold">
                                                    Refunded: -₹{o.refundAmount.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{o.method}</TableCell>
                                    <TableCell>
                                        <Badge variant={variant}>
                                            {o.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>{format(new Date(o.createdAt), 'dd MMM yyyy')}</div>
                                        <div className="text-gray-500">
                                            {format(new Date(o.createdAt), 'hh:mm a')}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge variant={'secondary'}>
                                            {o?.requests[o?.requests.length - 1]?.status}
                                        </Badge>
                                    </TableCell>

                                    {/* action buttons */}
                                    <TableCell className="text-center space-x-2 flex items-center justify-center">

                                        {/* <Button
                                            // className={'h-7 w-7'}
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedOrder(o)
                                                setCancelDialog(true)
                                            }}
                                        >
                                            <Eye />
                                        </Button> */}
                                        <OrderViewDialog order={o} canEditCancel={canEditCancel}>
                                            <Button variant="outline">
                                                <Eye />
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
