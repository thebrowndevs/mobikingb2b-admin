import PCard from '@/components/custom/PCard'
import React from 'react'
import { format } from 'date-fns'

function ShippingDetails({ order }) {
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "—"
        try {
            return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a')
        } catch {
            return dateStr // fallback if parsing fails
        }
    }

    const {
        courierName,
        awbCode,
        shippingStatus,
        shipmentId,
        shippingLabelUrl,
        shippingManifestUrl,
        pickupDate,
        pickupTokenNumber,
        courierAssignedAt,
        expectedDeliveryDate
    } = order

    console.log(order)

    const shippingFields = [
        ["Courier", courierName],
        ["AWB Code", awbCode],
        ["Status", shippingStatus],
        ["Shipment ID", shipmentId],
        ["Pickup Token", pickupTokenNumber],
        ["Pickup Date", formatDateTime(pickupDate)],
        ["Courier Assigned At", formatDateTime(courierAssignedAt)],
        ["Expected Delivery", formatDateTime(expectedDeliveryDate)],
        ["Shiprocket Shipping Label", shippingLabelUrl ? <a href={shippingLabelUrl} target="_blank" rel="noreferrer" className="text-emerald-600 bg-emerald-100 rounded-md px-3 py-1">Download</a> : "—"],
        ["Shiprocket Manifest PDF", shippingManifestUrl ? <a href={shippingManifestUrl} target="_blank" rel="noreferrer" className="text-purple-600 bg-purple-100 rounded-md px-3 py-1">Download</a> : "—"]
    ]


    return (
        <PCard>
            <div className="flex w-full justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">Shipping Details</h2>
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

export default ShippingDetails
