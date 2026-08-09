// File: src/components/dashboard/Sidebar.jsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, LayoutGrid, ShoppingBag, FolderCog, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from "@/components/ui/dialog";
import { IMAGES } from "@/lib/constants/assets";
import { ADMIN_SIDEBAR_LINKS } from "@/lib/constants/sidebarLinks";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissions } from "@/hooks/usePermissions";
import SidebarSkeleton from "../custom/SidebarSkeleton";
import LoaderButton from "../custom/LoaderButton";

// Define logical groups for links to make the sidebar clean and premium
const GROUPS = [
    {
        title: "Overview & Sales",
        icon: <ShoppingBag className="w-4 h-4 text-indigo-500" />,
        keys: ["dashboard", "pos", "posOrders", "manual-order", "orders", "return-requests", "partial-return-requests", "cancel-requests", "queries", "payment-links"]
    },
    {
        title: "Catalog",
        icon: <LayoutGrid className="w-4 h-4 text-emerald-600" />,
        keys: ["categories", "subCategories", "products", "brands", "couponCodes"]
    },
    {
        title: "Design & Layouts",
        icon: <Paintbrush className="w-4 h-4 text-pink-500" />,
        keys: ["design-studio", "websiteLayout", "appLayout"]
    },
    {
        title: "Operations & Config",
        icon: <FolderCog className="w-4 h-4 text-violet-600" />,
        keys: ["customers", "employees", "notifications", "reports", "policies", "blogs", "settings"]
    }
];

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

    function onLinkClick() {
        setIsSidebarOpen(false);
    }

    async function handleLogout() {
        clearAuth();
        router.push('/');
    }

    // Group the allowed links
    const groupedLinks = GROUPS.map(group => {
        const links = allowedLinks.filter(link => group.keys.includes(link.key));
        return {
            ...group,
            links
        };
    }).filter(group => group.links.length > 0);

    // Handle any links that didn't fit into groups
    const categorizedKeys = GROUPS.flatMap(g => g.keys);
    const miscellaneousLinks = allowedLinks.filter(link => !categorizedKeys.includes(link.key));

    if (miscellaneousLinks.length > 0) {
        groupedLinks.push({
            title: "Other Actions",
            icon: <FolderCog className="w-4 h-4 text-amber-500" />,
            links: miscellaneousLinks
        });
    }

    return (
        <div
            className={`
                max-[1024px]:max-w-64 max-[1024px]:absolute
                ${!isOpen ? "-left-full" : "left-0"}
                max-[1024px]:top-0 lg:w-[17.5rem] h-screen max-h-screen 
                bg-back2 border-r border-bdr2
                overflow-hidden text-slate-700                flex flex-col transition-all duration-500 ease-in-out z-[100]
            `}
        >
            {/* Logo Section with text */}
            <div className="w-full pt-3 pb-2 px-6 border-b border-bdr2 bg-back1 flex items-center justify-start">
                <div className="flex items-center gap-1 hover:scale-[1.02] transition-transform duration-300 relative group cursor-pointer">
                    <Image
                        src={"/logo1.png"}
                        alt="logo"
                        height={36}
                        width={36}
                        className="object-contain relative rounded-lg"
                        priority
                    />
                    <span className="font-extrabold text-xl text-slate-800 tracking-tighter font-sans">
                        Mobiking B2B
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="py-4"><SidebarSkeleton /></div>
                ) : (
                    groupedLinks.map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                            {/* Group Title */}
                            <div className="flex items-center gap-2 px-3 mb-2">
                                {group.icon}
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {group.title}
                                </span>
                            </div>

                            {/* Group Links */}
                            <div className="space-y-1">
                                {group.links.map(({ href, label, icon }) => {
                                    const rootPath = `/${href.split("/")[1]}`;
                                    const isActive = href === rootPath ? pathname === rootPath : pathname === href;

                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            onClick={onLinkClick}
                                            className={`
                                                group flex items-center justify-between px-3 py-2 rounded-lg
                                                transition-all duration-200 relative overflow-hidden
                                                ${isActive
                                                    ? "bg-sidebar-active text-indigo-600 font-semibold border-l-2 border-indigo-600"
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-sidebar-hover hover:translate-x-1"
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`
                                                        p-1.5 rounded-md transition-colors duration-200
                                                        ${isActive
                                                            ? "bg-indigo-50 text-indigo-600"
                                                            : "bg-slate-50 text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800"
                                                        }
                                                    `}
                                                >
                                                    <span className="text-sm">{icon}</span>
                                                </span>
                                                <span className="text-xs font-medium tracking-wide">
                                                    {label}
                                                </span>
                                            </div>

                                            {/* Glowing Dot for active link */}
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_6px_rgba(79,70,229,0.6)]" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Profile & Action Section with Modern Container */}
            <div className="p-4 border-t border-bdr2 bg-back1">
                <div className="flex items-center gap-3 p-2.5 bg-back2 rounded-xl border border-bdr2 hover:border-slate-300 transition-colors">
                    <div className="relative">
                        <Image
                            src={IMAGES.AVATAR}
                            alt="User"
                            width={38}
                            height={38}
                            className="rounded-full ring-2 ring-indigo-500/10"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-back2 shadow-sm" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold capitalize text-slate-850 truncate">
                            {user?.role || "User"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                            {user?.email || "email@admin.com"}
                        </p>
                    </div>
                </div>

                {/* Logout Button & Confirmation Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full mt-3 bg-back2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-bdr2 text-slate-700 transition-all duration-200 flex items-center justify-center gap-2 rounded-lg py-2">
                            <LogOut className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Logout</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-back2 border border-bdr2 text-slate-800">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900">Confirm Logout</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Are you sure you want to log out from the e-commerce dashboard?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <LoaderButton variant="destructive" onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                                Yes, log out
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
