// app/admin/media/components/UploaderDialog.jsx

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useImages } from '@/hooks/useImages';
import { convertToBase64 } from '@/lib/services/convertToBase64';
import { FolderUp, Loader2 } from 'lucide-react';

export default function UploaderDialog({ open, onOpenChange }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [metadata, setMetadata] = useState({ name: '', size: 0, width: 0, height: 0 });
    const inputRef = useRef();

    // pull in your mutation
    const { uploadImage, imagesQuery } = useImages();

    const {
        mutateAsync: uploadImageAsync,
        isPending: isUploading,
        error: uploadError,
    } = uploadImage;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        if (selected.size > 400 * 1024) {
            alert('File size exceeds 300KB');
            return;
        }
        const url = URL.createObjectURL(selected);
        const img = new Image();
        img.onload = () => {
            setMetadata({
                name: selected.name,
                size: Math.round(selected.size / 1024),
                width: img.width,
                height: img.height,
            });
        };
        img.src = url;
        setFile(selected);
        setPreviewUrl(url);
    };

    const triggerFileSelect = () => {
        if (inputRef.current) inputRef.current.click();
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!file) {
            return alert('Please select an Image first.');
        }

        try {
            // convert file to base64
            const base64 = await convertToBase64(file);

            await uploadImageAsync({ image: base64 });
            setFile(null);
            setPreviewUrl(null);
            imagesQuery.refetch();
            setMetadata({ name: '', size: 0, width: 0, height: 0 });
            onOpenChange(false);

        } catch (err) {
            console.error(err);
            alert('Failed to read file.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:space-x-6">
                        {/* Left: upload area */}
                        <div
                            className="flex-1 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer h-48 mb-4 sm:mb-0"
                            onClick={triggerFileSelect}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-full max-w-full object-contain rounded-lg"
                                />
                            ) : (
                                <span className="text-gray-500">Click to select image</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={inputRef}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Right: metadata */}
                        <div className="flex-1">
                            <Label className="font-semibold mb-2 block">File Details</Label>
                            {file ? (
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2">
                                    <div className="grid grid-cols-2 gap-x-4">
                                        <p className="text-sm text-gray-600">Name:</p>
                                        <p className="text-sm font-medium text-gray-800">{metadata.name}</p>
                                        <p className="text-sm text-gray-600">Size:</p>
                                        <p className="text-sm font-medium text-gray-800">{metadata.size} KB</p>
                                        <p className="text-sm text-gray-600">Width:</p>
                                        <p className="text-sm font-medium text-gray-800">{metadata.width}px</p>
                                        <p className="text-sm text-gray-600">Height:</p>
                                        <p className="text-sm font-medium text-gray-800">{metadata.height}px</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="italic text-gray-500">No file selected</p>
                            )}
                        </div>
                    </div>

                    {uploadError && (
                        <p className="text-red-600 mb-5 text-sm">Error: {uploadError}</p>
                    )}

                    <DialogFooter className="mt-6">
                        <Button
                            type="submit"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FolderUp className="mr-2 h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}