"use client";
import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading...", visible = true }) {
    if (!visible) return null;

    return (
        <div className="flex flex-col items-center justify-center bg-transparent backdrop-blur-sm h-[50vh] dark:bg-gray-900/80">
            <div className="relative flex items-center justify-center">
                {/* Outer gradient ring */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-purple-600 animate-spin"></div>
                {/* Inner spinner icon */}
                <Loader2 className="w-16 h-16 text-gray-300" />
            </div>
            {label && (
                <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
}
