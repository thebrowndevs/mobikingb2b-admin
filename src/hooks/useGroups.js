import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useGroups = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.PRODUCT_GROUPS)
    const canAdd = checkAdd(Resources.PRODUCT_GROUPS)
    const canEdit = checkEdit(Resources.PRODUCT_GROUPS)
    const canDelete = checkDelete(Resources.PRODUCT_GROUPS)

    // Get all SubCategories
    const groupsQuery = useQuery({
        queryKey: ['groups'],
        enabled: canView,
        queryFn: () => api.get('/groups').then(res => res.data),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch groups');
        }
    });

    const groupsPaginationQuery = ({ page = 1, limit = 10, searchQuery = "" }) => useQuery({
        queryKey: ['groups', 'adminList', page, limit, searchQuery],
        enabled: canView,
        queryFn: () => api.get('/groups/admin/list', {
            params: { page, limit, searchQuery }
        }).then(res => res.data?.data || {}),
        staleTime: 1000 * 10, // 10 seconds cache
    });

    // const getGroupQuery = (slug) => useQuery({
    //     queryKey: ['product', slug],
    //     queryFn: async () => {
    //         const res = await api.get(`/groups/details/${slug}`);
    //         const data = res.data;

    //         if (!data || data.message === 'Sub Service not found') {
    //             throw new Error('Service not found');
    //         }

    //         return data;
    //     },
    //     staleTime: 1000 * 60 * 5,
    //     onError: (err) => {
    //         toast.error(err?.response?.data?.message || 'Failed to fetch service');
    //     }
    // });


    // Create Group mutation
    const createGroup = useMutation({
        mutationFn: (data) => api.post('/groups/createGroup', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create Group');
        }
    });

    // Update Group status
    const updateGroup = useMutation({
        mutationFn: ({ id, data }) => api.put(`/groups/${id}`, data),
        enabled: canEdit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group updated successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to update Group');
        }
    });

    // Update Group mutation
    const updateGroupStatus = useMutation({
        mutationFn: ({ id, data }) => api.put(`/groups/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group updated successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to update Group');
        }
    });

    const updateProductsInGroup = useMutation({
        mutationFn: (data) => api.post(`/groups/updateProducts`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Products added successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to update Group');
        }
    })

    const addProductInGroup = useMutation({
        mutationFn: (data) => api.post(`/groups/addProduct`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            // toast.success('Product added successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to add Product in group');
        }
    })

    const removeProductFromGroup = useMutation({
        mutationFn: (data) => api.post(`/groups/removeProduct`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            // toast.success('Product added successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to add Product in group');
        }
    })

    // Delete Group mutation
    const deleteGroup = useMutation({
        mutationFn: (id) => api.delete(`/groups/${id}`),
        enabled: canDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('Group deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete Group');
        }
    });

    return {
        groupsQuery, groupsPaginationQuery, createGroup, deleteGroup, updateGroup, updateProductsInGroup, updateGroupStatus, addProductInGroup, removeProductFromGroup,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        }
    };
};
