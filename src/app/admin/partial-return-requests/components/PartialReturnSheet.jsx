'use client';

import React, { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePartialReturnRequests } from "@/hooks/usePartialReturnRequests";
import { usePermissions } from "@/hooks/usePermissions";
import OrderOfQuery from "@/app/admin/queries/components/OrderOfQuery";
import Scans from "@/app/admin/orders/[id]/components/Scans";
import PartialReturnCourierDialog from "./PartialReturnCourierDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    CheckCircle,
    XCircle,
    Truck,
    Calendar,
    Send,
    Loader2,
    PackageCheck,
    MessageSquare,
    Clock
} from "lucide-react";

export default function PartialReturnSheet({ open, onOpenChange, request: _request }) {
    const {
        getPartialReturnRequestById,
        acceptRequest,
        rejectRequest,
        holdRequest,
        reopenRequest,
        sendReply,
        schedulePickup
    } = usePartialReturnRequests();

    const { checkEdit, onlyAdmin } = usePermissions();
    const canEdit = checkEdit('partial-return-requests') || onlyAdmin();

    const { data: fullRequestData, isLoading: isRequestLoading } = getPartialReturnRequestById(_request?._id, open);
    const partialRequest = fullRequestData || _request;

    const [message, setMessage] = useState("");
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [courierDialogOpen, setCourierDialogOpen] = useState(false);
    const [activeOrderView, setActiveOrderView] = useState("original");

    const order = partialRequest?.orderRef;
    const returnOrder = partialRequest?.returnOrderRef;

    React.useEffect(() => {
        if (partialRequest) {
            if (partialRequest.status === "Accepted" && partialRequest.returnOrderRef) {
                setActiveOrderView("return");
            } else {
                setActiveOrderView("original");
            }
        }
    }, [partialRequest]);

    const displayOrder = activeOrderView === "return" ? returnOrder : order;

    const handleSendMessage = async () => {
        if (!message.trim() || !partialRequest?._id) return;
        try {
            await sendReply.mutateAsync({
                requestId: partialRequest._id,
                message: message
            });
            setMessage("");
        } catch (err) {
            console.error("Send reply error:", err);
        }
    };

    const handleAccept = async () => {
        if (!partialRequest?._id) return;
        try {
            await acceptRequest.mutateAsync({
                requestId: partialRequest._id
            });
        } catch (err) {
            console.error("Accept error:", err);
        }
    };

    const handleReject = async () => {
        if (!partialRequest?._id) return;
        try {
            await rejectRequest.mutateAsync({
                requestId: partialRequest._id,
                reason: rejectReason
            });
            setRejectDialogOpen(false);
            setRejectReason("");
        } catch (err) {
            console.error("Reject error:", err);
        }
    };

    const handleHold = async () => {
        if (!partialRequest?._id) return;
        try {
            await holdRequest.mutateAsync({
                requestId: partialRequest._id
            });
        } catch (err) {
            console.error("Hold error:", err);
        }
    };

    const handleReopen = async () => {
        if (!partialRequest?._id) return;
        if (!window.confirm("Are you sure you want to Reopen this partial return request? Status will be set to Pending and linked items will reset.")) return;
        try {
            await reopenRequest.mutateAsync({
                requestId: partialRequest._id
            });
        } catch (err) {
            console.error("Reopen error:", err);
        }
    };

    const handleSchedulePickup = async () => {
        const targetOrderId = returnOrder?._id || order?._id;
        if (!targetOrderId) return;
        try {
            await schedulePickup.mutateAsync({
                orderId: targetOrderId
            });
        } catch (err) {
            console.error("Schedule pickup error:", err);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="right" className="w-full sm:min-w-screen flex flex-col sm:max-h-screen sm:overflow-hidden overflow-auto p-0 bg-white">
                    <SheetTitle className="hidden">Partial Return Request Sheet</SheetTitle>

                    {isRequestLoading ? (
                        <div className="flex h-[80vh] items-center justify-center w-full">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="flex flex-col-reverse sm:flex-row h-full">
                            {/* Left Pane: Order Summary, Items & Logistics Action Buttons */}
                            <div className="w-full flex-1 sm:h-screen sm:overflow-y-auto bg-gray-100 p-4 border-r">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b bg-white p-3 rounded-lg shadow-sm">
                                    <div>
                                        <h1 className="font-bold text-lg text-gray-900">
                                            {activeOrderView === "return" ? "Return Order Details" : "Original Order Details"}: <span className="font-mono text-primary">{displayOrder?.orderId || "—"}</span>
                                        </h1>
                                        <p className="text-xs text-gray-500">
                                            Type: {displayOrder?.type || "Regular"} | Total: ₹{displayOrder?.orderAmount ?? displayOrder?.totalAmount ?? displayOrder?.subtotal ?? displayOrder?.subTotal ?? 0}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {returnOrder && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setActiveOrderView(activeOrderView === "return" ? "original" : "return")}
                                                className="border-primary text-primary hover:bg-primary/5 text-xs font-semibold gap-1.5"
                                            >
                                                {activeOrderView === "return" ? "View Original Order" : "View Return Order"}
                                            </Button>
                                        )}

                                        {activeOrderView === "return" && displayOrder?.scans?.length > 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="gap-1.5 text-xs border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                                                onClick={() => {
                                                    const section = document.getElementById("scan-section");
                                                    if (section) {
                                                        section.scrollIntoView({ behavior: "smooth" });
                                                    }
                                                }}
                                            >
                                                <Truck className="w-4 h-4" />
                                                Track Return
                                            </Button>
                                        )}

                                        {(
                                            partialRequest?.status === "Pending" ||
                                            partialRequest?.status === "Hold"
                                        ) && canEdit && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                                                        onClick={handleAccept}
                                                        disabled={acceptRequest.isPending || acceptRequest.isLoading}
                                                        loading={acceptRequest.isPending || acceptRequest.isLoading}
                                                    >

                                                        {(acceptRequest.isLoading || acceptRequest.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                        Accept Request
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="gap-1.5"
                                                        onClick={() => setRejectDialogOpen(true)}
                                                        disabled={rejectRequest.isLoading}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                        {
                                            partialRequest?.status === "Pending" && canEdit &&
                                            <Button
                                                size="sm"
                                                className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                                                onClick={handleHold}
                                                disabled={holdRequest.isPending || holdRequest.isLoading}
                                                loading={holdRequest.isPending || holdRequest.isLoading}
                                            >
                                                {(holdRequest.isLoading || holdRequest.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                                Hold Request
                                            </Button>
                                        }
                                        {/* {
                                            (partialRequest?.status === "Rejected" && !partialRequest?.reopenedAt) && canEdit &&
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 gap-1.5 font-semibold text-xs"
                                                onClick={handleReopen}
                                                disabled={reopenRequest.isPending || reopenRequest.isLoading}
                                            >
                                                {(reopenRequest.isLoading || reopenRequest.isPending) ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Clock className="w-4 h-4" />}
                                                Reopen Request
                                            </Button>
                                        } */}
                                        {
                                            partialRequest?.status === "Accepted" &&
                                            returnOrder?.status != "Returned" &&
                                            canEdit &&
                                            (<>
                                                {
                                                    returnOrder?.shiprocketOrderId &&
                                                        !returnOrder?.pickupScheduled &&
                                                        returnOrder?.awbCode &&
                                                        returnOrder?.courierName &&
                                                        returnOrder?.courierAssignedAt
                                                        ? <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 gap-1.5"
                                                            onClick={handleSchedulePickup}
                                                            disabled={schedulePickup.isLoading}
                                                        >
                                                            {schedulePickup.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                                            Schedule Pickup
                                                        </Button>
                                                        : returnOrder?.shiprocketOrderId &&
                                                        !returnOrder?.awbCode &&
                                                        !returnOrder?.courierName &&
                                                        !returnOrder?.courierAssignedAt &&
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5"
                                                            onClick={() => setCourierDialogOpen(true)}
                                                        >
                                                            <Truck className="w-4 h-4" />
                                                            Assign Courier
                                                        </Button>
                                                }
                                            </>
                                            )}
                                    </div>
                                </div>

                                {displayOrder && <OrderOfQuery order={displayOrder} />}
                                {activeOrderView === "return" && displayOrder && (
                                    <div className="mt-4">
                                        <Scans order={displayOrder} />
                                    </div>
                                )}
                            </div>

                            {/* Right Pane: Request Info, Selected Items & Live Chat Thread */}
                            <div className="w-full sm:w-[380px] lg:w-[450px] sm:h-screen flex flex-col bg-white p-4">
                                <div className="border-b pb-3 mb-3">
                                    <div className="flex items-center justify-between">
                                        <h1 className="font-bold text-lg text-gray-900">Request Details</h1>
                                        <Badge
                                            className={
                                                partialRequest?.status === "Accepted"
                                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                    : partialRequest?.status === "Rejected"
                                                        ? "bg-rose-100 text-rose-800 border-rose-300"
                                                        : partialRequest?.status === "Hold"
                                                            ? "bg-blue-100 text-blue-800 border-blue-300"
                                                            : "bg-amber-100 text-amber-800 border-amber-300"
                                            }
                                        >
                                            {partialRequest?.status || "Pending"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Raised At: {partialRequest?.createdAt ? format(new Date(partialRequest.createdAt), "dd MMM yyyy, hh:mm a") : "—"}
                                    </p>
                                    {partialRequest?.resolvedBy && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Resolved By: <span className="font-semibold text-gray-700">{partialRequest.resolvedBy.name || partialRequest.resolvedBy.email || partialRequest.resolvedBy}</span>
                                            {partialRequest.resolvedAt && ` at ${format(new Date(partialRequest.resolvedAt), "dd MMM yyyy, hh:mm a")}`}
                                        </p>
                                    )}
                                    {partialRequest?.holdBy && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Hold By: <span className="font-semibold text-gray-700">{partialRequest.holdBy.name || partialRequest.holdBy.email || partialRequest.holdBy}</span>
                                            {partialRequest.holdAt && ` at ${format(new Date(partialRequest.holdAt), "dd MMM yyyy, hh:mm a")}`}
                                        </p>
                                    )}
                                    {partialRequest?.reopenedBy && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Reopened By: <span className="font-semibold text-gray-700">{partialRequest.reopenedBy.name || partialRequest.reopenedBy.email || partialRequest.reopenedBy}</span>
                                            {partialRequest.reopenedAt && ` at ${format(new Date(partialRequest.reopenedAt), "dd MMM yyyy, hh:mm a")}`}
                                        </p>
                                    )}
                                </div>

                                {/* Return Reason */}
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs space-y-1 mb-3">
                                    <span className="font-bold text-amber-900 uppercase tracking-wide">Reason for Return</span>
                                    <p className="text-amber-800 font-medium">{partialRequest?.reason || "No reason specified"}</p>
                                </div>

                                {/* Requested Items List */}
                                <div className="border rounded-lg p-3 bg-gray-50 mb-4 max-h-[220px] overflow-y-auto space-y-2">
                                    <span className="text-xs font-bold text-gray-700 uppercase">Items Selected for Return</span>
                                    {partialRequest?.items?.map((it, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded border text-xs">
                                            <img
                                                src={it.productId?.photos?.[0] || it.productId?.images?.[0] || "/placeholder.png"}
                                                alt={it.fullName}
                                                className="w-10 h-10 object-contain rounded border shrink-0 bg-gray-50"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">{it.fullName}</p>
                                                <p className="text-gray-500">
                                                    Variant: {it.variantName} | SKU: {it.sku || "—"}
                                                </p>
                                                <p className="font-bold text-emerald-600 mt-0.5">
                                                    Qty: {it.quantity} x ₹{it.price} = ₹{(it.price * it.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat / Communication Thread */}
                                <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-gray-50">
                                    <div className="bg-white px-3 py-2 border-b flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold text-gray-800">Customer Communication</span>
                                    </div>

                                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                                        {(!partialRequest?.replies || partialRequest.replies.length === 0) ? (
                                            <div className="text-center py-6 text-xs text-gray-400 italic">
                                                No messages yet. Start a conversation below.
                                            </div>
                                        ) : (
                                            partialRequest.replies.map((reply, idx) => {
                                                const senderName = reply.messagedBy?.name || reply.messagedBy?.email || "User";
                                                const isAdmin = reply.messagedBy?.role === "admin" || reply.messagedBy?.role === "employee";

                                                return (
                                                    <div
                                                        key={reply._id || idx}
                                                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                                                    >
                                                        <div className="text-[10px] text-gray-400 mb-0.5">
                                                            {senderName} • {reply.messagedAt ? format(new Date(reply.messagedAt), "dd MMM, hh:mm a") : ""}
                                                        </div>
                                                        <div
                                                            className={`p-2.5 rounded-lg text-xs max-w-[85%] ${isAdmin
                                                                ? "bg-primary text-white rounded-br-none"
                                                                : "bg-white text-gray-800 border shadow-sm rounded-bl-none"
                                                                }`}
                                                        >
                                                            {reply.message}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Reply Input Box */}
                                    <div className="p-2 bg-white border-t flex gap-2 items-center">
                                        <Input
                                            placeholder="Type a message to customer..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            className="text-xs border-gray-200 bg-gray-50 flex-1"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={handleSendMessage}
                                            disabled={sendReply.isLoading || !message.trim()}
                                            className="shrink-0 h-9 px-3"
                                        >
                                            {sendReply.isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-rose-600 flex items-center gap-2">
                            <XCircle className="w-5 h-5" /> Reject Partial Return Request
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                            Please provide a clear reason for rejecting this return request. The user will be able to view this remark.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="text-sm bg-gray-50 border-gray-200 min-h-[90px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejectRequest.isLoading || !rejectReason.trim()}
                        >
                            {rejectRequest.isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Courier Assignment Dialog */}
            {returnOrder && (
                <PartialReturnCourierDialog
                    open={courierDialogOpen}
                    onOpenChange={setCourierDialogOpen}
                    order={returnOrder}
                />
            )}
        </>
    );
}
