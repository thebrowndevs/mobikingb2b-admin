"use client"

import React, { useState, useEffect } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import CouponDialog from './components/CouponDialog';
import { useCoupons } from '@/hooks/useCoupons';
import { getPaginationRange } from '@/lib/services/getPaginationRange';
import TableSkeleton from '@/components/custom/TableSkeleton';
import CouponsTable from './components/CouponsTable';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import NotAuthorizedPage from '@/components/notAuthorized';
import { Tag } from 'lucide-react'

function Page() {
    const [couponDialogOpen, setCouponDialogOpen] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(undefined)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // debounce hook
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

    const { couponsQuery, deleteCoupon, updateCoupon, permissions: { canView, canAdd, canEdit, canDelete } } = useCoupons();

    const coupons = couponsQuery({
        page: page,
        limit: limit,
        searchQuery: debouncedSearch,
    })

    const allCoupons = coupons.data?.data?.coupons || []
    const totalPages = coupons.data?.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    function handleEditCoupon(coupon) {
        setSelectedCoupon(coupon);
        updateCoupon.reset();
        setCouponDialogOpen(true);
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Coupon Codes</h1>
                    <p className="text-sm text-slate-500 mt-1">Create and manage discounts, promotions, and store coupon codes</p>
                </div>
                {canAdd && (
                    <div className="w-full md:w-auto shrink-0">
                        <Button 
                            onClick={() => {
                                setCouponDialogOpen(true)
                                setSelectedCoupon(undefined)
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold px-5 h-10 border-0 flex items-center gap-2"
                        >
                            <Tag className="h-4 w-4" />
                            Add New
                        </Button>
                    </div>
                )}
            </div>

            <div className="w-full flex flex-col gap-4 pb-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    {/* Total Badge */}
                    <div className="text-xs font-bold bg-slate-50 border border-slate-200/60 text-slate-600 px-4 py-2.5 rounded-xl shrink-0 text-center sm:text-left select-none">
                        Total Coupons: {coupons.data?.data?.totalCount || 0}
                    </div>

                    {/* Search Bar */}
                    <Input
                        placeholder="Search coupons by code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full flex-1 bg-white border-slate-200/80 rounded-xl focus-visible:ring-indigo-500/40 text-sm h-10"
                    />
                </div>
            </div>

            {coupons.isLoading ? (
                <TableSkeleton showHeader={false} />
            ) : (
                <CouponsTable
                    error={coupons.error}
                    coupons={allCoupons}
                    onDelete={deleteCoupon.mutateAsync}
                    isDeleting={deleteCoupon.isPending}
                    deleteError={deleteCoupon.error}
                    onEdit={handleEditCoupon}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            )}

            <div className="flex w-full justify-end gap-2 items-center mt-4">
                {/* Limit Dropdown */}
                <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                    <SelectTrigger className="w-[120px] rounded-xl border-slate-200/80">
                        <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                                <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} className="rounded-xl" />
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
                                        className="rounded-xl"
                                    >
                                        {p}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} className="rounded-xl" />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>

            <CouponDialog
                open={couponDialogOpen}
                onOpenChange={setCouponDialogOpen}
                selectedCoupon={selectedCoupon}
            />
        </InnerDashboardLayout>
    )
}

export default Page;