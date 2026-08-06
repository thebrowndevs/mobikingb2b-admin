"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, CircleAlert, Eye } from "lucide-react";
import Image from "next/image";
import DeleteConfirmationDialog from "@/app/admin/products/components/DeleteConfirmationDialog ";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function VariantList({
  variants = [],
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting,
}) {
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await onDelete(deleteId);
      toast.success("Variant deleted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete variant");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-bdr2 rounded-xl overflow-hidden bg-back2/30">
        <Table containerClassName="border-0 bg-transparent" className="overflow-visible text-xs">
          <TableHeader className="bg-slate-50/75 border-b border-bdr2">
            <TableRow>
              <th className="p-3 text-center w-16">#</th>
              <th className="p-3 w-24 text-center">Image</th>
              <th className="p-3 text-left">Variant Name</th>
              <th className="p-3 text-center w-36">Physical Stock</th>
              <th className="p-3 text-center w-32">Status</th>
              <th className="p-3 text-center w-32">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant, idx) => {
              const hasStock = (variant?.totalStock || 0) > 0;
              const hasPurchaseSets =
                variant?.purchaseSets && variant.purchaseSets.length > 0;
              const hasOrders = (variant?.orderCount || 0) > 0;

              const canDelete = !hasStock && !hasPurchaseSets && !hasOrders;

              return (
                <TableRow
                  key={variant._id}
                  className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/30 transition-colors"
                >
                  <td className="p-3 text-center align-middle font-medium text-slate-450">
                    {idx + 1}
                  </td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center justify-center">
                      <Image
                        src={variant?.images?.[0] || "/not-found-img.webp"}
                        alt={variant.name}
                        width={40}
                        height={40}
                        className="object-cover rounded-lg border border-bdr2 w-10 h-10"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-left align-middle font-bold text-slate-800">
                    {variant.name}
                  </td>
                  <td className="p-3 text-center align-middle font-medium text-slate-600">
                    {variant.totalStock || 0}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <div className="flex flex-col items-center gap-1.5 justify-center">
                      <Switch
                        checked={variant.active !== false}
                        onCheckedChange={(checked) =>
                          onStatusChange(variant._id, checked)
                        }
                      />
                      <div className="flex gap-1 justify-center">
                        <span
                          className={`text-[9px] px-1 border rounded font-bold tracking-wider uppercase scale-90 ${variant.webVisibility !== false
                              ? "bg-indigo-50/75 border-indigo-200/50 text-indigo-600"
                              : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                        >
                          Web
                        </span>
                        <span
                          className={`text-[9px] px-1 border rounded font-bold tracking-wider uppercase scale-90 ${variant.appVisibility !== false
                              ? "bg-purple-50/75 border-purple-200/50 text-purple-600"
                              : "bg-slate-100 border-slate-200 text-slate-400"
                            }`}
                        >
                          App
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      {/* Edit Variant */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(variant)}
                        className="h-8 w-8 text-slate-600 border-bdr2 rounded-lg"
                        title="Edit Variant"
                      >
                        <Pencil size={13} />
                      </Button>

                      {/* Delete Variant with rule check */}
                      {canDelete ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(variant._id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50/50 rounded-lg"
                          title="Delete Variant"
                        >
                          <Trash size={13} />
                        </Button>
                      ) : (
                        <div
                          className="h-8 w-8 flex items-center justify-center text-slate-350 cursor-not-allowed"
                          title="Cannot delete variants with active stock, purchase history, or order records."
                        >
                          <CircleAlert size={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  </td>
                </TableRow>
              );
            })}
            {variants.length === 0 && (
              <TableRow>
                <td
                  colSpan={6}
                  className="text-center p-8 text-slate-450 italic bg-back2/10"
                >
                  No variants defined for this product yet. Products must have at least one variant before stock adjustments.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Variant"
        description="Are you sure you want to delete this variant option? This action is irreversible."
      />
    </div>
  );
}
