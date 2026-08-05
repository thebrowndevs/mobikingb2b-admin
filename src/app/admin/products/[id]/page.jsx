"use client"
import React, { useState } from 'react'
import { useParams } from 'next/navigation';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import Loader from '@/components/Loader';
import { useProducts } from '@/hooks/useProducts';
import ProductOrdersTable from './components/ProductOrdersTable';
import ProductDetails from './components/ProductDetails';
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

function page() {
    const params = useParams();
    const id = params.id;
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { getProductByIdQuery, getProductOrdersQuery } = useProducts()
    const { data: resp, isLoading, error } = getProductByIdQuery(id)
    const product = resp?.data || {};

    const { data: ordersResp, isLoading: isOrdersLoading } = getProductOrdersQuery(id, currentPage, limit);
    const orders = ordersResp?.orders || [];
    const totalPages = ordersResp?.pagination?.totalPages || 1;
    const totalCount = ordersResp?.totalCount || 0;

    if (isLoading) return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Product Details</h1>
            </div>
            <Loader />
        </InnerDashboardLayout>
    )
    if (error) return <p>Error: {error.message}</p>

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Product Details</h1>
            </div>
            <div className='space-y-3'>
                <ProductDetails product={product} />

                <div>
                    <div className="bg-white p-2 border border-gray-200 flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-gray-700">Orders ({totalCount})</h2>
                    </div>
                    <div className="bg-white border-x border-b border-gray-200 pb-2 px-2 pt-0.5">
                        <ProductOrdersTable
                            product={product}
                            orders={orders}
                            page={currentPage}
                            limit={limit}
                            isLoading={isOrdersLoading}
                        />

                        <div className="flex w-full justify-end items-center gap-2 mt-4">
                            <Select value={String(limit)} onValueChange={(val) => { setCurrentPage(1); setLimit(Number(val)) }}>
                                <SelectTrigger className="w-[120px] bg-white">
                                    <SelectValue placeholder="Items per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n} / page
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {totalPages > 1 && (
                                <Pagination className='inline justify-end mx-1 w-fit'>
                                    <PaginationContent>
                                        {currentPage > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => p - 1); }} />
                                            </PaginationItem>
                                        )}

                                        {getPaginationRange(currentPage, totalPages).map((p, i) => (
                                            <PaginationItem key={i}>
                                                {p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href="#"
                                                        isActive={p === currentPage}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(p);
                                                        }}
                                                    >
                                                        {p}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        {currentPage < totalPages && (
                                            <PaginationItem>
                                                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => p + 1); }} />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </InnerDashboardLayout>
    )
}

export default page