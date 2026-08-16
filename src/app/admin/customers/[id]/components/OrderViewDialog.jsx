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

// Map each order status to a Badge variant
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

const COUPON_TYPE = {
    online: "Prepaid",
    oneTime: "One Time",
    firstTime: "First Time",
    general: "General"
}

export function OrderViewDialog({ order, children }) {
    const safe = (value) => (value !== null && value !== undefined && value !== '' ? value : '-')
    const safeDate = (dateVal, fmt = 'dd MMM yyyy, hh:mm a') => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : format(d, fmt);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent className="sm:max-w-3xl overflow-auto max-h-[90vh]">
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
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-sm">
                    <div>
                        <Badge variant={'secondary'} className={'mb-1'}>Customer Details</Badge>
                        <p><strong>Name:</strong> {safe(order?.name)}</p>
                        <p><strong>Email:</strong> {safe(order?.email)}</p>
                        <p><strong>Phone:</strong> {safe(order?.phoneNo)}</p>
                        <p><strong>Address:</strong> {safe(order?.address)}</p>
                        {order?.status === "Accepted" && (
                            <p><strong>Accepted At:</strong> {safe(order?.acceptedAt ? safeDate(order?.acceptedAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                        )}
                        {order?.status === "Shipped" && (
                            <p><strong>Shipped At:</strong> {safe(order?.shippedAt ? safeDate(order?.shippedAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                        )}
                        {order?.status === "Delivered" && (
                            <p><strong>Delivered At:</strong> {safe(order?.deliveredAt ? safeDate(order?.deliveredAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                        )}
                    </div>
                    <div>
                        <Badge variant={'secondary'} className={'mb-1'}>Shipping</Badge>
                        <p><strong>Created:</strong>{' '}{order?.createdAt ? safeDate(order?.createdAt, 'dd MMM yyyy, hh:mm a') : '-'}</p>
                        <p><strong>Ship Status:</strong> {safe(order?.shippingStatus)}</p>
                        <p><strong>AWB:</strong> {safe(order?.awbCode)}</p>
                        <p><strong>Courier:</strong> {safe(order?.courierName)}</p>
                        <p>
                            <strong>ETA:</strong>{' '}
                            {order?.expectedDeliveryDate ? safeDate(order?.expectedDeliveryDate, 'dd MMM yyyy') : '-'}
                        </p>
                    </div>
                </section>

                {/* Payment & Refund Details */}
                {(order?.razorpayOrderId || order?.phonepeOrderId || order?.refundStatus) && (
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 border-t pt-3 text-sm">
                        <div>
                            <Badge variant={'secondary'} className={'mb-1'}>Payment Details</Badge>
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
                                </>
                            )}
                        </div>
                        <div>
                            {order?.refundStatus && (
                                <>
                                    <Badge variant={'secondary'} className={'mb-1 bg-red-50 text-red-700 border border-red-200'}>Refund Details</Badge>
                                    <p><strong>Refund Status:</strong> <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-650 text-white`}>{order?.refundStatus}</span></p>
                                    {order?.refundAmount > 0 && <p><strong>Refund Amount:</strong> <span className="text-red-650 font-bold font-mono">₹{order?.refundAmount?.toFixed(2)}</span></p>}
                                    {order?.refundId && <p><strong>Refund ID:</strong> <span className="font-mono text-xs">{safe(order?.refundId)}</span></p>}
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* Items Table */}
                <Table className="text-sm">
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead>#</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(order?.items || []).map((it, i) => (
                            <TableRow key={i}>
                                <TableCell>{i + 1}</TableCell>
                                <TableCell>
                                    <div className='max-w-[200px] break-words whitespace-normal flex items-center gap-1.5'>
                                        <span>{safe(it?.productId?.fullName || it?.fullName)}</span>
                                        {it?.isScratchy && (
                                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                                Scratchy
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell><p className='max-w-[160px] break-words whitespace-normal'>{safe(it?.variantName)}</p></TableCell>
                                <TableCell>{safe(it?.quantity)}</TableCell>
                                <TableCell>{it?.price != null ? `₹${it?.price}` : '-'}</TableCell>
                                <TableCell className="text-emerald-600 font-semibold">
                                    {it?.discount > 0 ? (
                                        <>
                                            <span>-₹{it.discount}</span>
                                            {it.discountPercent > 0 && (
                                                <span className="text-[10px] text-slate-400 font-medium ml-1">({it.discountPercent}%)</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-slate-400 font-medium">—</span>
                                    )}
                                </TableCell>
                                <TableCell>{it?.price != null && it?.quantity != null ? `₹${((parseFloat(it.price || 0) - parseFloat(it.discount || 0)) * (parseFloat(it.quantity) || 0)).toFixed(2)}` : '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pricing Summary */}
                <section className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{order?.subtotal != null ? order?.subtotal?.toFixed(2) : '-'}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Delivery Charge</span>
                        <span>₹{order?.deliveryCharge != null ? order?.deliveryCharge?.toFixed(2) : '-'}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span>₹{order?.discount != null ? order?.discount?.toFixed(2) : '-'}</span>
                    </div>

                    {(order?.coupon?.code || order?.couponCode) && (
                        <div className="flex justify-between text-green-600">
                            <span>
                                Coupon Applied ({order?.coupon?.code || order?.couponCode})
                            </span>
                            <span>-₹{order?.discount != null ? order?.discount?.toFixed(2) : '-'}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold border-t pt-1">
                        <span>Total</span>
                        <span>₹{order?.orderAmount != null ? order?.orderAmount?.toFixed(2) : '-'}</span>
                    </div>
                </section>

                {/* Hold Order Display Reason */}
                {order?.status === "Hold" && (
                    <section className="mt-6 text-sm p-4 rounded-md border border-blue-600 bg-blue-100 text-blue-650">
                        <p>
                            <strong>Order on Hold: </strong>
                            <span>{order?.reason}</span>
                        </p>
                    </section>
                )}

                {/* Requests History */}
                {((order?.requests && order?.requests?.length > 0) || (order?.partialReturnRequests && order?.partialReturnRequests?.length > 0)) && (
                    <section className="mt-6 text-sm">
                        <h4 className="font-medium mb-2 text-gray-900 border-b pb-1">Request History</h4>
                        <ul className="space-y-2">
                            {order?.requests && order?.requests.map((r, i) => (
                                <li key={i} className="border rounded p-2 bg-gray-50">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-700">{r.type} Request</span>
                                        <Badge variant={r.status === 'Accepted' ? 'success' : r.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                            {r.status}
                                        </Badge>
                                    </div>
                                    <p><strong>Reason:</strong> {safe(r.reason)}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </DialogContent>
        </Dialog>
    )
}
