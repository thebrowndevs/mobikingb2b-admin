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
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Brands</h1>
                <p className="text-sm text-slate-500 font-medium">Manage corporate manufacturing brands and trademark labels</p>
            </div>
            
            <div className="flex justify-between items-center mb-5 mt-4">
                <Button 
                    variant="outline" 
                    className="bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold"
                    disabled
                >
                    Brands: {brandsQuery.data?.data?.length || 0}
                </Button>
                <Button 
                    onClick={handleAddClick}
                    className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                >
                    <CirclePlus className="mr-1.5 h-4 w-4" /> Add New
                </Button>
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
