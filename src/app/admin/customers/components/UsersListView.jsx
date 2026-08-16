'use client'

import React, { useState } from 'react'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash } from 'lucide-react'
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
    onViewDetails,
}) {

    // Business status badge component
    function BusinessStatusBadge({ business }) {
        if (!business?.active) {
            return <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none bg-slate-100 text-slate-400 border border-bdr2">Not Started</span>;
        }
        if (business?.isApproved && business?.gstVerified) {
            return <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none bg-blue-50 text-blue-600 border border-blue-200">GST Verified</span>;
        }
        if (business?.isApproved) {
            return <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none bg-emerald-50 text-emerald-600 border border-emerald-200">Verified</span>;
        }
        if (business?.rejectionReason) {
            return <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none bg-red-50 text-red-600 border border-red-200 font-semibold">Rejected</span>;
        }
        return <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none bg-amber-50 text-amber-600 border border-amber-200">Pending</span>;
    }

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
            <div className="text-center text-slate-450 p-4 text-xs font-semibold">
                No users found!
            </div>
        )

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible text-xs">
                <TableHeader className="bg-slate-50/75 border-b border-bdr2">
                    <TableRow>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-10">#</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Business Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-36">Phone No</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Email</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-36">Business Status</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-40">Joined Date</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user, idx) => (
                        <TableRow
                            key={user?._id}
                            className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors cursor-pointer"
                            onClick={() => onViewDetails(user?._id)}
                        >
                            <TableCell className="text-center text-slate-455 font-medium">{idx + 1}</TableCell>
                            <TableCell className="align-middle font-bold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                    <span>{user?.name || "-"}</span>
                                    {user?.orders?.length > 0 && (
                                        <span className="bg-slate-100 border border-bdr2 px-1.5 py-0.2 text-[9px] font-bold text-slate-500 rounded-md">
                                            {user?.orders?.length} orders
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="align-middle text-left font-bold text-slate-700">{user?.business?.businessName || "—"}</TableCell>
                            <TableCell className="align-middle text-left font-semibold text-slate-600">{user?.phoneNo}</TableCell>
                            <TableCell className="align-middle text-left text-slate-550">{user?.email || "—"}</TableCell>
                            <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                                <BusinessStatusBadge business={user?.business} />
                            </TableCell>
                            <TableCell className="align-middle text-left text-slate-500 font-medium">
                                {(() => {
                                    try {
                                        return format(new Date(user?.createdAt), "dd MMM yyyy, hh:mm a");
                                    } catch (e) {
                                        return "-";
                                    }
                                })()}
                            </TableCell>
                            <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7 text-slate-500 border-bdr2 rounded-lg hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                        onClick={() => onViewDetails(user?._id)}
                                        title="View Profile"
                                    >
                                        <Eye size={12} />
                                    </Button>
                                    {canEdit && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 text-slate-500 border-bdr2 rounded-lg hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                            onClick={() => onEdit(user)}
                                            title="Edit Customer"
                                        >
                                            <Pencil size={12} />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 text-red-500 border-bdr2 rounded-lg hover:text-red-650 hover:border-red-300 hover:bg-red-50 transition-colors"
                                            onClick={() => handleDeleteClick(user?._id)}
                                            disabled={isDeleting}
                                            title="Delete Customer"
                                        >
                                            <Trash size={12} />
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
