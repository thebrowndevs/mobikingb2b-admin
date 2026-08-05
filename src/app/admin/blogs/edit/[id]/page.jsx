"use client";

import React from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import BlogForm from '../../components/BlogForm';
import { useBlogs, useBlogById } from '@/hooks/useBlogs';
import { useParams, useRouter } from 'next/navigation';
import NotAuthorizedPage from '@/components/notAuthorized';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    // Fetch blog post details
    const { data: blog, isLoading, error } = useBlogById(id);

    // Fetch update mutation and permissions
    const { updateBlog, permissions: { canEdit } } = useBlogs();

    if (!canEdit) return <NotAuthorizedPage />;

    const handleFormSubmit = async (formData) => {
        try {
            await updateBlog.mutateAsync({ id, data: formData });
            router.push('/admin/blogs');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <InnerDashboardLayout>
            <div className="w-full flex flex-col gap-4 pb-4">
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => router.push('/admin/blogs')}
                        title="Back to blogs list"
                    >
                        <ArrowLeft size={16} />
                    </Button>
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl">Edit Blog Post</h1>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 bg-white border rounded-lg shadow-sm">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <span className="ml-2 text-gray-500 font-medium">Loading blog details...</span>
                </div>
            ) : error ? (
                <div className="p-8 text-center border rounded-lg bg-red-50 border-red-200 text-red-700">
                    Failed to load blog post. Please check the ID or try again.
                </div>
            ) : (
                <div className="mt-4">
                    <BlogForm 
                        initialData={blog}
                        onSubmit={handleFormSubmit} 
                        isSubmitting={updateBlog.isPending} 
                    />
                </div>
            )}
        </InnerDashboardLayout>
    );
}
