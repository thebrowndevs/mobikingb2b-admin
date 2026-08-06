"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useFieldArray } from "react-hook-form";

export default function PricingSlabsSection({ form }) {
  const { control, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sellingPrice.slabs",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-bdr2">
        <div>
          <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Wholesale Discount Slabs Matrix
          </FormLabel>
          <p className="text-[11px] text-slate-400">
            Define bulk wholesale quantity slabs and set pricing levels. The first slab (Qty 1) acts as the base selling price.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const currentSlabs = watch("sellingPrice.slabs") || [];
            const lastQty = currentSlabs[currentSlabs.length - 1]?.quantity || 1;
            const lastPrice = currentSlabs[currentSlabs.length - 1]?.price || "";
            append({
              quantity: Number(lastQty) + 10,
              price: lastPrice ? Math.max(0, Number(lastPrice) - 5) : "",
            });
          }}
          className="h-8 text-xs bg-back2 border-bdr2 text-slate-700 shadow-none gap-1 font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Add Price Slab
        </Button>
      </div>

      <div className="border border-bdr2 rounded-xl overflow-hidden bg-back2/30">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-bdr2 text-slate-500 font-bold">
              <th className="p-3 w-16 text-center">#</th>
              <th className="p-3">Min Quantity (Threshold)</th>
              <th className="p-3">Slab Wholesale Price (₹)</th>
              <th className="p-3 w-20 text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr
                key={field.id}
                className="border-b border-bdr2 last:border-b-0 bg-transparent hover:bg-slate-50/30 transition-colors"
              >
                <td className="p-3 text-center align-middle font-medium text-slate-450">
                  {idx + 1}
                </td>

                {/* Slab Minimum Quantity Threshold */}
                <td className="p-2.5 align-middle">
                  <FormField
                    control={form.control}
                    name={`sellingPrice.slabs.${idx}.quantity`}
                    render={({ field: inputField }) => (
                      <FormItem className="space-y-0 w-full">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 50"
                            {...inputField}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              inputField.onChange(val);
                            }}
                            className="bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-8.5 text-xs max-w-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                {/* Slab Wholesale Price */}
                <td className="p-2.5 align-middle">
                  <FormField
                    control={form.control}
                    name={`sellingPrice.slabs.${idx}.price`}
                    render={({ field: inputField }) => (
                      <FormItem className="space-y-0 w-full">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 450"
                            {...inputField}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              inputField.onChange(val);
                            }}
                            className="bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none h-8.5 text-xs max-w-[200px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                {/* Remove Button (Don't allow removing first element) */}
                <td className="p-2.5 align-middle text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={idx === 0}
                    onClick={() => remove(idx)}
                    className="h-8 w-8 hover:bg-red-50 text-slate-400 hover:text-red-650 disabled:opacity-30 disabled:pointer-events-none rounded-lg"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
