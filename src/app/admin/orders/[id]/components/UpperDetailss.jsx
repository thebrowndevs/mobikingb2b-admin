import React, { useState } from 'react'
import { BsPencil } from 'react-icons/bs'
import PaymentMethodDialog from '@/components/PaymentMethodDialog'
import PaymentUpdateDialog from '@/components/PaymentUpdateDialog'

const STATUS_CLASSES = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Hold: 'bg-purple-100 text-purple-800 border-purple-200',
    Shipped: 'bg-amber-100 text-amber-800 border-amber-200',
    Delivered: 'bg-teal-100 text-teal-800 border-teal-200',
    Cancelled: 'bg-slate-100 text-slate-800 border-slate-200',
    Returned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Replaced: 'bg-violet-100 text-violet-800 border-violet-200',
}

export default function UpperDetailss({ order, admin, canEdit }) {
    const [updatePayment, setUpdatePayment] = useState(false)
    const [updateMethod, setUpdateMethod] = useState(false)

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-slate-400">Order ID</span>
                    <span className="mt-2 text-lg font-bold text-slate-800">{order?.orderId}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-slate-400">Order Status</span>
                    <span className="mt-2 text-lg font-bold text-slate-800">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[order.status] || 'bg-slate-100 text-slate-800'}`}>
                            {order.status}
                        </span>
                    </span>
                    {(order.status === 'Rejected' || order.status === 'Cancelled') &&
                        <span className='mt-2 text-xs font-bold text-red-500 italic'>"{order?.reason}"</span>
                    }
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-slate-400">Type</span>
                    <span className="mt-2 text-lg font-bold text-slate-800">{order?.type}</span>
                    {order?.type === 'Regular' &&
                        <span className="text-xs font-semibold text-slate-500">{order?.isAppOrder ? "App" : "Website"}</span>
                    }
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <div className='flex items-center justify-between w-full'>
                        <span className="text-xs font-semibold uppercase text-slate-400">Payment Method</span>
                        {admin &&
                            <div className='px-1.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100'
                                onClick={() => {
                                    setUpdateMethod(true)
                                }}
                            >
                                <BsPencil size={12} />
                            </div>
                        }
                    </div>
                    <span className="mt-2 text-lg font-bold text-slate-800">{order?.method}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <div className='flex items-center justify-between w-full'>
                        <span className="text-xs font-semibold uppercase text-slate-400">Payment Status</span>
                        {canEdit &&
                            <div className='px-1.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100'
                                onClick={() => {
                                    setUpdatePayment(true)
                                }}
                            >
                                <BsPencil size={12} />
                            </div>
                        }
                    </div>
                    <span className="mt-2 text-lg font-bold text-slate-800">{order?.paymentStatus}</span>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-slate-400">Order Amount</span>
                    <span className="mt-2 text-lg font-bold text-slate-800">₹{order?.orderAmount?.toLocaleString()}</span>
                </div>
            </div>
            <PaymentMethodDialog
                open={updateMethod}
                onOpenChange={setUpdateMethod}
                order={order}
            />
            <PaymentUpdateDialog
                open={updatePayment}
                onOpenChange={setUpdatePayment}
                order={order}
            />
        </div>
    )
}
