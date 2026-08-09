'use client';
import { useState } from 'react';
import { Pencil, Trash, Laptop, Smartphone } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import TableSkeleton from '@/components/custom/TableSkeleton';
import { useGroups } from '@/hooks/useGroups';
import { toast } from 'react-hot-toast';
import DeleteConfirmationDialog from './DeleteConfirmationDialog ';

export default function GroupsTable({
    error,
    groups,
    onDelete,
    isDeleting,
    deleteError,
    canDelete,
    canEdit,
    onEdit,
    onEditItems,
    isLoading,
    page = 1,
    limit = 10
}) {
    const { updateGroupStatus } = useGroups();
    const groupsData = Array.isArray(groups) ? groups : (groups?.data || []);
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteClick = id => setDeletingId(id);
    const handleDeleteConfirm = async () => {
        await onDelete(deletingId);
        setDeletingId(null);
    };

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;

    return (
        <section className="w-full">
            <div className="overflow-x-auto rounded-xl border border-bdr2 bg-back2">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-back1 border-b border-bdr2 text-slate-700">
                            <TableHead className="w-[50px] font-semibold text-xs text-slate-500">#</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500">Heading</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500">Slug</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500">Type</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500">Web Configuration</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500">App Configuration</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500 text-center">Items</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500 text-center">Status</TableHead>
                            <TableHead className="font-semibold text-xs text-slate-500 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupsData.map((group, index) => {
                            const getItemsCount = () => {
                                if (group.groupType === 'products') return group.products?.length || 0;
                                if (group.groupType === 'subcategories') return group.categories?.length || 0;
                                if (group.groupType === 'categories') return group.parentCategories?.length || 0;
                                return 0;
                            };

                            return (
                                <TableRow key={group._id || index} className="hover:bg-slate-50/50 border-b border-bdr2 transition">
                                    <TableCell className="text-xs font-medium text-slate-500">
                                        {(page - 1) * limit + index + 1}
                                    </TableCell>

                                    {/* Heading */}
                                    <TableCell className="font-semibold text-slate-800 text-sm">{group.heading}</TableCell>

                                    {/* Slug */}
                                    <TableCell className="font-mono text-xs text-slate-500">{group.slug || '-'}</TableCell>

                                    {/* Type */}
                                    <TableCell className="text-xs">
                                        <span className="px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 capitalize">
                                            {group.groupType}
                                        </span>
                                    </TableCell>

                                    {/* Web Config */}
                                    <TableCell className="text-xs space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Laptop size={12} className="text-slate-400" />
                                            {group.webBanner ? (
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${group.isWebBannerVisible ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400 line-through'}`}>
                                                    Banner
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[10px]">No Banner</span>
                                            )}
                                            {group.webBackgroundColor ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3.5 h-3.5 rounded border border-bdr2" style={{ backgroundColor: group.webBackgroundColor }} />
                                                    <span className={`text-[10px] font-semibold ${group.isWebBgColorVisible ? 'text-slate-650' : 'text-slate-400 line-through'}`}>
                                                        BG Color
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[10px]">No BG Color</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* App Config */}
                                    <TableCell className="text-xs space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={12} className="text-slate-400" />
                                            {group.appBanner ? (
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${group.isAppBannerVisible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400 line-through'}`}>
                                                    Banner
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[10px]">No Banner</span>
                                            )}
                                            {group.appBackgroundColor ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3.5 h-3.5 rounded border border-bdr2" style={{ backgroundColor: group.appBackgroundColor }} />
                                                    <span className={`text-[10px] font-semibold ${group.isAppBgColorVisible ? 'text-slate-650' : 'text-slate-400 line-through'}`}>
                                                        BG Color
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-[10px]">No BG Color</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Items Count */}
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className="font-semibold text-slate-700 text-xs bg-back1 border border-bdr2 px-2 py-0.5 rounded-lg">
                                                {getItemsCount()}
                                            </span>
                                            {canEdit && (
                                                <Pencil
                                                    size={13}
                                                    className="hover:text-indigo-600 text-slate-400 cursor-pointer transition-colors"
                                                    onClick={() => onEditItems && onEditItems(group)}
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Active Status Switch */}
                                    <TableCell className="align-middle">
                                        <div className="flex justify-center">
                                            <Switch
                                                checked={group.active}
                                                disabled={updateGroupStatus.isPending}
                                                onCheckedChange={async checked => {
                                                    const toastId = toast.loading('Updating status…');
                                                    try {
                                                        await updateGroupStatus.mutateAsync({ id: group._id, data: { active: checked } });
                                                    } catch (e) {
                                                    } finally {
                                                        toast.dismiss(toastId);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            {canEdit && (
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 text-slate-600 hover:text-slate-900 border-bdr2 hover:bg-slate-50 shadow-none"
                                                    onClick={() => onEdit(group)}
                                                >
                                                    <Pencil size={13} />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    className="h-8 w-8 shadow-none bg-red-650 hover:bg-red-700"
                                                    onClick={() => handleDeleteClick(group._id)}
                                                >
                                                    <Trash size={13} />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}

                    </TableBody>
                </Table>
            </div>

            <DeleteConfirmationDialog
                isOpen={!!deletingId}
                onOpenChange={open => open || setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={isDeleting}
                error={deleteError}
                title="Delete Group"
                description="Are you sure you want to delete this Group?"
            />
        </section>
    );
}
