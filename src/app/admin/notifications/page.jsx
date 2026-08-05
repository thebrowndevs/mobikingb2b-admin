"use client"
import React, { useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import SendNotification from './components/SendNotification';
import NotificationTable from './components/NotificationTable';
import NotAuthorizedPage from '@/components/notAuthorized';
import { useNotifications } from '@/hooks/useNotifications';

function page() {
    const [notiDialog, setNotiDialog] = useState(false)
    const { permissions: { canView, canAdd } } = useNotifications();

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-3">Notifications</h1>
                {canAdd &&
                    <Button onClick={() => setNotiDialog(true)}>
                        Create New Notification
                    </Button>
                }
            </div>

            <NotificationTable />

            <SendNotification
                open={notiDialog}
                onOpenChange={setNotiDialog}
            />
        </InnerDashboardLayout>
    )
}

export default page