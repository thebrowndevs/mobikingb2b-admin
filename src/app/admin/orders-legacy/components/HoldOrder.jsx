'use client'
import React, { useState } from 'react'
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function HoldDialog({ open, onOpenChange, order }) {
    const { holdOrder } = useOrders()
    const [reason, setReason] = useState('')
    const [selectedReason, setSelectedReason] = useState('')
    const [customReason, setCustomReason] = useState('')

    const handleHold = () => {
        const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason
        if (!order?._id || !finalReason) return
        try {
            holdOrder.mutateAsync({
                orderId: order._id,
                reason: finalReason
            })
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }

    // const handleHold = () => {
    //     if (!order?._id || !reason.trim()) return
    //     holdOrder.mutateAsync({
    //         orderId: order._id,
    //         reason: reason
    //     })
    // }



    const predefinedReasons = [
        "Product Missing From the inventory",
        "Last Unit Available & Found Faulty",
        "Product Found Heavy Scratch",
        "Product Daimage",
        "Colour Mismatch",
        "Other"
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Put Order On Hold?</DialogTitle>
                    <DialogDescription className="mt-2 space-y-1">
                        <p><strong>Order ID:</strong> {order?.orderId || '-'}</p>
                        <p><strong>Customer:</strong> {order?.name || '-'} ({order?.phoneNo || '-'})</p>
                        <p><strong>Total:</strong> ₹{order?.orderAmount?.toFixed(2) ?? '-'}</p>
                    </DialogDescription>
                </DialogHeader>

                {/* Reason Selection */}
                <div className="mt-4 space-y-2">
                    <Label>Reason for Hold</Label>
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
                                    disabled={holdOrder.isPending}
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
                            disabled={holdOrder.isPending}
                        />
                    </div>
                )}

                {/* Reason Input */}
                {/* <div className="mt-4 space-y-1">
                    <Label htmlFor="reason">Reason for Hold</Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={holdOrder.isPending}
                    />
                </div> */}

                <DialogFooter className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={holdOrder.isLoading}
                    >
                        Cancel
                    </Button>
                    <LoaderButton
                        onClick={handleHold}
                        loading={holdOrder.isPending}
                        disabled={(selectedReason === "Other" && !customReason.trim()) ||
                            (!selectedReason) || holdOrder.isPending}
                    >
                        Hold
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
