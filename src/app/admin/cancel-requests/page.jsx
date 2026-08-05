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
            <div className="w-full flex items-center justify-between gap-4 border-b border-gray-500 pb-4">
                <div>
                    <h1 className="text-primary font-semibold sm:text-2xl lg:text-4xl">
                        Cancel Requests
                    </h1>
                    <p className='text-xs text-gray-600 mt-2'>Showing Summary: <strong>{formattedStart}</strong> - <strong>{formattedEnd}</strong></p>
                </div>
                {/* date range selector */}
                <div className="space-x-1 flex">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </div>

            {/* Status counts cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 mt-6">
                {[
                    { key: 'all', label: 'All Requests', count: totalCount, bg: 'bg-indigo-500', border: 'border-indigo-500' },
                    { key: 'Pending', label: 'Pending', count: pendingCount, bg: 'bg-yellow-500', border: 'border-yellow-500' },
                    { key: 'Accepted', label: 'Accepted', count: acceptedCount, bg: 'bg-green-500', border: 'border-green-500' },
                    { key: 'Rejected', label: 'Rejected', count: rejectedCount, bg: 'bg-red-500', border: 'border-red-500' }
                ].map((item) => (
                    <div
                        key={item.key}
                        className={`cursor-pointer border rounded-lg p-2 lg:p-4 text-center hover:shadow-sm transition-all duration-300 ${statusFilter === item.key ? `${item.bg} text-white ${item.border}` : 'bg-white border-gray-300'}`}
                        onClick={() => {
                            setStatusFilter(item.key);
                            setPage(1);
                        }}
                    >
                        <h2 className="text-2xl font-bold">{item.count}</h2>
                        <p className={`text-xs lg:text-sm ${statusFilter === item.key ? 'text-white' : 'text-gray-600'}`}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Order ID, Phone, Rejection Reason, or Customer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-8 text-sm bg-white border-gray-200"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
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
                        className="text-xs text-gray-500 hover:text-gray-900 gap-1.5 shrink-0"
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