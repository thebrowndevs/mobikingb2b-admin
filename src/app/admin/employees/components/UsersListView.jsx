'use client'

import React, { useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import Loader from '@/components/Loader'
import DeleteConfirmationDialog from './DeleteConfirmationDialog '
import { format } from 'date-fns';
import TableSkeleton from '@/components/custom/TableSkeleton'

export default function UsersListView({
    isLoading,
    error,
    users = [],
    onEdit,
    onDelete,
    isDeleting,
    deleteError,
    canDelete,
    canEdit,
}) {
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
            <div className="text-red-605 p-4 bg-back2 border border-bdr2 rounded-xl">
                Error: {error.message || error}
            </div>
        )

    if (users.length === 0)
        return (
            <div className="text-center text-slate-400 p-8 bg-back2 border border-bdr2 rounded-xl font-medium">
                No users found.
            </div>
        )

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible">
                <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-b border-bdr2">
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-20">S. No.</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Phone No</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Email</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Joined Date</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, idx) => (
                        <TableRow 
                            key={user._id}
                            className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                        >
                            <TableCell className="text-center align-middle font-medium text-slate-400 py-3">{idx + 1}</TableCell>
                            <TableCell className="text-left align-middle font-bold text-slate-800 py-3">{user.name}</TableCell>
                            <TableCell className="text-left align-middle text-slate-600 py-3 font-semibold">{user.phoneNo}</TableCell>
                            <TableCell className="text-left align-middle text-slate-600 py-3">{user.email}</TableCell>
                            <TableCell className="text-left align-middle text-slate-500 py-3 text-xs font-medium">
                                {format(new Date(user.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </TableCell>
                            <TableCell className="text-center align-middle py-3">
                                <div className="flex justify-center gap-1.5">
                                    {canEdit && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all shadow-none"
                                            onClick={() => onEdit(user)}
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all shadow-none"
                                            onClick={() => handleDeleteClick(user._id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
