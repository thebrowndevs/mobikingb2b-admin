// hooks/useImages.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import localApi from '@/lib/localApi';
import { toast } from 'react-hot-toast';
import { Actions, checkPermission, Resources } from '@/lib/permissions';
import { useAuthStore } from '@/store/useAuthStore';

export const useImages = () => {
    const { user } = useAuthStore()
    const queryClient = useQueryClient();

    // Check permissions
    const canView = checkPermission(user, Resources.MEDIA, Actions.VIEW)
    const canAdd = checkPermission(user, Resources.MEDIA, Actions.ADD)
    const canDelete = checkPermission(user, Resources.MEDIA, Actions.DELETE)

    const imagesQuery = useQuery({
        queryKey: ['images'],
        queryFn: () => localApi.get('/images'),
        enabled: canView,
        staleTime: 5 * 60 * 1000,
        onError: (err) => toast.error(err?.response?.data?.message || 'Failed to fetch images'),
    });

    const uploadImage = useMutation({
        mutationFn: (data) => localApi.post('/images', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            imagesQuery.refetch();
            toast.success('Image uploaded');
        },
        onError: (err) => toast.error(err?.response?.data?.message || 'Upload failed'),
    });

    const deleteImage = useMutation({
        mutationFn: ({ publicId }) => localApi.delete('/images', { data: { publicId } }),
        enabled: canDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['images'] });
            toast.success('Image deleted');
        },
        onError: err => toast.error(err?.response?.data?.message || 'Delete failed'),
    });

    return {
        imagesQuery,
        uploadImage,
        deleteImage,
        permissions: {
            canView,
            canAdd,
            canDelete
        }
    };
};
