// lib/api.js
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token from Zustand & support v2 API routes
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken; // <- Get token from store
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.url && config.url.startsWith('/v2/')) {
            const origin = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
            config.baseURL = `${origin}/api/v2`;
            config.url = config.url.replace(/^\/v2\//, '/');
        } else if (config.url && config.url.startsWith('/api/v2/')) {
            const origin = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
            config.baseURL = origin;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
// api.interceptors.response.use(
//     (response) => response.data,
//     async (error) => {
//         const message = error.response?.data?.error || error.message;

//         if (error.response?.status === 403) {
//             return Promise.reject(new Error("You don’t have permission to perform this action."));
//         }

//         return Promise.reject(new Error(message));
//     }
// );

export default api;
