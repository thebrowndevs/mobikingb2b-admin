'use client';
import { CirclePlus, Search, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import CategoriesListView from './components/CategoriesListView';
import CategoryDialog from './components/CategoryDialog';
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import NotAuthorizedPage from '@/components/notAuthorized';

export default function Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // fetch categories query with search params
    const { categoriesQuery, createCategory, deleteCategory, updateCategory, permissions: {
        canView,
        canAdd,
        canEdit,
        canDelete
    } } = useCategories();

    const activeCategoriesQuery = categoriesQuery({ searchQuery: debouncedSearch });

    // destructure createCategory mutation
    const {
        mutateAsync: createCategoryAsync,
        isPending: isCreating,
        error: createError,
        reset: resetCreate,
    } = createCategory;

    // destructure updateCategory mutation
    const {
        mutateAsync: updateCategoryAsync,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdate,
    } = updateCategory;

    // destructure deleteCategory mutation
    const {
        mutateAsync: deleteCategoryAsync,
        isPending: isDeleting,
        error: deleteError,
        reset: resetDelete,
    } = deleteCategory;

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState();
    const [image, setImage] = useState(null);

    // open dialog to add new tag
    const handleAddClick = () => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setImage(null);
        setSelectedCategory(undefined);
        setIsDialogOpen(true);
    };

    // open dialog to edit
    const handleEditClick = (category) => {
        resetCreate();
        resetUpdate();
        resetDelete();
        setSelectedCategory(category);
        setImage(category?.image);
        setIsDialogOpen(true);
    };

    const handleToggleActive = async (id, active) => {
        await updateCategoryAsync({ id, data: { active } });
    };

    if (!canView) {
        return <NotAuthorizedPage />;
    }

    return (
        <InnerDashboardLayout>
            <div className="w-full mb-6">
                <h1 className="text-primary font-bold text-3xl tracking-tighter">Categories</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and organize product grouping categories</p>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-5 mt-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search categories by name or slug..."
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
                        {searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm('')}
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
                            Total: {activeCategoriesQuery.data?.data?.length || 0}
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

                {canView &&
                    <CategoriesListView
                        categories={activeCategoriesQuery?.data?.data}
                        onEdit={handleEditClick}
                        onToggleActive={handleToggleActive}
                        isLoading={activeCategoriesQuery.isLoading}
                        error={activeCategoriesQuery.error}
                        onDelete={deleteCategoryAsync}
                        isDeleting={isDeleting}
                        deleteError={deleteError}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                }

                <CategoryDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    selectedCategory={selectedCategory}
                    onCreate={createCategoryAsync}
                    onUpdate={updateCategoryAsync}
                    isSubmitting={isCreating || isUpdating}
                    error={createError?.message || updateError?.message}
                    image={image}
                    setImage={setImage}
                />
            </div>
        </InnerDashboardLayout>
    );
}