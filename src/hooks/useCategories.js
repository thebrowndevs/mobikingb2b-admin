import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useCategories = () => {
    const queryClient = useQueryClient();

    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.CATEGORIES)
    const canAdd = checkAdd(Resources.CATEGORIES)
    const canEdit = checkEdit(Resources.CATEGORIES)
    const canDelete = checkDelete(Resources.CATEGORIES)

    // Get all Categories
    const categoriesQuery = (params = {}) => useQuery({
        queryKey: ['categories', params],
        enabled: canView,
        queryFn: () => api.get('/categories', { params }).then(res => res.data),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch categories');
        }
    });

    const categoriesPaginationQuery = ({ page = 1, limit = 10, searchQuery = "" }) => useQuery({
        queryKey: ['categories', 'paginatedList', page, limit, searchQuery],
        enabled: canView,
        queryFn: () => api.get('/categories', {
            params: { page, limit, searchQuery }
        }).then(res => res.data?.data || {}),
        staleTime: 1000 * 10,
    });

    // Create Category mutation
    const createCategory = useMutation({
        mutationFn: ({ data }) => api.post('/categories/createCategory', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create category');
        }
    });

    // Update Category mutation
    const updateCategory = useMutation({
        mutationFn: ({ id, data }) => api.put(`/categories/${id}`, data),
        enabled: canEdit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update Category');
        }
    });

    // Delete Category mutation
    const deleteCategory = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        enabled: canDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete Category');
        }
    });

    return {
        // categoriesQuery, createCategory, deleteCategory,
        categoriesQuery, categoriesPaginationQuery, deleteCategory, updateCategory, createCategory,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        }
    };
};
