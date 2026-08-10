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

    const shippingFields = [
        ["Courier", courierName],
        ["AWB Code", awbCode],
        ["Status", shippingStatus],
        ["Shipment ID", shipmentId],
        ["Pickup Token", pickupTokenNumber],
        ["Pickup Date", formatDateTime(pickupDate)],
        ["Courier Assigned At", formatDateTime(courierAssignedAt)],
        ["Expected Delivery", formatDateTime(expectedDeliveryDate)],
        ["Shiprocket Shipping Label", shippingLabelUrl ? <a href={shippingLabelUrl} target="_blank" rel="noreferrer" className="text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 px-3 py-1 font-semibold text-xs shadow-xs hover:bg-emerald-100 transition-colors">Download</a> : "—"],
        ["Shiprocket Manifest PDF", shippingManifestUrl ? <a href={shippingManifestUrl} target="_blank" rel="noreferrer" className="text-indigo-650 bg-indigo-50 rounded-lg border border-indigo-100 px-3 py-1 font-semibold text-xs shadow-xs hover:bg-indigo-100 transition-colors">Download</a> : "—"]
    ]

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex w-full justify-between items-center pb-1">
                <h2 className="text-lg font-bold text-slate-800">Shipping Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {shippingFields.map(([label, value]) => (
                    <div key={label}>
                        <span className="block text-xs font-semibold uppercase text-slate-400">
                            {label}
                        </span>
                        <span className="mt-1.5 block text-sm font-bold text-slate-800 break-words">
                            {value ?? "—"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ShippingDetails
