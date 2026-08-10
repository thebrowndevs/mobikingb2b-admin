"use client"
import React, { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useProducts } from '@/hooks/useProducts'
import LoaderButton from '@/components/custom/LoaderButton'

function AddPosItemDialog({ open, onOpenChange, setItems }) {
    const { productsQuery } = useProducts()
    const allProducts = productsQuery?.data?.data || []

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState("")

    const filtered = useMemo(() => {
        if (!searchTerm) return []
        const term = searchTerm.toLowerCase()
        return allProducts.filter(p =>
            (p.fullName || p.name).toLowerCase().includes(term)
        )
    }, [searchTerm, allProducts])

    async function handleAddProduct() {
        const price = selectedProduct.sellingPrice[selectedProduct.sellingPrice.length - 1].price
        const data = {
            productId: selectedProduct._id,
            variantName: selectedVariant,
            quantity: 1,
            price: price
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl w-full">
                <DialogHeader>
                    <DialogTitle>Add Items</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search Bar */}
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => {
                            setSearchTerm(e.target.value)
                            setSelectedProduct(null)
                            setSelectedVariant("")
                        }}
                    />

                    {/* Product List */}
                    {filtered.length > 0 && !selectedProduct && (
                        <div className="max-h-80 overflow-y-auto border rounded-md p-2">
                            {filtered.map(prod => (
                                <div
                                    key={prod._id}
                                    className="flex items-center space-x-4 p-2 hover:bg-muted cursor-pointer"
                                    onClick={() => setSelectedProduct(prod)}
                                >
                                    <img
                                        src={prod.images?.[0]}
                                        alt={prod.fullName}
                                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate  max-w-[450px] text-wrap">{prod.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate space-x-1">
                                            Variants: {" "}
                                            {Object.keys(prod?.variants || {}).map(v => (
                                                <span key={v} value={v}>
                                                    {v} ({prod.variants[v]})
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Variant Selector */}
                    {selectedProduct && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">Selected Product:</p>
                                <button
                                    className="text-sm text-red-500 underline"
                                    onClick={() => {
                                        setSelectedProduct(null)
                                        setSelectedVariant("")
                                    }}
                                >
                                    Change
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <img
                                    src={selectedProduct.images?.[0]}
                                    alt={selectedProduct.fullName}
                                    className="h-16 w-16 rounded object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium line-clamp-2 max-w-[350px] text-wrap">{selectedProduct.fullName}</p>
                                    <label className="block text-sm text-gray-600 mt-1">Choose variant:</label>
                                    <select
                                        className="mt-1 w-full border rounded p-2"
                                        value={selectedVariant}
                                        onChange={e => setSelectedVariant(e.target.value)}
                                    >
                                        <option value="">-- select --</option>
                                        {Object.keys(selectedProduct.variants || {}).map(v => (
                                            <option key={v} value={v}>
                                                {v} ({selectedProduct.variants[v]} in stock)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <LoaderButton
                        onClick={() => handleAddProduct()}
                    >
                        Add Item
                    </LoaderButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddPosItemDialog
