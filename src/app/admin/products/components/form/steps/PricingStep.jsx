"use client";

import React from "react";
import CorePricingSection from "../sections/CorePricingSection";
import PricingSlabsSection from "../sections/PricingSlabsSection";
import PCard from "@/components/custom/PCard";

export default function PricingStep({ form }) {
  return (
    <div className="space-y-6">
      <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
          Pricing Metrics
        </h2>
        <CorePricingSection form={form} />
      </PCard>

      <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
        <PricingSlabsSection form={form} />
      </PCard>
    </div>
  );
}
