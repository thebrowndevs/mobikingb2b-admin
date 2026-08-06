"use client"

import React, { useRef } from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCategories } from '@/hooks/useCategories';
import PCard from '@/components/custom/PCard';
import LoaderButton from '@/components/custom/LoaderButton';
import { Textarea } from '@/components/ui/textarea';
import { toast, Toaster } from 'sonner';
import { uploadImage3 } from '@/lib/services/uploadImage2'; // <-- changed to uploadImage3
import { Reorder } from 'framer-motion';

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").refine(val => !/\s/.test(val), {
        message: "Slug cannot contain spaces",
    }),
    sequenceNo: z.number().optional(),
    icon: z.string().optional(),
    active: z.boolean(),
    featured: z.boolean(),
    theme: z.enum(["light", "dark"]),
    categoryId: z.string().min(1, "Category is required"),
    photos: z.array(z.string()).optional().nullable(),
    upperBanner: z.string().optional().nullable(),
    lowerBanner: z.string().optional().nullable(),
    deliveryCharge: z.coerce.number().optional(),
    minOrderAmount: z.coerce.number().optional(),
    minFreeDeliveryOrderAmount: z.coerce.number().optional(),
});

export default function SubCategoryForm({ defaultValues, onSubmit, loading, error }) {
    const { categoriesQuery } = useCategories()
    const activeCategories = categoriesQuery().data?.data;

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: defaultValues || {
            name: "",
            slug: "",
            icon: "",
            active: true,
            featured: false,
            theme: 'light',
            sequenceNo: 0,
            categoryId: "",
            photos: [],
            upperBanner: '',
            lowerBanner: '',
            deliveryCharge: 0,
            minOrderAmount: 0,
            minFreeDeliveryOrderAmount: 0,
        },
    });

    const { watch, setValue, control, reset } = form;

    // slug generation
    const watchName = form.watch("name");
    useEffect(() => {
        const slug = watchName
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        form.setValue("slug", slug);
    }, [watchName]);

    // fill in exactly the shape your formSchema expects
    useEffect(() => {
        if (defaultValues) {
            reset({
                ...defaultValues,
                categoryId: defaultValues?.parentCategory?._id || ''
            })
        }
    }, [defaultValues, reset])

    const photos = watch("photos") || [];
    // const [photosDialogOpen, setPhotosDialogOpen] = useState(false);

    const upperInputRef = useRef(null)
    const onUpperClick = () => upperInputRef.current?.click();

    const lowerInputRef = useRef(null)
    const onLowerClick = () => lowerInputRef.current?.click()

    // Upper banner using uploadImage3
    const onUpperChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading("Uploading...");
        try {
            // you can pass a progress callback if you want to show progress
            const url = await uploadImage3(file, (progress) => {
                // progress is 0..1 — currently unused, but available
            });
            setValue("upperBanner", url, { shouldValidate: true });
            toast.success("Image uploaded", { id: toastId });
        } catch (err) {
            console.error("Upper banner upload failed:", err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            if (e.target) e.target.value = "";
        }
    };

    // Lower banner using uploadImage3
    const onLowerChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading("Uploading...");
        try {
            const url = await uploadImage3(file, (progress) => {
                // progress available here if needed
            });
            setValue("lowerBanner", url, { shouldValidate: true });
            toast.success("Image uploaded", { id: toastId });
        } catch (err) {
            console.error("Lower banner upload failed:", err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            if (e.target) e.target.value = "";
        }
    };

    // Photos (append new uploads to existing photos) using uploadImage3
    if (error) {
        console.log(error)
    }
    return (
        <div className="">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left Column: Name, Slug, parent category, delivery */}
                        <PCard className="space-y-4 bg-back2 border-bdr2 shadow-none rounded-xl p-5">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Name<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Boat Headphones"
                                                {...field}
                                                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Slug */}
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Slug<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="boat-headphones"
                                                {...field}
                                                disabled
                                                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Parent Category */}
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Parent Category<span className="text-red-500"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none">
                                                    <SelectValue placeholder="Select Parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                                {activeCategories?.map((cat) => (
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
                                control={form.control}
                                name="deliveryCharge"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Delivery Charge<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="120"
                                                {...field}
                                                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* Right Column: Icon, Theme, Active state */}
                        <PCard className="space-y-4 bg-back2 border-bdr2 shadow-none rounded-xl p-5 flex flex-col justify-between">
                            {/* Icon */}
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Icon SVG<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Paste an svg icon here."
                                                {...field}
                                                className="max-h-24 min-h-[5rem] overflow-y-auto bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Theme select */}
                            <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">Theme for Text Color on App Header</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none">
                                                    <SelectValue placeholder="Select theme" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Active Switch */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border border-bdr2 bg-back1/40 px-4 py-3.5 rounded-xl space-y-0 mt-3">
                                        <FormLabel className="text-xs font-bold text-slate-700 cursor-pointer">Active Status</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* upper Banner card */}
                        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5">
                            <input
                                type="file"
                                accept="image/*,.gif"
                                ref={upperInputRef}
                                className="hidden"
                                onChange={onUpperChange}
                            />
                            <FormField
                                control={control}
                                name="upperBanner"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-555 uppercase tracking-wider">Upper Banner<span className="text-red-500">*</span></FormLabel>

                                        {!field.value ? (
                                            <div
                                                className="border border-dashed border-bdr2 bg-back1 hover:bg-slate-50/50 rounded-xl mt-3 h-36 flex flex-col items-center justify-center cursor-pointer text-slate-455 transition-colors duration-200"
                                                onClick={onUpperClick}
                                            >
                                                <span className="text-xs font-semibold">Upper Banner (1080w * 540h)</span>
                                                <p className="text-[10px] text-slate-400 font-medium">Max size - 5mb</p>
                                            </div>
                                        ) : (
                                            <div className="relative w-full aspect-[2/1] border border-bdr2 rounded-lg mb-2 overflow-hidden bg-back1">
                                                <Image
                                                    src={field.value}
                                                    alt="Selected Upper Banner"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}

                                        {field.value && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onUpperClick}
                                                className="bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold shadow-none text-xs py-1 h-8 mt-1"
                                            >
                                                Change Upper Banner
                                            </Button>
                                        )}

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* lower Banner card */}
                        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5">
                            <input
                                type="file"
                                accept="image/*,.gif"
                                ref={lowerInputRef}
                                className="hidden"
                                onChange={onLowerChange}
                            />
                            <FormField
                                control={control}
                                name="lowerBanner"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-555 uppercase tracking-wider">Lower Banner<span className="text-red-500">*</span></FormLabel>

                                        {!field.value ? (
                                            <div
                                                className="border border-dashed border-bdr2 bg-back1 hover:bg-slate-50/50 rounded-xl mt-3 h-36 flex flex-col items-center justify-center cursor-pointer text-slate-455 transition-colors duration-200"
                                                onClick={onLowerClick}
                                            >
                                                <span className="text-xs font-semibold">Lower Banner (720w * 320h)</span>
                                                <p className="text-[10px] text-slate-400 font-medium">Max size - 5mb</p>
                                            </div>
                                        ) : (
                                            <div className="relative w-full aspect-[2/1] border border-bdr2 rounded-lg mb-2 overflow-hidden bg-back1">
                                                <Image
                                                    src={field.value}
                                                    alt="Selected lower Banner"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}

                                        {field.value && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={onLowerClick}
                                                className="bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold shadow-none text-xs py-1 h-8 mt-1"
                                            >
                                                Change Lower Banner
                                            </Button>
                                        )}

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* Primary aspect photos card */}
                        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 md:col-span-2">
                            <FormField
                                control={form.control}
                                name="photos"
                                render={() => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold text-slate-555 uppercase tracking-wider">Cover Image (Aspect Ratio - 1:1)</FormLabel>

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={(fileInput) => (form.fileInputRef = fileInput)}
                                            onChange={async (e) => {
                                                const files = e.target.files;
                                                if (!files || files.length === 0) return;

                                                const toastId = toast.loading("Uploading image...");
                                                const urls = [];

                                                for (let file of files) {
                                                    try {
                                                        const url = await uploadImage3(file);
                                                        urls.push(url);
                                                    } catch (err) {
                                                        console.error("Image upload failed:", err);
                                                        toast.error("One image failed to upload", { id: toastId });
                                                    }
                                                }

                                                const existing = form.getValues("photos") || [];
                                                form.setValue("photos", [...existing, ...urls], {
                                                    shouldValidate: true,
                                                });

                                                toast.success("Image uploaded", { id: toastId });
                                                if (e.target) e.target.value = ""; // reset input
                                            }}
                                        />

                                        {/* Image Preview */}
                                        {photos.length > 0 ? (
                                            <div className="mt-3 flex flex-wrap gap-3">
                                                {photos.map((url, idx) => (
                                                    <div
                                                        key={url}
                                                        className="relative border border-bdr2 rounded-lg overflow-hidden group cursor-grab w-40 h-40 bg-back1"
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`ss image ${idx + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...photos];
                                                                updated.splice(idx, 1);
                                                                form.setValue("photos", updated, { shouldValidate: true });
                                                            }}
                                                            className="absolute top-1.5 right-1.5 bg-back2 rounded-full p-1 border border-bdr2 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10 shadow-none"
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className="border border-dashed border-bdr2 bg-back1 hover:bg-slate-50/50 rounded-xl mt-3 h-36 flex flex-col items-center justify-center cursor-pointer text-slate-455 transition-colors duration-200"
                                                onClick={() => form.fileInputRef?.click()}
                                            >
                                                <span className="text-xs font-semibold">Sub Category Image Aspect Ratio - 1:1</span>
                                                <p className="text-[10px] text-slate-400 font-medium">Max size - 5mb</p>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        {photos.length > 0 && (
                                            <Button
                                                type="button"
                                                onClick={() => form.fileInputRef?.click()}
                                                className="bg-back2 border border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold shadow-none text-xs py-1 h-8 mt-2"
                                            >
                                                Change Image
                                            </Button>
                                        )}

                                    </FormItem>
                                )}
                            />
                        </PCard>
                    </div>

                    {/* Fixed Sticky Form Actions Footer */}
                    <div className="sticky bottom-0 bg-back2 border-t border-bdr2 p-4 flex items-center justify-end mt-8 -mx-6 -mb-6 rounded-b-xl z-20 shadow-none shrink-0">
                        <LoaderButton
                            loading={loading}
                            type="submit"
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold px-5 h-9"
                        >
                            {defaultValues ? "Update Sub Category" : "Create Sub Category"}
                        </LoaderButton>
                    </div>
                </form>
            </Form>
            <Toaster position="top-right" richColors />
        </div>
    );
}
