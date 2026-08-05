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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CourierDialog from './CourierDialog'

export default function ReturnDialog({ open, onOpenChange, order }) {
    const { returnOrder } = useOrders()
    const [courierDialogOpen, setCourierDialogOpen] = useState(false);
    const [customerNumber, setCustomerNumber] = useState('')
    const [numberError, setNumberError] = useState('')

    const handleReturn = async () => {
        if (!order?._id) return
        // console.log("Called")
        try {

            let response;

            if (!order.phoneNo && !customerNumber) {
                setNumberError("Please provide customer contact number.")
                return;
            }

            let payload = {
                orderId: order._id,
            }

            if (order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated) {
                return;
            }
            else if ( // Courier Assigned but Pickup not scheduled
                order?.returnData?.awb_code &&
                order?.returnData?.courier_name &&
                order?.returnData?.assigned_date_time?.date
            ) {
                response = await returnOrder.mutateAsync(
                    {
                        payload,
                        path: "/pickup/schedule"
                    }
                )
                // console.log("Return Pickup response: ", returnOrderPickup);

            }
            else if (order?.returnData?.order_id) { //Order created but courier not assigned

                setCourierDialogOpen(true);

            } else { //order not created on shiprocket yet

                if (!order.phoneNo && customerNumber) payload.phoneNo = customerNumber;
                response = await returnOrder.mutateAsync(
                    {
                        payload,
                        path: "/accept"
                    }
                )
            }

            // console.log("Return Order response: ", response);

            onOpenChange(false)
        } catch (error) {
            console.log("Return Error: ", error)
        }
    }

    // const handleReturn = () => {
    //     if (!order?._id) return
    //     try {

    //         if (!order.phoneNo) {
    //             if (!customerNumber) {
    //                 setNumberError("Please provide customer contact number.")
    //                 return;
    //             }
    //             returnOrder.mutateAsync({
    //                 orderId: order._id,
    //                 phoneNo: customerNumber
    //             })

    //         } else {
    //             returnOrder.mutateAsync({
    //                 orderId: order._id,
    //             })
    //         }

    //         onOpenChange(false)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {
                            (
                                !(order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated) &&
                                order?.returnData?.awb_code &&
                                order?.returnData?.courier_name &&
                                order?.returnData?.assigned_date_time?.date
                            ) ? "Return: Schedule Pickup Now?"
                                : order?.returnData?.order_id
                                    ? "Return: Assign Courier Now?"
                                    : "Return: Accept Request?"
                        }
                    </DialogTitle>
                    <div className="mt-2 space-y-1 text-sm">
                        <p><strong>System Order ID:</strong> {order?.orderId || '-'}</p>
                        {
                            order?.returnData?.order_id &&
                            <p><strong>Shiprocket Return Order ID:</strong> {order?.returnData?.orderId}</p>
                        }
                        {
                            order?.returnData?.courier_name &&
                            <p><strong>Return Courier Company Assigned:</strong> {order?.returnData?.courier_name}</p>
                        }
                        {
                            order?.returnData?.assigned_date_time?.date &&
                            <p><strong>Return Courier Assigned At:</strong> {order?.returnData?.assigned_date_time?.date}</p>
                        }
                        {
                            order?.returnData?.awb_code &&
                            <p><strong>Return AWB Code:</strong> {order?.returnData?.awb_code}</p>
                        }

                        <p><strong>Customer:</strong> {order?.name || '-'} ({order?.phoneNo || '-'})</p>
                        <p><strong>Total:</strong> ₹{order?.orderAmount?.toFixed(2) ?? '-'}</p>
                    </div>
                </DialogHeader>

                {/* Textarea for "Other" */}
                {!order.phoneNo && (
                    <div className="mt-3 space-y-1">
                        <Label htmlFor="customNumber" className={'mb-2'}>Enter Customer Contact Number</Label>
                        <Input
                            id="customNumber"
                            value={customerNumber}
                            onChange={(e) => setCustomerNumber(e.target.value)}
                        />
                        {numberError && <p className='text-red-600 text-sm'>{numberError}</p>}
                    </div>
                )}

                <DialogFooter className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={returnOrder.isLoading}
                    >
                        Cancel
                    </Button>
                    <LoaderButton
                        onClick={handleReturn}
                        loading={returnOrder.isPending}
                        disabled={
                            returnOrder.isPending
                        }
                    >
                        {
                            (
                                !(order?.returnData?.pickupScheduled || order?.returnData?.pickup_generated) &&
                                order?.returnData?.awb_code &&
                                order?.returnData?.courier_name &&
                                order?.returnData?.assigned_date_time?.date
                            ) ? "Schedule Pickup"
                                : order?.returnData?.order_id
                                    ? "Assign Courier"
                                    : "Accept"
                        }
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
            {
                courierDialogOpen && (order?.phoneNo || customerNumber) &&
                <CourierDialog
                    open={courierDialogOpen}
                    onOpenChange={setCourierDialogOpen}
                    order={order}
                    customerNumber={customerNumber}
                />
            }
        </Dialog>
    )
}
