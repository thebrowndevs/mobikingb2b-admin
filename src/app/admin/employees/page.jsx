"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Button } from '@/components/ui/button'
import { useUsers } from '@/hooks/useUsers';
import { CirclePlus } from 'lucide-react';
import React, { useState } from 'react'
import UsersListView from './components/UsersListView';
import UserDialog from './components/UserDialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import NotAuthorizedPage from '@/components/notAuthorized';

function page() {
    const [roleFilter, setRoleFilter] = useState('employee')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // fetch users query
    const {
        employeesQuery,
        createUser,
        updateUser,
        deleteUser,
        // changePassword,
        permissions: {
            canViewEmployee,
            canAddEmployee,
            canDeleteEmployee,
            canEditEmployee,
            onlyAdmin 
        }
    } = useUsers();

    const users = employeesQuery({ role: roleFilter, page: page, limit: limit });

    const allUsers = users.data?.data?.users || []
    const totalPages = users.data?.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    const {
        mutateAsync: createUserAsync,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = createUser;

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
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedUser(undefined);
        setIsDialogOpen(true);
    };

    // open dialog to edit
    const handleEditClick = (id) => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedUser(id);
        setIsDialogOpen(true);
    };

    if (!canViewEmployee) {
        return <NotAuthorizedPage />
    }

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Employees</h1>
                <p className="text-sm text-slate-500 font-medium">Manage corporate administrators, staffs, and personnel accounts</p>
            </div>

            <div className='w-full flex items-center justify-between text-primary mb-5 mt-4'>
                <div className="w-[150px]">
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => setRoleFilter(value)}
                    >
                        <SelectTrigger className="bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                            <SelectValue placeholder='Role' />
                        </SelectTrigger>
                        <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                            <SelectItem value={'employee'}>Employee</SelectItem>
                            <SelectItem value={'admin'}>Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {canAddEmployee &&
                    <Button 
                        onClick={handleAddClick}
                        className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                    >
                        <CirclePlus className="mr-1.5 h-4 w-4" /> Add New Employee
                    </Button>
                }
            </div>

            {/* {canViewEmployee && */}
            <UsersListView
                isLoading={users.isLoading}
                error={users.error}
                users={allUsers}
                onEdit={handleEditClick}
                canEdit={canEditEmployee}
                canDelete={canDeleteEmployee}
                onDelete={deleteUserAsync}
                isDeleting={isDeleting}
                deleteError={deleteError}
            />
            {/* } */}

            <div className="flex w-full justify-end gap-2.5 items-center mt-5">
                {/* Limit Dropdown */}
                <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                    <SelectTrigger className="w-[120px] bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
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
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={() => setPage((p) => p - 1)}
                                    className="bg-back2 border border-bdr2 hover:bg-slate-100 text-slate-700 shadow-none rounded-lg"
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
                                            e.preventDefault()
                                            setPage(p)
                                        }}
                                        className={p === page 
                                            ? "bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text border-0 shadow-none rounded-lg font-semibold"
                                            : "bg-back2 border border-bdr2 hover:bg-slate-100 text-slate-700 shadow-none rounded-lg"
                                        }
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
                                    onClick={() => setPage((p) => p + 1)}
                                    className="bg-back2 border border-bdr2 hover:bg-slate-100 text-slate-700 shadow-none rounded-lg"
                                />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>

            <UserDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedUser={selectedUser}
                onCreate={createUserAsync}
                onUpdate={updateUserAsync}
                isSubmitting={isCreating || isUpdating}
                error={createError?.message || updateError?.message}
                // changePassword={changePassword}
                onlyAdmin={onlyAdmin}
                canEdit={canEditEmployee}
            />
        </InnerDashboardLayout>
    )
}

export default page
