"use client"
import { Car, Printer, Download, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import PCard from '@/components/custom/PCard';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useOrders } from '@/hooks/useOrders';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { format } from 'date-fns'
import UpperDetailss from './components/UpperDetailss';
import PersonalDetails from './components/PersonalDetails';
import PaymentDetails from './components/PaymentDetails';
import ItemsTable from './components/ItemsTable';
import LoaderButton from "@/components/custom/LoaderButton";
import CourierDialog from "./components/CourierDialog";
import ShippingDetails from "./components/ShippingDetails";
import { toast } from 'react-hot-toast'
import OrderSkeletonPage from "./components/OrderSkeletonPage";
import Scans from "./components/Scans";
import RejectDialog from "../components/RejectOrderDialog";
import CancelDialog from "../components/CancelDialog";
import UpdateStatus from "./components/UpdateStatus";
import Link from "next/link";
import GSTBillDownload from "@/components/GSTBill";
import ReturnShippingDetails from "./components/ReturnShippingDetails";
import OrderTimeline from "@/components/OrderTimeline";
import GSTBillDownloadV2 from "@/components/GSTBillV2";

function page() {
    const params = useParams();
    const id = params.id;
    const [courierOpen, setCourierOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [cancelOpen, setCancelOpen] = useState(false)

    const { getSingleOrderQuery, onlyAdmin, markAsDelivered, permissions: { canView, canAdd, canEdit, canDelete } } = useOrders()
    const { data: orderResp, isLoading, error } = getSingleOrderQuery(id)
    const order = orderResp?.data || {}

    // console.log(order)

    if (isLoading) return <OrderSkeletonPage />
    if (error) return <p>Error: {error.message}</p>

    function isNewOrder() {
        return order?.status === 'New' || order?.status === 'Accepted' || order.status === 'Hold'
    }

    async function handleGetCourierId() {
        const { address, city, country, pincode } = order

        // if any of these is falsy, show an error
        if (!address || !city || !country || !pincode) {
            toast.error('Please complete the customer\'s address details before continue.')
            return
        }

        setCourierOpen(true)
    }

    const isAdmin = onlyAdmin();

    return (
        <InnerDashboardLayout>
            <div className="w-full flex items-center justify-between gap-4 mb-6">
                <h1 className="text-primary font-bold sm:text-xl lg:text-2xl">
                    View Order
                </h1>
                <div className="flex gap-2">
                    {!order?.abondonedOrder && !order?.shipmentId && isNewOrder() && canEdit &&
                        <UpdateStatus
                            order={order}
                            orderId={order?._id}
                            status={order?.status}
                        />
                    }

                    {isNewOrder() && !order?.abondonedOrder && canEdit &&
                        <LoaderButton
                            onClick={handleGetCourierId}
                            variant="outline"
                            className="gap-2"
                        >
                            <Car className="h-4 w-4" />
                            Delivery
                        </LoaderButton>
                    }

                    {/* track shipment button */}
                    {order?.scans?.length > 0 &&
                        <Link href={'#scan-section'}>
                            <Button variant="outline" className="gap-2" >
                                <Truck className="h-4 w-4" />
                            </Button>
                        </Link>
                    }

                    {/* <Button variant="outline" className="gap-2" >
                        <Download className="h-4 w-4" />
                        Download 
                    </Button> */}

                    <GSTBillDownloadV2 billData={order} />

                    {isNewOrder() && canEdit &&
                        <Button
                            onClick={() => setRejectOpen(true)}
                            variant="destructive"
                            className="gap-2">
                            Reject
                        </Button>
                    }
                    {(isNewOrder() || order.status == "Delivered") && !order?.returnData?.isReturnInitiated && isAdmin &&
                        <Button
                            onClick={() => setCancelOpen(true)}
                            variant="destructive"
                            className="gap-2">
                            Cancel
                        </Button>
                    }
                    {(order?.status === 'New' || order?.status === 'Accepted') && !order?.abondonedOrder && isAdmin &&
                        <Button
                            onClick={() => {
                                if (window.confirm("Are you sure you want to mark this order as Delivered manually?")) {
                                    markAsDelivered.mutateAsync({ orderId: order._id })
                                }
                            }}
                            variant="success"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                            disabled={markAsDelivered.isPending}
                        >
                            Mark Delivered
                        </Button>
                    }
                </div>

            </div>

            <div className='space-y-3'>
                {/* Upper Details */}
                <UpperDetailss order={order} admin={isAdmin} canEdit={canEdit} />

                {/* Order Timeline & Call Attempts */}
                <OrderTimeline order={order} />

                <PaymentDetails order={order} />
                <PersonalDetails order={order} canEdit={canEdit} />
                <ItemsTable
                    order={order}
                    isNewOrder={isNewOrder}
                    canEdit={canEdit}
                />

                {order?.returnData &&
                    <ReturnShippingDetails order={order} />
                }

                {order?.shipmentId &&
                    <ShippingDetails order={order} />
                }

                <Scans order={order} />
            </div>
            {
                courierOpen &&
                <CourierDialog
                    open={courierOpen}
                    onOpenChange={setCourierOpen}
                    order={order}
                />
            }
            <RejectDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                order={order}
            />
            <CancelDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                order={order}
            />
        </InnerDashboardLayout>
    )
}

export default page