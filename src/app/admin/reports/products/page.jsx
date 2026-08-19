"use client"

import React, { useState } from "react"
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
import NotAuthorizedPage from "@/components/notAuthorized"
import PCard from "@/components/custom/PCard"
import { FileDown, CheckSquare, Square } from 'lucide-react'

const reportSchema = z.object({
    model: z.literal("Product"),
    columns: z.array(z.string()).min(1, "At least one column is required"),
})

const columnOptions = [
    "fullName", "slug", "description", "descriptionPoints", "keyInformation",
    "tags", "hsn", "active", "webVisibility", "appVisibility", "brand", "category",
    "regularPrice", "basePrice", "sellingPrice", "discount", "moq", "gst",
    "variants", "images", "totalStock", "availableStock", "orders", "groups",
    "rating", "reviewCount", "createdAt", "updatedAt",
]

export default function ProductReportsPage() {
    const { reportMutation, permissions: { canView, canAdd } } = useReports()
    const [selectAll, setSelectAll] = useState(false)

    const form = useForm({
        resolver: zodResolver(reportSchema),
        mode: "onSubmit",
        defaultValues: {
            model: "Product",
            columns: [],
        },
    })

    const { control, watch, setValue, handleSubmit, formState: { errors } } = form
    const selectedCols = watch("columns")

    const toggleColumn = (column) => {
        const current = form.getValues("columns")
        const next = current.includes(column)
            ? current.filter(c => c !== column)
            : [...current, column]
        setValue("columns", next)
    }

    const toggleSelectAll = () => {
        if (selectAll) {
            setValue("columns", [])
        } else {
            setValue("columns", [...columnOptions])
        }
        setSelectAll(!selectAll)
    }

    const transformProduct = (products) => {
        return products?.map(pr => {
            const brand = pr?.brand?.name || pr?.brand || "";
            const category = pr?.category?.name || pr?.category || "";
            const images = pr?.images?.join(",");
            const groups = pr?.groups?.map(gr => gr?.name || gr)?.join(", ") || "";

            let sellingPrice = "";
            if (pr.sellingPrice) {
                if (pr.sellingPrice.type === "fixed") {
                    const priceVal = pr.sellingPrice.slabs?.[0]?.price ?? "";
                    sellingPrice = `Fixed: ₹${priceVal}`;
                } else {
                    const slabsStr = pr.sellingPrice.slabs?.map(s => `${s.quantity}+ units: ₹${s.price}`).join(", ") || "";
                    sellingPrice = `Variable - ${slabsStr}`;
                }
            }

            const tags = Array.isArray(pr.tags) ? pr.tags.join(", ") : (pr.tags || "");
            const descriptionPoints = Array.isArray(pr.descriptionPoints) ? pr.descriptionPoints.join(" | ") : (pr.descriptionPoints || "");
            const keyInformation = Array.isArray(pr.keyInformation) ? pr.keyInformation.map(ki => `${ki.title}: ${ki.content}`).join(" | ") : "";

            const row = {
                ...pr,
                sellingPrice,
                tags,
                descriptionPoints,
                keyInformation,
                images,
                brand,
                category,
                groups,
                orders: pr?.orders?.length || pr?.orderCount || 0,
                active: pr.active ? "True" : "False",
                webVisibility: pr.webVisibility ? "True" : "False",
                appVisibility: pr.appVisibility ? "True" : "False",
                newArrival: pr.newArrival ? "True" : "False",
                liked: pr.liked ? "True" : "False",
                bestSeller: pr.bestSeller ? "True" : "False",
                recommended: pr.recommended ? "True" : "False",
            }

            if (pr.variants && Array.isArray(pr.variants)) {
                pr.variants.forEach((v, index) => {
                    const i = index + 1
                    const spaces = " ".repeat(index)
                    row[`Variant ${i} Name`] = v.name || "Unknown"
                    row[`Physical Stock${spaces}`] = v.totalStock || 0
                    row[`Available Stock${spaces}`] = v.availableStock || 0
                })
            }

            return row
        })
    }

    const onSubmit = async (values) => {
        const res = await reportMutation.mutateAsync(values)
        let data = res?.data?.data || []

        let maxVariants = 0
        data.forEach(pr => {
            if (pr.variants && Array.isArray(pr.variants)) {
                maxVariants = Math.max(maxVariants, pr.variants.length)
            }
        })

        data = transformProduct(data)

        let finalColumns = [...values.columns]
        if (finalColumns.includes("variants")) {
            const idx = finalColumns.indexOf("variants")
            const dynCols = []
            for (let i = 1; i <= maxVariants; i++) {
                const spaces = " ".repeat(i - 1)
                dynCols.push(`Variant ${i} Name`)
                dynCols.push(`Physical Stock${spaces}`)
                dynCols.push(`Available Stock${spaces}`)
            }
            finalColumns.splice(idx, 1, ...dynCols)
        }

        exportToExcel(finalColumns, data, "Product-report.xlsx")
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Product Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Generate and export custom product catalog reports to Excel</p>
                </div>
                {canAdd && (
                    <div className="w-full md:w-auto shrink-0">
                        <LoaderButton
                            loading={reportMutation.isPending}
                            onClick={handleSubmit(onSubmit)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 font-semibold px-5 h-10 border-0 flex items-center gap-2"
                        >
                            <FileDown className="h-4 w-4" />
                            Generate Report
                        </LoaderButton>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <PCard>
                            <FormField
                                control={control}
                                name="columns"
                                render={() => (
                                    <FormItem>
                                        <div className="flex justify-between items-center mb-4">
                                            <FormLabel className="font-bold text-base text-slate-800">Select Columns to Export</FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold h-8"
                                            >
                                                {selectAll ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50/50 scrollbar-hide">
                                            {columnOptions.map((column) => (
                                                <div key={column} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-white hover:shadow-sm hover:shadow-slate-100 transition-all duration-200">
                                                    <Checkbox
                                                        id={column}
                                                        checked={selectedCols.includes(column)}
                                                        onCheckedChange={() => toggleColumn(column)}
                                                        className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                    />
                                                    <label
                                                        htmlFor={column}
                                                        className="text-xs font-bold text-slate-700 capitalize cursor-pointer select-none"
                                                    >
                                                        {column === "variants" ? "Variants Details" : column}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.columns && (
                                            <p className="text-sm font-semibold text-rose-500 mt-2">
                                                {errors.columns.message}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </PCard>
                    </form>
                </Form>
            </div>
        </InnerDashboardLayout>
    )
}
