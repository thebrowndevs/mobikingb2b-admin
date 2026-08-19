'use client';
import { useState } from 'react';
import { Pencil, Trash, Tag } from 'lucide-react';
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatInTimeZone } from "date-fns-tz";
import DeleteConfirmationDialog from './DeleteConfirmationDialog ';

export default function CouponsTable({
    error,
    coupons,
    onDelete,
    isDeleting,
    deleteError,
    onEdit,
    canDelete,
    canEdit
}) {

    const [deletingId, setDeletingId] = useState(null);

    // Static badge style mappings for robust Tailwind compiler support
    const getBadgeStyles = (type) => {
        switch (type) {
            case 'online':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100/60 hover:bg-emerald-50';
            case 'oneTime':
            case 'oneTimeUser':
                return 'bg-blue-50 text-blue-700 border-blue-100/60 hover:bg-blue-50';
            case 'firstTime':
                return 'bg-purple-50 text-purple-700 border-purple-100/60 hover:bg-purple-50';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-100/60 hover:bg-amber-50';
        }
    };

    function formatDateParts(date) {
        if (!date) return { date: '-', time: '-' };
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local

        return {
            date: formatInTimeZone(d, "UTC", "dd MMM yyyy"),
            time: formatInTimeZone(d, "UTC", "hh:mm a")
        };
    }

    const handleDeleteClick = (id) => {
        setDeletingId(id);
    };

    const handleDeleteConfirm = async () => {
        await onDelete(deletingId);
        setDeletingId(null);
    };

    if (error) {
        return (
            <div className="text-rose-600 p-4 border border-rose-100 bg-rose-50/50 rounded-2xl text-sm font-semibold">
                Error: {error.message || "Failed to load coupons"}
            </div>
        );
    }

    return (
        <section className="w-full mb-4">
            <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 bg-white">
                <Table className="w-full">
                    <TableHeader className="bg-slate-50/75 border-b border-slate-100">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[60px] text-center text-slate-500 font-bold uppercase tracking-wider text-[11px]">#</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Coupon Code</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[140px]">Max Value (₹)</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[110px]">Percent (%)</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Type</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[100px] text-center">Status</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[140px]">Start Date</TableHead>
                            <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[140px]">End Date</TableHead>
                            <TableHead className="text-center text-slate-500 font-bold uppercase tracking-wider text-[11px] w-[110px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {coupons?.map((coupon, index) => (
                            <TableRow
                                key={coupon._id || index}
                                className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 last:border-0"
                            >
                                {/* 1. Index */}
                                <TableCell className="text-center font-semibold text-slate-400 text-xs py-3.5">
                                    {index + 1}
                                </TableCell>

                                {/* 2. Coupon Code */}
                                <TableCell className="py-3.5">
                                    <div className="flex flex-col gap-1 min-w-[120px]">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                                            <Tag className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                            <span>{coupon?.code}</span>
                                        </div>
                                        {coupon?.isAdminOnly && (
                                            <span className="text-[9px] w-fit font-extrabold uppercase tracking-wider bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-lg border border-slate-250">
                                                Admin Only
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* 3. Max Value */}
                                <TableCell className="font-bold text-slate-800 text-sm py-3.5">
                                    ₹{coupon?.value || 0}
                                </TableCell>

                                {/* 4. Percent */}
                                <TableCell className="font-bold text-slate-850 text-sm py-3.5">
                                    {coupon?.percent}%
                                </TableCell>

                                {/* 5. Type */}
                                <TableCell className="py-3.5">
                                    {coupon?.type && (
                                        <Badge variant="outline" className={`font-bold capitalize rounded-lg px-2 py-0.5 border text-[10px] ${getBadgeStyles(coupon?.type)}`}>
                                            {coupon?.type === "online" ? "Prepaid"
                                                : coupon?.type === "oneTime" ? "One Time"
                                                    : coupon?.type === "oneTimeUser" ? `One Time User (${coupon?.phoneNumber || ''})`
                                                        : coupon?.type === "firstTime" ? "First Time"
                                                            : "General"}
                                        </Badge>
                                    )}
                                </TableCell>

                                {/* 6. Status */}
                                <TableCell className="text-center py-3.5">
                                    {coupon?.active ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100/60 font-bold rounded-lg text-[10px] px-2 py-0.5">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100/60 font-bold rounded-lg text-[10px] px-2 py-0.5">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>

                                {/* 7. Start Date */}
                                <TableCell className="text-slate-600 font-medium text-xs py-3.5">
                                    <span className="block font-semibold text-slate-700">{formatDateParts(coupon?.startDate)?.date}</span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5">{formatDateParts(coupon?.startDate)?.time}</span>
                                </TableCell>

                                {/* 8. End Date */}
                                <TableCell className="text-slate-600 font-medium text-xs py-3.5">
                                    <span className="block font-semibold text-slate-700">{formatDateParts(coupon?.endDate)?.date}</span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5">{formatDateParts(coupon?.endDate)?.time}</span>
                                </TableCell>

                                {/* 9. Actions */}
                                <TableCell className="py-3.5">
                                    <div className="flex items-center justify-center gap-2">
                                        {canEdit && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(coupon)}
                                                className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteClick(coupon._id)}
                                                className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all duration-200"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmationDialog
                isOpen={!!deletingId}
                onOpenChange={(open) => {
                    if (!open) setDeletingId(null);
                }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Coupon"
                description="Are you sure you want to delete this coupon? This action cannot be undone."
            />
        </section>
    );
}