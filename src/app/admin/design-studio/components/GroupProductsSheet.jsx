'use client'

import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useProducts } from '@/hooks/useProducts'
import { cn } from '@/lib/utils'
import { Loader2, Plus, X } from 'lucide-react'
import { Reorder } from 'framer-motion'
import { getPaginationRange } from '@/lib/services/getPaginationRange'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"

function GroupProductsSheet({ open, onOpenChange, group, onProductsAdd, updatingProducts, updateProductsError }) {
    const { productsPaginationQuery } = useProducts()

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(50)

    const [selectedProducts, setSelectedProducts] = useState([]) // ids
    const [visibleProducts, setVisibleProducts] = useState([]) // full product objects (orderable)

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const productsQuery = productsPaginationQuery({
        page: page,
        limit: limit,
        searchQuery: debouncedSearch,
        active: true
    })

    const allProducts = productsQuery.data?.products || []
    const totalPages = productsQuery.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    // normalize group products into objects when sheet opens
    useEffect(() => {
        if (!open) return
        const ids = (group?.products ?? []).map(p => (typeof p === 'string' ? p : (p._id || p)))
        setSelectedProducts(ids)

        const objs = ids.map(id => {
            const foundInGroup = (group?.products ?? []).find(p => typeof p === 'object' && p?._id === id)
            const foundInAll = allProducts.find(ap => (ap._id || ap) === id)
            return foundInGroup || foundInAll || { _id: id, fullName: `Product ID: ${id}`, images: [] }
        })
        setVisibleProducts(objs)
    }, [open, group])

    const isSelected = (productId) => selectedProducts.includes(productId)

    // Calculate discount percentage if regular price exists
    const discountPercentage = (product) => {
        const displayPrice = product?.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;
        if (product?.regularPrice && product.regularPrice > displayPrice) {
            return Math.round(((product.regularPrice - displayPrice) / product.regularPrice) * 100);
        }
        return 0;
    };

    const addProduct = (product) => {
        const id = product._id
        if (isSelected(id)) return
        setSelectedProducts(prev => [...prev, id])
        setVisibleProducts(prev => [...prev, product])
    }

    const removeProductById = (productId) => {
        setSelectedProducts(prev => prev.filter(id => id !== productId))
        setVisibleProducts(prev => prev.filter(p => (p._id || p) !== productId))
    }

    const handleSave = async () => {
        const data = {
            products: selectedProducts,
            groupId: group._id
        }
        try {
            await onProductsAdd(data)
            onOpenChange(false)
        } catch (err) {
            console.log(err)
        }
        if (updateProductsError) {
            console.log(updateProductsError)
        }
    }

    const isLoading = productsQuery.isLoading || productsQuery.isFetching

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[95vw] md:min-w-[90vw] overflow-hidden pb-1 flex flex-col items-start justify-start gap-0">
                <SheetHeader className="pb-0">
                    <SheetTitle>{group?.name || 'Group Products'}</SheetTitle>
                    <SheetDescription>Select and order products to display inside this group.</SheetDescription>
                </SheetHeader>

                <div className="px-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full pb-10 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/75 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-gray-600 text-sm font-medium">Loading products data, please wait...</p>
                        </div>
                    )}

                    {/* LEFT: Available products */}
                    <div className="border rounded-lg p-3 flex flex-col h-[85vh] bg-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Label className="min-w-0 flex-1">Search Products</Label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type to search..."
                                className="border rounded px-2 py-1 w-full md:w-2/3 text-sm bg-white"
                            />
                        </div>

                        <div className="flex-1 overflow-auto pr-1">
                            {allProducts.length === 0 && (
                                <p className="text-sm text-gray-500">No products found.</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {allProducts.map(product => {
                                    const id = product._id
                                    const selected = isSelected(id)
                                    return (
                                        <div
                                            key={id}
                                            className={cn(
                                                "flex gap-3 p-2 border rounded-md items-start bg-white",
                                                selected ? "border-2 border-blue-400" : "border-gray-200",
                                                product?.totalStock <= 0 ? "bg-gray-100 opacity-50 cursor-not-allowed" : "bg-white",
                                            )}
                                        >
                                            <img
                                                src={product.images?.[0] || '/not-found-img.webp'}
                                                alt={product.fullName}
                                                className="w-12 h-12 object-cover rounded shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold line-clamp-2">{product.fullName}</p>
                                                {/* <div className='flex items-center gap-2'> */}
                                                <p className="mt-1 text-[11px] font-semibold text-gray-700">
                                                    {product.sellingPrice && product.sellingPrice.length
                                                        ? (
                                                            <div className='flex items-center gap-1'>
                                                                <span>₹
                                                                    {product.sellingPrice[product.sellingPrice.length - 1].price}
                                                                </span>
                                                                {
                                                                    product?.regularPrice &&
                                                                    discountPercentage(product) > 0 &&

                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='line-through text-gray-500'>
                                                                            ₹{product.regularPrice}
                                                                        </span>

                                                                        <span className='text-[10px] font-semibold bg-green-600 text-white p-1 py-[.75] rounded-md'>
                                                                            {discountPercentage(product)}% OFF
                                                                        </span>

                                                                    </div>
                                                                }
                                                            </div>
                                                        )
                                                        : product.basePrice ?? 'N/A'}
                                                </p>
                                                <p className={`mt-1 text-[11px] font-semibold ${product?.totalStock > 0 ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                    {
                                                        product?.totalStock > 0
                                                            ? "Stock: " + product?.totalStock
                                                            : "Out of Stock"
                                                    }
                                                </p>
                                                {/* </div> */}
                                            </div>

                                            <div className="shrink-0 self-center">
                                                {!selected ? (
                                                    <button
                                                        onClick={() => addProduct(product)}
                                                        className="p-1 rounded-full border hover:bg-gray-100 bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Add product"
                                                        disabled={product?.totalStock <= 0}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded border border-blue-200">Added</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex w-full justify-end mt-3 gap-2 items-center border-t pt-2">
                            <Pagination className="inline justify-end mx-1 w-fit">
                                <PaginationContent>
                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p - 1); }} />
                                        </PaginationItem>
                                    )}

                                    {paginationRange.map((p, i) => (
                                        <PaginationItem key={i}>
                                            {p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    href="#"
                                                    isActive={p === page}
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setPage(p)
                                                    }}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }} />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>

                    {/* RIGHT: Selected products (orderable) */}
                    <div className="relative border rounded-lg p-3 flex flex-col h-[85vh] bg-gray-100">
                        <div className="absolute top-1 right-3">
                            <Button onClick={handleSave} disabled={updatingProducts}>
                                {updatingProducts ? <Loader2 className="animate-spin mr-2" /> : null}
                                Save Selection ({selectedProducts.length})
                            </Button>
                        </div>

                        <div className="mb-5">
                            <Label className="font-semibold">Selected Products (Drag to Reorder)</Label>
                        </div>

                        <div className="flex-1 overflow-auto pr-1">
                            {visibleProducts.length === 0 && (
                                <p className="text-sm text-gray-500 italic mt-4">No products selected yet.</p>
                            )}

                            <Reorder.Group axis="y" values={visibleProducts} onReorder={(items) => {
                                setVisibleProducts(items)
                                setSelectedProducts(items.map(it => it._id || it))
                            }} className="space-y-3">
                                {visibleProducts.map(product => {
                                    const id = product._id
                                    return (
                                        <Reorder.Item key={id} value={product} className="cursor-grab">
                                            <div className="flex gap-3 p-2 border rounded-md items-start bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <img
                                                    src={product.images?.[0] || '/not-found-img.webp'}
                                                    alt={product.fullName}
                                                    className="w-12 h-12 object-cover rounded shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold line-clamp-2 text-gray-900">{product.fullName}</p>
                                                    <div className='flex items-center gap-2'>
                                                        <p className="mt-1 text-[12px] font-semibold text-gray-700">
                                                            {product.sellingPrice && product.sellingPrice.length
                                                                ? (
                                                                    <div className='flex items-center gap-1'>
                                                                        <span>₹
                                                                            {product.sellingPrice[product.sellingPrice.length - 1].price}
                                                                        </span>
                                                                        {
                                                                            product?.regularPrice &&
                                                                            discountPercentage(product) > 0 &&

                                                                            <div className='flex items-center gap-2'>
                                                                                <span className='line-through text-gray-500'>
                                                                                    ₹{product.regularPrice}
                                                                                </span>

                                                                                <span className='text-[10px] font-semibold bg-green-600 text-white p-1 py-[.75] rounded-md'>
                                                                                    {discountPercentage(product)}% OFF
                                                                                </span>

                                                                            </div>
                                                                        }
                                                                    </div>
                                                                )
                                                                : product.regularPrice ?? 'N/A'}
                                                        </p>
                                                        <p className={`mt-1 text-[11px] font-semibold ${product?.totalStock > 0 ? "text-green-600" : "text-red-600"
                                                            }`}>
                                                            {
                                                                product?.totalStock > 0
                                                                    ? "Stock: " + product?.totalStock
                                                                    : "Out of Stock"
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 self-center">
                                                    <button
                                                        onClick={() => removeProductById(id)}
                                                        className="p-1 rounded-full border hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500"
                                                        title="Remove product"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    )
                                })}
                            </Reorder.Group>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default GroupProductsSheet
