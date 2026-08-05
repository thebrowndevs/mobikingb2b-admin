'use client'
import React from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { format } from 'date-fns'

const STATUS_VARIANTS = {
    New: 'default',
    Accepted: 'success',
    Rejected: 'destructive',
    Shipped: 'warning',
    Delivered: 'success',
    Cancelled: 'destructive',
    Returned: 'destructive',
    Replaced: 'outline',
    Hold: 'secondary',
}

export function OrderViewDialog({ order, children }) {
    const safe = (value) => (value !== null && value !== undefined && value !== '' ? value : '-');
    const safeDate = (dateVal, fmt = 'dd MMM yyyy, hh:mm a') => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : format(d, fmt);
    }

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>

                <DialogContent className="max-w-3xl overflow-auto max-h-[90vh]">
                    <DialogHeader>
                        <div className="flex justify-between items-center">
                            <DialogTitle>Order #{safe(order?.orderId)}</DialogTitle>
                        </div>
                        <DialogDescription>
                            <Badge variant={STATUS_VARIANTS[order?.status] || 'default'}>
                                {safe(order?.status)}
                            </Badge>
                            {' • '}{safe(order?.type)}{' • '}{safe(order?.method)}{' • '}
                            {order?.isAppOrder ? 'App' : 'Website'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Customer & Shipping Info */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-sm">
                        <div>
                            <p><strong>Name:</strong> {safe(order?.name)}</p>
                            <p><strong>Email:</strong> {safe(order?.email)}</p>
                            <p><strong>Address:</strong> {safe(order?.address)}</p>
                            {order?.razorpayOrderId && (
                                <>
                                    <p><strong>Gateway:</strong> <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#0052cc] text-white">Razorpay</span></p>
                                    <p><strong>Razorpay Order ID:</strong> {safe(order?.razorpayOrderId)}</p>
                                    <p><strong>Razorpay Payment ID:</strong> {safe(order?.razorpayPaymentId)}</p>
                                </>
                            )}
                            {order?.phonepeOrderId && (
                                <>
                                    <p><strong>Gateway:</strong> <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#5f259f] text-white">PhonePe</span></p>
                                    <p><strong>PhonePe Order ID:</strong> {safe(order?.phonepeOrderId)}</p>
                                    <p><strong>PhonePe Payment ID:</strong> {safe(order?.phonepePaymentId)}</p>
                                    <p><strong>PhonePe UTR:</strong> {safe(order?.phonepeUtr)}</p>
                                    <p><strong>PhonePe Payment Mode:</strong> {safe(order?.phonepePaymentMode)}</p>
                                </>
                            )}
                        </div>
                        <div>
                            <p><strong>Phone:</strong> {safe(order?.phoneNo)}</p>
                            <p><strong>Created:</strong>{' '}{order?.createdAt ? safeDate(order?.createdAt, 'dd MMM yyyy, hh:mm a') : '-'}</p>
                            <p><strong>Payment Status:</strong>
                                <Badge variant={order?.paymentStatus == 'Paid' ? 'green' : 'yellow'}>
                                    {safe(order?.paymentStatus)}
                                </Badge>
                            </p>
                        </div>
                    </section>

                    {/* Items Table */}
                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Variant</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(order.items || []).map((it, i) => (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>
                                        <div className='max-w-40 text-wrap flex items-center gap-1.5'>
                                            <span>{safe(it?.productId?.fullName || it?.fullName)}</span>
                                            {it?.isScratchy && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                                    Scratchy
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{safe(it?.variantName)}</TableCell>
                                    <TableCell>{safe(it?.quantity)}</TableCell>
                                    <TableCell>{it?.price != null ? `₹${it?.price}` : '-'}</TableCell>
                                    <TableCell>{it?.price != null && it?.quantity != null ? `₹${(it?.price * it?.quantity).toFixed(2)}` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pricing Summary */}
                    <section className="mt-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span><span>₹{order?.subtotal != null ? order?.subtotal.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span><span>₹{order?.discount != null ? order?.discount.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total</span><span>₹{order?.orderAmount != null ? order?.orderAmount.toFixed(2) : '-'}</span>
                        </div>
                    </section>

                    {/* Hold Order Display Reason */}
                    {
                        order?.status == "Hold" &&
                        <section className="mt-6 text-sm p-4 rounded-md border border-blue-600 bg-blue-100 text-blue-600">
                            <p>
                                <strong>Order on Hold: </strong>
                                <span>{order?.reason}</span>
                            </p>
                        </section>
                    }

                    {/* Requests History */}
                    {order?.requests && order?.requests?.length > 0 && (
                        <section className="mt-6 text-sm">
                            <h4 className="font-medium mb-2">Request History</h4>
                            <ul className="space-y-2">
                                {order?.requests?.map((r, i) => (
                                    <li key={i} className="border rounded p-2">
                                        <p><strong>Type:</strong> {safe(r.type)}</p>
                                        <p><strong>Raised: </strong>
                                            {r.isRaised ? `Yes at ${safeDate(r.raisedAt, 'dd MMM yyyy hh:mm a')}` : 'No'}
                                        </p>
                                        <p><strong>Status:</strong> {safe(r.status)}</p>
                                        <p><strong>Reason:</strong> {safe(r.reason)}</p>
                                        <p><strong>Resolved: </strong>
                                            {r.resolvedAt ? safeDate(r.resolvedAt, 'dd MMM yyyy hh:mm a') : '-'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                </DialogContent>
            </Dialog>
        </>
    )
}
