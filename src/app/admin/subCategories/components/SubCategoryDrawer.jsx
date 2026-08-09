"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useCategories } from "@/hooks/useCategories";
import { Loader2, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadImage3 } from "@/lib/services/uploadImage2";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").refine(val => !/\s/.test(val), {
        message: "Slug cannot contain spaces",
    }),
    active: z.boolean().default(true),
    categoryId: z.string().min(1, "Category is required"),
    photos: z.array(z.string()).default([]),
    deliveryCharge: z.coerce.number().optional().default(0),
});

export default function SubCategoryDrawer({ open, onOpenChange, slug, onSaveSuccess }) {
    const { getSubServiceQuery, createSubCategory, updateSubCategory } = useSubCategories();
    const { categoriesQuery } = useCategories();
    const activeCategories = categoriesQuery().data?.data || [];
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // Fetch details ONLY when drawer is open and slug is provided (i.e. edit mode)
    const { data: subCategoryData, isLoading, error } = getSubServiceQuery(slug, {
        enabled: open && !!slug,
    });

    const isEditMode = !!slug;
    const defaultData = isEditMode ? subCategoryData?.data : null;

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            active: true,
            categoryId: "",
            photos: [],
            deliveryCharge: 0,
        }
    });

    const { setValue, control, reset, watch, formState: { isValid } } = form;
    const watchName = watch("name");
    const photos = watch("photos") || [];

    // Autofill slug from name
    useEffect(() => {
        if (!isEditMode && watchName) {
            const generated = watchName
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setValue('slug', generated, { shouldValidate: true });
        }
    }, [watchName, setValue, isEditMode]);

    // Reset form when drawer opens or data changes
    useEffect(() => {
        if (open) {
            if (isEditMode && defaultData) {
                reset({
                    name: defaultData.name || "",
                    slug: defaultData.slug || "",
                    active: defaultData.active !== undefined ? defaultData.active : true,
                    categoryId: defaultData.parentCategory?._id || defaultData.parentCategory || "",
                    photos: defaultData.photos || [],
                    deliveryCharge: defaultData.deliveryCharge || 0,
                });
            } else if (!isEditMode) {
                reset({
                    name: "",
                    slug: "",
                    active: true,
                    categoryId: "",
                    photos: [],
                    deliveryCharge: 0,
                });
            }
        }
    }, [open, defaultData, isEditMode, reset]);

    const handleSubmit = async (values) => {
        try {
            if (isEditMode) {
                await updateSubCategory.mutateAsync({ id: defaultData._id, data: values });
            } else {
                await createSubCategory.mutateAsync(values);
            }
            onOpenChange(false);
            if (onSaveSuccess) onSaveSuccess();
        } catch (err) {
            console.error("SubCategory submit error:", err);
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const toastId = toast.loading("Uploading image...");
        try {
            setUploading(true);
            const urls = [];
            for (let file of files) {
                const url = await uploadImage3(file);
                urls.push(url);
            }
            setValue("photos", [...photos, ...urls], { shouldValidate: true, shouldDirty: true });
            toast.success("Image uploaded", { id: toastId });
        } catch (err) {
            console.error("Image upload failed:", err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const isPending = createSubCategory.isPending || updateSubCategory.isPending;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[500px] gap-0 bg-back1 border-l border-bdr2 shadow-none p-0 flex flex-col h-full text-slate-800">
                <SheetHeader className="py-4 px-6 border-b border-bdr2 bg-back2 shrink-0">
                    <SheetTitle className="text-xl font-bold tracking-tighter text-slate-900">
                        {isEditMode ? "Edit Sub Category" : "Create Sub Category"}
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-back1">
                    {isEditMode && isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-back2 border border-bdr2 rounded-xl">
                            <Loader2 className="animate-spin h-6 w-6 text-indigo-650" />
                            <span className="text-xs text-slate-500 font-semibold animate-pulse">Loading details...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center border border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold text-sm">
                            Failed to load details. Please try again.
                        </div>
                    ) : (
                        <Form {...form} key={defaultData?._id || "new"}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                                {/* Name */}
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Earbuds" className="bg-back2 border-bdr2 text-xs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Slug */}
                                <FormField
                                    control={control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Slug *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. earbuds" className="bg-back2 border-bdr2 text-xs" {...field} disabled={isEditMode} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Parent Category */}
                                <FormField
                                    control={control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Parent Category *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} key={field.value || 'empty'}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full bg-back2 border-bdr2 text-slate-700 text-xs shadow-none">
                                                        <SelectValue placeholder="Select Parent Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-white border border-bdr2 shadow-none rounded-xl text-slate-800">
                                                    {activeCategories.map((cat) => (
                                                        <SelectItem key={cat._id} value={cat._id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Delivery Charge */}
                                <FormField
                                    control={control}
                                    name="deliveryCharge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Delivery Charge</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 50" className="bg-back2 border-bdr2 text-xs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Active Toggle */}
                                <FormField
                                    control={control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-3 border border-bdr2 rounded-xl bg-back2">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Active Status</FormLabel>
                                                <p className="text-[10px] text-slate-400">Control if this subcategory is visible</p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {/* Cover Image aspect 1:1 */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Cover Image (Aspect 1:1)</Label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        {photos.map((url, idx) => (
                                            <div key={url} className="relative aspect-square border border-bdr2 rounded-xl bg-back2 overflow-hidden group">
                                                <Image src={url} alt="SubCategory image" fill className="object-cover" unoptimized />
                                                <button
                                                    type="button"
                                                    onClick={() => setValue("photos", photos.filter((_, i) => i !== idx), { shouldValidate: true, shouldDirty: true })}
                                                    className="absolute top-1.5 right-1.5 bg-red-100 rounded-full p-1 border border-bdr2 hover:bg-red-200 text-red-600 transition-colors shadow-sm"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}

                                        {photos.length === 0 && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="col-span-3 border border-dashed border-bdr2 bg-back2 hover:bg-slate-100/50 rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer text-slate-400 transition"
                                            >
                                                {uploading ? (
                                                    <Loader2 className="animate-spin text-primary" />
                                                ) : (
                                                    <>
                                                        <UploadCloud size={20} className="mb-1" />
                                                        <span className="text-[10px] font-semibold">Upload Sub Category Image (1:1)</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {photos.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-xs h-8 bg-white border-bdr2 text-slate-700 shadow-none mt-1"
                                        >
                                            Change Image
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </Form>
                    )}
                </div>

                <div className="border-t border-bdr2 pt-4 px-6 pb-6 bg-back2 shrink-0 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="text-xs h-9 border-bdr2 bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(handleSubmit)}
                        disabled={!isValid || isPending || uploading}
                        className="text-xs h-9 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text"
                    >
                        {isPending && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                        {isEditMode ? "Save Changes" : "Create Sub Category"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
