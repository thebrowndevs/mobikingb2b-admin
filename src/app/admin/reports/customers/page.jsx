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
import { FileDown } from 'lucide-react'

const reportSchema = z.object({
    model: z.literal("User"),
    columns: z.array(z.string()).min(1, "At least one column is required"),
    type: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

const columnOptions = [
    "name", "email", "phoneNo", "gender", "dob", "callingCode", "address", "role", "orders",
    "active", "businessActive", "businessVerified", "businessApproved",
    "gstVerified", "businessName", "businessEmail", "businessPhone",
    "gstNumber", "businessAddress", "businessStatus", "rejectionReason",
    "approvedAt", "rejectedAt", "approvedBy", "rejectedBy", "createdBy", "createdAt", "updatedAt",
]

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

export default function CustomerReportsPage() {
    const { reportMutation, permissions: { canView, canAdd } } = useReports()
    const [selectAll, setSelectAll] = useState(false)

    const form = useForm({
        resolver: zodResolver(reportSchema),
        mode: "onSubmit",
        defaultValues: {
            model: "User",
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

    const transformUser = (users) => {
        return users?.map(user => {
            return {
                ...user,
                orders: user?.orders?.length || 0,
                orderCount: user?.orders?.length || 0,
                active: user.active ? "True" : "False",
                isPasswordChanged: user.isPasswordChanged ? "True" : "False",
                businessActive: user.business?.active ? "True" : "False",
                businessVerified: user.business?.verified ? "True" : "False",
                businessApproved: user.business?.isApproved ? "True" : "False",
                gstVerified: user.business?.gstVerified ? "True" : "False",
                businessName: user.business?.businessName || "",
                businessEmail: user.business?.businessEmail || "",
                businessPhone: user.business?.businessPhone || "",
                gstNumber: user.business?.gstNumber || "",
                businessAddress: user.business?.regsiteredAddress
                    ? `${user.business.regsiteredAddress.street || ""}, ${user.business.regsiteredAddress.street2 || ""}, ${user.business.regsiteredAddress.city || ""}, ${user.business.regsiteredAddress.state || ""}, ${user.business.regsiteredAddress.pinCode || ""}`.replace(/^[,\s]+|[,\s]+$/g, "")
                    : "",
                businessStatus: user.business?.isApproved
                    ? "Approved"
                    : (user.business?.rejectedAt ? "Rejected" : "Pending"),
                rejectionReason: user.business?.rejectionReason || "",
                approvedAt: user.business?.approvedAt ? new Date(user.business.approvedAt).toLocaleDateString() : "",
                rejectedAt: user.business?.rejectedAt ? new Date(user.business.rejectedAt).toLocaleDateString() : "",
                gender: user.gender || "",
                dob: user.dob || "",
                callingCode: user.callingCode || 91,
                createdBy: user.createdBy?.name || user.createdBy?.fullName || user.createdBy || "",
                approvedBy: user.business?.approvedBy?.name || user.business?.approvedBy?.fullName || user.business?.approvedBy || "",
                rejectedBy: user.business?.rejectedBy?.name || user.business?.rejectedBy?.fullName || user.business?.rejectedBy || "",
            }
        })
    }

    const onSubmit = async (values) => {
        const res = await reportMutation.mutateAsync(values)
        let data = res?.data?.data || []
        data = transformUser(data)
        exportToExcel(values.columns, data, "Customer-report.xlsx")
    }

    if (!canView) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            {/* Header Section matching Dashboard/Payment Links/Queries format */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-grey-200 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter">Customer Reports</h1>
                    <p className="text-sm text-slate-500 mt-1">Generate and export custom customer directory and business activity reports to Excel</p>
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

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-4 border border-slate-100 rounded-2xl bg-slate-50/50 scrollbar-hide">
                                            {columnOptions.map((column) => (
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

                        {/* Date Filters */}
                        <PCard>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="font-bold text-slate-800 text-sm mb-1.5">Registered From Date</FormLabel>
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
                                            <FormLabel className="font-bold text-slate-800 text-sm mb-1.5">Registered To Date</FormLabel>
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

                        {/* User Type */}
                        <PCard>
                            <FormField
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-slate-800 text-sm">Customer Activity Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full rounded-xl border-slate-200/85">
                                                    <SelectValue placeholder="Select activity filter" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                {userTypeOptions.map((t) => (
                                                    <SelectItem key={t} value={t}>
                                                        {t === "frequent" && "Frequent (Active Users)"}
                                                        {t === "oneOrder" && "One Order Only"}
                                                        {t === "noOrder" && "No Orders Placed"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
