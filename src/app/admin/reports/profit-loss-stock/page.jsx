"use client"
import React, { useState } from "react"
import InnerDashboardLayout from "@/components/dashboard/InnerDashboardLayout"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import LoaderButton from "@/components/custom/LoaderButton"
import { useReports } from "@/hooks/useReports"
import { useProducts } from "@/hooks/useProducts"
import { exportToExcel } from "@/lib/exportToExcel"
import NotAuthorizedPage from "@/components/notAuthorized"
import PCard from "@/components/custom/PCard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import toast from "react-hot-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formatDate = (date) => {
    if (!date) return "";
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

export default function ProfitLossStockReportPage() {
    const { productSalesReportMutation, stockFlowReportMutation, permissions: { canView } } = useReports()
    const { productsQuery } = useProducts()

    const [plDate, setPlDate] = useState({ from: "", to: "" })
    const [stockDate, setStockDate] = useState({ from: "", to: "" })
    const [selectedProductId, setSelectedProductId] = useState("")

    const handleDownloadPL = async () => {
        if (!plDate.from || !plDate.to) {
            toast.error("Please pick both from and to dates for the Profit & Loss report.")
            return
        }

        const res = await productSalesReportMutation.mutateAsync({
            startDate: plDate.from,
            endDate: plDate.to
        })
        const data = res?.data?.data || []
        const formattedData = data.map(item => {
            const isSale = item.setType === "Sale Set";
            const margin = (isSale && Number(item.totalValue) > 0)
                ? `${((Number(item.netProfit) / Number(item.totalValue)) * 100).toFixed(2)}%`
                : (isSale ? "0.00%" : "N/A");

            return {
                "Product Name": item.productName,
                "SKU": item.sku,
                "Group": item.group,
                "Set Type": item.setType,
                "Unit Selling Price": isSale ? item.unitPrice : "N/A",
                "Unit Purchase Price": item.purchasePrice,
                "Qty": item.quantity,
                "Total Sales Value": isSale ? item.totalValue : "N/A",
                "Total Cost Value": item.totalCost,
                "Net Profit": isSale ? item.netProfit : "N/A",
                "Profit Margin (%)": margin,
                "Last Purchase Price": item.lastPurchasePrice || "N/A"
            };
        })

        exportToExcel(
            [
                "Product Name", "SKU", "Group", "Set Type", "Unit Selling Price",
                "Unit Purchase Price", "Qty", "Total Sales Value", "Total Cost Value",
                "Net Profit", "Profit Margin (%)", "Last Purchase Price"
            ],
            formattedData,
            `Profit-Loss-Sales-Sets-${plDate.from}-to-${plDate.to}.xlsx`
        )
    }

    const handleDownloadStock = async () => {
        if (!selectedProductId) {
            toast.error("Please select a product.")
            return
        }

        const res = await stockFlowReportMutation.mutateAsync({
            productId: selectedProductId,
            data: {
                startDate: stockDate.from || undefined,
                endDate: stockDate.to || undefined,
            }
        })
        const data = res?.data?.data || []

        const formattedData = data.map(log => ({
            "Stock Log ID": log.logId,
            "Date (IST)": log.date,
            "Product ID": log.productId,
            "Product Name": log.productName,
            "SKU": log.sku,
            "Variant ID": log.variantId,
            "Variant": log.variantName,
            "Transaction Type": log.type,
            "Category": log.category,
            "Quantity Changed": log.quantity,
            "Previous Stock": log.previousStock,
            "Updated Stock": log.updatedStock,
            "Previous Physical Stock": log.previousPhysicalStock,
            "Updated Physical Stock": log.updatedPhysicalStock,
            "Total Product Stock": log.totalProductStock,
            "Purchase Price": log.purchasePrice,
            "Selling Price": log.sellingPrice,
            "Order ID": log.orderId,
            "Quotation ID": log.quotationId,
            "Vendor": log.vendor,
            "Is Scratchy": log.isScratchy,
        }))

        exportToExcel(
            [
                "Stock Log ID", "Date (IST)", "Product ID", "Product Name", "SKU", "Variant ID",
                "Variant", "Transaction Type", "Category", "Quantity Changed", "Previous Stock",
                "Updated Stock", "Previous Physical Stock", "Updated Physical Stock",
                "Total Product Stock", "Purchase Price", "Selling Price", "Order ID",
                "Quotation ID", "Vendor", "Is Scratchy"
            ],
            formattedData,
            `Stock-Flow-Logs-${selectedProductId}.xlsx`
        )
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Profit & Loss / Stock Flow Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Export product margins, purchase costs, and track stock ledger entries</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profit & Loss Report Card */}
                <PCard>
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Profit & Loss Report
                    </h3>
                    <p className="text-sm text-slate-500">
                        Exports aggregated sales sets vs purchase sets to verify product profit margins.
                    </p>

                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">From Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full text-left font-semibold text-slate-700 rounded-xl border-slate-200/85 text-xs h-9">
                                            {plDate.from || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 rounded-xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateString(plDate.from)}
                                            onSelect={(date) => setPlDate(prev => ({ ...prev, from: formatDate(date) }))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">To Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full text-left font-semibold text-slate-700 rounded-xl border-slate-200/85 text-xs h-9">
                                            {plDate.to || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 rounded-xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateString(plDate.to)}
                                            onSelect={(date) => setPlDate(prev => ({ ...prev, to: formatDate(date) }))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <LoaderButton
                            loading={productSalesReportMutation.isPending}
                            onClick={handleDownloadPL}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold h-10 border-0 flex items-center justify-center gap-2"
                        >
                            Download Profit & Loss Report
                        </LoaderButton>
                    </div>
                </PCard>

                {/* Stock Flow Logs Report Card */}
                <PCard>
                    <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Stock Flow Logs
                    </h3>
                    <p className="text-sm text-slate-500">
                        Tracks stock adjustments, items returns, cancels, and purchase additions for a specific product.
                    </p>

                    <div className="space-y-4 pt-2">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700">Select Product</label>
                            <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                                <SelectTrigger className="w-full rounded-xl border-slate-200/85 text-xs h-9">
                                    <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {(productsQuery.data || []).map((prod) => (
                                        <SelectItem key={prod._id} value={prod._id} className="text-xs">
                                            {prod.fullName || prod.name} ({prod.sku || "No SKU"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">From Date (Optional)</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full text-left font-semibold text-slate-700 rounded-xl border-slate-200/85 text-xs h-9">
                                            {stockDate.from || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 rounded-xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateString(stockDate.from)}
                                            onSelect={(date) => setStockDate(prev => ({ ...prev, from: formatDate(date) }))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">To Date (Optional)</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full text-left font-semibold text-slate-700 rounded-xl border-slate-200/85 text-xs h-9">
                                            {stockDate.to || "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 rounded-xl" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateString(stockDate.to)}
                                            onSelect={(date) => setStockDate(prev => ({ ...prev, to: formatDate(date) }))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <LoaderButton
                            loading={stockFlowReportMutation.isPending}
                            onClick={handleDownloadStock}
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold h-10 border-0 flex items-center justify-center gap-2"
                        >
                            Download Stock Flow Logs
                        </LoaderButton>
                    </div>
                </PCard>
            </div>
        </InnerDashboardLayout>
    )
}
