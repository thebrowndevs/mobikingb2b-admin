"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import BulkStockUpdate from "./BulkStockUpdate";

/* ------------------ META CONFIG ------------------ */
const STOCK_TYPE_META = {
  "stock-in": {
    label: "Stock In",
    color: "bg-green-100 text-green-700",
    sign: "+",
  },
  "add-item": {
    label: "Order Edit: Add Item",
    color: "bg-pink-100 text-pink-700",
    sign: "-",
  },
  "remove-item": {
    label: "Order Edit: Remove Item",
    color: "bg-cyan-100 text-cyan-700",
    sign: "+",
  },
  purchase: {
    label: "Purchase",
    color: "bg-red-100 text-red-700",
    sign: "-",
  },
  "purchase-restore": {
    label: "Purchase Restore",
    color: "bg-lime-100 text-lime-700",
    sign: "+",
  },
  cancel: {
    label: "Order Cancel",
    color: "bg-blue-100 text-blue-700",
    sign: "+",
  },
  reject: {
    label: "Order Reject",
    color: "bg-purple-100 text-purple-700",
    sign: "+",
  },
  return: {
    label: "Return",
    color: "bg-yellow-100 text-yellow-800",
    sign: "+",
  },
};

/* ------------------ FORM ------------------ */
const formSchema = z.object({
  variantName: z.string({ required_error: "Variant Name is required" }),
  vendor: z.string().optional(),
  quantity: z.coerce.number({
    required_error: "Quantity is required",
  }),
  purchasePrice: z.coerce.number().optional(),
  isScratchy: z.boolean().optional().default(false),
});

