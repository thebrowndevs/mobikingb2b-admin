"use client";

import React from "react";
import dynamic from "next/dynamic";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useFieldArray } from "react-hook-form";

const RTEFieldGlobal = dynamic(() => import("@/components/RTEFieldGlobal"), {
  ssr: false,
  loading: () => (
    <p className="py-8 text-center text-xs text-slate-450 italic">
      Loading editor...
    </p>
  ),
});

export default function DescriptionSection({ form }) {
  const { control } = form;

  // descriptionPoints array helper
  const {
    fields: pointFields,
    append: appendPoint,
    remove: removePoint,
  } = useFieldArray({
    control,
    name: "descriptionPoints",
  });

  // keyInformation array helper (Title, Content specs)
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "keyInformation",
  });

  return (
    <div className="space-y-6">
      {/* Product Rich Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Product Description<span className="text-red-500"> *</span>
            </FormLabel>
            <FormControl>
              <div className="border border-bdr2 rounded-xl overflow-hidden bg-back1">
                <RTEFieldGlobal
                  name={field.name}
                  content={field.value}
                  setValue={form.setValue}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Bullet Feature Points */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
            Highlight Bullet Points
          </FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPoint("")}
            className="h-7 text-xs bg-back2 border-bdr2 text-slate-700 shadow-none gap-1 font-semibold"
          >
            <Plus className="h-3 w-3" /> Add Point
          </Button>
        </div>

        <div className="space-y-2">
          {pointFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <FormField
                control={form.control}
                name={`descriptionPoints.${idx}`}
                render={({ field: inputField }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder="e.g. Ergonomic design with high bass driver"
                        {...inputField}
                        className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePoint(idx)}
                className="h-9 w-9 text-slate-450 hover:text-red-500 hover:bg-red-50/50 rounded-xl"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {pointFields.length === 0 && (
            <div className="text-[11px] text-slate-400 italic text-center py-4 bg-back2/30 border border-dashed border-bdr2 rounded-xl">
              No highlights added. Highlights help in wholesale product marketing.
            </div>
          )}
        </div>
      </div>

      {/* Key Specifications (keyInformation) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
            Technical Specifications (Key Information)
          </FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSpec({ title: "", content: "" })}
            className="h-7 text-xs bg-back2 border-bdr2 text-slate-700 shadow-none gap-1 font-semibold"
          >
            <Plus className="h-3 w-3" /> Add Spec
          </Button>
        </div>

        <div className="space-y-2">
          {specFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              {/* Specification Title */}
              <FormField
                control={form.control}
                name={`keyInformation.${idx}.title`}
                render={({ field: inputField }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder="e.g. Battery Capacity"
                        {...inputField}
                        className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specification Content */}
              <FormField
                control={form.control}
                name={`keyInformation.${idx}.content`}
                render={({ field: inputField }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder="e.g. 500mAh"
                        {...inputField}
                        className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(idx)}
                className="h-9 w-9 text-slate-450 hover:text-red-500 hover:bg-red-50/50 rounded-xl"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {specFields.length === 0 && (
            <div className="text-[11px] text-slate-400 italic text-center py-4 bg-back2/30 border border-dashed border-bdr2 rounded-xl">
              No technical specifications added yet. Specs help B2B buyers compare models.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
