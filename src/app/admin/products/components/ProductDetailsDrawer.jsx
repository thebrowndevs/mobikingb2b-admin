"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import {
  Loader2,
  LayoutDashboard,
  Images,
  BadgeDollarSign,
  FileText,
  Package,
  Pencil,
  RefreshCw,
  Globe,
  Smartphone,
  Tag,
  Barcode,
  Layers,
  CheckCircle2,
  XCircle,
  Warehouse,
  Lock,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

/* ─────────────────────── SIDEBAR NAV CONFIG ─────────────────────── */
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "pricing", label: "Pricing & Slabs", icon: BadgeDollarSign },
  { id: "description", label: "Description", icon: FileText },
  { id: "variants", label: "Variants & Stock", icon: Package },
];

/* ─────────────────────── HELPER COMPONENTS ─────────────────────── */
function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-bdr2 last:border-b-0">
      <span className="text-[11px] font-semibold text-slate-450 shrink-0">{label}</span>
      <span className={`text-[11px] font-bold text-slate-800 text-right break-all ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function VisibilityBadge({ visible, label }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-bdr2 last:border-b-0">
      <span className="text-[11px] font-semibold text-slate-450">{label}</span>
      <span className={`flex items-center gap-1 text-[11px] font-bold ${visible ? "text-green-600" : "text-slate-400"}`}>
        {visible ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
        {visible ? "Visible" : "Hidden"}
      </span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-back2 border border-bdr2 rounded-xl overflow-hidden shadow-none">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-bdr2 bg-slate-50/60">
        {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
        <h3 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ── Inventory metrics strip (reused in Overview and passed to StockUpdate header) ── */
function InventoryMetrics({ inventory, product }) {
  if (!inventory && !product) return null;
  const physical = inventory?.physicalStock ?? product?.totalStock ?? 0;
  const reserved = inventory?.reservedStock ?? 0;
  const available = inventory ? Math.max(0, physical - reserved) : (product?.availableStock ?? 0);
  const version = inventory?.version;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-back1 border border-bdr2 rounded-xl p-3 text-center">
        <div className={`text-lg font-bold ${physical > 0 ? "text-slate-800" : "text-red-500"}`}>{physical}</div>
        <div className="text-[10px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-1">
          <Warehouse size={9} /> Physical Stock
        </div>
      </div>
      <div className="bg-back1 border border-bdr2 rounded-xl p-3 text-center">
        <div className={`text-lg font-bold ${available > 0 ? "text-emerald-600" : "text-red-500"}`}>{available}</div>
        <div className="text-[10px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-1">
          <TrendingUp size={9} /> Available
        </div>
      </div>
      <div className="bg-back1 border border-bdr2 rounded-xl p-3 text-center">
        <div className={`text-lg font-bold ${reserved > 0 ? "text-amber-600" : "text-slate-400"}`}>{reserved}</div>
        <div className="text-[10px] font-semibold text-slate-450 mt-0.5 flex items-center justify-center gap-1">
          <Lock size={9} /> Reserved
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── TAB PANELS ─────────────────────── */
function OverviewPanel({ product }) {
  const discount = product.regularPrice && product.minPrice
    ? Math.round(((product.regularPrice - product.minPrice) / product.regularPrice) * 100)
    : null;

  return (
    <div className="space-y-4">
      {/* Inventory Metrics */}
      <InventoryMetrics inventory={product.inventory} product={product} />

      {/* Identity — Name · Slug · Category · Brand order */}
      <SectionCard title="Catalog Identity" icon={Barcode}>
        <InfoRow label="Full Name" value={product.fullName} />
        <InfoRow label="Short Name" value={product.name} />
        <InfoRow label="Slug" value={product.slug} mono />
        <InfoRow label="Category" value={product.category?.name || "Uncategorized"} />
        <InfoRow label="Brand" value={product.brand?.name || "—"} />
        <InfoRow label="SKU" value={product.sku} mono />
        <InfoRow label="HSN Code" value={product.hsn} mono />
        <InfoRow label="MOQ" value={product.moq ? `${product.moq} units` : "—"} />
        <InfoRow label="GST Rate" value={`${product.gst ?? 18}%`} />
      </SectionCard>

      {/* Status */}
      <SectionCard title="Status & Channels" icon={Globe}>
        <InfoRow
          label="Active Status"
          value={
            <span className={`flex items-center gap-1 font-bold text-[11px] ${product.active ? "text-green-600" : "text-slate-400"}`}>
              {product.active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {product.active ? "Active" : "Inactive"}
            </span>
          }
        />
        <VisibilityBadge visible={product.webVisibility !== false} label="Web Storefront" />
        <VisibilityBadge visible={product.appVisibility !== false} label="Mobile App" />
        <InfoRow label="Order Count" value={product.orderCount ?? 0} />
        <InfoRow label="Created" value={product.createdAt ? format(new Date(product.createdAt), "dd MMM yyyy") : "—"} />
        <InfoRow label="Last Updated" value={product.updatedAt ? format(new Date(product.updatedAt), "dd MMM yyyy, hh:mm a") : "—"} />
      </SectionCard>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <SectionCard title="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function GalleryPanel({ product }) {
  // Build image sources: catalog images + variant images with labels
  const catalogImages = (product.images || []).map((src) => ({ src, label: "Catalog" }));
  const variantImageSets = (product.variants || []).flatMap((v) =>
    (v.images || []).map((src) => ({ src, label: v.name }))
  );
  const allImages = [...catalogImages, ...variantImageSets];

  // Filter options
  const filterOptions = [
    "All",
    ...(catalogImages.length > 0 ? ["Catalog"] : []),
    ...(product.variants || []).map((v) => v.name),
  ];

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeIdx, setActiveIdx] = useState(0);

  const filtered = activeFilter === "All" ? allImages : allImages.filter((img) => img.label === activeFilter);

  // Reset index when filter changes
  const handleFilter = (f) => { setActiveFilter(f); setActiveIdx(0); };

  if (allImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Images className="h-10 w-10 opacity-30" />
        <p className="text-sm">No images uploaded.</p>
      </div>
    );
  }

  const current = filtered[activeIdx] || allImages[0];

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all
              ${activeFilter === f
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-back2 text-slate-600 border-bdr2 hover:border-indigo-300 hover:text-indigo-600"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Preview */}
      <div className="relative w-full aspect-square max-h-[340px] bg-white border border-bdr2 rounded-xl overflow-hidden">
        <Image
          src={current.src || "/not-found-img.webp"}
          alt={current.label}
          fill
          className="object-contain p-4"
          sizes="(max-width: 900px) 100vw, 700px"
        />
        <div className="absolute top-3 left-3 bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {current.label}
        </div>
        <div className="absolute top-3 right-3 bg-black/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {activeIdx + 1} / {filtered.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-2">
        {filtered.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all
              ${activeIdx === i ? "border-indigo-500 shadow-md" : "border-bdr2 hover:border-slate-300"}`}
          >
            <Image src={img.src || "/not-found-img.webp"} alt={img.label} fill className="object-contain p-1 bg-white" sizes="80px" />
            {img.label !== "Catalog" && (
              <div className="absolute bottom-0 inset-x-0 bg-black/30 backdrop-blur-sm text-white text-[8px] font-bold text-center truncate px-1 py-0.5">
                {img.label}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingPanel({ product }) {
  const slabs = product.sellingPrice?.slabs || [];

  // Calculate discount
  const discount = product.regularPrice && product.minPrice && product.regularPrice > product.minPrice
    ? Math.round(((product.regularPrice - product.minPrice) / product.regularPrice) * 100)
    : null;

  // Build ranged slabs: sorted ascending by quantity
  const sorted = [...slabs].sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="space-y-4">
      {/* Price Summary */}
      <SectionCard title="Price Summary" icon={BadgeDollarSign}>
        <InfoRow label="Wholesale Min Price" value={`₹${Number(product.minPrice || 0).toFixed(2)}`} />
        <InfoRow label="MRP / Regular Price" value={product.regularPrice != null ? `₹${Number(product.regularPrice).toFixed(2)}` : "—"} />
        {discount !== null && (
          <div className="flex items-center justify-between gap-3 py-2 border-b border-bdr2 last:border-b-0">
            <span className="text-[11px] font-semibold text-slate-450">Discount</span>
            <span className="text-[11px] font-bold text-emerald-600">{discount}% off MRP</span>
          </div>
        )}
        <InfoRow label="Base Price (excl. GST)" value={product.basePrice != null ? `₹${Number(product.basePrice).toFixed(2)}` : "—"} />
        <InfoRow label="GST Rate" value={`${product.gst ?? 18}%`} />
        <InfoRow label="Pricing Type" value={product.sellingPrice?.type || "variable"} />
      </SectionCard>

      {/* Slabs Table as ranges */}
      <SectionCard title="Wholesale Pricing Slabs" icon={Layers}>
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No pricing slabs configured.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-bdr2">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-bdr2">
                  <th className="px-4 py-2.5 text-slate-500 font-bold text-[10px] uppercase tracking-wider w-10">#</th>
                  <th className="px-4 py-2.5 text-slate-500 font-bold text-[10px] uppercase tracking-wider">Qty Range</th>
                  <th className="px-4 py-2.5 text-slate-500 font-bold text-[10px] uppercase tracking-wider text-right">Price / unit</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((slab, i) => {
                  const from = i === 0 ? 0 : sorted[i - 1].quantity;
                  const to = sorted[i].quantity;
                  const isLast = i === sorted.length - 1;
                  const label = isLast
                    ? `${to}+ units`
                    : `${from} – ${to - 1} units`;

                  return (
                    <tr key={i} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/30">
                      <td className="px-4 py-2.5 text-slate-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-800">{label}</td>
                      <td className="px-4 py-2.5 font-bold text-indigo-700 text-right">₹{Number(slab.price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function DescriptionPanel({ product }) {
  return (
    <div className="space-y-4">
      {/* Bullet Highlights */}
      {product.descriptionPoints && product.descriptionPoints.length > 0 && (
        <SectionCard title="Key Highlights" icon={Layers}>
          <ul className="space-y-2">
            {product.descriptionPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-[9px] font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{pt}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Tech Spec table */}
      {product.keyInformation && Object.keys(product.keyInformation).length > 0 && (
        <SectionCard title="Tech Specifications" icon={Barcode}>
          <div className="overflow-hidden rounded-lg border border-bdr2">
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(product.keyInformation).map(([key, val], i) => (
                  <tr key={i} className={`border-b border-bdr2 last:border-b-0 ${i % 2 === 0 ? "bg-slate-50/40" : ""}`}>
                    <td className="px-3 py-2.5 font-semibold text-slate-500 w-2/5 leading-snug">{key}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-800 leading-snug">{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* HTML Rich Description */}
      <SectionCard title="Full Product Description" icon={FileText}>
        {product.description ? (
          <div
            className="
              text-xs text-slate-700 leading-relaxed
              [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:text-slate-800
              [&_h2]:text-sm  [&_h2]:font-bold [&_h2]:mb-1.5 [&_h2]:text-slate-800
              [&_h3]:text-xs  [&_h3]:font-bold [&_h3]:mb-1  [&_h3]:text-slate-700
              [&_p]:mb-2
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_ol]:space-y-1
              [&_li]:text-slate-700
              [&_strong]:font-bold [&_strong]:text-slate-800
              [&_a]:text-indigo-600 [&_a]:underline
              [&_table]:w-full [&_table]:border [&_table]:border-bdr2 [&_table]:rounded-lg [&_table]:mb-2
              [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold [&_th]:text-[10px] [&_th]:uppercase [&_th]:bg-slate-50 [&_th]:border-b [&_th]:border-bdr2
              [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-bdr2
            "
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center italic">No description provided.</p>
        )}
      </SectionCard>
    </div>
  );
}

function VariantsPanel({ product }) {
  const variants = product.variants || [];

  return (
    <div className="space-y-4">
      {/* Inventory metrics */}
      <InventoryMetrics inventory={product.inventory} product={product} />

      <SectionCard title={`Variants (${variants.length})`} icon={Package}>
        {variants.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No variants defined for this product.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-bdr2">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50/75 border-b border-bdr2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2.5 w-8 text-center">#</th>
                  <th className="p-2.5 w-14 text-center">Image</th>
                  <th className="p-2.5">Variant Name</th>
                  <th className="p-2.5 text-center w-20">Stock</th>
                  <th className="p-2.5 text-center w-20">Status</th>
                  <th className="p-2.5 text-center w-14">Web</th>
                  <th className="p-2.5 text-center w-14">App</th>
                  <th className="p-2.5 text-center w-20">Orders</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, idx) => (
                  <tr key={v._id} className="border-b border-bdr2 last:border-b-0 hover:bg-slate-50/30">
                    <td className="p-2.5 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-1.5 text-center">
                      <div className="relative w-8 h-8 rounded border border-bdr2 bg-slate-50 mx-auto overflow-hidden">
                        <Image src={v.images?.[0] || "/not-found-img.webp"} alt={v.name} fill className="object-cover" sizes="32px" />
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-slate-800">{v.name}</td>
                    <td className="p-2.5 text-center">
                      <span className={`font-bold ${(v.totalStock || 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {v.totalStock ?? 0}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${v.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {v.active ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {v.webVisibility !== false
                        ? <CheckCircle2 size={13} className="text-green-500 mx-auto" />
                        : <XCircle size={13} className="text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-2.5 text-center">
                      {v.appVisibility !== false
                        ? <CheckCircle2 size={13} className="text-green-500 mx-auto" />
                        : <XCircle size={13} className="text-slate-300 mx-auto" />}
                    </td>
                    <td className="p-2.5 text-center text-slate-600 font-medium">{v.orderCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ─────────────────────── MAIN DRAWER ─────────────────────── */
export default function ProductDetailsDrawer({ open, onOpenChange, productId, onEdit, onUpdateStock }) {
  const { getProductByIdQuery } = useProducts();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: productResp, isLoading, error } = getProductByIdQuery(productId);
  const product = productResp?.data;

  // Reset to overview tab when product changes
  React.useEffect(() => {
    setActiveTab("overview");
  }, [productId]);

  const renderPanel = () => {
    if (!product) return null;
    switch (activeTab) {
      case "overview": return <OverviewPanel product={product} />;
      case "gallery": return <GalleryPanel product={product} />;
      case "pricing": return <PricingPanel product={product} />;
      case "description": return <DescriptionPanel product={product} />;
      case "variants": return <VariantsPanel product={product} />;
      default: return <OverviewPanel product={product} />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[900px] gap-0 bg-back1 border-l border-bdr2 shadow-none p-0 flex flex-col h-full overflow-hidden">

        {/* ── Header ── */}
        <SheetHeader className="py-3 px-5 border-b border-bdr2 bg-back2 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {product && (
                <div className="relative w-10 h-10 rounded-lg border border-bdr2 bg-white overflow-hidden shrink-0">
                  <Image src={product.images?.[0] || "/not-found-img.webp"} alt={product.fullName} fill className="object-contain p-0.5" sizes="40px" />
                </div>
              )}
              <div className="min-w-0">
                <SheetTitle className="text-sm font-bold text-slate-800 tracking-tight leading-tight line-clamp-2">
                  {product?.fullName || "Product Details"}
                </SheetTitle>
                {product && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge className={`text-[9px] uppercase font-bold shadow-none rounded-md px-1.5 py-0 h-4 ${product.active ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"}`}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] text-slate-500 rounded-md px-1.5 py-0 h-4 border-bdr2">
                      {product.category?.name || "Uncategorized"}
                    </Badge>
                    {product.brand?.name && (
                      <Badge variant="outline" className="text-[9px] text-slate-500 rounded-md px-1.5 py-0 h-4 border-bdr2">
                        {product.brand.name}
                      </Badge>
                    )}
                    {product.sku && (
                      <Badge variant="outline" className="text-[9px] text-slate-400 rounded-md px-1.5 py-0 h-4 border-bdr2 font-mono">
                        {product.sku}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons — dark/inverted for visibility */}
            {product && (
              <div className="flex gap-2 shrink-0 mr-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onUpdateStock(product._id); onOpenChange(false); }}
                  className="h-8 text-xs font-semibold border-slate-300 bg-slate-800 text-white hover:bg-slate-700 hover:text-white gap-1.5"
                >
                  <RefreshCw size={12} /> Update Stock
                </Button>
                <Button
                  size="sm"
                  onClick={() => { onEdit(product); onOpenChange(false); }}
                  className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                >
                  <Pencil size={12} /> Edit Product
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {/* ── Body: Sidebar + Content ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Sidebar Navigator */}
          <nav className="w-44 shrink-0 bg-back2 border-r border-bdr2 py-3 flex flex-col gap-0.5 overflow-y-auto">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 text-left text-[11px] font-semibold transition-all w-full
                    ${isActive
                      ? "bg-white text-indigo-650 border-r-2 border-indigo-500 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/60"
                    }`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-indigo-500" : "text-slate-400"}`} />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-12 bg-back1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                <span className="text-xs text-slate-500 font-semibold animate-pulse">Fetching catalog details…</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center border border-red-200 bg-red-50 text-red-700 rounded-xl font-semibold text-sm">
                Failed to load product specifications. Please try again.
              </div>
            ) : product ? (
              renderPanel()
            ) : (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                Select a product to view its specifications.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
