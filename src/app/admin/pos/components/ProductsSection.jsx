import React from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import ProductGrid from './ProductGrid'

export default function ProductsSection({
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    subCategories,
    FILTERS,
    loading,
    allProducts,
    setAddedProducts,
    onAddItem,
    cartItems,
    limit,
    setLimit,
    page,
    setPage,
    totalPages,
    paginationRange
}) {
    return (
        <div className="h-full bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
                <h2 className="font-bold text-base text-slate-800 uppercase tracking-wide">Products List</h2>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-white border-slate-200 h-8 rounded-lg text-xs"
                    />

                    <div className="flex gap-2">
                        <Select value={categoryFilter || '__all__'} onValueChange={(val) => {
                            setCategoryFilter(val === '__all__' ? undefined : val)
                            setPage(1)
                        }}>
                            <SelectTrigger className="w-[120px] border-slate-200 h-8 rounded-lg text-xs">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                <SelectItem value="__all__" className="text-xs">All Categories</SelectItem>
                                {subCategories?.map((n) => (
                                    <SelectItem key={n._id} value={String(n._id)} className="text-xs">
                                        {n.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter || '_aa_'} onValueChange={(val) => {
                            setTypeFilter(val === '_aa_' ? undefined : val)
                            setPage(1)
                        }}>
                            <SelectTrigger className="w-[110px] border-slate-200 h-8 rounded-lg text-xs">
                                <SelectValue placeholder="Filter By" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                <SelectItem value="_aa_" className="text-xs">All</SelectItem>
                                {FILTERS?.map((n, idx) => (
                                    <SelectItem key={idx} value={n.key} className="text-xs">
                                        {n.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Scrollable Grid Container */}
                <div className="max-h-[500px] overflow-y-auto pr-1">
                    <ProductGrid
                        loading={loading}
                        allProducts={allProducts}
                        setAddedProducts={setAddedProducts}
                        onAddItem={onAddItem}
                        cartItems={cartItems}
                    />
                </div>
            </div>

            <div className="flex w-full justify-between items-center pt-3 border-t border-slate-50 mt-3 flex-shrink-0">
                <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                    <SelectTrigger className="w-[95px] border-slate-200 h-8 rounded-lg text-[10px] font-semibold">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 5, 10, 20, 50].map((n) => (
                            <SelectItem key={n} value={String(n)} className="text-xs">
                                {n} / page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Pagination className={'inline justify-end mx-1 w-fit'}>
                    <PaginationContent>
                        {page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} className="h-8 text-xs" />
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
                                        className="h-8 w-8 text-xs"
                                    >
                                        {p}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} className="h-8 text-xs" />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