function StockUpdate({ open, onOpenChange, product }) {
  const { addProductStock, markProductChecked, getStockHistoryByProductQuery } = useProducts();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variantName: "",
      vendor: "",
      quantity: 0,
      purchasePrice: 0,
      isScratchy: false,
    },
  });

  const SProduct = product || {};

  /* ------------------ STATE ------------------ */
  const [page, setPage] = React.useState(1);
  const [history, setHistory] = React.useState([]);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [variantFilter, setVariantFilter] = React.useState("all");
  const [scratchyFilter, setScratchyFilter] = React.useState("all");
  const [bulkOpen, setBulkOpen] = React.useState(false);

  // Call the updated query hook with parameters (Limit 30 per batch)
  const stockRes = getStockHistoryByProductQuery(product?._id, {
    page,
    limit: 30,
    type: typeFilter,
    variantName: variantFilter,
    isScratchy: scratchyFilter
  });

  // When drawer opens, reset everything
  React.useEffect(() => {
    if (open) {
      setTypeFilter("all");
      setVariantFilter("all");
      setScratchyFilter("all");
      setPage(1);
      setHistory([]);
    }
  }, [open]);

  // When type filter changes, reset page to 1 and clear history
  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1);
    setHistory([]);
  };

  // When variant filter changes, reset page to 1 and clear history
  const handleVariantChange = (e) => {
    setVariantFilter(e.target.value);
    setPage(1);
    setHistory([]);
  };

  // Accumulate history data in state
  React.useEffect(() => {
    const fetchedHistory = stockRes?.data?.history;
    if (fetchedHistory) {
      setHistory((prev) => {
        if (page === 1) {
          return fetchedHistory;
        }
        // Avoid duplicate items
        const existingIds = new Set(prev.map(item => item._id));
        const filteredNew = fetchedHistory.filter(item => !existingIds.has(item._id));
        return [...prev, ...filteredNew];
      });
    }
  }, [stockRes?.data?.history, page]);

  // Scroll handler for infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if user scrolled near the bottom (within 10px)
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      const hasNextPage = stockRes?.data?.pagination?.hasNextPage;
      if (hasNextPage && !stockRes.isFetching) {
        setPage(prev => prev + 1);
      }
    }
  };

  const variants = React.useMemo(() => {
    const regularKeys = SProduct?.variants ? Object.keys(SProduct.variants) : [];
    const scratchyKeys = SProduct?.scratchyVariants ? Object.keys(SProduct.scratchyVariants) : [];

    if (scratchyFilter === "true") {
      return scratchyKeys;
    } else if (scratchyFilter === "false") {
      return regularKeys;
    } else {
      return Array.from(new Set([...regularKeys, ...scratchyKeys]));
    }
  }, [SProduct, scratchyFilter]);

  async function checkProduct() {
    await markProductChecked.mutateAsync({
      id: product._id,
    });
    form.reset();
    onOpenChange(false);
  }

  async function onSubmit(values) {
    await addProductStock.mutateAsync({
      ...values,
      productId: product._id,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:min-w-3xl overflow-y-auto pb-6">
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center justify-between w-full pr-6">
              <div className="flex items-center">
                <button
                  onClick={checkProduct}
                  className={`
                    outline-none se text-xs flex justify-center items-center p-1 rounded-full mr-2
                    ${product?.isChecked ? "cursor-not-allowed bg-green-100 text-green-500" : "bg-gray-100 text-gray-500"}`}
                  disabled={markProductChecked.isLoading || product?.isChecked}
                >
                  <Check size={14} />
                </button>
                Add Stock
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBulkOpen(true)}
              >
                Bulk Update Stock
              </Button>
            </div>
          </SheetTitle>
          <SheetDescription>
            {product?.fullName}
          </SheetDescription>
        </SheetHeader>

        {/* ------------------ ADD STOCK FORM ------------------ */}
        <div className="px-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="variantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Variant</FormLabel>
                      <FormControl>
                        <Input placeholder="Blue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Supplier" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isScratchy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium cursor-pointer">Is Scratchy Variant Stock?</FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Stock"
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex flex-col gap-3 px-4 mt-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Regular Variants</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {SProduct?.variants && Object.entries(SProduct.variants).length > 0 ? (
                Object.entries(SProduct.variants).map(([key, value], idx) => (
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
              {SProduct?.scratchyVariants && Object.entries(SProduct.scratchyVariants).length > 0 ? (
                Object.entries(SProduct.scratchyVariants).map(([key, value], idx) => (
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

        {/* ------------------ FILTERS ------------------ */}
        <div className="px-4 flex gap-3 flex-wrap">
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            <option value="all">All Types</option>
            {Object.keys(STOCK_TYPE_META).map((t) => (
              <option key={t} value={t}>
                {STOCK_TYPE_META[t].label}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={variantFilter}
            onChange={handleVariantChange}
          >
            <option value="all">All Variants</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={scratchyFilter}
            onChange={(e) => {
              setScratchyFilter(e.target.value);
              setVariantFilter("all");
              setPage(1);
              setHistory([]);
            }}
          >
            <option value="all">All Stocks (Regular & Scratchy)</option>
            <option value="false">Regular Stock Only</option>
            <option value="true">Scratchy Stock Only</option>
          </select>
        </div>

        {/* ------------------ STOCK HISTORY TABLE ------------------ */}
        <div className="px-4">
          {history.length === 0 ? (
            stockRes.isLoading ? (
              <div className="flex justify-center p-6 items-center">
                <TableSkeleton showHeader={false} showPagination={false} rows={4} columns={9} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No stock history found.</p>
            )
          ) : (
            <div
              className="border rounded-md max-h-[85vh] overflow-y-auto overflow-x-auto scrollbar-hide"
              onScroll={handleScroll}
            >
              <Table containerClassName="overflow-visible border-none bg-transparent relative">
                <TableHeader className="bg-gray-50 sticky top-0 z-10 [&_th]:sticky [&_th]:top-0 [&_th]:bg-gray-50 [&_th]:z-10">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((s, i) => {
                    const meta = STOCK_TYPE_META[s.type] || {};
                    return (
                      <TableRow key={s._id}>
                        <TableCell>{i + 1}</TableCell>

                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${meta.color}`}
                          >
                            {meta.label || s.type}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span>{s.variantName || "-"}</span>
                            {s.isScratchy && (
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">
                                Scratchy
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell
                          className={`font-semibold ${meta.sign === "-"
                            ? "text-red-600"
                            : "text-green-600"
                            }`}
                        >
                          {meta.sign}
                          {s.quantity}
                        </TableCell>

                        <TableCell className="text-sm text-gray-600">
                          {s.previousStock ?? "-"} → {s.updatedStock ?? "-"}
                        </TableCell>

                        <TableCell>
                          {s.purchasePrice ? `₹${s.purchasePrice}` : "-"}
                        </TableCell>

                        <TableCell>
                          {s.vendor ? `${s.vendor}` : "-"}
                        </TableCell>

                        <TableCell>{s.orderId || "-"}</TableCell>

                        <TableCell className="text-sm">
                          {format(
                            new Date(s.createdAt),
                            "dd MMM yyyy, hh:mm a"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {stockRes.isFetching && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0">
                        <div className="flex flex-col gap-2 p-4 bg-white border-t">
                          <Skeleton className="h-5 w-full bg-gray-200" />
                          <Skeleton className="h-5 w-5/6 bg-gray-200" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
      {
        bulkOpen &&
        <BulkStockUpdate
          open={bulkOpen}
          onOpenChange={() => {
            setBulkOpen(false)
            onOpenChange(false)
          }}
          product={product}
        />
      }
    </Sheet>
  );
}

export default StockUpdate;