"use client"

import React from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useOrders } from '@/hooks/useOrders'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FaLink, FaRupeeSign } from 'react-icons/fa'
import RefreshButton from '@/components/custom/RefreshButton'
import PaymentSkeleton from './components/PaymentSkeleton'
import { format } from 'date-fns'
import { OrderViewDialog } from './components/OrderViewDialog'
import { Eye, Mail, Phone, CalendarRange } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotAuthorizedPage from '@/components/notAuthorized'

function Page() {
    const { getPaymentLinks, permissionsPayment: { canViewPayment } } = useOrders();
    const isLoading = getPaymentLinks.isLoading;
    const linksData = getPaymentLinks?.data?.data || [];

    if (!canViewPayment) return <NotAuthorizedPage />

    // Function to get status badge variant/classes
    const getStatusStyles = (status) => {
        const lower = status?.toLowerCase();
        if (lower === 'paid' || lower === 'completed' || lower === 'success') {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-50';
        }
        if (lower === 'pending' || lower === 'created') {
            return 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-50';
        }
        return 'bg-rose-50 text-rose-700 border-rose-200/60 hover:bg-rose-50';
    };

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard format */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Payment Links</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage client payments and custom payment gateways</p>
                </div>
                <div className="shrink-0">
                    <RefreshButton queryPrefix='paymentLinks' />
                </div>
            </div>

            {isLoading ? (
                <PaymentSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {linksData.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-sm text-slate-400 font-medium">No payment links found.</p>
                        </div>
                    ) : (
                        linksData.map((link) => (
                            <Card key={link._id} className="relative overflow-hidden bg-white border border-slate-100 hover:border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-5 flex flex-col group">
                                <CardContent className="p-0 flex flex-col h-full">
                                    {/* Card Header: Client Details + Badges */}
                                    <div className="flex justify-between items-start gap-3 mb-4">
                                        <div className="min-w-0">
                                            <h2 className="font-bold text-base text-slate-800 tracking-tight truncate">{link.name}</h2>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{link.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                                <Phone className="h-3 w-3 shrink-0" />
                                                <span>{link.phoneNo}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-end gap-1.5 shrink-0'>
                                            <Badge variant="outline" className={`font-semibold capitalize rounded-lg px-2 py-0.5 border text-[10px] ${getStatusStyles(link.status)}`}>
                                                {link.status}
                                            </Badge>

                                            {/* Gateway Tagging */}
                                            {(link?.razorpayOrderId || link?.orderId?.razorpayOrderId) && (
                                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 border border-blue-100 text-blue-600">
                                                    Razorpay
                                                </span>
                                            )}
                                            {(link?.phonepeOrderId || link?.orderId?.phonepeOrderId) && (
                                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 border border-purple-100 text-purple-600">
                                                    PhonePe
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100 mb-4" />

                                    {/* Payment Details */}
                                    <div className="space-y-2.5 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <FaRupeeSign className="text-slate-400 h-3.5 w-3.5" />
                                                <span className="font-medium text-xs">Amount:</span>
                                            </div>
                                            <span className="font-extrabold text-slate-800 text-base">₹{link.amount}</span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 font-medium text-xs">Order Status:</span>
                                            <Badge variant="secondary" className="capitalize text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-100">
                                                {link.orderId?.status || 'N/A'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 text-sm min-w-0">
                                            <div className="flex items-center gap-2 text-slate-500 shrink-0">
                                                <FaLink className="text-slate-400 h-3.5 w-3.5" />
                                                <span className="font-medium text-xs">Payment Link:</span>
                                            </div>
                                            <a href={link.link} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600 hover:text-indigo-700 text-xs font-semibold truncate max-w-[160px] text-right">
                                                {link.link}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Footer Details: Timestamps & Order Action */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-[10px] text-slate-400 space-y-0.5">
                                            <div className="flex items-center gap-1 font-medium">
                                                <CalendarRange className="h-3 w-3 text-slate-350" />
                                                <span>Created: {format(new Date(link?.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
                                            </div>
                                            <div className="pl-4">
                                                Updated: {format(new Date(link?.updatedAt), 'dd MMM yyyy, hh:mm a')}
                                            </div>
                                        </div>

                                        <OrderViewDialog order={link?.orderId}>
                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </OrderViewDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </InnerDashboardLayout>
    );
}

export default Page;
