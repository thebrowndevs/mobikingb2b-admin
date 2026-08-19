'use client'
import React, { useState, useEffect } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useQuotations } from '@/hooks/useQuotations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TableSkeleton from '@/components/custom/TableSkeleton'
import { ChevronRight, Search, FileText, Eye } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import CallAttemptDialog from '@/components/CallAttemptDialog'
import { QuotationViewDialog } from './components/QuotationViewDialog'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const TABS = [
    { key: 'all', label: 'ALL REQUESTS' },
    { key: 'web', label: 'WEBSITE REQUESTS' },
    { key: 'app', label: 'APP REQUESTS' },
    { key: 'pos', label: 'POS REQUESTS' },
    { key: 'manual', label: 'MANUAL REQUESTS' },
]

const STATUS_CARDS = [
    'New',
    'Accepted',
    'Rejected',
    'Hold',
    'Booked',
    'Cancelled'
]

const STATUS_CLASSES = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Hold: 'bg-amber-100 text-amber-800 border-amber-200',
    Booked: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Cancelled: 'bg-slate-100 text-slate-800 border-slate-200'
}

export default function QuotationsListPage() {
    const { getQuotationsPaginated, permissions } = useQuotations()
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [activeStatus, setActiveStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 10

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const { data, isLoading, refetch } = getQuotationsPaginated({
        params: {
            page: currentPage,
            limit,
            type: activeTab,
            status: activeStatus,
            searchQuery: debouncedSearch
        }
    })

    const quotations = data?.quotations || []
    const pagination = data?.pagination || {}
    const counts = data?.counts || {}
    const statusesCounts = counts.statuses || {}

    const totalPages = pagination.totalPages || 1
    const paginationRange = getPaginationRange(currentPage, totalPages)

    if (!permissions.canView) {
        return (
            <InnerDashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <p className="text-lg font-semibold text-slate-500">You are not authorized to view this page.</p>
                </div>
            </InnerDashboardLayout>
        );
    }

    return (
        <InnerDashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter text-slate-900 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-slate-800" />
                            Order Requests
                        </h1>
                        <p className="text-slate-500 mt-1">Manage, edit, and book B2B wholesale quotations and requests.</p>
                    </div>
                    <Button onClick={() => refetch()} variant="outline" className="self-start md:self-auto border-slate-200 hover:bg-slate-50">
                        Refresh List
                    </Button>
                </div>

                {/* Status Filter Cards */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setActiveStatus('all'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${activeStatus === 'all'
                            ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        All ({counts.all || 0})
                    </button>
                    {STATUS_CARDS.map((status) => (
                        <button
                            key={status}
                            onClick={() => { setActiveStatus(status); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${activeStatus === status
                                ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {status} ({statusesCounts[status] || 0})
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 gap-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                            className={`pb-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-[2px] ${activeTab === tab.key
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label} ({counts[tab.key] || 0})
                        </button>
                    ))}
                </div>

                {/* Search & Actions */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search by Request ID, Name, Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus-visible:ring-slate-900"
                    />
                </div>

                {/* Listing Table */}
                {isLoading ? (
                    <TableSkeleton />
                ) : quotations.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <FileText className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No requests found</h3>
                        <p className="text-slate-400 text-sm mt-1">We couldn't find any order requests matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-semibold text-xs border-b border-slate-100">
                                            <th className="py-4 px-6">REQUEST ID</th>
                                            <th className="py-4 px-6">CUSTOMER / BUSINESS</th>
                                            <th className="py-4 px-6 text-center">CALL ATTEMPTS</th>
                                            <th className="py-4 px-6">DATE</th>
                                            <th className="py-4 px-6">ITEMS</th>
                                            <th className="py-4 px-6">AMOUNT</th>
                                            <th className="py-4 px-6">SOURCE</th>
                                            <th className="py-4 px-6 text-center">STATUS</th>
                                            <th className="py-4 px-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                                        {quotations.map((q) => (
                                            <tr key={q._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6 font-mono font-bold text-slate-900">
                                                    <Link href={`/admin/quotations/${q._id}`} className="hover:underline text-indigo-650">
                                                        {q.quotationId}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800">{q.name}</span>
                                                        <span className="text-xs text-slate-400">{q.phoneNo}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <CallAttemptDialog quotation={q} type="quotation" />
                                                </td>
                                                <td className="py-4 px-6 text-slate-500">
                                                    {q.createdAt ? format(new Date(q.createdAt), 'dd MMM yyyy, hh:mm a') : '-'}
                                                </td>
                                                <td className="py-4 px-6 text-slate-500">
                                                    {q.items?.length || 0} items
                                                </td>
                                                <td className="py-4 px-6 font-bold text-slate-900">
                                                    ₹{q.orderAmount?.toLocaleString() || '0'}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${q.isAppOrder ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                        }`}>
                                                        {q.isAppOrder ? 'App' : 'Website'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CLASSES[q.status] || 'bg-slate-100 text-slate-800'
                                                        }`}>
                                                        {q.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <QuotationViewDialog quotation={q}>
                                                            <Eye className="cursor-pointer text-slate-500 hover:text-slate-800" size={18} />
                                                        </QuotationViewDialog>
                                                        {/* <Link href={`/admin/quotations/${q._id}`}>
                                                            <Button variant="ghost" size="sm" className="hover:bg-slate-100 text-slate-700 font-semibold gap-1">
                                                                View Request
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Button>
                                                        </Link> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="cursor-pointer"
                                        />
                                    </PaginationItem>
                                    {paginationRange.map((pageNumber, idx) => (
                                        <PaginationItem key={idx}>
                                            {pageNumber === '...' ? (
                                                <PaginationEllipsis />
                                            ) : (
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    isActive={currentPage === pageNumber}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="cursor-pointer"
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </div>
        </InnerDashboardLayout>
    )
}
