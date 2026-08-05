import api from "@/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";
import { usePermissions } from "./usePermissions";
import { Resources } from "@/lib/permissions";


export const useHome = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.HOME_LAYOUT)
    const canAdd = checkAdd(Resources.HOME_LAYOUT)
    const canEdit = checkEdit(Resources.HOME_LAYOUT)
    const canDelete = checkDelete(Resources.HOME_LAYOUT)

    const homeQuery = useQuery({
        queryKey: ['home'],
        queryFn: () => api.get('/home/admin').then(res => res.data),
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch Home Layout');
        }
    })

    const updateHome = useMutation({
        mutationFn: (data) => api.put('/home/683ec8e43b89a8e66dba4274', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['home'] });
            toast.success('Home updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update home');
        }
    })

    return {
        homeQuery, updateHome,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete
        }
    }
}