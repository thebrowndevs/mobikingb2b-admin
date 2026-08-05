// File:  app/admin/layout.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import LayoutDashboard from "@/components/dashboard/LayoutDashboard";
import { useAuthStore } from "@/store/useAuthStore";

function getTokenExpiry(token) {
    try {
        const payloadBase64 = token.split(".")[1];
        const decoded = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const obj = JSON.parse(decoded);
        return obj.exp;
    } catch {
        return null;
    }
}

export default function AdminLayout({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: false,
                    },
                },
            })
    );

    // 2) Grab Zustand store actions & state, plus router
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const user = useAuthStore((state) => state.user);
    const router = useRouter();

    // 3) Local UI state: whether we’re still validating auth
    const [checkingAuth, setCheckingAuth] = useState(true);

    // 4) On mount, rehydrate + validate tokens
    useEffect(() => {
        // 4a) Rehydrate from localStorage
        initializeAuth();

        // 4b) Delay a tick so that Zustand is populated
        setTimeout(async () => {
            const storedAccess = useAuthStore.getState().accessToken;
            const storedRefresh = useAuthStore.getState().refreshToken;

            // If either token is missing, we cannot proceed
            if (!storedAccess || !storedRefresh) {
                clearAuth();
                router.replace("/");
                return;
            }

            // Check access token expiry
            const exp = getTokenExpiry(storedAccess);
            const nowSec = Math.floor(Date.now() / 1000);

            if (exp && exp > nowSec) {
                // Access token still valid
                setCheckingAuth(false);
            } else {
                // Access token expired → attempt refresh
                const ok = await refreshAccessToken();
                if (!ok) {
                    clearAuth();
                    router.replace("/");
                    return;
                }
                setCheckingAuth(false);
            }
        }, 0);
    }, [initializeAuth, refreshAccessToken, clearAuth, router]);

    if (checkingAuth) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading…
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <LayoutDashboard>{children}</LayoutDashboard>
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
            <Toaster position="top-right" />
        </QueryClientProvider>
    );
}
