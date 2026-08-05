import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { usePermissions } from "./usePermissions"
import { Resources } from "@/lib/permissions"

export const usePolicies = () => {
    const queryClient = useQueryClient()
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.POLICIES)
    const canAdd = checkAdd(Resources.POLICIES)
    const canEdit = checkEdit(Resources.POLICIES)
    const canDelete = checkDelete(Resources.POLICIES)

    const policyQuery = useQuery({
        queryKey: ['policies'],
        enabled: canView,
        queryFn: () => api.get('/policy').then(res => res.data),
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Error in loading data');
        }
    })

    const createPolicy = useMutation({
        mutationFn: (data) => api.post('/policy', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create Policy');
        }
    })

    const updatePolicy = useMutation({
        mutationFn: ({ id, data }) => api.put(`/policy/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policies'] });
            toast.success('Policy updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update Policy');
        }
    })

    return {
        policyQuery,
        createPolicy,
        updatePolicy,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete,
        }
    }
}