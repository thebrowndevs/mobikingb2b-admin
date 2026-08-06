"use client";

import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MiniLoaderButton from "@/components/custom/MiniLoaderButton";
import BrandDialog from "@/app/admin/brands/components/BrandDialog";
import { useBrands } from "@/hooks/useBrands";
import { Star } from "lucide-react";
import MetadataSection from "./MetadataSection";

export default function GeneralDetailsSection({ form, categories }) {
  const [brandDialog, setBrandDialog] = useState(false);
  const [brandImage, setBrandImage] = useState(null);
  const { createBrand, brandsQuery } = useBrands();
  const brands = brandsQuery?.data?.data || [];

  const {
    mutateAsync: createBrandAsync,
    isPending: isCreating,
    error: createError,
  } = createBrand;

  const handleCreateBrand = async (brandData) => {
    try {
      const response = await createBrandAsync({ ...brandData, image: brandImage });
      if (response?.data?._id) {
        form.setValue("brandId", response.data._id, { shouldValidate: true });
      }
      setBrandDialog(false);
      setBrandImage(null);
    } catch (err) {
      console.error("Failed to create brand:", err);
    }
  };

  const ratingValue = parseFloat(form.watch("rating")) || 0;

  return (
    <div className="space-y-4">
      {/* Product Title / Full Name (Full Width) */}
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Product Title / Full Name<span className="text-red-500"> *</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter product title..."
                {...field}
                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Slug (Full Width) */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Slug (URL Path Link)<span className="text-red-500"> *</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="slug-path-auto-generated"
                {...field}
                disabled
                className="w-full bg-back1/50 border-bdr2 text-slate-500 focus:outline-none shadow-none cursor-not-allowed"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Grid: Brand, Category, SKU, and HSN in one 4-column row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Brand Selector */}
        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                Brand<span className="text-red-500"> *</span>
              </FormLabel>
              <div className="flex gap-1.5 items-center">
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none text-sm h-9">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                      {brands?.map((brand) => (
                        <SelectItem key={brand._id} value={brand._id}>
                          {brand?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <MiniLoaderButton
                  type="button"
                  onClick={() => setBrandDialog(true)}
                  className="shrink-0 h-9 w-9 flex items-center justify-center bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text text-base border-0 rounded-lg"
                >
                  +
                </MiniLoaderButton>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selector */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                Category<span className="text-red-500"> *</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value || ""}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none text-sm h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                    {categories?.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* SKU */}
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                SKU Code
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. SKU-001"
                  {...field}
                  className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-9 text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* HSN */}
        <FormField
          control={form.control}
          name="hsn"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                HSN Code
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 851830"
                  {...field}
                  className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-9 text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Grid: Rating & Review Count in a 2-column row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rating Field with Golden Star indicators */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                Product Rating (0.0 to 5.0)
              </FormLabel>
              <div className="flex gap-3 items-center">
                <FormControl className="w-24 shrink-0">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="e.g. 4.5"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-9 text-xs"
                  />
                </FormControl>
                {/* Visual Golden Stars Row */}
                <div className="flex gap-1 items-center h-9">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4.5 w-4.5 ${ratingValue >= star
                          ? "text-amber-500 fill-amber-500"
                          : ratingValue >= star - 0.5
                            ? "text-amber-500 fill-amber-300"
                            : "text-slate-200"
                        }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-650 ml-1">
                    ({ratingValue.toFixed(1)})
                  </span>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Review Count Field */}
        <FormField
          control={form.control}
          name="reviewCount"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
                Review Count (Number of Ratings)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 120"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-9 text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Metadata tags search keywords layout block */}
      <MetadataSection form={form} />

      <BrandDialog
        open={brandDialog}
        onOpenChange={setBrandDialog}
        onCreate={handleCreateBrand}
        isSubmitting={isCreating}
        error={createError?.message}
        image={brandImage}
        setImage={setBrandImage}
      />
    </div>
  );
}
