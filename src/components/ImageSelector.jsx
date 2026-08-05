"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { useImages } from '@/hooks/useImages';
import Image from 'next/image';
import { ImagesIcon, Loader2 } from 'lucide-react';

function ImageSelector({ open, onOpenChange, setImage }) {
    const { imagesQuery } = useImages();
    const images = imagesQuery.data || [];
    const [selectedId, setSelectedId] = useState(null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select an Image</DialogTitle>
                </DialogHeader>

                <div className='flex flex-wrap gap-3 max-h-[50vh] overflow-y-auto pt-5'>
                    {images.map(img => (
                        <div
                            key={img.public_id}
                            className={`border-2 rounded-lg overflow-hidden shadow-sm cursor-pointer relative ${selectedId === img.public_id
                                ? 'border-purple-600'
                                : 'border-transparent hover:border-purple-400'
                                }`}
                            onClick={() => setSelectedId(img.public_id)}
                        >
                            <Image
                                height={100}
                                width={100}
                                quality={100}
                                src={img.url}
                                alt={img.public_id}
                                className="w-full h-44 object-contain"
                            />
                        </div>
                    ))}
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        onClick={() => {
                            const selectedImage = images.find(img => img.public_id === selectedId);
                            if (selectedImage) {
                                setImage(selectedImage.url)
                                onOpenChange(false);
                            }
                        }}
                        disabled={!selectedId}
                    >
                        <ImagesIcon className="mr-2" size={18} />Select Image
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ImageSelector;


