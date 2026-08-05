"use client"

import React, { useRef, useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSubCategories } from '@/hooks/useSubCategories';
import { uploadImage3 } from '@/lib/services/uploadImage2'; // <-- changed to uploadImage3
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sequenceNo: z.number().optional().nullable(),
    active: z.boolean().optional(),
    isBannerVisble: z.boolean().optional(),
    bannerLink: z.string().optional().nullable(),
    isBackgroundColorVisible: z.boolean().optional(),
    banner: z.string().nullable().optional(),
    backgroundColor: z.string().optional().nullable(),
    categories: z.array(z.string()).nullable().optional(),
    parentCategories: z.array(z.string()).nullable().optional(),
});

function GroupDialog({ open, onOpenChange, selectedGroup, onCreate, onUpdate, isSubmitting, error, hideCategoriesSelect = false }) {

    const { subCategoriesQuery } = useSubCategories();
    const activeSubCategoriesQuery = subCategoriesQuery();
    const subCategoriesData = activeSubCategoriesQuery?.data?.data || [];

    const { categoriesQuery } = useCategories();
    const categoriesRaw = categoriesQuery()?.data?.data || [];
    const categoriesData = categoriesRaw?.filter(i => i.active === true)

    const initialCategories = selectedGroup?.categories?.map(s => s?._id || s)
    const initialParentCategories = selectedGroup?.parentCategories?.map(s => s?._id || s)

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: selectedGroup || {
            name: "",
            sequenceNo: 0,
            active: true,
            banner: "",
            bannerLink: "", // <-- default
            isBannerVisble: false,
            isBackgroundColorVisible: false,
            backgroundColor: "#ffffff",
            categories: initialCategories ?? [],
            parentCategories: initialParentCategories ?? [],
        }
    });
    const { watch, setValue, control, reset } = form;

    useEffect(() => {
        if (selectedGroup) {
            reset({
                name: selectedGroup.name,
                sequenceNo: selectedGroup.sequenceNo,
                active: selectedGroup.active,
                banner: selectedGroup.banner,
                bannerLink: selectedGroup.bannerLink || "", // <-- reset value from selectedGroup
                isBannerVisble: selectedGroup.isBannerVisble,
                isBackgroundColorVisible: selectedGroup.isBackgroundColorVisible,
                backgroundColor: selectedGroup?.backgroundColor || "#ffffff",
                categories: initialCategories ?? [],
                parentCategories: initialParentCategories ?? [],
            });
        } else {
            reset({
                name: "",
                sequenceNo: 0,
                active: true,
                banner: "",
                bannerLink: "", // <-- reset default for new
                isBannerVisble: false,
                isBackgroundColorVisible: false,
                backgroundColor: "#ffffff",
                categories: [],
                parentCategories: [],
            });
        }
    }, [selectedGroup, reset, open]);

    const bannerRef = useRef(null)
    const onBannerClick = () => bannerRef.current?.click()

    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0) // 0..100

    const onBannerChange = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const toastId = toast.loading('Uploading...')
        try {
            setIsUploading(true)
            setUploadProgress(0)

            // uploadImage3 supports a progress callback (progress: 0..1)
            const url = await uploadImage3(file, (progressFraction) => {
                const pct = Math.round((progressFraction ?? 0) * 100)
                setUploadProgress(pct)
            })

            setValue('banner', url, { shouldValidate: true })
            toast.success('Banner Uploaded', { id: toastId })
        } catch (err) {
            console.error(err)
            toast.error('Error uploading banner', { id: toastId })
        } finally {
            setIsUploading(false)
            // small delay so the user sees 100%
            setTimeout(() => setUploadProgress(0), 600)
            if (e.target) e.target.value = ""
        }
    }

    const selectedIds = watch('categories') || [];
    const selectedParentIds = watch('parentCategories') || [];

    const selectedSubCategoryName = subCategoriesData.find(sub => selectedIds.includes(sub._id))?.name || ''
    const selectedParentCategoryNames = categoriesData
        .filter(cat => selectedParentIds.includes(cat._id))
        .map(cat => cat.name)

    async function onSubmit(values) {
        try {
            if (selectedGroup?._id) {
                await onUpdate({ id: selectedGroup._id, data: values })
                onOpenChange(false)
            } else {
                await onCreate(values)
                onOpenChange(false)
            }
        } catch (err) {
            console.error("Submit error:", err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedGroup?._id ? "Edit Product Group" : "Add Product Group"}
                    </DialogTitle>
                </DialogHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            {/* Section 1: General Info */}
                            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-100">
                                <h3 className="font-semibold text-sm text-gray-800 border-b pb-1.5">General Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name<span className="text-red-500"> *</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="JBL Smartwatch" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Sub-Category dropdown select */}
                                    {!hideCategoriesSelect && (
                                        <FormField
                                            control={control}
                                            name="categories"
                                            render={({ field }) => {
                                                const currentVal = field.value?.[0] || "";
                                                return (
                                                    <FormItem>
                                                        <FormLabel>Sub-Category</FormLabel>
                                                        <Select
                                                            onValueChange={(val) => setValue('categories', val ? [val] : [], { shouldDirty: true })}
                                                            value={currentVal}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="Select sub-category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {subCategoriesData.map(sub => (
                                                                    <SelectItem key={sub._id} value={sub._id}>
                                                                        {sub.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Active */}
                                <FormField
                                    control={form.control}
                                    name="active"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded border border-gray-200 bg-white p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">Active</FormLabel>
                                                <DialogDescription className="text-xs">Visible to users on application</DialogDescription>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer accent-blue-600"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Section 2: Banner Settings */}
                            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-100">
                                <h3 className="font-semibold text-sm text-gray-800 border-b pb-1.5">Banner Settings</h3>

                                {/* Banner Upload */}
                                <input
                                    type="file"
                                    accept="image/*,.gif"
                                    ref={bannerRef}
                                    className="hidden"
                                    onChange={onBannerChange}
                                />
                                <FormField
                                    control={control}
                                    name="banner"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Banner (1920px * 600px)</FormLabel>

                                            {!field.value ? (
                                                <div
                                                    className="border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center cursor-pointer bg-white hover:border-blue-400 transition-colors"
                                                    onClick={onBannerClick}
                                                >
                                                    <span className="text-gray-500 text-sm">Click to select Banner image</span>
                                                </div>
                                            ) : (
                                                <div className="relative w-full aspect-[720/256] border rounded-lg overflow-hidden bg-white">
                                                    <Image
                                                        src={field.value}
                                                        alt="image"
                                                        fill
                                                        className="object-contain"
                                                    />

                                                    {/* overlay progress when uploading */}
                                                    {isUploading && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <div className="text-white text-sm">
                                                                Uploading... {uploadProgress}%
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {field.value && (
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={onBannerClick}
                                                        className="mt-1"
                                                        disabled={isUploading}
                                                    >
                                                        Change Banner
                                                    </Button>
                                                    {isUploading && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Loader2 className="animate-spin" />
                                                            <span>{uploadProgress}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Banner Link */}
                                <FormField
                                    control={control}
                                    name="bannerLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Banner Link</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com/product-page"
                                                    className="bg-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Show Banner checkbox (Moved to bottom of Banner Settings) */}
                                <FormField
                                    control={form.control}
                                    name="isBannerVisble"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded border border-gray-200 bg-white p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">Show Banner</FormLabel>
                                                <DialogDescription className="text-xs">Display the group banner in App</DialogDescription>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer accent-blue-600"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Section 3: Color Settings */}
                            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-100">
                                <h3 className="font-semibold text-sm text-gray-800 border-b pb-1.5">Style Settings</h3>

                                {/* Background color */}
                                <FormField
                                    control={control}
                                    name="backgroundColor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Background Color</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        className="h-9 w-1/2 p-0.5 border rounded cursor-pointer bg-white shrink-0"
                                                        {...field}
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="h-9 w-1/2 font-mono bg-white"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Show Background Color checkbox (Moved to bottom of Style Settings) */}
                                <FormField
                                    control={control}
                                    name="isBackgroundColorVisible"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded border border-gray-200 bg-white p-3">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-medium">Show Background Color</FormLabel>
                                                <DialogDescription className="text-xs">Display background color in App</DialogDescription>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer accent-blue-600"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Section 4: Parent Association */}
                            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-100">
                                <h3 className="font-semibold text-sm text-gray-800 border-b pb-1.5">Parent Categories Association</h3>

                                <FormField
                                    control={control}
                                    name="parentCategories"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Parent Categories</FormLabel>
                                            <FormDescription className={'-mt-2'}>Categories to show under this group.</FormDescription>
                                            <div className="flex flex-wrap gap-1 mb-2 mt-1">
                                                <span className="text-[11px] text-gray-500 self-center">Selected:</span>
                                                {selectedParentCategoryNames.length > 0 ? (
                                                    selectedParentCategoryNames.map((name, i) => (
                                                        <Badge key={i} variant="secondary" className="rounded-sm font-semibold text-[11px] px-2 py-0.5">
                                                            {name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-gray-400 italic self-center">None</span>
                                                )}
                                            </div>
                                            <FormControl>
                                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded bg-white">
                                                    {categoriesData.map(sub => (
                                                        <label key={sub._id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                value={sub._id}
                                                                checked={selectedParentIds.includes(sub._id)}
                                                                onChange={e => {
                                                                    const checked = e.target.checked;
                                                                    if (checked) {
                                                                        setValue('parentCategories', [...selectedParentIds, sub._id], { shouldDirty: true });
                                                                    } else {
                                                                        setValue(
                                                                            'parentCategories',
                                                                            selectedParentIds.filter(id => id !== sub._id),
                                                                            { shouldDirty: true }
                                                                        );
                                                                    }
                                                                }}
                                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span>{sub.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting || isUploading} className="w-full sm:w-auto">
                                    {isSubmitting && <Loader2 className="animate-spin mr-1" />}
                                    {selectedGroup?._id ? "Update Group" : "Create Group"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default GroupDialog
