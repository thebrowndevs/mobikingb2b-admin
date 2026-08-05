'use client'
import React, { useState } from 'react'
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
import { Eye } from 'lucide-react'
import { format } from 'date-fns'
import { FaWhatsapp } from 'react-icons/fa'
import { OrderViewDialog } from './OrderViewDialog'
import { motion } from 'framer-motion'
import GSTBillDownload from '@/components/GSTBill'
import Link from 'next/link'

// Map each order status to a Badge variant
const STATUS_VARIANTS = {
    New: 'yellow',           // yellow
    Accepted: 'success',      // green
    Rejected: 'destructive',      // red
    Shipped: 'yellow',       // yellow/orange
    Delivered: 'success',     // green
    Cancelled: 'destructive', // red
    Returned: 'destructive',  // red
    Replaced: 'outline',      // purple/outline
    Hold: 'secondary',        // gray or custom secondary
}

export default function UserOrdersTable({ orders = [] }) {

    if (orders?.length === 0) {
        return (
            <div className="p-4 text-gray-500 text-center">
                No orders.
            </div>
        )
    }

    return (
        <div>
            <Table className={'p-4 rounded-none shadow-none scrollbar-hide'}>
                <TableHeader className={''}>
                    <TableRow className="bg-gray-50">
                        <TableHead>#</TableHead>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={'scrollbar-hide'}>
                    {orders.map((o, i) => {
                        const customerOrderNumber = o?.userId?.orders?.length || 0;
                        const returnedOrders = o?.userId?.orders?.filter(item => item.status === 'Returned')?.length || 0;
                        const returnPercent = customerOrderNumber > 0
                            ? ((returnedOrders / customerOrderNumber) * 100).toFixed(1)
                            : '0.0';

                        const cancelledOrders = o?.userId?.orders?.filter(item => item.status === 'Cancelled')?.length || 0;
                        const cancelPercent = customerOrderNumber > 0
                            ? ((cancelledOrders / customerOrderNumber) * 100).toFixed(1)
                            : '0.0';

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

                                <TableCell>
                                    <Link href={`/admin/orders/${o._id}`}>
                                        {o?.orderId}
                                    </Link>
                                </TableCell>

                                <TableCell className="capitalize flex-col">
                                    {o?.name || '—'}
                                    <div className='flex gap-1 mt-1'>
                                        <span className="bg-purple-100 text-purple-700 px-1 font-medium rounded text-[10px]">
                                            RTO: {returnPercent || 0} %
                                        </span>
                                        <span className="bg-amber-100 text-amber-700 px-1 font-medium rounded text-[10px]">
                                            Cancel: {cancelPercent || 0} %
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell >
                                    <div className="flex items-center space-x-2">
                                        <span>{o?.phoneNo}</span>
                                        {o?.phoneNo &&
                                            <FaWhatsapp
                                                className="cursor-pointer text-green-500 hover:text-green-600"
                                                size={18}
                                                onClick={() => openWhatsApp(o?.phoneNo)}
                                            />
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>₹{o?.orderAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className='text-xs flex flex-col gap-1 items-start'>
                                        <div className='flex gap-2 items-center justify-between'>
                                            <p className='font-semibold'>{o?.method}</p>
                                        </div>
                                        {o?.paymentStatus == "Paid" ?
                                            <Badge className={'bg-emerald-600 text-white'} >Paid</Badge>
                                            : <Badge variant="destructive">Pending</Badge>
                                        }
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant={STATUS_VARIANTS[o?.status]}>
                                        {o?.status}
                                    </Badge>

                                </TableCell>

                                <TableCell>
                                    <div>{format(new Date(o?.createdAt), 'dd MMM yyyy')}</div>
                                    <div className="text-gray-500">
                                        {format(new Date(o?.createdAt), 'hh:mm a')}
                                    </div>
                                </TableCell>

                                {/* action buttons */}
                                <TableCell className="text-center space-x-2 flex items-center justify-center">
                                    <OrderViewDialog order={o}>
                                        <Button variant="outline">
                                            <Eye />
                                        </Button>
                                    </OrderViewDialog>
                                    {!o?.abondonedOrder &&
                                        <GSTBillDownload billData={o} />
                                    }

                                </TableCell>
                            </motion.tr>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
