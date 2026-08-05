// File: app/components/Sidebar.jsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { IMAGES } from "@/lib/constants/assets";
import { ADMIN_SIDEBAR_LINKS } from "@/lib/constants/sidebarLinks";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import SidebarSkeleton from "../custom/SidebarSkeleton";
import LoaderButton from "../custom/LoaderButton";

export default function Sidebar({ isOpen, setIsSidebarOpen }) {
    const { data, isLoading, error } = usePermissions();
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const role = data?.role;
    const perms = data?.permissions || {};

    function can(resource, action) {
        if (role === 'admin') return true;
        if (role === 'employee') return !!perms?.[resource]?.[action];
        return false;
    }

    const allowedLinks = ADMIN_SIDEBAR_LINKS.filter(link => can(link.key, 'view'));

    // console.log(user)

    function onLinkClick() {
        setIsSidebarOpen(false);
    }

    async function handleLogout() {
        clearAuth();
        router.push('/')
        // try {
        //     const res = await fetch(
        //         process.env.NEXT_PUBLIC_BACKEND_URL + "/users/logout",
        //         {
        //             method: "POST",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify(''),
        //         });

        //     const data = await res.json();
        //     if (res.ok && data.success) {
        //         clearAuth();
        //         router.replace("/");
        //     } else {
        //         console.error("Logout failed:", data);
        //     }
        // } catch (err) {
        //     console.error("Logout error:", err);
        // }
    }

    return (
        <div
            className={`
        max-[1024px]:max-w-58 max-[1024px]:absolute
        ${!isOpen ? "-left-full" : "left-0"}
        max-[1024px]:top-0 lg:w-[16rem] h-screen max-h-screen bg-gray-900
        overflow-auto text-gray-100 border-r border-gray-700
        shadow-xl flex flex-col items-center gap-2 px-3 py-2
        transition-all duration-500 ease-in-out z-[100]
      `}
        >
            {/* Logo Section */}
            <div className="w-full pt-4 pb-4 px-4 hover:scale-[1.02] transition-transform duration-300">
                <Image
                    src={"/logoWhite.png"}
                    alt="logo"
                    height={160}
                    width={160}
                    className="object-contain"
                />
            </div>

            {/* Navigation Links */}
            {isLoading ? <div><SidebarSkeleton /></div>
                : <div className="w-full flex flex-col gap-3 transition-all duration-300 ease-in-out">
                    {allowedLinks.map(({ href, label, icon }) => {
                        const rootPath = `/${href.split("/")[1]}`;
                        const isActive =
                            href === rootPath ? pathname === rootPath : pathname === href;

                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onLinkClick}
                                className={`
                group flex items-center gap-4 px-4 py-2 rounded-lg
                transition-all duration-300
                ${isActive
                                        ? "bg-gray-700 shadow-md text-white"
                                        : "hover:bg-gray-800 hover:translate-x-1 text-gray-300 hover:text-white"
                                    }
              `}
                            >
                                <span
                                    className={`
                  p-2 rounded-lg ${isActive ? "bg-white/10" : "bg-gray-800 group-hover:bg-gray-700"
                                        }
                `}
                                >
                                    <span className="text-sm text-gray-100">{icon}</span>
                                </span>
                                <span className="text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            }

            {/* Profile Section */}
            <div className="mt-auto w-full border-t border-gray-700 pt-6">
                <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <Image
                        src={IMAGES.AVATAR}
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-gray-400"
                    />
                    <div className="">
                        <p className="text-sm font-medium capitalize text-gray-100">
                            {user.role || "User"}
                        </p>
                        <p className="text-xs text-gray-400 ">
                            {user.email || "email@admin.com"}
                        </p>
                    </div>
                </div>

                {/* Logout Button & Confirmation Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-100 transition-colors flex items-center justify-center">
                            <LogOut className="mr-2 h-4 w-4 text-red-400" />
                            <span className="">Logout</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Logout</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to log out?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <LoaderButton variant="destructive" onClick={handleLogout}>
                                Yes, log out
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
