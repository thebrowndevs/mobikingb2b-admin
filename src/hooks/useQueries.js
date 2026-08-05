import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";
import { usePermissions } from "./usePermissions";
import { Resources } from "@/lib/permissions";


export const useQueries = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Orders Permissions
    const canView = checkView(Resources.QUERIES);
    const canAdd = checkAdd(Resources.QUERIES);
    const canEdit = checkEdit(Resources.QUERIES);
    const canDelete = checkDelete(Resources.QUERIES);

    const queriesQuery = useQuery({
        queryKey: ['queries'],
        queryFn: () => api.get('/queries').then(res => res.data),
        staleTime: 1000 * 60,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch queries');
        }
    });

    const getQueryById = (queryId, enabled) => useQuery({
        queryKey: ['query', queryId],
        queryFn: () => api.get(`/queries/${queryId}`).then(res => res.data?.data || res.data),
        enabled: Boolean(enabled && queryId),
        staleTime: 0,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch query details');
        }
    });

    const getQueriesByDate = ({ page, limit, startDate, endDate, searchQuery }) => useQuery({
        queryKey: ['queries', startDate, endDate, searchQuery, page, limit],
        queryFn: () =>
            api
                .get('/queries/all/paginated', { params: { page, limit, startDate, endDate, searchQuery } })
                .then(res => {
                    return Array.isArray(res.data)
                        ? res.data
                        : res.data.data || []
                }),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch orders');
            console.log(err)
        }
    });

    const assignQueries = useMutation({
        mutationFn: (data) => api.post('/queries/assign', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queries'] });
            toast.success("Queries Assigned Successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to assign queries');
        }
    })

    const sendReply = useMutation({
        mutationFn: (data) => api.post('/queries/reply', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queries'] });
            toast.success("Reply sent successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to send reply.');
        }
    })

    const closeQuery = useMutation({
        mutationFn: (data) => api.post('/queries/close', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['queries'] });
            toast.success("Query Close successfully")
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to Close Query.');
        }
    })

    return {
        queriesQuery,
        assignQueries,
        sendReply,
        closeQuery,
        getQueriesByDate,
        getQueryById,
        permissions: { canView, canAdd, canEdit, canDelete },
    }
}