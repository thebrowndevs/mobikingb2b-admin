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
                        className="bg-back2 hover:bg-slate-100 border border-bdr2 text-slate-750 shadow-none h-9 w-9 rounded-lg"
                    >
                        <ArrowLeft size={15} />
                    </Button>
                    <div>
                        <h1 className="text-primary font-bold text-3xl tracking-tighter">Edit Blog Post</h1>
                        <p className="text-sm text-slate-500 font-medium">Modify content, metadata, and FAQ parameters of this article</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 bg-back2 border border-bdr2 rounded-xl shadow-none">
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                    <span className="ml-2.5 text-slate-500 font-semibold text-sm">Loading blog details...</span>
                </div>
            ) : error ? (
                <div className="p-8 text-center border rounded-xl bg-red-50 border-red-200 text-red-700 font-medium">
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
