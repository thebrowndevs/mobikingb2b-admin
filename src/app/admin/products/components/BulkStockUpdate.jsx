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
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";

const formSchema = z.object({
  vendor: z.string().optional(),
  isScratchy: z.boolean().optional().default(false),
  updates: z
    .array(
      z.object({
        variantName: z.string().min(1, "Variant Name is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        purchasePrice: z.coerce.number().optional().default(0),
      })
    )
    .min(1, "At least one variant update is required"),
});

function BulkStockUpdate({ open, onOpenChange, product }) {
  const { bulkUpdateProductStock } = useProducts();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendor: "",
      isScratchy: false,
      updates: [{ variantName: "", quantity: 1, purchasePrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "updates",
  });

  // Reset form when opening/closing
  React.useEffect(() => {
    if (open) {
      form.reset({
        vendor: "",
        isScratchy: false,
        updates: [{ variantName: "", quantity: 1, purchasePrice: 0 }],
      });
    }
  }, [open, form]);

  async function onSubmit(values) {
    await bulkUpdateProductStock.mutateAsync({
      productId: product?._id,
      vendor: values.vendor,
      isScratchy: values.isScratchy,
      updates: values.updates,
    });
    onOpenChange();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Stock Update</DialogTitle>
          <DialogDescription>
            Bulk add stock for {product?.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-3">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regular Variants</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {product?.variants && Object.entries(product.variants).length > 0 ? (
                Object.entries(product.variants).map(([key, value], idx) => (
                  <div key={idx} className="bg-gray-100 rounded p-2 text-sm flex gap-1">
                    <strong>{key}:</strong>
                    <p>{value}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No regular variants</p>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Scratchy Variants</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {product?.scratchyVariants && Object.entries(product.scratchyVariants).length > 0 ? (
                Object.entries(product.scratchyVariants).map(([key, value], idx) => (
                  <div key={idx} className="bg-green-50 border border-green-200 rounded p-2 text-sm flex gap-1 text-green-700">
                    <strong>{key}:</strong>
                    <p>{value}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No scratchy variants</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Common Vendor & Scratchy Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Common Vendor</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Supplier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isScratchy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2 mt-5">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Is Scratchy Variant Stock?
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Variants Dynamic List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Variant Quantities
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      append({ variantName: "", quantity: 1, purchasePrice: 0 })
                    }
                  >
                    <Plus className="h-4 w-4" /> Add Row
                  </Button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-3 items-end border p-3 rounded bg-gray-50/50"
                    >
                      <div className="col-span-5 sm:col-span-5">
                        <FormField
                          control={form.control}
                          name={`updates.${index}.variantName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Variant Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Red" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-3">
                        <FormField
                          control={form.control}
                          name={`updates.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-3">
                        <FormField
                          control={form.control}
                          name={`updates.${index}.purchasePrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                Purchase Price
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min={0} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pb-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Submit Bulk Stock Update"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BulkStockUpdate;
