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
    canDelete
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
    if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;
    if (!categories?.length) return <div className="text-center text-gray-500 p-4">No categories Found!</div>;

    return (
        <section className="w-full">
            <div className="rounded-md border">
                <Table className={'overflow-hidden'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-primary text-base">#</TableHead>
                            <TableHead className="text-center text-primary text-base">Image</TableHead>
                            <TableHead className="text-center text-primary text-base">Name</TableHead>
                            <TableHead className="text-center text-primary text-base">Slug</TableHead>
                            <TableHead className="text-center text-primary text-base">Subcategories</TableHead>
                            <TableHead className="text-center text-primary text-base">Status</TableHead>
                            <TableHead className="text-center text-primary text-base">Action</TableHead>
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
                                        transition={{ duration: 0.3 }}
                                        className="border-b"
                                    >
                                        <TableCell className="text-center align-middle font-medium">{index + 1}</TableCell>
                                        <TableCell className="text-center align-middle">
                                            <div className="flex justify-center">
                                                <Image
                                                    height={80}
                                                    width={80}
                                                    quality={100}
                                                    src={item.image || '/not-found-img.webp'}
                                                    alt={item.name}
                                                    className="object-contain rounded-sm"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle font-semibold text-gray-800">{item.name}</TableCell>
                                        <TableCell className="text-center align-middle text-gray-500 font-mono text-xs">{item.slug}</TableCell>

                                        {/* Subcategories count column */}
                                        <TableCell className="text-center align-middle">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedCategoryForSub(item)}
                                                className="gap-1.5 h-8 px-2.5 rounded-full hover:bg-primary/10 border-primary/30"
                                            >
                                                <Layers size={14} className="text-primary" />
                                                <span className="font-bold text-xs">{subCount} Subcategories</span>
                                            </Button>
                                        </TableCell>

                                        {/* Active / Inactive Toggle column */}
                                        <TableCell className="text-center align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <Switch
                                                    checked={item.active !== false}
                                                    disabled={!canEdit || togglingId === item._id}
                                                    onCheckedChange={() => handleToggle(item)}
                                                />
                                                <Badge
                                                    className={`text-[10px] px-2 py-0.5 font-bold uppercase ${item.active !== false
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                                                        }`}
                                                >
                                                    {item.active !== false ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center align-middle">
                                            <div className="flex justify-center gap-2">
                                                {canEdit &&
                                                    <Button size="icon" variant="outline" onClick={() => onEdit(item)}>
                                                        <Pencil size={16} />
                                                    </Button>
                                                }
                                                {canDelete &&
                                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(item._id)}>
                                                        <Trash size={16} />
                                                    </Button>
                                                }
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

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
