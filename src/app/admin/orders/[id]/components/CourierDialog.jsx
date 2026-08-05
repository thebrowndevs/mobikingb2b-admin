"use client"

import React, { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CourierCard from "./CourierCard"
import { getServiceability } from "@/lib/services/shiprocketService"
import LoaderButton from "@/components/custom/LoaderButton"
import { useOrders } from "@/hooks/useOrders"
import { useAuthStore } from "@/store/useAuthStore"
import { toast } from "react-hot-toast"

export default function CourierDialog({ open, onOpenChange, order }) {
    const { acceptOrder } = useOrders()
    const { accessToken } = useAuthStore()

    const [courierData, setCourierData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedCourier, setSelectedCourier] = useState(null)
    const [reason, setReason] = useState('')
    const [formValues, setFormValues] = useState({
        pickup_postcode: "110065",
        // pickup_postcode: "201206",
        delivery_postcode: order.pincode || "",
        cod: order.method === "COD" ? 1 : 0,
        weight: 0.5,
        length: 10,
        breadth: 10,
        height: 5,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    const handleGetCourierId = async () => {
        setLoading(true)
        try {
            const res = await getServiceability({
                pickup_postcode: Number(formValues.pickup_postcode),
                delivery_postcode: Number(formValues.delivery_postcode),
                cod: Number(formValues.cod),
                weight: Number(formValues.weight),
                is_recommendation_enabled: 1
            }, accessToken)
            console.log(res?.data)

            if (!res.data.data) {
                console.log(res.data.message)
            }
            setCourierData(res?.data?.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setCourierData(null);
    }, [onOpenChange])

    const list = courierData?.available_courier_companies || []

    async function handlePlaceShiprocketOrder() {
        if (!selectedCourier) {
            toast.error("Please select a courier company.")
            return
        }

        try {
            await acceptOrder.mutateAsync({
                orderId: order._id,
                courierId: selectedCourier,
                reason: reason
            })
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to accept order:", error)
        }
    }

    // console.log(courierData)
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] min-h-[50vh] max-h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        Choose Courier for {order.name} — ₹{order.orderAmount} ({order.method})
                    </DialogTitle>
                </DialogHeader>

                {!courierData ? (
                    <div className="space-y-4">
                        <form className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium">Pickup Pincode</label>
                                <Input
                                    name="pickup_postcode"
                                    value={formValues.pickup_postcode}
                                    onChange={handleChange}
                                // readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Delivery Pincode</label>
                                <Input
                                    name="delivery_postcode"
                                    value={formValues.delivery_postcode}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">COD</label>
                                <Input
                                    name="cod"
                                    value={formValues.cod}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Weight (Kg)</label>
                                <Input
                                    name="weight"
                                    type="number"
                                    value={formValues.weight}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Length (cm)</label>
                                <Input
                                    name="length"
                                    type="number"
                                    value={formValues.length}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Breadth (cm)</label>
                                <Input
                                    name="breadth"
                                    type="number"
                                    value={formValues.breadth}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Height (cm)</label>
                                <Input
                                    name="height"
                                    type="number"
                                    value={formValues.height}
                                    onChange={handleChange}
                                />
                            </div>
                        </form>
                        <DialogFooter>
                            <LoaderButton
                                onClick={handleGetCourierId}
                                loading={loading}
                            >
                                {loading ? "Loading..." : "Fetch Couriers"}
                            </LoaderButton>
                        </DialogFooter>
                    </div>
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

                {courierData &&
                    <div className="flex flex-col gap-4 mt-2 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shipping Reason (Optional)
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                placeholder="Enter reason for shipping..."
                                rows={2}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end items-center">
                            <LoaderButton
                                onClick={handlePlaceShiprocketOrder}
                                loading={acceptOrder.isPending}
                                className={'w-fit'}>
                                Place Order on Shiprocket
                            </LoaderButton>
                        </div>
                    </div>
                }
            </DialogContent>
        </Dialog>
    )
}
