'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/hooks/useGroups';
import { cn } from '@/lib/utils';
import { Loader2, Plus, X, Laptop, Smartphone, MoveUp, MoveDown } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

function WebGroupsTab({ layout, onSave, isSaving }) {
    const { groupsQuery } = useGroups();
    const [assignedGroups, setAssignedGroups] = useState([]);
    const [selectorOpen, setSelectorOpen] = useState(false);

    const { data: allGroupsResponse } = groupsQuery;
    const allGroupsList = allGroupsResponse?.data || [];

    useEffect(() => {
        if (layout?.groups) {
            setAssignedGroups(layout.groups);
        }
    }, [layout]);

    const isAssigned = (id) => assignedGroups.some(g => (g._id || g) === id);

    const addGroup = (group) => {
        if (isAssigned(group._id)) return;
        setAssignedGroups(prev => [...prev, group]);
    };

    const removeGroup = (id) => {
        setAssignedGroups(prev => prev.filter(g => (g._id || g) !== id));
    };

    const handleSaveClick = async () => {
        try {
            await onSave({
                groups: assignedGroups.map(g => g._id || g)
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 pt-3">
            <div className="flex justify-between items-center pb-4 border-b border-bdr2">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Home Layout Groups ({assignedGroups.length})</h3>
                    <p className="text-xs text-slate-500">Attach and sequence product grids, categories, and sliders on the homepage.</p>
                </div>
                <Button
                    onClick={() => setSelectorOpen(true)}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    <Plus size={16} className="mr-1" /> Add Layout Group
                </Button>
            </div>

            {assignedGroups.length === 0 ? (
                <div className="text-center py-12 bg-back2 border border-dashed border-bdr2 rounded-xl text-slate-400 font-medium text-xs">
                    No layout groups attached. Click "Add Layout Group" to get started.
                </div>
            ) : (
                <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Drag items to change display sequence</span>
                    <Reorder.Group values={assignedGroups} onReorder={setAssignedGroups} className="space-y-3">
                        {assignedGroups?.map((group, index) => {
                            return (
                                <Reorder.Item
                                    key={group._id || index}
                                    value={group}
                                    className="flex justify-between items-center p-4 border border-bdr2 rounded-xl bg-back1 cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-400 bg-back2 border border-bdr2 h-6 w-6 rounded-lg flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800">{group.heading}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-semibold capitalize">{group.groupType}</span>
                                                <span className="text-[10px] font-mono text-slate-400">{group.slug}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeGroup(group._id)}
                                        className="h-8 w-8 text-red-650 hover:bg-red-50 rounded-lg"
                                    >
                                        <X size={16} />
                                    </Button>
                                </Reorder.Item>
                            );
                        })}
                    </Reorder.Group>

                    <div className="flex justify-end pt-4 border-t border-bdr2 mt-4">
                        <Button
                            onClick={handleSaveClick}
                            disabled={isSaving}
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                        >
                            {isSaving && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                            Save Groups Sequence
                        </Button>
                    </div>
                </div>
            )}

            {/* Selector Sheet */}
            <Sheet open={selectorOpen} onOpenChange={setSelectorOpen}>
                <SheetContent className="w-[95vw] md:max-w-md overflow-y-auto bg-back1 text-slate-800 border-l border-bdr2 p-6 flex flex-col justify-between">
                    <div>
                        <SheetHeader className="mb-4">
                            <SheetTitle>Add Layout Group</SheetTitle>
                            <SheetDescription>Attach available layout groups to the website homepage.</SheetDescription>
                        </SheetHeader>

                        <div className="space-y-2 mt-4">
                            {allGroupsList.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No groups found in the design studio.</p>
                            ) : (
                                allGroupsList.map(group => {
                                    const assigned = isAssigned(group._id);
                                    return (
                                        <div
                                            key={group._id}
                                            className={cn(
                                                "flex justify-between items-center p-3 border rounded-xl bg-back2 transition-all",
                                                assigned ? "border-indigo-400 opacity-60" : "border-bdr2"
                                            )}
                                        >
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{group.heading}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{group.groupType}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={assigned ? "outline" : "default"}
                                                disabled={assigned}
                                                onClick={() => addGroup(group)}
                                                className="text-[10px] font-semibold h-7 shadow-none"
                                            >
                                                {assigned ? "Added" : "Add Group"}
                                            </Button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="border-t border-bdr2 pt-4 mt-6">
                        <Button
                            className="w-full bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none"
                            onClick={() => setSelectorOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

export default WebGroupsTab;
