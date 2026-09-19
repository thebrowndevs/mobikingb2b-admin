import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import LoaderButton from '@/components/custom/LoaderButton'
import { Check } from 'lucide-react'

export default function BookOrderDialog({
    isOpen,
    onOpenChange,
    quotation,
    onBook,
    isPending
}) {
    // B2B Order Options
    const [bookingPaymentMode, setBookingPaymentMode] = useState("complete")
    const [bookingPaymentMethod, setBookingPaymentMethod] = useState("COD")

    // Packaging Dimensions
    const [bookingLength, setBookingLength] = useState("19")
    const [bookingBreadth, setBookingBreadth] = useState("16")
    const [bookingHeight, setBookingHeight] = useState("6")
    const [bookingWeight, setBookingWeight] = useState("0.5")

    // Payment Record Options
    const [recordPayment, setRecordPayment] = useState(true)
    const [paymentSubtotal, setPaymentSubtotal] = useState("")
    const [paymentDiscount, setPaymentDiscount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("Online")
    const [paymentId, setPaymentId] = useState("")
    const [paymentStatus, setPaymentStatus] = useState("Pending")

    // Handle method change & reset payment ID
    const handleBookingMethodChange = (newMethod) => {
        setBookingPaymentMethod(newMethod)
        setPaymentId("")
    }

    const handleRecordMethodChange = (newMethod) => {
        setPaymentMethod(newMethod)
        setPaymentId("")
        if (newMethod === "Online") {
            setPaymentStatus("Pending")
        }
    }

    // Prefill payment fields when quotation changes or dialog opens
    useEffect(() => {
        if (quotation) {
            setPaymentSubtotal(String(quotation.subtotal || quotation.orderAmount || ""))
            setPaymentDiscount(String(quotation.discount || 0))
            if (bookingPaymentMethod && bookingPaymentMethod !== "COD") {
                setPaymentMethod(bookingPaymentMethod)
            }
        }
    }, [quotation, isOpen, bookingPaymentMethod])

    const calcAmount = Math.max(0, Number(paymentSubtotal || 0) - Number(paymentDiscount || 0));

    const handleSubmit = () => {
        if (recordPayment && calcAmount > (quotation?.orderAmount || 0)) {
            return;
        }

        const derivedPaymentMode = (recordPayment && calcAmount >= (quotation?.orderAmount || 0)) ? "complete" : "parcel";

        const payload = {
            quotationId: quotation._id,
            paymentMode: derivedPaymentMode,
            method: bookingPaymentMethod,
            length: Number(bookingLength),
            breadth: Number(bookingBreadth),
            height: Number(bookingHeight),
            weight: Number(bookingWeight)
        }

        if (recordPayment) {
            const sub = Number(paymentSubtotal) || 0;
            const disc = Number(paymentDiscount) || 0;
            const amt = Math.max(0, sub - disc);

            payload.stages = [
                {
                    subtotal: sub,
                    discount: disc,
                    amount: amt,
                    method: paymentMethod,
                    status: paymentMethod === "Online" ? "Pending" : paymentStatus,
                    paymentId: paymentId.trim() || undefined,
                    notes: "Auto-recorded during booking"
                }
            ]
        }

        onBook(payload)
    }

    if (!quotation) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-indigo-900 flex items-center gap-2">
                        <Check className="w-6 h-6 p-1 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100" />
                        Book Order Requests
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 text-sm text-slate-700">
                    <div className="flex justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-500">Total Order Amount:</span>
                        <span className="font-bold text-slate-900 text-lg">₹{quotation.orderAmount?.toLocaleString()}</span>
                    </div>

                    {/* B2B Order Options */}
                    <div className="grid grid-cols-2 gap-3 bg-indigo-50/55 p-3 rounded-lg border border-indigo-100/50 mb-1">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-indigo-900 font-bold">PAYMENT MODE</span>
                            <div className="h-9 px-3 bg-white border border-slate-200 rounded-md flex items-center text-xs font-bold text-indigo-950 uppercase">
                                {recordPayment && calcAmount >= (quotation?.orderAmount || 0) ? "Complete" : "Parcel"}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-indigo-900 font-bold">PAYMENT METHOD</span>
                            <Select onValueChange={handleBookingMethodChange} value={bookingPaymentMethod}>
                                <SelectTrigger className="border-slate-200 h-9 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COD">COD</SelectItem>
                                    <SelectItem value="Online">Online</SelectItem>
                                    <SelectItem value="UPI">QR Code</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Payment Record Option (Default checked) */}
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="record-payment"
                                checked={recordPayment}
                                onCheckedChange={(checked) => setRecordPayment(!!checked)}
                                className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                            <Label htmlFor="record-payment" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                                RECORD PAYMENT FOR THIS ORDER
                            </Label>
                        </div>

                        {recordPayment && (
                            <div className="pt-1 flex flex-col gap-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Subtotal (₹)</span>
                                        <Input
                                            type="number"
                                            value={paymentSubtotal}
                                            max={quotation?.orderAmount || undefined}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const num = parseFloat(val);
                                                if (!isNaN(num) && num > (quotation?.orderAmount || 0)) {
                                                    setPaymentSubtotal(String(quotation?.orderAmount || 0));
                                                } else {
                                                    setPaymentSubtotal(val);
                                                }
                                            }}
                                            className="h-8 border-slate-200 text-xs bg-white"
                                            placeholder="Subtotal"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Discount (₹)</span>
                                        <Input
                                            type="number"
                                            value={paymentDiscount}
                                            readOnly
                                            className="h-8 border-slate-200 text-xs bg-slate-50 cursor-not-allowed text-slate-500"
                                            placeholder="Discount"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Amount (₹)</span>
                                        <div className="h-8 flex items-center font-bold text-xs text-slate-900 bg-slate-50 px-2 rounded border border-slate-200">
                                            ₹{calcAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Method</span>
                                        <Select onValueChange={handleRecordMethodChange} value={paymentMethod}>
                                            <SelectTrigger className="border-slate-200 h-8 text-xs bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Online">Online</SelectItem>
                                                <SelectItem value="UPI">QR Code</SelectItem>
                                                <SelectItem value="Cash">Cash</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Status</span>
                                        <Select
                                            onValueChange={setPaymentStatus}
                                            value={paymentMethod === "Online" ? "Pending" : paymentStatus}
                                            disabled={paymentMethod === "Online"}
                                        >
                                            <SelectTrigger className="border-slate-200 h-8 text-xs bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Paid" disabled={paymentMethod === "Online"}>Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {(paymentMethod === "UPI" || paymentMethod === "Online") && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <span className="text-[10px] text-slate-400 font-semibold">Payment ID / Transaction Ref</span>
                                        <Input
                                            value={paymentId}
                                            onChange={(e) => setPaymentId(e.target.value)}
                                            placeholder="Enter Payment ID / Ref"
                                            className="h-8 border-slate-200 text-xs bg-white"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Dimensions Fields */}
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2">
                        <span className="text-xs text-slate-400 font-bold">ORDER PACKAGING DIMENSIONS</span>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold">Length (cm)</span>
                                <Input
                                    type="number"
                                    value={bookingLength}
                                    onChange={(e) => setBookingLength(e.target.value)}
                                    className="h-8 border-slate-200 text-xs bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold">Breadth (cm)</span>
                                <Input
                                    type="number"
                                    value={bookingBreadth}
                                    onChange={(e) => setBookingBreadth(e.target.value)}
                                    className="h-8 border-slate-200 text-xs bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold">Height (cm)</span>
                                <Input
                                    type="number"
                                    value={bookingHeight}
                                    onChange={(e) => setBookingHeight(e.target.value)}
                                    className="h-8 border-slate-200 text-xs bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold">Weight (kg)</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={bookingWeight}
                                    onChange={(e) => setBookingWeight(e.target.value)}
                                    className="h-8 border-slate-200 text-xs bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:bg-slate-100">
                        Cancel
                    </Button>
                    <LoaderButton
                        loading={isPending}
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    >
                        Book Order
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
