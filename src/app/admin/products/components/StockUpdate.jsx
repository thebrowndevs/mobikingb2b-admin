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
  "stock-in": { label: "Stock In", color: "bg-emerald-50 text-emerald-700 border-emerald-100", sign: "+" },
  "add-item": { label: "Order Edit: Add Item", color: "bg-pink-50 text-pink-700 border-pink-100", sign: "-" },
  "remove-item": { label: "Order Edit: Remove", color: "bg-cyan-50 text-cyan-700 border-cyan-100", sign: "+" },
  purchase: { label: "Purchase", color: "bg-red-50 text-red-700 border-red-100", sign: "-" },
  // "purchase-restore": { label: "Purchase Restore", color: "bg-lime-50 text-lime-700 border-lime-100", sign: "+" },
  cancel: { label: "Order Cancel", color: "bg-blue-50 text-blue-700 border-blue-100", sign: "+" },
  reject: { label: "Order Reject", color: "bg-violet-50 text-violet-700 border-violet-100", sign: "+" },
  return: { label: "Return", color: "bg-amber-50 text-amber-700 border-amber-100", sign: "+" },
  reserved: { label: "Reserved", color: "bg-indigo-50 text-indigo-700 border-indigo-100", sign: "-" },
  hold: { label: "Hold", color: "bg-amber-50 text-amber-700 border-amber-100", sign: "-" },
  cancelled: { label: "Cancelled", color: "bg-slate-50 text-slate-600 border-slate-150", sign: "+" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-600 border-red-100", sign: "+" },
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
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [refTypeFilter, setRefTypeFilter] = React.useState("all");
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const stockRes = getStockHistoryByProductQuery(resolvedId, {
    page,
    limit: 30,
    type: typeFilter,
    variantName: variantFilter,
    category: categoryFilter,
    refType: refTypeFilter,
  });

  /* ── reset on open ── */
  React.useEffect(() => {
    if (open) {
      setTypeFilter("all");
      setVariantFilter("all");
      setCategoryFilter("all");
      setRefTypeFilter("all");
      setPage(1);
      setHistory([]);
      form.reset();
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
  const handleCategoryChange = (e) => { setCategoryFilter(e.target.value); setPage(1); setHistory([]); };
  const handleRefTypeChange = (e) => { setRefTypeFilter(e.target.value); setPage(1); setHistory([]); };

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
      <SheetContent className="w-full md:min-w-[1100px] flex flex-col h-full overflow-hidden bg-back1 border-l border-bdr2 p-0 gap-0">

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
          <div className="grid grid-cols-3 gap-3 mt-4">
            {(() => {
              const phys = inventory?.physicalStock ?? totalStock;
              const res = inventory?.reservedStock ?? 0;
              const avail = inventory ? Math.max(0, phys - res) : availableStock;
              return (
                <>
                  <div className="bg-emerald-50/20 border border-emerald-150 rounded-xl p-3 text-center shadow-[inset_0_1px_2px_rgba(16,185,129,0.02)]">
                    <div className={`text-base md:text-lg font-black ${phys > 0 ? "text-emerald-700" : "text-red-500"}`}>{phys}</div>
                    <div className="text-[9px] font-bold text-emerald-600 mt-0.5 flex items-center justify-center gap-1 uppercase tracking-wider">
                      <Warehouse size={10} /> Physical Stock
                    </div>
                  </div>
                  <div className="bg-indigo-50/20 border border-indigo-150 rounded-xl p-3 text-center shadow-[inset_0_1px_2px_rgba(99,102,241,0.02)]">
                    <div className={`text-base md:text-lg font-black ${avail > 0 ? "text-indigo-700" : "text-red-500"}`}>{avail}</div>
                    <div className="text-[9px] font-bold text-indigo-650 mt-0.5 flex items-center justify-center gap-1 uppercase tracking-wider">
                      <TrendingUp size={10} /> Available
                    </div>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-150 rounded-xl p-3 text-center shadow-[inset_0_1px_2px_rgba(245,158,11,0.02)]">
                    <div className={`text-base md:text-lg font-black ${res > 0 ? "text-amber-700" : "text-slate-400"}`}>{res}</div>
                    <div className="text-[9px] font-bold text-amber-600 mt-0.5 flex items-center justify-center gap-1 uppercase tracking-wider">
                      <Lock size={10} /> Reserved
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
              <div className="flex flex-wrap gap-2.5">
                {populatedVariants.map((v, i) => (
                  <div
                    key={v._id || i}
                    className="bg-white border border-bdr2 rounded-xl p-2.5 flex flex-col gap-1 min-w-[130px] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                  >
                    <span className="font-bold text-slate-800 capitalize leading-none truncate max-w-[120px]">{v.name}</span>
                    <div className="flex gap-3 text-[10px] font-semibold text-slate-500 mt-1">
                      <div>
                        Phys: <span className="text-emerald-600 font-bold">{v.totalStock ?? 0}</span>
                      </div>
                      <div>
                        Avail: <span className="text-indigo-650 font-bold">{v.availableStock ?? 0}</span>
                      </div>
                    </div>
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

            <select
              className="bg-back1 border border-bdr2 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={categoryFilter}
              onChange={handleCategoryChange}
            >
              <option value="all">All Categories</option>
              <option value="physical">Physical Stock</option>
              <option value="virtual">Virtual Stock</option>
            </select>

            <select
              className="bg-back1 border border-bdr2 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={refTypeFilter}
              onChange={handleRefTypeChange}
            >
              <option value="all">All References</option>
              <option value="orders">Orders Only</option>
              <option value="quotations">Quotations Only</option>
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
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Category</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Variant</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 text-center w-16">Qty</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-32">Stock</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5 w-24">Price</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Vendor</TableHead>
                      <TableHead className="text-[10px] font-bold text-slate-600 uppercase tracking-wider py-2.5">Reference</TableHead>
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
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.color || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                                {meta.label || s.type}
                              </span>
                              {s.orderId ? (
                                <span className="text-[9px] font-medium text-indigo-500 leading-none mt-0.5">(via Order)</span>
                              ) : s.quotationId || s.category === "virtual" ? (
                                <span className="text-[9px] font-medium text-amber-600 leading-none mt-0.5">(via Quotation)</span>
                              ) : null}
                            </div>
                          </TableCell>

                          <TableCell className="py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${s.category === "physical"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                              : "bg-sky-50 text-sky-700 border-sky-100"
                              }`}>
                              {s.category === "physical" ? "Physical" : "Virtual"}
                            </span>
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-slate-700 py-2.5">
                            {s.variantName || "—"}
                          </TableCell>

                          <TableCell className={`text-center text-xs font-bold py-2.5 ${meta.sign === "-" ? "text-red-650" : "text-emerald-650"}`}>
                            {meta.sign}{s.quantity}
                          </TableCell>

                          <TableCell className="text-xs text-slate-500 font-medium py-2.5 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold mr-1">Avail:</span>
                                <span className="font-bold text-slate-700">{s.previousStock ?? 0} ➔ {s.updatedStock ?? 0}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold mr-1">Phys:</span>
                                <span className="font-bold text-slate-700">{s.previousPhysicalStock ?? "—"} ➔ {s.updatedPhysicalStock ?? "—"}</span>
                              </div>
                              {s.totalProductStock !== undefined && s.totalProductStock !== null && (
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Product:</span>
                                  <span className="font-bold text-indigo-600">{s.totalProductStock}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs font-semibold text-slate-700 py-2.5">
                            {s.purchasePrice ? `₹${s.purchasePrice}` : "—"}
                          </TableCell>

                          <TableCell className="text-xs text-slate-600 py-2.5">
                            {s.vendor || "—"}
                          </TableCell>

                          <TableCell className="text-xs py-2.5 font-mono">
                            <div className="flex flex-col gap-1">
                              {s.orderId && (
                                <div className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md px-1.5 py-0.5 text-[9px] font-bold w-fit">
                                  <span className="opacity-70">ORD:</span> {s.orderId}
                                </div>
                              )}
                              {s.quotationId && (
                                <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-md px-1.5 py-0.5 text-[9px] font-bold w-fit">
                                  <span className="opacity-70">QTN:</span> {s.quotationId}
                                </div>
                              )}
                              {!s.orderId && !s.quotationId && <span className="text-slate-400">—</span>}
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-slate-500 py-2.5 whitespace-nowrap">
                            {format(new Date(s.createdAt), "dd MMM yy, hh:mm a")}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {stockRes.isFetching && (
                      <TableRow>
                        <TableCell colSpan={10} className="p-3">
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