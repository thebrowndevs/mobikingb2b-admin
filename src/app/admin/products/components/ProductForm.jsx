"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProducts } from "@/hooks/useProducts";
import { useSubCategories } from "@/hooks/useSubCategories";
import { useBrands } from "@/hooks/useBrands";
import { toast } from "sonner";

// Import step layouts
import GeneralDetailsStep from "./form/steps/GeneralDetailsStep";
import PricingStep from "./form/steps/PricingStep";
import VariantsStep from "./form/steps/VariantsStep";

// Step 1 Validation Schema
const step1Schema = z.object({
  brandId: z.string().optional().nullable(),
  fullName: z.string().min(1, "Full name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().optional().nullable(),
  hsn: z.string().optional().nullable(),
  tags: z.any().optional(),
  description: z.string().min(1, "Description is required"),
  descriptionPoints: z.array(z.string()).optional(),
  keyInformation: z.array(
    z.object({
      title: z.string().min(1, "Title required"),
      content: z.string().min(1, "Content required"),
    })
  ).optional(),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  active: z.boolean().default(true),
  webVisibility: z.boolean().default(true),
  appVisibility: z.boolean().default(true),
  rating: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().min(0).max(5).optional().nullable()),
  reviewCount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().min(0).optional().nullable()),
});

// Step 2 Validation Schema
const step2Schema = z.object({
  price: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().min(0).optional().nullable()),
  gst: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().min(0).optional().nullable()),
  regularPrice: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().optional().nullable()),
  basePrice: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().optional().nullable()),
  discount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().optional().nullable()),
  moq: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    return typeof val === "string" ? Number(val) : val;
  }, z.number().min(1).optional().nullable()),
  sellingPrice: z
    .object({
      type: z.enum(["fixed", "slabs"]).default("fixed"),
      slabs: z
        .array(
          z.object({
            quantity: z.number().min(1, "Quantity required"),
            price: z.number().min(0, "Price required"),
          })
        )
        .optional(),
    })
    .optional(),
});

const cleanOptionalNumber = (val) => {
  if (val === "" || val === null || val === undefined) return null;
  return Number(val);
};

