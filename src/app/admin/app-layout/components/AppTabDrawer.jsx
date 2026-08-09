'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { uploadImage3 } from '@/lib/services/uploadImage2';

const formSchema = z.object({
    name: z.string().min(1, "Tab Display Name is required"),
    active: z.boolean().default(true),
    header: z.object({
        upperBanner: z.string().min(1, "Upper Banner Image is required"),
        lowerBanner: z.string().min(1, "Lower Banner Image is required"),
        icon: z.string().min(1, "SVG Icon Code is required"),
        iconColor: z.string().min(1, "Icon Theme Color is required"),
        redirectUrl: z.string().optional().nullable()
    })
});

const defaultHeader = {
    upperBanner: '',
    lowerBanner: '',
    icon: '',
    iconColor: '#4f46e5',
    redirectUrl: ''
};

function AppTabDrawer({ open, onOpenChange, tab, onSave, isSaving }) {
    const [uploadingField, setUploadingField] = useState(null); // 'upperBanner' | 'lowerBanner'

    const form = useForm({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            active: true,
            header: { ...defaultHeader }
        }
    });

    const { setValue, control, reset, watch, formState: { isValid } } = form;

    useEffect(() => {
        if (open) {
            if (tab) {
                reset({
                    name: tab.name || '',
                    active: tab.active !== undefined ? tab.active : true,
                    header: {
                        upperBanner: tab.header?.upperBanner || '',
                        lowerBanner: tab.header?.lowerBanner || '',
                        icon: tab.header?.icon || '',
                        iconColor: tab.header?.iconColor || '#4f46e5',
                        redirectUrl: tab.header?.redirectUrl || ''
                    }
                });
            } else {
                reset({
                    name: '',
                    active: true,
                    header: { ...defaultHeader }
                });
            }
        }
    }, [open, tab, reset]);

    const handleFileUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading(`Uploading image...`);
        try {
            setUploadingField(field);
            const url = await uploadImage3(file);
            setValue(`header.${field}`, url, { shouldValidate: true, shouldDirty: true });
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
            await onSave(values);
            onOpenChange(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[95vw] md:max-w-lg overflow-y-auto bg-back1 text-slate-800 border-l border-bdr2 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                    <SheetHeader className="p-0">
                        <SheetTitle className="text-xl font-bold tracking-tighter text-slate-900">{tab ? 'Edit App Home Tab' : 'Create App Home Tab'}</SheetTitle>
                        <SheetDescription className="-mt-1">
                            {tab ? 'Modify app layout filter tab settings and banner redirects.' : 'Configure a new filter tab for the mobile app home screen.'}
                        </SheetDescription>
                    </SheetHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Tab Name */}
                            <FormField
                                control={control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-xs">Tab Display Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Best Sellers, Winter Special" className="bg-back2 border-bdr2 text-xs" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active Switch */}
                            <FormField
                                control={control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between p-3 border border-bdr2 rounded-sm bg-back2">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-slate-700 font-semibold text-xs">Active Status</FormLabel>
                                            <p className="text-[10px] text-slate-400">Toggle whether this tab is visible on mobile home page</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Redirect URL
                            <FormField
                                control={control}
                                name="header.redirectUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-xs">Banner Redirect Destination Link</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. /category/footwear" className="bg-back2 border-bdr2 text-xs" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            */}

                            {/* SVG Icon Code */}
                            <FormField
                                control={control}
                                name="header.icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-xs">SVG Icon (HTML/SVG Code)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='e.g. <svg viewBox="0 0 24 24">...</svg>' className="bg-back2 border-bdr2 text-xs min-h-[90px] font-mono" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Icon Color Picker */}
                            <FormField
                                control={control}
                                name="header.iconColor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold text-xs">Icon Theme Color</FormLabel>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="h-9 w-9 rounded-lg border border-bdr2 bg-transparent cursor-pointer shrink-0" {...field} value={field.value || '#4f46e5'} />
                                            <FormControl>
                                                <Input className="bg-back2 border-bdr2 text-xs" placeholder="#4f46e5" {...field} value={field.value || ''} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Upper Banner Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Upper Banner Image</Label>
                                <div className="relative w-full aspect-[16/5] border border-bdr2 rounded-xl bg-back2 overflow-hidden flex flex-col items-center justify-center">
                                    {watch('header.upperBanner') ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={watch('header.upperBanner')}
                                                alt="upper banner"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setValue('header.upperBanner', '')}
                                                className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow"
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
                                                onChange={(e) => handleFileUpload(e, 'upperBanner')}
                                                disabled={uploadingField !== null}
                                            />
                                            {uploadingField === 'upperBanner' ? (
                                                <Loader2 className="animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <UploadCloud size={20} className="text-slate-400 mb-1" />
                                                    <span className="text-[10px] text-slate-400 font-semibold">Upload Upper Banner</span>
                                                </>
                                            )}
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Lower Banner Upload */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-slate-700">Lower Banner Image</Label>
                                <div className="relative w-full aspect-[16/5] border border-bdr2 rounded-xl bg-back2 overflow-hidden flex flex-col items-center justify-center">
                                    {watch('header.lowerBanner') ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={watch('header.lowerBanner')}
                                                alt="lower banner"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setValue('header.lowerBanner', '')}
                                                className="absolute right-2 top-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow"
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
                                                onChange={(e) => handleFileUpload(e, 'lowerBanner')}
                                                disabled={uploadingField !== null}
                                            />
                                            {uploadingField === 'lowerBanner' ? (
                                                <Loader2 className="animate-spin text-primary" />
                                            ) : (
                                                <>
                                                    <UploadCloud size={20} className="text-slate-400 mb-1" />
                                                    <span className="text-[10px] text-slate-400 font-semibold">Upload Lower Banner</span>
                                                </>
                                            )}
                                        </label>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                <div className="border-t border-bdr2 pt-4 mt-6 flex justify-end gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="text-xs h-9 border-bdr2 bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={!isValid || isSaving || !!uploadingField}
                        className="text-xs h-9 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text"
                    >
                        {isSaving && <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />}
                        {tab ? 'Save Settings' : 'Create Tab'}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default AppTabDrawer;
