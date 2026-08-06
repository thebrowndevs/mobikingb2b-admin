'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Globe, Smartphone, RefreshCw } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import DeleteConfirmationDialog from './DeleteConfirmationDialog ';
import toast from 'react-hot-toast';
import { useProducts } from '@/hooks/useProducts';
import Image from 'next/image';

export default function ProductsListView({
    error,
    products,
    onDelete,
    isDeleting,
    deleteError,
    canDelete,
    canEdit,
    onEdit,
    setStockEditing,
    setSelectedProduct,
    onViewDetails,
}) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState(null);
    const { updateProductStatus } = useProducts();

    const handleDeleteClick = (id) => setDeletingId(id);
    const handleDeleteConfirm = async () => {
        await onDelete(deletingId);
        setDeletingId(null);
    };

    if (error) {
        return <div className="text-red-600 p-4">Error: {error.message}</div>;
    }

    return (
        <section className="w-full bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
            <Table containerClassName="border-0 bg-transparent" className="overflow-visible text-xs">
                <TableHeader className="bg-slate-50/75 border-b border-bdr2">
                    <TableRow>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-10">#</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-16">Image</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Full Name</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-36">Category</TableHead>
                        <TableHead className="text-left font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Price Range</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Stock</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-28">Visibility</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-32">Stock Adj</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-24">Status</TableHead>
                        <TableHead className="text-center font-bold text-slate-700 text-xs uppercase tracking-wider py-4 w-24">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {products?.map((product, index) => (
                        <TableRow
                            key={product?._id || index}
                            className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/40 transition-colors cursor-pointer"
                            onClick={() => onViewDetails(product?._id)}
                        >
                            {/* # */}
                            <TableCell className="text-center text-slate-450 font-medium">
                                {index + 1}
                            </TableCell>

                            {/* Image */}
                            <TableCell>
                                <div className="py-1.5 flex justify-center">
                                    <Image
                                        src={product?.images?.[0] || '/not-found-img.webp'}
                                        alt="product"
                                        width={44}
                                        height={44}
                                        className="object-contain rounded-lg border border-bdr2 bg-back1 w-11 h-11"
                                    />
                                </div>
                            </TableCell>

                            {/* Full Name – clamped to 2 lines */}
                            <TableCell className="align-middle max-w-[200px]">
                                <span className="font-bold text-slate-800 text-xs line-clamp-2 leading-snug break-words">
                                    {product?.fullName}
                                </span>
                            </TableCell>

                            {/* Category */}
                            <TableCell className="align-middle text-left text-slate-550 font-medium">
                                {product?.category?.name || 'Uncategorized'}
                            </TableCell>

                            {/* Price Range */}
                            <TableCell className="align-middle text-left font-bold text-slate-800">
                                ₹{product?.minPrice || 0}
                                <span className="text-slate-400 font-normal mx-0.5">–</span>
                                ₹{product?.maxPrice || 0}
                            </TableCell>

                            {/* Total Stock */}
                            <TableCell className="align-middle text-center">
                                <span className={`font-bold text-sm ${(product?.totalStock || 0) > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                                    {product?.totalStock || 0}
                                </span>
                            </TableCell>

                            {/* Visibility Chips */}
                            <TableCell className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col gap-1 items-center">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none
                                        ${product.webVisibility !== false
                                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                            : 'bg-slate-100 text-slate-400 border border-bdr2'
                                        }`}>
                                        <Globe size={9} />Web
                                    </span>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none
                                        ${product.appVisibility !== false
                                            ? 'bg-violet-50 text-violet-600 border border-violet-200'
                                            : 'bg-slate-100 text-slate-400 border border-bdr2'
                                        }`}>
                                        <Smartphone size={9} />App
                                    </span>
                                </div>
                            </TableCell>

                            {/* Stock Update button */}
                            <TableCell className="align-middle text-center">
                                <div
                                    className="inline-flex cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProduct(product._id);
                                        setStockEditing(true);
                                    }}
                                >
                                    <Badge
                                        className="font-bold shadow-none rounded-md px-2 py-1 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 text-slate-700 gap-1 cursor-pointer transition-colors"
                                        variant="outline"
                                    >
                                        <RefreshCw size={9} /> Update
                                    </Badge>
                                </div>
                            </TableCell>

                            {/* Active Status Toggle */}
                            <TableCell className="align-middle" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-center">
                                    <Switch
                                        checked={product.active}
                                        onCheckedChange={async (checked) => {
                                            const toastId = toast.loading('Updating status…');
                                            try {
                                                await updateProductStatus.mutateAsync({
                                                    id: product._id,
                                                    data: { active: checked },
                                                });
                                            } catch (e) {
                                                // error handled in mutation onError
                                            } finally {
                                                toast.dismiss(toastId);
                                            }
                                        }}
                                    />
                                </div>
                            </TableCell>

                            {/* Actions */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1.5">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-7 w-7 text-slate-500 border-bdr2 rounded-lg hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                        onClick={() => onViewDetails(product?._id)}
                                        title="View Details"
                                    >
                                        <Eye size={12} />
                                    </Button>

                                    {canEdit && (
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 text-slate-500 border-bdr2 rounded-lg hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                            onClick={() => onEdit(product)}
                                            title="Edit Product"
                                        >
                                            <Pencil size={12} />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DeleteConfirmationDialog
                isOpen={!!deletingId}
                onOpenChange={(open) => { if (!open) setDeletingId(null); }}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Product"
                description="Are you sure you want to delete this Product?"
            />
        </section>
    );
}
