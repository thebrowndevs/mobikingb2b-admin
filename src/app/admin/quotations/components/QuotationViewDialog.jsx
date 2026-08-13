'use client'
import React from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table'
import { format } from 'date-fns'

const STATUS_VARIANTS = {
    New: 'default',
    Accepted: 'success',
    Rejected: 'destructive',
    Hold: 'secondary',
    Booked: 'success',
    Cancelled: 'destructive',
}

export function QuotationViewDialog({ quotation, children }) {
    const safe = (value) => (value !== null && value !== undefined && value !== '' ? value : '-')
    const safeDate = (dateVal, fmt = 'dd MMM yyyy, hh:mm a') => {
        if (!dateVal) return '-';
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? '-' : format(d, fmt);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent className="sm:max-w-3xl overflow-auto max-h-[90vh]">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <DialogTitle>Quotation #{safe(quotation?.quotationId)}</DialogTitle>
                    </div>
                    <DialogDescription>
                        <Badge variant={STATUS_VARIANTS[quotation?.status] || 'default'}>
                            {safe(quotation?.status)}
                        </Badge>
                        {' • '}{quotation?.isAppOrder ? 'App' : 'Website'}
                    </DialogDescription>
                </DialogHeader>

                {/* Customer Info */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-sm">
                    <div>
                        <Badge variant='secondary' className='mb-1'>Customer Details</Badge>
                        <p><strong>Name:</strong> {safe(quotation?.name)}</p>
                        <p><strong>Email:</strong> {safe(quotation?.email)}</p>
                        <p><strong>Phone:</strong> {safe(quotation?.phoneNo)}</p>
                        <p><strong>Address:</strong> {safe(quotation?.address)}</p>
                        {quotation?.address2 && <p><strong>Address 2:</strong> {quotation.address2}</p>}
                        <p><strong>City / State / Pin:</strong> {safe(quotation?.city)}, {safe(quotation?.state)} - {safe(quotation?.pincode)}</p>
                    </div>
                    <div>
                        <Badge variant='secondary' className='mb-1'>Quotation Info</Badge>
                        <p><strong>Created At:</strong> {safeDate(quotation?.createdAt)}</p>
                        <p><strong>Status:</strong> {safe(quotation?.status)}</p>
                        {quotation?.comments && <p><strong>Comments:</strong> {safe(quotation.comments)}</p>}
                        {quotation?.statusDescription && <p><strong>Status Remarks:</strong> {safe(quotation.statusDescription)}</p>}
                    </div>
                </section>

                {/* Items Table */}
                <section className="my-4">
                    <Badge variant='secondary' className='mb-2'>Products List</Badge>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Variant</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Unit Price</TableHead>
                                    <TableHead className="text-right">Discount</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotation?.items?.map((it, idx) => {
                                    const prodName = it.productId?.fullName || it.productId?.name || it.name
                                    const qty = it.quantity || 0
                                    const price = it.price || 0
                                    const discount = it.discount || 0
                                    const itemTotal = (price * qty) - discount

                                    return (
                                        <TableRow key={idx}>
                                            <TableCell className="font-semibold text-slate-850 max-w-[240px] break-words whitespace-normal">{prodName}</TableCell>
                                            <TableCell className="font-mono text-xs">{it.variantName}</TableCell>
                                            <TableCell className="text-center">{qty}</TableCell>
                                            <TableCell className="text-right">₹{price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-emerald-600 font-semibold">
                                                {it.discountPercent > 0 ? `${it.discountPercent}%` : `₹${discount.toLocaleString()}`}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900">₹{itemTotal.toLocaleString()}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                {/* Financial Summary */}
                <section className="flex justify-end pt-2">
                    <div className="w-64 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500 font-semibold">
                            <span>Subtotal:</span>
                            <span>₹{quotation?.subtotal?.toLocaleString()}</span>
                        </div>
                        {quotation?.discount > 0 && (
                            <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Discount {quotation.discountPercent > 0 ? `(${quotation.discountPercent}%)` : ''}:</span>
                                <span>-₹{quotation.discount?.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-slate-500 font-semibold">
                            <span>Delivery Charge:</span>
                            <span>₹{quotation?.deliveryCharge?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t">
                            <span>Total Amount:</span>
                            <span>₹{quotation?.orderAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </section>
            </DialogContent>
        </Dialog>
    )
}
