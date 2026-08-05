'use client'
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders } from '@/hooks/useOrders'
import LoaderButton from '@/components/custom/LoaderButton'

export default function AcceptDialog({ open, onOpenChange, order }) {
    const [reason, setReason] = React.useState('')
    const { updateOrder } = useOrders()

    const handleAccept = async () => {
        if (!order?._id) return
        try {
            await updateOrder.mutateAsync({ 
                id: order._id, 
                data: { status: 'Accepted', reason } 
            })
            onOpenChange(false)
        } catch (error) {
            // Error is handled by toast in hook
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Accept Order?</DialogTitle>
                    <DialogDescription className="mt-2">
                        <p><strong>Order ID:</strong> {order?.orderId || '-'}</p>
                        <p><strong>Customer:</strong> {order?.name || '-'} ({order?.phoneNo || '-'})</p>
                        <p><strong>Total:</strong> ₹{order?.orderAmount?.toFixed(2) ?? '-'}</p>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Acceptance Reason (Optional)
                    </label>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Enter reason for acceptance..."
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <DialogFooter className="flex justify-end space-x-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={updateOrder.isPending}
                    >
                        Cancel
                    </Button>
                    <LoaderButton
                        onClick={handleAccept}
                        loading={updateOrder.isPending}
                    >
                        Accept
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
