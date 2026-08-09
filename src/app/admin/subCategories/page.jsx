"use client";

import { CirclePlus, Search, Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import CategoriesListView from './components/CategoriesListView';
import SubCategoryDrawer from './components/SubCategoryDrawer';
import { useSubCategories } from '@/hooks/useSubCategories';
import { useCategories } from '@/hooks/useCategories';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import NotAuthorizedPage from '@/components/notAuthorized';
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

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Read values from URL search params with fallback defaults
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchVal = searchParams.get('search') || '';
    const parentCategory = searchParams.get('parentCategory') || 'all';

    const [searchInput, setSearchInput] = useState(searchVal);

    // Keep input synced if URL search params change directly (e.g. reset)
    useEffect(() => {
        setSearchInput(searchVal);
    }, [searchVal]);

    // Autofill URL params on first load if missing
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

    // Push new params to URL
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

    // Debounce search input and update URL
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

    const handleParentCategoryChange = (val) => {
        updateParams({ parentCategory: val, page: 1 });
    };

    const handleReset = () => {
        setSearchInput('');
        router.push(pathname);
    };

    // Hooks
    const { 
        subCategoriesPaginationQuery, 
        deleteSubCategory, 
        permissions: { canView, canAdd, canEdit, canDelete } 
    } = useSubCategories();
    
    const { categoriesQuery } = useCategories();

    // Fetch parent categories for filter dropdown list
    const activeCategoriesQuery = categoriesQuery();
    const parentCategories = activeCategoriesQuery?.data?.data || [];

    // Fetch subcategories with search and parentCategory filter
    const paginatedSubCategories = subCategoriesPaginationQuery({
        page,
        limit,
        searchQuery: searchVal,
        parentCategory: parentCategory === 'all' ? '' : parentCategory,
    });

    const subCategoriesResponse = paginatedSubCategories.data || {};
    const subCategoriesList = subCategoriesResponse.subCategories || [];
    const pagination = subCategoriesResponse.pagination || { totalPages: 1 };
    const paginationRange = getPaginationRange(page, pagination.totalPages);

    const {
        mutateAsync: deleteSubCategoryAsync,
        isPending: isDeleting,
        error: deleteError,
    } = deleteSubCategory;

    // Drawer states
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const handleAddClick = () => {
        setSelectedSlug(null);
        setDrawerOpen(true);
    };

    const handleEditClick = (slug) => {
        setSelectedSlug(slug);
        setDrawerOpen(true);
    };

    if (!canView) return <NotAuthorizedPage />;

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Sub Categories</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and organize parent category splits and sub-groupings</p>
            </div>

            <div>
                {/* Control bar: Search, Parent Category Filter, Total Badge, Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search subcategories by name or slug..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9 pr-8 text-sm bg-back2 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
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

                        {/* Parent Category Filter Dropdown */}
                        <div className="w-[200px] shrink-0">
                            <Select
                                value={parentCategory}
                                onValueChange={handleParentCategoryChange}
                            >
                                <SelectTrigger className="bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {parentCategories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {(searchInput || parentCategory !== 'all') && (
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
                            Total: {pagination?.totalSubCategories || 0}
                        </Button>
                        {canAdd &&
                            <Button 
                                onClick={handleAddClick} 
                                className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                            >
                                <CirclePlus className="mr-1.5 h-4 w-4" /> Add New
                            </Button>
                        }
                    </div>
                </div>

                <CategoriesListView
                    categories={subCategoriesList}
                    isLoading={paginatedSubCategories.isLoading}
                    error={paginatedSubCategories.error}
                    onDelete={deleteSubCategoryAsync}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={handleEditClick}
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

                            {page < pagination.totalPages && (
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

                <SubCategoryDrawer 
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    slug={selectedSlug}
                />
            </div>
        </InnerDashboardLayout>
    );
}