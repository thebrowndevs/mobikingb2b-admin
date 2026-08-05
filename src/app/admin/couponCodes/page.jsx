"use client"
import React, { useState, useEffect } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { Button } from '@/components/ui/button';
import CouponDialog from './components/CouponDialog';
import { useCoupons } from '@/hooks/useCoupons';
import { getPaginationRange } from '@/lib/services/getPaginationRange';
import TableSkeleton from '@/components/custom/TableSkeleton';
import CouponsTable from './components/CouponsTable';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import NotAuthorizedPage from '@/components/notAuthorized';

function page() {
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
            <div className="w-full flex flex-col gap-4 pb-4">
                <div className='flex items-center justify-between w-full mb-3'>
                    <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-3">Coupon Codes</h1>
                    {canAdd &&
                        <Button onClick={() => {
                            setCouponDialogOpen(true)
                            setSelectedCoupon(undefined)
                        }}>
                            Add New
                        </Button>
                    }
                </div>
                {/* Toolbar */}
                <div className="flex flex-wrap justify-between items-center gap-2">
                    {/* Total */}
                    <Button variant="outline">
                        Total: {coupons.data?.data?.totalCount || 0}
                    </Button>

                    {/* Search Bar */}
                    <Input
                        placeholder="Search coupons..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full flex-1 bg-white"
                    />
                </div>
            </div>

            {(coupons.isLoading)
                ? <TableSkeleton showHeader={false} />
                : <>
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
                </>
            }

            <div className="flex w-full justify-end gap-2 items-center">
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

            <CouponDialog
                open={couponDialogOpen}
                onOpenChange={setCouponDialogOpen}
                selectedCoupon={selectedCoupon}
            />
        </InnerDashboardLayout>
    )
}

export default page