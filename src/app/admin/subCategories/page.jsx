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
        router.push('/admin/subCategories/add');
    };

    if (!canView) return <NotAuthorizedPage />;

    return (
        <InnerDashboardLayout>
            <div className="w-full items-center justify-between">
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-3">Sub Categories</h1>
            </div>

            <div>
                {/* Control bar: Search, Parent Category Filter, Total Badge, Add Button */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search subcategories by name or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-8 text-sm bg-white"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                                <SelectTrigger className="bg-white text-sm">
                                    <div className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-gray-500" />
                                        <SelectValue placeholder="All Categories" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
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
                                className="h-9 text-xs text-gray-500 hover:text-gray-900 gap-1.5 shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button variant="outline" className="shrink-0">
                            Total: {activeSubCategoriesQuery.data?.data?.length || 0}
                        </Button>
                        {canAdd &&
                            <Button onClick={handleAddClick} className="shrink-0">
                                <CirclePlus className="mr-2 h-4 w-4" /> Add New
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
                />
            </div>
        </InnerDashboardLayout>
    );
}