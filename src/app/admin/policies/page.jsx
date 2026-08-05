"use client"
import React, { useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Button } from '@/components/ui/button'
import PolicyTable from './components/PolicyTable'
import PrivacyForm from './components/PrivacyForm'
import { usePolicies } from '@/hooks/usePolicies'
import TableSkeleton from '@/components/custom/TableSkeleton'

function page() {
    const { policyQuery, createPolicy, updatePolicy, permissions: {
        canView,
        canAdd,
        canEdit,
        canDelete,
    } } = usePolicies();
    const [policyForm, setPolicyForm] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    const policies = policyQuery?.data?.data || [];

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-3">Policies</h1>

                {canAdd &&
                    <Button onClick={() => {
                        setSelectedPolicy(undefined)
                        setPolicyForm(true)
                    }}>
                        Create New
                    </Button>
                }
            </div>

            {canView &&
                policyQuery.isLoading ?
                <TableSkeleton />
                : <PolicyTable
                    policies={policies}
                    setSelected={setSelectedPolicy}
                    openForm={setPolicyForm}
                />
            }

            <PrivacyForm
                open={policyForm}
                onOpenChange={setPolicyForm}
                setSelected={setSelectedPolicy}
                data={selectedPolicy}
                onCreate={createPolicy}
                onUpdate={updatePolicy}
                canEdit={canEdit}
                canAdd={canAdd}
            />

        </InnerDashboardLayout>
    )
}

export default page