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
import { Loader2 } from 'lucide-react';
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { uploadImage3 } from "@/lib/services/uploadImage2"; // use uploadImage3

export default function BrandDialog({
    open,
    onOpenChange,
    selectedBrand,
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
            if (selectedBrand) {
                reset({
                    name: selectedBrand.name,
                    active: selectedBrand.active,
                });
                setImage(selectedBrand.image || null);
            } else {
                reset({
                    name: '',
                    active: true,
                });
                setImage(null);
            }
            setUploadProgress(0);
            setIsUploading(false);
        }
    }, [open, selectedBrand, reset, setImage]);

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Uploading...');
        try {
            setIsUploading(true);
            setUploadProgress(0);

            const imageUrl = await uploadImage3(file, (progressFraction) => {
                // assume progressFraction is 0..1
                const percent = Math.round((progressFraction ?? 0) * 10);
                setUploadProgress(percent);
            });

            setImage(imageUrl);
            toast.success('Image uploaded', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error('Upload failed', { id: toastId });
        } finally {
            setIsUploading(false);
            // small delay so user can see 100%
            setTimeout(() => setUploadProgress(0), 700);
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

            if (selectedBrand?._id) {
                const finalData = { brandId: selectedBrand?._id, ...payload }
                await onUpdate({ data: finalData });
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {selectedBrand ? "Edit Brand" : "Add Brand"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">

                        {/* Image Upload */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        {!image ? (
                            <div
                                className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer h-48"
                                onClick={handleImageClick}
                            >
                                <span className="text-gray-500">Click to select image</span>
                            </div>
                        ) : (
                            <>
                                <div className="h-full w-full border rounded-xl relative">
                                    <Image
                                        height={100}
                                        width={100}
                                        quality={100}
                                        src={image}
                                        alt="brand image"
                                        className="w-full h-44 object-contain"
                                    />

                                    {/* If uploading show overlay progress */}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="text-white text-sm">
                                                Uploading... {uploadProgress}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Button type="button" onClick={handleImageClick}>
                                        Change Image
                                    </Button>
                                    {isUploading && (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" />
                                            <span className="text-sm text-gray-600">{uploadProgress}%</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Name */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="name" className="text-right mt-2">
                                Name<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    {...register("name", { required: "Name is required" })}
                                    className={clsx("w-full", {
                                        "border-red-500": errors.name,
                                    })}
                                    placeholder="boAt / SkullCandy"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Active */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="active" className="text-right mt-2">
                                Active<span className="text-red-500"> *</span>
                            </Label>
                            <div className="col-span-3">
                                <Switch
                                    checked={watch('active')}
                                    onCheckedChange={(checked) => setValue('active', checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-600 mb-5 text-sm">Error: {error}</p>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {(isSubmitting) && <Loader2 className="animate-spin mr-1" />}
                            {selectedBrand ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
