import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const usePartialReturnRequests = () => {
    const queryClient = useQueryClient();

    const getPaginatedRequests = ({ page, limit, status, startDate, endDate, searchQuery }) => useQuery({
        queryKey: ['partialReturnRequests', page, limit, status, startDate, endDate, searchQuery],
        queryFn: () =>
            api
                .get('/v2/orders/partial-return/requests', { params: { page, limit, status, startDate, endDate, searchQuery } })
                .then(res => res.data?.data || {}),
        staleTime: 1000 * 60,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch partial return requests');
        }
    });

    const getPartialReturnRequestById = (id, enabled = true) => useQuery({
        queryKey: ['partialReturnRequest', id],
        queryFn: () => api.get(`/v2/orders/partial-return/requests/${id}`).then(res => res.data?.data?.partialRequest || res.data?.data),
        enabled: Boolean(enabled && id),
        staleTime: 0,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch request details');
        }
    });

    const raiseRequest = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/raise', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Partial return request raised successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to raise return request');
        }
    });

    const acceptRequest = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/accept', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Partial return request accepted successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to accept return request');
        }
    });

    const rejectRequest = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/reject', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Partial return request rejected successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to reject return request');
        }
    });

    const holdRequest = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/hold', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Partial return request placed on Hold successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to place request on hold');
        }
    });

    const sendReply = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/reply', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            toast.success("Message sent successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to send reply');
        }
    });

    const assignCourier = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/courier/assign', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Return courier assigned successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to assign courier');
        }
    });

    const schedulePickup = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/pickup/schedule', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Return pickup scheduled successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to schedule pickup');
        }
    });

    const reopenRequest = useMutation({
        mutationFn: (payload) => api.post('/v2/orders/partial-return/reopen', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequests'] });
            queryClient.invalidateQueries({ queryKey: ['partialReturnRequest'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Partial return request reopened successfully");
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to reopen request');
        }
    });

    return {
        getPaginatedRequests,
        getPartialReturnRequestById,
        raiseRequest,
        acceptRequest,
        rejectRequest,
        holdRequest,
        reopenRequest,
        sendReply,
        assignCourier,
        schedulePickup
    };
};
