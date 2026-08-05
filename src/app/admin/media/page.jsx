// app/admin/media/page.jsx
'use client';
import React, { useState } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';
import UploaderDialog from './components/UploaderDialog';
import ImageGallery from './components/ImageGallery';
import { useImages } from '@/hooks/useImages';

export default function MediaPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { imagesQuery, permissions: { canAdd } } = useImages();
    const images = imagesQuery.data || [];

    return (
        <InnerDashboardLayout>
            <div className="w-full flex items-center justify-between">
                <h1 className="text-primary font-bold sm:text-2xl lg:text-4xl mb-3">
                    Manage Media
                </h1>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 mt-4">
                    <Button variant="outline">
                        Total Media: {images.length}
                    </Button>

                    {canAdd && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <CirclePlus className="mr-2 h-4 w-4" /> Add New
                        </Button>
                    )}
                </div>

                <UploaderDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />

                <ImageGallery
                    images={images}
                    isLoading={imagesQuery.isLoading}
                />
            </div>
        </InnerDashboardLayout>
    );
}