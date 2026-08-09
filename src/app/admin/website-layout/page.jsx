'use client';

import React, { useState } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useWebsiteLayout } from '@/hooks/useWebsiteLayout';
import WebBannersTab from './components/WebBannersTab';
import WebCategoriesTab from './components/WebCategoriesTab';
import WebGroupsTab from './components/WebGroupsTab';
import NotAuthorizedPage from '@/components/notAuthorized';
import { Layout, Image as ImageIcon, Layers, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function Page() {
    const { websiteHomeQuery, updateWebsiteHome, permissions: { canView } } = useWebsiteLayout();
    const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'categories' | 'groups'

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    const isLoading = websiteHomeQuery.isLoading;
    const layoutData = websiteHomeQuery.data || {};

    const handleSave = async (updatedFields) => {
        try {
            await updateWebsiteHome.mutateAsync(updatedFields);
        } catch (err) {
            console.error("Failed to save website layout:", err);
        }
    };

    const sidebarItems = [
        { id: 'banners', label: 'Banners', icon: <ImageIcon size={16} /> },
        { id: 'categories', label: 'Categories', icon: <Layout size={16} /> },
        { id: 'groups', label: 'Groups', icon: <Layers size={16} /> },
    ];

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Website Home Layout</h1>
                <p className="text-sm text-slate-500 font-medium">Configure sliders, circular category links, and product grouping collections for the B2B website.</p>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Inner Sidebar Menu */}
                    <div className="md:col-span-3 bg-back2 border border-bdr2 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 px-3 tracking-wider block mb-2">Layout Components</span>
                        {sidebarItems.map(item => {
                            const active = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-lg transition-all text-left",
                                        active 
                                            ? "bg-white text-indigo-650 border border-bdr2 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Lazy-Loaded Tab View Area */}
                    <div className="md:col-span-9">
                        {activeTab === 'banners' && (
                            <WebBannersTab
                                layout={layoutData}
                                onSave={handleSave}
                                isSaving={updateWebsiteHome.isPending}
                            />
                        )}

                        {activeTab === 'categories' && (
                            <WebCategoriesTab
                                layout={layoutData}
                                onSave={handleSave}
                                isSaving={updateWebsiteHome.isPending}
                            />
                        )}

                        {activeTab === 'groups' && (
                            <WebGroupsTab
                                layout={layoutData}
                                onSave={handleSave}
                                isSaving={updateWebsiteHome.isPending}
                            />
                        )}
                    </div>
                </div>
            )}
        </InnerDashboardLayout>
    );
}

export default Page;
