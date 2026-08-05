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
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotAuthorizedPage from '@/components/notAuthorized'

function Page() {
    const { getPaymentLinks, permissionsPayment: { canViewPayment, canAddPaymentPayment, canEditPayment, canDeletePayment } } = useOrders();
    const isLoading = getPaymentLinks.isLoading;
    const linksData = getPaymentLinks?.data?.data || [];

    if (!canViewPayment) return <NotAuthorizedPage />

    // console.log(linksData)
    return (
        <InnerDashboardLayout>
            <div className="flex items-center justify-between w-full mb-4">
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl">Payment Links</h1>
                <RefreshButton queryPrefix='paymentLinks' />
            </div>

            {isLoading
                ? <PaymentSkeleton />
                : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-gray-100 rounded-md pb-4">
                    {linksData.length === 0 ? (
                        <p className="text-muted-foreground">No payment links found.</p>
                    ) : (
                        linksData.map((link) => (
                            <Card key={link._id} className="bg-white shadow-md rounded-xl p-4">
                                <CardContent className="p-0">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <h2 className="font-semibold text-lg text-gray-800">{link.name}</h2>
                                            <p className="text-sm text-gray-500">{link.email}</p>
                                            <p className="text-sm text-gray-500">{link.phoneNo}</p>
                                        </div>
                                        <div className='flex flex-col gap-2'>
                                            <Badge variant="outline" className="capitalize">
                                                {link.status}
                                            </Badge>
                                            {(link?.razorpayOrderId || link?.orderId?.razorpayOrderId) && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-center w-fit mt-1 bg-[#0052cc] text-white">
                                                    Razorpay
                                                </span>
                                            )}
                                            {(link?.phonepeOrderId || link?.orderId?.phonepeOrderId) && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-center w-fit mt-1 bg-[#5f259f] text-white">
                                                    PhonePe
                                                </span>
                                            )}

                                            <OrderViewDialog order={link?.orderId}>
                                                <Button variant="secondary" className={'h-7  border border-gray-400'}>
                                                    <Eye size={5} className='text-gray-400' />
                                                </Button>
                                            </OrderViewDialog>
                                        </div>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <FaRupeeSign className="text-primary" />
                                        <span className="font-medium">Amount:</span>
                                        ₹{link.amount}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Order Status:</span>
                                        <Badge variant="secondary" className="capitalize">{link.orderId?.status}</Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                                        <FaLink className="text-blue-500" />
                                        <a href={link.link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 truncate">
                                            {link.link}
                                        </a>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-3">
                                        Created: {format(new Date(link?.createdAt), 'dd MMM, yyyy hh:mm a')}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Updated: {format(new Date(link?.updatedAt), 'dd MMM, yyyy hh:mm a')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            }
        </InnerDashboardLayout>
    );
}

export default Page;
