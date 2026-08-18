"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UploadCloud, X, Laptop, Smartphone } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImage3 } from '@/lib/services/uploadImage2';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    heading: z.string().min(1, "Heading is required"),
    slug: z.string().min(1, "Slug is required"),
    groupType: z.enum(['categories', 'subcategories', 'products'], {
        required_error: "Group Type is required"
    }),
    placement: z.enum(['grid', 'scroll']).default('scroll'),
    active: z.boolean().default(true),

    // Web Customization
    webBanner: z.string().optional().nullable(),
    isWebBannerVisible: z.boolean().default(false),
    webBackgroundColor: z.string().optional().nullable(),
    isWebBgColorVisible: z.boolean().default(false),

    // App Customization
    appBanner: z.string().optional().nullable(),
    isAppBannerVisible: z.boolean().default(false),
    appBackgroundColor: z.string().optional().nullable(),
    isAppBgColorVisible: z.boolean().default(false),

    bannerLink: z.string().optional().nullable(),

    categories: z.array(z.string()).default([]),
    parentCategories: z.array(z.string()).default([]),
});

function GroupDialog({ open, onOpenChange, selectedGroup, onCreate, onUpdate, isSubmitting, error }) {

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            heading: "",
            slug: "",
            groupType: "products",
            placement: "scroll",
            active: true,
            webBanner: "",
            isWebBannerVisible: false,
            webBackgroundColor: "#ffffff",
            isWebBgColorVisible: false,
            appBanner: "",
            isAppBannerVisible: false,
            appBackgroundColor: "#ffffff",
            isAppBgColorVisible: false,
            bannerLink: "",
            categories: [],
            parentCategories: [],
        }
    });

    const { setValue, control, reset, watch, formState: { isValid } } = form;
    const groupType = watch('groupType');
    const headingVal = watch('heading');

    // Autofill slug from heading
    useEffect(() => {
        if (!selectedGroup && headingVal) {
            const generated = headingVal
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setValue('slug', generated, { shouldValidate: true });
        }
    }, [headingVal, setValue, selectedGroup]);

    useEffect(() => {
        if (selectedGroup) {
            reset({
                heading: selectedGroup.heading || "",
                slug: selectedGroup.slug || "",
                groupType: selectedGroup.groupType || "products",
                placement: selectedGroup.placement || "scroll",
                active: selectedGroup.active !== undefined ? selectedGroup.active : true,

                webBanner: selectedGroup.webBanner || "",
                isWebBannerVisible: !!selectedGroup.isWebBannerVisible,
                webBackgroundColor: selectedGroup.webBackgroundColor || "#ffffff",
                isWebBgColorVisible: !!selectedGroup.isWebBgColorVisible,

                appBanner: selectedGroup.appBanner || "",
                isAppBannerVisible: !!selectedGroup.isAppBannerVisible,
                appBackgroundColor: selectedGroup.appBackgroundColor || "#ffffff",
                isAppBgColorVisible: !!selectedGroup.isAppBgColorVisible,

                bannerLink: selectedGroup.bannerLink || "",
                categories: selectedGroup.categories?.map(c => c._id || c) || [],
                parentCategories: selectedGroup.parentCategories?.map(c => c._id || c) || [],
            });
        } else {
            reset({
                heading: "",
                slug: "",
                groupType: "products",
                placement: "scroll",
                active: true,
                webBanner: "",
                isWebBannerVisible: false,
                webBackgroundColor: "#ffffff",
                isWebBgColorVisible: false,
                appBanner: "",
                isAppBannerVisible: false,
                appBackgroundColor: "#ffffff",
                isAppBgColorVisible: false,
                bannerLink: "",
                categories: [],
                parentCategories: [],
            });
        }
    }, [selectedGroup, reset, open]);

    const [uploadingField, setUploadingField] = useState(null);

    const handleFileUpload = async (e, fieldName) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading(`Uploading ${fieldName}...`);
        try {
            setUploadingField(fieldName);
            const url = await uploadImage3(file);
            setValue(fieldName, url, { shouldValidate: true, shouldDirty: true });
            toast.success("Uploaded successfully", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploadingField(null);
        }
    };

    const onSubmit = async (values) => {
        try {
            const dataToSubmit = {
                ...values,
                name: values.heading
            };
            if (selectedGroup?._id) {
                await onUpdate({ id: selectedGroup._id, data: dataToSubmit });
            } else {
                await onCreate(dataToSubmit);
            }
            onOpenChange(false);
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[100vw] sm:max-w-2xl overflow-y-auto bg-back1 text-slate-800 border-l border-bdr2 p-6 flex flex-col justify-between">
                <div>
                    <SheetHeader className="mb-5 space-y-1 p-0 gap-0">
                        <SheetTitle className="text-2xl font-bold tracking-tighter text-slate-900">
                            {selectedGroup?._id ? "Edit Group" : "Create Group"}
                        </SheetTitle>
                        <SheetDescription className="text-slate-500 text-xs">
                            Configure responsive styles, visibility rules, and layouts.
                        </SheetDescription>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">

                            {/* SECTION 1: GENERAL INFO */}
                            <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-2">
                                    1. Basic Info
                                </h3>

                                {/* Row 1: Heading */}
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={control}
                                        name="heading"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Display Heading *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Headphones & Wearables" className="bg-back1 border-bdr2 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Row 2: Slug */}
                                <div className="grid grid-cols-1 gap-4">
                                    <FormField
                                        control={control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Slug *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. headphones-and-wearables" className="bg-back1 border-bdr2 text-sm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Row 3: Group Type, View Type, Active switch */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <FormField
                                        control={control}
                                        name="groupType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Group Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-back1 border-bdr2 text-sm h-10">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white text-slate-800">
                                                        <SelectItem value="products">Product Cards Grid</SelectItem>
                                                        <SelectItem value="subcategories">Sub-Categories Grid</SelectItem>
                                                        <SelectItem value="categories">Categories Grid</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="placement"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 font-semibold text-xs">View Type</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-back1 border-bdr2 text-sm h-10">
                                                            <SelectValue placeholder="Select placement" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white">
                                                        <SelectItem value="scroll">Horizontal Scroll</SelectItem>
                                                        <SelectItem value="grid">Responsive Grid</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col space-y-2.5">
                                                <FormLabel className="text-slate-700 font-semibold text-xs">Active Status</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center h-4">
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        <span className="text-xs font-medium text-slate-500 ml-2">
                                                            {field.value ? "Visible to users" : "Hidden"}
                                                        </span>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION 2: WEB CUSTOMIZATION CARD */}
                            <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                    <Laptop size={14} /> 2. Web Configuration
                                </h3>

                                {/* Web Banner */}
                                <div className="space-y-2 border border-bdr2 rounded-lg p-3 bg-back1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700">Web Banner Image</span>
                                            <span className="text-[10px] text-slate-400 font-medium">Recommended Aspect Ratio: 16:3 (e.g. 1920x360)</span>
                                        </div>
                                        <FormField
                                            control={control}
                                            name="isWebBannerVisible"
                                            render={({ field }) => (
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-500">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <span>Visible</span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input type="file" id="webBannerFile" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'webBanner')} />
                                        {watch('webBanner') ? (
                                            <div className="relative w-full border border-bdr2 rounded-lg overflow-hidden bg-white aspect-[16/3]">
                                                <Image src={watch('webBanner')} alt="web banner" fill className="object-cover" unoptimized />
                                                <button type="button" onClick={() => setValue('webBanner', '')} className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 z-10"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <label htmlFor="webBannerFile" className="flex flex-col items-center justify-center w-full aspect-[16/3] border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-white hover:border-slate-350 transition-all">
                                                {uploadingField === 'webBanner' ? <Loader2 className="animate-spin text-primary" /> : <UploadCloud size={20} className="text-slate-400" />}
                                                <span className="text-[11px] text-slate-400 mt-1">Upload Web Banner (16:3)</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Web Background Color */}
                                <div className="space-y-2 border border-bdr2 rounded-lg p-3 bg-back1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700">Web Background Color</span>
                                        <FormField
                                            control={control}
                                            name="isWebBgColorVisible"
                                            render={({ field }) => (
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-500">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <span>Visible</span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name="webBackgroundColor"
                                        render={({ field }) => (
                                            <div className="flex gap-3 items-center">
                                                <input type="color" className="h-9 w-12 border rounded cursor-pointer shrink-0" {...field} />
                                                <Input className="bg-white border-bdr2 font-mono text-sm" {...field} />
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                             {/* SECTION 3: APP CUSTOMIZATION CARD */}
                            <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                    <Smartphone size={14} /> 3. Mobile Web & App Configuration
                                </h3>

                                {/* App Banner */}
                                <div className="space-y-2 border border-bdr2 rounded-lg p-3 bg-back1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700">Mobile Web & App Banner Image</span>
                                            <span className="text-[10px] text-slate-400 font-medium">Recommended Aspect Ratio: 5:2 (e.g. 1000x400)</span>
                                        </div>
                                        <FormField
                                            control={control}
                                            name="isAppBannerVisible"
                                            render={({ field }) => (
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-500">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <span>Visible</span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <div className="relative">
                                        <input type="file" id="appBannerFile" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'appBanner')} />
                                        {watch('appBanner') ? (
                                            <div className="relative w-full border border-bdr2 rounded-lg overflow-hidden bg-white aspect-[5/2]">
                                                <Image src={watch('appBanner')} alt="app banner" fill className="object-cover" unoptimized />
                                                <button type="button" onClick={() => setValue('appBanner', '')} className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 z-10"><X size={12} /></button>
                                            </div>
                                        ) : (
                                            <label htmlFor="appBannerFile" className="flex flex-col items-center justify-center w-full aspect-[5/2] border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-white hover:border-slate-350 transition-all">
                                                {uploadingField === 'appBanner' ? <Loader2 className="animate-spin text-primary" /> : <UploadCloud size={20} className="text-slate-400" />}
                                                <span className="text-[11px] text-slate-400 mt-1">Upload Mobile Web & App Banner (5:2)</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* App Background Color */}
                                <div className="space-y-2 border border-bdr2 rounded-lg p-3 bg-back1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700">Mobile Web & App Background Color</span>
                                        <FormField
                                            control={control}
                                            name="isAppBgColorVisible"
                                            render={({ field }) => (
                                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-500">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <span>Visible</span>
                                                </label>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={control}
                                        name="appBackgroundColor"
                                        render={({ field }) => (
                                            <div className="flex gap-3 items-center">
                                                <input type="color" className="h-9 w-12 border rounded cursor-pointer shrink-0" {...field} />
                                                <Input className="bg-white border-bdr2 font-mono text-sm" {...field} />
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* SECTION 5: BANNERS REDIRECT LINK */}
                            <div className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 shadow-none">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b border-slate-100 pb-2">
                                    5. Banners Redirect Link
                                </h3>
                                <FormField
                                    control={control}
                                    name="bannerLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Redirect Destination URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. /category/electronics" className="bg-back1 border-bdr2 text-sm" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-[10px] text-slate-400">Destination link when users click on the banners.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                        </form>
                    </Form>
                </div>

                <SheetFooter className="border-t border-bdr2 pt-4 bg-back2 -mx-6 -mb-6 p-6 shrink-0">
                    <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={!isValid || isSubmitting || !!uploadingField}
                        className="w-full bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none py-3 font-semibold rounded-lg"
                    >
                        {isSubmitting && <Loader2 className="animate-spin mr-1.5 h-4 w-4" />}
                        {selectedGroup?._id ? "Update Layout Group" : "Create Layout Group"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export default GroupDialog;
