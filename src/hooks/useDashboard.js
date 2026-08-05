// hooks/useDashboard.js
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Total Orders
export const useTotalOrders = () => {
    return useQuery({
        queryKey: ["dashboard-orders", "orders", "count"],
        queryFn: async () => {
            const res = await api.get("/reports/orders/count").then(res => res.data);
            return res.data;
        },
        staleTime: 20 * 1000,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch data');
        },
    });
};

// Total Customers
export const useTotalCustomers = () => {
    return useQuery({
        queryKey: ["dashboard-totalCustomers", "customers", "count"],
        queryFn: async () => {
            const res = await api.get("/reports/customers/count").then(res => res.data);
            return res.data;
        },
        staleTime: 20 * 1000,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch data');
        },
    });
};

// Total Sales
export const useTotalSales = () => {
    return useQuery({
        queryKey: ["dashboard-sales", "sales", "count"],
        queryFn: async () => {
            const res = await api.get("/reports/sales/total").then(res => res.data);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 mins (optional)
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch data');
        },
    });
};

// Sales of One Day
export const useSalesOfOneDay = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dashboard-salesByDay', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('reports/sales/custom', {
                params: { startDate, endDate }
            }).then(res => res.data)
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message)
        }
    })
}

// Sales of by dates
export const useSalesByFilterDates = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dashboard-salesByFilterDates', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('reports/sales', {
                params: { startDate, endDate }
            }).then(res => res.data)
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message)
        }
    })
}

// customers count for chart
export const useCustomerCount = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dashboard-customersCount', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('reports/customers', {
                params: { startDate, endDate }
            }).then(res => res.data)
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000,
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message)
        }
    })
}

// orders count for chart
export const useOrderCount = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dashboard-ordersCount', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('reports/orders', {
                params: { startDate, endDate }
            }).then(res => res.data)
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000,
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message)
        }
    })
}

// filtered orders
export const useFilteredOrderCount = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dashboard-filteredOrdersCount', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('reports/orders/filtered', {
                params: { startDate, endDate }
            }).then(res => res.data)
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 60 * 1000,
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message)
        }
    })
}