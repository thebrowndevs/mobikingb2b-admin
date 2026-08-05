// File:  store/useAuthStore.js
import { create } from "zustand";

const LOCALSTORAGE_KEY = "authState";

function loadFromLocalStorage() {
    if (typeof window === "undefined") return null;
    try {
        const str = localStorage.getItem(LOCALSTORAGE_KEY);
        if (!str) return null;
        return JSON.parse(str);
    } catch {
        return null;
    }
}

function saveToLocalStorage({ user, accessToken, refreshToken }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(
        LOCALSTORAGE_KEY,
        JSON.stringify({ user, accessToken, refreshToken })
    );
}

export const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,

    setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        saveToLocalStorage({ user, accessToken, refreshToken });
    },

    clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        if (typeof window !== "undefined") {
            localStorage.removeItem(LOCALSTORAGE_KEY);
        }
    },

    refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
            return false;
        }
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/refresh-token`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refreshToken }),
                }
            );
            if (!res.ok) {
                get().clearAuth();
                return false;
            }
            const parsed = await res.json();
            const {
                user,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            } = parsed.data;
            set({
                user,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
            saveToLocalStorage({
                user,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            });
            return true;
        } catch {
            get().clearAuth();
            return false;
        }
    },

    initializeAuth: () => {
        const saved = loadFromLocalStorage();
        if (saved && saved.user && saved.accessToken && saved.refreshToken) {
            set({
                user: saved.user,
                accessToken: saved.accessToken,
                refreshToken: saved.refreshToken,
            });
        }
    },
}));
