"use client"
import React, { useState } from "react"
import PCard from "@/components/custom/PCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Minus, Plus } from "lucide-react"
import MiniLoaderButton from "@/components/custom/MiniLoaderButton"
import { Button } from "@/components/ui/button"
import AddPosItemDialog from "./AddPosItem"

function PosItemsTable() {
    const [items, setItems] = useState([])
    const [addingItem, setAddingItem] = useState(false)

    return (
        <div className="w-full">
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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!items || items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <div className="w-full bg-gray-100 rounded py-10 flex items-center justify-center">
                                        No Items Added
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items?.map((item, idx) => {
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
                                            {image ?
                                                <img
                                                    src={image}
                                                    alt={'img'}
                                                    className="h-12 w-12 rounded-md object-cover border"
                                                />
                                                : <p>No Image</p>
                                            }
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <p className="font-medium text-sm text-wrap">{name}</p>
                                        </TableCell>
                                        <TableCell>{variant}</TableCell>
                                        <TableCell>{quantity}</TableCell>
                                        <TableCell>₹{sellingPrice}</TableCell>
                                        <TableCell>₹{totalPrice}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <MiniLoaderButton
                                                    variant={'outline'}
                                                >
                                                    <Plus className="cursor-pointer hover:text-green-600 transition-all duration-200 ease-in-out" />
                                                </MiniLoaderButton>

                                                <MiniLoaderButton
                                                    variant={'outline'}
                                                >
                                                    <Minus className="cursor-pointer hover:text-red-600 transition-all duration-200 ease-in-out" />
                                                </MiniLoaderButton>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                )
                            }))}
                    </TableBody>
                </Table>
            </div>
            <AddPosItemDialog
                open={addingItem}
                onOpenChange={setAddingItem}
                setItems={setItems}
            />
        </div>
    )
}

export default PosItemsTable
