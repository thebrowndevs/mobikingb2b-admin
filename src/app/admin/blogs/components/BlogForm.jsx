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
import clsx from 'clsx';

// Dynamic import of Rich Text Editor
const RTEFieldGlobal = dynamic(
    () => import('@/components/RTEFieldGlobal'),
    {
        ssr: false,
        loading: () => <p className="py-10 text-center text-slate-500 border border-bdr2 rounded-lg bg-back1">Loading Rich Text Editor...</p>
    }
);

const EXCERPT_MAX_CHARS = 160;

export default function BlogForm({ initialData, onSubmit, isSubmitting }) {
    const [activeStep, setActiveStep] = useState(1);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Fetch resources
    const { categoriesQuery } = useCategories();
    const { subCategoriesQuery } = useSubCategories();

    const categoriesList = categoriesQuery()?.data?.data || [];
    const activeSubCategoriesQuery = subCategoriesQuery();
    const subCategoriesList = activeSubCategoriesQuery?.data?.data || [];

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
            toast.error("Please correct errors before publishing. Make sure Title, Slug, Short Description, and Content are completed.");
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
        if (stepNumber === 3) return; // Skip product promotion step
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
            if (activeStep === 2) {
                setActiveStep(4);
            } else {
                setActiveStep(prev => Math.min(4, prev + 1));
            }
        } else {
            toast.error("Please fill in all required fields before proceeding.");
        }
    };

    const handlePrevStep = () => {
        if (activeStep === 4) {
            setActiveStep(2);
        } else {
            setActiveStep(prev => Math.max(1, prev - 1));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar Steps - Sticky Card */}
            <div className="lg:col-span-1 bg-back2 p-5 rounded-xl border border-bdr2 shadow-none lg:sticky lg:top-6 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-450 mb-2 px-2 uppercase tracking-wider">Form Steps</p>
                {[
                    { number: 1, label: "Basic Information" },
                    { number: 2, label: "Rich Text Content" },
                    // Promote Products option is commented out for now
                    // { number: 3, label: "Promote Products" },
                    { number: 4, label: "FAQs & SEO Metadata" }
                ].map(step => (
                    <button
                        key={step.number}
                        type="button"
                        onClick={() => handleStepClick(step.number)}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-semibold transition-all",
                            activeStep === step.number
                                ? "bg-sidebar-active text-indigo-650"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <span className={clsx(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold",
                            activeStep === step.number ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-650"
                        )}>
                            {step.number === 4 ? 3 : step.number}
                        </span>
                        <span>{step.label}</span>
                    </button>
                ))}
            </div>

            {/* Right Side Panels - Form Card */}
            <div className="lg:col-span-3 bg-back2 p-6 rounded-xl border border-bdr2 shadow-none min-h-[50vh] flex flex-col justify-between">
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {/* STEP 1: Basic Info */}
                    {activeStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Basic Information</h2>
                                <p className="text-xs text-slate-455">Provide the title, slug, summary, and category connections for this blog.</p>
                            </div>

                            {/* Title & Slug in 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Blog Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. 10 Best Mobile Brands in Wholesale"
                                        {...register("title", { required: "Blog Title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
                                        className={clsx("w-full bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all", { "border-red-500 focus-visible:ring-red-500": errors.title })}
                                    />
                                    {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                                </div>

                                {/* Slug */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="slug" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Blog Slug <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="slug"
                                        placeholder="auto-generated-slug"
                                        {...register("slug", { required: "Blog Slug is required" })}
                                        className={clsx("w-full bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all", { "border-red-500 focus-visible:ring-red-500": errors.slug })}
                                    />
                                    {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="excerpt" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Short Description / Excerpt <span className="text-red-500">*</span>
                                    </Label>
                                    <span className={clsx("text-[10px] font-bold", watchExcerpt.length > EXCERPT_MAX_CHARS ? "text-red-500" : "text-slate-400")}>
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
                                    className={clsx("h-20 bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none", { "border-red-500 focus-visible:ring-red-500": errors.excerpt })}
                                />
                                {errors.excerpt && <p className="text-xs text-red-500 font-medium">{errors.excerpt.message}</p>}
                            </div>

                            {/* Image Upload and Settings Sidebar Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                {/* Left Side: Featured Image card */}
                                <div className="md:col-span-5 flex flex-col justify-between p-4 border border-bdr2 rounded-xl bg-back1/40">
                                    <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Featured Image</Label>
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                        {watchImage ? (
                                            <div className="relative aspect-video w-full border border-bdr2 rounded-lg overflow-hidden shrink-0 group">
                                                <Image src={watchImage} alt="Featured image" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setValue("image", "")}
                                                    className="absolute top-1.5 right-1.5 bg-back2 hover:bg-red-500 hover:text-white rounded-full p-1 border border-bdr2 transition-colors z-10"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="aspect-video w-full border border-dashed border-bdr2 rounded-lg flex flex-col items-center justify-center gap-2 bg-back2 text-slate-400 shrink-0">
                                                <ImageIcon size={22} />
                                                <span className="text-[10px] font-semibold text-slate-455">No Image (16:9)</span>
                                            </div>
                                        )}
                                        <div className="w-full flex flex-col gap-2 mt-2">
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
                                                className="w-full bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold py-1.5 h-auto text-xs"
                                                onClick={() => document.getElementById('featured-image')?.click()}
                                                disabled={uploadingImage}
                                            >
                                                {uploadingImage && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                                                Upload Cover Image
                                            </Button>
                                            <span className="text-[10px] text-slate-400 font-medium text-center">Aspect ratio 16:9 recommended</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Options & Connections */}
                                <div className="md:col-span-7 flex flex-col gap-4 justify-between">
                                    {/* Featured Switch */}
                                    <div className="flex items-center gap-3 p-3.5 border border-bdr2 rounded-xl bg-back1/40">
                                        <input
                                            type="checkbox"
                                            id="featured"
                                            className="w-5 h-5 rounded border-bdr2 text-indigo-605 focus:ring-indigo-500"
                                            {...register("featured")}
                                        />
                                        <div className="flex flex-col">
                                            <Label htmlFor="featured" className="text-xs font-bold text-slate-700 cursor-pointer">Featured Post</Label>
                                            <span className="text-[10px] text-slate-450 font-semibold">Promotes this post to the top of list pages</span>
                                        </div>
                                    </div>

                                    {/* Categories and Subcategories Connection */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                                        {/* Categories */}
                                        <div className="border border-bdr2 rounded-xl p-4 bg-back1/40 flex flex-col">
                                            <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Categories</Label>
                                            {categoriesList.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic">No categories available.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
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
                                                                    "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
                                                                    checked
                                                                        ? "bg-indigo-50 text-indigo-750 border-indigo-200 shadow-none"
                                                                        : "bg-back2 text-slate-600 border-bdr2 hover:border-slate-300"
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
                                        <div className="border border-bdr2 rounded-xl p-4 bg-back1/40 flex flex-col">
                                            <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2.5">Subcategories</Label>
                                            {watchCategories.length === 0 ? (
                                                <p className="text-xs text-slate-455 font-medium italic">Select category first</p>
                                            ) : availableSubCategories.length === 0 ? (
                                                <p className="text-xs text-slate-455 font-medium italic">No subcategories</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
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
                                                                    "px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
                                                                    checked
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-250 shadow-none"
                                                                        : "bg-back2 text-slate-600 border-bdr2 hover:border-slate-300"
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
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Content Editor */}
                    {activeStep === 2 && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Rich Text Content</h2>
                                <p className="text-xs text-slate-450">Draft the body of your blog post. Add details, embed headings, and write structured articles.</p>
                            </div>

                            <div className="min-h-[350px] border border-bdr2 rounded-lg overflow-hidden bg-back1">
                                <RTEFieldGlobal
                                    name="content"
                                    content={watchContent}
                                    setValue={setValue}
                                />
                                {errors.content && <p className="text-xs text-red-500 mt-2 font-medium px-4 pb-2">{errors.content.message}</p>}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SEO & FAQs */}
                    {activeStep === 4 && (
                        <div className="space-y-6">
                            {/* SEO fields */}
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">SEO Metadata Fields</h2>
                                    <p className="text-xs text-slate-450">Provide search engine configurations to maximize reach and crawl rates.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {/* Meta Title */}
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="seo.metaTitle" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Meta Title
                                        </Label>
                                        <Input
                                            id="seo.metaTitle"
                                            placeholder="SEO title (e.g. Best e-Commerce blogs...)"
                                            {...register("seo.metaTitle")}
                                            className="w-full bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Meta Description */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="seo.metaDescription" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Meta Description
                                    </Label>
                                    <Textarea
                                        id="seo.metaDescription"
                                        placeholder="Search engine summary (keeps under 160 characters)..."
                                        {...register("seo.metaDescription")}
                                        className="h-20 bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>

                                {/* Meta Keywords */}
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="seo.metaKeywords" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Meta Keywords (Comma separated)
                                    </Label>
                                    <Input
                                        id="seo.metaKeywords"
                                        placeholder="wholesale, mobile accessories, mobiking blogs"
                                        {...register("seo.metaKeywords")}
                                        className="w-full bg-back1 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* FAQs Fields */}
                            <div className="space-y-4 pt-5 border-t border-bdr2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">FAQ Schema</h3>
                                        <p className="text-xs text-slate-450">Add questions and answers that will render directly in Google Search snippets.</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendFaq({ question: "", answer: "" })}
                                        className="flex items-center gap-1 bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold"
                                    >
                                        <Plus size={13} /> Add FAQ
                                    </Button>
                                </div>

                                {faqFields.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">No FAQs added yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {faqFields.map((field, index) => (
                                            <div key={field.id} className="p-4 border border-bdr2 rounded-lg bg-back1 relative flex flex-col gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFaq(index)}
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={15} />
                                                </button>

                                                <div className="flex flex-col gap-1.5 pr-6">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Question {index + 1}</Label>
                                                    <Input
                                                        placeholder="e.g. What is the minimum wholesale order?"
                                                        {...register(`faqs.${index}.question`, { required: "Question is required" })}
                                                        className="w-full bg-back2 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Answer {index + 1}</Label>
                                                    <Textarea
                                                        placeholder="Answer description..."
                                                        {...register(`faqs.${index}.answer`, { required: "Answer is required" })}
                                                        className="w-full h-16 bg-back2 border-bdr2 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
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
                <div className="flex justify-between items-center border-t border-bdr2 pt-6 mt-10">
                    <div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold"
                        >
                            <Save size={14} />
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
                                className="flex items-center gap-1.5 bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold"
                            >
                                <ArrowLeft size={14} />
                                Back
                            </Button>
                        )}

                        {activeStep < 4 ? (
                            <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={isSubmitting}
                                className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold flex items-center gap-1.5"
                            >
                                Next
                                <ArrowRight size={14} />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handlePublish}
                                disabled={isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-none font-semibold"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-1 h-4 w-4" /> : <CheckCircle size={14} />}
                                Publish Post
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
