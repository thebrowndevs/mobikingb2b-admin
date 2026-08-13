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
import { X, Eye } from 'lucide-react'
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
import { useOrders } from '@/hooks/useOrders'
import AcceptDialog from './AcceptDialog'
import CancelDialog from './CancelDialog'
import RejectDialog from './RejectOrderDialog'
import HoldDialog from './HoldOrder'
import CancelRejectDialog from '../../cancel-requests/components/CancelRejectDialog'
import RefundDialog from '../../cancel-requests/components/RefundDialog'
import PartialReturnCreateDialog from '../../partial-return-requests/components/PartialReturnCreateDialog'

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
    const [acceptDialog, setAcceptDialog] = useState(false)
    const [rejectDialog, setRejectDialog] = useState(false)
    const [cancelRejectDialog, setCancelRejectDialog] = useState(false)
    const [rejectOrderDialog, setRejectOrderDialog] = useState(false)
    const [holdDialog, setHoldDialog] = useState(false)
    const [refundDialogOpen, setRefundDialogOpen] = useState(false)
    const [partialReturnDialogOpen, setPartialReturnDialogOpen] = useState(false)
    const { markAsDelivered, permissions: { canProcessRefund } = {}, onlyAdmin } = useOrders()
    // console.log("Permist: ", canProcessRefund, onlyAdmin)

    // console.log(order)

    const lastRequestOf = (order) =>
        Array.isArray(order.requests) && order.requests.length > 0
            ? order.requests[order.requests.length - 1]
            : null

    const hasReturnableItems = order?.items?.some(it =>
        !it.isReturned &&
        it.returnStatus !== "Returned" &&
        it.returnStatus !== "Pending" &&
        it.returnStatus !== "Accepted" &&
        !it.partialReturnRequest
    );

    return (
        <>
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

                    {/* Manual Tracking Milestones */}
                    {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg border text-xs">
                        <div>
                            <p className="text-gray-500 uppercase font-medium">Accepted</p>
                            <p className="font-semibold">{order?.acceptedAt ? format(new Date(order?.acceptedAt), 'dd MMM, hh:mm a') : "—"}</p>
                            {order?.acceptedReason && <p className="text-emerald-600 italic truncate max-w-[150px]" title={order.acceptedReason}>"{order.acceptedReason}"</p>}
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase font-medium">Shiprocket</p>
                            <p className="font-semibold">{order?.shiprocketOrderCreatedAt ? format(new Date(order?.shiprocketOrderCreatedAt), 'dd MMM, hh:mm a') : "—"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase font-medium">Shipped</p>
                            <p className="font-semibold">{order?.shippedAt ? format(new Date(order?.shippedAt), 'dd MMM, hh:mm a') : "—"}</p>
                            {order?.shippingReason && <p className="text-blue-600 italic truncate max-w-[150px]" title={order.shippingReason}>"{order.shippingReason}"</p>}
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase font-medium">Delivered</p>
                            <p className="font-semibold">{order?.deliveredAt ? format(new Date(order?.deliveredAt), 'dd MMM, hh:mm a') : "—"}</p>
                        </div>
                    </div> */}

                    {/* Return Shipping Data */}
                    {order?.returnData && order?.returnData && (
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
                                    <TableCell>
                                        <div className='max-w-50 text-wrap flex items-center gap-1.5'>
                                            <span>{safe(it?.productId?.fullName || it?.fullName)}</span>
                                            {it?.isScratchy && (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                                    Scratchy
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell><p className='max-w-40 text-wrap'>{safe(it?.variantName)}</p></TableCell>
                                    <TableCell>{safe(it?.quantity)}</TableCell>
                                    <TableCell>{it?.price != null ? `₹${it?.price}` : '-'}</TableCell>
                                    <TableCell>{it?.price != null && it?.quantity != null ? `₹${(it?.price * it?.quantity)?.toFixed(2)}` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Lifecycle Tracking */}
                    {/* <section className="border rounded-md p-3 my-4 text-sm bg-gray-50 flex flex-col gap-3">
                        <div className="border-b pb-1 font-semibold text-gray-700">Order Tracking Details</div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Accepted At</p>
                                <p className="font-semibold text-gray-900">{order?.acceptedAt ? format(new Date(order?.acceptedAt), 'dd MMM yyyy, hh:mm a') : '-'}</p>
                                {order?.acceptedReason && <p className="text-xs text-emerald-600 mt-1 italic font-medium">Reason: "{order.acceptedReason}"</p>}
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase font-medium">Shiprocket Created At</p>
                                <p className="font-semibold text-gray-900">{order?.shiprocketOrderCreatedAt ? format(new Date(order?.shiprocketOrderCreatedAt), 'dd MMM yyyy, hh:mm a') : '-'}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase font-medium">Shipped At</p>
                                <p className="font-semibold text-gray-900">{order?.shippedAt ? format(new Date(order?.shippedAt), 'dd MMM yyyy, hh:mm a') : '-'}</p>
                                {order?.shippingReason && <p className="text-xs text-blue-600 mt-1 italic font-medium">Reason: "{order.shippingReason}"</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Label Generated</p>
                                    <p className="font-semibold text-gray-900">{order?.labelGeneratedAt ? format(new Date(order?.labelGeneratedAt), 'dd MMM yyyy') : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-medium">Manifest Generated</p>
                                    <p className="font-semibold text-gray-900">{order?.manifestGeneratedAt ? format(new Date(order?.manifestGeneratedAt), 'dd MMM yyyy') : '-'}</p>
                                </div>
                            </div>
                        </div>
                    </section> */}

                    {/* Pricing Summary */}
                    {/* <section className="mt-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span><span>₹{order?.subtotal != null ? order?.subtotal?.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Charge</span><span>₹{order?.deliveryCharge != null ? order?.deliveryCharge?.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span><span>₹{order?.discount != null ? order?.discount?.toFixed(2) : '-'}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1">
                            <span>Total</span><span>₹{order?.orderAmount != null ? order?.orderAmount?.toFixed(2) : '-'}</span>
                        </div>
                    </section> */}
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
                                        <p><strong>Raised:</strong> {r.isRaised ? `Yes at ${safeDate(r.raisedAt, 'dd MMM yyyy hh:mm a')}` : 'No'}</p>
                                        <p><strong>Reason:</strong> {safe(r.reason)}</p>
                                        {r.resolvedAt && <p><strong>Resolved At:</strong> {safeDate(r.resolvedAt, 'dd MMM yyyy hh:mm a')}</p>}
                                    </li>
                                ))}

                                {order?.partialReturnRequests && order?.partialReturnRequests?.length > 0 && (() => {
                                    const partialRequests = order.partialReturnRequests;
                                    const mostRecent = partialRequests[partialRequests.length - 1];
                                    const othersCount = partialRequests.length - 1;

                                    return (
                                        <li className="border border-indigo-200 rounded p-3 bg-indigo-50/30">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-indigo-900">Partial Return Request</span>
                                                <Badge className={
                                                    mostRecent.status === "Accepted"
                                                        ? "bg-emerald-600 text-white animate-none"
                                                        : mostRecent.status === "Rejected"
                                                            ? "bg-rose-600 text-white animate-none"
                                                            : mostRecent.status === "Hold"
                                                                ? "bg-blue-600 text-white animate-none"
                                                                : "bg-amber-500 text-white animate-pulse"
                                                }>
                                                    {mostRecent.status}
                                                </Badge>
                                            </div>
                                            <p><strong>Reason:</strong> {safe(mostRecent.reason)}</p>
                                            {mostRecent.items && mostRecent.items.length > 0 && (
                                                <p><strong>Items:</strong> {mostRecent.items.map(it => `${it.fullName || 'Item'} (Qty: ${it.quantity})`).join(', ')}</p>
                                            )}
                                            <p><strong>Raised:</strong> {mostRecent.isRaised ? `Yes at ${safeDate(mostRecent.raisedAt, 'dd MMM yyyy hh:mm a')}` : 'No'}</p>
                                            {mostRecent.resolvedAt && <p><strong>Resolved At:</strong> {safeDate(mostRecent.resolvedAt, 'dd MMM yyyy hh:mm a')}</p>}
                                            {mostRecent.createdAt && <p><strong>Created At:</strong> {safeDate(mostRecent.createdAt, 'dd MMM yyyy hh:mm a')}</p>}
                                            {othersCount > 0 && (
                                                <p className="text-xs text-indigo-600 font-semibold mt-1">
                                                    + {othersCount} other partial return request{othersCount > 1 ? 's' : ''} on this order
                                                </p>
                                            )}
                                        </li>
                                    );
                                })()}
                            </ul>
                        </section>
                    )}

                    {/* Action buttons */}
                    <DialogFooter className="mt-6 flex items-end gap-1">

                        {/* accept order */}
                        {order?.status === 'New' && order?.requests?.length <= 0 &&
                            <div className=" flex gap-1">
                                <Button variant="outline" onClick={() => { setHoldDialog(true) }}>Hold</Button>

                                {
                                    !order?.abondonedOrder &&
                                    <div className='flex gap-1'>
                                        <Button variant="outline" onClick={() => { setAcceptDialog(true) }}>Accept</Button>
                                        <Button variant="outline" onClick={() => { setRejectOrderDialog(true) }}>Reject</Button>
                                    </div>
                                }
                            </div>
                        }

                        {/* cancel order */}
                        {order?.requests && order?.requests?.length > 0
                            && lastRequestOf(order).type === 'Cancel' && lastRequestOf(order).isRaised
                            && lastRequestOf(order).status === 'Pending' && !order?.returnData
                            && !(order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated)
                            && <div className=" flex flex-col gap-1">
                                <p className='text-sm text-gray-500'>Cancel Request</p>
                                <div className=" flex gap-1">
                                    <Button variant="outline" onClick={() => { setRejectDialog(true) }}>Accept</Button>
                                    <Button variant="outline" onClick={() => { setCancelRejectDialog(true) }}>Reject</Button>
                                </div>
                            </div>
                        }

                        {(order?.status === 'New' || order?.status === 'Accepted') && !order?.abondonedOrder &&
                            <Button
                                variant="success"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to mark this order as Delivered manually?")) {
                                        markAsDelivered.mutateAsync({ orderId: order._id })
                                    }
                                }}
                                disabled={markAsDelivered.isPending}
                            >
                                Mark Delivered
                            </Button>
                        }

                        {(order?.status === "Cancelled" || order?.status === "Rejected") && (order?.razorpayOrderId || order?.phonepeOrderId) && order?.refundStatus !== "Success" && (canProcessRefund || onlyAdmin()) && (
                            <div className="flex flex-col gap-1">
                                <p className='text-sm text-gray-500'>Refund Payment</p>
                                <div>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={() => setRefundDialogOpen(true)}
                                    >
                                        Refund Payment
                                    </Button>
                                </div>
                            </div>
                        )}

                        {(order?.status === "Delivered" || order?.status === "New") && hasReturnableItems && (
                            <div className="flex flex-col gap-1">
                                <p className='text-sm text-gray-500 font-semibold'>Partial Return</p>
                                <div>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                        onClick={() => setPartialReturnDialogOpen(true)}
                                    >
                                        Raise Partial Return
                                    </Button>
                                </div>
                            </div>
                        )}

                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AcceptDialog
                open={acceptDialog}
                onOpenChange={setAcceptDialog}
                order={order}
            />

            <RejectDialog
                open={rejectOrderDialog}
                onOpenChange={setRejectOrderDialog}
                order={order}
            />

            <HoldDialog
                open={holdDialog}
                onOpenChange={setHoldDialog}
                order={order}
            />

            <CancelDialog
                open={rejectDialog}
                onOpenChange={setRejectDialog}
                order={order}
            />

            <CancelRejectDialog
                open={cancelRejectDialog}
                onOpenChange={setCancelRejectDialog}
                order={order}
            />

            <RefundDialog
                open={refundDialogOpen}
                onOpenChange={setRefundDialogOpen}
                order={order}
            />

            <PartialReturnCreateDialog
                open={partialReturnDialogOpen}
                onOpenChange={setPartialReturnDialogOpen}
                order={order}
            />
        </>
    )
}
