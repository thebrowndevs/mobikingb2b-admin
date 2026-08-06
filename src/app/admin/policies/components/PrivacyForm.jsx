'use client';

import dynamic from 'next/dynamic';
const RTEField = dynamic(() => import('./RTEField'), {
    ssr: false,
    loading: () => <p className="py-10 text-center text-gray-500">Loading editor...</p>,
});

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import LoaderButton from '@/components/custom/LoaderButton';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const policySchema = z.object({
    policyName: z.string().min(1, "Policy Name is required"),
    slug: z.string().optional(),
    heading: z.string().min(1, "Heading is required"),
    content: z.string().min(1, "Content is required"),
    lastUpdated: z.string().min(1, "Last Updated date is required"),
});

function PrivacyForm({ open, onOpenChange, data, onCreate, onUpdate, setSelected, canEdit, canAdd }) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(policySchema),
        defaultValues: {
            policyName: '',
            slug: '',
            heading: '',
            content: '',
            lastUpdated: '',
        },
    });

    useEffect(() => {
        if (data) {
            const formattedDate = data.lastUpdated?.split('T')[0] || '';
            reset({
                policyName: data.policyName || '',
                slug: data.slug || '',
                heading: data.heading || '',
                content: data.content,
                lastUpdated: formattedDate,
            });
        } else {
            reset({
                policyName: '',
                slug: '',
                heading: '',
                content: '',
                lastUpdated: '',
            });
        }
    }, [data, reset]);

    async function onSubmit(values) {
        try {
            setLoading(true);
            if (data) {
                await onUpdate.mutateAsync({ id: data._id, data: values });
            } else {
                await onCreate.mutateAsync(values);
            }
            setSelected(null);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-2xl lg:max-w-3xl gap-0 w-full bg-back2 border-l border-bdr2 shadow-none flex flex-col h-full p-0"
            >
                {/* Header Section */}
                <SheetHeader className="border-b border-bdr2 px-6 py-4 flex flex-col gap-0.5">
                    <SheetTitle className="text-lg font-bold text-slate-800 tracking-tight">
                        {data ? "Edit Policy" : "Create New Policy"}
                    </SheetTitle>
                    <p className="text-xs text-slate-400">Configure parameters and content details of your storefront policy</p>
                </SheetHeader>

                {/* Form Body - Scrollable */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="policyName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Policy Name*
                                </Label>
                                <Input
                                    id="policyName"
                                    type="text"
                                    className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                    {...register('policyName')}
                                />
                                {errors.policyName && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.policyName.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="lastUpdated" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                    Last Updated*
                                </Label>
                                <Input
                                    id="lastUpdated"
                                    type="date"
                                    className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                    {...register('lastUpdated')}
                                />
                                {errors.lastUpdated && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastUpdated.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="heading" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Heading*
                            </Label>
                            <Input
                                id="heading"
                                type="text"
                                className="w-full bg-back1 border border-bdr2 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-200"
                                {...register('heading')}
                            />
                            {errors.heading && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.heading.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Content*
                            </Label>
                            <div className="border border-bdr2 rounded-lg overflow-hidden bg-back1">
                                <RTEField
                                    content={data?.content}
                                    setValue={setValue}
                                />
                            </div>
                            {errors.content && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.content.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="border-t border-bdr2 p-6 flex justify-end gap-3 bg-back1">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-back2 hover:bg-slate-100 border border-bdr2 text-slate-700 font-semibold"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {data && canEdit && (
                            <LoaderButton
                                type="submit"
                                loading={loading}
                                className="bg-primary-btn text-primary-btn-text font-semibold hover:bg-primary-btn-hover px-5 shadow-none"
                            >
                                Update
                            </LoaderButton>
                        )}
                        {!data && canAdd && (
                            <LoaderButton
                                type="submit"
                                loading={loading}
                                className="bg-primary-btn text-primary-btn-text font-semibold hover:bg-primary-btn-hover px-5 shadow-none"
                            >
                                Add
                            </LoaderButton>
                        )}
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}

export default PrivacyForm;
