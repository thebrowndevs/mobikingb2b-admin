"use client"
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useBrands } from '@/hooks/useBrands';
import React, { useState } from 'react'
import BrandsListView from './components/BrandsListView';
import BrandDialog from './components/BrandDialog';
import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function page() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState();
    const [image, setImage] = useState(null)

    const { brandsQuery, createBrand, updateBrand } = useBrands();
    const {
        mutateAsync: createBrandAsync,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = createBrand;

    const {
        mutateAsync: updateBrandAsync,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdate,
    } = updateBrand;

    // open dialog to add new tag
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        // resetDelete();
        setImage(null)
        setSelectedBrand(undefined);
        setIsDialogOpen(true);
    };

    // open dialog to edit
    const handleEditClick = (brand) => {
        resetCreate();
        resetUpdate();
        // resetDelete();
        setSelectedBrand(brand);
        setImage(brand?.image)
        setIsDialogOpen(true);
    };

    console.log(brandsQuery?.data?.data)

    return (
        <InnerDashboardLayout>
            <div className="w-full items-center justify-between">
                <h1 className="text-primary font-bold sm:text-2xl lg:text-4xl mb-3">Brands</h1>
            </div>
            <div className="flex justify-between items-center mb-4 mt-4">
                <Button variant="outline">
                    Brands: {brandsQuery.data?.data?.length || 0}
                </Button>
                {/* {canAdd && */}
                <Button onClick={handleAddClick}>
                    <CirclePlus className="mr-2 h-4 w-4" /> Add New
                </Button>
                {/* } */}
            </div>

            <BrandsListView
                brands={brandsQuery?.data?.data}
                onEdit={handleEditClick}
                isLoading={brandsQuery.isLoading}
                error={brandsQuery.error}
            // onDelete={deleteBrandAsync}
            // isDeleting={isDeleting}
            // deleteError={deleteError}
            // canEdit={canEdit}
            // canDelete={canDelete}
            />

            <BrandDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedBrand={selectedBrand}
                onCreate={createBrandAsync}
                onUpdate={updateBrandAsync}
                isSubmitting={isCreating || isUpdating}
                error={createError?.message || updateError?.message}
                image={image}
                setImage={setImage}
            />
        </InnerDashboardLayout>
    )
}

export default page
