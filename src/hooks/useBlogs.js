import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Actions, Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useBlogs = (params = {}) => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions();

    // Permissions
    const canView = checkView(Resources.BLOGS);
    const canAdd = checkAdd(Resources.BLOGS);
    const canEdit = checkEdit(Resources.BLOGS);
    const canDelete = checkDelete(Resources.BLOGS);

    const blogsQuery = useQuery({
        queryKey: ['blogs', params],
        queryFn: () => {
            const cleanParams = {
                status: 'all',
                page: '1'
            };
            Object.keys(params).forEach(key => {
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    cleanParams[key] = params[key];
                }
            });
            const queryParams = new URLSearchParams(cleanParams).toString();
            return api.get(`/blogs?${queryParams}`).then(res => res.data);
        },
        staleTime: 1000 * 60 * 5,
        enabled: canView,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch blogs');
        }
    });

    // Create Blog mutation
    const createBlog = useMutation({
        mutationFn: (data) => api.post('/blogs/create', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog post created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create blog');
        }
    });

    // Update Blog mutation
    const updateBlog = useMutation({
        mutationFn: ({ id, data }) => api.put(`/blogs/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog post updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update blog');
        }
    });

    // Delete Blog mutation
    const deleteBlog = useMutation({
        mutationFn: (id) => api.delete(`/blogs/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
            toast.success('Blog post deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete blog');
        }
    });

    return {
        blogsQuery,
        createBlog,
        updateBlog,
        deleteBlog,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        }
    };
};

export const useBlogById = (id) => {
    return useQuery({
        queryKey: ['blog', id],
        queryFn: () => api.get(`/blogs/view/${id}`).then(res => res.data?.data),
        enabled: !!id,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch blog details');
        }
    });
};
