"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash, Layers } from "lucide-react";
import { useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog ";
import SubCategoryNamesDialog from "./SubCategoryNamesDialog";
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TableSkeleton from '@/components/custom/TableSkeleton';
import { AnimatePresence, motion } from "framer-motion";

export default function CategoriesListView({
    isLoading,
    error,
    categories,
    onEdit,
    onDelete,
    onToggleActive,
    isDeleting,
    deleteError,
    canEdit,
    canDelete,
    page = 1,
    limit = 10
}) {
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [selectedCategoryForSub, setSelectedCategoryForSub] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const handleDeleteClick = (categoryId) => {
        setDeletingCategoryId(categoryId);
    };

    const handleDeleteConfirm = async () => {
        await onDelete(deletingCategoryId);
        setDeletingCategoryId(null);
    };

    const handleToggle = async (item) => {
        if (!onToggleActive || togglingId) return;
        setTogglingId(item._id);
        try {
            await onToggleActive(item._id, !item.active);
        } finally {
            setTogglingId(null);
        }
    };

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-605 p-4 bg-back2 border border-bdr2 rounded-xl">Error: {error.message}</div>;
    if (!categories?.length) return <div className="text-center text-slate-400 p-8 bg-back2 border border-bdr2 rounded-xl font-medium">No categories found.</div>;

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible">
                <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-b border-bdr2">
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">#</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Image</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Slug</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-48">Subcategories</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-44">Status</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence mode="wait">
                        {categories.map((item, index) => {
                            const subCount = item.subCategories?.length || 0;

                            return (
                                <motion.tr
                                    key={item._id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                                >
                                    <TableCell className="text-center align-middle font-medium text-slate-400 py-3.5">
                                        {(page - 1) * limit + index + 1}
                                    </TableCell>
                                    <TableCell className="text-center align-middle py-3.5">
                                        <div className="flex justify-center">
                                            <Image
                                                height={48}
                                                width={48}
                                                quality={100}
                                                src={item.image || '/not-found-img.webp'}
                                                alt={item.name}
                                                className="object-cover rounded-lg border border-bdr2"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-left align-middle font-bold text-slate-800 py-3.5">{item.name}</TableCell>
                                    <TableCell className="text-left align-middle text-slate-500 font-mono text-xs py-3.5">{item.slug}</TableCell>

                                    {/* Subcategories count column */}
                                    <TableCell className="text-center align-middle py-3.5">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedCategoryForSub(item)}
                                            className="gap-1.5 h-8 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100/50 shadow-none font-bold text-xs"
                                        >
                                            <Layers size={13} />
                                            <span>{subCount} Subcategories</span>
                                        </Button>
                                    </TableCell>

                                    {/* Active / Inactive Toggle column */}
                                    <TableCell className="text-center align-middle py-3.5">
                                        <div className="flex items-center justify-center gap-2.5">
                                            <Switch
                                                checked={item.active !== false}
                                                disabled={!canEdit || togglingId === item._id}
                                                onCheckedChange={() => handleToggle(item)}
                                            />
                                            <Badge
                                                className={`text-[10px] px-2 py-0.5 font-bold uppercase shadow-none ${item.active !== false
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                                        : 'bg-rose-50 text-rose-700 border border-rose-150'
                                                    }`}
                                            >
                                                {item.active !== false ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-center align-middle py-3.5">
                                        <div className="flex justify-center gap-1.5">
                                            {canEdit && (
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all shadow-none"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Pencil size={14} />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all shadow-none"
                                                    onClick={() => handleDeleteClick(item._id)}
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>

            <DeleteConfirmationDialog
                isOpen={!!deletingCategoryId}
                onOpenChange={(open) => !open && setDeletingCategoryId(null)}
                onConfirm={handleDeleteConfirm}
            />

            <SubCategoryNamesDialog
                isOpen={!!selectedCategoryForSub}
                onOpenChange={(open) => !open && setSelectedCategoryForSub(null)}
                category={selectedCategoryForSub}
            />
        </section>
    );
}
