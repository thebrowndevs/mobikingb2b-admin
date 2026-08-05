'use client'

import React, { useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import Loader from '@/components/Loader'
import DeleteConfirmationDialog from './DeleteConfirmationDialog '
import { format } from 'date-fns';
import TableSkeleton from '@/components/custom/TableSkeleton'
import Link from 'next/link'

export default function UsersListView({
    isLoading,
    error,
    users = [],
    // page,
    // pageCount,
    // onPageChange,
    onEdit,
    onDelete,
    isDeleting,
    deleteError,
    canDelete,
    canEdit,
    onlyAdmin
}) {

    console.log(users)
    const [deletingUserId, setDeletingUserId] = useState(null)

    const handleDeleteClick = (userId) => {
        setDeletingUserId(userId)
    }
    const handleDeleteConfirm = async () => {
        await onDelete(deletingUserId)
        setDeletingUserId(null)
    }

    if (isLoading)
        return (
            <TableSkeleton
                rows={5}
                columns={4}
                showHeader={false}
                showPagination={true}
            />
        )

    if (error)
        return (
            <div className="text-red-600 p-4">
                Error: {error.message || error}
            </div>
        )

    if (users.length === 0)
        return (
            <div className="text-center text-gray-500 p-4">
                No users found!
            </div>
        )

    return (
        <section className="space-y-4">
            {/* Data Table */}
            <div className="overflow-hidden rounded-md border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone No</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead className={'text-center'}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, idx) => (
                            <TableRow key={user?._id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{user?.name || "-"} <span className='bg-gray-200 px-2 text-xs py-1 rounded-full'>{user?.orders?.length}</span></TableCell>
                                <TableCell>
                                    <Link href={`/admin/customers/${user?._id}`}>
                                        {user?.phoneNo}
                                    </Link>
                                </TableCell>
                                <TableCell>{user?.email}</TableCell>
                                <TableCell>
                                    {(() => {
                                        try {
                                            return format(new Date(user?.createdAt), "dd MMM yyyy, hh:mm a");
                                        } catch (e) {
                                            return "-";
                                        }
                                    })()}
                                </TableCell>
                                <TableCell className="flex justify-center items-center gap-2">
                                    {canEdit &&
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => onEdit(user)}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                    }
                                    {canDelete &&
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => handleDeleteClick(user?._id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {/* <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {pageCount}
                </p>
                <div className="space-x-2">
                    <Button
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        size="sm"
                        disabled={page >= pageCount}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div> */}

            {/* Delete Confirmation */}
            <DeleteConfirmationDialog
                isOpen={!!deletingUserId}
                onOpenChange={(open) => !open && setDeletingUserId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete User"
                description="Are you sure you want to delete this user?"
            />
        </section>
    )
}
