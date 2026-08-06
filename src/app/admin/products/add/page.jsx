"use client";

import React from "react";
import ProductForm from "../components/ProductForm";
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <InnerDashboardLayout>
      <div className="w-full mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/products")}
          className="h-9 w-9 bg-back2 border-bdr2 text-slate-700 shadow-none rounded-xl"
          title="Back to products list"
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-primary font-bold text-3xl tracking-tighter">Add New Product</h1>
          <p className="text-sm text-slate-500 font-medium">Create a new product spec entry in the wholesale catalog</p>
        </div>
      </div>

      <div className="mt-4">
        <ProductForm />
      </div>
    </InnerDashboardLayout>
  );
}
