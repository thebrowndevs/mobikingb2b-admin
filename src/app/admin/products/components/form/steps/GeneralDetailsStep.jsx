"use client";

import React from "react";
import GeneralDetailsSection from "../sections/GeneralDetailsSection";
import TogglesSection from "../sections/TogglesSection";
import MediaSection from "../sections/MediaSection";
import DescriptionSection from "../sections/DescriptionSection";
import PCard from "@/components/custom/PCard";

export default function GeneralDetailsStep({ form, categories }) {
  return (
    <div className="space-y-6">
      {/* 1. General Info & Metadata (Full Width) */}
      <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
          General Info & Metadata
        </h2>
        <GeneralDetailsSection form={form} categories={categories} />
      </PCard>

      {/* 2. Grid (2 Column): Publishing Visibility (Left) and Media Section (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
            Publishing Visibility
          </h2>
          <TogglesSection form={form} />
        </PCard>

        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
            Media Attachments
          </h2>
          <MediaSection form={form} />
        </PCard>
      </div>

      {/* 3. Specs & Description (Full Width at Bottom) */}
      <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
          Product Specifications & Description Details
        </h2>
        <DescriptionSection form={form} />
      </PCard>
    </div>
  );
}
