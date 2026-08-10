'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useOrders } from '@/hooks/useOrders'
import { toast } from 'react-hot-toast'
import LoaderButton from '@/components/custom/LoaderButton'
import { Input } from '@/components/ui/input' // assuming you're using shadcn/ui
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function CancelRejectDialog({ open, onOpenChange, order }) {
    const { rejectCancelRequest } = useOrders()
    const [reason, setReason] = useState('')

    const handleRejectCancel = async () => {
        if (!order?._id) {
            toast.error("Please provide a reason for cancellation.")
            return
        }
        try {
            await rejectCancelRequest.mutateAsync({
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
            <DialogContent className="sm:max-w-[420px] max-h-[85vh] bg-white rounded-2xl border border-slate-200 shadow-none p-6">
                <DialogHeader className="border-b border-slate-100 pb-3 mb-2">
                    <DialogTitle className="text-lg font-bold text-slate-800">Reject Cancel Request?</DialogTitle>
                </DialogHeader>

                <div className='text-slate-500 text-xs space-y-1.5 py-2'>
                    <p><strong>Order ID:</strong> <span className="font-mono text-slate-700">{order?.orderId || '-'}</span></p>
                    <p><strong>Customer:</strong> <span className="text-slate-700">{order?.name || '-'} ({order?.phoneNo || '-'})</span></p>
                    <p><strong>Total:</strong> <span className="text-slate-750 font-bold">₹{order?.orderAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '-'}</span></p>
                </div>


                {/* Reason Input */}
                <div className="mt-2 space-y-2">
                    <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-slate-400">Reason for rejection</Label>
                    <Textarea
                        id="reason"
                        placeholder="Please provide a reason..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={rejectCancelRequest.isPending}
                        className="text-sm border-slate-200 focus:border-slate-400 rounded-lg"
                    />
                </div>

                <DialogFooter className="flex justify-end space-x-2 mt-4 border-t border-slate-100 pt-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={rejectCancelRequest.isLoading}
                        className="text-xs px-4 h-9 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg"
                    >
                        Close
                    </Button>
                    <LoaderButton
                        onClick={handleRejectCancel}
                        loading={rejectCancelRequest.isPending}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-lg text-xs"
                    >
                        Reject Request
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}