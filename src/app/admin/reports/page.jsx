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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import NotAuthorizedPage from "@/components/notAuthorized"
import PCard from "@/components/custom/PCard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// ---------------- ZOD ----------------
const reportSchema = z.object({
    model: z.enum([
        "Order",
        "Category",
        "Group",
        "Product",
        "SubCategory",
        "User",
        "Brand",
    ]),
    columns: z.array(z.string()).min(1, "At least one column is required"),
    method: z.array(z.string()).optional(),
    paymentStatus: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    type: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

// ---------------- COLUMN OPTIONS (UNCHANGED) ----------------
const columnOptions = {
    User: [
        "name", "email", "phoneNo", "address", "role", "orders",
        "createdAt", "updatedAt",
    ],
    Order: [
        "status", "holdReason", "shippingStatus", "paymentStatus",
        "shipmentId", "awbCode", "courierName", "pickupDate",
        "expectedDeliveryDate", "orderId", "type", "method",
        "orderAmount", "deliveryCharge", "discount", "gst",
        "coupon", "couponCode", "couponType",
        "subtotal", "name", "email", "phoneNo", "address",
        "addressId", "userId", "items", "createdAt", "updatedAt",
    ],
    Category: [
        "name", "image", "slug", "active", "subCategories",
        "createdAt", "updatedAt",
    ],
    Group: [
        "name", "sequenceNo", "banner", "active", "isBannerVisble",
        "isSpecial", "products", "createdAt", "updatedAt",
    ],
    Product: [
        "fullName", "slug", "description", "active", "brand",
        // "newArrival", "liked", "bestSeller", "recommended",
        "regularPrice", "basePrice", "sellingPrice", "gst", "category",
        "variants", "variantNames", "scratchyVariants", "scratchyVariantNames", "images",
        "scratchyStock", "totalStock", "orders", "groups",
        "createdAt", "updatedAt",
    ],
    SubCategory: [
        "name", "slug", "sequenceNo", "upperBanner", "lowerBanner",
        "active", "featured", "deliveryCharge", "minOrderAmount",
        "minFreeDeliveryOrderAmount", "photos", "parentCategory",
        "products", "createdAt", "updatedAt",
    ],
    Brand: [
        "name", "active", "image", "createdAt", "updatedAt"
    ],
}

// ---------------- GST CONFIG ----------------
const GST_EXPORT_COLUMNS = [
    "gstin",
    "buyerName",
    "invoiceNo",
    "invoiceDate",
    "pos",
    "totalInvoiceValue",
    "rate",
    "taxableValue",
    // "igst",
    "cgst",
    "sgst",
    // "cessAmount",
    // "reverseCharge"
]

const REQUIRED_GST_BACKEND_COLUMNS = [
    "orderId",
    "orderAmount",
    "gst",
    "name",
    "state",
    "createdAt"
]

const method = ["COD", "Online", "Cash", "UPI"];
const paymentStatus = ['Pending', 'Paid'];
const type = ['regular', 'app&pos', 'web&pos', 'app', 'web', 'pos', 'abandoned']
const status = ["New", "Accepted", "Rejected", "Shipped", "Delivered", "Cancelled", "Returned", "Replaced", "Hold"]

const userTypeOptions = ["frequent", "oneOrder", "noOrder"]
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

// ================= COMPONENT =================
export default function Page() {

    const { reportMutation, productSalesReportMutation, permissions: {
        canView,
        canAdd,
    } } = useReports()

    const [selectAll, setSelectAll] = useState(false)
    const [isGSTMode, setIsGSTMode] = useState(false)
    const [salesDate, setSalesDate] = useState({ from: "", to: "" })

    const form = useForm({
        resolver: zodResolver(reportSchema),
        mode: "onSubmit",
        defaultValues: {
            model: "Product",
            columns: [],
            method: [],
        },
    })

    const { control, watch, setValue, handleSubmit, formState: { errors } } = form
    const selectedModel = watch("model")
    const selectedCols = watch("columns")

    useEffect(() => {
        setIsGSTMode(false);
    }, [selectedModel])

    useEffect(() => {
        if (!isGSTMode) {
            setSelectAll(false)
            setValue("columns", [])
        }
    }, [isGSTMode])

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

                let cgst = 0
                let sgst = 0
                let igst = 0

                const isIntraState =
                    order.state?.toLowerCase() === "delhi"

                // if (isIntraState) {
                cgst = +(gstAmount / 2).toFixed(2)
                sgst = +(gstAmount / 2).toFixed(2)
                // } else {
                //     igst = gstAmount
                // }

                return {
                    gstin: order.gst || "",
                    buyerName: order.name,
                    invoiceNo: `GST-${order.orderId}`,
                    invoiceDate: order.createdAt?.split("T")[0],
                    pos: order.state,
                    totalInvoiceValue: orderAmount,
                    rate: GST_RATE,
                    taxableValue,
                    // igst,
                    cgst,
                    sgst,
                    // cessAmount: 0,
                    // reverseCharge: "N",
                }
            })
    }

    const transformProduct = (products) => {
        return products?.map(pr => {
            const brand = pr?.brand?.name;
            const category = pr?.category?.name;
            const images = pr?.images?.join(",");
            const groups = pr?.groups?.map(gr => gr?.name || gr)?.join(",");
            const sellingPrice = pr?.sellingPrice && pr?.sellingPrice?.length
                ? pr?.sellingPrice[pr?.sellingPrice?.length - 1]?.price : 0

            const variants = pr?.variants || {}
            const variantKeys = Object.keys(variants)

            const scratchyVariants = pr?.scratchyVariants || {}
            const scratchyVariantKeys = Object.keys(scratchyVariants)

            return {
                ...pr,
                sellingPrice,
                images,
                brand,
                category,
                groups,
                orders: pr?.orders?.length,
                variants: variantKeys.length,
                variantNames: variantKeys.join(", "),
                scratchyVariants: scratchyVariantKeys.length,
                scratchyVariantNames: scratchyVariantKeys.join(", "),
            }
        })
    }

    const transformUser = (users) => {
        return users?.map(user => {
            return {
                ...user,
                orders: user?.orders?.length || 0,
                orderCount: user?.orders?.length || 0,
            }
        })
    }

    const transformCategory = (items) => {
        return items?.map(item => ({
            ...item,
            subCategories: item?.subCategories?.length || 0,
            subCategoriesCount: item?.subCategories?.length || 0,
        }))
    }

    const transformSubCategory = (items) => {
        return items?.map(item => ({
            ...item,
            products: item?.products?.length || 0,
            productCount: item?.products?.length || 0,
            parentCategory: item?.parentCategory?.name || "",
        }))
    }

    const transformGroup = (items) => {
        return items?.map(item => ({
            ...item,
            products: item?.products?.length || 0,
            productCount: item?.products?.length || 0,
        }))
    }

    const transformBrand = (items) => {
        return items?.map(item => ({
            ...item,
            // Brands might not have a direct products array, so we just return as is or map length if populated
            productCount: item?.products?.length || 0,
        }))
    }

    const transformOrderForItems = (orders, orderColumns) => {
        const flattened = []
        orders.forEach(order => {
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, index) => {
                    const row = { ...order }

                    if (index > 0) {
                        // Clear order-level columns for subsequent items to avoid repetition
                        orderColumns.forEach(col => {
                            if (col !== "items") {
                                row[col] = ""
                            }
                        })
                    }

                    // Add item-specific fields
                    row.productId = item.productId?._id || item.productId || ""
                    row.itemName = item.productId?.fullName || item.productId?.name || item.fullName || item.name || ""
                    row.variant = item.variantName || ""
                    row.quantity = item.quantity || 0
                    row.itemPrice = item.price || 0
                    row.isScratchy = item.isScratchy ? "True" : "False"

                    flattened.push(row)
                })
            } else {
                flattened.push(order)
            }
        })
        return flattened
    }

    const onProductSalesReport = async () => {
        if (!salesDate.from || !salesDate.to) {
            toast.error("Please select both from and to dates for the sales report.")
            return
        }
        const res = await productSalesReportMutation.mutateAsync({
            startDate: salesDate.from,
            endDate: salesDate.to
        })
        const data = res?.data?.data || []
        // Map data to capitalized keys for nice Excel headers
        const formattedData = data.map(item => ({
            "Product Name": item.productName,
            "SKU": item.sku,
            "Group": item.group,
            "Set Type": item.setType,
            "Unit Price": item.unitPrice,
            "Qty": item.quantity,
            "Total Value": item.totalValue,
            "Last Purchase Price": item.lastPurchasePrice
        }))

        exportToExcel(
            ["Product Name", "SKU", "Group", "Set Type", "Unit Price", "Qty", "Total Value", "Last Purchase Price"],
            formattedData,
            "Product-Transaction-Sets.xlsx"
        )
    }

    const onSubmit = async (values) => {
        const res = await reportMutation.mutateAsync(values)
        let data = res?.data?.data || []

        if (isGSTMode) {
            data = transformOrderForGST(data)

            exportToExcel(
                GST_EXPORT_COLUMNS,
                data,
                "GST-Sales-Report.xlsx"
            )

            setIsGSTMode(false)
            return
        }

        if (values.model == "Product") {
            data = transformProduct(data);

            exportToExcel(
                values.columns,
                data,
                `${values.model}-report.xlsx`
            )
            return
        }

        if (values.model === "Order" && (values.columns.includes("items") || values.columns.includes("coupon") || values.columns.includes("couponCode") || values.columns.includes("couponType"))) {
            let finalData = data
            let finalColumns = [...values.columns]

            if (values.columns.includes("items")) {
                const orderColumns = values.columns.filter(col => col !== "items")
                finalData = transformOrderForItems(data, orderColumns)
                finalColumns = finalColumns.flatMap(col =>
                    col === "items"
                        ? ["productId", "itemName", "variant", "quantity", "itemPrice", "isScratchy"]
                        : col
                )
            }

            // Ensure discount column is present for coupon selection
            if (values.columns.includes("coupon") || values.columns.includes("couponCode") || values.columns.includes("couponType")) {
                if (!finalColumns.includes("discount")) {
                    finalColumns.push("discount")
                }
            }

            // Remove meta column "coupon" from Excel export
            finalColumns = finalColumns.filter(col => col !== "coupon")

            exportToExcel(finalColumns, finalData, `${values.model}-report.xlsx`)
            return
        }

        if (values.model === "User") {
            data = transformUser(data)
            exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
            return
        }

        if (values.model === "Category") {
            data = transformCategory(data)
            exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
            return
        }

        if (values.model === "SubCategory") {
            data = transformSubCategory(data)
            exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
            return
        }

        if (values.model === "Group") {
            data = transformGroup(data)
            exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
            return
        }

        if (values.model === "Brand") {
            data = transformBrand(data)
            exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
            return
        }

        exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>

            <div className="flex items-center justify-between mb-3">
                <h1 className="text-primary font-bold text-2xl">
                    Generate Report
                </h1>

                <div className="flex gap-2">

                    {selectedModel === "Order" && (
                        <Button
                            type="button"
                            disabled={!isGSTMode}
                            onClick={() => {
                                setIsGSTMode(false)
                            }}
                        >
                            Reset
                        </Button>
                    )}

                    {selectedModel === "Order" && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isGSTMode}
                            onClick={() => {
                                setIsGSTMode(true)
                                setValue("model", "Order")
                                setValue("columns", REQUIRED_GST_BACKEND_COLUMNS)
                            }}
                        >
                            Download GST Report
                        </Button>
                    )}

                    {selectedModel === "Product" && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">
                                    Download Sales Report
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="end">
                                <div className="space-y-4">
                                    <h4 className="font-bold">Sales Report Dates</h4>
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold">From Date</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full text-left font-normal text-xs">
                                                        {salesDate.from || "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseDateString(salesDate.from)}
                                                        onSelect={(date) => setSalesDate(prev => ({ ...prev, from: formatDate(date) }))}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold">To Date</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full text-left font-normal text-xs">
                                                        {salesDate.to || "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={parseDateString(salesDate.to)}
                                                        onSelect={(date) => setSalesDate(prev => ({ ...prev, to: formatDate(date) }))}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <LoaderButton
                                        loading={productSalesReportMutation.isPending}
                                        onClick={onProductSalesReport}
                                        className="w-full"
                                    >
                                        Download Excel
                                    </LoaderButton>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {canAdd &&
                        <LoaderButton
                            loading={reportMutation.isPending}
                            onClick={handleSubmit(onSubmit)}
                        >
                            Generate Report
                        </LoaderButton>
                    }

                </div>
            </div>

            <div className="mb-10">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                        {/* Model Selection */}
                        <PCard>
                            <FormField
                                control={control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className={'font-bold'}>Module</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.keys(columnOptions).map((model) => (
                                                    <SelectItem key={model} value={model}>
                                                        {model}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
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
                                            <FormLabel className={'font-bold'}>Columns</FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                            >
                                                {selectAll ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
                                            {(columnOptions[selectedModel] || []).map((column) => (
                                                <div key={column} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={column}
                                                        checked={selectedCols.includes(column)}
                                                        onCheckedChange={() => toggleColumn(column)}
                                                    />
                                                    <label
                                                        htmlFor={column}
                                                        className="text-sm capitalize font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {column}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        {errors.columns && (
                                            <p className="text-sm font-medium text-destructive mt-2">
                                                {errors.columns.message}
                                            </p>
                                        )}
                                        {/* 
                                        <div className="mt-4">
                                            <FormLabel>Selected Columns:</FormLabel>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedCols.length > 0 ? (
                                                    selectedCols.map(col => (
                                                        <Badge key={col} variant="secondary">{col}</Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No columns selected</span>
                                                )}
                                            </div>
                                        </div> */}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </PCard>

                        {selectedModel === "Order" &&
                            (
                                <>
                                    {/* Date Range */}
                                    <PCard>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Start Date */}
                                            <FormField
                                                control={control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="font-bold">From Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                                                            }`}
                                                                    >
                                                                        {field.value || "Pick a date"}
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={parseDateString(field.value)}
                                                                    onSelect={(date) => field.onChange(formatDate(date))}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* End Date */}
                                            <FormField
                                                control={control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="font-bold">To Date</FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                                                            }`}
                                                                    >
                                                                        {field.value || "Pick a date"}
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={parseDateString(field.value)}
                                                                    onSelect={(date) => field.onChange(formatDate(date))}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </PCard>

                                    {/* Order Type */}
                                    {
                                        !isGSTMode &&
                                        <PCard>
                                            <FormField
                                                control={control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="font-bold">Order Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select an order type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {type.map((t) => (
                                                                    <SelectItem key={t} value={t} className={'capitalize'}>
                                                                        {t}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </PCard>
                                    }

                                    {
                                        !isGSTMode &&
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {/* Methods */}
                                            <PCard>
                                                <FormField
                                                    control={control}
                                                    name="method"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Methods</FormLabel>
                                                            <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
                                                                {method.map((m) => (
                                                                    <div key={m} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`method-${m}`}
                                                                            checked={(watch("method") || []).includes(m)}
                                                                            onCheckedChange={() => toggleArrayValue("method", m)}
                                                                        />
                                                                        <label htmlFor={`method-${m}`} className="text-sm font-medium">
                                                                            {m}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </PCard>

                                            {/* Payment Status */}
                                            <PCard>
                                                <FormField
                                                    control={control}
                                                    name="paymentStatus"
                                                    render={() => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Payment Status</FormLabel>
                                                            <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
                                                                {paymentStatus.map((p) => (
                                                                    <div key={p} className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`payment-${p}`}
                                                                            checked={(watch("paymentStatus") || []).includes(p)}
                                                                            onCheckedChange={() => toggleArrayValue("paymentStatus", p)}
                                                                        />
                                                                        <label htmlFor={`payment-${p}`} className="text-sm font-medium">
                                                                            {p}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </PCard>
                                        </div>
                                    }

                                    {/* Order Status */}
                                    <PCard>
                                        <FormField
                                            control={control}
                                            name="status"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">Order Status</FormLabel>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
                                                        {status.map((s) => (
                                                            <div key={s} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`status-${s}`}
                                                                    checked={(watch("status") || []).includes(s)}
                                                                    onCheckedChange={() => toggleArrayValue("status", s)}
                                                                />
                                                                <label htmlFor={`status-${s}`} className="text-sm font-medium capitalize">
                                                                    {s}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </PCard>
                                </>
                            )}

                        {/* USER FILTERS */}
                        {selectedModel === "User" && (
                            <>
                                {/* Date Range */}
                                <PCard>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {["startDate", "endDate"].map((name, i) => (
                                            <FormField
                                                key={name}
                                                control={control}
                                                name={name}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel className="font-bold">
                                                            {i === 0 ? "From Date" : "To Date"}
                                                        </FormLabel>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <FormControl>
                                                                    <Button
                                                                        variant="outline"
                                                                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
                                                                            }`}
                                                                    >
                                                                        {field.value || "Pick a date"}
                                                                    </Button>
                                                                </FormControl>
                                                            </PopoverTrigger>
                                                            <PopoverContent align="start" className="p-0">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => field.onChange(formatDate(date))}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </PCard>

                                {/* User Type */}
                                <PCard>
                                    <FormField
                                        control={control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">User Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select user type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {userTypeOptions.map((t) => (
                                                            <SelectItem key={t} value={t}>
                                                                {t}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </PCard>
                            </>
                        )}

                        {/* PRODUCT FILTERS */}
                        {/* {selectedModel === "Product" && (
                            <PCard>
                                <FormField
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Product Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select product type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {productTypeOptions.map((t) => (
                                                        <SelectItem key={t} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </PCard>
                        )} */}

                    </form>
                </Form>
            </div>

        </InnerDashboardLayout>
    )
}

// "use client"
// import React, { useState, useEffect } from "react"
// import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout"
// import { Button } from "@/components/ui/button"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage
// } from "@/components/ui/form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import LoaderButton from "@/components/custom/LoaderButton"
// import { useReports } from "@/hooks/useReports"
// import { exportToExcel } from "@/lib/exportToExcel"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import NotAuthorizedPage from "@/components/notAuthorized"
// import PCard from "@/components/custom/PCard"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"

// // Zod schema
// const reportSchema = z.object({
//     model: z.enum([
//         "Order",
//         "Category",
//         "Group",
//         "Product",
//         "SubCategory",
//         "User",
//     ]),
//     columns: z.array(z.string()).min(1, "At least one column is required"),
//     method: z.array(z.string()).optional(),
//     paymentStatus: z.array(z.string()).optional(),
//     status: z.array(z.string()).optional(),
//     type: z.string().optional(),
//     startDate: z.string().optional(),
//     endDate: z.string().optional(),
// })

// // All possible fields per model
// const columnOptions = {
//     User: [
//         "name", "email", "phoneNo", "address", "role", "departments",
//         "profilePicture", "documents", "createdBy", "orders", "wishlist", "cart",
//         "createdAt", "updatedAt",
//     ],
//     Order: [
//         "status", "holdReason", "shippingStatus", "paymentStatus",
//         "shipmentId", "awbCode", "courierName", "pickupDate",
//         "expectedDeliveryDate", "orderId", "type", "method",
//         "orderAmount", "deliveryCharge", "discount", "gst",
//         "subtotal", "name", "email", "phoneNo", "address",
//         "addressId", "userId", "items", "createdAt", "updatedAt",
//     ],
//     Category: [
//         "name", "image", "slug", "active", "subCategories",
//         "createdAt", "updatedAt",
//     ],
//     Group: [
//         "name", "sequenceNo", "banner", "active", "isBannerVisble",
//         "isSpecial", "products", "createdAt", "updatedAt",
//     ],
//     Product: [
//         "name", "fullName", "slug", "description", "active",
//         "newArrival", "liked", "bestSeller", "recommended",
//         "sellingPrice", "gst", "category", "variants", "images",
//         "totalStock", "stock", "orders", "groups",
//         "createdAt", "updatedAt",
//     ],
//     SubCategory: [
//         "name", "slug", "sequenceNo", "upperBanner", "lowerBanner",
//         "active", "featured", "deliveryCharge", "minOrderAmount",
//         "minFreeDeliveryOrderAmount", "photos", "parentCategory",
//         "products", "createdAt", "updatedAt",
//     ],
// }

// const GST_COLUMNS = [
//     "gstin",
//     "buyerName",
//     "invoiceNo",
//     "invoiceDate",
//     "pos",
//     "totalInvoiceValue",
//     "rate",
//     "taxableValue",
//     "igst",
//     "cgst",
//     "sgst",
//     "cessAmount",
//     "reverseCharge"
// ]

// const method = ["COD", "Online", "Cash", "UPI"];
// const paymentStatus = ['Pending', 'Paid'];
// const type = ['regular', 'app&pos', 'web&pos', 'app', 'web', 'pos', 'abandoned']
// const status = ["New", "Accepted", "Rejected", "Shipped", "Delivered", "Cancelled", "Returned", "Replaced", "Hold"]

// const userTypeOptions = ["frequent", "oneOrder", "noOrder"]
// const productTypeOptions = ["fast", "slow", "non"]

// const transformOrderForGST = (orders) => {
//     const GST_RATE = 18
//     const GSTIN = "07BESPC8834B1ZG"

//     return orders.map(order => {
//         const orderAmount = Number(order.orderAmount || 0)

//         const taxableValue = +(orderAmount / (1 + GST_RATE / 100)).toFixed(2)
//         const gstAmount = +(orderAmount - taxableValue).toFixed(2)

//         let cgst = 0
//         let sgst = 0
//         let igst = 0

//         const isIntraState =
//             order.state?.toLowerCase() === "delhi"

//         if (isIntraState) {
//             cgst = +(gstAmount / 2).toFixed(2)
//             sgst = +(gstAmount / 2).toFixed(2)
//         } else {
//             igst = gstAmount
//         }

//         return {
//             ...order,
//             gstin: GSTIN,
//             buyerName: order.name,
//             invoiceNo: `GST-${order.orderId}`,
//             invoiceDate: order.createdAt?.split("T")[0],
//             pos: order.state,
//             totalInvoiceValue: orderAmount,
//             rate: GST_RATE,
//             taxableValue,
//             igst,
//             cgst,
//             sgst,
//             cessAmount: 0,
//             reverseCharge: "N",
//         }
//     })
// }

// const formatDate = (date) => {
//     if (!date) return undefined
//     return date.toISOString().split("T")[0]
// }

// export default function Page() {
//     const { reportMutation, permissions: {
//         canView,
//         canAdd,
//         canEdit,
//         canDelete,
//     } } = useReports()

//     const form = useForm({
//         resolver: zodResolver(reportSchema),
//         mode: "onSubmit",
//         defaultValues: {
//             model: "User",
//             columns: [],
//             method: [],
//         },
//     })
//     const { control, watch, setValue, handleSubmit, formState: { errors } } = form
//     const selectedModel = watch("model")
//     const selectedCols = watch("columns")
//     const [selectAll, setSelectAll] = useState(false)

//     // Reset selectAll when model changes
//     useEffect(() => {
//         setSelectAll(false)
//         setValue("columns", [])
//     }, [selectedModel, setValue])

//     const toggleColumn = (column) => {
//         const current = form.getValues("columns")
//         const next = current.includes(column)
//             ? current.filter(c => c !== column)
//             : [...current, column]
//         setValue("columns", next)
//     }

//     const toggleSelectAll = () => {
//         if (selectAll) {
//             setValue("columns", [])
//         } else {
//             setValue("columns", [...columnOptions[selectedModel]])
//         }
//         setSelectAll(!selectAll)
//     }

//     const toggleArrayValue = (fieldName, value) => {
//         const current = form.getValues(fieldName) || []
//         const next = current.includes(value)
//             ? current.filter(v => v !== value)
//             : [...current, value]
//         setValue(fieldName, next)
//     }

//     const onSubmit = async (values) => {
//         const res = await reportMutation.mutateAsync(values)
//         let data = res?.data?.data || []

//         let finalColumns = [...values.columns]

//         // 🔥 Agar model Order hai → GST columns add karo
//         if (values.model === "Order" && values?.columns?.includes("orderAmount")) {

//             // Transform data
//             data = transformOrderForGST(data)

//             // Append GST columns if not already present
//             GST_COLUMNS.forEach(col => {
//                 if (!finalColumns.includes(col)) {
//                     finalColumns.push(col)
//                 }
//             })
//         }

//         exportToExcel(finalColumns, data, `${values.model}-report.xlsx`)
//     }

//     // const onSubmit = async (values) => {
//     //     // console.log(values)
//     //     const res = await reportMutation.mutateAsync(values)
//     //     const data = res?.data?.data || []
//     //     console.log(data)
//     //     exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
//     // }

//     if (!canView) {
//         return <NotAuthorizedPage />
//     }

//     return (
//         <InnerDashboardLayout>
//             <div className="flex items-center justify-between mb-3">
//                 <h1 className="text-primary font-bold text-2xl">Generate Report</h1>
//                 {canAdd &&
//                     <LoaderButton
//                         loading={reportMutation.isPending}
//                         onClick={handleSubmit(onSubmit)}
//                     >
//                         Generate Report
//                     </LoaderButton>
//                 }
//             </div>

//             <div className="mb-10">
//                 <Form {...form}>
//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
//                         {/* Model Selection */}
//                         <PCard>
//                             <FormField
//                                 control={control}
//                                 name="model"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel className={'font-bold'}>Module</FormLabel>
//                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                             <FormControl>
//                                                 <SelectTrigger className="w-full">
//                                                     <SelectValue placeholder="Select a model" />
//                                                 </SelectTrigger>
//                                             </FormControl>
//                                             <SelectContent>
//                                                 {Object.keys(columnOptions).map((model) => (
//                                                     <SelectItem key={model} value={model}>
//                                                         {model}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </PCard>

//                         {/* Columns Selection */}
//                         <PCard>
//                             <FormField
//                                 control={control}
//                                 name="columns"
//                                 render={() => (
//                                     <FormItem>
//                                         <div className="flex justify-between items-center mb-4">
//                                             <FormLabel className={'font-bold'}>Columns</FormLabel>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={toggleSelectAll}
//                                             >
//                                                 {selectAll ? "Deselect All" : "Select All"}
//                                             </Button>
//                                         </div>

//                                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
//                                             {columnOptions[selectedModel].map((column) => (
//                                                 <div key={column} className="flex items-center space-x-2">
//                                                     <Checkbox
//                                                         id={column}
//                                                         checked={selectedCols.includes(column)}
//                                                         onCheckedChange={() => toggleColumn(column)}
//                                                     />
//                                                     <label
//                                                         htmlFor={column}
//                                                         className="text-sm capitalize font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                                     >
//                                                         {column}
//                                                     </label>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         {errors.columns && (
//                                             <p className="text-sm font-medium text-destructive mt-2">
//                                                 {errors.columns.message}
//                                             </p>
//                                         )}
//                                         {/*
//                                         <div className="mt-4">
//                                             <FormLabel>Selected Columns:</FormLabel>
//                                             <div className="flex flex-wrap gap-2 mt-2">
//                                                 {selectedCols.length > 0 ? (
//                                                     selectedCols.map(col => (
//                                                         <Badge key={col} variant="secondary">{col}</Badge>
//                                                     ))
//                                                 ) : (
//                                                     <span className="text-muted-foreground text-sm">No columns selected</span>
//                                                 )}
//                                             </div>
//                                         </div> */}
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </PCard>

//                         {selectedModel === "Order" && (
//                             <>
//                                 {/* Date Range */}
//                                 <PCard>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {/* Start Date */}
//                                         <FormField
//                                             control={control}
//                                             name="startDate"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-col">
//                                                     <FormLabel className="font-bold">From Date</FormLabel>
//                                                     <Popover>
//                                                         <PopoverTrigger asChild>
//                                                             <FormControl>
//                                                                 <Button
//                                                                     variant="outline"
//                                                                     className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                         }`}
//                                                                 >
//                                                                     {field.value || "Pick a date"}
//                                                                 </Button>
//                                                             </FormControl>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent align="start" className="p-0">
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 selected={field.value ? new Date(field.value) : undefined}
//                                                                 onSelect={(date) => field.onChange(formatDate(date))}
//                                                                 initialFocus
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />

//                                         {/* End Date */}
//                                         <FormField
//                                             control={control}
//                                             name="endDate"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-col">
//                                                     <FormLabel className="font-bold">To Date</FormLabel>
//                                                     <Popover>
//                                                         <PopoverTrigger asChild>
//                                                             <FormControl>
//                                                                 <Button
//                                                                     variant="outline"
//                                                                     className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                         }`}
//                                                                 >
//                                                                     {field.value || "Pick a date"}
//                                                                 </Button>
//                                                             </FormControl>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent align="start" className="p-0">
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 selected={field.value ? new Date(field.value) : undefined}
//                                                                 onSelect={(date) => field.onChange(formatDate(date))}
//                                                                 initialFocus
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </div>
//                                 </PCard>

//                                 {/* Order Type */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="type"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">Order Type</FormLabel>
//                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                     <FormControl>
//                                                         <SelectTrigger className="w-full">
//                                                             <SelectValue placeholder="Select an order type" />
//                                                         </SelectTrigger>
//                                                     </FormControl>
//                                                     <SelectContent>
//                                                         {type.map((t) => (
//                                                             <SelectItem key={t} value={t} className={'capitalize'}>
//                                                                 {t}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                                     {/* Methods */}
//                                     <PCard>
//                                         <FormField
//                                             control={control}
//                                             name="method"
//                                             render={() => (
//                                                 <FormItem>
//                                                     <FormLabel className="font-bold">Methods</FormLabel>
//                                                     <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                         {method.map((m) => (
//                                                             <div key={m} className="flex items-center space-x-2">
//                                                                 <Checkbox
//                                                                     id={`method-${m}`}
//                                                                     checked={(watch("method") || []).includes(m)}
//                                                                     onCheckedChange={() => toggleArrayValue("method", m)}
//                                                                 />
//                                                                 <label htmlFor={`method-${m}`} className="text-sm font-medium">
//                                                                     {m}
//                                                                 </label>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </PCard>

//                                     {/* Payment Status */}
//                                     <PCard>
//                                         <FormField
//                                             control={control}
//                                             name="paymentStatus"
//                                             render={() => (
//                                                 <FormItem>
//                                                     <FormLabel className="font-bold">Payment Status</FormLabel>
//                                                     <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                         {paymentStatus.map((p) => (
//                                                             <div key={p} className="flex items-center space-x-2">
//                                                                 <Checkbox
//                                                                     id={`payment-${p}`}
//                                                                     checked={(watch("paymentStatus") || []).includes(p)}
//                                                                     onCheckedChange={() => toggleArrayValue("paymentStatus", p)}
//                                                                 />
//                                                                 <label htmlFor={`payment-${p}`} className="text-sm font-medium">
//                                                                     {p}
//                                                                 </label>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </PCard>
//                                 </div>
//                                 {/* Order Status */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="status"
//                                         render={() => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">Order Status</FormLabel>
//                                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                     {status.map((s) => (
//                                                         <div key={s} className="flex items-center space-x-2">
//                                                             <Checkbox
//                                                                 id={`status-${s}`}
//                                                                 checked={(watch("status") || []).includes(s)}
//                                                                 onCheckedChange={() => toggleArrayValue("status", s)}
//                                                             />
//                                                             <label htmlFor={`status-${s}`} className="text-sm font-medium capitalize">
//                                                                 {s}
//                                                             </label>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>
//                             </>
//                         )}

//                         {/* USER FILTERS */}
//                         {selectedModel === "User" && (
//                             <>
//                                 {/* Date Range */}
//                                 <PCard>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {["startDate", "endDate"].map((name, i) => (
//                                             <FormField
//                                                 key={name}
//                                                 control={control}
//                                                 name={name}
//                                                 render={({ field }) => (
//                                                     <FormItem className="flex flex-col">
//                                                         <FormLabel className="font-bold">
//                                                             {i === 0 ? "From Date" : "To Date"}
//                                                         </FormLabel>
//                                                         <Popover>
//                                                             <PopoverTrigger asChild>
//                                                                 <FormControl>
//                                                                     <Button
//                                                                         variant="outline"
//                                                                         className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                             }`}
//                                                                     >
//                                                                         {field.value || "Pick a date"}
//                                                                     </Button>
//                                                                 </FormControl>
//                                                             </PopoverTrigger>
//                                                             <PopoverContent align="start" className="p-0">
//                                                                 <Calendar
//                                                                     mode="single"
//                                                                     selected={field.value ? new Date(field.value) : undefined}
//                                                                     onSelect={(date) => field.onChange(formatDate(date))}
//                                                                     initialFocus
//                                                                 />
//                                                             </PopoverContent>
//                                                         </Popover>
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         ))}
//                                     </div>
//                                 </PCard>

//                                 {/* User Type */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="type"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">User Type</FormLabel>
//                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                     <FormControl>
//                                                         <SelectTrigger className="w-full">
//                                                             <SelectValue placeholder="Select user type" />
//                                                         </SelectTrigger>
//                                                     </FormControl>
//                                                     <SelectContent>
//                                                         {userTypeOptions.map((t) => (
//                                                             <SelectItem key={t} value={t}>
//                                                                 {t}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>
//                             </>
//                         )}

//                         {/* PRODUCT FILTERS */}
//                         {/* {selectedModel === "Product" && (
//                             <PCard>
//                                 <FormField
//                                     control={control}
//                                     name="type"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="font-bold">Product Type</FormLabel>
//                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                 <FormControl>
//                                                     <SelectTrigger className="w-full">
//                                                         <SelectValue placeholder="Select product type" />
//                                                     </SelectTrigger>
//                                                 </FormControl>
//                                                 <SelectContent>
//                                                     {productTypeOptions.map((t) => (
//                                                         <SelectItem key={t} value={t}>
//                                                             {t}
//                                                         </SelectItem>
//                                                     ))}
//                                                 </SelectContent>
//                                             </Select>
//                                         </FormItem>
//                                     )}
//                                 />
//                             </PCard>
//                         )} */}

//                     </form>
//                 </Form>
//             </div>
//             {/* </Card> */}
//         </InnerDashboardLayout>
//     )
// }

// "use client"
// import React, { useState, useEffect } from "react"
// import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout"
// import { Button } from "@/components/ui/button"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage
// } from "@/components/ui/form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { z } from "zod"
// import LoaderButton from "@/components/custom/LoaderButton"
// import { useReports } from "@/hooks/useReports"
// import { exportToExcel } from "@/lib/exportToExcel"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Checkbox } from "@/components/ui/checkbox"
// import NotAuthorizedPage from "@/components/notAuthorized"
// import PCard from "@/components/custom/PCard"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"

// // Zod schema
// const reportSchema = z.object({
//     model: z.enum([
//         "Order",
//         "Category",
//         "Group",
//         "Product",
//         "SubCategory",
//         "User",
//     ]),
//     columns: z.array(z.string()).min(1, "At least one column is required"),
//     method: z.array(z.string()).optional(),
//     paymentStatus: z.array(z.string()).optional(),
//     status: z.array(z.string()).optional(),
//     type: z.string().optional(),
//     startDate: z.string().optional(),
//     endDate: z.string().optional(),
// })

// // All possible fields per model
// const columnOptions = {
//     User: [
//         "name", "email", "phoneNo", "address", "role", "departments",
//         "profilePicture", "documents", "createdBy", "orders", "wishlist", "cart",
//         "createdAt", "updatedAt",
//     ],
//     Order: [
//         "status", "holdReason", "shippingStatus", "paymentStatus",
//         "shipmentId", "awbCode", "courierName", "pickupDate",
//         "expectedDeliveryDate", "orderId", "type", "method",
//         "orderAmount", "deliveryCharge", "discount", "gst",
//         "subtotal", "name", "email", "phoneNo", "address",
//         "addressId", "userId", "items", "createdAt", "updatedAt",
//     ],
//     Category: [
//         "name", "image", "slug", "active", "subCategories",
//         "createdAt", "updatedAt",
//     ],
//     Group: [
//         "name", "sequenceNo", "banner", "active", "isBannerVisble",
//         "isSpecial", "products", "createdAt", "updatedAt",
//     ],
//     Product: [
//         "name", "fullName", "slug", "description", "active",
//         "newArrival", "liked", "bestSeller", "recommended",
//         "sellingPrice", "gst", "category", "variants", "images",
//         "totalStock", "stock", "orders", "groups",
//         "createdAt", "updatedAt",
//     ],
//     SubCategory: [
//         "name", "slug", "sequenceNo", "upperBanner", "lowerBanner",
//         "active", "featured", "deliveryCharge", "minOrderAmount",
//         "minFreeDeliveryOrderAmount", "photos", "parentCategory",
//         "products", "createdAt", "updatedAt",
//     ],
// }

// const method = ["COD", "Online", "Cash", "UPI"];
// const paymentStatus = ['Pending', 'Paid'];
// const type = ['regular', 'app&pos', 'web&pos', 'app', 'web', 'pos', 'abandoned']
// const status = ["New", "Accepted", "Rejected", "Shipped", "Delivered", "Cancelled", "Returned", "Replaced", "Hold"]

// const userTypeOptions = ["frequent", "oneOrder", "noOrder"]
// const productTypeOptions = ["fast", "slow", "non"]

// const formatDate = (date) => {
//     if (!date) return undefined
//     return date.toISOString().split("T")[0]
// }

// export default function Page() {
//     const { reportMutation, permissions: {
//         canView,
//         canAdd,
//         canEdit,
//         canDelete,
//     } } = useReports()

//     const form = useForm({
//         resolver: zodResolver(reportSchema),
//         mode: "onSubmit",
//         defaultValues: {
//             model: "User",
//             columns: [],
//             method: [],
//         },
//     })
//     const { control, watch, setValue, handleSubmit, formState: { errors } } = form
//     const selectedModel = watch("model")
//     const selectedCols = watch("columns")
//     const [selectAll, setSelectAll] = useState(false)

//     // Reset selectAll when model changes
//     useEffect(() => {
//         setSelectAll(false)
//         setValue("columns", [])
//     }, [selectedModel, setValue])

//     const toggleColumn = (column) => {
//         const current = form.getValues("columns")
//         const next = current.includes(column)
//             ? current.filter(c => c !== column)
//             : [...current, column]
//         setValue("columns", next)
//     }

//     const toggleSelectAll = () => {
//         if (selectAll) {
//             setValue("columns", [])
//         } else {
//             setValue("columns", [...columnOptions[selectedModel]])
//         }
//         setSelectAll(!selectAll)
//     }

//     const toggleArrayValue = (fieldName, value) => {
//         const current = form.getValues(fieldName) || []
//         const next = current.includes(value)
//             ? current.filter(v => v !== value)
//             : [...current, value]
//         setValue(fieldName, next)
//     }

//     const onSubmit = async (values) => {
//         // console.log(values)
//         const res = await reportMutation.mutateAsync(values)
//         const data = res?.data?.data || []
//         console.log(data)
//         exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
//     }

//     if (!canView) {
//         return <NotAuthorizedPage />
//     }

//     return (
//         <InnerDashboardLayout>
//             <div className="flex items-center justify-between mb-3">
//                 <h1 className="text-primary font-bold text-2xl">Generate Report</h1>
//                 {canAdd &&
//                     <LoaderButton
//                         loading={reportMutation.isPending}
//                         onClick={handleSubmit(onSubmit)}
//                     >
//                         Generate Report
//                     </LoaderButton>
//                 }
//             </div>

//             <div className="mb-10">
//                 <Form {...form}>
//                     <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
//                         {/* Model Selection */}
//                         <PCard>
//                             <FormField
//                                 control={control}
//                                 name="model"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel className={'font-bold'}>Module</FormLabel>
//                                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                             <FormControl>
//                                                 <SelectTrigger className="w-full">
//                                                     <SelectValue placeholder="Select a model" />
//                                                 </SelectTrigger>
//                                             </FormControl>
//                                             <SelectContent>
//                                                 {Object.keys(columnOptions).map((model) => (
//                                                     <SelectItem key={model} value={model}>
//                                                         {model}
//                                                     </SelectItem>
//                                                 ))}
//                                             </SelectContent>
//                                         </Select>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </PCard>

//                         {/* Columns Selection */}
//                         <PCard>
//                             <FormField
//                                 control={control}
//                                 name="columns"
//                                 render={() => (
//                                     <FormItem>
//                                         <div className="flex justify-between items-center mb-4">
//                                             <FormLabel className={'font-bold'}>Columns</FormLabel>
//                                             <Button
//                                                 type="button"
//                                                 variant="outline"
//                                                 size="sm"
//                                                 onClick={toggleSelectAll}
//                                             >
//                                                 {selectAll ? "Deselect All" : "Select All"}
//                                             </Button>
//                                         </div>

//                                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg">
//                                             {columnOptions[selectedModel].map((column) => (
//                                                 <div key={column} className="flex items-center space-x-2">
//                                                     <Checkbox
//                                                         id={column}
//                                                         checked={selectedCols.includes(column)}
//                                                         onCheckedChange={() => toggleColumn(column)}
//                                                     />
//                                                     <label
//                                                         htmlFor={column}
//                                                         className="text-sm capitalize font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                                     >
//                                                         {column}
//                                                     </label>
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         {errors.columns && (
//                                             <p className="text-sm font-medium text-destructive mt-2">
//                                                 {errors.columns.message}
//                                             </p>
//                                         )}
//                                         {/*
//                                         <div className="mt-4">
//                                             <FormLabel>Selected Columns:</FormLabel>
//                                             <div className="flex flex-wrap gap-2 mt-2">
//                                                 {selectedCols.length > 0 ? (
//                                                     selectedCols.map(col => (
//                                                         <Badge key={col} variant="secondary">{col}</Badge>
//                                                     ))
//                                                 ) : (
//                                                     <span className="text-muted-foreground text-sm">No columns selected</span>
//                                                 )}
//                                             </div>
//                                         </div> */}
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </PCard>

//                         {selectedModel === "Order" && (
//                             <>
//                                 {/* Date Range */}
//                                 <PCard>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {/* Start Date */}
//                                         <FormField
//                                             control={control}
//                                             name="startDate"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-col">
//                                                     <FormLabel className="font-bold">From Date</FormLabel>
//                                                     <Popover>
//                                                         <PopoverTrigger asChild>
//                                                             <FormControl>
//                                                                 <Button
//                                                                     variant="outline"
//                                                                     className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                         }`}
//                                                                 >
//                                                                     {field.value || "Pick a date"}
//                                                                 </Button>
//                                                             </FormControl>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent align="start" className="p-0">
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 selected={field.value ? new Date(field.value) : undefined}
//                                                                 onSelect={(date) => field.onChange(formatDate(date))}
//                                                                 initialFocus
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />

//                                         {/* End Date */}
//                                         <FormField
//                                             control={control}
//                                             name="endDate"
//                                             render={({ field }) => (
//                                                 <FormItem className="flex flex-col">
//                                                     <FormLabel className="font-bold">To Date</FormLabel>
//                                                     <Popover>
//                                                         <PopoverTrigger asChild>
//                                                             <FormControl>
//                                                                 <Button
//                                                                     variant="outline"
//                                                                     className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                         }`}
//                                                                 >
//                                                                     {field.value || "Pick a date"}
//                                                                 </Button>
//                                                             </FormControl>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent align="start" className="p-0">
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 selected={field.value ? new Date(field.value) : undefined}
//                                                                 onSelect={(date) => field.onChange(formatDate(date))}
//                                                                 initialFocus
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                     <FormMessage />
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </div>
//                                 </PCard>

//                                 {/* Order Type */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="type"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">Order Type</FormLabel>
//                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                     <FormControl>
//                                                         <SelectTrigger className="w-full">
//                                                             <SelectValue placeholder="Select an order type" />
//                                                         </SelectTrigger>
//                                                     </FormControl>
//                                                     <SelectContent>
//                                                         {type.map((t) => (
//                                                             <SelectItem key={t} value={t} className={'capitalize'}>
//                                                                 {t}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                                     {/* Methods */}
//                                     <PCard>
//                                         <FormField
//                                             control={control}
//                                             name="method"
//                                             render={() => (
//                                                 <FormItem>
//                                                     <FormLabel className="font-bold">Methods</FormLabel>
//                                                     <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                         {method.map((m) => (
//                                                             <div key={m} className="flex items-center space-x-2">
//                                                                 <Checkbox
//                                                                     id={`method-${m}`}
//                                                                     checked={(watch("method") || []).includes(m)}
//                                                                     onCheckedChange={() => toggleArrayValue("method", m)}
//                                                                 />
//                                                                 <label htmlFor={`method-${m}`} className="text-sm font-medium">
//                                                                     {m}
//                                                                 </label>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </PCard>

//                                     {/* Payment Status */}
//                                     <PCard>
//                                         <FormField
//                                             control={control}
//                                             name="paymentStatus"
//                                             render={() => (
//                                                 <FormItem>
//                                                     <FormLabel className="font-bold">Payment Status</FormLabel>
//                                                     <div className="grid grid-cols-1 capitalize sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                         {paymentStatus.map((p) => (
//                                                             <div key={p} className="flex items-center space-x-2">
//                                                                 <Checkbox
//                                                                     id={`payment-${p}`}
//                                                                     checked={(watch("paymentStatus") || []).includes(p)}
//                                                                     onCheckedChange={() => toggleArrayValue("paymentStatus", p)}
//                                                                 />
//                                                                 <label htmlFor={`payment-${p}`} className="text-sm font-medium">
//                                                                     {p}
//                                                                 </label>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </FormItem>
//                                             )}
//                                         />
//                                     </PCard>
//                                 </div>
//                                 {/* Order Status */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="status"
//                                         render={() => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">Order Status</FormLabel>
//                                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-2 border rounded-lg">
//                                                     {status.map((s) => (
//                                                         <div key={s} className="flex items-center space-x-2">
//                                                             <Checkbox
//                                                                 id={`status-${s}`}
//                                                                 checked={(watch("status") || []).includes(s)}
//                                                                 onCheckedChange={() => toggleArrayValue("status", s)}
//                                                             />
//                                                             <label htmlFor={`status-${s}`} className="text-sm font-medium capitalize">
//                                                                 {s}
//                                                             </label>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>
//                             </>
//                         )}

//                         {/* USER FILTERS */}
//                         {selectedModel === "User" && (
//                             <>
//                                 {/* Date Range */}
//                                 <PCard>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {["startDate", "endDate"].map((name, i) => (
//                                             <FormField
//                                                 key={name}
//                                                 control={control}
//                                                 name={name}
//                                                 render={({ field }) => (
//                                                     <FormItem className="flex flex-col">
//                                                         <FormLabel className="font-bold">
//                                                             {i === 0 ? "From Date" : "To Date"}
//                                                         </FormLabel>
//                                                         <Popover>
//                                                             <PopoverTrigger asChild>
//                                                                 <FormControl>
//                                                                     <Button
//                                                                         variant="outline"
//                                                                         className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"
//                                                                             }`}
//                                                                     >
//                                                                         {field.value || "Pick a date"}
//                                                                     </Button>
//                                                                 </FormControl>
//                                                             </PopoverTrigger>
//                                                             <PopoverContent align="start" className="p-0">
//                                                                 <Calendar
//                                                                     mode="single"
//                                                                     selected={field.value ? new Date(field.value) : undefined}
//                                                                     onSelect={(date) => field.onChange(formatDate(date))}
//                                                                     initialFocus
//                                                                 />
//                                                             </PopoverContent>
//                                                         </Popover>
//                                                     </FormItem>
//                                                 )}
//                                             />
//                                         ))}
//                                     </div>
//                                 </PCard>

//                                 {/* User Type */}
//                                 <PCard>
//                                     <FormField
//                                         control={control}
//                                         name="type"
//                                         render={({ field }) => (
//                                             <FormItem>
//                                                 <FormLabel className="font-bold">User Type</FormLabel>
//                                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                     <FormControl>
//                                                         <SelectTrigger className="w-full">
//                                                             <SelectValue placeholder="Select user type" />
//                                                         </SelectTrigger>
//                                                     </FormControl>
//                                                     <SelectContent>
//                                                         {userTypeOptions.map((t) => (
//                                                             <SelectItem key={t} value={t}>
//                                                                 {t}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                             </FormItem>
//                                         )}
//                                     />
//                                 </PCard>
//                             </>
//                         )}

//                         {/* PRODUCT FILTERS */}
//                         {/* {selectedModel === "Product" && (
//                             <PCard>
//                                 <FormField
//                                     control={control}
//                                     name="type"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="font-bold">Product Type</FormLabel>
//                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                                 <FormControl>
//                                                     <SelectTrigger className="w-full">
//                                                         <SelectValue placeholder="Select product type" />
//                                                     </SelectTrigger>
//                                                 </FormControl>
//                                                 <SelectContent>
//                                                     {productTypeOptions.map((t) => (
//                                                         <SelectItem key={t} value={t}>
//                                                             {t}
//                                                         </SelectItem>
//                                                     ))}
//                                                 </SelectContent>
//                                             </Select>
//                                         </FormItem>
//                                     )}
//                                 />
//                             </PCard>
//                         )} */}

//                     </form>
//                 </Form>
//             </div>
//             {/* </Card> */}
//         </InnerDashboardLayout>
//     )
// }