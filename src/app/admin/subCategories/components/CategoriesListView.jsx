"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Package } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog ";
import SubCategoryProductsSheet from "@/components/SubCategoryProductsSheet";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { useSubCategories } from "@/hooks/useSubCategories";
import toast from "react-hot-toast";

export default function CategoriesListView({
    isLoading,
    error,
    categories,
    onDelete,
    isDeleting,
    deleteError,
    canEdit,
    canDelete,
    onEdit,
    page = 1,
    limit = 10
}) {

    const { updateSubCategoryStatus } = useSubCategories();
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [selectedSubCategoryForProducts, setSelectedSubCategoryForProducts] = useState(null);
    const router = useRouter();

    const handleDeleteClick = (categoryId) => {
        setDeletingCategoryId(categoryId);
    };

    const handleDeleteConfirm = async () => {
        await onDelete(deletingCategoryId);
        setDeletingCategoryId(null);
    };

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-605 p-4 bg-back2 border border-bdr2 rounded-xl">Error: {error.message}</div>;
    if (!categories?.length) return <div className="text-center text-slate-400 p-8 bg-back2 border border-bdr2 rounded-xl font-medium">No subcategories found.</div>;

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible">
                <TableHeader className="bg-slate-50/75">
                    <TableRow className="border-b border-bdr2">
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">#</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Image</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Name</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Upper Banner</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Lower Banner</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-44">Parent Category</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-40">Status</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-40">Products</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((item, idx) => (
                        <TableRow
                            key={item._id}
                            className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                        >
                            <TableCell className="text-center align-middle font-medium text-slate-400 py-3">
                                {(page - 1) * limit + idx + 1}
                            </TableCell>

                            <TableCell className="py-2 align-middle">
                                <div className="flex items-center justify-center">
                                    <Image
                                        src={item?.photos?.[0] || '/not-found-img.webp'}
                                        alt={item.name}
                                        width={48}
                                        height={48}
                                        quality={100}
                                        className="object-cover rounded-lg border border-bdr2"
                                    />
                                </div>
                            </TableCell>

                            <TableCell className="text-left align-middle font-bold text-slate-800 py-3">{item.name}</TableCell>

                            <TableCell className="py-2 align-middle">
                                <div className="flex items-center justify-center">
                                    <Image
                                        src={item?.upperBanner || '/not-found-img-h.png'}
                                        alt={item.name}
                                        width={64}
                                        height={36}
                                        quality={100}
                                        className="object-cover rounded-md border border-bdr2"
                                    />
                                </div>
                            </TableCell>

                            <TableCell className="py-2 align-middle">
                                <div className="flex items-center justify-center">
                                    <Image
                                        src={item.lowerBanner || '/not-found-img-h.png'}
                                        alt={item.name}
                                        width={64}
                                        height={36}
                                        quality={100}
                                        className="object-cover rounded-md border border-bdr2"
                                    />
                                </div>
                            </TableCell>

                            <TableCell className="text-left align-middle py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-650 border border-bdr2">
                                    {item.parentCategory?.name || 'N/A'}
                                </span>
                            </TableCell>

                            <TableCell className="text-center align-middle py-3">
                                <div className="flex items-center justify-center gap-2">
                                    <Switch
                                        checked={item.active !== false}
                                        disabled={!canEdit}
                                        onCheckedChange={async checked => {
                                            const toastId = toast.loading("Updating status...");
                                            try {
                                                await updateSubCategoryStatus.mutateAsync({
                                                    id: item._id,
                                                    data: { active: checked }
                                                });
                                                toast.dismiss(toastId);
                                            } catch (error) {
                                                toast.dismiss(toastId);
                                            }
                                        }}
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

                            <TableCell className="text-center align-middle py-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSubCategoryForProducts(item)}
                                    className="gap-1.5 h-8 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100/50 shadow-none font-bold text-xs"
                                >
                                    <Package size={13} />
                                    <span>{item?.products?.length ?? 0} Products</span>
                                </Button>
                            </TableCell>

                            <TableCell className="text-center align-middle py-3">
                                <div className="flex justify-center gap-1.5">
                                    {canEdit && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all shadow-none"
                                            onClick={() => {
                                                if (onEdit) {
                                                    onEdit(item.slug);
                                                } else {
                                                    router.push(`/admin/subCategories/${item.slug}/edit`);
                                                }
                                            }}
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeleteConfirmationDialog
                isOpen={!!deletingCategoryId}
                onOpenChange={(open) =>
                    !open && setDeletingCategoryId(null)
                }
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Subcategory"
                description="Are you sure you want to delete this subcategory?"
            />

            <SubCategoryProductsSheet
                open={!!selectedSubCategoryForProducts}
                onOpenChange={(open) => !open && setSelectedSubCategoryForProducts(null)}
                subCategory={selectedSubCategoryForProducts}
            />
        </section>
    );
}
