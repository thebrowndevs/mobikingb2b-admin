"use client";

import React, { useState, useEffect } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import { useBlogs } from '@/hooks/useBlogs';
import { useCategories } from '@/hooks/useCategories';
import TableSkeleton from '@/components/custom/TableSkeleton';
import BlogsListView from './components/BlogsListView';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import NotAuthorizedPage from '@/components/notAuthorized';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

function useDebouncedValue(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function BlogsPage() {
    const router = useRouter();

    // Pagination & Search States
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebouncedValue(searchTerm, 500);

    // Filter States
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all"); // "all", "true", "false"
    const [featuredFilter, setFeaturedFilter] = useState("all"); // "all", "true", "false"
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Load categories for filter
    const { categoriesQuery } = useCategories();
    const categories = categoriesQuery()?.data?.data || [];

    // Query parameters
    const queryParams = {
        page,
        search: debouncedSearch,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        status: statusFilter,
        active: activeFilter !== "all" ? activeFilter : undefined,
        featured: featuredFilter !== "all" ? featuredFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
    };

    // Get blogs hook
    const { blogsQuery, deleteBlog, updateBlog, permissions: { canView, canAdd, canEdit, canDelete } } = useBlogs(queryParams);

    // Reset page on filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, categoryFilter, statusFilter, activeFilter, featuredFilter, startDate, endDate]);

    if (!canView) return <NotAuthorizedPage />;
    const blogsData = blogsQuery.data?.data?.blogs || [];
    const pagination = blogsQuery.data?.data?.pagination || { page: 1, limit: 30, totalCount: 0, hasMore: false };
    const { totalCount, hasMore } = pagination;

    // Reset filters action
    const handleResetFilters = () => {
        setSearchTerm("");
        setCategoryFilter("all");
        setStatusFilter("all");
        setActiveFilter("all");
        setFeaturedFilter("all");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    // Handle delete mutation
    const handleDeleteBlog = async (id) => {
        try {
            await deleteBlog.mutateAsync(id);
        } catch (error) {
            // Error toast handled in hook
        }
    };

    return (
        <InnerDashboardLayout>
            <div className="w-full flex flex-col gap-4 pb-4">
                <div className='flex items-center justify-between w-full mb-3'>
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl">Blogs Management</h1>
                    {canAdd && (
                        <Button
                            onClick={() => {
                                router.push('/admin/blogs/create');
                            }}
                        >
                            Add New Blog
                        </Button>
                    )}
                </div>

                {/* Toolbar Filters */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex flex-col md:flex-row items-end gap-3 w-full">
                        {/* Search Bar */}
                        <div className="flex flex-col gap-1 flex-1 min-w-[200px] w-full md:w-auto">
                            <label className="text-xs font-semibold text-gray-500">Text Search</label>
                            <Input
                                placeholder="Search title or summary..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border-gray-200"
                            />
                        </div>

                        {/* From Date */}
                        <div className="flex flex-col gap-1 w-full md:w-[150px] shrink-0">
                            <label className="text-xs font-semibold text-gray-500">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white border-gray-200 text-sm w-full"
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col gap-1 w-full md:w-[150px] shrink-0">
                            <label className="text-xs font-semibold text-gray-500">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white border-gray-200 text-sm w-full"
                            />
                        </div>

                        {/* Reset & Count Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                            <Button variant="outline" className="pointer-events-none bg-gray-50 border-gray-200 shrink-0 justify-center">
                                Total: {totalCount}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                className="shrink-0"
                            >
                                <RotateCcw size={16} className="mr-1" /> Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {blogsQuery.isLoading ? (
                <TableSkeleton showHeader={false} />
            ) : (
                <div className="flex flex-col gap-4">
                    <BlogsListView
                        error={blogsQuery.error}
                        blogs={blogsData}
                        onEdit={(blog) => {
                            router.push(`/admin/blogs/edit/${blog._id}`);
                        }}
                        onDelete={handleDeleteBlog}
                        isDeleting={deleteBlog.isPending}
                        deleteError={deleteBlog.error}
                        onUpdateField={updateBlog.mutateAsync}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        categories={categories}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                        featuredFilter={featuredFilter}
                        setFeaturedFilter={setFeaturedFilter}
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md shadow-sm">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <Button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-semibold text-gray-900">{page}</span> (
                                    {page === 1 ? '30' : '10'} limit per page)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1.5"
                                >
                                    <ArrowLeft size={16} />
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!hasMore}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1.5"
                                >
                                    Next
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </InnerDashboardLayout>
    );
}
