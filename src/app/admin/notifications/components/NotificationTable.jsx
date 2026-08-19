"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { IoMdRefresh } from "react-icons/io";
import { Trash, Search, Inbox } from "lucide-react";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import axios from "axios";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog ";

export default function NotificationTable() {
    const [search, setSearch] = useState('');
    const { notificationsQuery, deleteNotification, permissions: { canEdit, canDelete } } = useNotifications();

    const { isLoading, error, data } = notificationsQuery;
    const notifications = data?.data || [];

    const [filtered, setFiltered] = useState(notifications);

    useEffect(() => {
        const term = search.toLowerCase();
        const filteredData = notifications.filter((i) =>
            i.title.toLowerCase().includes(term) ||
            i.message.toLowerCase().includes(term)
        );
        setFiltered(filteredData);
    }, [search, notifications]);

    const {
        mutateAsync: onDelete,
        isPending: isDeleting,
        error: deleteError,
    } = deleteNotification;

    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteClick = (id) => {
        setDeletingId(id);
    };

    const handleDeleteConfirm = async () => {
        await onDelete(deletingId);
        setDeletingId(null);
    };

    async function sendAgain(item) {
        const toastId = toast.loading('Sending Notification...');
        try {
            await axios.post('/api/send-notification', { ...item });
            toast.success('Notification Sent Successfully', { id: toastId });
        } catch (error) {
            toast.error('Error in sending Notification', { id: toastId });
            console.log(error);
        }
    }

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-rose-600 p-4 border border-rose-100 bg-rose-50/50 rounded-2xl text-sm font-semibold">Error: {error.message}</div>;

    return (
        <section className="w-full">
            {/* Search toolbar */}
            <div className="relative mb-4 flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search notifications by title or message..."
                    type="text"
                    className="pl-9 pr-4 bg-white border-slate-200/80 rounded-xl focus-visible:ring-indigo-500/40 text-sm h-10 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {!filtered.length ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4">
                        <Inbox className="w-10 h-10" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No Notifications Found</h3>
                    <p className="mt-1 text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                        There are no notifications matching your search term.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm shadow-slate-100/50 bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50/75 border-b border-slate-100">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[60px] text-center text-slate-500 font-bold uppercase tracking-wider text-[11px]">#</TableHead>
                                <TableHead className="w-[120px] text-center text-slate-500 font-bold uppercase tracking-wider text-[11px]">Image</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Title</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Message</TableHead>
                                <TableHead className="w-[140px] text-center text-slate-500 font-bold uppercase tracking-wider text-[11px]">Created At</TableHead>
                                <TableHead className="w-[110px] text-center text-slate-500 font-bold uppercase tracking-wider text-[11px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((item, idx) => (
                                <TableRow key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 last:border-0">
                                    <TableCell className="text-center font-semibold text-slate-400 text-xs py-3.5">{idx + 1}</TableCell>
                                    <TableCell className="py-2 text-center">
                                        <div className="flex items-center justify-center min-h-[60px]">
                                            {item.image ? (
                                                <div className="relative border border-slate-100 rounded-lg p-1 bg-slate-50/50 overflow-hidden shadow-inner">
                                                    <Image
                                                        src={item.image}
                                                        alt="notification image"
                                                        width={60}
                                                        height={60}
                                                        quality={95}
                                                        className="object-contain rounded-md"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-slate-350 text-xs">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800 text-sm max-w-[150px] truncate">{item.title}</TableCell>
                                    <TableCell className="text-slate-600 font-medium text-xs max-w-[240px]">
                                        <p className="line-clamp-2 leading-relaxed">{item.message}</p>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-500 font-medium text-xs">
                                        {format(new Date(item.createdAt), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="py-3.5">
                                        <div className="flex gap-2 items-center justify-center">
                                            {canEdit && (
                                                <Button 
                                                    size="sm"
                                                    variant="outline" 
                                                    onClick={() => sendAgain(item)}
                                                    className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200"
                                                    title="Resend Notification"
                                                >
                                                    <IoMdRefresh className="h-4.5 w-4.5" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button 
                                                    size="sm"
                                                    variant="outline" 
                                                    onClick={() => handleDeleteClick(item._id)}
                                                    className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all duration-200"
                                                    title="Delete"
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
            )}

            <DeleteConfirmationDialog
                isOpen={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Notification"
                description="Are you sure you want to delete this notification? This action cannot be undone."
            />
        </section>
    );
}
