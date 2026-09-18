'use client';

import React, { useState, useEffect } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useAppCategoryPage } from '@/hooks/useAppCategoryPage';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import NotAuthorizedPage from '@/components/notAuthorized';
import { Loader2, Plus, X, Layers, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function Page() {
    const { categoryPageAdminQuery, updateCategoryPageAdmin } = useAppCategoryPage();
    const { groupsQuery } = useGroups();

    const { data: categoryPageData, isLoading: isLayoutLoading } = categoryPageAdminQuery;
    const { data: allGroupsResponse } = groupsQuery;
    const allGroupsList = allGroupsResponse?.data || [];

    const [assignedGroups, setAssignedGroups] = useState([]);
    const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

    useEffect(() => {
        if (categoryPageData && Array.isArray(categoryPageData.groups)) {
            setAssignedGroups(categoryPageData.groups);
        }
    }, [categoryPageData]);

    const handleSaveLayout = () => {
        if (updateCategoryPageAdmin.isPending) return;
        updateCategoryPageAdmin.mutate({
            groups: assignedGroups.map(g => g._id || g)
        });
    };

    const isGroupAssigned = (groupId) => assignedGroups.some(g => (g._id || g) === groupId);

    const addGroupToLayout = (group) => {
        if (isGroupAssigned(group._id)) return;
        setAssignedGroups(prev => [...prev, group]);
    };

    const removeGroupFromLayout = (groupId) => {
        setAssignedGroups(prev => prev.filter(g => (g._id || g) !== groupId));
    };

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-primary font-bold text-3xl tracking-tighter">App Category Layout</h1>
                    <p className="text-sm text-slate-500 font-medium">Configure the sequence and groups rendered in the App Category Page.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        onClick={handleSaveLayout}
                        disabled={updateCategoryPageAdmin.isPending}
                        className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                    >
                        {updateCategoryPageAdmin.isPending ? (
                            <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
                        ) : (
                            <Save size={14} className="mr-1.5" />
                        )}
                        Save Layout
                    </Button>
                </div>
            </div>

            {isLayoutLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
                </div>
            ) : (
                <div className="bg-back2 border border-bdr2 rounded-xl p-6 space-y-6">
                    <div className="flex justify-between items-center pb-3 border-b border-bdr2">
                        <div className="flex items-center gap-2">
                            <Layers size={18} className="text-indigo-600" />
                            <h3 className="text-base font-bold text-slate-800">
                                Assigned App Category Groups ({assignedGroups.length})
                            </h3>
                        </div>
                        <Button
                            onClick={() => setIsAddGroupOpen(true)}
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-bdr2 bg-white font-semibold text-slate-700 hover:bg-slate-50 shadow-none shrink-0"
                        >
                            <Plus size={14} className="mr-1" /> Add Group to App Category Page
                        </Button>
                    </div>

                    {assignedGroups.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-bdr2 rounded-xl text-slate-400 text-xs">
                            No groups attached to the App Category Page yet. Click "Add Group to App Category Page" to start.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Drag items to adjust display sequence order</span>

                            <Reorder.Group values={assignedGroups} onReorder={setAssignedGroups} className="space-y-2.5">
                                {assignedGroups.map((group, index) => (
                                    <Reorder.Item
                                        key={group._id || index}
                                        value={group}
                                        className="flex justify-between items-center p-3.5 border border-bdr2 rounded-xl bg-back1 cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-500 bg-back2 border border-bdr2 h-7 w-7 rounded-lg flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-850">{group.heading || group.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold capitalize border border-indigo-100">{group.groupType}</span>
                                                    <span className="text-[9px] font-mono text-slate-400">{group.slug}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeGroupFromLayout(group._id)}
                                            className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                                        >
                                            <X size={15} />
                                        </Button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    )}
                </div>
            )}

            {/* SHEET: Select Groups */}
            <Sheet open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <SheetContent className="w-[95vw] md:max-w-md overflow-y-auto bg-back1 text-slate-800 border-l border-bdr2 p-6 flex flex-col justify-between">
                    <div>
                        <SheetHeader className="mb-4">
                            <SheetTitle>Attach Group to App Category Page</SheetTitle>
                            <SheetDescription>Select groups to include on the mobile app category landing page.</SheetDescription>
                        </SheetHeader>

                        <div className="space-y-2 mt-4">
                            {allGroupsList.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No groups found in design studio.</p>
                            ) : (
                                allGroupsList.map(group => {
                                    const assigned = isGroupAssigned(group._id);
                                    return (
                                        <div
                                            key={group._id}
                                            className={cn(
                                                "flex justify-between items-center p-3 border rounded-xl bg-back2 transition-all",
                                                assigned ? "border-indigo-400 opacity-60" : "border-bdr2"
                                            )}
                                        >
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{group.heading || group.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{group.groupType}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={assigned ? "outline" : "default"}
                                                disabled={assigned}
                                                onClick={() => addGroupToLayout(group)}
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
                            onClick={() => setIsAddGroupOpen(false)}
                        >
                            Done
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </InnerDashboardLayout>
    );
}

export default Page;
