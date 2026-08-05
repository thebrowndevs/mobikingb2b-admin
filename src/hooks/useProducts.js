import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Resources } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

export const useProducts = () => {
    const queryClient = useQueryClient();
    const { checkView, checkAdd, checkEdit, checkDelete } = usePermissions()

    // Permissions
    const canView = checkView(Resources.PRODUCTS)
    const canAdd = checkAdd(Resources.PRODUCTS)
    const canEdit = checkEdit(Resources.PRODUCTS)
    const canDelete = checkDelete(Resources.PRODUCTS)

    // Get all products
    const productsQuery = useQuery({
        queryKey: ['products'],
        enabled: canView,
        queryFn: () => api.get(`/products`).then((res) => res.data.data),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch products');
        }
    });

    const availableProductsQuery = useQuery({
        queryKey: ['availableProducts'],
        queryFn: () => api.get('/products/available').then((res) => res.data.data),
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch products');
        }
    });

    const productsPaginationQuery = (params) => {
        // Filter out undefined or null params
        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        return useQuery({
            queryKey: ['productsPagination', filteredParams],
            queryFn: () => api.get(`/products/admin/paginated`, { params: filteredParams, }).then((res) => res.data.data),
            keepPreviousData: true,
            staleTime: 1000 * 60 * 5,
            onError: (err) => {
                toast.error(err?.response?.data?.message || 'Failed to fetch products');
            }
        });
    };

    const getProductQuery = (slug) => useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const res = await api.get(`/products/details/${slug}`);
            const data = res.data;

            if (!data || data.message === 'Sub Service not found') {
                throw new Error('Service not found');
            }

            return data;
        },
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch service');
        }
    });

    const getStockHistoryByProductQuery = (id, params = {}) => useQuery({
        queryKey: ['stock', id, params],
        queryFn: async () => {
            const res = await api.get(`/products/stock/${id}`, { params });
            const data = res.data?.data;
            // console.log("Stock History ",data);

            if (!data || data.message === 'Stock History not found') {
                throw new Error('Stock History not found');
            }

            return data;
        },
        staleTime: 1000 * 60 * 5,
        keepPreviousData: true,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch Stock History');
        }
    });

    const getProductByIdQuery = (id) => useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
            const data = res.data;

            if (!data || data.message === 'Product not found') {
                throw new Error('Product not found');
            }

            return data;
        },
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch service');
        }
    });

    const getProductOrdersQuery = (id, page = 1, limit = 10) => useQuery({
        queryKey: ['productOrders', id, page, limit],
        queryFn: async () => {
            const res = await api.get(`/products/orders/${id}`, {
                params: { page, limit }
            });
            return res.data?.data;
        },
        staleTime: 1000 * 60 * 5,
        keepPreviousData: true,
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to fetch product orders');
        }
    });

    // Create Product mutation
    const createProduct = useMutation({
        mutationFn: (data) => api.post('/products/createProduct', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            toast.success('Product created successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to create Product');
        }
    });

    // Update Product mutation
    const updateProduct = useMutation({
        mutationFn: ({ id, data }) => api.put(`/products/${id}`, data),
        enabled: canEdit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            toast.success('Product updated successfully');
        },
        onError: (err) => {
            console.log(err)
            toast.error(err?.response?.data?.message || 'Failed to update Product');
        }
    });

    const addProductStock = useMutation({
        mutationFn: (data) => api.post(api.defaults.baseURL.replace('/v1', '/v2') + '/products/addProductStock', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            // queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Stock Added successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to add stock.');
        }
    });

    const bulkUpdateProductStock = useMutation({
        mutationFn: (data) => api.post(api.defaults.baseURL.replace('/v1', '/v2') + '/products/bulkUpdateProductStock', data),
        enabled: canAdd,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            // queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Bulk Stock updated successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to bulk update stock.');
        }
    });

    const markProductChecked = useMutation({
        mutationFn: ({ id }) => api.put(`/products/check/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            queryClient.invalidateQueries({ queryKey: ['stock'] });
            // queryClient.invalidateQueries({ queryKey: ['product'] });
            toast.success('Product checked successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to check product.');
        }
    })

    const updateProductStatus = useMutation({
        mutationFn: ({ data, id }) => api.put(`/products/status/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productsPagination'] });
            // toast.success('Stock Added successfully');
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || 'Failed to update status.');
        }
    })

    // Delete Product mutation
    // const deleteProduct = useMutation({
    //     mutationFn: (id) => api.delete(`/products/${id}`),
    //     enabled: canDelete,
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['products'] });
    //         toast.success('Product deleted successfully');
    //     },
    //     onError: (err) => {
    //         toast.error(err?.response?.data?.message || 'Failed to delete Product');
    //     }
    // });

    return {
        productsQuery, createProduct, getProductQuery,
        updateProduct, markProductChecked, addProductStock, bulkUpdateProductStock, getStockHistoryByProductQuery,
        // deleteProduct,
        productsPaginationQuery, updateProductStatus, availableProductsQuery, getProductByIdQuery,
        getProductOrdersQuery,
        permissions: {
            canView,
            canAdd,
            canEdit,
            canDelete,
        }
    };
};
