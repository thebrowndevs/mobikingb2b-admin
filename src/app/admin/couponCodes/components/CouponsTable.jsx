'use client';
import { useState } from 'react';
import { Pencil, TrendingUp, Star, Trash } from 'lucide-react';
import { Table, TableHeader, TableRow, TableCell, TableHead, TableBody, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
// import DeleteConfirmationDialog from './DeleteConfirmationDialog ';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
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
    canEdit,
    setSelectedCoupon,
    onUpdate
}) {

    const STATUS_VARIANTS = {
        general: 'yellow',           // yellow
        online: 'green',        // green
        oneTime: 'blue', // red
        oneTimeUser: 'blue',
        firstTime: 'purple',      // purple/outline
        // Hold: 'gray',        // gray or custom secondary
    }

    const [deletingId, setDeletingId] = useState(null);

    function formatDateParts(date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local

        return {
            date: formatInTimeZone(d, "UTC", "dd MMM yyyy"),   // e.g. "18 Sep 2025"
            time: formatInTimeZone(d, "UTC", "HH:mm")        // e.g. "01:45 PM"
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
            <div className="text-red-600 p-4">
                Error: {error.message}
            </div>
        );
    }

    return (
        <section className="w-full mb-4">
            <div className="overflow-x-auto rounded-md border border-gray-200">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-50 ">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="">Coupon Code</TableHead>
                            <TableHead className="">Max Value (₹)</TableHead>
                            <TableHead className="">Percent (%)</TableHead>
                            <TableHead className="">Type</TableHead>
                            <TableHead className="">Start Date</TableHead>
                            <TableHead className="">End Date</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>


                    <TableBody>
                        {coupons?.map((coupon, index) => (
                            <TableRow
                                key={index}
                                className="even:bg-gray-50 hover:bg-gray-100 transition"
                            >
                                {/* 1. Index */}
                                <TableCell className="text-sm">
                                    {index + 1}
                                </TableCell>

                                {/* 2. Coupon Code */}
                                <TableCell className="">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold">{coupon?.code}</span>
                                        {coupon?.isAdminOnly && (
                                            <span className="text-[10px] w-fit font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-300">
                                                Admin Only
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* 3. value */}
                                <TableCell className="text-sm">
                                    {coupon?.value}
                                </TableCell>

                                {/* 3. Max Percent % */}
                                <TableCell className="">
                                    {coupon?.percent}
                                </TableCell>

                                {/* 3. Type */}
                                <TableCell className="">
                                    {
                                        coupon?.type &&
                                        <Badge className={`bg-${STATUS_VARIANTS[coupon?.type] || 'gray'}-100 text-black`} >{
                                            coupon?.type == "online" ? "Prepaid"
                                                : coupon?.type == "oneTime" ? "One Time"
                                                    : coupon?.type == "oneTimeUser" ? `One Time User (${coupon?.phoneNumber || ''})`
                                                        : coupon?.type == "firstTime" ? "First Time"
                                                            : "General"
                                        }</Badge>
                                    }
                                </TableCell>

                                {/* 3. Status */}
                                <TableCell className="">
                                    {coupon?.active ?
                                        <Badge className={'bg-emerald-600 text-white'} >Active</Badge>
                                        : <Badge variant="destructive">In Active</Badge>
                                    }
                                </TableCell>

                                {/* start date */}
                                <TableCell className="">
                                    <p>
                                        {formatDateParts(coupon?.startDate)?.date}
                                    </p>
                                    <p className='text-gray-500'>
                                        {formatDateParts(coupon?.startDate)?.time}
                                    </p>
                                </TableCell>

                                {/* end date */}
                                <TableCell className="">
                                    <p>
                                        {formatDateParts(coupon?.endDate)?.date}
                                    </p>
                                    <p className='text-gray-500'>
                                        {formatDateParts(coupon?.endDate)?.time}
                                    </p>
                                </TableCell>

                                {/* 6. Actions Dropdown */}
                                <TableCell className="">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* <ServiceDetailsDialog coupon={coupon} /> */}
                                        {/* 
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="hover:bg-gray-100"
                                            onClick={() => handleView(coupon)}
                                        >
                                            <Eye size={18} className="text-gray-600" />
                                        </Button> */}

                                        {canEdit &&
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => onEdit(coupon)}
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                        }
                                        {canDelete &&
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDeleteClick(coupon._id)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        }
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
                description="Are you sure you want to delete this Coupon?"
            />
        </section>
    );
}