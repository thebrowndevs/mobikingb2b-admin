'use client'

import React from 'react'
import { useHome } from '@/hooks/useHome'
import PCard from '@/components/custom/PCard'
import WebsiteBanners from '../components/WebsiteBanners'
import NotAuthorizedPage from '@/components/notAuthorized'
import Loader from '@/components/Loader'

export default function WebsitePage() {
    const { homeQuery, permissions: { canView, canEdit } } = useHome()

    if (homeQuery.isLoading) {
        return <Loader />
    }

    if (!canView) {
        return <NotAuthorizedPage />
    }

    return (
        <PCard className='w-full'>
            <WebsiteBanners canEdit={canEdit} />
        </PCard>
    )
}
