'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Pencil, Trash } from 'lucide-react';
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
import Loader from '@/components/Loader';
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
    setGroupForProducts,
    setPrdouctsSheet,
    isLoading
}) {
    const { updateGroupStatus } = useGroups();

    // const {
    //     mutateAsync: updateGroupAsync,
    //     isPending: updating,
    // } = updateGroupStatus;

    const groupsData = Array.isArray(groups) ? groups : (groups?.data || []);
    const [deletingId, setDeletingId] = useState(null);

    const handleDeleteClick = id => setDeletingId(id);
    const handleDeleteConfirm = async () => {
        await onDelete(deletingId);
        setDeletingId(null);
    };

    if (isLoading) return <TableSkeleton showHeader={false} />;
    if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>;
    // console.log(groupsData)
    return (
        <section className="w-full">
            <div className="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-50 text-gray-700">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Sub-Category</TableHead>
                            <TableHead>Banner</TableHead>
                            <TableHead>Banner Visible</TableHead>
                            <TableHead>BG Color</TableHead>
                            <TableHead>BG Color Visible</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupsData.map((group, index) => (
                            <TableRow key={group._id || index} className="even:bg-gray-50/50 hover:bg-gray-100/70 transition">
                                <TableCell>{index + 1}</TableCell>
                                
                                {/* Group Name */}
                                <TableCell className="font-semibold text-gray-800">{group.name}</TableCell>

                                {/* Sub-Category */}
                                <TableCell className="font-medium text-blue-800">
                                    {group.categories && group.categories.length > 0 ? (
                                        group.categories.map(c => c.name || c).join(', ')
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">None</span>
                                    )}
                                </TableCell>

                                {/* Banner Image */}
                                <TableCell>
                                    {group.banner ? (
                                        <img
                                            src={group.banner}
                                            alt={group.name}
                                            className="w-12 h-8 object-cover rounded border border-gray-100"
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">-</span>
                                    )}
                                </TableCell>

                                {/* Banner Visible badge */}
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${group.isBannerVisble ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                        {group.isBannerVisble ? 'Visible' : 'Not Visible'}
                                    </span>
                                </TableCell>

                                {/* Background Color Indicator */}
                                <TableCell>
                                    {group.backgroundColor ? (
                                        <div
                                            className="w-14 h-6 rounded border border-gray-400"
                                            style={{ backgroundColor: group.backgroundColor }}
                                        />
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">-</span>
                                    )}
                                </TableCell>

                                {/* Background Color Visible badge */}
                                <TableCell>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${group.isBackgroundColorVisible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                        {group.isBackgroundColorVisible ? 'Visible' : 'Not Visible'}
                                    </span>
                                </TableCell>

                                {/* Products count and pencil edit */}
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="h-8">
                                            {group.products?.length || 0}
                                        </Button>
                                        {canEdit && (
                                            <Pencil
                                                size={14}
                                                className="hover:text-primary text-gray-400 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setPrdouctsSheet(true);
                                                    setGroupForProducts(group);
                                                }}
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
                                                className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                                onClick={() => onEdit(group)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                        )}
                                        {canDelete && (
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8"
                                                onClick={() => handleDeleteClick(group._id)}
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
