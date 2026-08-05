import { useQuery } from '@tanstack/react-query';
import { Actions } from '@/lib/permissions';
import api from '@/lib/api';

export function usePermissions() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: () =>
            api.get(`/users/permissions`)
                .then(res => res?.data?.data),
        staleTime: 30 * 1000, // cache for 30 secs
    });

    const role = data?.role;
    const perms = data?.permissions || {};

    function can(resource, action) {
        if (role === 'admin') return true;
        if (role === 'employee') return !!perms[resource]?.[action];
        return false;
    }

    function onlyAdmin() {
        return role === 'admin';
    }

    return {
        isLoading,
        error,
        data: data,
        checkView: resource => can(resource, Actions.VIEW),
        checkAdd: resource => can(resource, Actions.ADD),
        checkEdit: resource => can(resource, Actions.EDIT),
        checkDelete: resource => can(resource, Actions.DELETE),
        onlyAdmin,
    };
}
