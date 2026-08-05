import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { IoQrCode } from "react-icons/io5";
import { BsCashCoin } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { useOrders } from '@/hooks/useOrders';
import LoaderButton from './custom/LoaderButton';
import { Button } from './ui/button';

function PaymentUpdateDialog({ open, onOpenChange, order }) {
    const [status, setStatus] = useState(order?.paymentStatus || "")
    const [method, setMethod] = useState(order?.method || "")

    // keep state synced when order changes
    useEffect(() => {
        setStatus(order?.paymentStatus || "")
        setMethod(order?.method || "")
    }, [order])

    const { updateOrder } = useOrders()

    const onSubmit = async () => {
        try {
            await updateOrder.mutateAsync({
                id: order._id,
                data: {
                    paymentStatus: status,
                    method: method,
                },
            })
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }

    // helpers for badge styles
    const paymentBadgeClass = (p) => {
        if (!p) return 'bg-gray-100 text-gray-700'
        if (p === 'Paid') return 'bg-green-100 text-green-700'
        if (p === 'Pending') return 'bg-yellow-100 text-yellow-700'
        return 'bg-gray-100 text-gray-700'
    }

    // const statusBadgeClass = (s) => {
    //     if (!s) return 'bg-gray-100 text-gray-700'
    //     if (s === 'Delivered') return 'bg-teal-100 text-teal-700'
    //     if (s === 'New') return 'bg-indigo-100 text-indigo-700'
    //     if (s === 'Cancelled' || s === 'Rejected') return 'bg-red-100 text-red-700'
    //     if (s === 'Shipped') return 'bg-yellow-100 text-yellow-700'
    //     return 'bg-gray-100 text-gray-700'
    // }

    const formatDate = (iso) => {
        if (!iso) return '-'
        try {
            const d = new Date(iso)
            return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        } catch {
            return iso
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Payment Status</DialogTitle>
                </DialogHeader>

                {/* Order details summary */}
                <div className="mb-0 p-4 bg-slate-50 border rounded-md">
                    <div className="mt-3 grid grid-cols-2 gap-3">

                        <div>
                            <div className="text-xs text-gray-500">Order ID</div>
                            <div className="font-medium text-sm">{order?.orderId ?? '-'}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Created</div>
                            <div className="font-medium text-sm">{formatDate(order?.createdAt)}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Customer</div>
                            <div className="font-medium text-sm">{order?.name ?? '-'}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Phone</div>
                            <div className="font-medium text-sm">{order?.phoneNo ?? '-'}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Order Status</div>
                            <div className={`inline-block mt-1 rounded text-sm font-medium ${order?.status}`}>
                                {order?.status ?? '-'}
                            </div>
                        </div>

                        <div className="">
                            <div className="text-xs text-gray-500">Amount</div>
                            <div className="font-medium text-sm">₹{order?.orderAmount ?? '-'}</div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Payment Method</div>
                            <div className={`inline-block mt-1 py-0.5 rounded text-sm font-medium ${method ? '' : 'text-gray-500'}`}>
                                <span className="text-sm">{order?.method ?? '-'}</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Payment Status</div>
                            <div className={`inline-block mt-1 px-2 py-0.5 rounded text-sm font-medium ${paymentBadgeClass(order?.paymentStatus)}`}>
                                {order?.paymentStatus ?? '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls: method + status */}
                <div className="space-y-4">
                    {/* Payment Method */}
                    {/* <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Payment Method</div>
                        <Select
                            value={method}
                            onValueChange={(val) => setMethod(val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">
                                    <div className="flex items-center gap-2">
                                        <BsCashCoin className="w-4 h-4 text-gray-600" />
                                        <span>Cash</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="UPI">
                                    <div className="flex items-center gap-2">
                                        <IoQrCode className="w-4 h-4 text-gray-600" />
                                        <span>UPI</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Online">
                                    <div className="flex items-center gap-2">
                                        <FaGoogle className="w-4 h-4 text-gray-600" />
                                        <span>Online</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    {/* Payment Status */}
                    <div>
                        <div className="mb-1 text-sm font-medium text-gray-700">Payment Status</div>
                        <Select
                            value={status}
                            onValueChange={(val) => setStatus(val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Paid">
                                    <div className="flex items-center gap-2">
                                        <span>Paid</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Pending">
                                    <div className="flex items-center gap-2">
                                        <span>Pending</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <LoaderButton
                        loading={updateOrder?.isPending}
                        onClick={onSubmit}
                    >
                        Update
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PaymentUpdateDialog
