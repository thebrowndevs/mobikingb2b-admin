import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from './usePermissions';
import { Resources } from '@/lib/permissions';

export const useCoupons = () => {
    const queryClient = useQueryClient();

    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.COUPON_CODES)
    const canAdd = checkAdd(Resources.COUPON_CODES)
    const canEdit = checkEdit(Resources.COUPON_CODES)
    const canDelete = checkDelete(Resources.COUPON_CODES)

    // Get all Categories
    const couponsQuery = (params) => {
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        return useQuery({
            queryKey: ['coupons', filteredParams],
            queryFn: () => api.get('/coupon/admin/all', { params: filteredParams }).then(res => res.data),
            staleTime: 1000 * 60 * 5,
            onError: (err) => {
                toast.error(err?.response?.data?.message || 'Failed to fetch coupons');
            }
        });
    }

    // Create Coupon mutation
    const createCoupon = useMutation({
        mutationFn: (data) => api.post('/coupon', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create category');
        }
    });

    // Update Coupon mutation
    const updateCoupon = useMutation({
        mutationFn: (data) => api.put(`/coupon`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update Coupon');
        }
    });

    // Delete Coupon mutation
    const deleteCoupon = useMutation({
        mutationFn: (id) => api.delete(`/coupon/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete Coupon');
        }
    });

    return {
        couponsQuery, deleteCoupon, updateCoupon, createCoupon,
        permissions: { canView, canAdd, canEdit, canDelete }
    };
};
