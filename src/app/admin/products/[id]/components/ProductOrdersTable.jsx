'use client'
import React, { useEffect, useState } from 'react'
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
import TableSkeleton from "@/components/custom/TableSkeleton"
import CallAttemptDialog from '@/components/CallAttemptDialog'

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
    Hold: 'secondary',
}

export default function ProductOrdersTable({ product = {}, orders = [], page = 1, limit = 10, isLoading = false }) {

    if (!isLoading && orders?.length === 0) {
        return (
            <div className="p-4 text-gray-500 text-center">
                No orders.
            </div>
        )
    }

    const calculateVariantLevelOrders = (variants, orders) => {
        // console.log("Product",product?._id)
        const filteredOrders = orders.map(od => {
            // console.log("items: ",od?.items)
            return {
                orderId: od?.orderId,
                status: od?.status,
                items: od?.items?.filter(it => it?.productId?._id?.toString() == product?._id?.toString())?.map(it => ({ ...it, productId: it?.productId?._id }))

            }
        });
        // console.log("filtered Orders: ",filteredOrders);
        let variantSort = Object.keys(variants)?.map(vr => ({
            [vr]: filteredOrders?.map(od => {
                if (od?.items?.some(it => it?.variantName == vr)) {
                    const vrItem = od?.items?.filter(it => it?.variantName == vr)[0];
                    return {
                        id: od?.orderId,
                        status: od?.status,
                        qty: vrItem?.quantity
                    }
                }
                return null;
            }).filter(od => true && od)
        }))
        // console.log("Variants Sort: ",variantSort);
        variantSort = variantSort?.map(variant => Object.entries(variant)?.map(([vr, odrs]) => {
            const orderMap = {}
            odrs.forEach(odr => {
                orderMap[odr?.status] = orderMap[odr?.status] ? (orderMap[odr?.status] + odr?.qty) : odr?.qty
            });
            // console.log("orderMap:",orderMap);
            return {
                name: vr,
                count: orderMap
            }
        })[0]
        )
        // console.log("Variants Sort: ",variantSort);
        return variantSort;

    }


    const variantOrderCounts = product?.variantOrderCounts || (product?.variants && orders ? calculateVariantLevelOrders(product?.variants, orders) : []);

    return (
        <div>
            <div className='bg-white pb-1 pt-0.5'>
                {
                    variantOrderCounts?.map(({ name, count }) => (
                        <div className="flex gap-2 bg-white px-2" key={name}>
                            <p className='font-semibold text-blue-700'>{name}:</p>
                            <div className='flex gap-4 items-center'>
                                {
                                    Object.entries(count).map(([status, qty]) => (
                                        <p className={`text-sm font-medium ${status == "New" || status == "Accepted" || status == "Delivered" ||
                                            status == "Shipped" || status == "Hold" ||
                                            status == "RTO Initiated" || status == "RTO In-Transit" || status == "RTO"
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`} key={status}>{status}: {qty}</p>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
            <div>
                {isLoading ? (
                    <div className="max-h-[80vh] overflow-y-auto border rounded-md scrollbar-hide">
                        <TableSkeleton showHeader={false} showPagination={false} rows={limit} columns={9} />
                    </div>
                ) : (
                    <Table
                        className={'p-4 rounded-none shadow-none scrollbar-hide'}
                        containerClassName="max-h-[80vh] overflow-y-auto border rounded-md scrollbar-hide"
                    >
                        <TableHeader className={'sticky top-0 bg-gray-50 z-10 [&_th]:sticky [&_th]:top-0 [&_th]:bg-gray-50 [&_th]:z-10'}>
                            <TableRow className="bg-gray-50">
                                <TableHead>#</TableHead>
                                <TableHead>Order No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Call Attempts</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Accepted At</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={'scrollbar-hide'}>
                            {orders.map((o, i) => {
                                const customerOrderNumber = o?.userId?.orders?.length || 0;
                                const returnedOrders = o?.userId?.orders?.filter(item => item?.status === 'Returned')?.length || 0;
                                const returnPercent = customerOrderNumber > 0
                                    ? ((returnedOrders / customerOrderNumber) * 100).toFixed(1)
                                    : '0.0';

                                const cancelledOrders = o?.userId?.orders?.filter(item => item?.status === 'Cancelled')?.length || 0;
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
                                        <TableCell>{(page - 1) * limit + i + 1}</TableCell>

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
                                        <TableCell>
                                            <CallAttemptDialog order={o} />
                                        </TableCell>
                                        <TableCell>₹{o?.orderAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className='text-xs flex flex-col gap-1 items-start'>
                                                <div className='flex gap-2 items-center justify-between'>
                                                    <p className='font-semibold'>
                                                        {o?.method}
                                                        {o?.razorpayOrderId && (
                                                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#0052cc] text-white">
                                                                Razorpay
                                                            </span>
                                                        )}
                                                        {o?.phonepeOrderId && (
                                                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#5f259f] text-white">
                                                                PhonePe
                                                            </span>
                                                        )}
                                                    </p>
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
                                            {o?.acceptedAt ? (
                                                <>
                                                    <div>{format(new Date(o.acceptedAt), 'dd MMM yyyy')}</div>
                                                    <div className="text-gray-500 text-xs">
                                                        {format(new Date(o.acceptedAt), 'hh:mm a')}
                                                    </div>
                                                </>
                                            ) : (
                                                '—'
                                            )}
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
                )}
            </div>
        </div>
    )
}
