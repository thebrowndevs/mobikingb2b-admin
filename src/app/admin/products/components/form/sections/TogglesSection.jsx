"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

export default function TogglesSection({ form }) {
  return (
    <div className="space-y-4">
      {/* Active Status Toggle */}
      <FormField
        control={form.control}
        name="active"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-bdr2 bg-back1/30 p-3.5 shadow-none space-y-0">
            <div className="space-y-0.5">
              <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Status Active
              </FormLabel>
              <p className="text-[11px] text-slate-400">
                Determine if this product is enabled across B2B storefront operations.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Web Visibility Toggle */}
      <FormField
        control={form.control}
        name="webVisibility"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-bdr2 bg-back1/30 p-3.5 shadow-none space-y-0">
            <div className="space-y-0.5">
              <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Web Visibility
              </FormLabel>
              <p className="text-[11px] text-slate-400">
                Make this product searchable and visible on the B2B web storefront.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* App Visibility Toggle */}
      <FormField
        control={form.control}
        name="appVisibility"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border border-bdr2 bg-back1/30 p-3.5 shadow-none space-y-0">
            <div className="space-y-0.5">
              <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                App Visibility
              </FormLabel>
              <p className="text-[11px] text-slate-400">
                Publish this product to be available inside B2B mobile applications.
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
