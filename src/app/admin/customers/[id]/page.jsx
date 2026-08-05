"use client"
import React from 'react'
import { useParams } from 'next/navigation';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useUsers } from '@/hooks/useUsers';
import OrderSkeletonPage from '../../orders/[id]/components/OrderSkeletonPage';
import UserOrdersTable from './components/UserOrdersTable';
import Loader from '@/components/Loader';

function page() {
    const params = useParams();
    const id = params.id;
    const { getSingleUserQuery } = useUsers()
    const { data: userResp, isLoading, error } = getSingleUserQuery(id)
    const user = userResp?.data || {};

    console.log(user)

    if (isLoading) return (
        <div>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Customer Details</h1>
            </div>
            <Loader />
        </div>
    )
    if (error) return <p>Error: {error.message}</p>

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Customer Details</h1>
            </div>
            <div className='space-y-3'>
                {/* Main Customer Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-2 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                    </div>
                    <div className="px-6 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                                <p className="text-md text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                                <p className="text-md text-gray-900">+{user?.callingCode} {user?.phoneNo}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Account Created</h3>
                                <p className="text-md text-gray-900">
                                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Customer ID</h3>
                                <p className="text-md text-gray-900 font-mono">{id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Address Information</h2>
                    </div>
                    <div className="px-6 py-5">
                        {user?.address && user?.address?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user?.address?.map((addr, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-900 capitalize">{addr?.label}</span>
                                            {index === 0 && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-800">{addr?.street}</p>
                                            <p className="text-sm text-gray-800">{addr?.city}, {addr?.state} {addr?.pinCode}</p>
                                            <p className="text-sm text-gray-800">{addr?.country}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No address information available.</p>
                        )}
                    </div>
                </div>
                <UserOrdersTable orders={user?.orders} />
            </div>
        </InnerDashboardLayout>
    )
}

export default page