import React from 'react'

function InnerDashboardLayout({ children }) {
    return (
        <div className="w-full min-h-full p-4 pb-0 scroll-smooth">
            {children}
            <div className="h-4" />
        </div>
    )
}

export default InnerDashboardLayout
