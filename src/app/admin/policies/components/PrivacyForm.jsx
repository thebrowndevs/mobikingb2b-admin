'use client';

import dynamic from 'next/dynamic';
const RTEField = dynamic(() => import('./RTEField'), {
    ssr: false,
    loading: () => <p className="py-10 text-center text-gray-500">Loading editor...</p>,
});

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        watch,
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
                console.log(values)
                await onUpdate.mutateAsync({ id: data._id, data: values });
            } else {
                console.log(values)

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[90vw] lg:min-w-5xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{data ? "Edit Privacy Policy" : "Add Privacy Policy"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <Label htmlFor="policyName">Policy Name*</Label>
                        <Input id="policyName" type="text" {...register('policyName')} />
                        {errors.policyName && (
                            <p className="text-red-500 text-sm mt-1">{errors.policyName.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="heading">Heading*</Label>
                        <Input id="heading" type="text" {...register('heading')} />
                        {errors.heading && (
                            <p className="text-red-500 text-sm mt-1">{errors.heading.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="lastUpdated">Last Updated*</Label>
                        <Input id="lastUpdated" type="date" {...register('lastUpdated')} />
                        {errors.lastUpdated && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastUpdated.message}</p>
                        )}
                    </div>

                    <div>
                        <Label>Content*</Label>
                        <RTEField
                            content={data?.content}
                            setValue={setValue}
                        />
                        {errors.content && (
                            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {data && canEdit &&
                            <LoaderButton type="submit" loading={loading}>
                                Update
                            </LoaderButton>
                        }
                        {!data && canAdd &&
                            <LoaderButton type="submit" loading={loading}>
                                Add
                            </LoaderButton>
                        }
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PrivacyForm;
