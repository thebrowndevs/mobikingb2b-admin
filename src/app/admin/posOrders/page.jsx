'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CSVLink } from 'react-csv'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { useOrders } from '@/hooks/useOrders'
import { Button } from '@/components/ui/button'
import OrdersListView from './components/OrdersListView'
import POS from '@/components/POS'
import TableSkeleton from '@/components/custom/TableSkeleton'
import DateRangeSelector from '@/components/custom/DateRangeSelector'
import { format, startOfMonth, startOfToday, subDays } from 'date-fns'
import { Separator } from '@/components/ui/separator'
import AmountCards from './components/AmountCards'
import { ChevronDown, Loader2 } from 'lucide-react'
import { LayoutGroup, motion } from 'framer-motion'
import PosButton from '@/components/custom/PosButton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import debounce from 'lodash.debounce'
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import RefreshButton from '@/components/custom/RefreshButton'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuthStore } from '@/store/useAuthStore'
import NotAuthorizedPage from '@/components/notAuthorized'

const TABS = [
    { key: 'pos', label: 'POS ORDERS' },
]

// For flattening the order data to make it exportable as csv
const flattenOrder = (orders) => {
    const rows = [];

    orders.forEach((order) => {
        order.items?.forEach((item, index) => {
            if (index > 0) {
                rows.push({
                    _id: order._id,
                    orderId: order.orderId,
                    createdAt: "",
                    type: "",
                    method: "",
                    status: "",
                    shippingStatus: "",
                    paymentStatus: "",
                    paymentDate: "",
                    name: "",
                    phoneNo: "",
                    userId: "",

                    //items
                    itemNo: index + 1,
                    productId: item?.productId?._id || "",
                    name_item: item?.productId?.name || "",
                    fullName: item?.productId?.fullName || "",
                    variant: item?.productId?.variantName || "",
                    quantity: item?.quantity ?? "",
                    price: item?.price ?? "",

                    //other details

                    subtotal: "",
                    deliveryCharge: "",
                    discount: "",
                    orderAmount: "",
                    gst: "",
                    isAppOrder: "",
                    abondonedOrder: "",
                    pickupScheduled: "",
                    length: "",
                    breadth: "",
                    height: "",
                    weight: "",
                    updatedAt: "",
                });
            } else {
                rows.push(
                    {
                        _id: order._id,
                        orderId: order.orderId,
                        createdAt: order.createdAt,
                        type: order.type,
                        method: order.method,
                        status: order.status,
                        shippingStatus: order.shippingStatus,
                        paymentStatus: order.paymentStatus,
                        paymentDate: order.paymentDate || "",
                        name: order.name,
                        phoneNo: order.phoneNo,
                        userId: order.userId?._id || "",

                        //items
                        itemNo: index + 1,
                        productId: item?.productId?._id || "",
                        name_item: item?.productId?.name || "",
                        fullName: item?.productId?.fullName || "",
                        variant: item?.productId?.variantName || "",
                        quantity: item?.quantity ?? "",
                        price: item?.price ?? "",

                        //other details

                        subtotal: order.subtotal,
                        deliveryCharge: order.deliveryCharge,
                        discount: order.discount,
                        orderAmount: order.orderAmount,
                        gst: order.gst,
                        isAppOrder: order.isAppOrder,
                        abondonedOrder: order.abondonedOrder,
                        pickupScheduled: order.pickupScheduled,
                        length: order.length,
                        breadth: order.breadth,
                        height: order.height,
                        weight: order.weight,
                        updatedAt: order.updatedAt,
                    }
                )
            }
        });
    });

    return rows;
};

