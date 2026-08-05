import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function SidebarSkeleton() {
    return (
        <div className="w-full flex flex-col gap-3 transition-all duration-300 ease-in-out">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-gray-700 animate-pulse"></div>
                    <div className="flex-1 w-40">
                        <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: `${70 + (i * 5)}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SidebarSkeleton;
