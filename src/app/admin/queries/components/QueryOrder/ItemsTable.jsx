import React, { useState } from "react"
import PCard from "@/components/custom/PCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function ItemsTable({ order }) {
    const items = order?.items || []

    return (
        <PCard className="p-4">
            <div className="flex items-center justify-between w-full">
                <h2 className="mb-4 text-lg font-semibold text-gray-700">Items</h2>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Selling Price</TableHead>
                            <TableHead>Total Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, idx) => {
                            const product = item.productId
                            const image = product?.images?.[0]
                            const name = product?.fullName || product?.name
                            const variant = item.variantName
                            const quantity = item.quantity
                            const sellingPrice = item.price
                            const totalPrice = sellingPrice * quantity

                            return (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <img
                                            src={image}
                                            alt={name}
                                            className="h-12 w-12 rounded-md object-cover border"
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 font-medium text-sm text-wrap">
                                                <span>{name}</span>
                                                {item?.isScratchy && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                                        Scratchy
                                                    </span>
                                                )}
                                            </div>
                                            {item?.returnStatus && (
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-200">
                                                        {item.returnStatus}
                                                    </span>
                                                    {item.returnQuantity > 0 && (
                                                        <span className="text-gray-500 text-[10px] font-medium bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                                                            Returned Qty: {item.returnQuantity}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{variant}</TableCell>
                                    <TableCell>{quantity}</TableCell>
                                    <TableCell>₹{sellingPrice}</TableCell>
                                    <TableCell>₹{totalPrice}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>

                {/* Summary */}
                <div className="flex flex-col sm:flex-row flex-wrap justify-end gap-3 mt-6">
                    <div className="flex items-center justify-between sm:min-w-[250px] border rounded-md p-3 shadow-sm bg-muted/50">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{order.subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between sm:min-w-[250px] border rounded-md p-3 shadow-sm bg-muted/50">
                        <span className="text-sm text-gray-600">Delivery Charges:</span>
                        <span className="font-medium">₹{order.deliveryCharge}</span>
                    </div>
                    <div className="flex items-center justify-between sm:min-w-[250px] border rounded-md p-3 shadow bg-primary/10">
                        <span className="text-sm font-semibold text-primary">Total Amount:</span>
                        <span className="font-bold text-primary">₹{order.orderAmount}</span>
                    </div>
                </div>
            </div>
        </PCard>
    )
}

export default ItemsTable
