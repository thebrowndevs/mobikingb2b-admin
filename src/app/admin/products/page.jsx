"use client"

import React, { useEffect, useState } from "react"
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout"
import { useProducts } from "@/hooks/useProducts"
import { useSubCategories } from "@/hooks/useSubCategories"
import Loader from "@/components/Loader"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CirclePlus } from "lucide-react"
import ProductsListView from "./components/ProductsTable"
import ProductDialog from "./components/ProductDialog"
import StockUpdate from "./components/StockUpdate"
import TableSkeleton from "@/components/custom/TableSkeleton"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { LayoutGroup, motion } from 'framer-motion';
import NotAuthorizedPage from "@/components/notAuthorized"
import { useBrands } from "@/hooks/useBrands"

const TABS = [
    { key: '', label: 'ALL PRODUCTS' },
    { key: 'fast', label: 'FAST MOVING PRODUCTS' },
    { key: 'slow', label: 'SLOW MOVING PRODUCTS' },
    { key: 'non', label: 'NON MOVING PRODUCTS' },
]

const FILTERS = [
    // { key: '_all_', label: 'ALL' },
    { key: 'InStock', label: 'In stock' },
    { key: 'OutOfStock', label: 'Out of stock' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Not Active' },
]

export default function page() {
    const [categoryFilter, setCategoryFilter] = useState()
    const [typeFilter, setTypeFilter] = useState('')
    const [activeTab, setActiveTab] = useState('')

    // debounce hook
    function useDebouncedValue(value, delay = 500) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            setPage(1)
            return () => clearTimeout(handler);
        }, [value, delay]);

        return debouncedValue;
    }
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebouncedValue(searchTerm, 500);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState();

    const [stockEditing, setStockEditing] = useState(false)
    const [selectedStockProduct, setSelectedStockProduct] = useState()

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    // console.log(selectedStockProduct)

    const {
        // productsQuery,
        productsPaginationQuery,
        createProduct: { mutateAsync: createProductAsync, isPending: creating, error: createError, reset: resetCreate },
        updateProduct: { mutateAsync: updateProductAsync, isPending: updating, error: updateError, reset: resetUpdate },
        permissions: { canView, canAdd, canDelete, canEdit },
    } = useProducts()

    const { subCategoriesQuery } = useSubCategories();
    const activeSubCategoriesQuery = subCategoriesQuery();
    const subCategories = activeSubCategoriesQuery.data?.data || [];

    const { brandsQuery } = useBrands();
    const brands = brandsQuery?.data?.data || [];

    // console.log(subCategories)
    const products = productsPaginationQuery({
        page: page,
        limit: limit,
        searchQuery: debouncedSearch,
        category: categoryFilter,
        type: activeTab,
        filterBy: typeFilter,
    })

    const allProducts = products.data?.products || []
    const totalPages = products.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    // open dialog to add new 
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        // resetDelete();
        setSelectedProduct(undefined);
        setIsDialogOpen(true);
    };

    const handleEditClick = (p) => {
        resetCreate();
        resetUpdate();
        // resetDelete();
        setSelectedProduct(p);
        setIsDialogOpen(true);
    };

    // console.log("Sub categories: ", subCategoriesQuery);

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            <div className="w-full flex flex-col gap-4 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-4xl">
                        Products
                    </h1>
                    {/* Add New */}
                    {canAdd &&
                        <Button onClick={handleAddClick}>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Add New
                        </Button>
                    }
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Total */}
                    <Button variant="outline">
                        Total: {allProducts.length}
                    </Button>

                    {/* Search Bar */}
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full flex-1 bg-white"
                    />

                    <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val === '__all__' ? undefined : val); setPage(1) }}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All Categories</SelectItem>
                            {subCategories?.map((n) => (
                                <SelectItem key={n._id} value={String(n._id)}>
                                    {n.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* filter by */}
                    <Select value={typeFilter} onValueChange={(val) => { setTypeFilter(val === '_aa_' ? undefined : val); setPage(1) }}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Filter By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_aa_">All</SelectItem>
                            {FILTERS?.map((n, idx) => (
                                <SelectItem key={idx} value={n.key}>
                                    {n.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <LayoutGroup>
                        <div className="flex gap-2 mb-0 overflow-x-auto bg-white scrollbar-hide relative">
                            {TABS.map(({ key, label }) => {
                                const isActive = activeTab === key
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setActiveTab(key)
                                            setPage(1);
                                            // setStatusFilter(null)
                                        }}
                                        className={`
            relative px-4 py-6 text-sm font-medium transition-all duration-300 flex gap-1 w-full min-w-fit items-center justify-center
            ${isActive ? 'font-bold text-black' : 'text-gray-600'}
          `}
                                    >
                                        <span>{label}</span>
                                        {/* <span>({counts[key]})</span> */}

                                        {isActive && (
                                            <motion.div
                                                layoutId="tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full"
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </LayoutGroup>
                    {/* Table */}
                    {(products.isLoading)
                        ? <TableSkeleton showHeader={false} />
                        : <>
                            <ProductsListView
                                error={productsPaginationQuery.error}
                                products={allProducts}
                                // onDelete={deleteAsync}
                                // isDeleting={isDeleting}
                                // deleteError={deleteError}
                                canDelete={canDelete}
                                canEdit={canEdit}
                                onEdit={handleEditClick}
                                setStockEditing={setStockEditing}
                                setSelectedProduct={setSelectedStockProduct}
                                onUpdate={updateProductAsync}

                            />
                        </>
                    }
                </div>

                <div className="flex w-full justify-end gap-2 items-center">
                    {/* Limit Dropdown */}
                    <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 5, 10, 20, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Pagination */}
                    <Pagination className={'inline justify-end mx-1 w-fit'}>
                        <PaginationContent>
                            {page > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} />
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
                                    <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>

                {
                    isDialogOpen &&
                    <ProductDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        selectedProduct={selectedProduct}
                        categories={subCategories}
                        brands={brands}
                        isSubmitting={creating || updating}
                        error={createError || updateError}
                        onCreate={createProductAsync}
                        onUpdate={updateProductAsync}
                    />
                }

                {
                    stockEditing &&
                    <StockUpdate
                        open={stockEditing}
                        onOpenChange={setStockEditing}
                        product={selectedStockProduct}
                    />
                }

            </div>
        </InnerDashboardLayout>
    )
}
