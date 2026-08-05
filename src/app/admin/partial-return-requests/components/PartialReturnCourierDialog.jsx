"use client"

import React, { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import CourierCard from "@/app/admin/return-requests/components/CourierCard"
import LoaderButton from "@/components/custom/LoaderButton"
import { usePartialReturnRequests } from "@/hooks/usePartialReturnRequests"
import Loader from "@/components/Loader"
import { getServiceability } from "@/lib/services/shiprocketService"
import { useAuthStore } from "@/store/useAuthStore"

export default function PartialReturnCourierDialog({ open, onOpenChange, order }) {
    const { assignCourier } = usePartialReturnRequests()
    const { accessToken } = useAuthStore()

    const [courierData, setCourierData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedCourier, setSelectedCourier] = useState(null)

    const handleGetCourierId = async () => {
        setLoading(true)
        try {
            let payload = {
                is_return: 1
            }
            const shiprocketOrderId = order?.shiprocketOrderId;
            if (shiprocketOrderId) {
                payload.order_id = shiprocketOrderId
            } else {
                return;
            }
            const res = await getServiceability(payload, accessToken)
            if (!res?.data?.data) {
                console.log(res?.data?.message)
            }
            setCourierData(res?.data?.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (order && open) handleGetCourierId();
    }, [open, order])

    useEffect(() => {
        if (!open) {
            setCourierData(null);
            setSelectedCourier(null);
        }
    }, [open])

    const list = courierData?.available_courier_companies || []

    async function handlePlaceShiprocketOrder() {
        if (!selectedCourier || !order?._id) return;
        try {
            await assignCourier.mutateAsync({
                orderId: order._id,
                courierId: selectedCourier
            })
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }

    if (loading && open)
        return <Loader />

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] min-h-[50vh] max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        Choose Return Courier for {order?.name || "Customer"} — ₹{order?.orderAmount || order?.totalAmount} ({order?.method})
                    </DialogTitle>
                </DialogHeader>

                {!courierData ? (
                    <Loader />
                ) : (
                    <div className="mt-4">
                        {list.length > 0 ? (
                            list.map((c) => (
                                <CourierCard
                                    key={c.courier_company_id}
                                    courier={c}
                                    selectedCourier={selectedCourier}
                                    setSelectedCourier={setSelectedCourier}
                                />
                            ))
                        ) : (
                            <p className="text-center text-sm text-muted-foreground">
                                No couriers available for these details.
                            </p>
                        )}
                    </div>
                )}

                {courierData && (
                    <div className="flex justify-end items-center mt-4">
                        <LoaderButton
                            onClick={handlePlaceShiprocketOrder}
                            loading={assignCourier.isPending}
                            disabled={!selectedCourier}
                            className="w-fit"
                        >
                            Assign Courier on Shiprocket Return Order
                        </LoaderButton>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
