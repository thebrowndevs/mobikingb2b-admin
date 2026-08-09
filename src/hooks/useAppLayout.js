import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usePermissions } from "./usePermissions";
import { Resources } from "@/lib/permissions";

export const useAppLayout = () => {
    const queryClient = useQueryClient();
    const { checkView, checkEdit } = usePermissions();

    const canView = checkView(Resources.HOME_LAYOUT);
    const canEdit = checkEdit(Resources.HOME_LAYOUT);

    const appTabsQuery = useQuery({
        queryKey: ['appTabsAdmin'],
        enabled: canView,
        queryFn: () => api.get('/home/app/tabs/admin').then(res => res.data?.data || []),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch App Tabs');
        }
    });

    const createAppTab = useMutation({
        mutationFn: (data) => api.post('/home/app/tabs/admin', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appTabsAdmin'] });
            toast.success('App Tab created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create App Tab');
        }
    });

    const updateAppTab = useMutation({
        mutationFn: ({ tabId, data }) => api.put(`/home/app/tabs/${tabId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appTabsAdmin'] });
            toast.success('App Tab updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update App Tab');
        }
    });

    const deleteAppTab = useMutation({
        mutationFn: (tabId) => api.delete(`/home/app/tabs/${tabId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appTabsAdmin'] });
            toast.success('App Tab deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete App Tab');
        }
    });

    const reorderAppTabs = useMutation({
        mutationFn: (orderedIds) => api.put('/home/app/tabs/reorder', { orderedIds }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appTabsAdmin'] });
            toast.success('Tabs reordered successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to reorder App Tabs');
        }
    });

    return {
        appTabsQuery,
        createAppTab,
        updateAppTab,
        deleteAppTab,
        reorderAppTabs,
        permissions: {
            canView,
            canEdit
        }
    };
};
