"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hooks/useUsers';
import { CirclePlus, Search, X, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import UsersListView from './components/UsersListView';
import UserDialog from './components/UserDialog';
import CustomerDetailsDrawer from './components/CustomerDetailsDrawer';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import NotAuthorizedPage from '@/components/notAuthorized';
import { Input } from '@/components/ui/input';
import { LayoutGroup, motion } from 'framer-motion';

const TABS = [
    { key: 'all', label: 'ALL' },
    { key: 'accountCreated', label: 'ACCOUNT CREATED' },
    { key: 'pendingVerification', label: 'PENDING VERIFICATION' },
    { key: 'verified', label: 'VERIFIED' },
    { key: 'rejected', label: 'REJECTED' },
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

    const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
    const [selectedViewUserId, setSelectedViewUserId] = useState(null);

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

    const handleViewDetails = (id) => {
        setSelectedViewUserId(id);
        setViewDrawerOpen(true);
    };

    if (!canView) {
        return <NotAuthorizedPage />
    }

    const isFiltered = searchTerm || activeTab !== 'all';

    const handleReset = () => {
        setSearchTerm('');
        setActiveTab('all');
        setPage(1);
    };

    return (
        <div>
            <InnerDashboardLayout>
                <div className='w-full flex items-center justify-between text-primary mb-6'>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
                            Customers
                        </h1>
                        <p className='text-sm text-slate-500 font-medium'>Manage client accounts, business onboarding documentation, and orders history</p>
                    </div>
                    {canAdd && (
                        <Button onClick={handleAddClick} className="h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-755 text-white shadow-none gap-1.5 rounded-lg">
                            <CirclePlus className="h-4 w-4" /> Add New
                        </Button>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Control Bar */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 mt-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            {/* Search Input */}
                            <div className="relative flex-1 min-w-[240px]">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search customers by name, phone or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-8 text-sm bg-back2 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none rounded-lg"
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

                            {isFiltered && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="h-8 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50/60 font-semibold gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <LayoutGroup>
                        <div className="flex gap-2 mb-0 overflow-x-auto bg-white scrollbar-hide relative border-b border-bdr2">
                            {TABS.map(({ key, label }) => {
                                const isActive = activeTab === key
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setActiveTab(key)
                                            setPage(1);
                                        }}
                                        className={`
                                            relative px-4 py-3 text-xs font-semibold tracking-wider transition-all duration-300 flex gap-1 min-w-fit items-center justify-center
                                            ${isActive ? 'text-indigo-650 font-bold' : 'text-slate-450 hover:text-slate-800'}
                                        `}
                                    >
                                        <span>{label}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
                                            />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </LayoutGroup>

                    {/* List View */}
                    <div>
                        {canView && (
                            <UsersListView
                                isLoading={users.isLoading}
                                error={users.error}
                                users={allUsers || []}
                                onEdit={handleEditClick}
                                onViewDetails={handleViewDetails}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                onDelete={deleteUserAsync}
                                isDeleting={isDeleting}
                                deleteError={deleteError}
                            />
                        )}

                        {/* Pagination Footer */}
                        <div className="flex w-full justify-end gap-2 items-center mt-4">
                            <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                                <SelectTrigger className="w-[120px] bg-back2 border-bdr2 text-slate-700 shadow-none text-xs rounded-lg h-8">
                                    <SelectValue placeholder="Items per page" />
                                </SelectTrigger>
                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
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
                                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p - 1) }} className="h-8 text-xs" />
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
                                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => p + 1) }} className="h-8 text-xs" />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </div>

                <UserDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    selectedUser={selectedUser}
                    onUpdate={updateUserAsync}
                    isSubmitting={isUpdating}
                    error={updateError?.message}
                    canEdit={canEdit}
                />

                {viewDrawerOpen && (
                    <CustomerDetailsDrawer
                        open={viewDrawerOpen}
                        onOpenChange={setViewDrawerOpen}
                        userId={selectedViewUserId}
                        onEdit={handleEditClick}
                    />
                )}
            </InnerDashboardLayout>
        </div>
    )
}

export default page
