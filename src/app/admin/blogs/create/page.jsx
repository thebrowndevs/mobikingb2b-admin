"use client";

import React from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import BlogForm from '../components/BlogForm';
import { useBlogs } from '@/hooks/useBlogs';
import { useRouter } from 'next/navigation';
import NotAuthorizedPage from '@/components/notAuthorized';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateBlogPage() {
    const router = useRouter();
    const { createBlog, permissions: { canAdd } } = useBlogs();

    if (!canAdd) return <NotAuthorizedPage />;

    const handleFormSubmit = async (formData) => {
        try {
            await createBlog.mutateAsync(formData);
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
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl">Create New Blog Post</h1>
                </div>
            </div>

            <div className="mt-4">
                <BlogForm 
                    onSubmit={handleFormSubmit} 
                    isSubmitting={createBlog.isPending} 
                />
            </div>
        </InnerDashboardLayout>
    );
}
