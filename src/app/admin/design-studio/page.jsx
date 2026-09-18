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
import GroupBrandsSheet from './components/GroupBrandsSheet';
import GroupImagesSheet from './components/GroupImagesSheet';
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
    const activeFilter = searchParams.get('active') || 'all';
    const groupType = searchParams.get('groupType') || 'all';
    const webHomeGroup = searchParams.get('webHomeGroup') || 'all';
    const appCategoryGroup = searchParams.get('appCategoryGroup') || 'all';

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

    const handleReset = () => {
        setSearchInput('');
        router.push(pathname); // Clear all query params
    };

    const isFiltered = searchVal || activeFilter !== 'all' || groupType !== 'all' || webHomeGroup !== 'all' || appCategoryGroup !== 'all';

    const paginatedGroupsQuery = groupsPaginationQuery({
        page,
        limit,
        searchQuery: searchVal,
        active: activeFilter === 'all' ? '' : activeFilter,
        groupType: groupType === 'all' ? '' : groupType,
        webHomeGroup: webHomeGroup === 'all' ? '' : webHomeGroup,
        appCategoryGroup: appCategoryGroup === 'all' ? '' : appCategoryGroup,
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
    const [brandsSheet, setBrandsSheet] = useState(false);
    const [imagesSheet, setImagesSheet] = useState(false);
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
        } else if (group.groupType === 'brand') {
            setBrandsSheet(true);
        } else if (group.groupType === 'image') {
            setImagesSheet(true);
        }
    };

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    return (
        <InnerDashboardLayout>
            <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-primary font-bold text-3xl tracking-tighter">Groups</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and configure website and mobile app layout groups</p>
                </div>
                {canAdd && (
                    <Button
                        onClick={handleAddClick}
                        className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                    >
                        <CirclePlus className="mr-1.5 h-4 w-4" /> Add New Group
                    </Button>
                )}
            </div>

            <div>
                {/* Search Bar container on left (flex-1 expands fully), Filters on right */}
                <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3 mb-5 mt-4 w-full">
                    {/* Left Container: Search Bar spanning full remaining space */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search groups by heading..."
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

                    {/* Right Container: Filters + Reset */}
                    <div className="flex items-center gap-2.5 flex-wrap xl:flex-nowrap justify-start xl:justify-end">
                        {/* Active Status Filter */}
                        <Select
                            value={activeFilter}
                            onValueChange={(val) => updateParams({ active: val, page: 1 })}
                        >
                            <SelectTrigger className="w-auto min-w-[120px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-9 font-medium">
                                <SelectValue placeholder="Status: All" />
                            </SelectTrigger>
                            <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                                <SelectItem value="all">Status: All</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Group Type Filter */}
                        <Select
                            value={groupType}
                            onValueChange={(val) => updateParams({ groupType: val, page: 1 })}
                        >
                            <SelectTrigger className="w-auto min-w-[125px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-9 font-medium">
                                <SelectValue placeholder="Group Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                                <SelectItem value="all">Type: All</SelectItem>
                                <SelectItem value="products">Products</SelectItem>
                                <SelectItem value="subcategories">Sub-Categories</SelectItem>
                                <SelectItem value="categories">Categories</SelectItem>
                                <SelectItem value="brand">Brand</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Web Home Filter */}
                        <Select
                            value={webHomeGroup}
                            onValueChange={(val) => updateParams({ webHomeGroup: val, page: 1 })}
                        >
                            <SelectTrigger className="w-auto min-w-[135px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-9 font-medium">
                                <SelectValue placeholder="Web Home" />
                            </SelectTrigger>
                            <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                                <SelectItem value="all">Web Home: All</SelectItem>
                                <SelectItem value="true">In Web Home</SelectItem>
                                <SelectItem value="false">Not In Web Home</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* App Category Filter */}
                        <Select
                            value={appCategoryGroup}
                            onValueChange={(val) => updateParams({ appCategoryGroup: val, page: 1 })}
                        >
                            <SelectTrigger className="w-auto min-w-[140px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs h-9 font-medium">
                                <SelectValue placeholder="App Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl text-xs">
                                <SelectItem value="all">App Category: All</SelectItem>
                                <SelectItem value="true">In App Category</SelectItem>
                                <SelectItem value="false">Not In App Category</SelectItem>
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

            {/* Brands Assignment Sheet */}
            <GroupBrandsSheet
                open={brandsSheet}
                onOpenChange={setBrandsSheet}
                group={groupForProducts}
                onSave={updateGroupAsync}
                isSaving={updating}
            />

            {/* Images Assignment Sheet */}
            <GroupImagesSheet
                open={imagesSheet}
                onOpenChange={setImagesSheet}
                group={groupForProducts}
                onSave={updateGroupAsync}
                isSaving={updating}
            />
        </InnerDashboardLayout >
    );
}

export default Page;