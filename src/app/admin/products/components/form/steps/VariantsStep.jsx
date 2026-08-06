"use client";

import React, { useState } from "react";
import VariantList from "../sections/VariantList";
import VariantForm from "../sections/VariantForm";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import PCard from "@/components/custom/PCard";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

export default function VariantsStep({ productId, product, refetch }) {
  const [editingVariant, setEditingVariant] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const { createVariant, updateVariant, deleteVariant } = useProducts();
  const variants = product?.variants || [];

  const handleCreateClick = () => {
    setEditingVariant(null);
    setFormOpen(true);
  };

  const handleEditClick = (variant) => {
    setEditingVariant(variant);
    setFormOpen(true);
  };

  const handleFormCancel = () => {
    setEditingVariant(null);
    setFormOpen(false);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingVariant && editingVariant._id) {
        // Edit Mode
        await updateVariant.mutateAsync({
          variantId: editingVariant._id,
          data,
        });
        toast.success("Variant updated successfully");
      } else {
        // Create Mode
        await createVariant.mutateAsync({
          productId,
          ...data,
        });
        toast.success("Variant created successfully");
      }
      refetch();
      setEditingVariant(null);
      setFormOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      await deleteVariant.mutateAsync(variantId);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete variant");
    }
  };

  const handleStatusChange = async (variantId, checked) => {
    try {
      await updateVariant.mutateAsync({
        variantId,
        data: { active: checked },
      });
      toast.success("Variant status updated");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update variant status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider block mb-1">
            Product Options & Variants
          </h2>
          <p className="text-[11px] text-slate-400">
            Define attributes like color, size, specification options for B2B catalog items.
          </p>
        </div>

        {!formOpen && (
          <Button
            type="button"
            onClick={handleCreateClick}
            className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold h-9 text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add Variant
          </Button>
        )}
      </div>

      {formOpen && (
        <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5">
          <VariantForm
            variant={editingVariant}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={createVariant.isPending || updateVariant.isPending}
          />
        </PCard>
      )}

      <PCard className="bg-back2 border-bdr2 shadow-none rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-bdr2">
          Current Active Variants ({variants.length})
        </h3>
        <VariantList
          variants={variants}
          onEdit={handleEditClick}
          onDelete={handleDeleteVariant}
          onStatusChange={handleStatusChange}
          isDeleting={deleteVariant.isPending}
        />
      </PCard>
    </div>
  );
}
