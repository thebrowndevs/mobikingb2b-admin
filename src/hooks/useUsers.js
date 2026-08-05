import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useUsers = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete, onlyAdmin } = usePermissions()

    // Permissions
    const canView = checkView(Resources.CUSTOMERS)
    const canAdd = checkAdd(Resources.CUSTOMERS)
    const canEdit = checkEdit(Resources.CUSTOMERS)
    const canDelete = checkDelete(Resources.CUSTOMERS)

    const canViewEmployee = checkView(Resources.EMPLOYEES)
    const canAddEmployee = checkAdd(Resources.EMPLOYEES)
    const canEditEmployee = checkEdit(Resources.EMPLOYEES)
    const canDeleteEmployee = checkDelete(Resources.EMPLOYEES)

    // // Get all users
    const usersQuery = ({ role = "user", page = 1, limit = 10, searchQuery, type }) => useQuery({
        queryKey: ['users', role, page, limit, searchQuery, type],
        queryFn: () => api.get(`/users/all/paginated?role=${role}&page=${page}&limit=${limit}&searchQuery=${searchQuery}&type=${type}`).then(res => res.data),
        keepPreviousData: true,
        enabled: canView,
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch users');
        },
    });

    // get all users
    const allUsersQuery = useQuery({
        queryKey: ['allUsers'],
        queryFn: () => api.get(`/users/role/user`).then(res => res.data),
        enabled: canView,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch users');
        },
    });

    // Get all employees
    const employeesQuery = ({ role, page, limit, }) => useQuery({
        queryKey: ['employees', role, page, limit],
        queryFn: () => api.get(`/users/all/paginated?role=${role}&page=${page}&limit=${limit}`).then(res => res.data),
        keepPreviousData: true,
        enabled: canView,
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch employees');
        },
    });

    // Create User mutation
    const createUser = useMutation({
        mutationFn: (data) => api.post('/users/createUser', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create User');
        }
    });

    // // Update User mutation
    const updateUser = useMutation({
        mutationFn: ({ id, data }) => api.put(`/users/employees/${id}`, data),
        enabled: canEdit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update User');
        }
    });

    // // Delete User mutation
    const deleteUser = useMutation({
        mutationFn: (id) => api.delete(`/users/employees/${id}`),
        enabled: canDelete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to delete User');
        }
    });

    // // change password
    // const changePassword = useMutation({
    //     mutationFn: ({ id, currentPassword, newPassword, confirmNewPassword }) =>
    //         api.patch(`/users/${id}/password`, { currentPassword, newPassword, confirmNewPassword }),
    //     enabled: onlyAdmin,
    //     onSuccess: () => {
    //         toast.success('Password changed successfully');
    //     },
    //     onError: err => {
    //         toast.error(err.response?.data?.message || 'Failed to change password');
    //     }
    // });

    // Create User mutation
    const createCustomer = useMutation({
        mutationFn: (data) => api.post('/users/createCustomer', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Customer created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create customer');
        }
    });

    // get single user by Id
    const getSingleUserQuery = (id) =>
        useQuery({
            queryKey: ["singleUser", id],
            queryFn: async () => {
                const res = await api.get(`/users/customer/id/${id}`);
                const data = res.data;

                if (!data || data.message === "User not found") {
                    throw new Error("User not found");
                }

                return data;
            },
            staleTime: 1000 * 60 * 5,
            onError: (err) => {
                toast.error(err?.response?.data?.message || "Failed to fetch User");
            },
        });

    return {
        usersQuery,
        createUser,
        updateUser,
        deleteUser,
        employeesQuery,
        allUsersQuery,
        // changePassword,
        getSingleUserQuery,
        createCustomer,
        permissions: {
            canView,
            canAdd,
            canDelete,
            canEdit,
            canViewEmployee,
            canAddEmployee,
            canDeleteEmployee,
            canEditEmployee,
            onlyAdmin
        }
    };
};
