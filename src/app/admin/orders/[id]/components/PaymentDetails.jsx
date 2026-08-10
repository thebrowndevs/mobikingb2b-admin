import { format } from 'date-fns'
import React from 'react'

function PaymentDetails({ order }) {
    const details = [
        { label: 'Order ID', value: order.orderId },
        { label: 'Order Type', value: order.type },
        { label: 'Order Status', value: order.status },
        // { label: 'Order Amount', value: `₹${order.orderAmount?.toLocaleString()}` },
        // { label: 'Discount', value: `₹${order.discount?.toLocaleString()}` },
        // { label: 'Delivery Charge', value: `₹${order.deliveryCharge?.toLocaleString()}` },
        { label: 'Payment Status', value: order.paymentStatus },
        { label: 'Payment Method', value: order.method },
        { label: 'Payment Mode', value: order.paymentMode },
        // { label: 'Razorpay Order ID', value: order.razorpayOrderId },
        // { label: 'Razorpay Payment ID', value: order.razorpayPaymentId },
        // { label: 'PhonePe Order ID', value: order.phonepeOrderId },
        // { label: 'PhonePe Payment ID', value: order.phonepePaymentId },
        // { label: 'PhonePe UTR', value: order.phonepeUtr },
        // { label: 'PhonePe Payment Mode', value: order.phonepePaymentMode },
        { label: 'Coupon Code', value: order.couponCode },
        { label: 'Coupon Type', value: order.couponType },
        {
            label: 'Placed On',
            value: order.createdAt
                ? format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')
                : '-'
        },
        {
            label: 'Last Updated',
            value: order.updatedAt
                ? format(new Date(order.updatedAt), 'dd MMM yyyy, hh:mm a')
                : '-'
        },
    ]

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Order Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {details.map(({ label, value }) => {
                    const isCoupon =
                        (label === 'Coupon Code' || label === 'Coupon Type') && order?.couponCode

                    return (
                        <div
                            key={label}
                            className={`${isCoupon ? 'bg-emerald-50 border border-emerald-100 rounded-xl p-4' : ''}`}
                        >
                            <span
                                className={`block text-xs font-semibold uppercase ${isCoupon ? 'text-emerald-700' : 'text-slate-400'}`}
                            >
                                {label}
                            </span>

                            <span
                                className={`mt-1.5 block text-sm font-bold ${isCoupon ? 'text-emerald-700' : 'text-slate-800'}`}
                            >
                                {value ?? "-"}
                            </span>
                        </div>
                    )
                })}
            </div>

            {order?.comments && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs">
                    <span className="block font-semibold uppercase text-slate-400">
                        Comments
                    </span>
                    <span className="mt-1 block font-medium text-slate-700 italic">
                        {order?.comments ?? "-"}
                    </span>
                </div>
            )}
        </div>
    )
}

export default PaymentDetails