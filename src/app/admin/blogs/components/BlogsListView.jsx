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
        const toastId = toast.loading("Updating active status...");
        try {
            if (onUpdateField) {
                await onUpdateField({ id, data: { active: checked } });
                toast.success("Active status updated successfully!", { id: toastId });
            }
        } catch (err) {
            toast.error(err?.message || "Failed to update active status", { id: toastId });
        }
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
    if (error) return <div className="text-red-600 p-4">Error: {error.message || "Failed to load blogs"}</div>;

    return (
        <section className="w-full">
            <div className="rounded-md border bg-white overflow-visible shadow-sm">
                <Table className="overflow-visible">
                    <TableHeader className="relative z-20">
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="text-center text-primary text-base font-semibold w-16">#</TableHead>
                            <TableHead className="text-center text-primary text-base font-semibold w-24">Image</TableHead>
                            <TableHead className="text-left text-primary text-base font-semibold">Title</TableHead>
                            
                            {/* Category Filter Column Header */}
                            <TableHead className="text-center text-primary text-base font-semibold w-44">
                                <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-sm font-semibold text-gray-800">Category</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 cursor-pointer">
                                                    <ListFilter size={14} className={categoryFilter !== "all" ? "text-blue-600" : ""} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-1 bg-white" align="center">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => setCategoryFilter('all')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>All Categories</span>
                                                        {categoryFilter === 'all' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat._id}
                                                            onClick={() => setCategoryFilter(cat._id)}
                                                            className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                        >
                                                            <span className="truncate">{cat.name}</span>
                                                            {categoryFilter === cat._id && <Check size={14} className="text-blue-600" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {categoryFilter !== "all" && (
                                        <span className="text-xs font-medium text-blue-600 mt-0.5 truncate max-w-[140px]" title={getCategoryName(categoryFilter)}>
                                            {getCategoryName(categoryFilter)}
                                        </span>
                                    )}
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-primary text-base font-semibold w-32">Author</TableHead>

                            {/* Status Filter Column Header */}
                            <TableHead className="text-center text-primary text-base font-semibold w-36">
                                <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-sm font-semibold text-gray-800">Status</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 cursor-pointer">
                                                    <ListFilter size={14} className={statusFilter !== "all" ? "text-blue-600" : ""} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-36 p-1 bg-white" align="center">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => setStatusFilter('all')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>All</span>
                                                        {statusFilter === 'all' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setStatusFilter('published')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Published</span>
                                                        {statusFilter === 'published' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setStatusFilter('draft')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Draft</span>
                                                        {statusFilter === 'draft' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {statusFilter !== "all" && (
                                        <span className="text-xs font-medium text-blue-600 mt-0.5">
                                            {getStatusLabel(statusFilter)}
                                        </span>
                                    )}
                                </div>
                            </TableHead>

                            {/* Featured Filter Column Header */}
                            <TableHead className="text-center text-primary text-base font-semibold w-36">
                                <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-sm font-semibold text-gray-800">Featured</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 cursor-pointer">
                                                    <ListFilter size={14} className={featuredFilter !== "all" ? "text-blue-600" : ""} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-36 p-1 bg-white" align="center">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => setFeaturedFilter('all')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>All</span>
                                                        {featuredFilter === 'all' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setFeaturedFilter('true')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Featured</span>
                                                        {featuredFilter === 'true' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setFeaturedFilter('false')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Not Featured</span>
                                                        {featuredFilter === 'false' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {featuredFilter !== "all" && (
                                        <span className="text-xs font-medium text-blue-600 mt-0.5">
                                            {getFeaturedLabel(featuredFilter)}
                                        </span>
                                    )}
                                </div>
                            </TableHead>

                            {/* Active Filter Column Header */}
                            <TableHead className="text-center text-primary text-base font-semibold w-36">
                                <div className="flex flex-col items-center justify-center min-h-[50px] py-1">
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-sm font-semibold text-gray-800">Active</span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-500 cursor-pointer">
                                                    <ListFilter size={14} className={activeFilter !== "all" ? "text-blue-600" : ""} />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-36 p-1 bg-white" align="center">
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={() => setActiveFilter('all')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>All</span>
                                                        {activeFilter === 'all' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveFilter('true')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Active</span>
                                                        {activeFilter === 'true' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveFilter('false')}
                                                        className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm text-left flex items-center justify-between text-gray-700"
                                                    >
                                                        <span>Inactive</span>
                                                        {activeFilter === 'false' && <Check size={14} className="text-blue-600" />}
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    {activeFilter !== "all" && (
                                        <span className="text-xs font-medium text-blue-600 mt-0.5">
                                            {getActiveLabel(activeFilter)}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-primary text-base font-semibold w-40">Created At</TableHead>
                            <TableHead className="text-center text-primary text-base font-semibold w-32">Action</TableHead>
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
                                            transition={{ duration: 0.3 }}
                                            className="border-b hover:bg-gray-50/50"
                                        >
                                            <TableCell className="text-center align-middle font-medium text-gray-600">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="text-center align-middle">
                                                <div className="flex justify-center">
                                                    <Image
                                                        height={56}
                                                        width={56}
                                                        quality={80}
                                                        src={item?.image || '/not-found-img.webp'}
                                                        alt={item?.title}
                                                        className="object-cover rounded-md border"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-left align-middle font-semibold text-gray-900 max-w-xs md:max-w-sm">
                                                <span className="truncate block">{item.title}</span>
                                            </TableCell>
                                            
                                            {/* Category Cell */}
                                            <TableCell className="text-center align-middle text-gray-600 font-medium max-w-[120px]">
                                                <span className="truncate block" title={catNames}>{catNames}</span>
                                            </TableCell>

                                            <TableCell className="text-center align-middle text-gray-600 font-medium">
                                                {item.author || "Admin"}
                                            </TableCell>
                                            
                                            {/* Status Badge */}
                                            <TableCell className="text-center align-middle">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                                    item.status === 'published'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {item.status === 'published' ? 'Published' : 'Draft'}
                                                </span>
                                            </TableCell>
                                            
                                            {/* Featured Switch */}
                                            <TableCell className="text-center align-middle">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={!!item.featured}
                                                        disabled={!canEdit}
                                                        onCheckedChange={(checked) => handleToggleFeatured(item._id, checked)}
                                                    />
                                                </div>
                                            </TableCell>

                                            {/* Active Switch */}
                                            <TableCell className="text-center align-middle">
                                                <div className="flex justify-center">
                                                    <Switch
                                                        checked={item.active !== false}
                                                        disabled={!canEdit}
                                                        onCheckedChange={(checked) => handleToggleActive(item._id, checked)}
                                                    />
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center align-middle text-gray-500 text-sm">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'}
                                            </TableCell>
                                            <TableCell className="text-center align-middle">
                                                <div className="flex justify-center gap-2">
                                                    {canEdit && (
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            title="Edit Blog"
                                                            onClick={() => onEdit && onEdit(item)}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            title="Delete Blog"
                                                            onClick={() => handleDeleteClick(item._id)}
                                                        >
                                                            <Trash size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center text-gray-500 p-8 bg-white font-medium">
                                        No blogs found. Let's create one!
                                    </TableCell>
                                </TableRow>
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

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
