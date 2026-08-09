'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, UploadCloud, X, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImage3 } from '@/lib/services/uploadImage2';
import { Reorder } from 'framer-motion';

function WebBannersTab({ layout, onSave, isSaving }) {
    const [banners, setBanners] = useState([]);
    const [uploadingIndex, setUploadingIndex] = useState(null); // { index, field: 'desktopUrl' | 'mobileUrl' }

    useEffect(() => {
        if (layout?.banners) {
            setBanners(layout.banners.map(b => ({
                desktopUrl: b.desktopUrl || '',
                mobileUrl: b.mobileUrl || '',
                redirectUrl: b.redirectUrl || ''
            })));
        }
    }, [layout]);

    const handleAddBanner = () => {
        setBanners(prev => [...prev, { desktopUrl: '', mobileUrl: '', redirectUrl: '' }]);
    };

    const handleRemoveBanner = (index) => {
        setBanners(prev => prev.filter((_, i) => i !== index));
    };

    const handleFieldChange = (index, field, value) => {
        setBanners(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleFileUpload = async (e, index, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading(`Uploading banner image...`);
        try {
            setUploadingIndex({ index, field });
            const url = await uploadImage3(file);
            handleFieldChange(index, field, url);
            toast.success("Image uploaded successfully", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Upload failed", { id: toastId });
        } finally {
            setUploadingIndex(null);
        }
    };

    const handleSaveClick = async () => {
        // Validate required urls
        const invalid = banners.some(b => !b.desktopUrl || !b.mobileUrl);
        if (invalid) {
            toast.error("Please upload both Desktop and App banners for all entries");
            return;
        }

        try {
            await onSave({ banners });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 pt-3">
            <div className="flex justify-between items-center pb-4 border-b border-bdr2">
                <div>
                    <h3 className="text-base font-bold text-slate-800">Home Slider Banners ({banners.length})</h3>
                    <p className="text-xs text-slate-500">Configure promotional slide banners for desktop and mobile apps.</p>
                </div>
                <Button
                    onClick={handleAddBanner}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    <Plus size={16} className="mr-1" /> Add Slide Banner
                </Button>
            </div>

            {banners.length === 0 ? (
                <div className="text-center py-12 bg-back2 border border-dashed border-bdr2 rounded-xl text-slate-400 font-medium text-xs">
                    No slide banners configured. Click "Add Slide Banner" to get started.
                </div>
            ) : (
                <Reorder.Group values={banners} onReorder={setBanners} className="space-y-6">
                    {banners.map((banner, idx) => (
                        <Reorder.Item
                            key={idx}
                            value={banner}
                            className="bg-back2 border border-bdr2 rounded-xl p-5 space-y-4 cursor-grab active:cursor-grabbing hover:border-slate-350 transition-colors relative"
                        >
                            <div className="absolute right-4 top-4 z-10">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleRemoveBanner(idx)}
                                    className="h-8 w-8 text-red-650 hover:bg-red-50 rounded-lg p-0"
                                    title="Delete Slide"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-back1 border border-bdr2 px-2 py-0.5 rounded">
                                Slide #{idx + 1}
                            </span>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                                {/* Desktop Banner Aspect 16:3 */}
                                <div className="lg:col-span-7 space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">Desktop Banner (16:3 Ratio)</Label>
                                    <div className="relative w-full aspect-[16/3] border border-bdr2 rounded-xl bg-back1 overflow-hidden flex flex-col items-center justify-center">
                                        {banner.desktopUrl ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={banner.desktopUrl}
                                                    alt="desktop banner"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldChange(idx, 'desktopUrl', '')}
                                                    className="absolute right-2 top-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100/50 transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, idx, 'desktopUrl')}
                                                    disabled={uploadingIndex !== null}
                                                />
                                                {uploadingIndex?.index === idx && uploadingIndex?.field === 'desktopUrl' ? (
                                                    <Loader2 className="animate-spin text-primary" />
                                                ) : (
                                                    <>
                                                        <UploadCloud size={24} className="text-slate-400 mb-1" />
                                                        <span className="text-[10px] text-slate-400 font-semibold">Upload 16:3 Desktop Banner</span>
                                                    </>
                                                )}
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* App Banner Aspect 5:3 */}
                                <div className="lg:col-span-5 space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">App Banner (5:3 Ratio)</Label>
                                    <div className="relative w-full aspect-[5/3] border border-bdr2 rounded-xl bg-back1 overflow-hidden flex flex-col items-center justify-center">
                                        {banner.mobileUrl ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={banner.mobileUrl}
                                                    alt="app banner"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFieldChange(idx, 'mobileUrl', '')}
                                                    className="absolute right-2 top-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100/50 transition">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, idx, 'mobileUrl')}
                                                    disabled={uploadingIndex !== null}
                                                />
                                                {uploadingIndex?.index === idx && uploadingIndex?.field === 'mobileUrl' ? (
                                                    <Loader2 className="animate-spin text-primary" />
                                                ) : (
                                                    <>
                                                        <UploadCloud size={24} className="text-slate-400 mb-1" />
                                                        <span className="text-[10px] text-slate-400 font-semibold">Upload 5:3 App Banner</span>
                                                    </>
                                                )}
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Redirect URL Input */}
                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-semibold text-slate-700">Redirect Destination URL</Label>
                                <Input
                                    placeholder="e.g. /category/electronics"
                                    value={banner.redirectUrl}
                                    onChange={(e) => handleFieldChange(idx, 'redirectUrl', e.target.value)}
                                    className="bg-back1 border-bdr2 text-xs"
                                />
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}

            <div className="flex justify-end pt-4 border-t border-bdr2">
                <Button
                    onClick={handleSaveClick}
                    disabled={isSaving || banners.length === 0}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9"
                >
                    {isSaving && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                    Save Banners Layout
                </Button>
            </div>
        </div>
    );
}

export default WebBannersTab;
