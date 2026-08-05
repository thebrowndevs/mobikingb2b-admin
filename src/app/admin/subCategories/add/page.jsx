"use client"
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from '@/components/ui/breadcrumb';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useSubCategories } from '@/hooks/useSubCategories';
import { useRouter } from 'next/navigation';
import SubCategoryForm from '../components/SubCategoryForm';

function page() {
    const router = useRouter()
    const { createSubCategory } = useSubCategories()

    const handleSubmit = async (data) => {
        await createSubCategory.mutateAsync(data)
        console.log('Update subCategory:', data);
        // router.push('/admin/subCategories')
    };

    return (

        <InnerDashboardLayout>
            <div className="w-full items-center justify-between">
                <h1 className="text-primary font-bold sm:text-2xl lg:text-4xl mb-3">Add Sub Category</h1>
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
                            <BreadcrumbPage>Add New</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <SubCategoryForm
                onSubmit={handleSubmit}
                loading={createSubCategory.isPending}
                error={createSubCategory.error}
            />
        </InnerDashboardLayout>
    )
}

export default page