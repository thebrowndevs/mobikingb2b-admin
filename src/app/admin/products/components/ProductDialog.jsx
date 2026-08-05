import React from 'react'
import dynamic from 'next/dynamic';
const RTEFieldGlobal = dynamic(
    () => import('@/components/RTEFieldGlobal'),
    {
        ssr: false,
        loading: () => <p className="py-10 text-center text-gray-500">Loading editor...</p>
    }
);

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { uploadImage } from '@/lib/services/uploadImage';
import MiniLoaderButton from '@/components/custom/MiniLoaderButton';
import BrandDialog from '../../brands/components/BrandDialog';
import { useBrands } from '@/hooks/useBrands';
import { Reorder } from "framer-motion";
import { uploadImage2, uploadImage3 } from '@/lib/services/uploadImage2';

const formSchema = z.object({
    brandId: z.string().optional(),
    fullName: z.string().min(1, "Full name is required"),

    // Coerce numeric values to numbers if strings come in from inputs
    price: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return val;
        return typeof val === "string" ? Number(val) : val;
    }, z.number().min(0, "Selling Price is required")),

    regularPrice: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        return typeof val === "string" ? Number(val) : val;
    }, z.number().optional()),

    basePrice: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return val;
        return typeof val === "string" ? Number(val) : val;
    }, z.number().min(0, "Base Price is required")),

    gst: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return val;
        return typeof val === "string" ? Number(val) : val;
    }, z.number().min(0, "GST must be a positive number")),

    sku: z.any().optional(),
    hsn: z.any().optional(),
    rating: z.any().optional(),
    reviewCount: z.any().optional(),
    slug: z.string().min(1, "Slug is required"),
    active: z.boolean(),
    tags: z.any().optional(),
    description: z.string().min(1, "Description is required"),

    descriptionPoints: z.array(z.string()).optional(),
    keyInformation: z.array(z.object({
        title: z.string(),
        content: z.string()
    })).optional(),

    categoryId: z.string().min(1, "Category is required"),
    images: z.array(z.string().min(1, "At least one image is required")),
});

