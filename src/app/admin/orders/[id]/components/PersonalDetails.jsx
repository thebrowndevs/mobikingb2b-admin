import { Button } from '@/components/ui/button'
import { Pencil, MapPin } from 'lucide-react'
import React, { useState } from 'react'
import PersonalDetailsDialog from './PersonalDetailsDialog'

function PersonalDetails({ order, canEdit }) {
    const [open, setOpen] = useState(false)

    const {
        name,
        phoneNo,
        email,
        address,
        address2,
        city,
        pincode,
        state,
        country
    } = order

    const personalFields = [
        ["Customer Name", name],
        ["Mobile Number", phoneNo],
        ["Address", address || "—"],
        ["Address 2", address2 || "—"],
        ["City", city || "—"],
        ["State", state || "—"],
        ["Country", country || "—"],
        ["Pincode", pincode || "—"],
        ["Email", email],
    ]

    function isEditable() {
        return order?.status === 'New' || order?.status === 'Accepted'
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex w-full justify-between items-center pb-1">
                <h2 className="text-lg font-bold text-slate-800">Personal Details</h2>
                {isEditable() && canEdit &&
                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 h-9" onClick={() => setOpen(true)}>
                        <Pencil className="h-4 w-4" /> Edit Details
                    </Button>
                }
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {personalFields.map(([label, value]) => (
                    <div key={label}>
                        <span className="block text-xs font-semibold uppercase text-slate-400">
                            {label}
                        </span>
                        <span className="mt-1.5 block text-sm font-bold text-slate-800">
                            {value ?? "—"}
                        </span>
                    </div>
                ))}
            </div>

            {order.latitude && order.longitude && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <span className="block text-xs font-semibold uppercase text-slate-400">
                        Geolocation coordinates
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-600">
                            Latitude: {order.latitude}, Longitude: {order.longitude}
                        </span>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors w-fit shadow-xs"
                        >
                            <MapPin className="w-3.5 h-3.5" /> Show in Map
                        </a>
                    </div>
                </div>
            )}

            <PersonalDetailsDialog
                open={open}
                onOpenChange={setOpen}
                user={order}
            />
        </div>
    )
}

export default PersonalDetails
