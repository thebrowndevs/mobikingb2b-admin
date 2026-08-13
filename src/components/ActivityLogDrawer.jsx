'use client'
import React from 'react'
import { format } from 'date-fns'
import {
    Clock, User, Info, CheckCircle2, XCircle, AlertCircle, PhoneCall, Edit, Plus, Truck, Loader2
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useQuotations } from '@/hooks/useQuotations'
import { useOrders } from '@/hooks/useOrders'

const getActionIcon = (action) => {
    switch (action) {
        case "Created": return <Plus className="w-4 h-4 text-blue-600" />;
        case "Accepted": return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
        case "Rejected": return <XCircle className="w-4 h-4 text-rose-600" />;
        case "Cancelled": return <XCircle className="w-4 h-4 text-red-600" />;
        case "Hold": return <AlertCircle className="w-4 h-4 text-amber-600" />;
        case "Shipped": return <Truck className="w-4 h-4 text-indigo-600" />;
        case "Delivered": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
        case "Call Attempt": return <PhoneCall className="w-4 h-4 text-teal-650" />;
        case "Items Edited": return <Edit className="w-4 h-4 text-purple-600" />;
        default: return <Info className="w-4 h-4 text-slate-500" />;
    }
};

const getActionBg = (action) => {
    switch (action) {
        case "Created": return "bg-blue-50 border border-blue-200 text-blue-650";
        case "Accepted": return "bg-emerald-50 border border-emerald-200 text-emerald-700";
        case "Rejected": return "bg-rose-50 border border-rose-200 text-rose-700";
        case "Cancelled": return "bg-red-50 border border-red-200 text-red-700";
        case "Hold": return "bg-amber-50 border border-amber-200 text-amber-700";
        case "Shipped": return "bg-indigo-50 border border-indigo-200 text-indigo-700";
        case "Delivered": return "bg-green-50 border border-green-200 text-green-700";
        case "Call Attempt": return "bg-teal-50 border border-teal-200 text-teal-700";
        case "Items Edited": return "bg-purple-50 border border-purple-200 text-purple-700";
        default: return "bg-slate-50 border border-slate-200 text-slate-650";
    }
};

export default function ActivityLogDrawer({ open, onOpenChange, id, type }) {
    const { getQuotationActivity } = useQuotations()
    const { getOrderActivity } = useOrders()

    // Dynamically fetch using react-query based on type
    const queryHook = type === 'quotation' ? getQuotationActivity : getOrderActivity
    const { data: activityLogs, isLoading, error } = queryHook(id)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-md w-full bg-white border-l p-0 flex flex-col h-full text-slate-800">
                <SheetHeader className="p-6 border-b shrink-0 bg-slate-50/50">
                    <SheetTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Clock className="h-5 w-5 text-slate-700" />
                        Activity Log & Audit Trail
                    </SheetTitle>
                    <SheetDescription className="text-xs text-slate-400">
                        Chronological history of all updates and operations performed on this record.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium">Fetching history...</span>
                        </div>
                    ) : error ? (
                        <p className="text-sm text-rose-500 italic py-4 text-center">Failed to load activity logs.</p>
                    ) : !activityLogs || activityLogs.length === 0 ? (
                        <p className="text-sm text-slate-450 italic py-8 text-center">No activity history recorded.</p>
                    ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {activityLogs.map((log, idx) => {
                                const performedBy = log.performedByName || log.performedBy?.name || "System"
                                const performedRole = log.performedByRole || log.performedBy?.role ? ` (${log.performedByRole || log.performedBy?.role})` : ""
                                const timestamp = log.timestamp || log.createdAt

                                return (
                                    <div key={log._id || idx} className="relative flex flex-col gap-3">
                                        {/* Timeline Dot */}
                                        <div className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${getActionBg(log.action)}`}>
                                            {getActionIcon(log.action)}
                                        </div>

                                        {/* Main Log Details */}
                                        <div className="flex-1 bg-slate-50 hover:bg-slate-100/75 border border-slate-100 p-4 rounded-xl transition-colors space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {timestamp ? format(new Date(timestamp), 'dd MMM yyyy, hh:mm a') : '—'}
                                                </span>
                                            </div>

                                            {log.remarks && (
                                                <p className="text-xs text-slate-650 leading-relaxed font-mono whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-150 shadow-3xs">
                                                    {log.remarks}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-0.5">
                                                <User className="w-3.5 h-3.5" />
                                                <span>By: </span>
                                                <span className="text-slate-500 font-bold">{performedBy}{performedRole}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
