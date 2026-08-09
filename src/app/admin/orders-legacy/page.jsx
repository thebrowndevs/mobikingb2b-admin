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
import { useReports } from '@/hooks/useReports'
import { exportToExcel } from '@/lib/exportToExcel'

const TABS = [
    { key: 'all', label: 'ALL ORDERS' },
    { key: 'web', label: 'WEBSITE ORDERS' },
    { key: 'app', label: 'APP ORDERS' },
    { key: 'pos', label: 'POS ORDERS' },
    { key: 'abandoned', label: 'ABANDONED CHECKOUT ORDERS' },
]

const STATUS_CARDS = [
    'New',
    'Accepted',
    'Rejected',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Hold'
]

const STATUS_BORDER = {
    New: 'border-indigo-500',
    Accepted: 'border-green-500',
    Rejected: 'border-red-500',
    Shipped: 'border-yellow-500',
    Delivered: 'border-teal-500',
    Cancelled: 'border-red-500',
    Returned: 'border-indigo-500',
    Replaced: 'border-purple-500',
    Hold: 'border-purple-500',
}

const STATUS_BG = {
    New: 'bg-indigo-500',
    Accepted: 'bg-green-500',
    Rejected: 'bg-red-500',
    Shipped: 'bg-yellow-500',
    Delivered: 'bg-teal-500',
    Cancelled: 'bg-red-500',
    Returned: 'bg-indigo-500',
    Replaced: 'bg-purple-500',
    Hold: 'bg-purple-500',
}

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
                    fullName: item?.fullName || "",
                    variant: item?.variantName || "",
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
                        fullName: item?.fullName || "",
                        variant: item?.variantName || "",
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
    const [orderType, setOrderType] = useState('all')

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

    const { getOrdersByDate, onlyAdmin, getSalesByDate, permissions: { canView, canAdd, canEdit, canDelete }, } = useOrders();
    const { reportMutation } = useReports();

    const formattedStart = format(range?.from, 'dd MMM yyyy')
    const formattedEnd = format(range?.to, 'dd MMM yyyy')

    const startDate = format(range?.from, 'yyyy-MM-dd')
    const endDate = format(range?.to, 'yyyy-MM-dd')

    // Data fetching
    const { data: customOrdersData, isLoading, error } = getOrdersByDate({
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

    const {
        newCount,
        acceptedCount,
        rejectedCount,
        holdCount,
        shippedCount,
        deliveredCount,
        cancelledCount,
        totalCount,
        allOrderCount,
        websiteOrderCount,
        appOrderCount,
        posOrderCount,
        abandonedOrderCount
    } = customOrdersData || {};

    const STATUS_COUNT_MAP = {
        New: newCount,
        Accepted: acceptedCount,
        Rejected: rejectedCount,
        Hold: holdCount,
        Shipped: shippedCount,
        Delivered: deliveredCount,
        Cancelled: cancelledCount
    };

    const TABS_COUNT_MAP = {
        all: allOrderCount,
        web: websiteOrderCount,
        app: appOrderCount,
        pos: posOrderCount,
        abandoned: abandonedOrderCount
    };

    const orders = customOrdersData?.orders || [];
    const totalPages = customOrdersData?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    // if (showAmountCards) {
    const {
        data: salesCountData,
        isLoading: isSalesFetching,
        refetch: refetchSales
    } = getSalesByDate({ params: { startDate, endDate }, enabled: false });

    // run only when cards are shown
    useEffect(() => {
        if (showAmountCards) {
            refetchSales();
        }
    }, [showAmountCards, startDate, endDate, refetchSales]);

    //Export data Function
    const handleExportData = async () => {
        const toastId = toast.loading("Exporting...");
        try {
            console.log("📤 Sending request to backend:", {
                startDate,
                endDate,
                url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/custom`
            });

            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/custom?startDate=${startDate}&endDate=${endDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    responseType: "blob", // important for file download
                }
            );

            console.log("✅ Received response from backend:", res);

            // Trigger browser download
            const blob = new Blob([res.data], { type: res.headers["content-type"] });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `orders_${startDate}_to_${endDate}.xlsx`;
            link.click();

            toast.success("Export completed ✅");
        } catch (err) {
            console.error("❌ Failed to export:", err);
            toast.error(err?.message || err?.response?.data?.message);
        } finally {
            toast.dismiss(toastId);
        }
    };
    
    const handleDownloadTodayLabels = async () => {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const columns = [
            "_id", "orderId", "name", "phoneNo", "type", "method", "status",
            "shippingLabelUrl", "shippingManifestUrl", "shipmentId", "awbCode",
            "courierName", "shippingStatus", "pickupDate", "expectedDeliveryDate",
            "createdAt", "updatedAt"
        ];

        try {
            const res = await reportMutation.mutateAsync({
                model: "Order",
                startDate: todayStr,
                endDate: todayStr,
                dateField: "shippedAt",
                status: ["Shipped"],
                columns: columns
            });

            const data = res?.data?.data || res?.data || [];
            if (data.length === 0) {
                toast.error("No orders found for today.");
                return;
            }

            // Map to nice Excel headers
            const formattedData = data.map(order => ({
                "ID": order._id,
                "Order ID": order.orderId,
                "Customer Name": order.name,
                "Phone": order.phoneNo,
                "Type": order.type,
                "Payment": order.method,
                "Status": order.status,
                "Label URL": order.shippingLabelUrl || "N/A",
                "Manifest URL": order.shippingManifestUrl || "N/A",
                "Shipment ID": order.shipmentId || "N/A",
                "AWB": order.awbCode || "N/A",
                "Courier": order.courierName || "N/A",
                "Shipping Status": order.shippingStatus || "N/A",
                "Pickup Date": order.pickupDate ? format(new Date(order.pickupDate), 'dd MMM yyyy') : "N/A",
                "Exp. Delivery": order.expectedDeliveryDate ? format(new Date(order.expectedDeliveryDate), 'dd MMM yyyy') : "N/A",
                "Created At": order.createdAt ? format(new Date(order.createdAt), 'dd-MM-yyyy HH:mm') : "N/A",
                "Updated At": order.updatedAt ? format(new Date(order.updatedAt), 'dd-MM-yyyy HH:mm') : "N/A"
            }));

            exportToExcel(
                Object.keys(formattedData[0]),
                formattedData,
                `Today-Order-Labels-${todayStr}.xlsx`
            );
        } catch (err) {
            console.error("Export failed:", err);
        }
    };

    useEffect(() => {
        // console.log(csvData)
        if (csvData && csvData?.length) {
            // Wait a bit for state update then trigger download
            // setTimeout(() => {
            csvLinkRef.current?.link.click();
            setCsvData([]);
            // }, 200);
        }
    }, [csvData])

    if (error) {
        console.log(error)
    }

    if (!canView) return <NotAuthorizedPage />


    return (
        <InnerDashboardLayout>
            {/* Header */}
            <div className="w-full flex items-center justify-between gap-4 border-b border-gray-500 pb-4">
                <div>
                    <h1 className="text-primary font-semibold sm:text-2xl lg:text-4xl">
                        Orders
                    </h1>
                    <p className='text-xs text-gray-600 mt-2'>Showing Summary: <strong>{formattedStart}</strong> - <strong>{formattedEnd}</strong></p>
                </div>
                <div className="space-x-1 flex">
                    {/* button to open and collapse amount cards */}
                    <Button variant="outline" onClick={() => setShowAmountCards(prev => !prev)}>
                        <ChevronDown className={`transition-transform duration-300 ${showAmountCards ? '' : 'rotate-180'}`} />
                    </Button>

                    {/* Export Data */}
                    {
                        onlyAdmin() &&
                        (
                            <>
                                <Button variant="outline"
                                    disabled={reportMutation.isPending}
                                    onClick={handleDownloadTodayLabels}
                                    className="border-primary text-primary hover:bg-primary/10"
                                >
                                    {reportMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Download Today's Labels
                                </Button>
                                <Button variant="outline"
                                    disabled={isLoading}
                                    onClick={handleExportData}
                                >
                                    Export as CSV
                                </Button>
                            </>
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

                    <DateRangeSelector onChange={(selected) => {
                        setRange(selected)
                        setPage(1)
                    }
                    } defaultRange={initialRange} />
                </div>
            </div>

            {/* Amount Cards */}
            <div
                className={`transition-all mb-6 duration-500 overflow-hidden ${showAmountCards ? 'max-h-[1000px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}
            >
                {showAmountCards && (
                    isSalesFetching ? (
                        <div className="flex justify-center p-6">
                            <Loader2 className="animate-spin" size={28} />
                        </div>
                    ) : (
                        <AmountCards data={salesCountData} />
                    )
                )}
            </div>

            {/* STATUS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 mt-6">
                {STATUS_CARDS.map((statusFilter) => (
                    <div
                        key={statusFilter}
                        className={`
        cursor-pointer 
        ${status === statusFilter ? `${STATUS_BG[statusFilter]} text-white` : 'bg-white'}
        ${STATUS_BORDER[statusFilter] || 'border-gray-300'} 
        border 
        rounded-lg 
        p-2 lg:p-4
        text-center 
        hover:shadow-sm 
        transition-all duration-300
      `}
                        onClick={() => {
                            setStatus(prev => prev === statusFilter ? null : statusFilter)
                            setPage(1);
                        }}
                    >
                        {isLoading
                            ? <div className='flex items-center justify-center mb-2'><Loader2 size={24} className='animate-spin' /></div>
                            : <h2 className="text-2xl font-bold">
                                {STATUS_COUNT_MAP[statusFilter] ?? 0}
                            </h2>
                        }
                        <p className={`text-xs lg:text-sm ${status === statusFilter ? 'text-white' : 'text-gray-600'}`}>
                            {statusFilter}
                        </p>
                    </div>
                ))}
            </div>


            {/* Search & filter */}
            <div className='flex items-center gap-3 mb-3 '>
                {/* filter by */}
                <Select value={queryParameter} onValueChange={(val) => { setQueryParameter(val); setPage(1) }}>
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
                    variant={isLoading ? 'secondary' : 'default'}
                    disabled={isLoading}
                >
                    Reset
                </Button>
            </div>

            {/* Tab bar */}
            <LayoutGroup>
                <div className="flex gap-2 mb-0 overflow-x-auto bg-white scrollbar-hide relative">
                    {TABS.map(({ key, label }) => {
                        const isActive = orderType === key
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setOrderType(key)
                                    setPage(1)
                                }}
                                className={`
            relative px-4 py-6 text-sm font-medium transition-all duration-300 flex gap-1 w-full min-w-fit items-center justify-center
            ${isActive ? 'font-bold text-black' : 'text-gray-600'}
          `}
                            >
                                <span>{label}</span>
                                <span>({TABS_COUNT_MAP[key]})</span>

                                {isActive && (
                                    <motion.div
                                        layoutId="tab-indicator"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </LayoutGroup>
            {/* Table */}
            {
                isLoading ?
                    <TableSkeleton showHeader={false} />
                    : <OrdersListView
                        orders={orders}
                        canEdit={canEdit}
                        orderType={orderType}
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
        </InnerDashboardLayout >
    )
}