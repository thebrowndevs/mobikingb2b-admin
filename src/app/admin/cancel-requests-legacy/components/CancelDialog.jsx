'use client'
import React, { useState } from 'react'
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders } from '@/hooks/useOrders'
import { toast } from 'react-hot-toast'
import LoaderButton from '@/components/custom/LoaderButton'
import { Input } from '@/components/ui/input' // assuming you're using shadcn/ui
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CancelDialog({ open, onOpenChange, order }) {
    const { cancelOrder } = useOrders()
    const [reason, setReason] = useState('')

    const handleCancel = async () => {
        if (!order?._id) {
            toast.error("Please provide a reason for cancellation.")
            return
        }
        try {
            await cancelOrder.mutateAsync({
                orderId: order._id,
                reason: reason
            })
            onOpenChange(false)
        } catch (error) {
            toast.error("Failed to cancel order.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val)
            if (!val) setReason("") // clear on close
        }}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cancel Order?</DialogTitle>
                </DialogHeader>

                <div className='text-gray-600 text-sm space-y-1'>
                    <p><strong>Order ID:</strong> {order?.orderId || '-'}</p>
                    <p><strong>Customer:</strong> {order?.name || '-'} ({order?.phoneNo || '-'})</p>
                    <p><strong>Total:</strong> ₹{order?.orderAmount?.toFixed(2) ?? '-'}</p>
                </div>


                {/* Reason Input */}
                <div className="mt-4 space-y-1">
                    <Label htmlFor="reason">Reason for cancellation</Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={cancelOrder.isPending}
                    />
                </div>

                <DialogFooter className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={cancelOrder.isLoading}
                    >
                        Close
                    </Button>
                    <LoaderButton
                        onClick={handleCancel}
                        loading={cancelOrder.isPending}
                    >
                        Cancel Order
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
