"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";

const formSchema = z.object({
  vendor: z.string().optional(),
  updates: z.array(
    z.object({
      variantId: z.string(),
      variantName: z.string(),
      selected: z.boolean().default(false),
      quantity: z.coerce.number().default(0),
      purchasePrice: z.coerce.number().default(0),
      currentStock: z.coerce.number().optional().default(0),
    })
  )
}).refine(
  (data) => data.updates.some(u => u.selected),
  {
    message: "At least one variant option must be checked to save updates.",
    path: ["updates"]
  }
);

function BulkStockUpdate({ open, onOpenChange, product, productId }) {
  const { bulkUpdateProductStock } = useProducts();
  const resolvedId = productId || product?._id;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: "",
      updates: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "updates",
  });

  // Reset form when opening/closing and load variants
  React.useEffect(() => {
    if (open) {
      const initialUpdates = (product?.variants || []).map(v => ({
        variantId: v._id || v.id,
        variantName: v.name,
        selected: false,
        quantity: 0,
        purchasePrice: 0,
        currentStock: v.totalStock || 0,
      }));
      form.reset({
        vendor: "",
        updates: initialUpdates,
      });
    }
  }, [open, product, form]);

  async function onSubmit(values) {
    // Validate quantities for selected variants
    const selectedUpdates = values.updates.filter(u => u.selected);
    const invalid = selectedUpdates.some(u => u.quantity < 1);
    if (invalid) {
      toast.error("Please enter a valid quantity of 1 or more for all selected variants.");
      return;
    }

    const payloadUpdates = selectedUpdates.map(u => ({
      variantId: u.variantId,
      variantName: u.variantName,
      quantity: u.quantity,
      purchasePrice: u.purchasePrice,
    }));

    const clientVersion = product?.inventory?.version ?? 0;
    try {
      await bulkUpdateProductStock.mutateAsync({
        productId: resolvedId,
        vendor: values.vendor,
        clientVersion,
        updates: payloadUpdates,
      });
      toast.success("Bulk stock updated successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update bulk stock");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-back2 border border-bdr2 rounded-xl p-6 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-slate-800 tracking-tight">
            Bulk Stock Update
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-450">
            Select variants of <strong className="text-slate-700">{product?.fullName || product?.name}</strong> to bulk-add stock.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2.5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Common Vendor Input */}
              <div className="p-4 bg-back1 border border-bdr2 rounded-xl">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Common Vendor / Supplier
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. ABC Wholesalers Ltd"
                          {...field}
                          className="w-full bg-white border-bdr2 text-slate-700 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-none text-xs h-9"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Variants Selector Table Grid */}
              <div className="space-y-2 border border-bdr2 rounded-xl overflow-hidden bg-back1">
                <Table className="overflow-visible text-xs">
                  <TableHeader className="bg-slate-50/75 border-b border-bdr2">
                    <TableRow>
                      <TableHead className="text-center font-bold text-slate-600 text-[10px] uppercase tracking-wider py-3 w-16">Select</TableHead>
                      <TableHead className="text-left font-bold text-slate-600 text-[10px] uppercase tracking-wider py-3">Variant Name</TableHead>
                      <TableHead className="text-center font-bold text-slate-600 text-[10px] uppercase tracking-wider py-3 w-28">Current Stock</TableHead>
                      <TableHead className="text-center font-bold text-slate-600 text-[10px] uppercase tracking-wider py-3 w-32">Qty to Add</TableHead>
                      <TableHead className="text-center font-bold text-slate-600 text-[10px] uppercase tracking-wider py-3 w-36">Pur. Price (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const isSelected = form.watch(`updates.${index}.selected`);
                      return (
                        <TableRow key={field.id} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/20">
                          <TableCell className="p-3 text-center align-middle">
                            <FormField
                              control={form.control}
                              name={`updates.${index}.selected`}
                              render={({ field: selectField }) => (
                                <input
                                  type="checkbox"
                                  checked={selectField.value}
                                  onChange={selectField.onChange}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-3 text-left align-middle font-bold text-slate-800">
                            {field.variantName}
                          </TableCell>
                          <TableCell className="p-3 text-center align-middle font-semibold text-slate-500">
                            {field.currentStock}
                          </TableCell>
                          <TableCell className="p-2.5 align-middle">
                            <FormField
                              control={form.control}
                              name={`updates.${index}.quantity`}
                              render={({ field: qtyField }) => (
                                <Input
                                  type="number"
                                  disabled={!isSelected}
                                  placeholder={isSelected ? "1" : "—"}
                                  value={qtyField.value || ""}
                                  onChange={(e) => qtyField.onChange(e.target.value)}
                                  className={`w-full bg-white border-bdr2 text-slate-855 text-xs h-8 text-center ${!isSelected ? "opacity-40 cursor-not-allowed bg-slate-50" : "focus:border-indigo-500"
                                    }`}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell className="p-2.5 align-middle">
                            <FormField
                              control={form.control}
                              name={`updates.${index}.purchasePrice`}
                              render={({ field: priceField }) => (
                                <Input
                                  type="number"
                                  disabled={!isSelected}
                                  placeholder={isSelected ? "0" : "—"}
                                  value={priceField.value || ""}
                                  onChange={(e) => priceField.onChange(e.target.value)}
                                  className={`w-full bg-white border-bdr2 text-slate-855 text-xs h-8 text-center ${!isSelected ? "opacity-40 cursor-not-allowed bg-slate-50" : "focus:border-indigo-500"
                                    }`}
                                />
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {fields.length === 0 && (
                      <TableRow>
                        <td colSpan={5} className="text-center py-6 text-slate-450 italic">
                          No variants available for this product.
                        </td>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-9 text-xs font-semibold bg-white border-bdr2 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={form.formState.isSubmitting}
                  className="h-9 text-xs font-semibold bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving Stock...
                    </>
                  ) : (
                    "Save Updates"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BulkStockUpdate;
