"use client"

import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import React, { useState } from 'react'
import AppPage from './app/page'
import WebsitePage from './website/page'

function Page() {
    const [activeTab, setActiveTab] = useState('app')

    return (
        <InnerDashboardLayout>
            <div className='w-full flex items-center justify-between text-primary mb-5'>
                <h1 className='font-bold sm:text-2xl lg:text-4xl w-full'>Home Layout</h1>
            </div>

            {/* Sliding Animated Tabs */}
            <div className='relative flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit mb-6 shadow-inner'>
                <div 
                    className='absolute top-1 bottom-1 left-1 rounded-lg bg-white dark:bg-zinc-700 shadow-md transition-all duration-300 ease-out'
                    style={{
                        width: '120px',
                        transform: activeTab === 'app' ? 'translateX(0)' : 'translateX(120px)'
                    }}
                />
                <button
                    onClick={() => setActiveTab('app')}
                    className={`relative z-10 w-[120px] py-2 text-sm font-semibold text-center rounded-lg transition-colors duration-200 ${
                        activeTab === 'app' 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    App
                </button>
                <button
                    onClick={() => setActiveTab('website')}
                    className={`relative z-10 w-[120px] py-2 text-sm font-semibold text-center rounded-lg transition-colors duration-200 ${
                        activeTab === 'website' 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Website
                </button>
            </div>

            {activeTab === 'app' ? (
                <div className='transition-all duration-300 animate-fadeIn'>
                    <AppPage />
                </div>
            ) : (
                <div className='transition-all duration-300 animate-fadeIn'>
                    <WebsitePage />
                </div>
            )}
        </InnerDashboardLayout>
    )
}

export default Page