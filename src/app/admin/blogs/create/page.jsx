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
                        className="bg-back2 hover:bg-slate-100 border border-bdr2 text-slate-750 shadow-none h-9 w-9 rounded-lg"
                    >
                        <ArrowLeft size={15} />
                    </Button>
                    <div>
                        <h1 className="text-primary font-bold text-3xl tracking-tighter">Create New Blog Post</h1>
                        <p className="text-sm text-slate-500 font-medium">Compose a new article and publish it to the customer storefront</p>
                    </div>
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
