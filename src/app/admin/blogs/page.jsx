"use client";

import React, { useState, useEffect } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import { useBlogs } from '@/hooks/useBlogs';
import { useCategories } from '@/hooks/useCategories';
import TableSkeleton from '@/components/custom/TableSkeleton';
import BlogsListView from './components/BlogsListView';
import { Input } from "@/components/ui/input";
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
                    <div>
                        <h1 className="text-primary font-bold text-3xl tracking-tighter">Blogs Management</h1>
                        <p className="text-sm text-slate-500 font-medium">Publish, edit, and categorize marketing news and articles</p>
                    </div>
                    {canAdd && (
                        <Button
                            onClick={() => {
                                router.push('/admin/blogs/create');
                            }}
                            className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                        >
                            Add New Blog
                        </Button>
                    )}
                </div>

                {/* Toolbar Filters - Shadow removed, styled with back2 & bdr2 */}
                <div className="bg-back2 p-5 rounded-xl border border-bdr2">
                    <div className="flex flex-col md:flex-row items-end gap-4 w-full">
                        {/* Search Bar */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px] w-full md:w-auto">
                            <label className="text-xs font-semibold text-slate-500">Text Search</label>
                            <Input
                                placeholder="Search title or summary..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-back1 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* From Date */}
                        <div className="flex flex-col gap-1.5 w-full md:w-[160px] shrink-0">
                            <label className="text-xs font-semibold text-slate-500">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-back1 border-bdr2 text-slate-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col gap-1.5 w-full md:w-[160px] shrink-0">
                            <label className="text-xs font-semibold text-slate-500">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-back1 border-bdr2 text-slate-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Reset & Count Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                            <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-back1 border border-bdr2 text-slate-600 shrink-0">
                                Total: {totalCount}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                className="shrink-0 bg-back2 hover:bg-slate-100 border border-bdr2 text-slate-700 font-semibold"
                            >
                                <RotateCcw size={15} className="mr-1.5" /> Reset
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

                    {/* Pagination Controls - Shadow removed, styled with back2 & bdr2 */}
                    <div className="flex items-center justify-between border border-bdr2 bg-back2 px-5 py-4 rounded-xl">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <Button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                variant="outline"
                                className="bg-back2 border-bdr2 text-slate-700"
                            >
                                Previous
                            </Button>
                            <Button
                                onClick={() => setPage(p => p + 1)}
                                disabled={!hasMore}
                                variant="outline"
                                className="bg-back2 border-bdr2 text-slate-700"
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">
                                    Showing page <span className="font-semibold text-slate-800">{page}</span> (
                                    {page === 1 ? '30' : '10'} limit per page)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1.5 bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold"
                                >
                                    <ArrowLeft size={14} />
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={!hasMore}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1.5 bg-back2 border-bdr2 text-slate-700 hover:bg-slate-50 font-semibold"
                                >
                                    Next
                                    <ArrowRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </InnerDashboardLayout>
    );
}
