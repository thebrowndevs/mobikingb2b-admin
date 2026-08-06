"use client";

import React, { useRef } from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Reorder } from "framer-motion";
import { uploadImage3 } from "@/lib/services/uploadImage2";
import { toast } from "sonner";

export default function MediaSection({ form }) {
  const fileInputRef = useRef(null);
  const { watch, setValue } = form;
  const images = watch("images") || [];

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading("Uploading images...");
    const urls = [];
    try {
      for (let file of files) {
        try {
          const url = await uploadImage3(file, (p) => {
            // Optional progress tracker logic here
          });
          urls.push(url);
        } catch (err) {
          console.error("Image upload failed:", err);
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      if (urls.length > 0) {
        setValue("images", [...images, ...urls], { shouldValidate: true });
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
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setValue("images", updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem className="space-y-2">
            <FormLabel className="text-xs font-bold text-slate-550 uppercase tracking-wider">
              Product Images<span className="text-red-500"> *</span>
            </FormLabel>

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Upload Area Action */}
            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed border-bdr2 hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] cursor-pointer rounded-xl p-8 flex flex-col items-center justify-center gap-2 group transition-all"
            >
              <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="text-sm font-semibold text-slate-700">
                Click to upload images
              </span>
              <span className="text-[11px] text-slate-400">
                Supports multiple JPG, PNG, WebP uploads
              </span>
            </div>

            {/* Image Preview with Reorder */}
            {images.length > 0 ? (
              <div className="mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Rearrange images by dragging them (First image is primary display thumbnail):
                </span>
                <Reorder.Group
                  axis="x"
                  values={images}
                  onReorder={(newOrder) =>
                    setValue("images", newOrder, { shouldValidate: true })
                  }
                  className="flex flex-wrap gap-3.5 mt-2"
                >
                  {images.map((url, idx) => (
                    <Reorder.Item
                      key={url}
                      value={url}
                      className="relative border border-bdr2 rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing w-28 h-28 shrink-0 bg-back2 flex items-center justify-center"
                    >
                      <Image
                        src={url}
                        alt={`Product image ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1.5 right-1.5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full p-1 shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-1 left-1.5 bg-black/60 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            ) : (
              <div className="text-slate-400 italic text-xs text-center py-8 border border-dashed border-bdr2 rounded-xl bg-back2/30">
                No images uploaded yet. At least one image is required.
              </div>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
