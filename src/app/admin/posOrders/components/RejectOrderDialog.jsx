'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders } from '@/hooks/useOrders'
import LoaderButton from '@/components/custom/LoaderButton'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" // ShadCN Radio

export default function RejectDialog({ open, onOpenChange, order }) {
    const { rejectOrder } = useOrders()
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')

    const handleReject = () => {
        const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason
        if (!order?._id || !finalReason) return
        try {
            rejectOrder.mutateAsync({
                orderId: order._id,
                reason: finalReason
            })
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }

    const predefinedReasons = [
        "Address not serviceable",
        "Customer canceled",
        "Out of stock",
        "Other"
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Reject Order?</DialogTitle>
                    <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Order ID:</strong> {order?.orderId || '-'}</p>
                        <p><strong>Customer:</strong> {order?.name || '-'} ({order?.phoneNo || '-'})</p>
                        <p><strong>Total:</strong> ₹{order?.orderAmount?.toFixed(2) ?? '-'}</p>
                    </div>
                </DialogHeader>

                {/* Reason Selection */}
                <div className="mt-4 space-y-2">
                    <Label>Reason for Rejection</Label>
                    <RadioGroup
                        value={selectedReason}
                        onValueChange={setSelectedReason}
                        className="space-y-2"
                    >
                        {predefinedReasons.map((reason) => (
                            <div key={reason} className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value={reason}
                                    id={reason}
                                    disabled={rejectOrder.isPending}
                                />
                                <Label htmlFor={reason}>{reason}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* Textarea for "Other" */}
                {selectedReason === "Other" && (
                    <div className="mt-3 space-y-1">
                        <Label htmlFor="customReason">Please provide a reason</Label>
                        <Textarea
                            id="customReason"
                            placeholder="Type your reason..."
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            disabled={rejectOrder.isPending}
                        />
                    </div>
                )}

                <DialogFooter className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={rejectOrder.isLoading}
                    >
                        Cancel
                    </Button>
                    <LoaderButton
                        onClick={handleReject}
                        loading={rejectOrder.isPending}
                        disabled={
                            (selectedReason === "Other" && !customReason.trim()) ||
                            (!selectedReason) ||
                            rejectOrder.isPending
                        }
                    >
                        Reject
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
