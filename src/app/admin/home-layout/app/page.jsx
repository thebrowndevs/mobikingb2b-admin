'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useHome } from '@/hooks/useHome'
import { useSubCategories } from '@/hooks/useSubCategories'
import { useGroups } from '@/hooks/useGroups'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import PCard from '@/components/custom/PCard'
import CategoryTable from '../components/CategoryTable'
import Loader from '@/components/Loader'
import NotAuthorizedPage from '@/components/notAuthorized'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Reorder, motion } from 'framer-motion'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'

import GroupDialog from '../../design-studio/components/GroupDialog'
import GroupProductsSheet from '../../design-studio/components/GroupProductsSheet'
import DeleteConfirmationDialog from '../../design-studio/components/DeleteConfirmationDialog '
import LinkExistingGroupDialog from '../components/LinkExistingGroupDialog'

export default function AppPage() {
    const queryClient = useQueryClient()
    const { homeQuery, updateHome, permissions: { canView, canEdit } } = useHome()
    const { subCategoriesQuery } = useSubCategories()
    const {
        createGroup,
        updateGroupStatus,
        updateGroup,
        updateProductsInGroup,
        deleteGroup,
        permissions: { canAdd: groupCanAdd, canEdit: groupCanEdit, canDelete: groupCanDelete }
    } = useGroups()

    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Edit Group dialog states
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
    const [isSavingGroup, setIsSavingGroup] = useState(false)

    // Add Existing Group dialog states
    const [isAddExistingDialogOpen, setIsAddExistingDialogOpen] = useState(false)
    const [selectedExistingGroupId, setSelectedExistingGroupId] = useState("")

    // Product association sheet states
    const [groupForProducts, setGroupForProducts] = useState(null)
    const [isProductsSheetOpen, setIsProductsSheetOpen] = useState(false)

    // Delete group confirmation states
    const [deletingGroupId, setDeletingGroupId] = useState(null)

    // Reorder sequence dialog states
    const [isSequenceDialogOpen, setIsSequenceDialogOpen] = useState(false)
    const [tempGroups, setTempGroups] = useState([])

    // Drag-and-scroll references and handlers
    const scrollContainerRef = useRef(null)
    const scrollIntervalRef = useRef(null)

    const handleDrag = (event, info) => {
        const container = scrollContainerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const clientY = info.point.y
        const threshold = 60 // pixels from top/bottom bounds to trigger scroll
        const scrollSpeed = 15 // speed of scroll in pixels per interval

        // Clear any previous interval to prevent multiple intervals running
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current)
            scrollIntervalRef.current = null
        }

        if (clientY < rect.top + threshold) {
            // Scroll up
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop -= scrollSpeed
            }, 16)
        } else if (clientY > rect.bottom - threshold) {
            // Scroll down
            scrollIntervalRef.current = setInterval(() => {
                container.scrollTop += scrollSpeed
            }, 16)
        }
    }

    const handleDragEnd = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current)
            scrollIntervalRef.current = null
        }
    }


    const allCategories = subCategoriesQuery()?.data?.data || []
    const homeData = homeQuery?.data?.data || {}
    const initialCategoriesData = homeData.categories || []

    // Fetch groups under selected category (using optimized admin endpoint)
    const { data: categoryGroupsResponse, isLoading: isGroupsLoading } = useQuery({
        queryKey: ['categoryGroups', selectedCategory?._id],
        queryFn: () => api.get(`/home/app/groups/admin/${selectedCategory?._id}`).then(res => res.data?.data || []),
        enabled: !!selectedCategory?._id,
    })

    const categoryGroups = categoryGroupsResponse || []

    // Local sequence state
    const [localGroups, setLocalGroups] = useState([])

    useEffect(() => {
        if (categoryGroupsResponse) {
            setLocalGroups(categoryGroupsResponse)
        } else {
            setLocalGroups([])
        }
    }, [categoryGroupsResponse, selectedCategory])

    const handleCategoryClick = (category) => {
        setSelectedCategory(category)
        setIsDrawerOpen(true)
    }

    const handleStatusToggle = async (group, checked) => {
        const toastId = toast.loading('Updating group status...')
        try {
            await updateGroupStatus.mutateAsync({ id: group._id, data: { active: checked } })
            queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
        } catch (err) {
            console.error(err)
        } finally {
            toast.dismiss(toastId)
        }
    }

    const handleDeleteClick = (groupId) => {
        setDeletingGroupId(groupId)
    }

    const handleDeleteConfirm = async () => {
        const toastId = toast.loading('Deleting group...')
        try {
            await deleteGroup.mutateAsync(deletingGroupId)
            queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
            setDeletingGroupId(null)
        } catch (err) {
            console.error(err)
        } finally {
            toast.dismiss(toastId)
        }
    }

    if (homeQuery.isLoading || subCategoriesQuery.isLoading) {
        return <Loader />
    }

    if (!canView) {
        return <NotAuthorizedPage />
    }

    return (
        <div className="flex flex-col gap-4">
            <PCard>
                <CategoryTable
                    initialData={initialCategoriesData}
                    allCategories={allCategories}
                    groups={homeData.groups || []}
                    onSave={(newSeq) => {
                        const data = { categories: newSeq }
                        updateHome.mutateAsync(data)
                    }}
                    canEdit={canEdit}
                    onCategoryClick={handleCategoryClick}
                />
            </PCard>

            {/* Category Groups Drawer */}
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <SheetContent className="w-[95vw] md:min-w-[85vw] lg:min-w-[75vw] flex flex-col h-full max-h-screen p-0 overflow-hidden">
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0 flex items-center justify-between">
                            <div>
                                <SheetTitle className="text-2xl font-bold">Groups under {selectedCategory?.name}</SheetTitle>
                                <SheetDescription className="text-sm text-gray-500 mt-1">
                                    Manage active products, settings, and sequence for this category.
                                </SheetDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                {localGroups.length > 1 && (
                                    <Button
                                        onClick={() => {
                                            setTempGroups(localGroups)
                                            setIsSequenceDialogOpen(true)
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800"
                                    >
                                        Change Sequence
                                    </Button>
                                )}
                                {groupCanAdd && (
                                    <Button
                                        onClick={() => {
                                            setSelectedGroup({ categories: [selectedCategory?._id || selectedCategory] })
                                            setIsGroupDialogOpen(true)
                                        }}
                                        size="sm"
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add New Group
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isGroupsLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader />
                                </div>
                            ) : localGroups.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No groups associated with this category yet.</p>
                            ) : (
                                <div className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xs">
                                    <Table>
                                        <TableHeader className="bg-gray-50 dark:bg-zinc-800/50">
                                            <TableRow>
                                                <TableHead className="w-[50px]">#</TableHead>
                                                <TableHead>Name</TableHead>
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
                                            {localGroups.map((group, index) => (
                                                <TableRow key={group._id || index} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20">
                                                    <TableCell>{index + 1}</TableCell>

                                                    {/* Group Name */}
                                                    <TableCell className="font-semibold text-gray-800 dark:text-gray-200">{group.name}</TableCell>

                                                    {/* Banner Image */}
                                                    <TableCell>
                                                        {group.banner ? (
                                                            <img
                                                                src={group.banner}
                                                                alt={group.name}
                                                                className="w-12 h-8 object-cover rounded border border-gray-100"
                                                            />
                                                        ) : '-'}
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
                                                        ) : '-'}
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
                                                            <Button variant="outline" size="sm">{group.products?.length || 0}</Button>
                                                            {groupCanEdit && (
                                                                <Pencil
                                                                    size={14}
                                                                    className="hover:text-primary text-gray-400 cursor-pointer transition-colors"
                                                                    onClick={() => {
                                                                        setGroupForProducts(group)
                                                                        setIsProductsSheetOpen(true)
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Active Switch */}
                                                    <TableCell className="align-middle">
                                                        <div className="flex justify-center">
                                                            <Switch
                                                                checked={group.active}
                                                                disabled={updateGroupStatus.isPending}
                                                                onCheckedChange={(checked) => handleStatusToggle(group, checked)}
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* Actions */}
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {groupCanEdit && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="outline"
                                                                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                                                    onClick={() => {
                                                                        setSelectedGroup(group)
                                                                        setIsGroupDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <Pencil size={14} />
                                                                </Button>
                                                            )}
                                                            {groupCanDelete && (
                                                                <Button
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="h-8 w-8"
                                                                    onClick={() => handleDeleteClick(group._id)}
                                                                >
                                                                    <Trash2 size={14} />
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
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Sequence Dialog */}
            <Dialog open={isSequenceDialogOpen} onOpenChange={setIsSequenceDialogOpen}>
                <DialogContent ref={scrollContainerRef} className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border p-6">
                    <DialogHeader className="border-b pb-3 mb-4">
                        <DialogTitle>Reorder Groups in {selectedCategory?.name}</DialogTitle>
                        <DialogDescription className="mt-1">
                            Drag to reorder the sequence of groups. Changes apply on save.
                        </DialogDescription>

                        {/* Action Buttons in Header */}
                        <div className="flex gap-2 mt-4">
                            {groupCanAdd && (
                                <Button
                                    onClick={() => setIsAddExistingDialogOpen(true)}
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300 border-gray-200 border-dashed hover:border-gray-400"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Existing Group
                                </Button>
                            )}
                            <Button
                                onClick={async () => {
                                    const originalGroupIds = (homeData.groups || []).map(g => g._id || g);
                                    const oldCategoryGroupIds = new Set(categoryGroups.map(g => g._id));

                                    let insertIndex = originalGroupIds.findIndex(id => oldCategoryGroupIds.has(id));
                                    if (insertIndex === -1) {
                                        insertIndex = originalGroupIds.length;
                                    }

                                    const filteredGroups = originalGroupIds.filter(id => !oldCategoryGroupIds.has(id));
                                    const newGroupIds = tempGroups.map(g => g._id || g);
                                    const updatedHomeGroups = [
                                        ...filteredGroups.slice(0, insertIndex),
                                        ...newGroupIds,
                                        ...filteredGroups.slice(insertIndex)
                                    ];

                                    const toastId = toast.loading('Saving sequence...')
                                    try {
                                        await updateHome.mutateAsync({ groups: updatedHomeGroups })
                                        queryClient.invalidateQueries({ queryKey: ['home'] })
                                        queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
                                        toast.success('Sequence saved successfully!', { id: toastId })
                                        setIsSequenceDialogOpen(false)
                                        setIsDrawerOpen(false)
                                    } catch (err) {
                                        toast.error('Failed to save sequence', { id: toastId })
                                    }
                                }}
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                Save Sequence
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Scrollable Group List */}
                    <Reorder.Group
                        axis="y"
                        values={tempGroups}
                        onReorder={setTempGroups}
                        layoutScroll
                        className="space-y-2 mb-2"
                    >
                        {tempGroups.map((grp) => (
                            <Reorder.Item
                                key={grp._id}
                                value={grp}
                                layout
                                onDrag={handleDrag}
                                onDragEnd={handleDragEnd}
                                whileDrag={{ scale: 1.02, boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
                            >
                                <div className="flex justify-between items-center p-3 border rounded bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 cursor-grab active:cursor-grabbing">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{grp.name}</span>
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <span className="text-xs text-gray-400 select-none mr-2">Drag to Reorder</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            onClick={() => {
                                                setTempGroups(prev => prev.filter(g => g._id !== grp._id));
                                            }}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Group Dialog */}
            <GroupDialog
                open={isGroupDialogOpen}
                onOpenChange={setIsGroupDialogOpen}
                onCreate={async (data) => {
                    setIsSavingGroup(true)
                    try {
                        const payload = {
                            ...data,
                            categories: data.categories && data.categories.length ? data.categories : [selectedCategory?._id || selectedCategory]
                        }
                        const res = await createGroup.mutateAsync(payload)
                        const newGroupId = res?.data?.data?._id || res?.data?._id || res?._id
                        if (newGroupId) {
                            const originalGroupIds = (homeData.groups || []).map(g => g._id || g)
                            const updatedHomeGroups = [...originalGroupIds, newGroupId]
                            await updateHome.mutateAsync({ groups: updatedHomeGroups })
                        }
                        queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
                        setIsGroupDialogOpen(false)
                    } catch (err) {
                        console.error(err)
                    } finally {
                        setIsSavingGroup(false)
                    }
                }}
                selectedGroup={selectedGroup?._id ? selectedGroup : selectedGroup} // pass selectedGroup even if it has no id to prepopulate categories list
                isSubmitting={isSavingGroup}
                error={createGroup.error || updateGroup.error}
                onUpdate={async (payload) => {
                    setIsSavingGroup(true)
                    try {
                        await updateGroup.mutateAsync(payload)
                        queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
                        setIsGroupDialogOpen(false)
                    } catch (err) {
                        console.error(err)
                    } finally {
                        setIsSavingGroup(false)
                    }
                }}
                hideCategoriesSelect={false}
            />

            {/* Paginated Products Selection Sheet */}
            {groupForProducts && (
                <GroupProductsSheet
                    open={isProductsSheetOpen}
                    onOpenChange={setIsProductsSheetOpen}
                    group={groupForProducts}
                    onProductsAdd={async (data) => {
                        await updateProductsInGroup.mutateAsync(data)
                        queryClient.invalidateQueries({ queryKey: ['categoryGroups', selectedCategory?._id] })
                        setIsProductsSheetOpen(false)
                    }}
                    updatingProducts={updateProductsInGroup.isPending}
                    updateProductsError={updateProductsInGroup.error}
                />
            )}

            {/* Delete Confirmation */}
            <DeleteConfirmationDialog
                isOpen={!!deletingGroupId}
                onOpenChange={(open) => open || setDeletingGroupId(null)}
                onConfirm={handleDeleteConfirm}
                isLoading={deleteGroup.isPending}
                error={deleteGroup.error}
                title="Delete Group"
                description="Are you sure you want to delete this Group?"
            />

            <LinkExistingGroupDialog
                open={isAddExistingDialogOpen}
                onOpenChange={setIsAddExistingDialogOpen}
                selectedCategory={selectedCategory}
                categoryGroups={tempGroups}
                onAdd={(group) => {
                    if (!tempGroups.some(g => g._id === group._id)) {
                        setTempGroups(prev => [...prev, group]);
                        setIsAddExistingDialogOpen(false);
                        toast.success(`Group "${group.name}" added to list. Drag to set position and click Save.`);
                    } else {
                        toast.error('Group is already in the list');
                    }
                }}
            />
        </div>
    )
}
