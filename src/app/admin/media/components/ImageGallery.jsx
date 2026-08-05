// app/admin/media/components/ImageGallery.jsx
'use client';
import React, { useState } from 'react';
import Loader from '@/components/Loader';
import PreviewDialog from './PreviewDialog';
import { useImages } from '@/hooks/useImages';

export default function ImageGallery({ images, isLoading }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const { deleteImage, permissions: { canDelete } } = useImages();

    // console.log(images)
    if (isLoading) {
        return <div><Loader /></div>;
    }

    if (!images.length) {
        return <p className="text-center py-10 italic text-gray-500">
            No media uploaded yet.
        </p>;
    }

    async function handleDelete() {
        const parts = selectedImage.public_id.split('/');
        const id = (parts[parts.length - 1])

        await deleteImage.mutateAsync({ publicId: selectedImage.public_id });
        setIsDialogOpen(false);
        setSelectedImage(null);
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                {images.map(img => (
                    <div
                        key={img.public_id}
                        className="border-2 bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer bottom-0 relative duration-200 hover:bottom-2 hover:border-purple-400 hover:border-2 "
                        onClick={() => {
                            setSelectedImage(img);
                            setIsDialogOpen(true);
                            deleteImage.reset()
                        }}
                    >
                        <img
                            src={img.url}
                            alt={img.public_id}
                            className="w-full h-44 object-contain"
                        />
                    </div>
                ))}
            </div>

            {selectedImage && (
                <PreviewDialog
                    open={isDialogOpen}
                    onOpenChange={open => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedImage(null);
                    }}
                    image={selectedImage}
                    onDelete={handleDelete}
                    canDelete={canDelete}
                    deleting={deleteImage.isPending}
                    deleteError={deleteImage.isError ? deleteImage.error.message : null}
                />
            )}
        </>
    );
}
