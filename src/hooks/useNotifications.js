import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useNotifications = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.NOTIFICATIONS)
    const canAdd = checkAdd(Resources.NOTIFICATIONS)
    const canEdit = checkEdit(Resources.NOTIFICATIONS)
    const canDelete = checkDelete(Resources.NOTIFICATIONS)

    // Get all notifications
    const notificationsQuery = useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications').then(res => res.data),
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch notifications');
        }
    });

    // Create Notification mutation
    const createNotification = useMutation({
        mutationFn: (data) => api.post('/notifications', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notification created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create category');
        }
    });

    // Delete Notification mutation
    const deleteNotification = useMutation({
        mutationFn: (id) => api.delete(`/notifications/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notification deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete Notification');
        }
    });

    return {
        // notificationsQuery, createNotification, deleteNotification,
        notificationsQuery, deleteNotification, createNotification,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        }
    };
};
