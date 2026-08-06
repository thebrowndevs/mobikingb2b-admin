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
import { Loader2, Package2, Layers3, Warehouse, TrendingUp, Lock } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import TableSkeleton from "@/components/custom/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BulkStockUpdate from "./BulkStockUpdate";

/* ─────────────── STOCK TYPE META ─────────────── */
const STOCK_TYPE_META = {
  "stock-in": { label: "Stock In", color: "bg-emerald-50 text-emerald-700 border-emerald-200", sign: "+" },
  "add-item": { label: "Order Edit: Add Item", color: "bg-pink-50 text-pink-700 border-pink-200", sign: "-" },
  "remove-item": { label: "Order Edit: Remove", color: "bg-cyan-50 text-cyan-700 border-cyan-200", sign: "+" },
  purchase: { label: "Purchase", color: "bg-red-50 text-red-700 border-red-200", sign: "-" },
  "purchase-restore": { label: "Purchase Restore", color: "bg-lime-50 text-lime-700 border-lime-200", sign: "+" },
  cancel: { label: "Order Cancel", color: "bg-blue-50 text-blue-700 border-blue-200", sign: "+" },
  reject: { label: "Order Reject", color: "bg-violet-50 text-violet-700 border-violet-200", sign: "+" },
  return: { label: "Return", color: "bg-amber-50 text-amber-700 border-amber-200", sign: "+" },
};

/* ─────────────── FORM SCHEMA ─────────────── */
const formSchema = z.object({
  variantName: z.string({ required_error: "Variant is required" }),
  vendor: z.string().optional(),
  quantity: z.coerce.number({ required_error: "Quantity is required" }),
  purchasePrice: z.coerce.number().optional(),
});

/**
 * StockUpdate drawer
 * Props: open, onOpenChange, productId, product (optional raw row fallback)
 */
