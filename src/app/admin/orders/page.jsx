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
import { ChevronDown, Loader2, Search, ShoppingBag, ChevronRight } from 'lucide-react'
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
    { key: 'all', label: 'All Orders' },
    { key: 'web', label: 'Website Orders' },
    { key: 'app', label: 'App Orders' },
    { key: 'pos', label: 'POS Orders' },
    { key: 'manual', label: 'Manual Orders' },
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

const STATUS_CLASSES = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Shipped: 'bg-amber-100 text-amber-800 border-amber-200',
    Delivered: 'bg-teal-100 text-teal-800 border-teal-200',
    Cancelled: 'bg-slate-100 text-slate-800 border-slate-200',
    Hold: 'bg-purple-100 text-purple-800 border-purple-200',
    Returned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Replaced: 'bg-violet-100 text-violet-800 border-violet-200',
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
        manualOrderCount,
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
        manual: manualOrderCount,
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
            console.log("ðŸ“¤ Sending request to backend:", {
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

            console.log("âœ… Received response from backend:", res);

            // Trigger browser download
            const blob = new Blob([res.data], { type: res.headers["content-type"] });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `orders_${startDate}_to_${endDate}.xlsx`;
            link.click();

            toast.success("Export completed âœ…");
        } catch (err) {
            console.error("âŒ Failed to export:", err);
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
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            <ShoppingBag className="w-8 h-8 text-slate-800" />
                            Orders
                        </h1>
                        <p className="text-slate-500 mt-1">Showing Summary: <strong>{formattedStart}</strong> - <strong>{formattedEnd}</strong></p>
                    </div>
                    <div className="flex gap-2 flex-wrap self-start md:self-auto">
                        {/* Toggle amount cards */}
                        <Button variant="outline" onClick={() => setShowAmountCards(prev => !prev)} className="border-slate-200 hover:bg-slate-50">
                            <ChevronDown className={`transition-transform duration-300 ${showAmountCards ? '' : 'rotate-180'}`} />
                        </Button>

                        {/* Export Data */}
                        {onlyAdmin() && (
                            <>
                                <Button variant="outline"
                                    disabled={reportMutation.isPending}
                                    onClick={handleDownloadTodayLabels}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-700"
                                >
                                    {reportMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Download Today's Labels
                                </Button>
                                <Button variant="outline"
                                    disabled={isLoading}
                                    onClick={handleExportData}
                                    className="border-slate-200 hover:bg-slate-50 text-slate-700"
                                >
                                    Export as CSV
                                </Button>
                            </>
                        )}

                        <CSVLink
                            data={csvData}
                            filename={`order-items-${startDate}-${endDate}.csv`}
                            className="hidden"
                            ref={csvLinkRef}
                            target="_blank"
                        />

                        <RefreshButton queryPrefix='orders' />

                        <DateRangeSelector onChange={(selected) => {
                            setRange(selected)
                            setPage(1)
                        }} defaultRange={initialRange} />
                    </div>
                </div>

                {/* Amount Cards */}
                <div className={`transition-all duration-500 overflow-hidden ${showAmountCards ? 'max-h-[1000px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'}`}>
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

                {/* Status Filter Cards - Slate pill buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setStatus(null); setPage(1); }}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${status === null
                            ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        All ({totalCount || 0})
                    </button>
                    {STATUS_CARDS.map((statusFilter) => (
                        <button
                            key={statusFilter}
                            onClick={() => {
                                setStatus(prev => prev === statusFilter ? null : statusFilter)
                                setPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${status === statusFilter
                                ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {statusFilter} ({STATUS_COUNT_MAP[statusFilter] ?? 0})
                        </button>
                    ))}
                </div>

                {/* Tabs - Clean underline style */}
                <div className="flex border-b border-slate-200 gap-6">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => {
                                setOrderType(key)
                                setPage(1)
                            }}
                            className={`pb-3 font-semibold text-sm transition-all duration-200 border-b-2 -mb-[2px] ${orderType === key
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {label} ({TABS_COUNT_MAP[key] ?? 0})
                        </button>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3">
                    <Select value={queryParameter} onValueChange={(val) => { setQueryParameter(val); setPage(1) }}>
                        <SelectTrigger className="min-w-[150px] border-slate-200">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="order">Order</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            type={'text'}
                            placeholder="Search orders..."
                            className={'pl-10 border-slate-200 focus-visible:ring-slate-900'}
                            onChange={(e) => {
                                const val = e.target.value
                                if (val && val?.length >= 2)
                                    handleDebouncedSearch(val)
                                else return;
                            }}
                        />
                    </div>
                    <Button
                        onClick={() => handleDebouncedSearch("")}
                        variant="outline"
                        className="border-slate-200 hover:bg-slate-50 text-slate-700"
                        disabled={isLoading}
                    >
                        Reset
                    </Button>
                </div>

                {/* Table */}
                {isLoading ? (
                    <TableSkeleton showHeader={false} />
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
                        <p className="text-slate-400 text-sm mt-1">We couldn't find any orders matching your criteria.</p>
                    </div>
                ) : (
                    <OrdersListView
                        orders={orders}
                        canEdit={canEdit}
                        orderType={orderType}
                    />
                )}

                {/* Pagination */}
                <div className="flex w-full justify-end gap-2 items-center pb-8">
                    <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                        <SelectTrigger className="w-[120px] border-slate-200">
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
            </div>
        </InnerDashboardLayout>
    )
}
