"use client";

import React, { useEffect } from "react";
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

export default function CorePricingSection({ form }) {
  const { watch, setValue } = form;
  const watchSlabs = watch("sellingPrice.slabs") || [];
  const firstSlabPrice = watchSlabs[0]?.price || "";
  const watchGst = watch("gst") || 18;

  // Automatically calculate basePrice when first slab price or gst changes
  useEffect(() => {
    const numericPrice = parseFloat(firstSlabPrice) || 0;
    const numericGst = parseFloat(watchGst) || 0;
    if (numericPrice > 0) {
      const calculatedBase = (numericPrice * (100 / (100 + numericGst))).toFixed(2);
      setValue("basePrice", Number(calculatedBase), { shouldValidate: true });
    } else {
      setValue("basePrice", "", { shouldValidate: true });
    }
  }, [firstSlabPrice, watchGst, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* GST Rate Selector */}
      <FormField
        control={form.control}
        name="gst"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              GST Tax Rate (%)<span className="text-red-500"> *</span>
            </FormLabel>
            <FormControl>
              <Select
                value={field.value !== undefined && field.value !== null ? String(field.value) : "18"}
                onValueChange={(val) => field.onChange(val === "" ? null : Number(val))}
              >
                <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none text-sm">
                  <SelectValue placeholder="Select GST rate" />
                </SelectTrigger>
                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                  {["0", "5", "12", "18", "28"].map((rate) => (
                    <SelectItem key={rate} value={rate}>
                      {rate}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Base Price (Untaxed) */}
      <FormField
        control={form.control}
        name="basePrice"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Base Price (Excl. GST)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                disabled
                placeholder="Calculated from Slab 1 price..."
                {...field}
                className="w-full bg-back1/50 border-bdr2 text-slate-500 focus:outline-none shadow-none cursor-not-allowed"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Regular Price (MRP) */}
      <FormField
        control={form.control}
        name="regularPrice"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Printed MRP Price (₹)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="e.g. 999"
                {...field}
                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Discount Percentage */}
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Discount Value (%)
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="e.g. 10"
                {...field}
                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* MOQ (Minimum Order Quantity) */}
      <FormField
        control={form.control}
        name="moq"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Minimum Order Quantity (MOQ)<span className="text-red-500"> *</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1"
                {...field}
                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
