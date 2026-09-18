'use client';

import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, UploadCloud, GripVertical, Laptop, Smartphone, Link as LinkIcon } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { uploadImage3 } from '@/lib/services/uploadImage2';
import toast from 'react-hot-toast';
import Image from 'next/image';

function GroupImagesSheet({ open, onOpenChange, group, onSave, isSaving }) {
    const [imagesList, setImagesList] = useState([]);
    const [uploadingIndex, setUploadingIndex] = useState(null); // { index, field: 'desktopUrl' | 'mobileUrl' }

    // Load initial images list when sheet opens
    useEffect(() => {
        if (!open || !group) return;
        const rawImages = group.images || [];
        // Give each item a stable temporary id for reordering if needed
        const itemsWithId = rawImages.map((img, idx) => ({
            id: img._id || `img-${idx}-${Date.now()}`,
            desktopUrl: img.desktopUrl || '',
            mobileUrl: img.mobileUrl || '',
            redirectUrl: img.redirectUrl || ''
        }));
        setImagesList(itemsWithId);
    }, [open, group]);

    const handleAddImage = () => {
        const newItem = {
            id: `img-new-${Date.now()}-${Math.random()}`,
            desktopUrl: '',
            mobileUrl: '',
            redirectUrl: ''
        };
        setImagesList(prev => [...prev, newItem]);
    };

    const handleRemoveImage = (id) => {
        setImagesList(prev => prev.filter(img => img.id !== id));
    };

    const handleFieldChange = (id, field, value) => {
        setImagesList(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
    };

    const handleFileUpload = async (e, id, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading(`Uploading ${field === 'desktopUrl' ? 'Web' : 'Mobile'} image...`);
        try {
            setUploadingIndex({ id, field });
            const url = await uploadImage3(file);
            handleFieldChange(id, field, url);
            toast.success("Image uploaded successfully", { id: toastId });
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleSaveClick = async () => {
        if (!group?._id) return;
        try {
            // Strip client side 'id' property if it's generated, keep backend format
            const cleanImages = imagesList.map(img => ({
                desktopUrl: img.desktopUrl,
                mobileUrl: img.mobileUrl,
                redirectUrl: img.redirectUrl
            }));

            await onSave({
                id: group._id,
                data: {
                    images: cleanImages
                }
            });
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save layout image group assignments:", err);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[95vw] md:min-w-[85vw] lg:min-w-[75vw] overflow-y-auto pb-6 flex flex-col items-start justify-start gap-0 bg-back1">
                <SheetHeader className="pb-4 w-full border-b border-bdr2">
                    <div className="flex justify-between items-center w-full pr-6">
                        <div>
                            <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">
                                {group?.heading || 'Image Banners Group'}
                            </SheetTitle>
                            <SheetDescription className="text-slate-500 text-xs mt-0.5">
                                Add desktop & mobile banner pairs, set redirect links, and drag to reorder slides.
                            </SheetDescription>
                        </div>
                        <Button
                            onClick={handleAddImage}
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text text-xs h-9 font-semibold shadow-none gap-1.5"
                        >
                            <Plus size={16} /> Add Image Slide
                        </Button>
                    </div>
                </SheetHeader>

                <div className="mt-4 w-full flex-1 space-y-4">
                    {imagesList.length === 0 ? (
                        <div className="border border-dashed border-bdr2 rounded-2xl p-12 text-center bg-back2 flex flex-col items-center justify-center gap-3">
                            <p className="text-sm font-semibold text-slate-600">No image banners added yet</p>
                            <p className="text-xs text-slate-400 max-w-sm">Click "Add Image Slide" above to add carousel image slides with desktop and mobile support.</p>
                            <Button
                                onClick={handleAddImage}
                                variant="outline"
                                className="text-xs h-9 border-bdr2 font-medium mt-2"
                            >
                                <Plus size={14} className="mr-1" /> Add First Slide
                            </Button>
                        </div>
                    ) : (
                        <Reorder.Group values={imagesList} onReorder={setImagesList} className="space-y-4">
                            {imagesList.map((item, index) => {
                                const isUploadingDesktop = uploadingIndex?.id === item.id && uploadingIndex?.field === 'desktopUrl';
                                const isUploadingMobile = uploadingIndex?.id === item.id && uploadingIndex?.field === 'mobileUrl';

                                return (
                                    <Reorder.Item
                                        key={item.id}
                                        value={item}
                                        className="bg-back2 border border-bdr2 rounded-2xl p-4 sm:p-5 shadow-xs relative cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="text-slate-400 h-4 w-4 shrink-0 cursor-grab" />
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                    Slide #{index + 1}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveImage(item.id)}
                                                className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg gap-1 font-medium"
                                            >
                                                <Trash2 size={14} /> Remove Slide
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Desktop Image Field */}
                                            <div className="space-y-2 border border-bdr2 rounded-xl p-3 bg-back1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                                        <Laptop size={13} className="text-indigo-500" /> Web (Desktop) Banner
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Aspect: 16:3</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`desktopFile-${item.id}`}
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, item.id, 'desktopUrl')}
                                                    />
                                                    {item.desktopUrl ? (
                                                        <div className="relative w-full border border-bdr2 rounded-lg overflow-hidden bg-white aspect-[16/4]">
                                                            <Image src={item.desktopUrl} alt="desktop banner" fill className="object-cover" unoptimized />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFieldChange(item.id, 'desktopUrl', '')}
                                                                className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 z-10"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label
                                                            htmlFor={`desktopFile-${item.id}`}
                                                            className="flex flex-col items-center justify-center w-full aspect-[16/4] border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-white hover:border-slate-350 transition-all"
                                                        >
                                                            {isUploadingDesktop ? (
                                                                <Loader2 className="animate-spin text-primary h-5 w-5" />
                                                            ) : (
                                                                <UploadCloud size={20} className="text-slate-400" />
                                                            )}
                                                            <span className="text-[11px] text-slate-400 mt-1 font-medium">
                                                                Upload Desktop Banner
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mobile Image Field */}
                                            <div className="space-y-2 border border-bdr2 rounded-xl p-3 bg-back1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                                        <Smartphone size={13} className="text-emerald-600" /> Mobile Web & App Banner
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Aspect: 5:2</span>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`mobileFile-${item.id}`}
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, item.id, 'mobileUrl')}
                                                    />
                                                    {item.mobileUrl ? (
                                                        <div className="relative w-full border border-bdr2 rounded-lg overflow-hidden bg-white aspect-[5/2]">
                                                            <Image src={item.mobileUrl} alt="mobile banner" fill className="object-cover" unoptimized />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleFieldChange(item.id, 'mobileUrl', '')}
                                                                className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 z-10"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label
                                                            htmlFor={`mobileFile-${item.id}`}
                                                            className="flex flex-col items-center justify-center w-full aspect-[5/2] border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-white hover:border-slate-350 transition-all"
                                                        >
                                                            {isUploadingMobile ? (
                                                                <Loader2 className="animate-spin text-primary h-5 w-5" />
                                                            ) : (
                                                                <UploadCloud size={20} className="text-slate-400" />
                                                            )}
                                                            <span className="text-[11px] text-slate-400 mt-1 font-medium">
                                                                Upload Mobile Banner
                                                            </span>
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Redirect Link Input */}
                                        <div className="space-y-1">
                                            <Label className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                                                <LinkIcon size={12} className="text-slate-500" /> Redirect Destination URL (Optional)
                                            </Label>
                                            <Input
                                                type="text"
                                                value={item.redirectUrl}
                                                onChange={(e) => handleFieldChange(item.id, 'redirectUrl', e.target.value)}
                                                placeholder="e.g. /category/smartphones or https://..."
                                                className="bg-back1 border-bdr2 text-xs h-9 font-mono"
                                            />
                                        </div>
                                    </Reorder.Item>
                                );
                            })}
                        </Reorder.Group>
                    )}
                </div>

                <div className="border-t border-bdr2 pt-4 mt-6 flex justify-end gap-3 w-full bg-back1 sticky bottom-0 z-20">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="text-xs h-9 border-bdr2 bg-white shadow-none font-semibold text-slate-650 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveClick}
                        disabled={isSaving || !!uploadingIndex}
                        className="text-xs h-9 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold px-6"
                    >
                        {isSaving && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                        Save Image Slides
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default GroupImagesSheet;
