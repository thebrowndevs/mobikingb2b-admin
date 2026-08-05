"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // if using classnames helper
import { IoIosRefresh } from "react-icons/io";

function RefreshButton({ queryPrefix = "", className = "" }) {
    const queryClient = useQueryClient()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)
        // Invalidate all queries that start with the prefix
        queryClient.invalidateQueries({
            predicate: (query) =>
                query.queryKey.some(key =>
                    typeof key === 'string' &&
                    key.startsWith(queryPrefix)
                )
        }).finally(() => {
            setIsRefreshing(false)
        })
    }

    return (
        <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            className={cn("p-2 h-9 w-9", className)}
            disabled={isRefreshing}
        >
            <IoIosRefresh
                className={cn(
                    "h-4 w-4 transition-transform",
                    isRefreshing && "animate-spin"
                )}
            />
        </Button>
    )
}

export default RefreshButton
