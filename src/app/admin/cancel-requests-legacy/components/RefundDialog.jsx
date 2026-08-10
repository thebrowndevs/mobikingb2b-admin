'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders } from '@/hooks/useOrders'
import { toast } from 'react-hot-toast'
import LoaderButton from '@/components/custom/LoaderButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'

export default function RefundDialog({ open, onOpenChange, order }) {
    const { refundOrder } = useOrders()
    const [refundAmount, setRefundAmount] = useState('')

    useEffect(() => {
        if (order?.orderAmount != null) {
            setRefundAmount(order.orderAmount.toString())
        } else {
            setRefundAmount('')
        }
    }, [order, open])

    const handleRefund = async () => {
        const amt = parseFloat(refundAmount)
        if (isNaN(amt) || amt <= 0) {
            toast.error("Please enter a valid positive refund amount.")
            return
        }
        if (amt > order?.orderAmount) {
            toast.error(`Refund amount cannot exceed the order amount of ₹${order.orderAmount.toFixed(2)}.`)
            return
        }

        try {
            await refundOrder.mutateAsync({
                orderId: order._id,
                refundAmount: amt
            })
            onOpenChange(false)
        } catch (error) {
            // Error toast handled by useMutation onError
        }
    }

    const gateway = order?.razorpayPaymentId || order?.razorpayOrderId
        ? "Razorpay"
        : order?.phonepePaymentId || order?.phonepeOrderId
            ? "PhonePe"
            : "Unknown Gateway"

    const isAlreadyRefunded = order?.refundStatus === "Success"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Refund Online Order Payment</DialogTitle>
                </DialogHeader>

                {/* Pricing Summary & Order Details */}
                <div className="space-y-4 text-sm text-gray-700">
                    <div className="grid grid-cols-2 gap-2 border-b pb-3">
                        <div>
                            <p><strong>Order ID:</strong> {order?.orderId || '-'}</p>
                            <p><strong>Customer:</strong> {order?.name || '-'}</p>
                            <p><strong>Phone:</strong> {order?.phoneNo || '-'}</p>
                        </div>
                        <div>
                            <p><strong>Method:</strong> {order?.method || '-'}</p>
                            <p><strong>Gateway:</strong> <span className="font-bold text-indigo-600">{gateway}</span></p>
                            {order?.refundId && (
                                <p><strong>Refund ID:</strong> <span className="font-mono text-xs">{order.refundId}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Items table */}
                    <div>
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <div className="border rounded-lg overflow-hidden">
                            <Table className="text-xs">
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Variant</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(order?.items || []).map((it, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium max-w-[150px] truncate">
                                                {it?.productId?.fullName || it?.fullName || '-'}
                                            </TableCell>
                                            <TableCell className="max-w-[100px] truncate">
                                                {it?.variantName || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">{it?.quantity || 0}</TableCell>
                                            <TableCell className="text-right">₹{it?.price?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell className="text-right">
                                                ₹{(it?.price * it?.quantity)?.toFixed(2) || '0.00'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-1 bg-gray-50 p-3 rounded-lg border text-xs">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order?.subtotal?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Delivery Charge</span>
                            <span>₹{order?.deliveryCharge?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span className="text-red-500">-₹{order?.discount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-1.5 text-sm mt-1 text-gray-900">
                            <span>Total Paid</span>
                            <span>₹{order?.orderAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                        {order?.refundAmount > 0 && (
                            <div className="flex justify-between font-bold text-red-600">
                                <span>Refunded Amount</span>
                                <span>-₹{order?.refundAmount?.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Refund Amount Input */}
                    {isAlreadyRefunded ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                            <p className="font-medium text-xs">Refund Status: Success</p>
                            <p className="text-xs mt-1">
                                An amount of <strong>₹{order?.refundAmount?.toFixed(2)}</strong> has already been successfully refunded for this order via {gateway}.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label htmlFor="refund-amount" className="text-xs font-semibold">
                                Refund Amount (₹)
                            </Label>
                            <Input
                                id="refund-amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={order?.orderAmount || 0}
                                placeholder="Enter refund amount..."
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                disabled={refundOrder.isPending}
                                className="bg-white"
                            />
                            <p className="text-[10px] text-gray-500">
                                Prefilled with the full paid total amount. You can manually adjust it to perform a partial refund if needed.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-end space-x-2 mt-4 border-t pt-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={refundOrder.isPending}
                    >
                        Close
                    </Button>
                    {!isAlreadyRefunded && (
                        <LoaderButton
                            onClick={handleRefund}
                            loading={refundOrder.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Process Refund
                        </LoaderButton>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
