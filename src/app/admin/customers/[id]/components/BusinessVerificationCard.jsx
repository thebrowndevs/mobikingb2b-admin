import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * Badge component to display business verification status.
 */
function BusinessStatusBadge({ business }) {
    if (!business?.active) {
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">Not Started</span>;
    }
    if (business?.isApproved && business?.gstVerified) {
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-semibold">GST Verified</span>;
    }
    if (business?.isApproved) {
        return <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">Verified</span>;
    }
    if (business?.rejectionReason) {
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">Rejected</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">Pending</span>;
}

/**
 * BusinessVerificationCard – shows business details and allows admin to approve or reject.
 *
 * Props:
 *  - user: the full user object (contains .business and .address etc.)
 *  - onVerify: async function ({ id, action, rejectionReason }) => Promise – mutation trigger
 *  - isLoading (optional): boolean indicating verification request in progress
 */
export default function BusinessVerificationCard({ user, onVerify, isLoading = false }) {
    const business = user?.business || {};
    const [showReject, setShowReject] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async () => {
        try {
            await onVerify({ id: user._id, action: 'approve' });
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Approve failed');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }
        try {
            await onVerify({ id: user._id, action: 'reject', rejectionReason });
            setShowReject(false);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Reject failed');
        }
    };

    return (
        <Card className="mt-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-gray-200 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-2xl font-bold text-gray-800">Business Verification</CardTitle>
                <BusinessStatusBadge business={business} />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                    <p className="font-medium text-gray-600">Business Name</p>
                    <p>{business?.name || '-'}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-600">GST Number</p>
                    <p>{business?.gstNumber || '-'}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-600">Phone</p>
                    <p>{business?.phone || '-'}</p>
                </div>
                <div>
                    <p className="font-medium text-gray-600">Email</p>
                    <p>{business?.email || '-'}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="font-medium text-gray-600">Registered Address</p>
                    <p className="whitespace-pre-line">
                        {business?.address?.replace(/\n/g, '\n') || '-'}
                    </p>
                </div>
                {business?.gstData && (
                    <div className="md:col-span-2">
                        <p className="font-medium text-gray-600">GST Data</p>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs">
                            {JSON.stringify(business.gstData, null, 2)}
                        </pre>
                    </div>
                )}
                {business?.rejectionReason && (
                    <div className="md:col-span-2">
                        <p className="font-medium text-gray-600">Rejection Reason</p>
                        <p className="text-red-600">{business.rejectionReason}</p>
                        {business.rejectedBy && (
                            <p className="text-sm text-gray-500">
                                Rejected by: {business.rejectedBy?.name || business.rejectedBy} on{' '}
                                {new Date(business.rejectedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                )}
                {business?.approvedAt && (
                    <div className="md:col-span-2">
                        <p className="font-medium text-gray-600">Approved On</p>
                        <p>{new Date(business.approvedAt).toLocaleDateString()}</p>
                        {business.approvedBy && (
                            <p className="text-sm text-gray-500">Approved by: {business.approvedBy?.name || business.approvedBy}</p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 md:space-y-0 md:flex-row justify-end gap-2">
                {/* Show actions only when not already approved */}
                {!(business?.isApproved && business?.active) && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowReject((prev) => !prev)}
                            disabled={isLoading}
                        >
                            {showReject ? 'Cancel' : 'Reject'}
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleApprove}
                            disabled={isLoading}
                        >
                            Approve
                        </Button>
                    </>
                )}
                <AnimatePresence>
                    {showReject && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full md:w-64"
                        >
                            <Input
                                placeholder="Rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mb-2"
                            />
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isLoading || !rejectionReason.trim()}
                                className="w-full"
                            >
                                Confirm Reject
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardFooter>
        </Card>
    );
}
