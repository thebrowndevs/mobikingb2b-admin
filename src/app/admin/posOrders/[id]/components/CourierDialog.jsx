"use client"

import React, { useState } from "react"
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
import { shiprocketLogin } from "@/lib/services/shiprocketLogin"
import { getCouriersList } from "@/lib/services/getCouriersList"
import LoaderButton from "@/components/custom/LoaderButton"
import { useOrders } from "@/hooks/useOrders"

export default function CourierDialog({ open, onOpenChange, order }) {
    const { acceptOrder } = useOrders()

    const [courierData, setCourierData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedCourier, setSelectedCourier] = useState(null)
    const [formValues, setFormValues] = useState({
        pickup_postcode: "201206",
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
            const loginData = await shiprocketLogin()
            const res = await getCouriersList({
                token: loginData?.token,
                data: formValues,
            })
            //   console.log(res?.data)

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

    const list = courierData?.available_courier_companies || []

    async function handlePlaceShiprocketOrder() {

        try {
            acceptOrder.mutateAsync({
                orderId: order._id,
                courierId: selectedCourier
            })
            if(acceptOrder.isSuccess){
                onOpenChange(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    console.log(courierData)
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
                                    readOnly
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
                    <div className="flex justify-end items-center">
                        <LoaderButton
                            onClick={handlePlaceShiprocketOrder}
                            loading={acceptOrder.isPending}
                            className={'w-fit'}>
                            Place Order on Shiprocket
                        </LoaderButton>
                    </div>
                }
            </DialogContent>
        </Dialog>
    )
}
