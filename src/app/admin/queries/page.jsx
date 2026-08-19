'use client'
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useQueries } from '@/hooks/useQueries'
import QueryTable from './components/QueryTable'
import QueryCards from './components/QueryCards'
import TableSkeleton from '@/components/custom/TableSkeleton'
import { format, startOfMonth, startOfToday, subDays } from 'date-fns'
import DateRangeSelector from '@/components/custom/DateRangeSelector'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { Search, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotAuthorizedPage from '@/components/notAuthorized'

function Page() {
    // Date range
    const today = new Date()
    const pastDate = new Date()
    const from = pastDate.setDate(today.getDate() - 6)

    const initialRange = { from: from, to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    function useDebouncedValue(value, delay = 500) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }, [value, delay]);

        return debouncedValue;
    }
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebouncedValue(searchTerm, 500);

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const startDate = format(range.from, 'yyyy-MM-dd')
    const endDate = format(range.to, 'yyyy-MM-dd')

    const { queriesQuery, getQueriesByDate, permissions: { canView, canAdd, canEdit, canDelete } } = useQueries();

    const { data: customQueriesData, isLoading, error } = getQueriesByDate({ page, limit, startDate, endDate, searchQuery: debouncedSearch })
    const displayQueries = customQueriesData ?? [];

    const allQueries = queriesQuery?.data?.data || []
    const [filteredData, setFilteredData] = useState()
    const totalPages = displayQueries?.pagination?.totalPages || 1;
    const paginationRange = getPaginationRange(page, totalPages);

    useEffect(() => {
        setFilteredData(displayQueries?.queries)
    }, [displayQueries])

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Queries</h1>
                    <p className="text-sm text-slate-500 mt-1">Showing Summary: <strong>{formattedStart}</strong> - <strong>{formattedEnd}</strong></p>
                </div>
                <div className="w-full md:w-auto ">
                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search queries by title, description, or Order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-8 bg-white border-slate-200/80 w-full text-sm rounded-xl focus-visible:ring-indigo-500/40"
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
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                        className="h-9 text-xs text-gray-500 hover:text-gray-900 gap-1.5 shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </Button>
                )}
            </div>

            <QueryCards
                queries={displayQueries?.queries}
                onTabChange={(tab) => {
                    if (tab === 'all') {
                        setFilteredData(displayQueries?.queries)
                    } else if (tab === 'pending') {
                        setFilteredData(displayQueries?.queries.filter(q => !q.isResolved))
                    } else if (tab === 'resolved') {
                        setFilteredData(displayQueries?.queries.filter(q => q.isResolved))
                    }
                }}
            />

            {isLoading
                ? <TableSkeleton showHeader={false} />
                : <QueryTable data={filteredData} canEdit={canEdit} />
            }

            <div className="flex w-full justify-end gap-2 items-center mt-3">
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

export default Page
