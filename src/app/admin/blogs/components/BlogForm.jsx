"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X, Image as ImageIcon, Save, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImage3 } from '@/lib/services/uploadImage2';
import { useCategories } from '@/hooks/useCategories';
import { useSubCategories } from '@/hooks/useSubCategories';
import { useProducts } from '@/hooks/useProducts';
import BlogProductsSheet from './BlogProductsSheet';
import clsx from 'clsx';

// Dynamic import of Rich Text Editor
const RTEFieldGlobal = dynamic(
    () => import('@/components/RTEFieldGlobal'),
    {
        ssr: false,
        loading: () => <p className="py-10 text-center text-gray-500 border rounded-lg bg-gray-50">Loading Rich Text Editor...</p>
    }
);

const EXCERPT_MAX_CHARS = 160;

export default function BlogForm({ initialData, onSubmit, isSubmitting }) {
    const [activeStep, setActiveStep] = useState(1);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [productsSheetOpen, setProductsSheetOpen] = useState(false);

    // Fetch resources
    const { categoriesQuery } = useCategories();
    const { subCategoriesQuery } = useSubCategories();
    const { productsQuery, availableProductsQuery } = useProducts();

    const categoriesList = categoriesQuery()?.data?.data || [];
    const activeSubCategoriesQuery = subCategoriesQuery();
    const subCategoriesList = activeSubCategoriesQuery?.data?.data || [];
    const productsList = availableProductsQuery?.data || productsQuery?.data?.data || [];

    // React Hook Form setup
    const { register, handleSubmit, control, watch, setValue, formState: { errors }, trigger, reset } = useForm({
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            image: "",
            status: "draft",
            featured: false,
            categories: [],
            subCategories: [],
            promotedProducts: [],
            content: "",
            seo: {
                metaTitle: "",
                metaDescription: "",
                metaKeywords: "",
                canonicalUrl: ""
            },
            faqs: []
        }
    });

    const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
        control,
        name: "faqs"
    });

    // Populate data when editing
    useEffect(() => {
        if (initialData) {
            const mappedFaqs = (initialData.faqs || []).map(f => ({ question: f.question || "", answer: f.answer || "" }));
            const mappedCategories = (initialData.categories || []).map(c => typeof c === 'string' ? c : c._id);
            const mappedSubCategories = (initialData.subCategories || []).map(sc => typeof sc === 'string' ? sc : sc._id);
            const mappedPromoted = (initialData.promotedProducts || []).map(p => typeof p === 'string' ? p : p._id);

            reset({
                title: initialData.title || "",
                slug: initialData.slug || "",
                excerpt: initialData.excerpt || "",
                image: initialData.image || "",
                status: initialData.status || "draft",
                featured: initialData.featured || false,
                categories: mappedCategories,
                subCategories: mappedSubCategories,
                promotedProducts: mappedPromoted,
                content: initialData.content || "",
                seo: {
                    metaTitle: initialData.seo?.metaTitle || "",
                    metaDescription: initialData.seo?.metaDescription || "",
                    metaKeywords: initialData.seo?.metaKeywords ? (Array.isArray(initialData.seo.metaKeywords) ? initialData.seo.metaKeywords.join(", ") : initialData.seo.metaKeywords) : "",
                    canonicalUrl: initialData.seo?.canonicalUrl || ""
                },
                faqs: mappedFaqs
            });
        }
    }, [initialData, reset]);

    const watchTitle = watch("title");
    const watchExcerpt = watch("excerpt") || "";
    const watchImage = watch("image");
    const watchCategories = watch("categories") || [];
    const watchSubCategories = watch("subCategories") || [];
    const watchPromotedProducts = watch("promotedProducts") || [];
    const watchContent = watch("content") || "";

    // Auto-generate slug from title
    useEffect(() => {
        if (watchTitle && !initialData) {
            const generatedSlug = watchTitle
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
            setValue("slug", generatedSlug);
        }
    }, [watchTitle, setValue, initialData]);

    // Filter subcategories dynamically based on chosen categories
    const availableSubCategories = subCategoriesList.filter(sc => {
        const parentId = typeof sc.parentCategory === 'object' ? sc.parentCategory?._id : sc.parentCategory;
        return watchCategories.includes(parentId);
    });

    // Handle image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const toastId = toast.loading("Uploading featured image...");
        try {
            const url = await uploadImage3(file);
            setValue("image", url);
            toast.success("Image uploaded successfully!", { id: toastId });
        } catch (error) {
            toast.error("Image upload failed.", { id: toastId });
            console.error(error);
        } finally {
            setUploadingImage(false);
        }
    };

    // Save as draft directly
    const handleSaveDraft = async () => {
        const currentData = watch();
        // Convert comma-separated keywords into array
        let keywordsArray = [];
        if (currentData.seo?.metaKeywords) {
            keywordsArray = currentData.seo.metaKeywords
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);
        }

        const payload = {
            ...currentData,
            status: "draft",
            seo: {
                ...currentData.seo,
                metaKeywords: keywordsArray
            }
        };

        if (!payload.title || !payload.slug) {
            toast.error("Please fill in at least Title and Slug to save a draft.");
            return;
        }

        await onSubmit(payload);
    };

    // Final Publish Submission
    const handlePublish = async () => {
        // Trigger verification across all steps
        const isStep1Valid = await trigger(["title", "slug", "excerpt", "image"]);
        const isStep2Valid = await trigger(["content"]);

        if (!isStep1Valid || !isStep2Valid) {
            toast.error("Please correct errors before publishing. Make sure Title, Slug, Short Description, Featured Image, and Content are completed.");
            return;
        }

        const currentData = watch();
        let keywordsArray = [];
        if (currentData.seo?.metaKeywords) {
            keywordsArray = currentData.seo.metaKeywords
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);
        }

        const payload = {
            ...currentData,
            status: "published",
            seo: {
                ...currentData.seo,
                metaKeywords: keywordsArray
            }
        };

        await onSubmit(payload);
    };

    // Form validation rules per step
    const handleStepClick = async (stepNumber) => {
        if (stepNumber > activeStep) {
            // Validate current step fields before going forward
            let fieldsToValidate = [];
            if (activeStep === 1) {
                fieldsToValidate = ["title", "slug", "excerpt"];
            } else if (activeStep === 2) {
                fieldsToValidate = ["content"];
            }

            const isValid = await trigger(fieldsToValidate);
            if (!isValid) {
                toast.error("Please fill in required fields correctly before moving forward.");
                return;
            }
        }
        setActiveStep(stepNumber);
    };

    const handleNextStep = async () => {
        let fieldsToValidate = [];
        if (activeStep === 1) {
            fieldsToValidate = ["title", "slug", "excerpt"];
        } else if (activeStep === 2) {
            fieldsToValidate = ["content"];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setActiveStep(prev => Math.min(4, prev + 1));
        } else {
            toast.error("Please fill in all required fields before proceeding.");
        }
    };

    const handlePrevStep = () => {
        setActiveStep(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white p-6 rounded-lg border shadow-sm items-start">
            {/* Left Sidebar Steps */}
            <div className="flex flex-col gap-2 border-r lg:pr-6">
                <p className="text-sm font-semibold text-gray-500 mb-2 px-2 uppercase tracking-wider">Form Steps</p>
                {[
                    { number: 1, label: "Basic Information" },
                    { number: 2, label: "Rich Text Content" },
                    { number: 3, label: "Promote Products" },
                    { number: 4, label: "FAQs & SEO Metadata" }
                ].map(step => (
                    <button
                        key={step.number}
                        type="button"
                        onClick={() => handleStepClick(step.number)}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all",
                            activeStep === step.number
                                ? "bg-primary text-white shadow"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        <span className={clsx(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold",
                            activeStep === step.number ? "bg-white text-primary" : "bg-gray-200 text-gray-700"
                        )}>
                            {step.number}
                        </span>
                        <span>{step.label}</span>
                    </button>
                ))}
            </div>

            {/* Right Side Step Panels */}
            <div className="lg:col-span-3 min-h-[50vh] flex flex-col justify-between">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {/* STEP 1: Basic Info */}
                    {activeStep === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold text-gray-800">Basic Information</h2>
                            <p className="text-sm text-gray-500">Provide the title, slug, summary, and category connections for this blog.</p>

                            {/* Title */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="title" className="font-semibold">
                                    Blog Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. 10 Best Mobile Brands in Wholesale"
                                    {...register("title", { required: "Blog Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
                                    className={clsx({ "border-red-500 focus-visible:ring-red-500": errors.title })}
                                />
                                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            {/* Slug */}
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="slug" className="font-semibold">
                                    Blog Slug <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="slug"
                                    placeholder="auto-generated-slug"
                                    {...register("slug", { required: "Blog Slug is required" })}
                                    className={clsx({ "border-red-500 focus-visible:ring-red-500": errors.slug })}
                                />
                                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                            </div>

                            {/* Excerpt */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="excerpt" className="font-semibold">
                                        Short Description / Excerpt <span className="text-red-500">*</span>
                                    </Label>
                                    <span className={clsx("text-xs font-semibold", watchExcerpt.length > EXCERPT_MAX_CHARS ? "text-red-500" : "text-gray-400")}>
                                        {watchExcerpt.length} / {EXCERPT_MAX_CHARS}
                                    </span>
                                </div>
                                <Textarea
                                    id="excerpt"
                                    placeholder="Provide a brief summary of the blog post to show on index pages (max 160 characters)..."
                                    {...register("excerpt", {
                                        required: "Excerpt is required",
                                        maxLength: { value: EXCERPT_MAX_CHARS, message: `Excerpt must not exceed ${EXCERPT_MAX_CHARS} characters` }
                                    })}
                                    className={clsx("h-20", { "border-red-500 focus-visible:ring-red-500": errors.excerpt })}
                                />
                                {errors.excerpt && <p className="text-xs text-red-500">{errors.excerpt.message}</p>}
                            </div>

                            {/* Featured Image */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-semibold">Featured Image</Label>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {watchImage ? (
                                        <div className="relative aspect-video w-full max-w-[280px] border rounded-lg overflow-hidden shrink-0 group">
                                            <Image src={watchImage} alt="Featured image" fill className="object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setValue("image", "")}
                                                className="absolute top-1 right-1 bg-white hover:bg-red-500 hover:text-white rounded-full p-1 shadow transition-colors z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="aspect-video w-full max-w-[280px] border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400 shrink-0">
                                            <ImageIcon size={24} />
                                            <span className="text-[10px]">No image (16:9)</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="featured-image"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('featured-image')?.click()}
                                            disabled={uploadingImage}
                                        >
                                            {uploadingImage && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                            Upload Image
                                        </Button>
                                        <span className="text-[11px] text-gray-400">Recommends aspect ratio 16:9 (e.g. 1200x675 px)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Option */}
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 max-w-sm">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    {...register("featured")}
                                />
                                <div className="flex flex-col">
                                    <Label htmlFor="featured" className="font-semibold cursor-pointer">Featured Post</Label>
                                    <span className="text-[11px] text-gray-400">Promotes this post to the top of list pages</span>
                                </div>
                            </div>

                            {/* Categories & Subcategories */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {/* Categories */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <Label className="font-semibold block mb-3 text-gray-700">Categories Connection</Label>
                                    {categoriesList.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No categories available.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                                            {categoriesList.map(cat => {
                                                const checked = watchCategories.includes(cat._id);
                                                return (
                                                    <button
                                                        key={cat._id}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = [...watchCategories];
                                                            if (checked) {
                                                                setValue("categories", current.filter(id => id !== cat._id));
                                                            } else {
                                                                setValue("categories", [...current, cat._id]);
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                                            checked
                                                                ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
                                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                        )}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Subcategories */}
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <Label className="font-semibold block mb-3 text-gray-700">Subcategories Connection</Label>
                                    {watchCategories.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Please select at least one Category first to show its Subcategories.</p>
                                    ) : availableSubCategories.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No subcategories found for the selected categories.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                                            {availableSubCategories.map(sub => {
                                                const checked = watchSubCategories.includes(sub._id);
                                                return (
                                                    <button
                                                        key={sub._id}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = [...watchSubCategories];
                                                            if (checked) {
                                                                setValue("subCategories", current.filter(id => id !== sub._id));
                                                            } else {
                                                                setValue("subCategories", [...current, sub._id]);
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                                            checked
                                                                ? "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm"
                                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                        )}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Content Editor */}
                    {activeStep === 2 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-800">Rich Text Content</h2>
                            <p className="text-sm text-gray-500">Draft the body of your blog post. Add details, embed headings, and write structured articles.</p>

                            <div className="min-h-[350px]">
                                <RTEFieldGlobal
                                    name="content"
                                    content={watchContent}
                                    setValue={setValue}
                                />
                                {errors.content && <p className="text-xs text-red-500 mt-2">{errors.content.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Promoted Products */}
                    {activeStep === 3 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Promote Products</h2>
                                    <p className="text-sm text-gray-500">Select which products are embedded and promoted through this article.</p>
                                </div>
                                <Button type="button" onClick={() => setProductsSheetOpen(true)}>
                                    Manage Products ({watchPromotedProducts.length})
                                </Button>
                            </div>

                            {watchPromotedProducts.length === 0 ? (
                                <div className="border border-dashed rounded-lg p-10 text-center bg-gray-50">
                                    <p className="text-gray-500 text-sm">No products selected for promotion yet.</p>
                                    <Button type="button" variant="outline" className="mt-3" onClick={() => setProductsSheetOpen(true)}>
                                        Select Products
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {watchPromotedProducts.map(pId => {
                                        const prod = productsList.find(p => p._id === pId) ||
                                            initialData?.promotedProducts?.find(p => (p._id || p) === pId) ||
                                            { fullName: `Product ID: ${pId}`, images: [] };
                                        return (
                                            <div key={pId} className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm relative group">
                                                <img
                                                    src={prod.images?.[0] || '/not-found-img.webp'}
                                                    alt={prod.fullName}
                                                    className="w-12 h-12 object-cover rounded border"
                                                />
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <p className="text-xs font-semibold text-gray-900 truncate">{prod.fullName}</p>
                                                    <p className="text-[10px] text-gray-400">ID: {pId.slice(-6)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setValue("promotedProducts", watchPromotedProducts.filter(id => id !== pId))}
                                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <BlogProductsSheet
                                open={productsSheetOpen}
                                onOpenChange={setProductsSheetOpen}
                                initialProductIds={watchPromotedProducts}
                                initialProducts={initialData?.promotedProducts || []}
                                onProductsSelected={(selectedIds) => setValue("promotedProducts", selectedIds)}
                            />
                        </div>
                    )}

                    {/* STEP 4: SEO & FAQs */}
                    {activeStep === 4 && (
                        <div className="space-y-6">
                            {/* SEO fields */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">SEO Metadata Fields</h2>
                                <p className="text-sm text-gray-500">Provide search engine configurations to maximize reach and crawl rates.</p>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Meta Title */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="seo.metaTitle" className="font-semibold">Meta Title</Label>
                                        <Input
                                            id="seo.metaTitle"
                                            placeholder="SEO title (e.g. Best e-Commerce blogs...)"
                                            {...register("seo.metaTitle")}
                                        />
                                    </div>
                                </div>

                                {/* Meta Description */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="seo.metaDescription" className="font-semibold">Meta Description</Label>
                                    <Textarea
                                        id="seo.metaDescription"
                                        placeholder="Search engine summary (keeps under 160 characters)..."
                                        {...register("seo.metaDescription")}
                                        className="h-16"
                                    />
                                </div>

                                {/* Meta Keywords */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="seo.metaKeywords" className="font-semibold">Meta Keywords (Comma separated)</Label>
                                    <Input
                                        id="seo.metaKeywords"
                                        placeholder="wholesale, mobile accessories, mobiking blogs"
                                        {...register("seo.metaKeywords")}
                                    />
                                </div>
                            </div>

                            {/* FAQs Fields */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">FAQ Schema Schema.org</h3>
                                        <p className="text-xs text-gray-500">Add questions and answers that will render directly in Google Search snippets.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendFaq({ question: "", answer: "" })}
                                        className="flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Add FAQ
                                    </Button>
                                </div>

                                {faqFields.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic py-2">No FAQs added yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {faqFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border rounded-lg bg-gray-50 relative flex flex-col gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFaq(index)}
                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                                >
                                                    <X size={16} />
                                                </button>

                                                <div className="flex flex-col gap-1.5 pr-6">
                                                    <Label className="text-xs font-semibold">Question {index + 1}</Label>
                                                    <Input
                                                        placeholder="e.g. What is the minimum wholesale order?"
                                                        {...register(`faqs.${index}.question`, { required: "Question is required" })}
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-xs font-semibold">Answer {index + 1}</Label>
                                                    <Textarea
                                                        placeholder="Answer description..."
                                                        {...register(`faqs.${index}.answer`, { required: "Answer is required" })}
                                                        className="bg-white h-16"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer Buttons Navigation & Actions */}
                <div className="flex justify-between items-center border-t pt-6 mt-10">
                    <div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5"
                        >
                            <Save size={16} />
                            Save as Draft
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        {activeStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevStep}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </Button>
                        )}

                        {activeStep < 4 ? (
                            <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={isSubmitting}
                                className="flex items-center gap-1.5"
                            >
                                Next
                                <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handlePublish}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-1 h-4 w-4" /> : <CheckCircle size={16} />}
                                Publish Post
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
