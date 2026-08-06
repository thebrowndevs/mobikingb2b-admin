"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function MetadataSection({ form }) {
  const { watch, setValue } = form;
  const fullNameValue = watch("fullName") || "";
  const tagsValue = watch("tags") || "";

  // Extract unique keywords to suggest as tags
  const uniqueWords = React.useMemo(() => {
    if (!fullNameValue) return [];
    const words = fullNameValue
      .split(/[\s,.\-\/]+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 2);
    return Array.from(new Set(words));
  }, [fullNameValue]);

  const handleWordToggle = (word) => {
    let currentTags = [];
    if (typeof tagsValue === "string" && tagsValue.trim().length > 0) {
      currentTags = tagsValue
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }

    const isAdded = currentTags.some(
      (t) => t.toLowerCase() === word.toLowerCase()
    );
    let nextTags = [];

    if (isAdded) {
      nextTags = currentTags.filter(
        (t) => t.toLowerCase() !== word.toLowerCase()
      );
    } else {
      nextTags = [...currentTags, word];
    }

    setValue("tags", nextTags.join(", "), { shouldValidate: true });
  };

  const isWordSelected = (word) => {
    if (!tagsValue) return false;
    const currentTags = tagsValue
      .split(",")
      .map((t) => t.trim().toLowerCase());
    return currentTags.includes(word.toLowerCase());
  };

  return (
    <div className="space-y-3 pt-3 border-t border-bdr2">
      {/* Tags Input */}
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Tags (Enter Comma Separated Values)
            </FormLabel>
            <FormControl>
              <Input
                placeholder="earphones, wireless, bluetooth"
                {...field}
                className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none text-xs"
              />
            </FormControl>
            {uniqueWords.length > 0 && (
              <div className="mt-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Click to add words from product name:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {uniqueWords.map((word) => {
                    const selected = isWordSelected(word);
                    return (
                      <Badge
                        key={word}
                        variant="secondary"
                        onClick={() => handleWordToggle(word)}
                        className={`cursor-pointer transition-colors shadow-none text-xs rounded-md ${selected
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "bg-slate-100/50 hover:bg-slate-100 text-slate-650 border border-slate-200"
                          }`}
                      >
                        {word}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
