'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, FolderEdit } from 'lucide-react';
import GroupSubCategoriesSheet from '../../design-studio/components/GroupSubCategoriesSheet';

function WebCategoriesTab({ layout, onSave, isSaving }) {
    const [sheetOpen, setSheetOpen] = useState(false);

    const categoriesList = layout?.movingCategories || [];

    const handleSaveCategories = async ({ data }) => {
        // Translate the categories array payload back as movingCategories
        if (data && data.categories) {
            await onSave({
                movingCategories: data.categories
            });
        }
    };

    return (
        <div className="space-y-6 pt-3">
            <div className="flex justify-between items-center pb-4 border-b border-bdr2">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Home Moving Categories ({categoriesList.length})</h3>
                    <p className="text-xs text-slate-500">Configure highlighted category circle-links shown on the homepage.</p>
                </div>
                <Button
                    onClick={() => setSheetOpen(true)}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    <FolderEdit size={14} className="mr-1.5" /> Configure Categories
                </Button>
            </div>

            {categoriesList.length === 0 ? (
                <div className="text-center py-12 bg-back2 border border-dashed border-bdr2 rounded-xl text-slate-400 font-medium text-xs">
                    No categories configured. Click "Configure Categories" to assign layout subcategories.
                </div>
            ) : (
                <div className="bg-back2 border border-bdr2 rounded-xl p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {categoriesList.map((item, index) => (
                            <div
                                key={item._id || index}
                                className="flex flex-col items-center p-3 border border-bdr2 rounded-xl bg-back1 relative group transition-all"
                            >
                                <span className="absolute top-2 left-2 text-[9px] font-bold text-slate-400 bg-back2 border border-bdr2 px-1 py-0.2 rounded-md">
                                    #{index + 1}
                                </span>
                                {item.photos?.[0] || item.image ? (
                                    <img
                                        src={item.photos?.[0] || item.image}
                                        alt={item.name}
                                        className="w-14 h-14 object-cover rounded-full border border-bdr2 bg-white mt-1 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full border border-bdr2 bg-white flex items-center justify-center text-xs text-slate-350 font-bold mt-1 shadow-sm">
                                        -
                                    </div>
                                )}
                                <span className="text-xs font-bold text-slate-700 text-center mt-3 truncate w-full">
                                    {item.name}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center mt-0.5">
                                    {item.slug}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <GroupSubCategoriesSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                group={{
                    _id: layout?._id || 'website_moving_categories',
                    heading: 'Website Moving Categories',
                    categories: categoriesList
                }}
                onSave={handleSaveCategories}
                isSaving={isSaving}
            />
        </div>
    );
}

export default WebCategoriesTab;
