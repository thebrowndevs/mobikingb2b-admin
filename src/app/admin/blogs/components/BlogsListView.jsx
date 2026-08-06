"use client";

import { Button } from '@/components/ui/button';
import { Pencil, Trash, ListFilter, Check } from "lucide-react";
import Image from 'next/image';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import TableSkeleton from '@/components/custom/TableSkeleton';
import { AnimatePresence, motion } from "framer-motion";
import { Switch } from '@/components/ui/switch';
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import toast from 'react-hot-toast';
import { useState } from "react";

export default function BlogsListView({
    isLoading,
    error,
    blogs,
    onEdit,
    onDelete,
    isDeleting,
    deleteError,
    onUpdateField,
    canEdit = true,
    canDelete = true,
    categories = [],
    categoryFilter = "all",
    setCategoryFilter,
    statusFilter = "all",
    setStatusFilter,
    activeFilter = "all",
    setActiveFilter,
    featuredFilter = "all",
    setFeaturedFilter
}) {
    const [deletingBlogId, setDeletingBlogId] = useState(null);

    const handleDeleteClick = (id) => {
        setDeletingBlogId(id);
    };

    const handleDeleteConfirm = async () => {
        if (onDelete && deletingBlogId) {
            await onDelete(deletingBlogId);
        }
        setDeletingBlogId(null);
    };

    const handleToggleFeatured = async (id, checked) => {
        const toastId = toast.loading("Updating featured status...");
        try {
            if (onUpdateField) {
                await onUpdateField({ id, data: { featured: checked } });
                toast.success("Featured status updated successfully!", { id: toastId });
            }
        } catch (err) {
            toast.error(err?.message || "Failed to update featured status", { id: toastId });
        }
    };

    const handleToggleActive = async (id, checked) => {
        await onUpdateField({ id, data: { active: checked } });

    };

    const getCategoryName = (id) => {
        if (id === 'all') return '';
        const cat = categories.find(c => c._id === id);
        return cat ? cat.name : '';
    };

    const getStatusLabel = (val) => {
        if (val === 'all') return '';
        return val === 'published' ? 'Published' : 'Draft';
    };

    const getFeaturedLabel = (val) => {
        if (val === 'all') return '';
        return val === 'true' ? 'Featured' : 'Not Featured';
    };

    const getActiveLabel = (val) => {
        if (val === 'all') return '';
        return val === 'true' ? 'Active' : 'Inactive';
    };

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-600 p-4 bg-back2 border border-bdr2 rounded-xl">Error: {error.message || "Failed to load blogs"}</div>;

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible">
                <TableHeader className="bg-slate-50/75 relative z-20">
                    <TableRow className="border-b border-bdr2 hover:bg-slate-50/75">
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">#</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-24">Image</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Title</TableHead>

                        {/* Category Filter Column Header */}
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider w-44">
                            <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
                                                <ListFilter size={13} className={categoryFilter !== "all" ? "text-indigo-600" : ""} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 p-1 bg-back2 border border-bdr2 shadow-none" align="center">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => setCategoryFilter('all')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>All Categories</span>
                                                    {categoryFilter === 'all' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat._id}
                                                        onClick={() => setCategoryFilter(cat._id)}
                                                        className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                    >
                                                        <span className="truncate">{cat.name}</span>
                                                        {categoryFilter === cat._id && <Check size={14} className="text-indigo-600" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {categoryFilter !== "all" && (
                                    <span className="text-[10px] font-semibold text-indigo-650 mt-0.5 truncate max-w-[130px] bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150" title={getCategoryName(categoryFilter)}>
                                        {getCategoryName(categoryFilter)}
                                    </span>
                                )}
                            </div>
                        </TableHead>

                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Author</TableHead>

                        {/* Status Filter Column Header */}
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider w-36">
                            <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
                                                <ListFilter size={13} className={statusFilter !== "all" ? "text-indigo-600" : ""} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 p-1 bg-back2 border border-bdr2 shadow-none" align="center">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => setStatusFilter('all')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>All</span>
                                                    {statusFilter === 'all' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('published')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Published</span>
                                                    {statusFilter === 'published' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setStatusFilter('draft')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Draft</span>
                                                    {statusFilter === 'draft' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {statusFilter !== "all" && (
                                    <span className="text-[10px] font-semibold text-indigo-650 mt-0.5 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">
                                        {getStatusLabel(statusFilter)}
                                    </span>
                                )}
                            </div>
                        </TableHead>

                        {/* Featured Filter Column Header */}
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider w-36">
                            <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Featured</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
                                                <ListFilter size={13} className={featuredFilter !== "all" ? "text-indigo-600" : ""} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 p-1 bg-back2 border border-bdr2 shadow-none" align="center">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => setFeaturedFilter('all')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>All</span>
                                                    {featuredFilter === 'all' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setFeaturedFilter('true')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Featured</span>
                                                    {featuredFilter === 'true' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setFeaturedFilter('false')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Not Featured</span>
                                                    {featuredFilter === 'false' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {featuredFilter !== "all" && (
                                    <span className="text-[10px] font-semibold text-indigo-655 mt-0.5 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">
                                        {getFeaturedLabel(featuredFilter)}
                                    </span>
                                )}
                            </div>
                        </TableHead>

                        {/* Active Filter Column Header */}
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider w-36">
                            <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active</span>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer">
                                                <ListFilter size={13} className={activeFilter !== "all" ? "text-indigo-600" : ""} />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-36 p-1 bg-back2 border border-bdr2 shadow-none" align="center">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => setActiveFilter('all')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>All</span>
                                                    {activeFilter === 'all' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setActiveFilter('true')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Active</span>
                                                    {activeFilter === 'true' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                                <button
                                                    onClick={() => setActiveFilter('false')}
                                                    className="px-3 py-1.5 hover:bg-back1 rounded-lg text-sm text-left flex items-center justify-between text-slate-750 font-medium"
                                                >
                                                    <span>Inactive</span>
                                                    {activeFilter === 'false' && <Check size={14} className="text-indigo-600" />}
                                                </button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                {activeFilter !== "all" && (
                                    <span className="text-[10px] font-semibold text-indigo-650 mt-0.5 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-150">
                                        {getActiveLabel(activeFilter)}
                                    </span>
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-40">Created At</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence mode="wait">
                        {blogs && blogs.length > 0 ? (
                            blogs.map((item, index) => {
                                const catNames = item?.categories?.map(c => typeof c === 'object' ? c.name : c).join(', ') || '-';
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
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-3.5">
                                            <div className="flex justify-center">
                                                <Image
                                                    height={48}
                                                    width={48}
                                                    quality={80}
                                                    src={item?.image || '/not-found-img.webp'}
                                                    alt={item?.title || "Blog Image"}
                                                    className="object-cover rounded-lg border border-bdr2"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left align-middle font-bold text-slate-800 py-3.5 max-w-xs md:max-w-sm">
                                            <span className="truncate block">{item.title}</span>
                                        </TableCell>

                                        {/* Category Cell */}
                                        <TableCell className="text-center align-middle text-slate-600 font-semibold py-3.5 max-w-[120px]">
                                            <span className="truncate block" title={catNames}>{catNames}</span>
                                        </TableCell>

                                        <TableCell className="text-center align-middle text-slate-650 font-medium py-3.5">
                                            {item.author || "Admin"}
                                        </TableCell>

                                        {/* Status Badge */}
                                        <TableCell className="text-center align-middle py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.status === 'published'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                                    : 'bg-slate-100 text-slate-500 border-bdr2'
                                                }`}>
                                                {item.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </TableCell>

                                        {/* Featured Switch */}
                                        <TableCell className="text-center align-middle py-3.5">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={!!item.featured}
                                                    disabled={!canEdit}
                                                    onCheckedChange={(checked) => handleToggleFeatured(item._id, checked)}
                                                />
                                            </div>
                                        </TableCell>

                                        {/* Active Switch */}
                                        <TableCell className="text-center align-middle py-3.5">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={item.active !== false}
                                                    disabled={!canEdit}
                                                    onCheckedChange={(checked) => handleToggleActive(item._id, checked)}
                                                />
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center align-middle text-slate-500 text-sm py-3.5">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '-'}
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-3.5">
                                            <div className="flex justify-center gap-1.5">
                                                {canEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all shadow-none"
                                                        title="Edit Blog"
                                                        onClick={() => onEdit && onEdit(item)}
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                )}
                                                {canDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all shadow-none"
                                                        title="Delete Blog"
                                                        onClick={() => handleDeleteClick(item._id)}
                                                    >
                                                        <Trash size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center text-slate-400 py-8 bg-back2 font-medium">
                                    No blogs found. Let's create one!
                                </TableCell>
                            </TableRow>
                        )}
                    </AnimatePresence>
                </TableBody>
            </Table>

            <DeleteConfirmationDialog
                isOpen={!!deletingBlogId}
                onOpenChange={(open) => !open && setDeletingBlogId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Blog Post"
                description="Are you sure you want to delete this blog post? This action cannot be undone."
            />
        </section>
    );
}