function StockUpdate({ open, onOpenChange, productId, product }) {
  const {
    addProductStock,
    getStockHistoryByProductQuery,
    getProductInventoryDetailsQuery,
  } = useProducts();

  const resolvedId = productId || product?._id;

  /* ── inventory details (populated variants) ── */
  const { data: invProduct, isLoading: isInvLoading } =
    getProductInventoryDetailsQuery(resolvedId);

  const populatedVariants = invProduct?.variants || [];
  const displayName = invProduct?.fullName || invProduct?.name || product?.fullName || "—";
  // Inventory metrics sourced from the query (which now populates inventory)
  const inventory = invProduct?.inventory || product?.inventory;
  const totalStock = invProduct?.totalStock ?? product?.totalStock ?? 0;
  const availableStock = invProduct?.availableStock ?? product?.availableStock ?? 0;

  /* ── form ── */
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { variantName: "", vendor: "", quantity: 0, purchasePrice: 0 },
  });

  /* ── history state ── */
  const [page, setPage] = React.useState(1);
  const [history, setHistory] = React.useState([]);
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [variantFilter, setVariantFilter] = React.useState("all");
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const stockRes = getStockHistoryByProductQuery(resolvedId, {
    page, limit: 30, type: typeFilter, variantName: variantFilter,
  });

  /* ── reset on open ── */
  React.useEffect(() => {
    if (open) {
      setTypeFilter("all"); setVariantFilter("all");
      setPage(1); setHistory([]); form.reset();
    }
  }, [open]);

  /* ── accumulate history pages ── */
  React.useEffect(() => {
    const fetched = stockRes?.data?.history;
    if (fetched) {
      setHistory((prev) => {
        if (page === 1) return fetched;
        const ids = new Set(prev.map((i) => i._id));
        return [...prev, ...fetched.filter((i) => !ids.has(i._id))];
      });
    }
  }, [stockRes?.data?.history, page]);

  /* ── infinite scroll ── */
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      if (stockRes?.data?.pagination?.hasNextPage && !stockRes.isFetching)
        setPage((p) => p + 1);
    }
  };

  const handleTypeChange = (e) => { setTypeFilter(e.target.value); setPage(1); setHistory([]); };
  const handleVariantChange = (e) => { setVariantFilter(e.target.value); setPage(1); setHistory([]); };

  async function onSubmit(values) {
    // Resolve variantName → variantId from the populated variants array
    const matched = populatedVariants.find((v) => v.name === values.variantName);
    if (!matched?._id) {
      form.setError("variantName", { message: "Variant not found — please refresh and try again." });
      return;
    }
    // clientVersion comes from the inventory record for optimistic locking (default 0 if no record yet)
    const clientVersion = inventory?.version ?? 0;

    await addProductStock.mutateAsync({
      variantId: matched._id,
      vendor: values.vendor || "",
      quantity: values.quantity,
      purchasePrice: values.purchasePrice ?? 0,
      clientVersion,
    });
    form.reset();
    onOpenChange(false);
  }

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:min-w-[720px] flex flex-col h-full overflow-hidden bg-back1 border-l border-bdr2 p-0 gap-0">

        {/* ── Header ── */}
        <SheetHeader className="px-6 py-4 border-b border-bdr2 bg-back2 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-sm font-bold text-slate-800 tracking-tight">
                Add / Update Stock
              </SheetTitle>
              <SheetDescription className="text-[11px] text-slate-450 font-medium mt-0.5">
                {isInvLoading
                  ? <Skeleton className="h-3.5 w-40 bg-slate-200 rounded" />
                  : displayName
                }
              </SheetDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(true)}
              className="h-8 text-xs font-semibold bg-white border-bdr2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 gap-1.5 mr-6 transition-colors"
            >
              <Layers3 size={12} /> Bulk Update
            </Button>
          </div>

          {/* Inventory metrics strip */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(() => {
              const phys = inventory?.physicalStock ?? totalStock;
              const res = inventory?.reservedStock ?? 0;
              const avail = inventory ? Math.max(0, phys - res) : availableStock;
              return (
                <>
                  <div className="bg-back1 border border-bdr2 rounded-xl p-2.5 text-center">
                    <div className={`text-base font-bold ${phys > 0 ? "text-slate-800" : "text-red-500"}`}>{phys}</div>
                    <div className="text-[9px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-0.5">
                      <Warehouse size={8} /> Physical
                    </div>
                  </div>
                  <div className="bg-back1 border border-bdr2 rounded-xl p-2.5 text-center">
                    <div className={`text-base font-bold ${avail > 0 ? "text-emerald-600" : "text-red-500"}`}>{avail}</div>
                    <div className="text-[9px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-0.5">
                      <TrendingUp size={8} /> Available
                    </div>
                  </div>
                  <div className="bg-back1 border border-bdr2 rounded-xl p-2.5 text-center">
                    <div className={`text-base font-bold ${res > 0 ? "text-amber-600" : "text-slate-400"}`}>{res}</div>
                    <div className="text-[9px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-0.5">
                      <Lock size={8} /> Reserved
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </SheetHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Add Stock Form ── */}
          <div className="px-6 py-5 border-b border-bdr2 bg-back2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package2 size={11} /> Stock Entry
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {/* Variant Select */}
                  <FormField
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Variant</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-back1 border-bdr2 text-slate-700 shadow-none text-xs h-9 focus:ring-indigo-500/20 focus:border-indigo-400">
                              <SelectValue placeholder={isInvLoading ? "Loading…" : "Select Variant"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                            {isInvLoading ? (
                              <SelectItem value="__loading" disabled>Loading variants…</SelectItem>
                            ) : populatedVariants.length === 0 ? (
                              <SelectItem value="__none" disabled>No variants found</SelectItem>
                            ) : (
                              populatedVariants.map((v) => (
                                <SelectItem key={v._id || v.name} value={v.name}>
                                  {v.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Vendor */}
                  <FormField
                    control={form.control}
                    name="vendor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Vendor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ABC Supplier"
                            {...field}
                            className="bg-back1 border-bdr2 text-slate-700 text-xs h-9 shadow-none focus:ring-indigo-500/20 focus:border-indigo-400"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-back1 border-bdr2 text-slate-700 text-xs h-9 shadow-none focus:ring-indigo-500/20 focus:border-indigo-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Purchase Price */}
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Purchase Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-back1 border-bdr2 text-slate-700 text-xs h-9 shadow-none focus:ring-indigo-500/20 focus:border-indigo-400"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full h-9 text-xs font-semibold bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text"
                  disabled={form.formState.isSubmitting || isInvLoading}
                >
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Adding Stock…</>
                  ) : (
                    "Add Stock"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* ── Variant Stock Summary ── */}
          <div className="px-6 py-4 border-b border-bdr2 bg-back1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Current Variant Stock
            </p>
            {isInvLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-28 bg-slate-200 rounded-lg" />)}
              </div>
            ) : populatedVariants.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No variants defined.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {populatedVariants.map((v, i) => (
                  <div
                    key={v._id || i}
                    className="bg-back2 border border-bdr2 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{v.name}</span>
                    <span className="text-slate-350">·</span>
                    <span className={`font-bold ${(v.totalStock ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {v.totalStock ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Filters ── */}
          <div className="px-6 py-3 border-b border-bdr2 bg-back2 flex gap-2 flex-wrap">
            <select
              className="bg-back1 border border-bdr2 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={typeFilter}
              onChange={handleTypeChange}
            >
              <option value="all">All Types</option>
              {Object.entries(STOCK_TYPE_META).map(([key, m]) => (
                <option key={key} value={key}>{m.label}</option>
              ))}
            </select>

            <select
              className="bg-back1 border border-bdr2 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={variantFilter}
              onChange={handleVariantChange}
            >
              <option value="all">All Variants</option>
              {populatedVariants.map((v) => (
                <option key={v._id || v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* ── Stock History Table ── */}
          <div className="px-6 py-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Stock Transaction History
            </p>

            {history.length === 0 ? (
              stockRes.isLoading ? (
                <TableSkeleton showHeader={false} showPagination={false} rows={5} columns={9} />
              ) : (
                <div className="py-8 text-center border border-bdr2 rounded-xl bg-back2">
                  <p className="text-sm text-slate-400 italic">No stock history found.</p>
                </div>
              )
            ) : (
              <div
                className="border border-bdr2 rounded-xl overflow-hidden bg-back2 max-h-[420px] overflow-y-auto scrollbar-hide"
                onScroll={handleScroll}
              >
                <Table containerClassName="overflow-visible border-none bg-transparent">
                  <TableHeader className="bg-slate-50/75 sticky top-0 z-10 [&_th]:sticky [&_th]:top-0 [&_th]:bg-slate-50/90 [&_th]:z-10 [&_th]:backdrop-blur-sm">
                    <TableRow className="border-b border-bdr2">
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-8">#</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Type</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Variant</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 text-center w-16">Qty</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-28">Stock</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-24">Price</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Vendor</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Order</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-32">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((s, i) => {
                      const meta = STOCK_TYPE_META[s.type] || {};
                      return (
                        <TableRow key={s._id} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/30">
                          <TableCell className="text-slate-400 font-medium text-xs py-2.5">{i + 1}</TableCell>

                          <TableCell className="py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.color}`}>
                              {meta.label || s.type}
                            </span>
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-slate-700 py-2.5">
                            {s.variantName || "—"}
                          </TableCell>

                          <TableCell className={`text-center text-xs font-bold py-2.5 ${meta.sign === "-" ? "text-red-600" : "text-emerald-600"}`}>
                            {meta.sign}{s.quantity}
                          </TableCell>

                          <TableCell className="text-xs text-slate-500 font-medium py-2.5">
                            {s.previousStock ?? "—"} → {s.updatedStock ?? "—"}
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-slate-700 py-2.5">
                            {s.purchasePrice ? `₹${s.purchasePrice}` : "—"}
                          </TableCell>

                          <TableCell className="text-xs text-slate-600 py-2.5">
                            {s.vendor || "—"}
                          </TableCell>

                          <TableCell className="text-xs text-slate-500 py-2.5 font-mono">
                            {s.orderId || "—"}
                          </TableCell>

                          <TableCell className="text-xs text-slate-500 py-2.5 whitespace-nowrap">
                            {format(new Date(s.createdAt), "dd MMM yy, hh:mm a")}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {stockRes.isFetching && (
                      <TableRow>
                        <TableCell colSpan={9} className="p-3">
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-full bg-slate-200" />
                            <Skeleton className="h-4 w-4/5 bg-slate-200" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </SheetContent>

      {/* Bulk Stock Update Dialog */}
      {bulkOpen && (
        <BulkStockUpdate
          open={bulkOpen}
          onOpenChange={() => { setBulkOpen(false); onOpenChange(false); }}
          productId={resolvedId}
          product={invProduct || product}
        />
      )}
    </Sheet>
  );
}

export default StockUpdate;