"use client"
import React, { useState, useEffect } from "react"
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import LoaderButton from "@/components/custom/LoaderButton"
import { useReports } from "@/hooks/useReports"
import { exportToExcel } from "@/lib/exportToExcel"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import NotAuthorizedPage from "@/components/notAuthorized"
import PCard from "@/components/custom/PCard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const reportSchema = z.object({
    model: z.enum(["Order", "Quotation"]),
    columns: z.array(z.string()).min(1, "At least one column is required"),
    method: z.array(z.string()).optional(),
    paymentStatus: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    type: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

const columnOptions = {
    Order: [
        "orderId", "status", "type", "method", "paymentMode", "latitude", "longitude", "comments", "reason",
        "orderAmount", "deliveryCharge", "discount", "discountPercent", "discountType", "gst", "subtotal",
        "name", "email", "phoneNo", "address", "address2", "city", "state", "pincode", "country", "addressId", "userId",
        "items", "length", "breadth", "height", "weight", "createdAt", "updatedAt",
        "orderState", "shippingStatus", "shippingType", "awbCode", "courierName", "trackingUrl",
        "pickupScheduled", "pickupDate", "expectedDeliveryDate", "deliveredAt", "acceptedAt", "acceptedReason",
        "shippedAt", "shippingReason", "shippingLabelUrl", "shippingManifestUrl", "_restockDone",
        "amountPaid", "remainingAmount", "paymentStatus", "refundAmount", "refundStatus", "refundReason", "refundedAt",
        "quotationId", "quotationRef", "query", "payments",
    ],
    Quotation: [
        "quotationId", "status", "type", "method", "paymentMode", "latitude", "longitude", "comments", "reason",
        "orderAmount", "deliveryCharge", "discount", "discountPercent", "discountType", "gst", "subtotal",
        "name", "email", "phoneNo", "address", "address2", "city", "state", "pincode", "country", "addressId", "userId",
        "items", "length", "breadth", "height", "weight", "createdAt", "updatedAt",
        "reservedStockRestored", "orderRef", "orderId", "query",
    ],
}

const GST_EXPORT_COLUMNS = [
    "gstin",
    "buyerName",
    "invoiceNo",
    "invoiceDate",
    "pos",
    "totalInvoiceValue",
    "rate",
    "taxableValue",
    "cgst",
    "sgst",
]

const REQUIRED_GST_BACKEND_COLUMNS = [
    "orderId",
    "orderAmount",
    "gst",
    "name",
    "state",
    "createdAt"
]

const methodOptions = ["COD", "Online", "Cash", "UPI"]
const paymentStatusOptions = ['Pending', 'Paid']
const orderTypes = ['regular', 'app&pos', 'web&pos', 'app', 'web', 'pos']
const orderStatusOptions = ["New", "Accepted", "Rejected", "Shipped", "Delivered", "Cancelled", "Returned", "Replaced", "Hold"]
const quotationStatusOptions = ["New", "Accepted", "Rejected", "Cancelled", "Hold", "Booked"]

