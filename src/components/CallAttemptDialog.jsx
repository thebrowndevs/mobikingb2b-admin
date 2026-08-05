'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneCall } from 'lucide-react'
import { format } from 'date-fns'
import { useOrders } from '@/hooks/useOrders'

export default function CallAttemptDialog({ order }) {
    const [open, setOpen] = useState(false)
    const [remarks, setRemarks] = useState('')
    const { recordCallAttempt } = useOrders()

    if (!order) return null

    const noOfAttempts = order?.callAttempts?.noOfAttempts || 0
    const history = order?.callAttempts?.history || []

    // Sort history by attemptNo ascending
    const sortedHistory = [...history].sort((a, b) => (a?.attemptNo || 0) - (b?.attemptNo || 0))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (noOfAttempts >= 3) return

        try {
            await recordCallAttempt.mutateAsync({
                orderId: order._id,
                remarks: remarks
            })
            setRemarks('')
            setOpen(false)
        } catch (error) {
            // Handled in useOrders hook
        }
    }

    const nextAttemptNo = noOfAttempts < 3 ? noOfAttempts + 1 : 3

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setOpen(true)
                        }}
                        className="inline-flex items-center gap-1 p-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                    >
                        {[1, 2, 3].map((num) => {
                            const isFilled = num <= noOfAttempts
                            return (
                                <PhoneCall
                                    key={num}
                                    className={`h-4 w-4 ${isFilled
                                        ? 'text-emerald-600 fill-emerald-600'
                                        : 'text-gray-300 stroke-[1.5]'
                                        }`}
                                />
                            )
                        })}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs p-2.5 bg-gray-900 text-white shadow-lg">
                    <div className="font-semibold mb-1 border-b border-gray-700 pb-1">
                        Call Attempts: {noOfAttempts} / 3
                    </div>
                    {history.length === 0 ? (
                        <p className="text-gray-400">No attempts recorded yet</p>
                    ) : (
                        <div className="space-y-1 mt-1">
                            {sortedHistory.map((item, idx) => {
                                const empName = item?.employeeId?.name || 'User'
                                const empRole = item?.employeeId?.role ? ` (${item.employeeId.role})` : ''
                                return (
                                    <div key={idx} className="text-[11px] leading-snug">
                                        <span className="font-medium text-emerald-400">
                                            #{item?.attemptNo}:
                                        </span>{' '}
                                        <span>{item?.remarks || 'No remarks'}</span>
                                        <span className="block text-[10px] text-gray-400">
                                            By {empName}{empRole} at {item?.date ? format(new Date(item.date), 'dd MMM, hh:mm a') : '—'}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-4">
                            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Phone className="h-5 w-5 text-emerald-600" />
                                Record Call Attempt
                            </DialogTitle>
                            <Badge
                                variant={noOfAttempts >= 3 ? "secondary" : "outline"}
                                className={noOfAttempts >= 3 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-emerald-50 text-emerald-700 border-emerald-300"}
                            >
                                {noOfAttempts >= 3 ? "3 of 3 Completed" : `Attempt #${nextAttemptNo}`}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-gray-500 mt-1">
                            Order ID: <span className="font-semibold text-gray-700">{order?.orderId}</span> ({order?.phoneNo})
                        </DialogDescription>
                    </DialogHeader>

                    {/* Past Attempts History Box */}
                    <div className="mt-2">
                        <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                            Past Call Attempts History ({noOfAttempts}/3)
                        </h4>
                        {sortedHistory.length === 0 ? (
                            <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-400 border border-gray-200">
                                No past call attempts recorded.
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                {sortedHistory.map((item, idx) => {
                                    const empName = item?.employeeId?.name || 'User'
                                    const empRole = item?.employeeId?.role ? ` (${item.employeeId.role})` : ''
                                    return (
                                        <div key={idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                                            <div className="flex items-center justify-between text-gray-700 mb-1">
                                                <span className="font-bold text-emerald-700">
                                                    Attempt #{item?.attemptNo}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {item?.date ? format(new Date(item.date), 'dd MMM yyyy, hh:mm a') : '—'}
                                                </span>
                                            </div>
                                            <p className="text-gray-800 font-medium">"{item?.remarks || 'No remarks provided'}"</p>
                                            <div className="text-[10px] text-gray-500 mt-1 flex items-center justify-between">
                                                <span>Recorded by: <strong className="text-gray-700">{empName}{empRole}</strong></span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Remarks Input & Submit Button (Hidden when 3 attempts done) */}
                    {noOfAttempts < 3 && (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-3 pt-3 border-t border-gray-200">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Call Remarks / Response
                                </label>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter customer call outcome, notes or feedback..."
                                    className="text-xs min-h-[80px]"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={recordCallAttempt.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {recordCallAttempt.isPending ? "Submitting..." : `Submit Attempt #${nextAttemptNo}`}
                                </Button>
                            </div>
                        </form>
                    )
                        // : (
                        //     <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs text-center">
                        //         Maximum 3 call attempts recorded for this order. Remarks input disabled.
                        //     </div>
                        // )
                    }
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}
