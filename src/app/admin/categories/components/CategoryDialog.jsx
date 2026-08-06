'use client'
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { uploadImage3 } from "@/lib/services/uploadImage2"; // changed to uploadImage3

export default function CategoryDialog({
    open,
    onOpenChange,
    selectedCategory,
    onCreate,
    onUpdate,
    isSubmitting,
    error,
    image,
    setImage
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue
    } = useForm();

    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // 0 - 100

    useEffect(() => {
        if (open) {
            if (selectedCategory) {
                reset({
                    name: selectedCategory.name,
                    slug: selectedCategory.slug,
                    active: selectedCategory.active,
                });
                setImage(selectedCategory.image || null);
            } else {
                reset({
                    name: '',
                    slug: '',
                    active: true,
                });
                setImage(null);
            }
            setUploadProgress(0);
            setIsUploading(false);
        }
    }, [open, selectedCategory, reset, setImage]);

    const watchName = watch("name");

    useEffect(() => {
        const generatedSlug = watchName
            ?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setValue('slug', generatedSlug);
    }, [watchName, setValue]);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Uploading...');
        try {
            setIsUploading(true);
            setUploadProgress(0);

            // uploadImage3 supports an onProgress callback
            const imageUrl = await uploadImage3(file, (progressFraction) => {
                // progressFraction expected 0..1 (adjust if your implementation differs)
                const percent = Math.round((progressFraction ?? 0) * 100);
                setUploadProgress(percent);
            });

            setImage(imageUrl);
            toast.success('Image uploaded', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setIsUploading(false);
            // small delay to let users see 100% if it reached there
            setTimeout(() => setUploadProgress(0), 700);
            // reset input so same file can be chosen again if needed
            if (e.target) e.target.value = "";
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                image: image,
            };

            if (selectedCategory?._id) {
                await onUpdate({ id: selectedCategory._id, data: payload });
            } else {
                await onCreate({ data: payload });
            }

            onOpenChange(false);
            setImage(null);
        } catch (error) {
            console.error('Submit Error:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] bg-back2 border border-bdr2 shadow-none rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800 tracking-tighter">
                        {selectedCategory ? "Edit Category" : "Add Category"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4 items-stretch">

                        {/* Image Upload - Left Column */}
                        <div className="flex flex-col justify-center items-center gap-2 border border-bdr2 bg-back1/40 p-4 rounded-xl min-h-[180px]">
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {!image ? (
                                <div
                                    className="mx-auto border border-dashed border-bdr2 bg-back2 hover:bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer h-28 w-28 text-slate-455 transition-colors duration-200"
                                    onClick={handleImageClick}
                                >
                                    <ImageIcon size={20} className="text-slate-400" />
                                    <span className="text-[10px] font-semibold text-slate-500">Select Image (1:1)</span>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <div className="w-28 h-28 border border-bdr2 bg-back2 rounded-xl relative overflow-hidden flex items-center justify-center">
                                        <Image
                                            height={112}
                                            width={112}
                                            quality={100}
                                            src={image}
                                            alt="category image"
                                            className="w-full h-full object-cover"
                                        />

                                        {/* If uploading show overlay progress */}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <div className="text-white text-[10px] font-bold animate-pulse">
                                                    {uploadProgress}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            onClick={handleImageClick}
                                            className="bg-back2 border border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold shadow-none text-[11px] py-1 h-7 px-2.5"
                                        >
                                            Change Image
                                        </Button>
                                        {isUploading && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                <Loader2 className="animate-spin h-3 w-3" />
                                                <span>{uploadProgress}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fields - Right Column */}
                        <div className="flex flex-col justify-between gap-4">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name" className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                    Name<span className="text-red-500"> *</span>
                                </Label>
                                <Input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                    className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", {
                                        "border-red-500": errors.name,
                                    })}
                                    placeholder="Sports"
                                />
                                {errors.name && (
                                    <p className="text-[11px] text-red-500 font-medium">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="slug" className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                    Slug<span className="text-red-500"> *</span>
                                </Label>
                                <Input
                                    id="slug"
                                    {...register("slug", {
                                        required: "Slug is required",
                                        validate: value =>
                                            !/\s/.test(value) || "Slug cannot contain spaces",
                                    })}
                                    className={clsx("w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none", { "border-red-500": errors.slug })}
                                    placeholder="sports"
                                    disabled
                                />
                                {errors.slug && (
                                    <p className="text-[11px] text-red-500 font-medium">
                                        {errors.slug.message}
                                    </p>
                                )}
                            </div>

                            {/* Active */}
                            <div className="flex items-center justify-between p-2.5 border border-bdr2 rounded-xl bg-back1/40 ">
                                <Label htmlFor="active" className="text-xs font-bold text-slate-700 cursor-pointer">
                                    Active Status
                                </Label>
                                <Switch
                                    id="active"
                                    checked={watch('active')}
                                    onCheckedChange={(checked) => setValue('active', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-655 mb-4 text-xs font-medium">Error: {error}</p>
                    )}

                    <DialogFooter className="pt-3 border-t border-bdr2 mt-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text font-semibold shadow-none w-full sm:w-auto"
                        >
                            {(isSubmitting) && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                            {selectedCategory ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
