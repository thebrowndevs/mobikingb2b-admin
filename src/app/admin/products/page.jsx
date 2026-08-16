"use client"

import React, { useEffect, useState } from "react"
import { CirclePlus, Search, Filter, X, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useSubCategories } from "@/hooks/useSubCategories";
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ProductsListView from "./components/ProductsTable";
import TableSkeleton from "@/components/custom/TableSkeleton";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/services/getPaginationRange";
import { LayoutGroup } from 'framer-motion';
import NotAuthorizedPage from "@/components/notAuthorized";
import StockUpdate from "./components/StockUpdate";
import ProductDetailsDrawer from "./components/ProductDetailsDrawer";
import ProductBulkUploadDialog from "./components/ProductBulkUploadDialog";

const TABS = [
    { key: '', label: 'ALL PRODUCTS' },
    { key: 'fast', label: 'FAST' },
    { key: 'slow', label: 'SLOW' },
    { key: 'non', label: 'NON-MOVING' },
]

const FILTERS = [
    { key: 'InStock', label: 'In stock' },
    { key: 'OutOfStock', label: 'Out of stock' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Not Active' },
]

export default function Page() {
    const router = useRouter();
    const [categoryFilter, setCategoryFilter] = useState();
    const [typeFilter, setTypeFilter] = useState('');
    const [activeTab, setActiveTab] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedViewProductId, setSelectedViewProductId] = useState(null);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

    const [stockEditing, setStockEditing] = useState(false);
    const [selectedStockProductId, setSelectedStockProductId] = useState(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const {
        productsPaginationQuery,
        permissions: { canView, canAdd, canDelete, canEdit },
    } = useProducts();

    const { subCategoriesQuery } = useSubCategories();
    const activeSubCategoriesQuery = subCategoriesQuery();
    const subCategories = activeSubCategoriesQuery.data?.data || [];

    const products = productsPaginationQuery({
        page: page,
        limit: limit,
        searchQuery: debouncedSearch,
        category: categoryFilter,
        type: activeTab,
        filterBy: typeFilter,
    });

    const allProducts = products.data?.products || [];
    const totalPages = products.data?.pagination?.totalPages || 1;
    const paginationRange = getPaginationRange(page, totalPages);

    const handleAddClick = () => {
        router.push("/admin/products/add");
    };

    const handleEditClick = (p) => {
        router.push(`/admin/products/${p._id}`);
    };

    const handleViewDetails = (id) => {
        setSelectedViewProductId(id);
        setViewDrawerOpen(true);
    };

    const handleReset = () => {
        setSearchTerm('');
        setCategoryFilter(undefined);
        setTypeFilter('');
        setActiveTab('');
        setPage(1);
    };

    if (!canView) return <NotAuthorizedPage />;

    const isFiltered = searchTerm || categoryFilter || typeFilter || activeTab;

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Products</h1>
                <p className="text-sm text-slate-500 font-medium">Manage B2B inventory items, slabs wholesale pricing, and variants specifications</p>
            </div>

            <div className="space-y-4">
                {/* Control bar */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 mt-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search products by title or sku..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 text-sm bg-back2 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="w-[160px] shrink-0">
                            <Select
                                value={categoryFilter || "all"}
                                onValueChange={(val) => {
                                    setCategoryFilter(val === 'all' ? undefined : val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="Category" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {subCategories?.map((n) => (
                                        <SelectItem key={n._id} value={String(n._id)}>
                                            {n.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filters Dropdown */}
                        <div className="w-[160px] shrink-0">
                            <Select
                                value={typeFilter || "all"}
                                onValueChange={(val) => {
                                    setTypeFilter(val === 'all' ? '' : val);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="Stock Filters" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                    <SelectItem value="all">All Items</SelectItem>
                                    {FILTERS?.map((n, idx) => (
                                        <SelectItem key={idx} value={n.key}>
                                            {n.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-9 text-xs text-slate-500 hover:text-slate-900 gap-1.5 shrink-0 bg-transparent hover:bg-slate-100/50 shadow-none border-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="shrink-0 bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold text-xs h-9"
                            disabled
                        >
                            Total: {products.data?.pagination?.totalProducts || 0}
                        </Button>
                        {canAdd && (
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    onClick={() => setBulkUploadOpen(true)}
                                    variant="outline"
                                    className="shrink-0 bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold text-xs h-9 gap-1.5"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                                    Bulk Upload
                                </Button>
                                <Button
                                    onClick={handleAddClick}
                                    className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                                >
                                    <CirclePlus className="mr-1.5 h-4 w-4" /> Add New
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mb-2 overflow-x-auto bg-back2 border border-bdr2 p-1 rounded-xl scrollbar-hide w-fit">
                    {TABS.map(({ key, label }) => {
                        const isActive = activeTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setActiveTab(key);
                                    setPage(1);
                                }}
                                className={`
                                    relative px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 rounded-lg flex items-center justify-center shrink-0
                                    ${isActive ? 'bg-white text-indigo-600 shadow-sm border border-bdr2' : 'text-slate-500 hover:text-slate-800'}
                                `}
                            >
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                {products.isLoading ? (
                    <TableSkeleton showHeader={false} />
                ) : (
                    <ProductsListView
                        error={productsPaginationQuery.error}
                        products={allProducts}
                        canDelete={canDelete}
                        canEdit={canEdit}
                        onEdit={handleEditClick}
                        setStockEditing={setStockEditing}
                        setSelectedProduct={setSelectedStockProductId}
                        onViewDetails={handleViewDetails}
                    />
                )}

                {/* Pagination */}
                <div className="flex w-full justify-between items-center pt-2">
                    <Select
                        value={String(limit)}
                        onValueChange={(val) => {
                            setPage(1);
                            setLimit(Number(val));
                        }}
                    >
                        <SelectTrigger className="w-[125px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-8">
                            <SelectValue placeholder="Show limit" />
                        </SelectTrigger>
                        <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                            {[5, 10, 20, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Pagination className="inline justify-end mx-1 w-fit">
                        <PaginationContent>
                            {page > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage((p) => p - 1);
                                        }}
                                        className="h-8 text-xs"
                                    />
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
                                                e.preventDefault();
                                                setPage(p);
                                            }}
                                            className="h-8 w-8 text-xs rounded-lg"
                                        >
                                            {p}
                                        </PaginationLink>
                                    )}
                                </PaginationItem>
                            ))}

                            {page < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setPage((p) => p + 1);
                                        }}
                                        className="h-8 text-xs"
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>

                {/* Details Drawer */}
                <ProductDetailsDrawer
                    open={viewDrawerOpen}
                    onOpenChange={setViewDrawerOpen}
                    productId={selectedViewProductId}
                    onEdit={handleEditClick}
                    onUpdateStock={(p) => {
                        setSelectedStockProductId(p?._id || p);
                        setStockEditing(true);
                    }}
                />

                {/* Stock Update Dialog */}
                {stockEditing && (
                    <StockUpdate
                        open={stockEditing}
                        onOpenChange={setStockEditing}
                        productId={selectedStockProductId}
                    />
                )}

                {/* Bulk Upload Dialog */}
                {bulkUploadOpen && (
                    <ProductBulkUploadDialog
                        open={bulkUploadOpen}
                        onOpenChange={setBulkUploadOpen}
                        onSuccess={() => products.refetch()}
                    />
                )}
            </div>
        </InnerDashboardLayout>
    );
}
