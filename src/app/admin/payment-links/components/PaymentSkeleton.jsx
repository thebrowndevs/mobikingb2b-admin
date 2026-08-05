import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import React from 'react'

function PaymentSkeleton() {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white shadow-md rounded-xl p-4 animate-pulse">
                    <CardContent className="p-0 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded-md" />
                                <div className="h-3 w-40 bg-gray-200 rounded-md" />
                                <div className="h-3 w-24 bg-gray-200 rounded-md" />
                            </div>
                            <div className="h-6 w-14 bg-gray-200 rounded-full" />
                        </div>

                        <Separator className="my-3" />

                        <div className="h-4 w-28 bg-gray-200 rounded-md" />
                        <div className="h-4 w-40 bg-gray-200 rounded-md" />
                        <div className="h-4 w-full bg-gray-200 rounded-md" />
                        <div className="h-3 w-36 bg-gray-100 rounded-md mt-4" />
                        <div className="h-3 w-36 bg-gray-100 rounded-md" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
export default PaymentSkeleton