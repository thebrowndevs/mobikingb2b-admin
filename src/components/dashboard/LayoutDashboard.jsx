"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { X, Menu } from "lucide-react";
import Image from "next/image";

function LayoutDashboard({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <main className="flex flex-col lg:flex-row h-screen overflow-hidden bg-back1">
            {/* Mobile Header Bar */}
            <div className="flex px-6 py-4 justify-between items-center bg-back2 border-b border-bdr2 shadow-sm gap-3 lg:hidden z-50">
                <div className="flex items-center gap-3 relative">
                    <Image
                        height={32}
                        width={32}
                        src={"/logo1.png"}
                        alt="logo"
                        className="object-contain rounded-lg"
                        priority
                    />
                    <span className="font-extrabold text-base text-slate-800 tracking-tight font-sans">
                        Mobiking B2B
                    </span>
                </div>

                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors duration-200"
                    aria-label="Toggle Menu"
                >
                    {sidebarOpen ? (
                        <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
                    ) : (
                        <Menu className="w-6 h-6 transition-transform duration-300" />
                    )}
                </button>
            </div>

            {/* Sidebar wrapper */}
            <div className="relative z-40">
                <Sidebar isOpen={sidebarOpen} setIsSidebarOpen={setSidebarOpen} />
            </div>

            {/* Main Content Area */}
            <div
                className="bg-back3 flex-1 min-h-0 overflow-auto transition-colors duration-300"
                onClick={() => setSidebarOpen(false)}
            >
                {children}
            </div>
        </main>
    );
}

export default LayoutDashboard;