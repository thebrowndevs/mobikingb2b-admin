'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import ReturnDialog from './ReturnOrderDialog'
import ReturnRejectDialog from './ReturnRejectDialog'

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

export function OrderViewDialog({ order, children, canEditReturn }) {
    const safe = (value) => (value !== null && value !== undefined && value !== '' ? value : '-')
    const safeDate = (dateVal, fmt = 'dd MMM yyyy, hh:mm a') => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : format(d, fmt);
    }
    const [returnDialog, setReturnDialog] = useState(false)
    const [returnRejectDialog, setReturnRejectDialog] = useState(false)

    // console.log(order)

    const lastRequestOf = (order) =>
        Array.isArray(order?.requests) && order?.requests?.length > 0
            ? order?.requests[order?.requests?.length - 1]
            : null

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

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-sm">
                        <div>
                            <Badge variant={'secondary'} className={'mb-1'}>Customer Details</Badge>
                            <p><strong>Name:</strong> {safe(order?.name)}</p>
                            <p><strong>Email:</strong> {safe(order?.email)}</p>
                            <p><strong>Phone:</strong> {safe(order?.phoneNo)}</p>
                            <p><strong>Address:</strong> {safe(order?.address)}</p>
                            {
                                order?.status == "Accepted" && (
                                    <p><strong>Accepted At:</strong> {safe(order?.acceptedAt ? safeDate(order?.acceptedAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                                )
                            }
                            {
                                order?.status == "Shipped" && (
                                    <p><strong>Shipped At:</strong> {safe(order?.shippedAt ? safeDate(order?.shippedAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                                )
                            }
                            {
                                order?.status == "Delivered" && (
                                    <p><strong>Delivered At:</strong> {safe(order?.deliveredAt ? safeDate(order?.deliveredAt, 'dd MMM yyyy, hh:mm a') : '-')}</p>
                                )
                            }
                            {
                                order?.status == "Accepted" && order?.acceptedReason && (
                                    <p><strong>Remarks:</strong> {safe(order?.acceptedReason)}</p>
                                )
                            }
                            {
                                order?.status == "Shipped" && order?.shippedReason && (
                                    <p><strong>Remarks:</strong> {safe(order?.shippedReason)}</p>
                                )
                            }
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
                            <p>
                                <strong>Label Generated:</strong>{' '}
                                {order?.labelGeneratedAt ? safeDate(order?.labelGeneratedAt, 'dd MMM yyyy, hh:mm a') : '-'}
                            </p>
                            <p>
                                <strong>Manifest Generated:</strong>{' '}
                                {order?.manifestGeneratedAt ? safeDate(order?.manifestGeneratedAt, 'dd MMM yyyy, hh:mm a') : '-'}
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
                                        <p><strong>PhonePe Payment Mode:</strong> {safe(order?.phonepePaymentMode)}</p>
                                    </>
                                )}
                            </div>
                            <div>
                                {order?.refundStatus && (
                                    <>
                                        <Badge variant={'secondary'} className={'mb-1 bg-red-50 text-red-700 border border-red-200'}>Refund Details</Badge>
                                        <p><strong>Refund Status:</strong> <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${order?.refundStatus === 'Success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>{order?.refundStatus}</span></p>
                                        {order?.refundAmount > 0 && <p><strong>Refund Amount:</strong> <span className="text-red-600 font-bold font-mono">₹{order?.refundAmount?.toFixed(2)}</span></p>}
                                        {order?.refundId && <p><strong>Refund ID:</strong> <span className="font-mono text-xs">{safe(order?.refundId)}</span></p>}
                                        {order?.refundedAt && <p><strong>Refunded At:</strong> {safe(safeDate(order?.refundedAt, 'dd MMM yyyy, hh:mm a'))}</p>}
                                        {order?.refundedBy && (
                                            <p><strong>Refunded By:</strong> {safe(order?.refundedBy?.name || order?.refundedBy?.email || order?.refundedBy)}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>
                    )}

                    <hr />

                    {/* Return Shipping Data */}
                    {order?.returnData && (
                        <section className="mb-2 text-sm">
                            <h4 className="font-bold mb-2">Return Shipment Details:</h4>
                            <div className="flex flex-col gap-1 border rounded p-2">
                                <p><strong>Ship Status:</strong> {safe(order?.returnData?.shippingStatus || order?.shippingStatus)}</p>
                                <p><strong>Shiprocket Return Order Id:</strong> {safe(order?.returnData?.orderId)}</p>
                                <p><strong>Courier Name:</strong> {safe(order?.returnData?.courier_name)}</p>
                                <p><strong>Courier Assigned At:</strong>{' '}{
                                    order?.returnData?.assigned_date_time
                                        ? safeDate(order?.returnData?.assigned_date_time?.date, 'dd MMM yyyy, hh:mm a')
                                        : '-'
                                }</p>
                                <p><strong>AWB:</strong> {safe(order?.returnData?.awb_code)}</p>
                                <p>
                                    <strong>Pickup Scheduled At:</strong>{' '}
                                    {
                                        order?.returnData?.pickup_scheduled_date
                                            ? safeDate(order?.returnData?.pickup_scheduled_date, 'dd MMM yyyy') : 'Not Scheduled Yet'
                                    }
                                </p>
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
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(order?.items || []).map((it, i) => (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell className={'max-w-80'}>
                                        <div className='text-wrap flex items-center gap-1.5'>
                                            <span>{safe(it?.productId?.fullName || it?.fullName)}</span>
                                            {it?.isScratchy && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                                    Scratchy
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className={'max-w-80'}> <div className='text-wrap'>{safe(it?.variantName)}</div></TableCell>
                                    <TableCell>{safe(it?.quantity)}</TableCell>
                                    <TableCell>{it?.price != null ? `₹${it?.price}` : '-'}</TableCell>
                                    <TableCell>{it?.price != null && it?.quantity != null ? `₹${(it?.price * it?.quantity)?.toFixed(2)}` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

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
                        {
                            (order?.coupon?.code || order?.couponCode) && (
                                <div className="flex justify-between text-green-600">
                                    <span>
                                        Coupon Applied (
                                        {order?.coupon?.code || order?.couponCode}
                                        {order?.coupon?.type || order?.couponType
                                            ? ` - ${COUPON_TYPE[order?.coupon?.type] || COUPON_TYPE[order?.couponType]}`
                                            : ""}
                                        )
                                    </span>
                                    <span>-₹{order?.discount != null ? order?.discount?.toFixed(2) : '-'}</span>
                                </div>
                            )
                        }
                        <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total</span>
                            <span>₹{order?.orderAmount != null ? order?.orderAmount?.toFixed(2) : '-'}</span>
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
                        <section className="mt-4 text-sm">
                            <h4 className="font-medium mb-2">Request History</h4>
                            <ul className="space-y-2">
                                {order.requests.map((r, i) => (
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

                    {/* Action buttons */}
                    <DialogFooter className="mt-6 flex gap-1">
                        {/* Return order */}
                        {
                            canEditReturn &&
                            order?.requests && order?.requests?.length > 0 && order?.status != "Returned"
                            && lastRequestOf(order).type === 'Return' && lastRequestOf(order).isRaised && lastRequestOf(order).status !== 'Rejected'
                            && !(order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated) &&
                            <div className=" flex flex-col gap-1">
                                <p className='text-sm text-gray-500'>Return Order Request</p>
                                <div className=" flex gap-1">
                                    <Button variant="outline" onClick={() => { setReturnDialog(true) }}>
                                        {
                                            (
                                                !(order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated) &&
                                                order?.returnData?.awb_code &&
                                                order?.returnData?.courier_name &&
                                                order?.returnData?.assigned_date_time?.date
                                            ) ? "Schedule Pickup"
                                                : order?.returnData?.order_id
                                                    ? "Assign Courier"
                                                    : "Accept"
                                        }
                                    </Button>
                                    {
                                        !order?.returnData?.isReturnInitiated &&
                                        <Button variant="outline" onClick={() => { setReturnRejectDialog(true) }}>Reject</Button>
                                    }
                                </div>
                            </div>
                        }
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ReturnDialog
                open={returnDialog}
                onOpenChange={setReturnDialog}
                order={order}
            />

            <ReturnRejectDialog
                open={returnRejectDialog}
                onOpenChange={setReturnRejectDialog}
                order={order}
            />
        </>
    )
}
