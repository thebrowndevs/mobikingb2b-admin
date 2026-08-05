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
    canDelete
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
    if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;
    if (!categories?.length) return <div className="text-center text-gray-500 p-4">No subcategories found!</div>;

    return (
        <section className="w-full">
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="text-primary">
                            <TableHead className="text-center">#</TableHead>
                            <TableHead className="text-center">Image</TableHead>
                            <TableHead className="text-center">Name</TableHead>
                            <TableHead className="text-center">Upper Banner</TableHead>
                            <TableHead className="text-center">Lower Banner</TableHead>
                            <TableHead className="text-center">Parent Category</TableHead>
                            <TableHead className="text-center">Active</TableHead>
                            <TableHead className="text-center">Products</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((item, idx) => (
                            <TableRow
                                key={item._id}
                                className="hover:bg-gray-50 transition border-b"
                            >
                                <TableCell className="text-center font-medium">{idx + 1}</TableCell>

                                <TableCell className="py-2">
                                    <div className="flex items-center justify-center min-h-16">
                                        <Image
                                            src={item?.photos?.[0] || '/not-found-img.webp'}
                                            alt={item.name}
                                            width={70}
                                            height={70}
                                            quality={100}
                                            className="object-contain rounded-sm"
                                        />
                                    </div>
                                </TableCell>

                                <TableCell className="text-center font-semibold text-gray-800">{item.name}</TableCell>

                                <TableCell className="py-2">
                                    <div className="flex items-center justify-center min-h-16">
                                        <Image
                                            src={item?.upperBanner || '/not-found-img-h.png'}
                                            alt={item.name}
                                            width={70}
                                            height={70}
                                            quality={100}
                                            className="object-contain rounded-sm"
                                        />
                                    </div>
                                </TableCell>

                                <TableCell className="py-2">
                                    <div className="flex items-center justify-center min-h-16">
                                        <Image
                                            src={item.lowerBanner || '/not-found-img-h.png'}
                                            alt={item.name}
                                            width={70}
                                            height={70}
                                            quality={100}
                                            className="object-contain rounded-sm"
                                        />
                                    </div>
                                </TableCell>

                                <TableCell className="text-center">
                                    <Badge variant="secondary" className="font-medium text-xs">
                                        {item.parentCategory?.name || 'N/A'}
                                    </Badge>
                                </TableCell>

                                <TableCell className="text-center">
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
                                            className={`text-[10px] px-2 py-0.5 font-bold uppercase ${item.active !== false
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                                                }`}
                                        >
                                            {item.active !== false ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell className="text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedSubCategoryForProducts(item)}
                                        className="gap-1.5 h-8 px-2.5 rounded-full hover:bg-primary/10 border-primary/30"
                                    >
                                        <Package size={14} className="text-primary" />
                                        <span className="font-bold text-xs">{item?.products?.length ?? 0} Products</span>
                                    </Button>
                                </TableCell>

                                <TableCell>
                                    <div className="flex gap-2 items-center justify-center">
                                        {canEdit &&
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    router.push(
                                                        `/admin/subCategories/${item.slug}/edit`
                                                    )
                                                }
                                            >
                                                <Pencil size={16} />
                                            </Button>
                                        }
                                        {canDelete &&
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDeleteClick(item._id)}
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
