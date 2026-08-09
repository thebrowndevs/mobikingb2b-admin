"use client"
import React, { useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import LoaderButton from "@/components/custom/LoaderButton"
import { useOrders } from "@/hooks/useOrders"

const FormSchema = z.object({
    subtotal: z.number(),
    deliveryCharge: z.number().optional().default(0),
    discount: z.number().optional().default(0),
    orderAmount: z.number(),
});

function OrderChargesDetailsDialog({ open, onOpenChange, user }) {
    const form = useForm({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            subtotal: Number(user?.subtotal) || 0,
            deliveryCharge: Number(user?.deliveryCharge) || 0,
            discount: Number(user?.discount) || 0,
            orderAmount: Number(user?.orderAmount) || 0,
        },
    });


    const { watch, setValue, handleSubmit } = form

    const discount = watch("discount")
    const deliveryCharge = watch("deliveryCharge")
    const subtotal = watch("subtotal")

    // 🔁 Update orderAmount when deliveryCharge or discount changes
    useEffect(() => {
        const parsedSubtotal = parseFloat(subtotal) || 0;
        const parsedDelivery = parseFloat(deliveryCharge) || 0;
        const parsedDiscount = parseFloat(discount) || 0;

        const updatedAmount = parsedSubtotal + parsedDelivery - parsedDiscount;
        setValue("orderAmount", updatedAmount >= 0 ? updatedAmount : 0);
    }, [discount, deliveryCharge, subtotal, setValue]);


    const { updateOrder } = useOrders()

    const onSubmit = async (values) => {
        try {
            await updateOrder.mutateAsync({
                id: user._id,
                data: values
            })
            onOpenChange(false)
        } catch (error) {
            console.error("Order update failed:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Order Details</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["subtotal", "orderAmount", "deliveryCharge", "discount"].map((fieldName) => (
                                <FormField
                                    key={fieldName}
                                    control={form.control}
                                    name={fieldName}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {fieldName
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={field.value ?? ""}
                                                    readOnly={["subtotal", "orderAmount"].includes(field.name)}
                                                    onChange={(e) => {
                                                        const val = e.target.valueAsNumber;
                                                        field.onChange(isNaN(val) ? 0 : val); // ensure it's a number
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>

                        <DialogFooter>
                            <LoaderButton loading={updateOrder.isPending} type="submit">
                                Save Changes
                            </LoaderButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default OrderChargesDetailsDialog