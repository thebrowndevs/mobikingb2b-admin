'use client';

import { CirclePlus, Search, Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import CategoriesListView from './components/CategoriesListView';
import SubCategoryDrawer from './components/SubCategoryDrawer';
import { useSubCategories } from '@/hooks/useSubCategories';
import { useCategories } from '@/hooks/useCategories';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import NotAuthorizedPage from '@/components/notAuthorized';

export default function Page() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedParentCategory, setSelectedParentCategory] = useState('all');

    // Drawer states
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Hooks
    const { subCategoriesQuery, deleteSubCategory, permissions: { canView, canAdd, canEdit, canDelete } } = useSubCategories();
    const { categoriesQuery } = useCategories();

    // Fetch parent categories for filter
    const activeCategoriesQuery = categoriesQuery();
    const parentCategories = activeCategoriesQuery?.data?.data || [];

    // Fetch subcategories with search and parentCategory filter
    const activeSubCategoriesQuery = subCategoriesQuery({
        searchQuery: debouncedSearch,
        parentCategory: selectedParentCategory === 'all' ? '' : selectedParentCategory,
    });

    const {
        mutateAsync: deleteSubCategoryAsync,
        isPending: isDeleting,
        error: deleteError,
    } = deleteSubCategory;

    const handleAddClick = () => {
        setSelectedSlug(null);
        setDrawerOpen(true);
    };

    const handleEditClick = (slug) => {
        setSelectedSlug(slug);
        setDrawerOpen(true);
    };

    if (!canView) return <NotAuthorizedPage />;

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Sub Categories</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and organize parent category splits and sub-groupings</p>
            </div>

            <div>
                {/* Control bar: Search, Parent Category Filter, Total Badge, Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search subcategories by name or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 text-sm bg-back2 border-bdr2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-none"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 transition-colors"
                                    title="Clear search"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Parent Category Filter Dropdown */}
                        <div className="w-[200px] shrink-0">
                            <Select
                                value={selectedParentCategory}
                                onValueChange={(value) => setSelectedParentCategory(value)}
                            >
                                <SelectTrigger className="bg-back2 border-bdr2 text-slate-700 shadow-none text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-back2 border border-bdr2 shadow-none rounded-xl">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {parentCategories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {(searchTerm || selectedParentCategory !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedParentCategory('all');
                                }}
                                className="h-9 text-xs text-slate-500 hover:text-slate-900 gap-1.5 shrink-0 bg-transparent hover:bg-slate-100/50 shadow-none border-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button 
                            variant="outline" 
                            className="shrink-0 bg-back2 border-bdr2 text-slate-700 shadow-none font-semibold"
                            disabled
                        >
                            Total: {activeSubCategoriesQuery.data?.data?.length || 0}
                        </Button>
                        {canAdd &&
                            <Button 
                                onClick={handleAddClick} 
                                className="shrink-0 bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                            >
                                <CirclePlus className="mr-1.5 h-4 w-4" /> Add New
                            </Button>
                        }
                    </div>
                </div>

                <CategoriesListView
                    categories={activeSubCategoriesQuery?.data?.data}
                    isLoading={activeSubCategoriesQuery.isLoading}
                    error={activeSubCategoriesQuery.error}
                    onDelete={deleteSubCategoryAsync}
                    isDeleting={isDeleting}
                    deleteError={deleteError}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onEdit={handleEditClick}
                />

                <SubCategoryDrawer 
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    slug={selectedSlug}
                />
            </div>
        </InnerDashboardLayout>
    );
}