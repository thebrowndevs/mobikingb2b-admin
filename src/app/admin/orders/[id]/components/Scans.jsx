'use client'
import React, { useState } from 'react'
import PCard from '@/components/custom/PCard'
import { format } from 'date-fns'

export default function Scans({ order }) {
  const [activeTab, setActiveTab] = useState('forward')

  const forwardScans = order?.scans || []
  const returnScans = order?.returnScans || []

  if (forwardScans.length <= 0 && returnScans.length <= 0) return null

  const renderScans = (scans) =>
    scans.map((item, idx) => {
      const dateObj = new Date(item.date)

      return (
        <div
          key={idx}
          className="space-y-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 bg-gray-100 p-4 rounded-md"
        >
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
            <strong>SR Status:</strong> {item['sr-status'] || '—'}
          </p>

          <p>
            <strong>SR Status Label:</strong> {item['sr-status-label'] || '—'}
          </p>

          <p>
            <strong>Status:</strong> {item.status}
          </p>

          <p>
            <strong>Location:</strong> {item.location}
          </p>
        </div>
      )
    })

  return (
    <PCard className="space-y-4" id="scan-section">
      
      {/* Header */}
      <div className="flex w-full justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">
          Shipping Activity
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b pb-2">
        {forwardScans.length > 0 && (
          <button
            onClick={() => setActiveTab('forward')}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              activeTab === 'forward'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Forward ({forwardScans.length})
          </button>
        )}

        {
        returnScans.length > 0 && 
        (
          <button
            onClick={() => setActiveTab('return')}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              activeTab === 'return'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Return ({returnScans.length})
          </button>
        )}
      </div>

      {/* Scan Content */}
      <div className="space-y-3">
        {activeTab === 'forward' && renderScans(forwardScans)}
        {activeTab === 'return' && renderScans(returnScans)}
      </div>

    </PCard>
  )
}


// 'use client'
// import React from 'react'
// import PCard from '@/components/custom/PCard'
// import { format } from 'date-fns'

// export default function Scans({ order }) {
//   const scans = order.scans || []

//   if(scans.length <= 0) return null

//   return (
//     <PCard className="space-y-2" id="scan-section">
//          <div className="flex w-full justify-between items-center">
//                 <h2 className="text-lg font-semibold text-gray-700">Shipping Activity</h2>
//             </div>

//       {scans.map((item, idx) => {
//         // parse string into Date
//         const dateObj = new Date(item.date)

//         return (
//           <div key={idx} className="space-y-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 bg-gray-100 p-4 rounded-md">
//             <p>
//               <strong>Activity:</strong> {item.activity}
//             </p>
//             <p>
//               <strong>Date:</strong>{' '}
//               {isNaN(dateObj)
//                 ? item.date
//                 : format(dateObj, 'dd MMM, yyyy HH:mm')}
//             </p>
//             <p>
//               <strong>SR Status:</strong> {item['sr-status']}
//             </p>
//             <p>
//               <strong>SR Status Label:</strong> {item['sr-status-label']}
//             </p>
//             <p>
//               <strong>Status:</strong> {item.status}
//             </p>
            
//             <p>
//               <strong>Location:</strong> {item.location}
//             </p>
//           </div>
//         )
//       })}
//     </PCard>
//   )
// }
