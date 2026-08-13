"use client"

import React, { useEffect, useState } from "react"
import { useForm, useFieldArray, useWatch, useFormContext } from "react-hook-form"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUsers } from "@/hooks/useUsers"
import { useProducts } from "@/hooks/useProducts"
import { useOrders } from "@/hooks/useOrders"
import LoaderButton from "./custom/LoaderButton"
import UserDialog from "@/app/admin/customers/components/UserDialog"

// Single row for each item
function OrderItemRow({ index, allProducts, onRemove }) {
    const { control, getValues, setValue } = useFormContext()
    const productId = useWatch({ control, name: `items.${index}.productId` })
    const quantity = useWatch({ control, name: `items.${index}.quantity` })

    const selected = allProducts.find((p) => p._id === productId)
    const variants = selected ? Object.keys(selected.variants || {}) : []
    const unitPrice = selected?.sellingPrice?.slice(-1)[0]?.price || 0

    // reset variant when product changes
    useEffect(() => {
        const cur = getValues(`items.${index}.variantName`)
        if (cur && !variants.includes(cur)) setValue(`items.${index}.variantName`, "")
    }, [productId, variants, getValues, setValue, index])

    // sync unitPrice
    useEffect(() => {
        if (getValues(`items.${index}.unitPrice`) !== unitPrice) {
            setValue(`items.${index}.unitPrice`, unitPrice)
        }
    }, [unitPrice, getValues, setValue, index])

    // sync total
    useEffect(() => {
        const total = unitPrice * (quantity || 0)
        if (getValues(`items.${index}.price`) !== total) {
            setValue(`items.${index}.price`, total)
        }
    }, [quantity, unitPrice, getValues, setValue, index])

    return (
        <div className="grid grid-cols-6 gap-4 items-end">
            <FormField control={control} name={`items.${index}.productId`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Product</FormLabel>
                    <FormControl>
                        <select {...field} className="w-full border rounded px-2 py-1">
                            <option value="">Select…</option>
                            {allProducts.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={control} name={`items.${index}.variantName`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <FormControl>
                        <select {...field} disabled={!productId} className="w-full border rounded px-2 py-1">
                            <option value="">Select variant…</option>
                            {variants.map((v) => (<option key={v} value={v}>{v}</option>))}
                        </select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={control} name={`items.${index}.quantity`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                        <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={control} name={`items.${index}.unitPrice`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl><Input type="number" {...field} disabled /></FormControl>
                </FormItem>
            )} />

            <FormField control={control} name={`items.${index}.price`} render={({ field }) => (
                <FormItem>
                    <FormLabel>Total</FormLabel>
                    <FormControl><Input type="number" {...field} disabled /></FormControl>
                </FormItem>
            )} />

            <Button variant="destructive" size="icon" type="button" onClick={onRemove}>&times;</Button>
        </div>
    )
}

export default function POS({ children }) {
    const { createPosOrder } = useOrders()
    const { usersQuery } = useUsers()
    const allUsers = usersQuery("user")?.data?.data || []
    const { productsQuery } = useProducts()
    const allProducts = productsQuery?.data?.data || []

    const [addUserDialog, setAddUserDialog] = useState(false)

    const form = useForm({
        defaultValues: {
            userId: "",
            name: "",
            phoneNo: "",
            gst: "",
            method: "COD",
            orderAmount: 0,
            subtotal: 0,
            items: [{ productId: "", variantName: "", quantity: 1, unitPrice: 0, price: 0 }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
    const items = useWatch({ control: form.control, name: "items" })

    // recalc order amount
    useEffect(() => {
        const sum = items.reduce((a, i) => a + (i.price || 0), 0)
        if (form.getValues("orderAmount") !== sum) form.setValue("orderAmount", sum)
        if (form.getValues("subtotal") !== sum) form.setValue("subtotal", sum)
    }, [items, form])

    // phoneNo lookup
    const [phoneQuery, setPhoneQuery] = useState("")
    const [suggestions, setSuggestions] = useState([])
    useEffect(() => {
        setSuggestions(
            phoneQuery
                ? allUsers.filter((u) => u.phoneNo.includes(phoneQuery.trim()))
                : []
        )
    }, [phoneQuery, allUsers])

    const onPhoneSelect = (u) => {
        form.setValue("userId", u._id)
        form.setValue("name", u.name)
        form.setValue("phoneNo", u.phoneNo)
        setSuggestions([])
    }

    const onSubmit = form.handleSubmit(async (data) => {

        const finalData = {
            subtotal: data.orderAmount,
            gst: 'GSIN1233',
            ...data,
        }

        console.log("POS Order Data:", finalData)


        try {
            await createPosOrder.mutateAsync(finalData)
        } catch (error) {

        }
        // API call
    })

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-3xl overflow-auto max-h-[90vh]">
                <DialogHeader><DialogTitle>Create POS Order</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-6">

                        <FormField control={form.control} name="phoneNo" render={({ field }) => (
                            <FormItem className="relative">
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Start typing phone…" {...field} onChange={(e) => { field.onChange(e); setPhoneQuery(e.target.value) }} />
                                </FormControl>
                                <FormMessage />
                                {suggestions.length > 0 && (
                                    <ul className="absolute z-10 bg-white border w-full mt-14 max-h-40 overflow-auto">
                                        {suggestions.map((u) => (
                                            <li key={u._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => onPhoneSelect(u)}>
                                                {u.phoneNo} — {u.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </FormItem>
                        )} />

                        <Button variant="outline" type="button" onClick={() => { setAddUserDialog(true) }}>+ Add User</Button>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder="Customer name" /></FormControl><FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="orderAmount" render={({ field }) => (
                                <FormItem><FormLabel>Order Amount</FormLabel><FormControl><Input type="number" {...field} disabled /></FormControl></FormItem>
                            )} />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Order Items</h3>
                            {fields.map((item, i) => (
                                <OrderItemRow key={item.id} index={i} allProducts={allProducts} onRemove={() => remove(i)} />
                            ))}
                            <Button variant="outline" type="button" onClick={() => append({ productId: "", variantName: "", quantity: 1, unitPrice: 0, price: 0 })}>
                                + Add Item
                            </Button>
                        </div>

                        <DialogFooter className="pt-6">
                            <LoaderButton
                                loading={createPosOrder.isPending}
                                disabled={createPosOrder.isPending}
                                type="submit"
                            >
                                Create Order
                            </LoaderButton>
                        </DialogFooter>
                    </form>
                </Form>
                <UserDialog
                    open={addUserDialog}
                    onOpenChange={setAddUserDialog}
                />
            </DialogContent>
        </Dialog>
    )
}