const formatDate = (date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const parseDateString = (dateStr) => {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export default function OrdersQuotationsReportPage() {
    const { reportMutation, permissions: { canView, canAdd } } = useReports()
    const [selectAll, setSelectAll] = useState(false)
    const [isGSTMode, setIsGSTMode] = useState(false)

    const form = useForm({
        resolver: zodResolver(reportSchema),
        mode: "onSubmit",
        defaultValues: {
            model: "Order",
            columns: [],
            method: [],
            paymentStatus: [],
            status: [],
        },
    })

    const { control, watch, setValue, handleSubmit, formState: { errors } } = form
    const selectedModel = watch("model")
    const selectedCols = watch("columns")

    useEffect(() => {
        setIsGSTMode(false)
        setValue("columns", [])
        setSelectAll(false)
    }, [selectedModel, setValue])

    useEffect(() => {
        if (!isGSTMode) {
            setSelectAll(false)
            setValue("columns", [])
        }
    }, [isGSTMode, setValue])

    const toggleColumn = (column) => {
        if (isGSTMode) return
        const current = form.getValues("columns")
        let next = current.includes(column)
            ? current.filter(c => c !== column)
            : [...current, column]

        if (column === "coupon") {
            if (next.includes("coupon")) {
                if (!next.includes("couponCode")) next.push("couponCode")
                if (!next.includes("couponType")) next.push("couponType")
            } else {
                next = next.filter(c => c !== "couponCode" && c !== "couponType")
            }
        }
        setValue("columns", next)
    }

    const toggleSelectAll = () => {
        if (isGSTMode) return
        if (selectAll) {
            setValue("columns", [])
        } else {
            setValue("columns", [...columnOptions[selectedModel]])
        }
        setSelectAll(!selectAll)
    }

    const toggleArrayValue = (fieldName, value) => {
        const current = form.getValues(fieldName) || []
        const next = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value]
        setValue(fieldName, next)
    }

    const transformOrderForGST = (orders) => {
        const GST_RATE = 18
        return orders
            .filter(order => Number(order.gst) != 0)
            .map(order => {
                const orderAmount = Number(order.orderAmount || 0)
                const taxableValue = +(orderAmount / (1 + GST_RATE / 100)).toFixed(2)
                const gstAmount = +(orderAmount - taxableValue).toFixed(2)
                const cgst = +(gstAmount / 2).toFixed(2)
                const sgst = +(gstAmount / 2).toFixed(2)

                return {
                    gstin: order.gst || "",
                    buyerName: order.name,
                    invoiceNo: `GST-${order.orderId}`,
                    invoiceDate: order.createdAt?.split("T")[0],
                    pos: order.state || "N/A",
                    totalInvoiceValue: orderAmount,
                    rate: GST_RATE,
                    taxableValue,
                    cgst,
                    sgst,
                }
            })
    }

    const transformOrderForItems = (orders, orderColumns) => {
        const flattened = []
        orders.forEach(order => {
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, index) => {
                    const row = { ...order }
                    if (index > 0) {
                        orderColumns.forEach(col => {
                            if (col !== "items") {
                                row[col] = ""
                            }
                        })
                    }
                    row.productId = item.productId?._id || item.productId || ""
                    row.itemName = item.productId?.fullName || item.productId?.name || item.fullName || item.name || ""
                    row.variantId = item.variantId || ""
                    row.variant = item.variantName || ""
                    row.quantity = item.quantity || 0
                    row.itemPrice = item.price || 0
                    row.purchasePrice = item.purchasePrice || (item.purchaseSets?.[0]?.price || 0)
                    row.itemDiscount = item.discountType === "percentage" ? `${item.discountPercent}%` : `₹${item.discount || 0}`
                    row.totalItemValue = (item.price - (item.discount || 0)) * item.quantity
                    row.isScratchy = item.isScratchy ? "True" : "False"
                    flattened.push(row)
                })
            } else {
                flattened.push(order)
            }
        })
        return flattened
    }

    const onSubmit = async (values) => {
        const res = await reportMutation.mutateAsync(values)
        let data = res?.data?.data || []

        if (isGSTMode) {
            data = transformOrderForGST(data)
            exportToExcel(GST_EXPORT_COLUMNS, data, "GST-Sales-Report.xlsx")
            setIsGSTMode(false)
            return
        }

        // Map Query status
        data = data.map(item => {
            if (item.query) {
                item.query = item.query.isResolved ? "Resolved" : "Open";
            }
            return item;
        });

        // Determine max payments
        let maxPayments = 0;
        data.forEach(item => {
            if (item.payments && Array.isArray(item.payments)) {
                maxPayments = Math.max(maxPayments, item.payments.length);
            }
        });

        // Map Payments fields
        data = data.map(item => {
            if (item.payments && Array.isArray(item.payments)) {
                item.payments.forEach((p, index) => {
                    const i = index + 1;
                    item[`P${i} Amount`] = p.amount ?? "";
                    item[`P${i} Method`] = p.method ?? "";
                    item[`P${i} Status`] = p.status ?? "";
                    item[`P${i} ID/UTR`] = p.paymentId ?? "";
                    item[`P${i} Date`] = p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "";
                    item[`P${i} Notes`] = p.notes ?? "";
                });
            }
            return item;
        });

        // Build dynamic columns
        let finalColumns = [...values.columns]
        if (finalColumns.includes("payments")) {
            const idx = finalColumns.indexOf("payments")
            const dynCols = []
            for (let i = 1; i <= maxPayments; i++) {
                dynCols.push(`P${i} Amount`)
                dynCols.push(`P${i} Method`)
                dynCols.push(`P${i} Status`)
                dynCols.push(`P${i} ID/UTR`)
                dynCols.push(`P${i} Date`)
                dynCols.push(`P${i} Notes`)
            }
            finalColumns.splice(idx, 1, ...dynCols)
        }

        // Flatten items if selected
        if (finalColumns.includes("items")) {
            const orderColumns = finalColumns.filter(col => col !== "items")
            data = transformOrderForItems(data, orderColumns)
            finalColumns = finalColumns.flatMap(col =>
                col === "items"
                    ? ["productId", "itemName", "variantId", "variant", "quantity", "itemPrice", "purchasePrice", "itemDiscount", "totalItemValue", "isScratchy"]
                    : col
            )
        }

        exportToExcel(finalColumns, data, `${values.model}-report.xlsx`)
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Orders & Quotations Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Generate and export custom order entries and client quotation summaries to Excel</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    {selectedModel === "Order" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (isGSTMode) {
                                    setIsGSTMode(false)
                                } else {
                                    setIsGSTMode(true)
                                    setValue("columns", REQUIRED_GST_BACKEND_COLUMNS)
                                }
                            }}
                            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-10 px-4"
                        >
                            {isGSTMode ? "Exit GST Mode" : "GST Report Mode"}
                        </Button>
                    )}
                    {canAdd && (
                        <LoaderButton
                            loading={reportMutation.isPending}
                            onClick={handleSubmit(onSubmit)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold px-5 h-10 border-0 flex items-center gap-2"
                        >
                            Generate Report
                        </LoaderButton>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Model Selection */}
                        <PCard>
                            <FormField
                                control={control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-800 text-sm">Select Module</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full rounded-xl border-slate-200/85">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Order">Orders</SelectItem>
                                                <SelectItem value="Quotation">Quotations</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* Columns Selection */}
                        <PCard>
                            <FormField
                                control={control}
                                name="columns"
                                render={() => (
                                    <FormItem>
                                        <div className="flex justify-between items-center mb-4">
                                            <FormLabel className="font-bold text-slate-800 text-sm">Columns to Export</FormLabel>
                                            {!isGSTMode && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={toggleSelectAll}
                                                    className="rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-semibold h-8"
                                                >
                                                    {selectAll ? "Deselect All" : "Select All"}
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[250px] overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50/50 scrollbar-hide">
                                            {(columnOptions[selectedModel] || []).map((column) => (
                                                <div key={column} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-white hover:shadow-sm hover:shadow-slate-100 transition-all duration-200">
                                                    <Checkbox
                                                        id={column}
                                                        disabled={isGSTMode}
                                                        checked={selectedCols.includes(column)}
                                                        onCheckedChange={() => toggleColumn(column)}
                                                        className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    />
                                                    <label htmlFor={column} className="text-xs font-bold text-slate-700 capitalize cursor-pointer select-none">
                                                        {column}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {/* Date Filters */}
                        <PCard>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="font-bold text-slate-800 text-sm mb-1.5">From Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className="w-full text-left pl-3 font-semibold text-slate-700 rounded-xl border-slate-200/85">
                                                            {field.value || "Pick a date"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 rounded-xl">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseDateString(field.value)}
                                                        onSelect={(date) => field.onChange(formatDate(date))}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="font-bold text-slate-800 text-sm mb-1.5">To Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" className="w-full text-left pl-3 font-semibold text-slate-700 rounded-xl border-slate-200/85">
                                                            {field.value || "Pick a date"}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0 rounded-xl">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseDateString(field.value)}
                                                        onSelect={(date) => field.onChange(formatDate(date))}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </PCard>

                        {/* Type Filter (Orders and Quotations) */}
                        {!isGSTMode && (
                            <PCard>
                                <FormField
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-slate-800 text-sm">
                                                {selectedModel === "Order" ? "Order Type" : "Quotation Type"}
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full rounded-xl border-slate-200/85">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    {orderTypes.map((t) => (
                                                        <SelectItem key={t} value={t} className="capitalize">
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </PCard>
                        )}

                        {/* Extra Order Specific Filters */}
                        {selectedModel === "Order" && !isGSTMode && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <PCard>
                                    <FormLabel className="font-bold text-slate-800 text-sm block mb-4">Payment Status</FormLabel>
                                    <div className="flex gap-4">
                                        {paymentStatusOptions.map(p => (
                                            <div key={p} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50/50 transition-colors duration-150">
                                                <Checkbox
                                                    id={`payment-${p}`}
                                                    checked={(watch("paymentStatus") || []).includes(p)}
                                                    onCheckedChange={() => toggleArrayValue("paymentStatus", p)}
                                                    className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                                <label htmlFor={`payment-${p}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none">{p}</label>
                                            </div>
                                        ))}
                                    </div>
                                </PCard>

                                <PCard>
                                    <FormLabel className="font-bold text-slate-800 text-sm block mb-4">Payment Methods</FormLabel>
                                    <div className="flex gap-4 flex-wrap">
                                        {methodOptions.map(m => (
                                            <div key={m} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50/50 transition-colors duration-150">
                                                <Checkbox
                                                    id={`method-${m}`}
                                                    checked={(watch("method") || []).includes(m)}
                                                    onCheckedChange={() => toggleArrayValue("method", m)}
                                                    className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                />
                                                <label htmlFor={`method-${m}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none">{m}</label>
                                            </div>
                                        ))}
                                    </div>
                                </PCard>
                            </div>
                        )}

                        {/* Status Checkboxes */}
                        {!isGSTMode && (
                            <PCard>
                                <FormLabel className="font-bold text-slate-800 text-sm block mb-4">
                                    {selectedModel === "Order" ? "Order Status" : "Quotation Status"}
                                </FormLabel>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {(selectedModel === "Order" ? orderStatusOptions : quotationStatusOptions).map((s) => (
                                        <div key={s} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50/50 transition-colors duration-150">
                                            <Checkbox
                                                id={`status-${s}`}
                                                checked={(watch("status") || []).includes(s)}
                                                onCheckedChange={() => toggleArrayValue("status", s)}
                                                className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                            <label htmlFor={`status-${s}`} className="text-xs font-bold text-slate-700 cursor-pointer select-none capitalize">{s}</label>
                                        </div>
                                    ))}
                                </div>
                            </PCard>
                        )}
                    </form>
                </Form>
            </div>
        </InnerDashboardLayout>
    )
}

