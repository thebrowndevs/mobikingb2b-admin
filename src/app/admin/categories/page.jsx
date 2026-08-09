"use client";

import { CirclePlus, Search, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import CategoriesListView from './components/CategoriesListView';
import CategoryDialog from './components/CategoryDialog';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
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
            if (value === undefined || value === null || value === '') {
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

    const handleReset = () => {
        setSearchInput('');
        router.push(pathname);
    };

    // Fetch categories query with search and pagination params
    const { 
        categoriesPaginationQuery, 
        createCategory, 
        deleteCategory, 
        updateCategory, 
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        } 
    } = useCategories();

    const paginatedCategories = categoriesPaginationQuery({
        page,
        limit,
        searchQuery: searchVal
    });

    const categoriesResponse = paginatedCategories.data || {};
    const categoriesList = categoriesResponse.categories || [];
    const pagination = categoriesResponse.pagination || { totalPages: 1 };
    const paginationRange = getPaginationRange(page, pagination.totalPages);

    // Destructure createCategory mutation
    const {
        mutateAsync: createCategoryAsync,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = createCategory;

    // Destructure updateCategory mutation
    const {
        mutateAsync: updateCategoryAsync,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdate,
    } = updateCategory;

    // Destructure deleteCategory mutation
    const {
        mutateAsync: deleteCategoryAsync,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete,
    } = deleteCategory;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState();
    const [image, setImage] = useState(null);

    // Open dialog to add new
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setImage(null);
        setSelectedCategory(undefined);
        setIsDialogOpen(true);
    };

    // Open dialog to edit
    const handleEditClick = (category) => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedCategory(category);
        setImage(category?.image);
        setIsDialogOpen(true);
    };

    const handleToggleActive = async (id, active) => {
        await updateCategoryAsync({ id, data: { active } });
    };

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Categories</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and organize product grouping categories</p>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories by name or slug..."
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
                        {searchInput && (
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
                            Total: {pagination?.totalCategories || 0}
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
                    categories={categoriesList}
                    onEdit={handleEditClick}
                    onToggleActive={handleToggleActive}
                    isLoading={paginatedCategories.isLoading}
                    error={paginatedCategories.error}
                    onDelete={deleteCategoryAsync}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    canEdit={canEdit}
                    canDelete={canDelete}
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

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    selectedCategory={selectedCategory}
                    onCreate={createCategoryAsync}
                    onUpdate={updateCategoryAsync}
                    isSubmitting={isCreating || isUpdating}
                    error={createError?.message || updateError?.message}
                    image={image}
                    setImage={setImage}
                />
            </div>
        </InnerDashboardLayout>
    );
}