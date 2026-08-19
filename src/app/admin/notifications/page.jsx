"use client"

import React, { useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import SendNotification from './components/SendNotification';
import NotificationTable from './components/NotificationTable';
import NotAuthorizedPage from '@/components/notAuthorized';
import { useNotifications } from '@/hooks/useNotifications';
import { BellRing } from 'lucide-react'

function Page() {
    const [notiDialog, setNotiDialog] = useState(false)
    const { permissions: { canView, canAdd } } = useNotifications();

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Notifications</h1>
                    <p className="text-sm text-slate-500 mt-1">Send and manage push notifications for app and website users</p>
                </div>
                {canAdd && (
                    <div className="w-full md:w-auto shrink-0">
                        <Button 
                            onClick={() => setNotiDialog(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold px-5 h-10 border-0 flex items-center gap-2"
                        >
                            <BellRing className="h-4 w-4" />
                            Create New
                        </Button>
                    </div>
                )}
            </div>

            <NotificationTable />

            <SendNotification
                open={notiDialog}
                onOpenChange={setNotiDialog}
            />
        </InnerDashboardLayout>
    )
}

export default Page;