function ProductDialog({ open, onOpenChange, selectedProduct, onCreate, onUpdate, isSubmitting, error, categories, brands }) {
    const [brandDialog, setBrandDialog] = useState(false)
    const [image, setImage] = useState(null)
    const { createBrand } = useBrands();
    const {
        mutateAsync: createBrandAsync,
        isPending: isCreating,
        error: createError,
    } = createBrand;

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: selectedProduct ? {
            brandId: selectedProduct?.brand ?? "",
            fullName: selectedProduct?.fullName ?? "",
            price: selectedProduct?.sellingPrice?.[selectedProduct.sellingPrice?.length - 1]?.price ?? 0,
            gst: selectedProduct?.gst ?? 18,
            regularPrice: selectedProduct?.regularPrice ?? 0,
            basePrice: selectedProduct?.basePrice ?? 0,
            sku: selectedProduct?.sku ?? "",
            hsn: selectedProduct?.hsn ?? "",
            rating: selectedProduct?.rating ?? "",
            reviewCount: selectedProduct?.reviewCount ?? "",
            slug: selectedProduct?.slug ?? "",
            active: selectedProduct?.active ?? true,
            tags: selectedProduct?.tags
                ? (Array.isArray(selectedProduct.tags)
                    ? selectedProduct.tags.join(", ")
                    : selectedProduct.tags)
                : "",
            description: selectedProduct?.description ?? "",
            descriptionPoints: selectedProduct?.descriptionPoints ?? [],
            keyInformation: selectedProduct?.keyInformation ?? [],
            categoryId: selectedProduct?.category?._id ?? "",
            images: selectedProduct?.images ?? [],
        } : {
            brandId: "",
            fullName: "",
            price: 0,
            gst: 18,
            regularPrice: 0,
            basePrice: 0,
            sku: "",
            hsn: "",
            rating: "",
            reviewCount: "",
            slug: "",
            active: true,
            description: "",
            tags: "",
            descriptionPoints: [],
            keyInformation: [],
            categoryId: "",
            images: [],
        }
    });
    const { watch, setValue, control, reset } = form;

    const fullNameValue = watch("fullName");

    const uniqueWords = React.useMemo(() => {
        if (!fullNameValue) return [];
        const words = fullNameValue
            .split(/[\s,.\-\/]+/)
            .map(word => word.trim())
            .filter(word => word.length > 2);
        return Array.from(new Set(words));
    }, [fullNameValue]);

    const handleWordToggle = (word) => {
        const currentTagsVal = form.getValues("tags") || "";
        let currentTags = [];
        if (Array.isArray(currentTagsVal)) {
            currentTags = currentTagsVal.map(t => String(t).trim());
        } else if (typeof currentTagsVal === "string") {
            currentTags = currentTagsVal
                .split(",")
                .map(t => t.trim())
                .filter(t => t.length > 0);
        }

        const isAdded = currentTags.some(t => t.toLowerCase() === word.toLowerCase());
        let nextTags = [];

        if (isAdded) {
            nextTags = currentTags.filter(t => t.toLowerCase() !== word.toLowerCase());
        } else {
            nextTags = [...currentTags, word];
        }

        form.setValue("tags", nextTags.join(", "), { shouldValidate: true });
    };

    useEffect(() => {
        if (selectedProduct) {
            reset({
                brandId: selectedProduct?.brand ?? "",
                fullName: selectedProduct?.fullName ?? "",
                price: selectedProduct?.sellingPrice?.[selectedProduct.sellingPrice?.length - 1]?.price ?? 0,
                gst: selectedProduct?.gst ?? 18,
                regularPrice: selectedProduct?.regularPrice ?? 0,
                basePrice: selectedProduct?.basePrice ?? 0,
                sku: selectedProduct?.sku ?? "",
                hsn: selectedProduct?.hsn ?? "",
                rating: selectedProduct?.rating ?? "",
                reviewCount: selectedProduct?.reviewCount ?? "",
                slug: selectedProduct?.slug ?? "",
                active: selectedProduct?.active ?? true,
                tags: selectedProduct?.tags
                    ? (Array.isArray(selectedProduct.tags)
                        ? selectedProduct.tags.join(", ")
                        : selectedProduct.tags)
                    : "",
                description: selectedProduct?.description ?? "",
                descriptionPoints: selectedProduct?.descriptionPoints ?? [],
                keyInformation: selectedProduct?.keyInformation ?? [],
                categoryId: selectedProduct?.category?._id ?? "",
                images: selectedProduct?.images ?? [],
            });
        } else {
            reset({
                brandId: "",
                fullName: "",
                price: 0,
                gst: 18,
                basePrice: 0,
                regularPrice: 0,
                sku: "",
                hsn: "",
                slug: "",
                rating: "",
                reviewCount: "",
                active: true,
                description: "",
                tags: "",
                descriptionPoints: [],
                keyInformation: [],
                categoryId: "",
                images: [],
            });
        }
    }, [selectedProduct, reset, open]);

    const watchName = form.watch("fullName");
    useEffect(() => {
        const slug = watchName
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        form.setValue("slug", slug);
    }, [watchName]);

    // setting value of base price
    const watchPrice = watch('price')
    const watchGst = watch('gst')
    useEffect(() => {
        const valBase = (watchPrice * (100 / (100 + +watchGst))).toFixed(2)
        setValue('basePrice', Number(valBase))
    }, [watchPrice, watchGst])

    const images = watch("images") || [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: "descriptionPoints",
    });

    const {
        fields: keyInfoFields,
        append: appendKeyInfo,
        remove: removeKeyInfo,
    } = useFieldArray({
        control,
        name: 'keyInformation',
    })

    async function onSubmit(values) {
        let finalData = { ...values }

        if (values?.tags) {
            let tagsArray = [];

            if (Array.isArray(values.tags)) {
                tagsArray = values.tags;
            } else if (typeof values.tags === "string") {
                tagsArray = values.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
            }

            finalData = {
                ...finalData,
                tags: tagsArray,
            };
        } else {
            finalData.tags = [];
        }

        // console.log("Submitting values:", finalData)

        if (selectedProduct) {
            await onUpdate({ id: selectedProduct._id, data: finalData })
            onOpenChange(false)
        } else {
            await onCreate(finalData)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedProduct ? "Edit Product" : "Add Product"}
                    </DialogTitle>
                </DialogHeader>

                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
                            {/* brand name */}
                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand<span className="text-red-500"> *</span></FormLabel>
                                        <div className='flex gap-2 items-center justify-center'>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => field.onChange(val)}
                                                >
                                                    <SelectTrigger className={'w-full flex-1'}>
                                                        <SelectValue placeholder="Select a brand" />
                                                    </SelectTrigger>
                                                    <SelectContent className={'w-full'}>
                                                        {brands?.map((brand) => (
                                                            <SelectItem key={brand._id} value={brand._id}>
                                                                {brand?.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <MiniLoaderButton
                                                type='button'
                                                onClick={() => setBrandDialog(true)}
                                            >
                                                +
                                            </MiniLoaderButton>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Slug */}
                            <div className='hidden'>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug<span className="text-red-500"> *</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="jbl-smartwatch" {...field} disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* full name */}
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="JBL Limited Edition Smartwatch" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='grid grid-cols-1 sm:grid-cols-5 gap-2'>
                                {/* category */}
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem className={''}>
                                            <FormLabel>Category<span className="text-red-500"> *</span></FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => field.onChange(val)}
                                                >
                                                    <SelectTrigger className={'w-full flex-1'}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent className={'w-full'}>
                                                        {categories?.map((category) => (
                                                            <SelectItem key={category._id} value={category._id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* SKU */}
                                <FormField
                                    control={form.control}
                                    name='sku'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    placeholder="Enter SKU"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* HSN */}
                                <FormField
                                    control={form.control}
                                    name='hsn'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>HSN Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    placeholder="Enter HSN"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* rating */}
                                <FormField
                                    control={form.control}
                                    name='rating'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rating (4.0 / 4.3)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    placeholder="Product Rating"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* reviewCount */}
                                <FormField
                                    control={form.control}
                                    name='reviewCount'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Reviews </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type='text'
                                                    placeholder="879 / 2989 / 124"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='grid grid-cols-4 gap-2'>
                                {/* Regular Price - MRP */}
                                <FormField
                                    control={form.control}
                                    name="regularPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>MRP</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="1699"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === '' ? '' : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Base price */}
                                <FormField
                                    control={form.control}
                                    name="basePrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Price<span className="text-red-500"> *</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="1699"
                                                    {...field}
                                                    disabled
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === '' ? '' : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* GST */}
                                <FormField
                                    control={form.control}
                                    name="gst"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GST (%)<span className="text-red-500"> *</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="18"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === '' ? '' : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Selling price */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Selling Price<span className="text-red-500"> *</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="1999"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value === '' ? '' : Number(value));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Active */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-gray-500">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active</FormLabel>
                                            <DialogDescription>This product is visible to users</DialogDescription>
                                        </div>
                                        <FormControl>
                                            <Input
                                                type="checkbox"
                                                className="w-5 h-5"
                                                checked={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Images */}
                            <FormField
                                control={form.control}
                                name="images"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Product Images</FormLabel>

                                        {/* Hidden File Input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            ref={(fileInput) => (form.fileInputRef = fileInput)}
                                            onChange={async (e) => {
                                                const files = e.target.files;
                                                if (!files || files.length === 0) return;

                                                const toastId = toast.loading("Uploading images...");
                                                const urls = [];
                                                try {
                                                    for (let file of files) {
                                                        try {
                                                            const url = await uploadImage3(file, (p) => {
                                                            });
                                                            urls.push(url);
                                                        } catch (err) {
                                                            console.error("Image upload failed:", err);
                                                            toast.error("One image failed to upload", { id: toastId });
                                                        }
                                                    }

                                                    const existing = form.getValues("images") || [];
                                                    form.setValue("images", [...existing, ...urls], { shouldValidate: true });

                                                    toast.success("Images uploaded", { id: toastId });
                                                } finally {
                                                    e.target.value = ""; // reset input
                                                }
                                            }}
                                        />

                                        {/* Upload Button */}
                                        <Button
                                            type="button"
                                            onClick={() => form.fileInputRef?.click()}
                                            className="mt-2"
                                        >
                                            Upload Images
                                        </Button>

                                        {/* Image Preview with Reorder */}
                                        {images.length > 0 ? (
                                            <Reorder.Group
                                                axis="x"
                                                values={images}
                                                onReorder={(newOrder) =>
                                                    form.setValue("images", newOrder, { shouldValidate: true })
                                                }
                                                className="mt-4 flex flex-wrap gap-3"
                                            >
                                                {images.map((url, idx) => (
                                                    <Reorder.Item
                                                        key={url}
                                                        value={url}
                                                        className="relative border rounded-lg overflow-hidden group cursor-grab"
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`Product image ${idx + 1}`}
                                                            width={200}
                                                            height={200}
                                                            className="object-cover h-32 w-full"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...images];
                                                                updated.splice(idx, 1);
                                                                form.setValue("images", updated, { shouldValidate: true });
                                                            }}
                                                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md 
                  hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        ) : (
                                            <div className="text-gray-500 italic mt-3 border-gray-600 text-center py-8 px-3 rounded-sm border-dashed border">
                                                No images yet
                                            </div>
                                        )}
                                    </FormItem>
                                )}
                            />


                            {/* Keywords */}
                            {/* Keywords */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => {
                                    const currentTagsVal = field.value || "";
                                    let currentTagsList = [];
                                    if (Array.isArray(currentTagsVal)) {
                                        currentTagsList = currentTagsVal.map(t => String(t).trim().toLowerCase());
                                    } else if (typeof currentTagsVal === "string") {
                                        currentTagsList = currentTagsVal
                                            .split(",")
                                            .map(t => t.trim().toLowerCase())
                                            .filter(t => t.length > 0);
                                    }

                                    return (
                                        <FormItem>
                                            <FormLabel>Tags (Enter Comma Separated Values)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="smartwatch, smartwatch for men, best smartwatch under 5000" {...field} />
                                            </FormControl>
                                            {uniqueWords.length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500 block mb-1">Click to add words from product name:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {uniqueWords.map((word) => {
                                                            const isAdded = currentTagsList.includes(word.toLowerCase());
                                                            return (
                                                                <span
                                                                    key={word}
                                                                    onClick={() => handleWordToggle(word)}
                                                                    className={`text-xs px-2 py-0.5 rounded cursor-pointer border transition-colors select-none ${isAdded
                                                                        ? "bg-green-50 text-green-600 border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium"
                                                                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-200"
                                                                        }`}
                                                                >
                                                                    {word}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field: { name: fieldName, value: fieldValue } }) => (
                                    <FormItem>
                                        <FormLabel>Description<span className="text-red-500"> *</span></FormLabel>
                                        <FormControl>
                                            <RTEFieldGlobal
                                                name={fieldName}
                                                content={fieldValue}
                                                setValue={setValue}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description Points */}
                            <div className='bg-gray-100 rounded p-4'>
                                <p className='font-semibold mb-3'>Description Points</p>

                                <div className='space-y-2'>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className='flex gap-2 items-center'>
                                            <FormField
                                                control={control}
                                                name={`descriptionPoints.${index}`}
                                                render={({ field }) => (
                                                    <FormItem className={'flex-1'}>
                                                        <FormControl>
                                                            <Input placeholder={`Point ${index + 1}`} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button
                                                type='button'
                                                variant={'destructive'}
                                                onClick={() => remove(index)}
                                            >
                                                <X />
                                            </Button>
                                        </div>
                                    ))}

                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-3"
                                    onClick={() => append("")}
                                >
                                    <Plus size={16} className="mr-1" /> Add Point
                                </Button>
                            </div>

                            {/* Key Information */}
                            <div className='bg-gray-100 rounded p-4'>
                                <p className='font-semibold mb-3'>Key Information</p>
                                <div className='space-y-2'>
                                    {keyInfoFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-2 border p-3 rounded-md relative items-start">
                                            {/* Title */}
                                            <FormField
                                                control={control}
                                                name={`keyInformation.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={"e.g. Battery Life"} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Content */}
                                            <FormField
                                                control={control}
                                                name={`keyInformation.${index}.content`}
                                                render={({ field }) => (
                                                    <FormItem className={'flex-1'}>
                                                        <FormLabel>Content</FormLabel>
                                                        <FormControl>
                                                            <Textarea className={'bg-white'} placeholder="e.g. Up to 10 hours" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Remove Button */}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className=""
                                                onClick={() => removeKeyInfo(index)}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => appendKeyInfo({ title: "", content: "" })}
                                    >
                                        <Plus size={16} className="mr-1" />
                                        Add Key Info
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="animate-spin mr-1" />}
                                    {selectedProduct ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>

                <BrandDialog
                    open={brandDialog}
                    onOpenChange={setBrandDialog}
                    onCreate={createBrandAsync}
                    isSubmitting={isCreating}
                    error={createError?.message}
                    image={image}
                    setImage={setImage}
                />
            </DialogContent>
        </Dialog>
    )
}

export default ProductDialog
