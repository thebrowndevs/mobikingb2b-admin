"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hooks/useUsers';
import { CirclePlus } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import UsersListView from './components/UsersListView';
import UserDialog from './components/UserDialog';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import NotAuthorizedPage from '@/components/notAuthorized';
import { Input } from '@/components/ui/input';
import { LayoutGroup, motion } from 'framer-motion';

const TABS = [
    { key: 'all', label: 'ALL CUSTOMERS' },
    { key: 'frequent', label: 'FREQUENT CUSTOMERS' },
    { key: 'oneOrder', label: 'ONE ORDER CUSTOMERS' },
    { key: 'noOrder', label: 'NO ORDER CUSTOMERS' }
    // ,
    // { key: 'abandoned', label: 'ABANDONED CHECKOUT ORDERS' },
    // { key: 'regular', label: 'REGULAR' },
    // { key: 'returns', label: 'RETURNS' },
    // { key: 'cancelled', label: 'CANCEL REQUESTS' },
    // { key: 'warranty', label: 'WARRANTY' },
]

function page() {
    const [activeTab, setActiveTab] = useState('all')

    const [roleFilter, setRoleFilter] = useState('user')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // debounce hook
    function useDebouncedValue(value, delay = 500) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);

        return debouncedValue;
    }
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebouncedValue(searchTerm, 500);

    // fetch users query
    const {
        usersQuery,
        updateUser,
        deleteUser,
        permissions: {
            canView,
            canAdd,
            canDelete,
            canEdit,
        }
    } = useUsers();

    const users = usersQuery({ roleFilter, page, limit, searchQuery: debouncedSearch, type: activeTab });

    const allUsers = users.data?.data?.users || []
    const totalPages = users.data?.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    // destructure updateUser mutation
    const {
        mutateAsync: updateUserAsync,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdate,
    } = updateUser;

    // destructure deleteUser mutation
    const {
        mutateAsync: deleteUserAsync,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete,
    } = deleteUser;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState();

    // open dialog to add new tag
    const handleAddClick = () => {
        resetUpdate();
        resetDelete();
        setSelectedUser(undefined);
        setIsDialogOpen(true);
    };

    // open dialog to edit
    const handleEditClick = (id) => {
        resetUpdate();
        resetDelete();
        setSelectedUser(id);
        setIsDialogOpen(true);
    };

    if (!canView) {
        return <NotAuthorizedPage />
    }

    return (
        <div>
            <InnerDashboardLayout>
                <div className='w-full flex items-center justify-between text-primary mb-5'>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
                            Customers
                        </h1>
                        <p className='text-sm text-slate-500'>Manage all the customers</p>
                    </div>
                    {canAdd &&
                        <Button onClick={handleAddClick}>
                            <CirclePlus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    }
                </div>

                {/* Search Bar */}
                <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white mb-3 w-full"
                />


                {/* Tabs */}
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
                <div>
                    {canView &&
                        <UsersListView
                            isLoading={users.isLoading}
                            error={users.error}
                            users={allUsers || []}
                            onEdit={handleEditClick}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onDelete={deleteUserAsync}
                            isDeleting={isDeleting}
                            deleteError={deleteError}
                        />
                    }
                    <div className="flex w-full justify-end gap-2 items-center mt-4">
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
                </div>

                {/* <UsersTable /> */}

                <UserDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    selectedUser={selectedUser}
                    onUpdate={updateUserAsync}
                    // isSubmitting={isCreating}
                    isSubmitting={isUpdating}
                    // error={createError?.message}
                    error={updateError?.message}
                    // changePassword={changePassword}
                    // onlyAdmin={onlyAdmin}
                    canEdit={canEdit}
                />

            </InnerDashboardLayout>
        </div>
    )
}

export default page
