import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Actions, checkPermission, Resources } from '@/lib/permissions';
import { useAuthStore } from '@/store/useAuthStore';
import { usePermissions } from './usePermissions';

export const useBrands = () => {
    const queryClient = useQueryClient();

    // const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // // Permissions
    // const canView = checkView(Resources.BRANDS)
    // const canAdd = checkAdd(Resources.BRANDS)
    // const canEdit = checkEdit(Resources.BRANDS)
    // const canDelete = checkDelete(Resources.BRANDS)

    // Get all Brands
    const brandsQuery = useQuery({
        queryKey: ['brands'],
        queryFn: () => api.get('/brands').then(res => res.data),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch brands');
        }
    });

    // Create Brand mutation
    const createBrand = useMutation({
        mutationFn: ({ data }) => api.post('/brands/add', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create brand');
        }
    });

    // Update Brand mutation
    const updateBrand = useMutation({
        mutationFn: ({ data }) => api.put(`/brands/update`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update Brand');
        }
    });

    // Delete Brand mutation
    // const deleteBrand = useMutation({
    //     mutationFn: (id) => api.delete(`/brands/${id}`),
    //     enabled: canDelete,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['brands'] });
    //         toast.success('Brand deleted successfully');
    //     },
    //     onError: (err) => {
    //         toast.error(err?.response?.data?.message || 'Failed to delete Brand');
    //     }
    // });

    return {
        // brandsQuery, createBrand, deleteBrand,
        brandsQuery, updateBrand, createBrand,
    };
};
