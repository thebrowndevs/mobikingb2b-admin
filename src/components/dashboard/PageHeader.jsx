"use client"
import React from 'react'

function PageHeader({ heading, children }) {
    return (
        <header className="py-5 flex items-center justify-between w-full px-0 lg:px-0">
            <h1 className="sm:text-3xl text-xl font-bold">{heading}</h1>
            <div>
                {children}
            </div>
        </header>
    )
}

export default PageHeader
