import PCard from '@/components/custom/PCard'
import React from 'react'
import { format } from 'date-fns'

function ReturnShippingDetails({ order }) {

    const returnData = order?.returnData || {}

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "—"
        try {
            return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a')
        } catch {
            return dateStr
        }
    }

    const {
        courier_name,
        awb_code,
        shippingStatus,
        shipment_id,
        pickup_scheduled_date,
        assigned_date_time,
        expectedDeliveryDate,
        status,
        status_code,
        orderId,
        isReturnInitiated
    } = returnData

    const shippingFields = [
        ["Return Order ID", orderId],
        ["Shipment ID", shipment_id],
        ["Courier", courier_name],
        ["AWB Code", awb_code],
        ["Return Status", shippingStatus || status],
        // ["Status Code", status_code],
        // ["Return Initiated", isReturnInitiated ? "Yes" : "No"],
        ["Courier Assigned At", formatDateTime(assigned_date_time?.date)],
        ["Pickup Scheduled Date", pickup_scheduled_date],
        ["Expected Delivery", formatDateTime(expectedDeliveryDate)]
    ]

    return (
        <PCard>
            <div className="flex w-full justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">
                    Return Shipping Details
                </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {shippingFields.map(([label, value]) => (
                    <div key={label}>
                        <span className="block text-xs font-medium uppercase text-gray-400">
                            {label}
                        </span>
                        <span className="mt-1 block text-base font-semibold text-gray-900 break-words">
                            {value ?? "—"}
                        </span>
                    </div>
                ))}
            </div>
        </PCard>
    )
}

export default ReturnShippingDetails