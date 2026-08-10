'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, HeadphoneOff, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import PartialReturnSheet from './PartialReturnSheet';

export default function PartialReturnRequestsTable({ error, requests = [] }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const openWhatsApp = (phone) => {
        if (!phone) return;
        const digits = phone.replace(/\D/g, '');
        const url = `https://wa.me/${digits}`;
        window.open(url, '_blank');
    };

    if (error) {
        return (
            <div className="text-red-600 p-4 border bg-rose-50 rounded-lg text-sm">
                Error fetching partial return requests: {error.message || 'Server error'}
            </div>
        );
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white border rounded-xl shadow-sm">
                <HeadphoneOff className="w-12 h-12 text-gray-300 mb-2" />
                <h3 className="text-lg font-semibold text-gray-700">No Partial Return Requests Found</h3>
                <p className="text-xs text-gray-500 mt-1">There are no partial return requests matching your criteria.</p>
            </div>
        );
    }

    const handleViewDetails = (req) => {
        setSelectedRequest(req);
        setSheetOpen(true);
    };

    return (
        <div className="bg-white border overflow-hidden">
            <Table className="p-4">
                <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Items Count</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Raised At</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    <AnimatePresence mode="wait">
                        {requests.map((req, i) => {
                            const order = req.orderRef;
                            const returnOrder = req.returnOrderRef;
                            const customerName = order?.name || order?.userId?.name || order?.userId?.email || "User";
                            const itemsCount = req.items?.length || 0;
                            const hasChat = req.replies && req.replies.length > 0;

                            // console.log("RETURN: ", returnOrder);
                            return (
                                <motion.tr
                                    key={req._id || i}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="hover:bg-gray-50/80 transition-colors"
                                >
                                    <TableCell className="text-xs text-gray-500">{i + 1}</TableCell>

                                    <TableCell className="font-mono font-bold text-xs text-primary">
                                        {order?.orderId || "—"}
                                    </TableCell>

                                    <TableCell className="text-xs font-semibold text-gray-900">
                                        {customerName}
                                    </TableCell>

                                    <TableCell className="text-xs text-gray-600 font-mono">
                                        <div className="flex items-center space-x-2">
                                            <span>{order?.phoneNo || order?.userId?.phone || "—"}</span>
                                            {(order?.phoneNo || order?.userId?.phone) && (
                                                <FaWhatsapp
                                                    className="cursor-pointer text-green-500 hover:text-green-600"
                                                    size={16}
                                                    onClick={() => openWhatsApp(order?.phoneNo || order?.userId?.phone)}
                                                />
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-xs font-semibold text-gray-900">
                                        ₹{order?.orderAmount ? order.orderAmount.toFixed(2) : "0.00"}
                                    </TableCell>

                                    <TableCell className="text-xs text-gray-600 capitalize">
                                        {order?.method || "—"}
                                    </TableCell>

                                    <TableCell className="text-xs font-semibold">
                                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                                            {itemsCount} item{itemsCount > 1 ? 's' : ''}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge
                                                className={
                                                    req.status === "Accepted"
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                        : req.status === "Rejected"
                                                            ? "bg-rose-100 text-rose-800 border-rose-300"
                                                            : req.status === "Hold" ?
                                                                "bg-vlue-100 text-blue-800 border-blue-300"
                                                                : "bg-amber-100 text-amber-800 border-amber-300"
                                                }
                                            >
                                                {
                                                    req.status === "Hold"
                                                        ? "Hold"
                                                        : req.status === "Rejected"
                                                            ? "Rejected"
                                                            : req.status === "Pending"
                                                                ? "Pending"
                                                                : (returnOrder?.status === "Returned" || returnOrder?.pickupScheduled)
                                                                    ? "Accepted"
                                                                    : (returnOrder?.awbCode && returnOrder?.courierName && returnOrder?.courierAssignedAt)
                                                                        ? "Courier Assigned"
                                                                        : returnOrder?.shiprocketOrderId
                                                                            ? "Return Order Created"
                                                                            : "Accepted"
                                                }
                                            </Badge>
                                            {req.status === "Accepted" && returnOrder?.status !== "Returned" && (
                                                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap block mt-0.5">
                                                    {returnOrder?.pickupScheduled
                                                        ? "Pickup Scheduled"
                                                        : (returnOrder?.awbCode && returnOrder?.courierName && returnOrder?.courierAssignedAt)
                                                            ? "Schedule Pickup Now"
                                                            : returnOrder?.shiprocketOrderId
                                                                ? "Assign Courier Now"
                                                                : "Accept and Create Order Now"
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                                        {req.createdAt ? format(new Date(req.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleViewDetails(req)}
                                            className="h-8 px-2.5 text-xs text-primary hover:bg-blue-50 gap-1.5"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View Details
                                            {hasChat && (
                                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Has messages" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>

            {/* Request Drawer Sheet */}
            {selectedRequest && (
                <PartialReturnSheet
                    open={sheetOpen}
                    onOpenChange={(o) => {
                        setSheetOpen(o);
                        if (!o) setSelectedRequest(null);
                    }}
                    request={selectedRequest}
                />
            )}
        </div>
    );
}
