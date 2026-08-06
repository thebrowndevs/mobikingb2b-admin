"use client";

import React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useSubCategories } from "@/hooks/useSubCategories";
import SubCategoryForm from "./SubCategoryForm";
import { Loader2 } from "lucide-react";

export default function SubCategoryDrawer({ open, onOpenChange, slug, onSaveSuccess }) {
    const { getSubServiceQuery, createSubCategory, updateSubCategory } = useSubCategories();

    // Fetch details ONLY when drawer is open and slug is provided (i.e. edit mode)
    const { data: subCategoryData, isLoading, error } = getSubServiceQuery(slug, {
        enabled: open && !!slug,
    });

    const isEditMode = !!slug;
    const defaultData = isEditMode ? subCategoryData?.data : null;

    const handleSubmit = async (formData) => {
        try {
            if (isEditMode) {
                await updateSubCategory.mutateAsync({ id: defaultData._id, data: formData });
            } else {
                await createSubCategory.mutateAsync(formData);
            }
            onOpenChange(false);
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error("SubCategory submit error:", err);
        }
    };

    const isPending = createSubCategory.isPending || updateSubCategory.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[850px] gap-0 bg-back1 border-l border-bdr2 shadow-none p-0 flex flex-col h-full">
                <SheetHeader className="py-3.5 px-6 border-b border-bdr2 bg-back2 shrink-0">
                    <SheetTitle className="text-lg font-bold text-slate-800 tracking-tighter">
                        {isEditMode ? "Edit Sub Category" : "Create Sub Category"}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-back1">
                    {isEditMode && isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-back2 border border-bdr2 rounded-xl">
                            <Loader2 className="animate-spin h-6 w-6 text-indigo-650" />
                            <span className="text-xs text-slate-500 font-semibold animate-pulse">Loading subcategory details...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center border border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold text-sm">
                            Failed to load subcategory details. Please try again.
                        </div>
                    ) : (
                        <div className="mt-1 pb-10">
                            <SubCategoryForm
                                defaultValues={defaultData}
                                onSubmit={handleSubmit}
                                loading={isPending}
                            />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
