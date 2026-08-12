"use client"
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import DateRangeSelector from '@/components/custom/DateRangeSelector';
import { format } from 'date-fns';
import { useOrders } from '@/hooks/useOrders';
import TableSkeleton from "@/components/custom/TableSkeleton"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, RotateCcw } from "lucide-react"
import CancelOrdersTable from './components/CancelOrdersTable';
import NotAuthorizedPage from '@/components/notAuthorized';


function page() {
    // Date range
    const today = new Date()
    const pastDate = new Date()
    const from = pastDate.setDate(today.getDate() - 6)

    const initialRange = { from: from, to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const startDate = format(range.from, 'yyyy-MM-dd')
    const endDate = format(range.to, 'yyyy-MM-dd')

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const { getCancelRequestOrders, permissionsCancel: { canViewCancel, canAddCancel, canEditCancel, canDeleteCancel } } = useOrders();
    const { data: cancelReqOrders, isFetching, error } = getCancelRequestOrders({
        requestType: 'Cancel',
        startDate,
        endDate,
        page,
        limit,
        searchQuery: debouncedSearch,
        status: statusFilter
    });

    const totalPages = cancelReqOrders?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    const ordersData = cancelReqOrders?.orders;
    const pendingCount = cancelReqOrders?.pendingCount || 0;
    const acceptedCount = cancelReqOrders?.acceptedCount || 0;
    const rejectedCount = cancelReqOrders?.rejectedCount || 0;
    const totalCount = cancelReqOrders?.totalCount || 0;
    if (!canViewCancel) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
                        Cancel Requests
                    </h1>
                    <p className='text-sm text-slate-500'>Showing Summary: <span className="font-semibold text-slate-700">{formattedStart}</span> - <span className="font-semibold text-slate-700">{formattedEnd}</span></p>
                </div>
                {/* date range selector */}
                <div className="space-x-1 flex">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </div>

            {/* Status counts cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { key: 'all', label: 'All Requests', count: totalCount, borderAccent: 'border-l-indigo-600 text-indigo-700' },
                    { key: 'Pending', label: 'Pending', count: pendingCount, borderAccent: 'border-l-amber-500 text-amber-700' },
                    { key: 'Accepted', label: 'Accepted', count: acceptedCount, borderAccent: 'border-l-emerald-600 text-emerald-700' },
                    { key: 'Rejected', label: 'Rejected', count: rejectedCount, borderAccent: 'border-l-rose-600 text-rose-700' }
                ].map((item) => (
                    <div
                        key={item.key}
                        className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 bg-white hover:bg-slate-50/50 ${statusFilter === item.key
                            ? `border-slate-300 ${item.borderAccent} border-l-4 bg-slate-50/80`
                            : 'border-slate-200 border-l-4 border-l-slate-300'
                            }`}
                        onClick={() => {
                            setStatusFilter(item.key);
                            setPage(1);
                        }}
                    >
                        <h2 className="text-2xl font-extrabold text-slate-800">{item.count}</h2>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by Order ID, Phone, Rejection Reason, or Customer name..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 pr-8 text-sm bg-white border-slate-200 focus:border-slate-400 rounded-xl"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-655 transition-colors"
                            title="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setPage(1);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-900 gap-1.5 shrink-0 rounded-xl"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            {isFetching ?
                <TableSkeleton showHeader={false} showPagination={false} />
                : <CancelOrdersTable
                    error={error}
                    orders={ordersData}
                    canEditCancel={canEditCancel}
                />
            }

            {/* pagination */}
            <div className="flex w-full justify-end gap-2 items-center mt-4">
                {/* Limit Dropdown */}
                <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1, 5, 10, 20, 50].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n} / page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Pagination */}
                <Pagination className={'inline justify-end mx-1 w-fit'}>
                    <PaginationContent>
                        {page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} />
                            </PaginationItem>
                        )}

                        {paginationRange.map((p, i) => (
                            <PaginationItem key={i}>
                                {p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={p === page}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setPage(p)
                                        }}
                                    >
                                        {p}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>

        </InnerDashboardLayout>
    )
}

export default page