export default function Page() {
    const [showAmountCards, setShowAmountCards] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // type - web, app, pos, abandoned
    const [orderType, setOrderType] = useState('pos')

    // Status = New, Cancelled, Rejected, Accepted, Shipped
    const [status, setStatus] = useState(null);

    // for search
    const [searchQuery, setSearchQuery] = useState('')
    const [queryParameter, setQueryParameter] = useState('customer')

    // For Exporting Data
    const { accessToken } = useAuthStore();
    const csvLinkRef = useRef();
    const [csvData, setCsvData] = useState([]);

    const handleDebouncedSearch = useCallback(
        debounce((value) => {
            setSearchQuery(value)
            setPage(1)
        }, 500), // 500ms delay 
        []
    )

    // Date range
    const today = new Date();
    const pastDate = new Date();
    const from = pastDate.setDate(today.getDate() - 60)
    const initialRange = { from: from, to: today }
    const [range, setRange] = useState(initialRange)

    useEffect(() => {
        setRange(initialRange)
    }, [])

    const { getOrdersByDate, permissionsPosTab: { canAddPosTab, canDeletePosTab, canEditPosTab, canViewPosTab } } = useOrders();

    const formattedStart = format(range.from, 'dd MMM yyyy')
    const formattedEnd = format(range.to, 'dd MMM yyyy')

    const startDate = format(range.from, 'yyyy-MM-dd')
    const endDate = format(range.to, 'yyyy-MM-dd')

    // Data fetching
    const { data: customOrdersData, isFetching, error } = getOrdersByDate({
        params: {
            page: page,
            limit: limit,
            startDate,
            endDate,
            queryParameter,
            searchQuery,
            type: orderType,
            status
        }
    })

    const orders = customOrdersData?.orders || [];
    const totalPages = customOrdersData?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    //Export data Function
    const handleExportData = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/custom?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // replace `token` with your actual token variable
                    },
                }
            );

            // fetch your order data
            if (!res?.data?.success)
                throw new Error("Could not export data");

            const flattened = flattenOrder(res.data.data);
            setCsvData(flattened);

        } catch (err) {
            console.error("Failed to export:", err);
            toast.error(err?.message || err?.response?.data?.message);
        }
    }

    useEffect(() => {
        if (csvData && csvData?.length) {
            csvLinkRef.current?.link.click();
            setCsvData([]);
        }
    }, [csvData])

    if (error) {
        console.log(error)
    }

    if (!canViewPosTab) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-4 border-b border-gray-500 pb-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">
                        POS Orders
                    </h1>
                    <p className='text-sm text-slate-500'>Showing Summary: <strong>{formattedStart}</strong> - <strong>{formattedEnd}</strong></p>
                </div>
                <div className="space-x-1 flex">
                    {/* Export Data */}
                    {
                        (
                            <Button variant="outline"
                                disabled={isFetching}
                                onClick={handleExportData}
                            >
                                Export as CSV
                            </Button>
                        )
                    }

                    <CSVLink
                        data={csvData}
                        filename={`order-items-${startDate}-${endDate}.csv`}
                        className="hidden"
                        ref={csvLinkRef}
                        target="_blank"
                    />

                    <RefreshButton
                        queryPrefix='orders'
                    />

                    <DateRangeSelector onChange={setRange} defaultRange={initialRange} />
                </div>
            </div>

            {/* Search & filter */}
            <div className='flex items-center gap-3 mb-3 '>
                {/* filter by */}
                <Select value={queryParameter} onValueChange={(val) => setQueryParameter(val)}>
                    <SelectTrigger className="min-w-[150px] border-gray-300">
                        <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                    </SelectContent>
                </Select>

                {/* Search bar */}
                <Input
                    type={'text'}
                    placeholder="Search"
                    className={'border-gray-300'}
                    // value={searchQuery}
                    onChange={(e) => {
                        const val = e.target.value
                        if (val && val?.length >= 2)
                            handleDebouncedSearch(val)
                        else return;
                    }}
                />
                <Button
                    onClick={
                        () => handleDebouncedSearch("")
                    }
                    variant={isFetching ? 'secondary' : 'default'}
                    disabled={isFetching}
                >
                    Reset
                </Button>
            </div>

            {/* Table */}
            {isFetching ?
                <TableSkeleton showHeader={false} />
                : <OrdersListView
                    orders={orders}
                    canEditPos={canEditPosTab}
                />
            }

            {/* Pagination */}
            <div className="flex w-full justify-end gap-2 items-center mt-3 pb-8">
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