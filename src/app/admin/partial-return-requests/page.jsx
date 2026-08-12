'use client';

import React, { useState, useEffect } from 'react';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { usePartialReturnRequests } from '@/hooks/usePartialReturnRequests';
import PartialReturnRequestsTable from './components/PartialReturnRequestsTable';
import PartialReturnCreateDialog from './components/PartialReturnCreateDialog';
import { usePermissions } from '@/hooks/usePermissions';
import NotAuthorizedPage from '@/components/notAuthorized';
import TableSkeleton from '@/components/custom/TableSkeleton';
import DateRangeSelector from '@/components/custom/DateRangeSelector';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, RotateCcw, Filter } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/lib/services/getPaginationRange";

function useDebouncedValue(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function PartialReturnRequestsPage() {
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);

    const initialRange = { from: pastDate, to: today };
    const [range, setRange] = useState(initialRange);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm, 500);

    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const startDate = format(range.from, 'yyyy-MM-dd');
    const endDate = format(range.to, 'yyyy-MM-dd');

    const { getPaginatedRequests } = usePartialReturnRequests();

    const { data: requestsData, isLoading, error, refetch, isFetching } = getPaginatedRequests({
        page,
        limit,
        status: statusFilter,
        startDate,
        endDate,
        searchQuery: debouncedSearch
    });

    const { checkView, onlyAdmin } = usePermissions();
    if (!checkView('partial-return-requests') && !onlyAdmin()) {
        return <NotAuthorizedPage />;
    }

    const requests = requestsData?.requests || [];
    const totalCount = requestsData?.totalCount || 0;
    const pendingCount = requestsData?.pendingCount || 0;
    const acceptedCount = requestsData?.acceptedCount || 0;
    const rejectedCount = requestsData?.rejectedCount || 0;
    const holdCount = requestsData?.holdCount || 0;
    const totalPages = requestsData?.pagination?.totalPages || 1;
    const paginationRange = getPaginationRange(page, totalPages);

    const isFiltered = Boolean(searchTerm || statusFilter !== 'all');

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setRange(initialRange);
        setPage(1);
    };

    return (
        <InnerDashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
                        Partial Return Requests
                    </h1>
                    <p className="text-sm text-slate-500">
                        Showing requests from <span className="font-bold text-slate-700">{format(range.from, 'dd MMM yyyy')}</span> to <span className="font-bold text-slate-700">{format(range.to, 'dd MMM yyyy')}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="h-9 px-3 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 gap-1.5 shrink-0 shadow-sm"
                    >
                        <RotateCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Status counts cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6 mt-6">
                {[
                    { key: 'all', label: 'All Requests', count: totalCount, activeClass: 'border-l-indigo-600 bg-indigo-50/20 text-indigo-900 border-l-4' },
                    { key: 'Pending', label: 'Pending', count: pendingCount, activeClass: 'border-l-amber-500 bg-amber-50/20 text-amber-900 border-l-4' },
                    { key: 'Accepted', label: 'Accepted', count: acceptedCount, activeClass: 'border-l-emerald-600 bg-emerald-50/20 text-emerald-900 border-l-4' },
                    { key: 'Rejected', label: 'Rejected', count: rejectedCount, activeClass: 'border-l-rose-600 bg-rose-50/20 text-rose-900 border-l-4' },
                    { key: 'Hold', label: 'On Hold', count: holdCount, activeClass: 'border-l-purple-600 bg-purple-50/20 text-purple-900 border-l-4' },
                ].map((card) => {
                    const isSelected = statusFilter === card.key;
                    return (
                        <div
                            key={card.key}
                            onClick={() => {
                                setStatusFilter(card.key);
                                setPage(1);
                            }}
                            className={`cursor-pointer p-4 rounded-xl border border-slate-100 shadow-sm transition-all flex flex-col justify-between h-24 ${isSelected
                                ? `${card.activeClass} shadow-md scale-[1.01]`
                                : 'bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50/50'
                                }`}
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                                {card.label}
                            </span>
                            <span className="text-2xl font-bold text-slate-800">{card.count}</span>
                        </div>
                    );
                })}
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search partial return requests by Order ID, phone or reason..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 pr-8 text-sm bg-white border-slate-200 focus:border-slate-400"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setPage(1);
                                }}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetFilters}
                            className="h-9 text-xs text-slate-500 hover:text-slate-900 gap-1.5 shrink-0"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="outline" className="shrink-0 text-xs border-slate-200 text-slate-700 h-9">
                        Total: {totalCount}
                    </Button>
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 text-xs font-semibold h-9 shadow-sm"
                    >
                        Raise Request
                    </Button>
                </div>
            </div>

            {/* Content Table */}
            {isLoading ? (
                <TableSkeleton showHeader={false} />
            ) : (
                <PartialReturnRequestsTable error={error} requests={requests} />
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row w-full items-center justify-between gap-4 mt-6">
                    <div className="text-xs text-gray-500">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} total requests)
                    </div>

                    <div className="flex items-center gap-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        onClick={() => page > 1 && setPage(page - 1)}
                                        className={page <= 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {paginationRange.map((p, idx) => (
                                    <PaginationItem key={idx}>
                                        {p === "..." ? (
                                            <span className="px-3 py-1 text-sm text-gray-400">...</span>
                                        ) : (
                                            <PaginationLink
                                                isActive={page === p}
                                                onClick={() => setPage(p)}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        )}
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        onClick={() => page < totalPages && setPage(page + 1)}
                                        className={page >= totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>

                        <Select
                            value={String(limit)}
                            onValueChange={(val) => {
                                setPage(1);
                                setLimit(Number(val));
                            }}
                        >
                            <SelectTrigger className="w-[110px] h-9 text-xs">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / page</SelectItem>
                                <SelectItem value="20">20 / page</SelectItem>
                                <SelectItem value="50">50 / page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <PartialReturnCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </InnerDashboardLayout>
    );
}
