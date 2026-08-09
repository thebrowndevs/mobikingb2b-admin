"use client"
import React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    phoneNo: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    address2: z.string().optional(),
    city: z.string(),
    pincode: z.string(),
    state: z.string(),
    country: z.string()
})

function PersonalDetailsDialog({ open, onOpenChange, user }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            phoneNo: user?.phoneNo || "",
            address: user?.address || "",
            address2: user?.address2 || "",
            city: user?.city || "",
            pincode: user?.pincode || "",
            state: user?.state || "",
            country: user?.country || ""
        }
    })

    const { updateOrder } = useOrders()

    const onSubmit = async (values) => {
        console.log("Updated Personal Details:", values)

        try {
            await updateOrder.mutateAsync({
                id: user._id,
                data: values
            })
            onOpenChange(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Personal Details</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["name", "email", "phoneNo", "address", "address2", "city", "pincode", "state", "country"].map((field) => (
                                <FormField
                                    key={field}
                                    control={form.control}
                                    name={field}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {field.name
                                                    .replace(/_/g, " ")
                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>

                        <DialogFooter>
                            <LoaderButton
                                loading={updateOrder.isPending}
                                type="submit">
                                Save Changes
                            </LoaderButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default PersonalDetailsDialog
