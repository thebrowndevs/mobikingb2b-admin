"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import ImageSelector from "@/components/ImageSelector";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").refine(val => !/\s/.test(val), {
        message: "Slug cannot contain spaces",
    }),
    active: z.boolean(),
    featured: z.boolean(),
    sequenceNo: z.coerce.number({ required_error: "Sequence number is required" }),
    categoryId: z.string().min(1, "Category is required"),
});

export default function CategoryDialog({
    open,
    onOpenChange,
    selectedSubCategory,
    onCreate,
    onUpdate,
    isSubmitting,
    error,
    image,
    setImage,
    categories,
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            slug: "",
            active: true,
            featured: false,
            sequenceNo: 0,
            categoryId: "",
        },
    });

    const watchName = form.watch("name");

    useEffect(() => {
        const slug = watchName
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        form.setValue("slug", slug);
    }, [watchName]);

    useEffect(() => {
        if (open) {
            if (selectedSubCategory) {
                form.reset({
                    name: selectedSubCategory.name || "",
                    slug: selectedSubCategory.slug || "",
                    active: selectedSubCategory.active ?? true,
                    featured: selectedSubCategory.featured ?? false,
                    sequenceNo: selectedSubCategory.sequenceNo || 0,
                    categoryId: selectedSubCategory.categoryId || "",
                });
            } else {
                form.reset();
            }
        }
    }, [open, selectedSubCategory, form]);

    const onSubmit = async (values) => {
        const payload = { ...values, image };

        try {
            if (selectedSubCategory?._id) {
                await onUpdate({ id: selectedSubCategory._id, data: payload });
            } else {
                await onCreate({ data: payload });
            }

            onOpenChange(false);
            setImage(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selectedSubCategory ? "Edit Sub Category" : "Create Sub Category"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Image */}
                        {!image ? (
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-xl h-44 flex items-center justify-center cursor-pointer"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <span className="text-gray-500">Click to select image</span>
                            </div>
                        ) : (
                            <div className="w-full border rounded-xl">
                                <Image
                                    src={image}
                                    alt="Selected"
                                    width={100}
                                    height={100}
                                    className="w-full h-44 object-contain"
                                />
                            </div>
                        )}
                        {image && (
                            <Button type="button" onClick={() => setIsDialogOpen(true)}>
                                Change Image
                            </Button>
                        )}

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name<span className="text-red-500"> *</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sports" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Slug */}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug<span className="text-red-500"> *</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="sports" {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sequence Number */}
                        <FormField
                            control={form.control}
                            name="sequenceNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sequence No<span className="text-red-500"> *</span></FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category<span className="text-red-500"> *</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories?.data?.map((cat) => (
                                                <SelectItem key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Active */}
                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel>Active</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Featured */}
                        <FormField
                            control={form.control}
                            name="featured"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel>Featured</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                {selectedSubCategory ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

                <ImageSelector
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    setImage={setImage}
                />
            </DialogContent>
        </Dialog>
    );
}