export default function ProductForm({ productId: initialProductId }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [productId, setProductId] = useState(initialProductId || null);

  const {
    createProduct,
    updateProduct,
    getProductByIdQuery,
    permissions: { canAdd, canEdit },
  } = useProducts();

  const { subCategoriesQuery } = useSubCategories();
  const categories = subCategoriesQuery().data?.data || [];

  // Fetch product data if editing
  const {
    data: productResp,
    isLoading: isProductLoading,
    refetch: refetchProduct,
  } = getProductByIdQuery(productId);
  const product = productResp?.data;

  // React Hook Form initialization
  const form = useForm({
    resolver: zodResolver(
      activeStep === 1 ? step1Schema : activeStep === 2 ? step2Schema : z.any()
    ),
    mode: "onSubmit",
    defaultValues: {
      brandId: "",
      fullName: "",
      slug: "",
      sku: "",
      hsn: "",
      tags: "",
      description: "",
      descriptionPoints: [],
      keyInformation: [],
      categoryId: "",
      images: [],
      active: true,
      webVisibility: true,
      appVisibility: true,
      rating: "",
      reviewCount: "",
      gst: 18,
      regularPrice: "",
      basePrice: "",
      discount: "",
      moq: 1,
      sellingPrice: {
        type: "variable",
        slabs: [{ quantity: 1, price: "" }],
      },
    },
  });

  const { reset } = form;

  const watchName = form.watch("fullName");
  useEffect(() => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [watchName]);

  // Load product details into form in Edit Mode
  useEffect(() => {
    if (product) {
      reset({
        brandId: product?.brand || "",
        fullName: product?.fullName || "",
        slug: product?.slug || "",
        sku: product?.sku || "",
        hsn: product?.hsn || "",
        tags: product?.tags
          ? Array.isArray(product.tags)
            ? product.tags.join(", ")
            : product.tags
          : "",
        description: product?.description || "",
        descriptionPoints: product?.descriptionPoints || [],
        keyInformation: product?.keyInformation || [],
        categoryId: product?.category?._id || "",
        images: product?.images || [],
        active: product?.active !== false,
        webVisibility: product?.webVisibility !== false,
        appVisibility: product?.appVisibility !== false,
        rating: product?.rating ?? "",
        reviewCount: product?.reviewCount ?? "",
        gst: product?.gst ?? 18,
        regularPrice: product?.regularPrice ?? "",
        basePrice: product?.basePrice ?? "",
        discount: product?.discount ?? "",
        moq: product?.moq ?? 1,
        sellingPrice: product?.sellingPrice || {
          type: "variable",
          slabs: [{ quantity: 1, price: "" }],
        },
      });
    }
  }, [product, reset]);

  const handleNext = async () => {
    const triggerFields =
      activeStep === 1
        ? [
          "fullName",
          "slug",
          "categoryId",
          "images",
          "description",
        ]
        : ["basePrice", "moq"];

    const isValid = await form.trigger(triggerFields);
    if (!isValid) {
      toast.error("Please fix validation errors before moving forward.");
      return;
    }

    const values = form.getValues();

    if (activeStep === 1) {
      // Step 1: Save general details
      let tagsArray = [];
      if (values.tags) {
        tagsArray = typeof values.tags === "string"
          ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : values.tags;
      }

      const step1Payload = {
        fullName: values.fullName,
        slug: values.slug,
        categoryId: values.categoryId,
        brandId: values.brandId || null,
        sku: values.sku || "",
        hsn: values.hsn || "",
        tags: tagsArray,
        description: values.description,
        descriptionPoints: values.descriptionPoints || [],
        keyInformation: values.keyInformation || [],
        active: values.active,
        webVisibility: values.webVisibility,
        appVisibility: values.appVisibility,
        rating: cleanOptionalNumber(values.rating),
        reviewCount: cleanOptionalNumber(values.reviewCount),
        images: values.images || [],
      };

      const toastId = toast.loading("Saving product specifications...");
      try {
        if (!productId) {
          // CREATE MODE - no dummy prices needed
          const response = await createProduct.mutateAsync(step1Payload);
          setProductId(response?.data?.data?._id);
          toast.success("Product created! Please define pricing next.", {
            id: toastId,
          });
          // Update URL to edit mode without full page reload
          window.history.replaceState(
            null,
            "",
            `/admin/products/${response.data.data._id}`
          );
        } else {
          // EDIT MODE
          await updateProduct.mutateAsync({
            id: productId,
            data: step1Payload,
          });
          toast.success("Product details saved.", { id: toastId });
        }
        setActiveStep(2);
      } catch (err) {
        console.error("Step 1 save failed:", err);
        toast.error(
          err?.response?.data?.message || "Failed to save product details",
          { id: toastId }
        );
      }
    } else if (activeStep === 2) {
      // Step 2: Save pricing
      const step2Payload = {
        gst: cleanOptionalNumber(values.gst),
        regularPrice: cleanOptionalNumber(values.regularPrice),
        basePrice: cleanOptionalNumber(values.basePrice),
        discount: cleanOptionalNumber(values.discount),
        moq: cleanOptionalNumber(values.moq) || 1,
        sellingPrice: values.sellingPrice,
      };

      const toastId = toast.loading("Saving pricing configurations...");
      try {
        await updateProduct.mutateAsync({
          id: productId,
          data: step2Payload,
        });
        toast.success("Pricing saved successfully.", { id: toastId });
        setActiveStep(3);
        refetchProduct();
      } catch (err) {
        console.error("Step 2 save failed:", err);
        toast.error(
          err?.response?.data?.message || "Failed to save pricing details",
          { id: toastId }
        );
      }
    }
  };

  const handleFinish = () => {
    toast.success("Product configuration finalized!");
    router.push("/admin/products");
  };

  if (productId && isProductLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Dynamic Progress Stepper */}
      <div className="flex justify-between items-center bg-back2 border border-bdr2 rounded-xl p-4 shadow-none">
        {[
          { step: 1, label: "General Specs" },
          { step: 2, label: "Pricing & Slabs" },
          { step: 3, label: "Model Variants" },
        ].map((item) => (
          <div key={item.step} className="flex items-center gap-2 flex-1 justify-center last:flex-none">
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${activeStep === item.step
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : activeStep > item.step
                    ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                    : "bg-back1 text-slate-400 border border-bdr2"
                }`}
            >
              {activeStep > item.step ? <Check size={14} /> : item.step}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${activeStep === item.step
                  ? "text-indigo-600 font-extrabold"
                  : activeStep > item.step
                    ? "text-slate-550"
                    : "text-slate-400"
                }`}
            >
              {item.label}
            </span>
            {item.step < 3 && <div className="h-[1px] bg-bdr2 flex-1 mx-4 hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Stepper Forms */}
      <Form {...form}>
        <div className="mt-4">
          {activeStep === 1 && (
            <GeneralDetailsStep form={form} categories={categories} />
          )}
          {activeStep === 2 && <PricingStep form={form} />}
          {activeStep === 3 && (
            <VariantsStep
              productId={productId}
              product={product}
              refetch={refetchProduct}
            />
          )}
        </div>
      </Form>

      {/* Stepper Footer Controls */}
      <div className="flex justify-between items-center border-t border-bdr2 pt-5">
        <Button
          type="button"
          variant="outline"
          disabled={activeStep === 1}
          onClick={() => setActiveStep((prev) => prev - 1)}
          className="bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold text-xs h-9 px-4 gap-1.5"
        >
          <ArrowLeft size={14} /> Back
        </Button>

        {activeStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={createProduct.isPending || updateProduct.isPending}
            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold text-xs h-9 px-4 gap-1.5"
          >
            {createProduct.isPending || updateProduct.isPending ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save & Next <ArrowRight size={14} />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinish}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none font-semibold text-xs h-9 px-4 gap-1.5"
          >
            Finish & Exit <Check size={14} />
          </Button>
        )}
      </div>
    </div>
  );
}
