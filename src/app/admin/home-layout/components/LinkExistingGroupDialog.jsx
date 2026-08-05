'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LinkExistingGroupDialog({ open, onOpenChange, selectedCategory, categoryGroups, onAdd }) {
    const [selectedExistingGroupId, setSelectedExistingGroupId] = useState('');

    const { data: groupsData, isLoading, error } = useQuery({
        queryKey: ['groupsByCategory', selectedCategory?._id],
        queryFn: () => api.get(`/groups/category/${selectedCategory?._id}`).then(res => res.data?.data || res.data || []),
        enabled: open && !!selectedCategory?._id,
        staleTime: 1000 * 5, // 5 seconds
    });

    const availableGroupsToLink = (groupsData || []).filter(
        g => !categoryGroups.some(cg => cg._id === g._id)
    );

    const handleSubmit = () => {
        if (!selectedExistingGroupId || selectedExistingGroupId === 'none') return;
        const selectedGroupObj = availableGroupsToLink.find(g => g._id === selectedExistingGroupId);
        if (selectedGroupObj) {
            onAdd(selectedGroupObj);
        }
        setSelectedExistingGroupId('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border">
                <DialogHeader>
                    <DialogTitle>Add Existing Group to {selectedCategory?.name}</DialogTitle>
                    <DialogDescription>
                        Select an existing group of the "{selectedCategory?.name}" category to display in the Home Layout.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Choose Group</label>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <p className="text-xs text-red-500 font-medium">Failed to load groups. Please try again.</p>
                    ) : (
                        <Select
                            value={selectedExistingGroupId}
                            onValueChange={setSelectedExistingGroupId}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a group..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border">
                                {availableGroupsToLink.length === 0 ? (
                                    <SelectItem disabled value="none">No other groups available for this category</SelectItem>
                                ) : (
                                    availableGroupsToLink.map(g => (
                                        <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={isLoading || !selectedExistingGroupId || selectedExistingGroupId === 'none'}
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Add Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
