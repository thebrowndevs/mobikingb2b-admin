'use client'
import React from 'react'
import PCard from '@/components/custom/PCard'
import { format } from 'date-fns'

export default function Scans({ order }) {
  const scans = order.scans || []

  if(scans.length <= 0) return null

  return (
    <PCard className="space-y-2" id="scan-section">
         <div className="flex w-full justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">Shipping Activity</h2>
            </div>

      {scans.map((item, idx) => {
        // parse string into Date
        const dateObj = new Date(item.date)

        return (
          <div key={idx} className="space-y-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 bg-gray-100 p-4 rounded-md">
            <p>
              <strong>Activity:</strong> {item.activity}
            </p>
            <p>
              <strong>Date:</strong>{' '}
              {isNaN(dateObj)
                ? item.date
                : format(dateObj, 'dd MMM, yyyy HH:mm')}
            </p>
            <p>
              <strong>SR Status:</strong> {item['sr-status']}
            </p>
            <p>
              <strong>SR Status Label:</strong> {item['sr-status-label']}
            </p>
            <p>
              <strong>Status:</strong> {item.status}
            </p>
            
            <p>
              <strong>Location:</strong> {item.location}
            </p>
          </div>
        )
      })}
    </PCard>
  )
}
