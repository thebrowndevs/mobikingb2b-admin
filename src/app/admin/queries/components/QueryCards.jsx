'use client'
import { motion, LayoutGroup } from 'framer-motion'
import React, { useState } from 'react'

function QueryCards({ queries = [], onTabChange }) {
    const [activeTab, setActiveTab] = useState('all')

    const counts = {
        all: queries.length,
        pending: queries.filter(q => !q.isResolved).length,
        resolved: queries.filter(q => q.isResolved).length,
    }

    const TABS = [
        { key: 'all', label: 'ALL QUERIES' },
        { key: 'pending', label: 'PENDING' },
        { key: 'resolved', label: 'RESOLVED' },
    ]

    const handleTabClick = (key) => {
        setActiveTab(key)
        onTabChange?.(key)
    }

    return (
        <LayoutGroup>
            <div className="flex gap-2 mb-0 overflow-x-auto bg-white scrollbar-hide relative">
                {TABS.map(({ key, label }) => {
                    const isActive = activeTab === key
                    return (
                        <button
                            key={key}
                            onClick={() => handleTabClick(key)}
                            className={`relative px-4 py-6 text-sm font-medium transition-all duration-300 flex gap-1 w-full min-w-fit items-center justify-center ${
                                isActive ? 'font-bold text-black' : 'text-gray-600'
                            }`}
                        >
                            {label} ({counts[key]})
                            {isActive && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </LayoutGroup>
    )
}

export default QueryCards
