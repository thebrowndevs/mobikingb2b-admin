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
import { FileDown } from 'lucide-react'

const reportSchema = z.object({
    model: z.enum(["Category", "SubCategory", "Group", "Brand"]),
    columns: z.array(z.string()).min(1, "At least one column is required"),
})

const columnOptions = {
    Category: [
        "name", "image", "slug", "active", "subCategories",
        "createdAt", "updatedAt",
    ],
    SubCategory: [
        "name", "slug", "tags", "active", "deliveryCharge", "photos",
        "parentCategory", "products", "createdAt", "updatedAt",
    ],
    Group: [
        "name", "slug", "groupType", "heading", "webBanner", "isWebBannerVisible",
        "webBackgroundColor", "isWebBgColorVisible", "appBanner", "isAppBannerVisible",
        "appBackgroundColor", "isAppBgColorVisible", "bannerLink", "placement", "active",
        "products", "categories", "parentCategories", "createdAt", "updatedAt",
    ],
    Brand: [
        "name", "active", "image", "createdAt", "updatedAt"
    ],
}

export default function OtherReportsPage() {
    const { reportMutation, permissions: { canView, canAdd } } = useReports()
    const [selectAll, setSelectAll] = useState(false)

    const form = useForm({
        resolver: zodResolver(reportSchema),
        mode: "onSubmit",
        defaultValues: {
            model: "Category",
            columns: [],
        },
    })

    const { control, watch, setValue, handleSubmit, formState: { errors } } = form
    const selectedModel = watch("model")
    const selectedCols = watch("columns")

    useEffect(() => {
        setValue("columns", [])
        setSelectAll(false)
    }, [selectedModel, setValue])

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
            setValue("columns", [...columnOptions[selectedModel]])
        }
        setSelectAll(!selectAll)
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
            photos: item?.photos?.join(", ") || "",
            tags: item?.tags?.join(", ") || "",
        }))
    }

    const transformGroup = (items) => {
        return items?.map(item => ({
            ...item,
            products: item?.products?.length || 0,
            productCount: item?.products?.length || 0,
            categories: item?.categories?.map(c => c?.name || c)?.join(", ") || "",
            parentCategories: item?.parentCategories?.map(pc => pc?.name || pc)?.join(", ") || "",
        }))
    }

    const transformBrand = (items) => {
        return items?.map(item => ({
            ...item,
            productCount: item?.products?.length || 0,
        }))
    }

    const onSubmit = async (values) => {
        const res = await reportMutation.mutateAsync(values)
        let data = res?.data?.data || []

        if (values.model === "Category") {
            data = transformCategory(data)
        } else if (values.model === "SubCategory") {
            data = transformSubCategory(data)
        } else if (values.model === "Group") {
            data = transformGroup(data)
        } else if (values.model === "Brand") {
            data = transformBrand(data)
        }

        exportToExcel(values.columns, data, `${values.model}-report.xlsx`)
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Metadata & Other Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Generate and export Categories, Sub-categories, Product Groups, and Brands reports</p>
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
                                                <SelectTrigger className="w-full rounded-xl border-slate-200/85 text-xs h-10">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Category">Categories</SelectItem>
                                                <SelectItem value="SubCategory">Sub-categories</SelectItem>
                                                <SelectItem value="Group">Product Groups</SelectItem>
                                                <SelectItem value="Brand">Product Brands</SelectItem>
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
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={toggleSelectAll}
                                                className="rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 text-xs font-semibold h-8"
                                            >
                                                {selectAll ? "Deselect All" : "Select All"}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50/50 scrollbar-hide">
                                            {(columnOptions[selectedModel] || []).map((column) => (
                                                <div key={column} className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-white hover:shadow-sm hover:shadow-slate-100 transition-all duration-200">
                                                    <Checkbox
                                                        id={column}
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
                    </form>
                </Form>
            </div>
        </InnerDashboardLayout>
    )
}
