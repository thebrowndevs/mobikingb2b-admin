"use client";

import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CirclePlus, Search, X, RotateCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import GroupDialog from './components/GroupDialog';
import { useProducts } from '@/hooks/useProducts';
import { useGroups } from '@/hooks/useGroups';
import GroupsTable from './components/GroupsTable';
import GroupProductsSheet from './components/GroupProductsSheet';
import GroupCategoriesSheet from './components/GroupCategoriesSheet';
import GroupSubCategoriesSheet from './components/GroupSubCategoriesSheet';
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

function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const { productsQuery } = useProducts();
    const { 
        groupsPaginationQuery, 
        createGroup, 
        updateGroup, 
        updateProductsInGroup, 
        deleteGroup,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        } 
    } = useGroups();

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
        router.push(pathname); // Clear all query params
    };

    const paginatedGroupsQuery = groupsPaginationQuery({
        page,
        limit,
        searchQuery: searchVal
    });

    const groupsResponse = paginatedGroupsQuery?.data || {};
    const groupsList = groupsResponse.groups || [];
    const pagination = groupsResponse.pagination || { totalPages: 1 };
    const paginationRange = getPaginationRange(page, pagination.totalPages);

    const [selectedGroup, setSelectedGroup] = useState(null);
    
    // Sheets open control states
    const [prdouctsSheet, setPrdouctsSheet] = useState(false);
    const [categoriesSheet, setCategoriesSheet] = useState(false);
    const [subCategoriesSheet, setSubCategoriesSheet] = useState(false);
    const [groupForProducts, setGroupForProducts] = useState();

    const {
        mutateAsync: createGroupAsync,
        isPending: creating,
        error: createError,
        reset: resetCreate,
    } = createGroup;

    const {
        mutateAsync: updateGroupAsync,
        isPending: updating,
        error: updateError,
        reset: resetUpdate,
    } = updateGroup;

    const {
        mutateAsync: updateProductsInGroupAsync,
        isPending: updatingProducts,
        error: updateProductsError,
    } = updateProductsInGroup;

    const {
        mutateAsync: deleteGroupAsync,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete,
    } = deleteGroup;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedGroup(undefined);
        setIsDialogOpen(true);
    };

    const handleEditClick = (group) => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setIsDialogOpen(true);
        setSelectedGroup(group);
    };

    const handleEditItems = (group) => {
        setGroupForProducts(group);
        if (group.groupType === 'products') {
            setPrdouctsSheet(true);
        } else if (group.groupType === 'categories') {
            setCategoriesSheet(true);
        } else if (group.groupType === 'subcategories') {
            setSubCategoriesSheet(true);
        }
    };

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Groups</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and configure website and mobile app layout groups</p>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search groups by heading..."
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
                        {canAdd &&
                            <Button 
                                onClick={handleAddClick} 
                                className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                            >
                                <CirclePlus className="mr-1.5 h-4 w-4" /> Add New Group
                            </Button>
                        }
                    </div>
                </div>
            </div>

            <GroupsTable
                groups={groupsList}
                onEdit={handleEditClick}
                isLoading={paginatedGroupsQuery.isLoading}
                onEditItems={handleEditItems}
                canDelete={canDelete}
                canEdit={canEdit}
                onDelete={deleteGroupAsync}
                isDeleting={isDeleting}
                deleteError={deleteError}
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

            <GroupDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                products={productsQuery.data}
                onCreate={createGroupAsync}
                selectedGroup={selectedGroup}
                isSubmitting={creating || updating}
                error={createError || updateError}
                onUpdate={updateGroupAsync}
            />

            {/* Products Assignment Sheet */}
            <GroupProductsSheet
                open={prdouctsSheet}
                onOpenChange={setPrdouctsSheet}
                group={groupForProducts}
                onProductsAdd={updateProductsInGroupAsync}
                updatingProducts={updatingProducts}
                updateProductsError={updateProductsError}
            />

            {/* Categories Assignment Sheet */}
            <GroupCategoriesSheet
                open={categoriesSheet}
                onOpenChange={setCategoriesSheet}
                group={groupForProducts}
                onSave={updateGroupAsync}
                isSaving={updating}
            />

            {/* Sub-Categories Assignment Sheet */}
            <GroupSubCategoriesSheet
                open={subCategoriesSheet}
                onOpenChange={setSubCategoriesSheet}
                group={groupForProducts}
                onSave={updateGroupAsync}
                isSaving={updating}
            />
        </InnerDashboardLayout >
    );
}

export default Page;