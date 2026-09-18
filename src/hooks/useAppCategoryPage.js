import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export const useAppCategoryPage = () => {
    const queryClient = useQueryClient();

    const categoryPageAdminQuery = useQuery({
        queryKey: ['appCategoryPage', 'admin'],
        queryFn: () => api.get('/category-page/admin').then(res => res.data?.data || {}),
        staleTime: 1000 * 30
    });

    const updateCategoryPageAdmin = useMutation({
        mutationFn: (data) => api.put('/category-page/admin', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appCategoryPage'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            toast.success('App Category Layout updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update App Category Layout');
        }
    });

    return {
        categoryPageAdminQuery,
        updateCategoryPageAdmin
    };
};
