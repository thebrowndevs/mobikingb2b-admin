import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { usePermissions } from "./usePermissions";
import { Resources } from "@/lib/permissions";

export const useWebsiteLayout = () => {
    const queryClient = useQueryClient();
    const { checkView, checkEdit } = usePermissions();

    const canView = checkView(Resources.HOME_LAYOUT);
    const canEdit = checkEdit(Resources.HOME_LAYOUT);

    const websiteHomeQuery = useQuery({
        queryKey: ['websiteHomeAdmin'],
        enabled: canView,
        queryFn: () => api.get('/home/website/admin').then(res => res.data?.data || {}),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch Website Home Layout');
        }
    });

    const updateWebsiteHome = useMutation({
        mutationFn: (data) => api.put('/home/website/admin', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websiteHomeAdmin'] });
            toast.success('Website Layout updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update Website Layout');
        }
    });

    return {
        websiteHomeQuery,
        updateWebsiteHome,
        permissions: {
            canView,
            canEdit
        }
    };
};
