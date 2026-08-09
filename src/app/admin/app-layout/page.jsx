'use client';

import React, { useState, useEffect } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AppTabDrawer from './components/AppTabDrawer';
import NotAuthorizedPage from '@/components/notAuthorized';
import { Loader2, Plus, Pencil, Trash2, X, Layers, Layout, Save } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function Page() {
    const {
        appTabsQuery,
        createAppTab,
        updateAppTab,
        deleteAppTab,
        reorderAppTabs,
        permissions: { canView, canEdit }
    } = useAppLayout();

    const { groupsQuery } = useGroups();
    const { data: allGroupsResponse } = groupsQuery;
    const allGroupsList = allGroupsResponse?.data || [];

    const [selectedTabId, setSelectedTabId] = useState(null);
    const [tabs, setTabs] = useState([]);
    
    // Assigned groups for the currently selected tab
    const [assignedGroups, setAssignedGroups] = useState([]);

    // Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingTab, setEditingTab] = useState(null); // null means "Create mode", tab object means "Edit mode"

    const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

    const isLoading = appTabsQuery.isLoading;

    useEffect(() => {
        if (appTabsQuery.data) {
            setTabs(appTabsQuery.data);
            if (appTabsQuery.data.length > 0 && !selectedTabId) {
                setSelectedTabId(appTabsQuery.data[0]._id);
            }
        }
    }, [appTabsQuery.data]);

    // Update assigned groups list whenever selected tab or tabs data changes
    useEffect(() => {
        if (selectedTabId && tabs.length > 0) {
            const selectedTab = tabs.find(t => t._id === selectedTabId);
            if (selectedTab) {
                setAssignedGroups(selectedTab.groups || []);
            }
        } else {
            setAssignedGroups([]);
        }
    }, [selectedTabId, tabs]);

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    const activeTabObj = tabs.find(t => t._id === selectedTabId);

    // Reorder Tabs
    const handleReorderTabs = async (newOrder) => {
        setTabs(newOrder);
        try {
            await reorderAppTabs.mutateAsync(newOrder.map(t => t._id));
        } catch (e) {
            console.error(e);
        }
    };

    // Reorder Groups inside Tab
    const handleReorderGroups = async (newOrder) => {
        setAssignedGroups(newOrder);
    };

    // Save Groups Sequence to Database
    const handleSaveGroupsSequence = async () => {
        if (!selectedTabId) return;
        const toastId = toast.loading("Saving layout sequence...");
        try {
            await updateAppTab.mutateAsync({
                tabId: selectedTabId,
                data: {
                    groups: assignedGroups.map(g => g._id || g)
                }
            });
            toast.success("Groups sequence saved successfully", { id: toastId });
        } catch (e) {
            toast.error("Failed to save sequence", { id: toastId });
        }
    };

    // Handle Create or Edit Save Action from Tab Drawer
    const handleSaveTab = async (payload) => {
        if (editingTab) {
            // Edit Mode
            await updateAppTab.mutateAsync({
                tabId: editingTab._id,
                data: payload
            });
        } else {
            // Create Mode
            await createAppTab.mutateAsync(payload);
        }
    };

    // Delete Tab
    const handleDeleteTab = async (id) => {
        if (!confirm("Are you sure you want to delete this tab?")) return;
        try {
            await deleteAppTab.mutateAsync(id);
            if (selectedTabId === id) {
                setSelectedTabId(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Active Toggle
    const handleToggleActive = async (id, currentStatus) => {
        try {
            await updateAppTab.mutateAsync({
                tabId: id,
                data: { active: !currentStatus }
            });
        } catch (e) {
            console.error(e);
        }
    };

    // Add Group Helper
    const isGroupAssigned = (groupId) => assignedGroups.some(g => (g._id || g) === groupId);

    const addGroupToTab = (group) => {
        if (isGroupAssigned(group._id)) return;
        setAssignedGroups(prev => [...prev, group]);
    };

    const removeGroupFromTab = (groupId) => {
        setAssignedGroups(prev => prev.filter(g => (g._id || g) !== groupId));
    };

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-primary font-bold text-3xl tracking-tighter">App Layout</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage and configure app homepage tabs and nested layout group sequences.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTab(null);
                        setIsDrawerOpen(true);
                    }}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    <Plus size={16} className="mr-1" /> Add Home Tab
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANEL: Tabs List & Reordering */}
                    <div className="lg:col-span-5 bg-back2 border border-bdr2 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-bdr2">
                            <Layout size={16} className="text-indigo-650" />
                            <h3 className="text-sm font-bold text-slate-800">App Tabs List ({tabs.length})</h3>
                        </div>

                        {tabs.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4 text-center">No tabs found. Click Add Home Tab to start.</p>
                        ) : (
                            <Reorder.Group values={tabs} onReorder={handleReorderTabs} className="space-y-2">
                                {tabs.map((tab) => {
                                    const active = selectedTabId === tab._id;
                                    return (
                                        <Reorder.Item
                                            key={tab._id}
                                            value={tab}
                                            className={cn(
                                                "flex items-center justify-between p-3 border rounded-xl cursor-grab active:cursor-grabbing transition-all",
                                                active 
                                                    ? "bg-white border-indigo-400 shadow-sm" 
                                                    : "bg-back1 border-bdr2 hover:border-slate-350"
                                            )}
                                        >
                                            <div 
                                                onClick={() => setSelectedTabId(tab._id)}
                                                className="flex-1 min-w-0 pr-2 cursor-pointer"
                                            >
                                                <p className="text-xs font-bold text-slate-800 truncate">{tab.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                                    Groups Attached: {tab.groups?.length || 0}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {/* Active Switch */}
                                                <Switch
                                                    checked={tab.active}
                                                    onCheckedChange={() => handleToggleActive(tab._id, tab.active)}
                                                    className="scale-90"
                                                />

                                                {/* Edit Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-500 hover:text-slate-800"
                                                    onClick={() => {
                                                        setEditingTab(tab);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                >
                                                    <Pencil size={13} />
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-650 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteTab(tab._id)}
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        )}
                    </div>

                    {/* RIGHT PANEL: Assigned Groups in Selected Tab */}
                    <div className="lg:col-span-7 bg-back2 border border-bdr2 rounded-xl p-4 space-y-4">
                        {!selectedTabId ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Layers size={36} className="text-slate-300 mb-2" />
                                <p className="text-xs font-medium">Select an app tab from the left panel to manage its layout groups.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center pb-2 border-b border-bdr2">
                                    <div className="flex items-center gap-2">
                                        <Layers size={16} className="text-indigo-650" />
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Groups inside "{activeTabObj?.name}" ({assignedGroups.length})
                                        </h3>
                                    </div>
                                    <Button
                                        onClick={() => setIsAddGroupOpen(true)}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-bdr2 bg-white font-semibold text-slate-700 hover:bg-slate-50 shadow-none shrink-0"
                                    >
                                        <Plus size={14} className="mr-1" /> Add Group
                                    </Button>
                                </div>

                                {assignedGroups.length === 0 ? (
                                    <div className="text-center py-16 border border-dashed border-bdr2 rounded-xl text-slate-400 text-xs">
                                        No groups attached to this tab. Click "Add Group" to assign layout items.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Drag to reorder layout display sequence</span>
                                        
                                        <Reorder.Group values={assignedGroups} onReorder={handleReorderGroups} className="space-y-2.5">
                                            {assignedGroups.map((group, index) => (
                                                <Reorder.Item
                                                    key={group._id || index}
                                                    value={group}
                                                    className="flex justify-between items-center p-3 border border-bdr2 rounded-xl bg-back1 cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-400 bg-back2 border border-bdr2 h-6 w-6 rounded-lg flex items-center justify-center">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-850">{group.heading}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-semibold capitalize">{group.groupType}</span>
                                                                <span className="text-[9px] font-mono text-slate-400">{group.slug}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeGroupFromTab(group._id)}
                                                        className="h-8 w-8 text-red-650 hover:bg-red-50 rounded-lg shrink-0"
                                                    >
                                                        <X size={15} />
                                                    </Button>
                                                </Reorder.Item>
                                            ))}
                                        </Reorder.Group>

                                        <div className="flex justify-end pt-4 border-t border-bdr2">
                                            <Button
                                                onClick={handleSaveGroupsSequence}
                                                className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                                            >
                                                <Save size={14} className="mr-1.5" /> Save Groups Sequence
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONFIG DRAWER */}
            <AppTabDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                tab={editingTab}
                onSave={handleSaveTab}
                isSaving={createAppTab.isPending || updateAppTab.isPending}
            />

            {/* SHEET: Assign Groups to Tab */}
            <Sheet open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <SheetContent className="w-[95vw] md:max-w-md overflow-y-auto bg-back1 text-slate-800 border-l border-bdr2 p-6 flex flex-col justify-between">
                    <div>
                        <SheetHeader className="mb-4">
                            <SheetTitle>Attach Layout Group</SheetTitle>
                            <SheetDescription>Attach available layout groups to the "{activeTabObj?.name}" tab.</SheetDescription>
                        </SheetHeader>

                        <div className="space-y-2 mt-4">
                            {allGroupsList.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No groups found in the design studio.</p>
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
                                                <p className="text-xs font-bold text-slate-800">{group.heading}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{group.groupType}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={assigned ? "outline" : "default"}
                                                disabled={assigned}
                                                onClick={() => addGroupToTab(group)}
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
