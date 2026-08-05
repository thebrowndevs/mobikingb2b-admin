// app/admin/media/components/PreviewDialog.jsx
'use client';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FiTrash2, FiImage, FiInfo, FiCalendar, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';

export default function PreviewDialog({ open, onOpenChange, image, onDelete, deleting, deleteError, canDelete }) {
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState(null);

    const handleDownload = async () => {
        setDownloading(true);
        setDownloadError(null);

        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image-${image.public_id}.${image.format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setDownloadError('Failed to download image. Please try again.');
        } finally {
            setDownloading(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <div            >
                <DialogContent className="sm:max-w-3xl rounded-2xl backdrop-blur-lg max-h-[90vh] overflow-auto p-3 sm:p-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                            <FiImage className="text-blue-600" />
                            Media Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col sm:flex-row gap-6 p-2 sm:p-4">
                        {/* Image Preview Section */}
                        <div
                            className="flex-1 group relative overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center"
                        >
                            <img
                                src={image.url}
                                alt={image.public_id}
                                className="w-full h-72 object-contain transition-transform duration-300 hover:scale-105"
                            />
                        </div>

                        {/* Metadata Section */}
                        <div className="flex-1 space-y-4 text-slate-600">
                            <div className="space-y-3">

                                <div className="flex items-center gap-2">
                                    <FiInfo className="text-slate-400" />
                                    <p className="font-medium">Public ID:
                                        <span className="block font-mono text-sm text-slate-500 mt-1">
                                            {image.public_id}
                                        </span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                                    {/* Created At */}
                                    <div className="p-3 bg-slate-50 rounded-lg col-span-2 sm:col-span-2">
                                        <p className="text-xs text-slate-400 mb-1">Upload Date</p>
                                        <p className="font-medium text-sm">
                                            {new Date(image.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Format */}
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Format</p>
                                        <p className="font-medium uppercase">{image.format}</p>
                                    </div>

                                    {/* Size */}
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">File Size</p>
                                        <p className="font-medium">{image.size} KB</p>
                                    </div>

                                    {/* Dimensions */}
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Width</p>
                                        <p className="font-medium">{image.width}px</p>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-400 mb-1">Height</p>
                                        <p className="font-medium">{image.height}px</p>
                                    </div>

                                </div>

                                {/* URL */}
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">Cloud URL</p>
                                    <p className="font-medium text-sm break-all text-blue-600 hover:underline">
                                        <a href={image.url} target="_blank" rel="noopener noreferrer">
                                            {image.url}
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Error Display */}
                            {deleteError && (
                                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600">
                                    <FiAlertTriangle />
                                    <p>Error: {deleteError}</p>
                                </div>
                            )}

                            {/* Add download error display */}
                            {downloadError && (
                                <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600 mt-2">
                                    <FiAlertTriangle />
                                    <p>{downloadError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleDownload}
                                disabled={downloading || deleting}
                                className="gap-2 px-6 py-3 transition-all flex-1"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 size={20} className='animate-spin' />
                                        Downloading...
                                    </>
                                ) : (
                                    <>
                                        <FiDownload className="text-lg" />
                                        Download
                                    </>
                                )}
                            </Button>

                            {canDelete &&
                                <Button
                                    variant="destructive"
                                    onClick={onDelete}
                                    disabled={deleting || downloading}
                                    className="gap-2 px-6 py-3 transition-all flex-1"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 size={20} className='animate-spin' />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 className="text-lg" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            }
                        </div>
                    </DialogFooter>
                </DialogContent>
            </div>
        </Dialog>
    );
}