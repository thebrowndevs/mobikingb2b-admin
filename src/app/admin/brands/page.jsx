"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useBrands } from '@/hooks/useBrands';
import React, { useState, useEffect } from 'react'
import BrandsListView from './components/BrandsListView';
import BrandDialog from './components/BrandDialog';
import { CirclePlus, Search, Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getPaginationRange } from '@/lib/services/getPaginationRange';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

function page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchVal = searchParams.get('search') || '';
    const activeFilter = searchParams.get('active') || 'all';

    const [searchInput, setSearchInput] = useState(searchVal);

    useEffect(() => {
        setSearchInput(searchVal);
    }, [searchVal]);

    useEffect(() => {
        const pageParam = searchParams.get('page');
        const limitParam = searchParams.get('limit');
        if (!pageParam || !limitParam) {
            const newParams = {};
            if (!pageParam) newParams.page = '1';
            if (!limitParam) newParams.limit = '10';
            updateParams(newParams);
        }
    }, []);

    const updateParams = (newParams) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '' || value === 'all') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== searchVal) {
                updateParams({ search: searchInput, page: 1 });
            }
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput, searchVal]);

    const handlePageChange = (newPage) => {
        updateParams({ page: newPage });
    };

    const handleLimitChange = (newLimit) => {
        updateParams({ limit: newLimit, page: 1 });
    };

    const handleActiveFilterChange = (val) => {
        updateParams({ active: val, page: 1 });
    };

    const handleReset = () => {
        setSearchInput('');
        router.push(pathname);
    };

    const isFiltered = searchVal || activeFilter !== 'all';

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState();
    const [image, setImage] = useState(null);

    const { brandsAdminPaginationQuery, createBrand, updateBrand } = useBrands();

    const paginatedBrandsQuery = brandsAdminPaginationQuery({
        page,
        limit,
        searchQuery: searchVal,
        active: activeFilter === 'all' ? '' : activeFilter,
    });

    const brandsResponse = paginatedBrandsQuery?.data || {};
    const brandsList = Array.isArray(brandsResponse) ? brandsResponse : (brandsResponse.brands || []);
    const pagination = brandsResponse.pagination || { totalPages: 1, totalBrands: 0 };
    const paginationRange = getPaginationRange(page, pagination.totalPages || 1);

    const {
        mutateAsync: createBrandAsync,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = createBrand;

    const {
        mutateAsync: updateBrandAsync,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdate,
    } = updateBrand;

    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        setImage(null);
        setSelectedBrand(undefined);
        setIsDialogOpen(true);
    };

    const handleEditClick = (brand) => {
        resetCreate();
        resetUpdate();
        setSelectedBrand(brand);
        setImage(brand?.image);
        setIsDialogOpen(true);
    };

    return (
        <InnerDashboardLayout>
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-primary font-bold text-3xl tracking-tighter">Brands</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage corporate manufacturing brands and trademark labels</p>
                </div>
                <Button
                    onClick={handleAddClick}
                    className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    <CirclePlus className="mr-1.5 h-4 w-4" /> Add New
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-5 mt-4 w-full">
                {/* Left Container: Search Input */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search brands by name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-9 pr-8 text-sm bg-back2 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none w-full"
                    />
                    {searchInput && (
                        <button
                            onClick={handleReset}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 transition-colors"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Right Container: Status Filter + Total + Reset */}
                <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                    {/* Active Status Filter Dropdown */}
                    <Select
                        value={activeFilter}
                        onValueChange={handleActiveFilterChange}
                    >
                        <SelectTrigger className="w-auto min-w-[125px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-9 font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                <Filter className="w-3.5 h-3.5 text-slate-400" />
                                <SelectValue placeholder="Status: All" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                            <SelectItem value="all">Status: All</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

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

                    <Button
                        variant="outline"
                        className="shrink-0 bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold text-xs h-9"
                        disabled
                    >
                        Total: {pagination.totalBrands || brandsList.length}
                    </Button>
                </div>
            </div>

            <BrandsListView
                brands={brandsList}
                onEdit={handleEditClick}
                isLoading={paginatedBrandsQuery.isLoading}
                error={paginatedBrandsQuery.error}
                page={page}
                limit={limit}
            />

            {/* Pagination Controls */}
            <div className="flex w-full justify-between items-center mt-6">
                <Select
                    value={String(limit)}
                    onValueChange={(val) => handleLimitChange(Number(val))}
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
                                        handlePageChange(page - 1);
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
                                            handlePageChange(p);
                                        }}
                                        className="h-8 w-8 text-xs rounded-lg"
                                    >
                                        {p}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {page < (pagination.totalPages || 1) && (
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page + 1);
                                    }}
                                    className="h-8 text-xs"
                                />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>

            <BrandDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedBrand={selectedBrand}
                onCreate={createBrandAsync}
                onUpdate={updateBrandAsync}
                isSubmitting={isCreating || isUpdating}
                error={createError?.message || updateError?.message}
                image={image}
                setImage={setImage}
            />
        </InnerDashboardLayout>
    )
}

export default page;
