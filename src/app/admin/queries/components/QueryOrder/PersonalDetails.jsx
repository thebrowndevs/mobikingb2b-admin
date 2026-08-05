import React from 'react'
import PCard from '@/components/custom/PCard'

function PersonalDetails({ order }) {
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

    // ✅ Construct full address string
    const fullAddress = [
        address,
        address2,
        city,
        state,
        country,
        pincode
    ]
        .filter(Boolean)
        .join(', ')

    const personalFields = [
        ["Customer Name", name],
        ["Mobile Number", phoneNo],
        ["Email", email],
        ["Address", fullAddress || "—"]
    ]

    return (
        <PCard>
            <div className="flex w-full justify-between items-center">
                <h2 className=" text-lg font-semibold text-gray-700">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {personalFields.map(([label, value]) => (
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
        </PCard>
    )
}

export default PersonalDetails
