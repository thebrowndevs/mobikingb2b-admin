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
                <form onSubmit={form.handleSubmit(onSubmit)} >

                    <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <PCard className={'space-y-4'}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Boat Headphones" {...field} />
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
                                    <FormItem>
                                        <FormLabel>Slug<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="boat-headphones" {...field} disabled />
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
                                    <FormItem>
                                        <FormLabel>Parent Category<span className="text-red-500"> *</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={'w-full'}>
                                                    <SelectValue placeholder="Select Parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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

                            <FormField
                                control={form.control}
                                name="deliveryCharge"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Delivery Charge<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="120" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        <PCard>

                            {/* Icon */}
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Paste an svg icon here."
                                                {...field}
                                                className="max-h-24 min-h-[5rem] overflow-y-auto"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between border bg-gray-100 px-3 py-5 rounded-sm">
                                        <FormLabel>Active</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='theme'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Theme for text color on App header</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={'w-full'}>
                                                    <SelectValue placeholder='Select theme' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* upper Banner */}
                        <PCard>
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
                                    <FormItem>
                                        <FormLabel>Upper Banner<span className="text-red-500">*</span></FormLabel>

                                        {!field.value ? (
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg mt-3 h-36 flex flex-col items-center justify-center cursor-pointer"
                                                onClick={onUpperClick}
                                            >
                                                <span className="text-gray-500">Upper banner: 1080w * 540h</span>
                                                <p className="text-gray-500 text-xs">Max size - 5mb</p>
                                            </div>
                                        ) : (
                                            <div className="relative w-full aspect-[2/1] border rounded-lg mb-2">
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
                                                className="mt-1"
                                            >
                                                Change Upper Banner
                                            </Button>
                                        )}

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        <input
                            type="file"
                            accept="image/*,.gif"
                            ref={lowerInputRef}
                            className="hidden"
                            onChange={onLowerChange}
                        />
                        <PCard>
                            <FormField
                                control={control}
                                name="lowerBanner"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lower Banner<span className="text-red-500">*</span></FormLabel>

                                        {!field.value ? (
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg mt-3 h-36 flex flex-col items-center justify-center cursor-pointer"
                                                onClick={onLowerClick}
                                            >
                                                <span className="text-gray-500">Lower banner: 720w * 320h</span>
                                                <p className="text-gray-500 text-xs">Max size - 5mb</p>
                                            </div>
                                        ) : (
                                            <div className="relative w-full aspect-[2/1] border rounded-lg mb-2">
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
                                                className="mt-1"
                                            >
                                                Change Lower Banner
                                            </Button>
                                        )}

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        <PCard>
                            <FormField
                                control={form.control}
                                name="photos"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Image (Aspect Ratio - 1:1)</FormLabel>

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
                                                        // pass optional progress callback if you want to show per-file progress
                                                        const url = await uploadImage3(file, (progress) => {
                                                            // progress value 0..1
                                                        });
                                                        urls.push(url);
                                                    } catch (err) {
                                                        console.error("Image upload failed:", err);
                                                        toast.error("One image failed to upload", { id: toastId });
                                                    }
                                                }

                                                const existing = form.getValues("photos") || [];
                                                // append newly uploaded images to existing photos
                                                form.setValue("photos", [...existing, ...urls], {
                                                    shouldValidate: true,
                                                });

                                                toast.success("Image uploaded", { id: toastId });
                                                if (e.target) e.target.value = ""; // reset input
                                            }}
                                        />

                                        {/* Image Preview */}
                                        {photos.length > 0 ? (
                                            <div className="mt-4 flex flex-wrap gap-3" >
                                                {photos.map((url, idx) => (
                                                    <div
                                                        key={url}
                                                        className="relative border rounded-lg overflow-hidden group cursor-grab"
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`ss image ${idx + 1}`}
                                                            width={800}
                                                            height={800}
                                                            className="object-cover h-60 w-full"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...photos];
                                                                updated.splice(idx, 1);
                                                                form.setValue("photos", updated, { shouldValidate: true });
                                                            }}
                                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md 
                                          hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className="border-2 border-dashed border-gray-300 rounded-lg mt-3 h-36 flex flex-col items-center justify-center cursor-pointer"
                                                onClick={() => form.fileInputRef?.click()}
                                            >
                                                <span className="text-gray-500">Sub Category Image Aspect Ratio - 1:1</span>
                                                <p className="text-gray-500 text-xs">Max size - 5mb</p>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        {photos.length > 0 &&
                                            <Button
                                                type="button"
                                                onClick={() => form.fileInputRef?.click()}
                                                className="mt-2 w-fit"
                                            >
                                                Change Image
                                            </Button>
                                        }

                                    </FormItem>
                                )}
                            />

                        </PCard>
                    </div>
                    <div className='flex items-end justify-end mt-3'>
                        <LoaderButton
                            loading={loading}
                            type="submit"
                        >
                            {defaultValues ? "Update Sub Category" : "Create Sub Category"}
                        </LoaderButton>
                    </div>
                </form>
            </Form>
            <Toaster position='top-right' richColors />
        </div>
    )
}
