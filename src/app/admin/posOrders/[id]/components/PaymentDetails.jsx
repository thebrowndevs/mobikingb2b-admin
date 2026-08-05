import PCard from '@/components/custom/PCard'
import { format } from 'date-fns'
import React from 'react'

function PaymentDetails({ order }) {

    const details = [
        { label: 'Order ID', value: order.orderId },
        { label: 'Order Type', value: order.type },
        { label: 'Order Status', value: order.status },
        { label: 'Order Amount', value: `₹${order.orderAmount}` },
        { label: 'Discount', value: `₹${order.discount}` },
        { label: 'Delivery Charge', value: `₹${order.deliveryCharge}` },
        { label: 'Payment Status', value: order.paymentStatus },
        { label: 'Payment Method', value: order.method },
        { label: 'Razorpay Order ID', value: order.razorpayOrderId },
        { label: 'Razorpay Payment ID', value: order.razorpayPaymentId },
        { label: 'PhonePe Order ID', value: order.phonepeOrderId },
        { label: 'PhonePe Payment ID', value: order.phonepePaymentId },
        { label: 'PhonePe UTR', value: order.phonepeUtr },
        { label: 'PhonePe Payment Mode', value: order.phonepePaymentMode },
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

    // console.log(details)

    return (
        <PCard className={''}>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Order Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <span className="block text-xs font-medium uppercase text-gray-400">
                            {label}
                        </span>
                        <span className="mt-1 block text-base font-semibold text-gray-900">
                            {value ?? "—"}
                        </span>
                    </div>
                ))}
            </div>
            {
                order?.comments &&
                <div>
                    <span className="block text-xs font-medium uppercase text-gray-400">
                        Comments
                    </span>
                    <span className="mt-1 block text-base font-semibold text-yellow-600">
                        {order?.comments ?? "—"}
                    </span>
                </div>
            }
        </PCard>
    )
}

export default PaymentDetails
