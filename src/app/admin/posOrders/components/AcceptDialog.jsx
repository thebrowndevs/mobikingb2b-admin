'use client'
import React, { useEffect } from 'react'
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
import { toast } from 'react-hot-toast'
import LoaderButton from '@/components/custom/LoaderButton'

export default function AcceptDialog({ open, onOpenChange, order }) {
    const { acceptOrder } = useOrders()

    const handleAccept = () => {
        if (!order?._id) return
        acceptOrder.mutateAsync(order._id)
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

                <DialogFooter className="flex justify-end space-x-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={acceptOrder.isLoading}
                    >
                        Cancel
                    </Button>
                    <LoaderButton
                        onClick={handleAccept}
                        loading={acceptOrder.isPending}
                    >
                        Accept
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
