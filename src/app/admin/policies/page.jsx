"use client";
import React, { useState } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import PolicyTable from './components/PolicyTable';
import PrivacyForm from './components/PrivacyForm';
import { usePolicies } from '@/hooks/usePolicies';
import TableSkeleton from '@/components/custom/TableSkeleton';

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
            <div className='flex items-center justify-between w-full mb-6'>
                <div>
                    <h1 className="text-primary font-bold text-3xl tracking-tighter">Policies</h1>
                    <p className="text-sm text-slate-500">Manage legal, privacy, and terms of service documents</p>
                </div>

                {canAdd &&
                    <Button 
                        onClick={() => {
                            setSelectedPolicy(undefined);
                            setPolicyForm(true);
                        }}
                        className="bg-primary-btn hover:bg-primary-btn-hover text-primary-btn-text shadow-none font-semibold"
                    >
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
    );
}

export default page;