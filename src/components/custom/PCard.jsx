import React from 'react'
import { cn } from "@/lib/utils"
import { Card } from '../ui/card'

function PCard({
    className,
    ...props
}) {
    return (
        <Card className={'rounded shadow-none border'}>
            <div className={cn("px-2 sm:px-4 lg:px-5 space-y-4 sm:space-y-6", className)} {...props} />
        </Card>
    )
}

export default PCard