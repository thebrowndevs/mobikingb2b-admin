"use client"
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from '@/components/ui/breadcrumb';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useSubCategories } from '@/hooks/useSubCategories';
import SubCategoryForm from '../../components/SubCategoryForm';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

function page() {
  const router = useRouter()
  const params = useParams();
  const slug = params.slug;
  const { updateService, getSubServiceQuery } = useSubCategories()
  const { data: subCategory, isLoading, error } = getSubServiceQuery(slug);

  const { updateSubCategory } = useSubCategories()

  const defaultData = subCategory?.data

  console.log(defaultData)

  const handleSubmit = async (data) => {
    await updateSubCategory.mutateAsync({ id: defaultData._id, data })
    console.log('Update subCategory:', data);
    router.back() // Go back instead of hardcoding /admin/subCategories
  };

  return (

    <InnerDashboardLayout>
      <div className="w-full mb-3">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-primary font-bold sm:text-2xl lg:text-4xl">Edit Sub Category</h1>
        </div>
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/subCategories">Sub Categories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-50 flex items-center justify-center min-h-[400px] rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-gray-500">Loading subcategory data...</p>
            </div>
          </div>
        )}
        <SubCategoryForm
          defaultValues={defaultData}
          onSubmit={handleSubmit}
          loading={updateSubCategory.isPending}
          error={updateSubCategory.error}
        />
      </div>
    </InnerDashboardLayout>
  )
}

export default page