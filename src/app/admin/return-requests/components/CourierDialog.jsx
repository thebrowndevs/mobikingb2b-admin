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
import { shiprocketLogin } from "@/lib/services/shiprocketLogin"
import { getCouriersList } from "@/lib/services/getCouriersList"
import LoaderButton from "@/components/custom/LoaderButton"
import { useOrders } from "@/hooks/useOrders"
import Loader from "@/components/Loader"
import { getServiceability } from "@/lib/services/shiprocketService"
import { useAuthStore } from "@/store/useAuthStore"

export default function CourierDialog({ open, onOpenChange, order, customerNumber }) {
    const { returnOrder } = useOrders()
    const { accessToken } = useAuthStore()

    const [courierData, setCourierData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedCourier, setSelectedCourier] = useState(null)
    const [formValues, setFormValues] = useState({
        pickup_postcode: order.pincode || "",
        // pickup_postcode: "201206",
        delivery_postcode: "110065",
        cod: order.method === "COD" ? 1 : 0,
        weight: 0.5,
        length: 10,
        breadth: 10,
        height: 5,
    })

    // console.log(order?.returnData)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    // const handleGetCourierId = async () => {
    //     setLoading(true)
    //     // console.log("Called")
    //     try {
    //         const loginData = await shiprocketLogin();
    //         // console.log("Order: ",order);
    //         let payload = {
    //             is_return: 1
    //         }
    //         if (order?.returnData?.order_id) {
    //             payload.order_id = order?.returnData?.order_id
    //         }
    //         else {
    //             return;
    //         }

    //         // console.log(formValues)
    //         const res = await getCouriersList({
    //             token: loginData?.token,
    //             data: payload,
    //         })
    //         //   console.log(res?.data)

    //         if (!res.data.data) {
    //             console.log(res.data.message)
    //         }
    //         setCourierData(res?.data?.data)
    //     } catch (error) {
    //         console.error(error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // useEffect(() => {
    //     if (order) handleGetCourierId();
    // }, [order, customerNumber])

    // useEffect(() => {
    //     setCourierData(null);
    // }, [onOpenChange])

    // const list = courierData?.available_courier_companies || []

    const handleGetCourierId = async () => {
        setLoading(true)
        try {
            let payload = {
                is_return: 1
            }
            if (order?.returnData?.order_id) {
                payload.order_id = order?.returnData?.order_id
            }
            else {
                return;
            }
            // {
            //     pickup_postcode: Number(formValues.pickup_postcode),
            //     delivery_postcode: Number(formValues.delivery_postcode),
            //     cod: Number(formValues.cod),
            //     weight: Number(formValues.weight),
            //     is_recommendation_enabled: 1,
            //     is_return: 1,
            //     order_id: order?.returnData?.order_id
            // }
            const res = await getServiceability(payload, accessToken)
            // console.log(res?.data)

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
        if (order) handleGetCourierId();
    }, [onOpenChange, order])

    useEffect(() => {
        setCourierData(null);
    }, [onOpenChange])



    const list = courierData?.available_courier_companies || []

    async function handlePlaceShiprocketOrder() {

        // console.log("Selected Courier: ", selectedCourier);
        // return;

        try {
            const returnCourierAssigneddOrder = await returnOrder.mutateAsync(
                {
                    payload: {
                        orderId: order._id,
                        courierId: selectedCourier
                    },
                    path: "/courier/assign"
                }
            )
            // console.log("Courier Assign response: ", returnCourierAssigneddOrder);
            if (returnOrder.isSuccess) {
                onOpenChange(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (loading)
        return <Loader />

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
                    <Loader />
                    // <div className="space-y-4">
                    //     <form className="grid grid-cols-2 gap-3">
                    //         <div>
                    //             <label className="block text-sm font-medium">Pickup Pincode</label>
                    //             <Input
                    //                 name="pickup_postcode"
                    //                 value={formValues.pickup_postcode}
                    //                 onChange={handleChange}
                    //             // readOnly
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">Delivery Pincode</label>
                    //             <Input
                    //                 name="delivery_postcode"
                    //                 value={formValues.delivery_postcode}
                    //                 onChange={handleChange}
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">COD</label>
                    //             <Input
                    //                 name="cod"
                    //                 value={formValues.cod}
                    //                 readOnly
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">Weight (Kg)</label>
                    //             <Input
                    //                 name="weight"
                    //                 type="number"
                    //                 value={formValues.weight}
                    //                 onChange={handleChange}
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">Length (cm)</label>
                    //             <Input
                    //                 name="length"
                    //                 type="number"
                    //                 value={formValues.length}
                    //                 onChange={handleChange}
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">Breadth (cm)</label>
                    //             <Input
                    //                 name="breadth"
                    //                 type="number"
                    //                 value={formValues.breadth}
                    //                 onChange={handleChange}
                    //             />
                    //         </div>
                    //         <div>
                    //             <label className="block text-sm font-medium">Height (cm)</label>
                    //             <Input
                    //                 name="height"
                    //                 type="number"
                    //                 value={formValues.height}
                    //                 onChange={handleChange}
                    //             />
                    //         </div>
                    //     </form>
                    //     <DialogFooter>
                    //         <LoaderButton
                    //             onClick={handleGetCourierId}
                    //             loading={loading}
                    //         >
                    //             {loading ? "Loading..." : "Fetch Couriers"}
                    //         </LoaderButton>
                    //     </DialogFooter>
                    // </div>
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
                            loading={returnOrder.isPending}
                            className={'w-fit'}>
                            Assign Courier on Shiprocket Return Order
                        </LoaderButton>
                    </div>
                }
            </DialogContent>
        </Dialog>
    )
}