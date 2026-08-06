"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import { Reorder } from "framer-motion";
import { uploadImage3 } from "@/lib/services/uploadImage2";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function VariantForm({
  variant, // If provided, we are in Edit Mode
  onSubmit,
  onCancel,
  isSubmitting,
}) {
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(true);
  const [webVisibility, setWebVisibility] = useState(true);
  const [appVisibility, setAppVisibility] = useState(true);

  // Initialize values when variant changes (e.g. switching to Edit Mode)
  useEffect(() => {
    if (variant) {
      setName(variant.name || "");
      setImages(variant.images || []);
      setActive(variant.active !== false);
      setWebVisibility(variant.webVisibility !== false);
      setAppVisibility(variant.appVisibility !== false);
    } else {
      setName("");
      setImages([]);
      setActive(true);
      setWebVisibility(true);
      setAppVisibility(true);
    }
  }, [variant]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading("Uploading variant images...");
    const urls = [];
    try {
      for (let file of files) {
        try {
          const url = await uploadImage3(file, (p) => { });
          urls.push(url);
        } catch (err) {
          console.error("Variant image upload failed:", err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (urls.length > 0) {
        setImages((prev) => [...prev, ...urls]);
        toast.success("Images uploaded successfully", { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error("Bulk upload failed:", err);
      toast.error("Upload failed", { id: toastId });
    } finally {
      e.target.value = ""; // Reset input
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Variant Name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      images,
      active,
      webVisibility,
      appVisibility,
    });
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="border border-bdr2 bg-back2/40 rounded-xl p-5 space-y-5 shadow-none"
    >
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        {variant ? "Edit Variant Option" : "Define New Variant Option"}
      </h3>

      {/* Variant Name */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">
          Variant Name / Model Option<span className="text-red-500"> *</span>
        </label>
        <Input
          placeholder="e.g. 8GB RAM / 256GB Black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-back1 border-bdr2 text-slate-855 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none text-xs h-9"
        />
      </div>

      {/* Variant Images */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">
          Variant Images
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* Upload Trigger */}
        <div
          onClick={handleUploadClick}
          className="border border-dashed border-bdr2 hover:border-indigo-500/50 hover:bg-indigo-500/[0.01] cursor-pointer rounded-lg p-4 flex flex-col items-center justify-center gap-1 transition-all"
        >
          <UploadCloud className="h-6 w-6 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-700">
            Upload variant-specific photos
          </span>
        </div>

        {/* Preview List with drag and drop */}
        {images.length > 0 && (
          <Reorder.Group
            axis="x"
            values={images}
            onReorder={setImages}
            className="flex flex-wrap gap-2 mt-2.5"
          >
            {images.map((url, idx) => (
              <Reorder.Item
                key={url}
                value={url}
                className="relative border border-bdr2 rounded-lg overflow-hidden group cursor-grab active:cursor-grabbing w-16 h-16 shrink-0 bg-back2 flex items-center justify-center"
              >
                <Image
                  src={url}
                  alt={`Variant thumbnail ${idx + 1}`}
                  fill
                  className="object-contain p-0.5"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  className="absolute top-1 right-1 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full p-0.5 shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Variant Status & Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-bdr2">
        <div className="flex items-center justify-between p-2.5 bg-back1 border border-bdr2 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-0.5">
              Active Status
            </span>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Enable ordering
            </span>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>

        <div className="flex items-center justify-between p-2.5 bg-back1 border border-bdr2 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-0.5">
              Web Visibility
            </span>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Show on website
            </span>
          </div>
          <Switch checked={webVisibility} onCheckedChange={setWebVisibility} />
        </div>

        <div className="flex items-center justify-between p-2.5 bg-back1 border border-bdr2 rounded-xl">
          <div>
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-0.5">
              App Visibility
            </span>
            <span className="text-[9px] text-slate-400 block leading-tight">
              Show on mobile app
            </span>
          </div>
          <Switch checked={appVisibility} onCheckedChange={setAppVisibility} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 pt-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 text-xs bg-back1 border-bdr2 text-slate-700 shadow-none font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-8 text-xs bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Saving...
            </>
          ) : (
            "Save Option"
          )}
        </Button>
      </div>
    </form>
  );
}
