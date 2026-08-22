"use client"
import { Car, Printer, Download, Truck, Edit2, Plus, Calendar, FileText, Copy, Link2, ChevronLeft, ShoppingBag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import PCard from '@/components/custom/PCard';
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout';
import { useOrders } from '@/hooks/useOrders';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { format } from 'date-fns'
import UpperDetailss from './components/UpperDetailss';
import PersonalDetails from './components/PersonalDetails';
import PaymentDetails from './components/PaymentDetails';
import ItemsTable from './components/ItemsTable';
import LoaderButton from "@/components/custom/LoaderButton";
import CourierDialog from "./components/CourierDialog";
import ShippingDetails from "./components/ShippingDetails";
import { toast } from 'react-hot-toast'
import OrderSkeletonPage from "./components/OrderSkeletonPage";
import Scans from "./components/Scans";
import RejectDialog from "../components/RejectOrderDialog";
import CancelDialog from "../components/CancelDialog";
import UpdateStatus from "./components/UpdateStatus";
import Link from "next/link";
import GSTBillDownload from "@/components/GSTBill";
import ReturnShippingDetails from "./components/ReturnShippingDetails";
import OrderTimeline from "@/components/OrderTimeline";
import ActivityLogDrawer from "@/components/ActivityLogDrawer";
import GSTBillDownloadV2 from "@/components/GSTBillV2";

function page() {
    const params = useParams();
    const id = params.id;
    const [courierOpen, setCourierOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [cancelOpen, setCancelOpen] = useState(false)
    const [isActivityOpen, setIsActivityOpen] = useState(false)

    const { getSingleOrderQuery, onlyAdmin, markAsDelivered, permissions: { canView, canAdd, canEdit, canDelete } } = useOrders()
    const { data: orderResp, isLoading, error } = getSingleOrderQuery(id)
    const order = orderResp?.data || {}

    const queryClient = useQueryClient()

    // Dialog state toggles
    const [shipChoiceOpen, setShipChoiceOpen] = useState(false)
    const [manualShippingOpen, setManualShippingOpen] = useState(false)
    const [updateStatusOpen, setUpdateStatusOpen] = useState(false)
    const [addPaymentOpen, setAddPaymentOpen] = useState(false)
    const [editPaymentOpen, setEditPaymentOpen] = useState(false)

    // Manual shipping state fields
    const [awbCode, setAwbCode] = useState("")
    const [courierName, setCourierName] = useState("")
    const [shippingPartnerKey, setShippingPartnerKey] = useState("")
    const [schedulePickup, setSchedulePickup] = useState(false)
    const [pickupScheduledAt, setPickupScheduledAt] = useState("")
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("")
    const [shipAddress, setShipAddress] = useState("")
    const [shipAddress2, setShipAddress2] = useState("")
    const [shipCity, setShipCity] = useState("")
    const [shipState, setShipState] = useState("")
    const [shipPincode, setShipPincode] = useState("")
    const [trackingUrl, setTrackingUrl] = useState("")

    // Manual status update fields
    const [shippingStatus, setShippingStatus] = useState("picked up")
    const [statusDate, setStatusDate] = useState("")
    const [statusDescription, setStatusDescription] = useState("")

    // Payments state fields
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("COD")
    const [paymentStatus, setPaymentStatus] = useState("Paid")
    const [paymentNotes, setPaymentNotes] = useState("")
    const [paymentPaidAt, setPaymentPaidAt] = useState("")
    const [editingPayment, setEditingPayment] = useState(null)
    const [paymentSubtotal, setPaymentSubtotal] = useState("")
    const [paymentDiscount, setPaymentDiscount] = useState("")

    // Generate payment link state
    const [generateLinkOpen, setGenerateLinkOpen] = useState(false)
    const [generateLinkPaymentId, setGenerateLinkPaymentId] = useState(null)
    const [selectedGateway, setSelectedGateway] = useState("razorpay")

    // Synchronize shipping defaults on order load
    React.useEffect(() => {
        if (orderResp?.data) {
            const o = orderResp.data
            setShipAddress(o.address || "")
            setShipAddress2(o.address2 || "")
            setShipCity(o.city || "")
            setShipState(o.state || "")
            setShipPincode(o.pincode || "")
            setAwbCode(o.awbCode || "")
            setCourierName(o.courierName || "")
            setShippingPartnerKey(o.shippingPartner || "")
            setSchedulePickup(o.pickupScheduled || false)
            setPickupScheduledAt(o.pickupDate ? o.pickupDate.split('T')[0] : "")
            setExpectedDeliveryDate(o.expectedDeliveryDate ? o.expectedDeliveryDate.split('T')[0] : "")
            setTrackingUrl(o.trackingUrl || "")
        }
    }, [orderResp])

    // Query for listing payments
    const { data: paymentsRes, refetch: refetchPayments } = useQuery({
        queryKey: ["orderPayments", id],
        queryFn: () => api.get(`/orders/payments/list/${id}`).then(res => res.data),
        enabled: !!id
    });
    const paymentsList = paymentsRes?.data || [];

    // Mutations
    const manualShipMutation = useMutation({
        mutationFn: (data) => api.post("/orders/manual-ship", data).then(res => res.data),
        onSuccess: () => {
            toast.success("Manual shipping details saved successfully!");
            queryClient.invalidateQueries({ queryKey: ["order"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setManualShippingOpen(false);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to save manual shipping details")
    });

    const updateManualStatusMutation = useMutation({
        mutationFn: (data) => api.post("/orders/manual-ship/status", data).then(res => res.data),
        onSuccess: () => {
            toast.success("Shipping status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["order"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setUpdateStatusOpen(false);
            setStatusDescription("");
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to update shipping status")
    });

    const addPaymentMutation = useMutation({
        mutationFn: (data) => api.post("/orders/payments/add", data).then(res => res.data),
        onSuccess: () => {
            toast.success("Payment transaction added successfully!");
            queryClient.invalidateQueries({ queryKey: ["order"] });
            refetchPayments();
            setAddPaymentOpen(false);
            setPaymentAmount("");
            setPaymentNotes("");
            setPaymentPaidAt("");
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to add payment transaction")
    });

    const editPaymentMutation = useMutation({
        mutationFn: ({ paymentId, data }) => api.put(`/orders/payments/edit/${paymentId}`, data).then(res => res.data),
        onSuccess: () => {
            toast.success("Payment transaction updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["order"] });
            refetchPayments();
            setEditPaymentOpen(false);
            setEditingPayment(null);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to update payment transaction")
    });

    const generateLinkMutation = useMutation({
        mutationFn: (data) => api.post("/orders/payments/generate-link", data).then(res => res.data),
        onSuccess: (res) => {
            toast.success(res?.message || "Payment link generated successfully!");
            refetchPayments();
            setGenerateLinkOpen(false);
            setGenerateLinkPaymentId(null);
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to generate payment link")
    });

    const applyCouponMutation = useMutation({
        mutationFn: (data) => api.post("/coupon/admin/apply", data).then(res => res.data),
        onSuccess: () => {
            toast.success("Coupon applied successfully!");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
            refetchPayments();
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to apply coupon")
    });

    const removeCouponMutation = useMutation({
        mutationFn: (data) => api.post("/coupon/admin/remove", data).then(res => res.data),
        onSuccess: () => {
            toast.success("Coupon removed successfully!");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
            refetchPayments();
        },
        onError: (err) => toast.error(err?.response?.data?.message || "Failed to remove coupon")
    });

    if (isLoading) return <OrderSkeletonPage />
    if (error) return <p>Error: {error.message}</p>

    function isNewOrder() {
        return order?.status === 'New' || order?.status === 'Accepted' || order.status === 'Hold'
    }

    async function handleGetCourierId() {
        const { address, city, country, pincode } = order

        // if any of these is falsy, show an error
        if (!address || !city || !country || !pincode) {
            toast.error('Please complete the customer\'s address details before continue.')
            return
        }

        setCourierOpen(true)
    }

    const isAdmin = onlyAdmin();

    const canCancel = () => {
        if (!isAdmin) return false;
        if (order?.returnData?.isReturnInitiated) return false;
        if (order?.shippingType === 'Manual') {
            return !['Delivered', 'Rejected', 'Cancelled', 'Returned'].includes(order?.status);
        } else {
            return (
                (order?.status === 'New' || order?.status === 'Accepted' || order?.status === 'Hold') &&
                !order?.awbCode &&
                !order?.shipmentId &&
                !order?.pickupScheduled &&
                !order?.courierName
            );
        }
    };

    return (
        <InnerDashboardLayout>
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-2">
                        <Link href="/admin/orders">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:bg-slate-100">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <ShoppingBag className="w-8 h-8 text-slate-800" />
                                Order Details
                            </h1>
                            <p className="text-slate-500 mt-1">Order ID: <span className="font-mono font-bold text-slate-700">{order?.orderId}</span></p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {!order?.abondonedOrder && !order?.shipmentId && order?.shippingType !== "Manual" && isNewOrder() && canEdit &&
                            <UpdateStatus
                                order={order}
                                orderId={order?._id}
                                status={order?.status}
                            />
                        }

                        {isNewOrder() && !order?.abondonedOrder && !order?.shipmentId && order?.status !== "Shipped" && canEdit &&
                            <Button
                                onClick={() => {
                                    if (order?.shippingType === "Manual") {
                                        setManualShippingOpen(true);
                                    } else {
                                        setShipChoiceOpen(true);
                                    }
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-semibold shadow-sm"
                            >
                                <Truck className="h-4 w-4" />
                                Ship Now
                            </Button>
                        }

                        {order?.shippingType === "Manual" && order?.status === "Shipped" && canEdit &&
                            <Button
                                onClick={() => setUpdateStatusOpen(true)}
                                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold gap-2"
                            >
                                <Truck className="h-4 w-4" />
                                Update Shipping Status
                            </Button>
                        }

                        {/* track shipment button */}
                        {order?.scans?.length > 0 &&
                            <Link href={'#scan-section'}>
                                <Button variant="outline" className="gap-2" >
                                    <Truck className="h-4 w-4" />
                                </Button>
                            </Link>
                        }

                        <GSTBillDownloadV2 billData={order} />

                        {isNewOrder() && canEdit &&
                            <Button
                                onClick={() => setRejectOpen(true)}
                                variant="destructive"
                                className="gap-2">
                                Reject
                            </Button>
                        }
                        {canCancel() &&
                            <Button
                                onClick={() => setCancelOpen(true)}
                                variant="destructive"
                                className="gap-2">
                                Cancel
                            </Button>
                        }
                        {((order?.status === 'New' || order?.status === 'Accepted' || order?.status === 'Shipped') &&
                            (order?.shippingType === 'Manual' || !order?.shipmentId)) && !order?.abondonedOrder && isAdmin &&
                            <Button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to mark this order as Delivered manually?")) {
                                        markAsDelivered.mutateAsync({ orderId: order._id })
                                    }
                                }}
                                variant="success"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                disabled={markAsDelivered.isPending}
                            >
                                Mark Delivered
                            </Button>
                        }
                        <Button
                            onClick={() => setIsActivityOpen(true)}
                            variant="outline"
                            className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 gap-1.5"
                        >
                            <Clock className="w-4 h-4 text-slate-500" />
                            History
                        </Button>
                    </div>
                </div>

                <div className='space-y-3'>
                    {/* Upper Details */}
                    <UpperDetailss order={order} admin={isAdmin} canEdit={canEdit} />

                    {/* Order Timeline & Call Attempts */}
                    <OrderTimeline order={order} />

                    {isActivityOpen && (
                        <ActivityLogDrawer
                            open={isActivityOpen}
                            onOpenChange={setIsActivityOpen}
                            id={id}
                            type="order"
                        />
                    )}

                    <PaymentDetails order={order} />


                    {order?.returnData &&
                        <ReturnShippingDetails order={order} />
                    }

                    {(order?.shipmentId || order?.shippingType === "Manual") &&
                        <ShippingDetails order={order} />
                    }

                    <PersonalDetails order={order} canEdit={canEdit} />

                    <ItemsTable
                        order={order}
                        isNewOrder={isNewOrder}
                        canEdit={canEdit}
                        isAdmin={isAdmin}
                        applyCouponMutation={applyCouponMutation}
                        removeCouponMutation={removeCouponMutation}
                        paymentsList={paymentsList}
                    />

                    {/* Payments & Transactions List */}
                    <PCard>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Payment Transactions</h2>
                            {canEdit && (
                                <Button
                                    onClick={() => {
                                        setPaymentSubtotal(order.subtotal || "");
                                        setPaymentDiscount(order.couponsApplied?.length > 0 ? 0 : (order.discount || 0));
                                        setPaymentAmount("");
                                        setPaymentNotes("");
                                        setPaymentMethod("Online");
                                        setPaymentStatus(isAdmin ? "Paid" : "Pending");
                                        setPaymentPaidAt("");
                                        setAddPaymentOpen(true);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4" /> Add Payment
                                </Button>
                            )}
                        </div>

                        {paymentsList.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-sm italic">
                                No payment transactions recorded for this order.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100 text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-left">
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Subtotal</th>
                                            <th className="p-3">Discount</th>
                                            <th className="p-3">Coupon</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Method</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Notes</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                        {paymentsList.map((payment) => (
                                            <tr key={payment._id} className="hover:bg-slate-50/50">
                                                <td className="p-3 whitespace-nowrap">
                                                    {payment.paidAt ? format(new Date(payment.paidAt), 'dd MMM yyyy, hh:mm a') : format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
                                                </td>
                                                <td className="p-3 whitespace-nowrap text-slate-900">
                                                    ₹{payment.subtotal?.toLocaleString() || "0"}
                                                </td>
                                                <td className="p-3 whitespace-nowrap text-slate-500">
                                                    ₹{payment.discount?.toLocaleString() || "0"}
                                                </td>
                                                <td className="p-3 whitespace-nowrap text-slate-500">
                                                    {payment.couponCode ? `${payment.couponCode} (-₹${payment.coupon})` : "—"}
                                                </td>
                                                <td className="p-3 text-slate-900 font-bold whitespace-nowrap">
                                                    ₹{payment.amount?.toLocaleString()}
                                                </td>
                                                <td className="p-3 whitespace-nowrap">{payment.method}</td>
                                                <td className="p-3 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${payment.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 max-w-[200px] truncate" title={payment.notes}>
                                                    {payment.notes || "—"}
                                                </td>
                                                <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                                                    {payment.status !== "Paid" && !payment.couponId && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingPayment(payment);
                                                                setPaymentSubtotal(payment.subtotal || payment.amount || 0);
                                                                setPaymentDiscount(payment.discount || 0);
                                                                setPaymentAmount(payment.amount);
                                                                setPaymentNotes(payment.notes || "");
                                                                setPaymentMethod(payment.method);
                                                                setPaymentStatus(payment.status);
                                                                setPaymentPaidAt(payment.paidAt ? new Date(payment.paidAt).toISOString().split('T')[0] : "");
                                                                setEditPaymentOpen(true);
                                                            }}
                                                            className="text-indigo-650 hover:text-indigo-900 h-8 w-8 p-0"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <GSTBillDownloadV2 billData={order} paymentData={payment} />
                                                    {payment.method === "Online" && payment.status !== "Paid" && (
                                                        payment.paymentLinkUrl ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(payment.paymentLinkUrl);
                                                                    toast.success("Payment link copied!");
                                                                }}
                                                                className="text-emerald-600 hover:text-emerald-800 h-8 px-2 gap-1"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" /> Copy Link
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setGenerateLinkPaymentId(payment._id);
                                                                    setSelectedGateway("razorpay");
                                                                    setGenerateLinkOpen(true);
                                                                }}
                                                                className="text-indigo-650 hover:text-indigo-900 h-8 px-2 gap-1"
                                                            >
                                                                <Link2 className="w-3.5 h-3.5" /> Generate Link
                                                            </Button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </PCard>

                    <Scans order={order} />
                </div>
                {
                    courierOpen &&
                    <CourierDialog
                        open={courierOpen}
                        onOpenChange={setCourierOpen}
                        order={order}
                    />
                }
                <RejectDialog
                    open={rejectOpen}
                    onOpenChange={setRejectOpen}
                    order={order}
                />
                <CancelDialog
                    open={cancelOpen}
                    onOpenChange={setCancelOpen}
                    order={order}
                />

                {/* CHOICE DIALOG: Partner vs Manual */}
                <Dialog open={shipChoiceOpen} onOpenChange={setShipChoiceOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5 font-bold">
                                <Truck className="w-5 h-5" /> Select Shipping Partner Option
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <Button
                                onClick={() => {
                                    setShipChoiceOpen(false);
                                    handleGetCourierId();
                                }}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold h-20 flex flex-col gap-2 rounded-xl shadow-sm"
                            >
                                <span>Shiprocket Partner</span>
                                <span className="text-[10px] font-normal text-slate-200">Automatically lookup and allocate courier</span>
                            </Button>
                            <Button
                                onClick={() => {
                                    setShipChoiceOpen(false);
                                    setManualShippingOpen(true);
                                }}
                                variant="outline"
                                className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold h-20 flex flex-col gap-2 rounded-xl"
                            >
                                <span>Manual Shipping</span>
                                <span className="text-[10px] font-normal text-slate-500">Self-delivered or use custom shipping</span>
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* GENERATE PAYMENT LINK DIALOG */}
                <Dialog open={generateLinkOpen} onOpenChange={setGenerateLinkOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5 font-bold">
                                <Link2 className="w-5 h-5" /> Generate Payment Link
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Select the payment gateway provider to create a short link.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-3 text-sm">
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Payment Gateway</Label>
                                <Select value={selectedGateway} onValueChange={setSelectedGateway}>
                                    <SelectTrigger className="w-full border-slate-200">
                                        <SelectValue placeholder="Select Gateway" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="razorpay">Razorpay</SelectItem>
                                        <SelectItem value="phonepe">PhonePe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setGenerateLinkOpen(false)} className="text-slate-400">
                                Cancel
                            </Button>
                            <LoaderButton
                                onClick={() => generateLinkMutation.mutate({ paymentId: generateLinkPaymentId, gateway: selectedGateway })}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                                loading={generateLinkMutation.isPending}
                            >
                                Generate
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* MANUAL SHIPPING DIALOG */}
                <Dialog open={manualShippingOpen} onOpenChange={setManualShippingOpen}>
                    <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5 font-bold">
                                <Truck className="w-5 h-5" /> Add Manual Shipping Details
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">AWB Tracking Code</Label>
                                    <Input value={awbCode} onChange={(e) => setAwbCode(e.target.value)} placeholder="e.g. AWB123456" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Courier Partner Name</Label>
                                    <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="e.g. Delhivery, BlueDart" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Shipping Partner Key / String</Label>
                                <Input value={shippingPartnerKey} onChange={(e) => setShippingPartnerKey(e.target.value)} placeholder="e.g. partner_key_xyz" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Tracking URL</Label>
                                <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="e.g. https://delhivery.com/track?id=123" />
                            </div>

                            <div className="border-t pt-3 flex flex-col gap-3">
                                <span className="font-bold text-slate-700 text-xs uppercase">Delivery Address overrides</span>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 text-xs">Street Address</Label>
                                    <Input value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 text-xs">Street Address 2</Label>
                                    <Input value={shipAddress2} onChange={(e) => setShipAddress2(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-slate-500 text-xs">City</Label>
                                        <Input value={shipCity} onChange={(e) => setShipCity(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-slate-500 text-xs">State</Label>
                                        <Input value={shipState} onChange={(e) => setShipState(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-slate-500 text-xs">Pincode</Label>
                                        <Input value={shipPincode} onChange={(e) => setShipPincode(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-t pt-3 mt-1">
                                <input
                                    type="checkbox"
                                    id="schedule_pickup"
                                    checked={schedulePickup}
                                    onChange={(e) => setSchedulePickup(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <Label htmlFor="schedule_pickup" className="font-bold text-slate-700 text-xs uppercase cursor-pointer">Schedule courier pickup now</Label>
                            </div>

                            {schedulePickup && (
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-slate-700 font-semibold text-xs uppercase">Pickup Date</Label>
                                        <Input type="date" value={pickupScheduledAt} onChange={(e) => setPickupScheduledAt(e.target.value)} className="bg-white border-slate-200" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Label className="text-slate-700 font-semibold text-xs uppercase">Expected Delivery</Label>
                                        <Input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="bg-white border-slate-200" />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0 mt-2">
                            <Button variant="ghost" onClick={() => setManualShippingOpen(false)} className="text-slate-400">
                                Cancel
                            </Button>
                            <LoaderButton
                                onClick={() => manualShipMutation.mutate({
                                    orderId: order._id,
                                    awbCode,
                                    courierName,
                                    shippingPartner: shippingPartnerKey,
                                    address: shipAddress,
                                    address2: shipAddress2,
                                    city: shipCity,
                                    state: shipState,
                                    pincode: shipPincode,
                                    schedulePickup,
                                    pickupScheduledAt,
                                    expectedDeliveryDate,
                                    trackingUrl
                                })}
                                loading={manualShipMutation.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                Save Shipping
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* UPDATE MANUAL SHIPPING STATUS DIALOG */}
                <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5">
                                <Truck className="w-5 h-5" /> Update Shipping Status
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3 text-sm">
                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Select Shipping Status</Label>
                                <Select onValueChange={(val) => setShippingStatus(val)} defaultValue={shippingStatus}>
                                    <SelectTrigger className="border-slate-200 h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="picked up">Picked Up</SelectItem>
                                        <SelectItem value="in transit">In Transit</SelectItem>
                                        <SelectItem value="rto initiated">RTO Initiated</SelectItem>
                                        <SelectItem value="rto delivered">RTO Delivered</SelectItem>
                                        <SelectItem value="rto accepted">RTO Accepted</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Status Date / Time</Label>
                                <Input type="datetime-local" value={statusDate} onChange={(e) => setStatusDate(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Activity Description</Label>
                                <Textarea value={statusDescription} onChange={(e) => setStatusDescription(e.target.value)} placeholder="e.g. Shipped from warehouse, out for delivery" />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setUpdateStatusOpen(false)} className="text-slate-400">
                                Cancel
                            </Button>
                            <LoaderButton
                                onClick={() => updateManualStatusMutation.mutate({
                                    orderId: order._id,
                                    shippingStatus,
                                    date: statusDate,
                                    description: statusDescription
                                })}
                                loading={updateManualStatusMutation.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                Update Status
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ADD PAYMENT TRANSACTION DIALOG */}
                <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5 font-bold">
                                <Plus className="w-5 h-5" /> Add Payment Transaction
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Subtotal (₹)</Label>
                                    <Input type="number" value={paymentSubtotal} onChange={(e) => setPaymentSubtotal(e.target.value)} placeholder="e.g. 5000" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Discount (₹)</Label>
                                    <Input type="number" value={paymentDiscount} readOnly className="bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500" />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Calculated Amount (₹)</span>
                                <span className="font-bold text-slate-900 text-sm">
                                    ₹{Math.max(0, Number(paymentSubtotal || 0) - Number(paymentDiscount || 0)).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Payment Method</Label>
                                    <Select onValueChange={(val) => setPaymentMethod(val)} defaultValue={paymentMethod}>
                                        <SelectTrigger className="border-slate-200 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Transaction Status</Label>
                                    <Select onValueChange={(val) => setPaymentStatus(val)} defaultValue={paymentStatus} disabled={!isAdmin}>
                                        <SelectTrigger className="border-slate-200 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Paid Date (Optional)</Label>
                                <Input type="date" value={paymentPaidAt} onChange={(e) => setPaymentPaidAt(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Notes</Label>
                                <Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Installment comments or ref ID" />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setAddPaymentOpen(false)} className="text-slate-400">
                                Cancel
                            </Button>
                            <LoaderButton
                                onClick={() => addPaymentMutation.mutate({
                                    orderId: order._id,
                                    subtotal: Number(paymentSubtotal),
                                    discount: Number(paymentDiscount),
                                    method: paymentMethod,
                                    status: paymentStatus,
                                    notes: paymentNotes,
                                    paidAt: paymentPaidAt
                                })}
                                loading={addPaymentMutation.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                Add Transaction
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* EDIT PAYMENT TRANSACTION DIALOG */}
                <Dialog open={editPaymentOpen} onOpenChange={setEditPaymentOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 flex items-center gap-1.5 font-bold">
                                <Edit2 className="w-5 h-5" /> Edit Payment Transaction
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Subtotal (₹)</Label>
                                    <Input type="number" value={paymentSubtotal} onChange={(e) => setPaymentSubtotal(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Discount (₹)</Label>
                                    <Input type="number" value={paymentDiscount} readOnly className="bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500" />
                                </div>
                            </div>

                            {editingPayment?.coupon > 0 && (
                                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100/60 flex justify-between items-center text-xs text-emerald-800">
                                    <span className="font-semibold">Coupon Discount Applied</span>
                                    <span className="font-bold">-₹{editingPayment.coupon}</span>
                                </div>
                            )}

                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-500 uppercase">Calculated Amount (₹)</span>
                                <span className="font-bold text-slate-900 text-sm">
                                    ₹{Math.max(0, Number(paymentSubtotal || 0) - Number(paymentDiscount || 0) - Number(editingPayment?.coupon || 0)).toLocaleString()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Payment Method</Label>
                                    <Select onValueChange={(val) => setPaymentMethod(val)} defaultValue={paymentMethod}>
                                        <SelectTrigger className="border-slate-200 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="UPI">UPI</SelectItem>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Mixed">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label className="text-slate-500 font-semibold text-xs uppercase">Transaction Status</Label>
                                    <Select onValueChange={(val) => setPaymentStatus(val)} defaultValue={paymentStatus} disabled={!isAdmin}>
                                        <SelectTrigger className="border-slate-200 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Paid Date (Optional)</Label>
                                <Input type="date" value={paymentPaidAt} onChange={(e) => setPaymentPaidAt(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <Label className="text-slate-500 font-semibold text-xs uppercase">Notes</Label>
                                <Input value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Installment comments or ref ID" />
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setEditPaymentOpen(false)} className="text-slate-400">
                                Cancel
                            </Button>
                            <LoaderButton
                                onClick={() => editPaymentMutation.mutate({
                                    paymentId: editingPayment?._id,
                                    data: {
                                        subtotal: Number(paymentSubtotal),
                                        discount: Number(paymentDiscount),
                                        method: paymentMethod,
                                        status: paymentStatus,
                                        notes: paymentNotes,
                                        paidAt: paymentPaidAt
                                    }
                                })}
                                loading={editPaymentMutation.isPending}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                                Save Changes
                            </LoaderButton>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </InnerDashboardLayout>
    )
}

export default page