import PCard from '@/components/custom/PCard'
import React from 'react'
import { formatINRCurrency } from './../../../../lib/services/formatters';

function AmountCards({ data }) {
    if (!data) return null

    const cards = [
        {
            title: 'Total Orders',
            count: data?.allOrder?.count,
            amount: data?.allOrder?.sales
        },
        {
            title: 'Website Orders',
            count: data?.websiteOrder?.count,
            amount: data?.websiteOrder?.sales
        },
        {
            title: 'App Orders',
            count: data?.appOrder?.count,
            amount: data?.appOrder?.sales
        },
        {
            title: 'POS Orders',
            count: data?.posOrder?.count,
            amount: data?.posOrder?.sales
        },
        {
            title: 'COD Orders',
            count: data?.codOrder?.count,
            amount: data?.codOrder?.sales
        },
        {
            title: 'Online Orders',
            count: data?.onlineOrder?.count,
            amount: data?.onlineOrder?.sales
        },
        {
            title: 'Cash Orders',
            count: data?.cashOrder?.count,
            amount: data?.cashOrder?.sales
        },
        {
            title: 'UPI Orders',
            count: data?.upiOrder?.count,
            amount: data?.upiOrder?.sales
        },
    ]

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center mt-6'>
            {cards.map(({ title, count, amount }) => (
                <PCard key={title} className='flex justify-between items-center px-4'>
                    <div className='mb-0'>
                        <p className='text-xl font-bold'>{count || 0}</p>
                        <p className='text-gray-500 text-sm'>{title}</p>
                    </div>
                    <div>
                        <p className='text-xl font-bold'>{formatINRCurrency(amount) || 0}</p>
                        <p className='text-gray-500 text-sm'>Amount</p>
                    </div>
                </PCard>
            ))}
        </div>
    )
}

export default AmountCards
