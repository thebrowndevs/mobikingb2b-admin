"use client"
import React, { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import LoaderButton from "@/components/custom/LoaderButton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import FormInputField from "@/components/custom/FormInputField"
import { useCoupons } from "@/hooks/useCoupons"
import moment from "moment-timezone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/api"

const formSchema = z.object({
    code: z.string().min(1, "Code is required"),
    active: z.string().min(1, "Status is required"),
    type: z.string().min(1, "Type is required"),
    value: z.string().min(1, "Value is required"),
    percent: z.string().min(1, "Percent is required"),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),
    phoneNumber: z.string().optional(),
    userId: z.string().optional(),
    isAdminOnly: z.boolean().optional(),
    minCartValue: z.string().optional()
})

export default function CouponDialog({ open, onOpenChange, selectedCoupon = null }) {
    const { createCoupon, updateCoupon } = useCoupons()
    const [foundCustomer, setFoundCustomer] = useState(null)
    const [searchingCustomer, setSearchingCustomer] = useState(false)
    const [searchError, setSearchError] = useState("")

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: "",
            active: "true",
            type: "general",
            value: "",
            percent: "",
            startDate: "",
            endDate: "",
            phoneNumber: "",
            userId: "",
            isAdminOnly: false,
            minCartValue: "0"
        }
    })

    const watchPhone = form.watch("phoneNumber")
    const watchType = form.watch("type")

    // Converts a local IST date string (e.g. "2025-09-19T11:54")
    // into UTC ISO string (e.g. "2025-09-19T06:24:00.000Z")
    function istToUTC(dateStr) {
        return moment
            .tz(dateStr, "YYYY-MM-DDTHH:mm", "Asia/Kolkata")
            .utc()
            .toISOString();
    }

    function formatDateTimeLocal(date) {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local time
        return d.toISOString().slice(0, 16);
    }

    useEffect(() => {
        if (!open) return;

        if (selectedCoupon && selectedCoupon.code) {
            form.reset({
                code: selectedCoupon.code,
                active: selectedCoupon.active ? "true" : "false",
                type: selectedCoupon.type,
                value: selectedCoupon.value,
                percent: selectedCoupon.percent,
                startDate: formatDateTimeLocal(selectedCoupon.startDate),
                endDate: formatDateTimeLocal(selectedCoupon.endDate),
                phoneNumber: selectedCoupon.phoneNumber || "",
                userId: selectedCoupon.userId || "",
                isAdminOnly: !!selectedCoupon.isAdminOnly,
                minCartValue: selectedCoupon.minCartValue || "0"
            })
            if (selectedCoupon.userId) {
                // If it already has a userId, we fetch user info by ID to display
                api.get(`/users/customer/id/${selectedCoupon.userId}`)
                    .then(res => {
                        if (res?.data?.success && res?.data?.data) {
                            setFoundCustomer(res.data.data);
                        }
                    })
                    .catch(() => { });
            }
        } else {
            form.reset({
                code: "",
                active: "true",
                type: "general",
                value: "",
                percent: "",
                startDate: "",
                endDate: "",
                phoneNumber: "",
                userId: "",
                isAdminOnly: false,
                minCartValue: "0"
            })
            setFoundCustomer(null);
        }
    }, [open, selectedCoupon?.code, selectedCoupon?.active, selectedCoupon?.type, selectedCoupon?.value, selectedCoupon?.percent, selectedCoupon?.startDate, selectedCoupon?.endDate, selectedCoupon?.phoneNumber, selectedCoupon?.userId, selectedCoupon?.isAdminOnly, selectedCoupon?.minCartValue, form])

    useEffect(() => {
        if (watchType !== "oneTimeUser" || !watchPhone || watchPhone.length < 10) {
            setFoundCustomer(null);
            setSearchError("");
            form.setValue("userId", "");
            return;
        }

        const fetchCustomer = async () => {
            setSearchingCustomer(true);
            setSearchError("");
            try {
                const response = await api.get(`/users/customer/${watchPhone}`);
                // Since this returns existedUser?._id (success status 201) when found:
                if (response?.data?.statusCode === 201 && response?.data?.data) {
                    const customerId = response.data.data;

                    // Fetch full customer details by ID
                    const detailsResponse = await api.get(`/users/customer/id/${customerId}`);
                    if (detailsResponse?.data?.success && detailsResponse?.data?.data) {
                        const cust = detailsResponse.data.data;
                        setFoundCustomer(cust);
                        form.setValue("userId", cust._id);
                    } else {
                        setFoundCustomer(null);
                        setSearchError("Error fetching customer details");
                        form.setValue("userId", "");
                    }
                } else {
                    setFoundCustomer(null);
                    setSearchError("No customer found");
                    form.setValue("userId", "");
                }
            } catch (err) {
                setFoundCustomer(null);
                setSearchError("Error searching customer");
                form.setValue("userId", "");
            } finally {
                setSearchingCustomer(false);
            }
        };

        const timer = setTimeout(fetchCustomer, 500);
        return () => clearTimeout(timer);
    }, [watchPhone, watchType]);

    const onSubmit = async (values) => {
        try {
            // console.log("Before", values)
            // return;
            values = {
                ...values,
                active: values?.active == "true" ? true : false,
                startDate: istToUTC(values?.startDate),
                endDate: istToUTC(values?.endDate)
            }
            if (values.type === "oneTimeUser") {
                values.isAdminOnly = true;
            }
            // console.log("After", values)
            if (selectedCoupon?.code) {
                // editing
                await updateCoupon.mutateAsync({ id: selectedCoupon?._id, ...values })
            } else {
                // creating
                await createCoupon.mutateAsync(values)
            }
            onOpenChange(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {selectedCoupon?.code ? "Edit" : "Create"} Coupon
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 pt-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* TYPE FIELD */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select coupon type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">General</SelectItem>
                                                <SelectItem value="online">Prepaid</SelectItem>
                                                <SelectItem value="oneTime">One Time</SelectItem>
                                                <SelectItem value="firstTime">First Time Users</SelectItem>
                                                <SelectItem value="oneTimeUser">One Time (Specific User)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Active FIELD */}
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">In Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code</FormLabel>
                                        <FormControl>
                                            <input
                                                {...field}
                                                disabled={!!selectedCoupon?._id}
                                                placeholder="coupon code"
                                                className="w-full border border-gray-500 rounded px-3 py-1 uppercase"
                                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormInputField
                                control={form.control}
                                name="value"
                                disabled={!!selectedCoupon?._id}
                                label="Discount Value"
                                placeholder="e.g. 500"
                            />
                            <FormInputField
                                control={form.control}
                                name="percent"
                                disabled={!!selectedCoupon?._id}
                                label="Discount Percent"
                                placeholder="e.g. 10"
                            />
                            <FormInputField
                                control={form.control}
                                name="minCartValue"
                                label="Minimum Cart Value (₹)"
                                placeholder="e.g. 1000"
                            />
                            <FormInputField
                                control={form.control}
                                name="startDate"
                                label="Start Date & Time"
                                type="datetime-local"
                            />
                            <FormInputField
                                control={form.control}
                                name="endDate"
                                label="End Date & Time"
                                type="datetime-local"
                            />
                            {watchType === "oneTimeUser" && (
                                <div className="col-span-1 sm:col-span-2 space-y-2 bg-gray-50 p-3 rounded border">
                                    <FormInputField
                                        control={form.control}
                                        name="phoneNumber"
                                        label="Customer Phone Number"
                                        placeholder="Enter 10 digit number"
                                    />
                                    <input type="hidden" {...form.register("userId")} />
                                    {searchingCustomer && <p className="text-xs text-blue-600 animate-pulse">Searching customer details...</p>}
                                    {searchError && <p className="text-xs text-red-600 font-medium">⚠️ {searchError}</p>}
                                    {foundCustomer && (
                                        <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded border border-emerald-200 space-y-1">
                                            <p className="font-semibold text-emerald-900 border-b border-emerald-200 pb-1 mb-1">✓ Customer Linked:</p>
                                            <p><span className="font-medium">User ID:</span> {foundCustomer._id}</p>
                                            <p><span className="font-medium">Name:</span> {foundCustomer.name || 'N/A'}</p>
                                            <p><span className="font-medium">Email:</span> {foundCustomer.email || 'N/A'}</p>
                                            <p><span className="font-medium">Phone:</span> {foundCustomer.phoneNo || foundCustomer.phone || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="isAdminOnly"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "true")}
                                            value={watchType === "oneTimeUser" ? "true" : (field.value ? "true" : "false")}
                                            disabled={watchType === "oneTimeUser"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="false">Visible to All Users</SelectItem>
                                                <SelectItem value="true">Visible to Admin Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <LoaderButton
                                loading={createCoupon.isPending || updateCoupon.isPending}
                                type="submit"
                            >
                                Save Coupon
                            </LoaderButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
