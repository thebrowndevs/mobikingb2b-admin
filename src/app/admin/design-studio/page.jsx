"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import GroupDialog from './components/GroupDialog';
import { useProducts } from '@/hooks/useProducts';
import { useGroups } from '@/hooks/useGroups';
import GroupsTable from './components/GroupsTable';
import GroupProductsSheet from './components/GroupProductsSheet';
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

function page() {
    const { productsQuery } = useProducts()
    const { groupsPaginationQuery, createGroup, updateGroup, updateProductsInGroup, deleteGroup,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        } } = useGroups()

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const paginatedGroupsQuery = groupsPaginationQuery({
        page,
        limit,
        searchQuery: debouncedSearch
    })

    const groupsResponse = paginatedGroupsQuery?.data || {}
    const groupsList = groupsResponse.groups || []
    const pagination = groupsResponse.pagination || { totalPages: 1 }
    const paginationRange = getPaginationRange(page, pagination.totalPages)

    const [selectedGroup, setSelectedGroup] = useState(null)
    const [prdouctsSheet, setPrdouctsSheet] = useState(false)
    const [groupForProducts, setGroupForProducts] = useState()

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

    // delete group mutation
    const {
        mutateAsync: deleteGroupAsync,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete,
    } = deleteGroup;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // open dialog to add new 
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedGroup(undefined)
        setIsDialogOpen(true);
    };

    const handleEditClick = (group) => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setIsDialogOpen(true);
        setSelectedGroup(group)
    }

    if (!canView) {
        return <NotAuthorizedPage />
    }

    return (
        <InnerDashboardLayout>
            <div className='flex flex-col md:flex-row md:items-center justify-between w-full gap-4 mb-5 border-b pb-4'>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl">Design Studio</h1>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search groups by name..."
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {canAdd &&
                    <Button onClick={handleAddClick} className="w-fit">
                        <CirclePlus className="mr-2 h-4 w-4" />
                        Add New Group
                    </Button>
                }
            </div>

            <GroupsTable
                groups={groupsList}
                onEdit={handleEditClick}
                isLoading={paginatedGroupsQuery.isLoading}
                setGroupForProducts={setGroupForProducts}
                setPrdouctsSheet={setPrdouctsSheet}
                canDelete={canDelete}
                canEdit={canEdit}
                onDelete={deleteGroupAsync}
                isDeleting={isDeleting}
                deleteError={deleteError}
            />

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex w-full justify-end mt-4 gap-2 items-center">
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

                            {page < pagination.totalPages && (
                                <PaginationItem>
                                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p + 1); }} />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

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

            <GroupProductsSheet
                open={prdouctsSheet}
                onOpenChange={setPrdouctsSheet}
                group={groupForProducts}
                onProductsAdd={updateProductsInGroupAsync}
                updatingProducts={updatingProducts}
                updateProductsError={updateProductsError}
            />
        </InnerDashboardLayout >
    )
}

export default page