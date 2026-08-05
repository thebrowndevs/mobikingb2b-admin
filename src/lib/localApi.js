// lib/api.js
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const localAPI = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add token from Zustand
localAPI.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken; // <- Get token from store
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
localAPI.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const message = error.response?.data?.error || error.message;

        if (error.response?.status === 403) {
            return Promise.reject(new Error("You don’t have permission to perform this action."));
        }

        return Promise.reject(new Error(message));
    }
);

export default localAPI;
