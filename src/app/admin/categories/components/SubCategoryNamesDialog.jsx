"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

export default function SubCategoryNamesDialog({ isOpen, onOpenChange, category }) {
    const subCategories = category?.subCategories || [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full rounded-xl p-6 bg-white shadow-xl">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" />
                        <DialogTitle className="text-xl font-bold text-gray-800">
                            {category?.name || 'Category'} Subcategories
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-gray-500 mt-1">
                        Showing all {subCategories.length} subcategories under <span className="font-semibold text-gray-700">{category?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-3 max-h-[60vh] overflow-y-auto space-y-2.5">
                    {subCategories.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm italic">
                            No subcategories created yet for this category.
                        </div>
                    ) : (
                        subCategories.map((sub, index) => (
                            <div
                                key={sub._id || index}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100/80 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm text-gray-800">{sub.name}</span>
                                    <span className="text-xs text-gray-400 font-mono">/{sub.slug}</span>
                                </div>
                                <Badge
                                    className={`text-[10px] px-2 py-0.5 font-bold uppercase ${sub.active !== false
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                                        }`}
                                >
                                    {sub.active !== false ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
