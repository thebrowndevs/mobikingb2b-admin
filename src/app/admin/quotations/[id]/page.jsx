'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    ChevronLeft, Edit, Check, X, AlertTriangle, Trash, Plus, Minus, Search, Loader2, FileText, User, MapPin
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import api from '@/lib/api'
import { useQuotations } from '@/hooks/useQuotations'
import { toast } from 'sonner'
import LoaderButton from '@/components/custom/LoaderButton'

const STATUS_CLASSES = {
    New: 'bg-blue-100 text-blue-800 border-blue-200',
    Accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Hold: 'bg-amber-100 text-amber-800 border-amber-200',
    Booked: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Cancelled: 'bg-slate-100 text-slate-800 border-slate-200'
}

export default function QuotationDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const quotationId = params?.id

    const {
        getSingleQuotation,
        updateQuotationStatus,
        bookQuotation,
        updateQuotation,
        addItemQuantity,
        removeItemQuantity,
        permissions
    } = useQuotations()

    const { data: quotation, isLoading, refetch } = getSingleQuotation(quotationId)

    // Edit toggles
    const [isEditingCustomer, setIsEditingCustomer] = useState(false)
    const [isEditingItems, setIsEditingItems] = useState(false)

    // Customer edit states
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editEmail, setEditEmail] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [editAddress2, setEditAddress2] = useState('')
    const [editCity, setEditCity] = useState('')
    const [editState, setEditState] = useState('')
    const [editPincode, setEditPincode] = useState('')
    const [editComments, setEditComments] = useState('')

    // Charges / Discounts edit states (saved via Save Charges button)
    const [editDeliveryCharge, setEditDeliveryCharge] = useState(0)
    const [editDiscount, setEditDiscount] = useState(0)
    const [editItemDiscounts, setEditItemDiscounts] = useState({}) // maps variantName -> discount

    // Product search inside editor
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [addQuantity, setAddQuantity] = useState(1)

    // Action dialog states
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
    const [numberOfStages, setNumberOfStages] = useState(1)
    const [stages, setStages] = useState([
        { amount: '', method: 'COD', status: 'Pending', notes: '' }
    ])

    const [bookingPaymentMode, setBookingPaymentMode] = useState("complete")
    const [bookingPaymentMethod, setBookingPaymentMethod] = useState("COD")
    const [bookingLength, setBookingLength] = useState(19)
    const [bookingBreadth, setBookingBreadth] = useState(16)
    const [bookingHeight, setBookingHeight] = useState(6)
    const [bookingWeight, setBookingWeight] = useState(0.5)

    // Load quotation values into edit states on load
    useEffect(() => {
        if (quotation) {
            setEditName(quotation.name || '')
            setEditPhone(quotation.phoneNo || '')
            setEditEmail(quotation.email || '')
            setEditAddress(quotation.address || '')
            setEditAddress2(quotation.address2 || '')
            setEditCity(quotation.city || '')
            setEditState(quotation.state || '')
            setEditPincode(quotation.pincode || '')
            setEditComments(quotation.comments || '')
            setEditDeliveryCharge(quotation.deliveryCharge || 0)
            setEditDiscount(quotation.discount || 0)

            setBookingLength(quotation.length || 19)
            setBookingBreadth(quotation.breadth || 16)
            setBookingHeight(quotation.height || 6)
            setBookingWeight(quotation.weight || 0.5)
            setBookingPaymentMode(quotation.paymentMode || "complete")
            setBookingPaymentMethod(quotation.method || "COD")

            const discounts = {}
                ; (quotation.items || []).forEach(it => {
                    discounts[it.variantName] = it.discount || 0
                })
            setEditItemDiscounts(discounts)
        }
    }, [quotation])

    // Handle stage payments generation
    useEffect(() => {
        if (quotation) {
            const orderAmount = quotation.orderAmount
            const perStageAmount = (orderAmount / numberOfStages).toFixed(2)

            const newStages = []
            for (let i = 0; i < numberOfStages; i++) {
                newStages.push({
                    amount: perStageAmount,
                    method: 'COD',
                    status: 'Pending',
                    notes: `Stage ${i + 1} payment`
                })
            }
            setStages(newStages)
        }
    }, [numberOfStages, bookingDialogOpen, quotation])

    const handleProductSearch = async (val) => {
        setSearchQuery(val)
        if (!val.trim()) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const res = await api.get(`/product/all/search?q=${val}`)
            setSearchResults(res.data?.data || [])
        } catch (e) {
            console.error("Search error:", e)
        } finally {
            setSearching(false)
        }
    };

    const handleSelectProduct = async (prod) => {
        setSelectedProduct(prod)
        setSelectedVariant(null)
        try {
            const res = await api.get(`/product/${prod._id}`)
            setSelectedProduct(res.data?.data || prod)
        } catch (e) {
            console.error("Failed to load variants:", e)
        }
    };

    // Incremental item add calling backend endpoint directly
    const handleAddItemQuantity = async (productId, variantName, quantityToAdd) => {
        try {
            await addItemQuantity.mutateAsync({
                quotationId: quotation._id,
                productId,
                variantName,
                quantity: quantityToAdd
            })
            refetch()
        } catch (err) {
            console.error(err)
        }
    };

    // Incremental item remove calling backend endpoint directly
    const handleRemoveItemQuantity = async (productId, variantName, quantityToRemove) => {
        try {
            await removeItemQuantity.mutateAsync({
                quotationId: quotation._id,
                productId,
                variantName,
                quantity: quantityToRemove
            })
            refetch()
        } catch (err) {
            console.error(err)
        }
    };

    // Save Customer Details to backend
    const handleSaveCustomer = async () => {
        try {
            await updateQuotation.mutateAsync({
                quotationId: quotation._id,
                name: editName,
                phoneNo: editPhone,
                email: editEmail,
                address: editAddress,
                address2: editAddress2,
                city: editCity,
                state: editState,
                pincode: editPincode,
                comments: editComments
            })
            setIsEditingCustomer(false)
            refetch()
        } catch (e) {
            console.error(e)
        }
    };

    // Save Pricing charges, global discount, and per-item discounts
    const handleSaveCharges = async () => {
        try {
            // Re-submit the existing items with updated discounts
            const itemsData = (quotation.items || []).map((it) => ({
                productId: it.productId?._id || it.productId,
                variantName: it.variantName,
                quantity: it.quantity,
                discount: Number(editItemDiscounts[it.variantName] || 0)
            }))

            await updateQuotation.mutateAsync({
                quotationId: quotation._id,
                deliveryCharge: Number(editDeliveryCharge),
                discount: Number(editDiscount),
                items: itemsData
            })
            toast.success("Charges and pricing updated successfully.")
            refetch()
        } catch (e) {
            console.error(e)
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) return
        await updateQuotationStatus.mutateAsync({
            quotationId: quotation._id,
            status: 'Rejected',
            reason: rejectReason
        })
        setRejectDialogOpen(false)
        setRejectReason('')
        refetch()
    };

    const handleBookingSubmit = async () => {
        await bookQuotation.mutateAsync({
            quotationId: quotation._id,
            paymentMode: bookingPaymentMode,
            method: bookingPaymentMethod,
            length: Number(bookingLength),
            breadth: Number(bookingBreadth),
            height: Number(bookingHeight),
            weight: Number(bookingWeight)
        })
        setBookingDialogOpen(false)
        router.push("/admin/orders")
    };

    if (isLoading) {
        return (
            <InnerDashboardLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
                </div>
            </InnerDashboardLayout>
        );
    }

    if (!quotation) {
        return (
            <InnerDashboardLayout>
                <div className="p-6">
                    <p className="text-rose-500 font-bold">Order Request not found.</p>
                </div>
            </InnerDashboardLayout>
        );
    }

    const isActionable = !['Booked', 'Rejected', 'Cancelled'].includes(quotation.status)

    return (
        <InnerDashboardLayout>
            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
                {/* Back Link */}
                <div className="flex items-center gap-2">
                    <Link href="/admin/quotations">
                        <Button variant="ghost" size="sm" className="hover:bg-slate-100 font-semibold gap-1 text-slate-500">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Order Requests
                        </Button>
                    </Link>
                </div>

                {/* Banner / Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <FileText className="w-8 h-8 text-slate-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 font-mono">{quotation.quotationId}</h1>
                                <Badge className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${STATUS_CLASSES[quotation.status] || 'bg-slate-100 text-slate-800'}`}>
                                    {quotation.status}
                                </Badge>
                            </div>
                            <p className="text-slate-400 text-xs mt-1">
                                Placed on {format(new Date(quotation.createdAt), 'dd MMM yyyy, hh:mm a')} | Source: {quotation.isAppOrder ? 'App' : 'Website'}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                        {isActionable && (
                            <>
                                {quotation.status !== 'Accepted' && (
                                    <LoaderButton
                                        loading={updateQuotationStatus.isPending}
                                        onClick={() => updateQuotationStatus.mutate({ quotationId: quotation._id, status: 'Accepted' })}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                                    >
                                        Accept Request
                                    </LoaderButton>
                                )}

                                {quotation.status !== 'Hold' && (
                                    <LoaderButton
                                        loading={updateQuotationStatus.isPending}
                                        onClick={() => updateQuotationStatus.mutate({ quotationId: quotation._id, status: 'Hold' })}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
                                    >
                                        Place on Hold
                                    </LoaderButton>
                                )}

                                <Button
                                    onClick={() => setRejectDialogOpen(true)}
                                    variant="destructive"
                                    className="font-semibold shadow-sm"
                                >
                                    Reject
                                </Button>
                            </>
                        )}

                        {/* Booking actions */}
                        {quotation.status === 'Accepted' && (
                            <>
                                <Button
                                    onClick={() => setBookingDialogOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                                >
                                    Book Order
                                </Button>
                                <LoaderButton
                                    loading={updateQuotationStatus.isPending}
                                    onClick={() => updateQuotationStatus.mutate({ quotationId: quotation._id, status: 'Cancelled' })}
                                    variant="outline"
                                    className="border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold"
                                >
                                    Cancel Quotation
                                </LoaderButton>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Pane (Customer & Items) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Customer Details Card (Always Above Items List) */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-500" />
                                    Customer Details
                                </CardTitle>
                                {isActionable && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingCustomer(!isEditingCustomer)}
                                        className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 gap-1.5"
                                    >
                                        {isEditingCustomer ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                        {isEditingCustomer ? 'Cancel' : 'Edit Customer/Address'}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="text-sm text-slate-700">
                                {isEditingCustomer ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-400 font-bold">NAME</span>
                                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-9 border-slate-200 text-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-400 font-bold">PHONE</span>
                                                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-9 border-slate-200 text-slate-700" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-slate-400 font-bold">EMAIL</span>
                                                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-9 border-slate-200 text-slate-700" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 font-bold">SHIPPING ADDRESS</span>
                                            <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Address line 1" className="h-9 border-slate-200 text-slate-700 mb-2" />
                                            <Input value={editAddress2} onChange={(e) => setEditAddress2(e.target.value)} placeholder="Address line 2" className="h-9 border-slate-200 text-slate-700 mb-2" />
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="City" className="h-9 border-slate-200 text-slate-700" />
                                                <Input value={editState} onChange={(e) => setEditState(e.target.value)} placeholder="State" className="h-9 border-slate-200 text-slate-700" />
                                                <Input value={editPincode} onChange={(e) => setEditPincode(e.target.value)} placeholder="Pincode" className="h-9 border-slate-200 text-slate-700" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 font-bold">COMMENTS / REMARKS</span>
                                            <Textarea value={editComments} onChange={(e) => setEditComments(e.target.value)} placeholder="Warehouse note..." className="border-slate-200 text-slate-700 text-xs" />
                                        </div>

                                        <div className="flex gap-2 justify-end mt-2">
                                            <Button variant="ghost" onClick={() => setIsEditingCustomer(false)} className="text-slate-400 hover:bg-slate-100">
                                                Discard
                                            </Button>
                                            <LoaderButton
                                                loading={updateQuotation.isPending}
                                                onClick={handleSaveCustomer}
                                                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                                            >
                                                Save Customer Details
                                            </LoaderButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" /> Contact info
                                            </span>
                                            <span className="font-bold text-slate-800 mt-1">{quotation.name}</span>
                                            <span className="text-slate-500 font-mono text-xs mt-0.5">{quotation.phoneNo}</span>
                                            {quotation.email && <span className="text-slate-500 text-xs">{quotation.email}</span>}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" /> Shipping Address
                                            </span>
                                            <div className="flex flex-col text-slate-600 mt-1">
                                                <span>{quotation.address}</span>
                                                {quotation.address2 && <span>{quotation.address2}</span>}
                                                <span>{quotation.city}, {quotation.state} - {quotation.pincode}</span>
                                                <span>{quotation.country}</span>
                                                {quotation.latitude && quotation.longitude && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                                        <span className="text-[11px] text-slate-400 font-semibold uppercase">Coordinates</span>
                                                        <span className="text-xs font-mono text-slate-600">Lat: {quotation.latitude}, Lng: {quotation.longitude}</span>
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${quotation.latitude},${quotation.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="mt-1 w-fit inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        >
                                                            <MapPin className="w-3.5 h-3.5" /> Show in Map
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-400 font-semibold uppercase">Notes</span>
                                            <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs mt-1">
                                                {quotation.comments || 'No specific warehouse instructions.'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Items List Card */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800">Items List</CardTitle>
                                {isActionable && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingItems(!isEditingItems)}
                                        className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 gap-1.5"
                                    >
                                        {isEditingItems ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                        {isEditingItems ? 'Cancel' : 'Edit Items'}
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isEditingItems && (
                                    /* Product Search & Add (Legacy Add/Remove Flow implementation) */
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 mb-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Search & Add items</h4>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <Input
                                                type="text"
                                                placeholder="Search products to add..."
                                                value={searchQuery}
                                                onChange={(e) => handleProductSearch(e.target.value)}
                                                className="pl-10 border-slate-200 bg-white"
                                            />
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="bg-white border border-slate-100 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50">
                                                {searchResults.map((prod) => (
                                                    <div
                                                        key={prod._id}
                                                        onClick={() => handleSelectProduct(prod)}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                                    >
                                                        <span className="font-semibold text-slate-700">{prod.fullName || prod.name}</span>
                                                        <span className="text-xs text-slate-400">MOQ: {prod.moq}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedProduct && (
                                            <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 mt-2">
                                                <div className="flex flex-col gap-1 min-w-[200px]">
                                                    <span className="text-xs text-slate-400">Selected Product</span>
                                                    <span className="text-sm font-bold text-slate-800">{selectedProduct.fullName || selectedProduct.name}</span>
                                                </div>

                                                <div className="flex flex-col gap-1 min-w-[120px]">
                                                    <span className="text-xs text-slate-400">Variant</span>
                                                    <Select onValueChange={(val) => setSelectedVariant(JSON.parse(val))}>
                                                        <SelectTrigger className="border-slate-200 h-9">
                                                            <SelectValue placeholder="Select variant" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {selectedProduct.variants?.map((v) => (
                                                                <SelectItem key={v._id || v.name} value={JSON.stringify(v)}>
                                                                    {v.name} (Avail: {v.availableStock})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex flex-col gap-1 w-20">
                                                    <span className="text-xs text-slate-400">Quantity</span>
                                                    <Input
                                                        type="number"
                                                        value={addQuantity}
                                                        onChange={(e) => setAddQuantity(Math.max(1, Number(e.target.value)))}
                                                        className="h-9 border-slate-200"
                                                    />
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        handleAddItemQuantity(selectedProduct._id, selectedVariant.name, Number(addQuantity))
                                                        setSelectedProduct(null)
                                                        setSelectedVariant(null)
                                                        setAddQuantity(1)
                                                        setSearchQuery('')
                                                    }}
                                                    disabled={!selectedVariant}
                                                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold self-end h-9 mt-4"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" /> Add Variant
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs">
                                                <th className="py-3 px-4 text-left">ITEM / VARIANT</th>
                                                <th className="py-3 px-4 text-center">QUANTITY</th>
                                                <th className="py-3 px-4 text-right">UNIT PRICE</th>
                                                <th className="py-3 px-4 text-right">DISCOUNT</th>
                                                <th className="py-3 px-4 text-right font-bold">TOTAL</th>
                                                {isEditingItems && <th className="py-3 px-4"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 text-slate-700">
                                            {(quotation.items || []).map((it, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/20">
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800">{it.productId?.fullName || it.productId?.name}</span>
                                                            <span className="text-xs text-slate-400">Variant: {it.variantName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {isEditingItems ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="w-7 h-7 rounded-md border-slate-200"
                                                                    onClick={() => handleRemoveItemQuantity(it.productId?._id || it.productId, it.variantName, 1)}
                                                                >
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <span className="font-bold w-6">{it.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="w-7 h-7 rounded-md border-slate-200"
                                                                    onClick={() => handleAddItemQuantity(it.productId?._id || it.productId, it.variantName, 1)}
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="font-bold">{it.quantity}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono">
                                                        ₹{it.price?.toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {isEditingItems ? (
                                                            <div className="flex items-center justify-end">
                                                                <span className="text-slate-400 mr-1 text-xs">₹</span>
                                                                <Input
                                                                    type="number"
                                                                    value={editItemDiscounts[it.variantName] ?? 0}
                                                                    onChange={(e) => {
                                                                        setEditItemDiscounts({
                                                                            ...editItemDiscounts,
                                                                            [it.variantName]: Number(e.target.value)
                                                                        })
                                                                    }}
                                                                    className="w-20 h-7 text-right border-slate-200 text-xs"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-emerald-600 font-semibold">
                                                                {it.discountPercent > 0 ? (
                                                                    <span>{it.discountPercent}% (-₹{it.discount?.toLocaleString()})</span>
                                                                ) : it.discount > 0 ? (
                                                                    <span>-₹{it.discount.toLocaleString()}</span>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                        ₹{(it.quantity * it.price - (it.discount || 0)).toLocaleString()}
                                                    </td>
                                                    {isEditingItems && (
                                                        <td className="py-3 px-4 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-rose-500 hover:bg-rose-50 w-7 h-7 rounded-md"
                                                                onClick={() => handleRemoveItemQuantity(it.productId?._id || it.productId, it.variantName, it.quantity)}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Pane (White Financial Summary card) */}
                    <div className="flex flex-col gap-6">

                        {/* White Background Box for Financial Summary */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800">Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-slate-700">₹{quotation.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Delivery Charge:</span>
                                    {isEditingItems ? (
                                        <Input
                                            type="number"
                                            value={editDeliveryCharge}
                                            onChange={(e) => setEditDeliveryCharge(e.target.value)}
                                            className="w-24 h-7 text-right border-slate-200 text-xs font-bold"
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-700">₹{quotation.deliveryCharge?.toLocaleString() || '0'}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Global Discount:</span>
                                    {isEditingItems ? (
                                        <Input
                                            type="number"
                                            value={editDiscount}
                                            onChange={(e) => setEditDiscount(e.target.value)}
                                            className="w-24 h-7 text-right border-slate-200 text-xs font-bold"
                                        />
                                    ) : (
                                        <span className="font-bold text-slate-700">
                                            {quotation.discountPercent > 0 ? `(${quotation.discountPercent}%) ` : ''}
                                            ₹{quotation.discount?.toLocaleString() || '0'}
                                        </span>
                                    )}
                                </div>
                                <Separator className="my-2 bg-slate-100" />
                                <div className="flex justify-between text-base font-extrabold text-slate-900">
                                    <span>Order Total:</span>
                                    <span>₹{quotation.orderAmount?.toLocaleString()}</span>
                                </div>

                                {isEditingItems && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        <LoaderButton
                                            loading={updateQuotation.isPending}
                                            onClick={handleSaveCharges}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                                        >
                                            Save Pricing & Charges
                                        </LoaderButton>
                                        <Button onClick={() => setIsEditingItems(false)} variant="ghost" className="w-full hover:bg-slate-100 text-slate-400">
                                            Done Editing
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Dialog to reject quotation */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-1.5 text-rose-700">
                            <AlertTriangle className="w-5 h-5" />
                            Reject Order Request
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3 py-3">
                        <span className="text-sm text-slate-500">Provide a clear rejection explanation. This will be shared with the customer dashboard updates.</span>
                        <Textarea
                            placeholder="Reason for rejecting..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="border-slate-200 focus-visible:ring-rose-500"
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setRejectDialogOpen(false)} className="text-slate-400 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <LoaderButton
                            variant="destructive"
                            loading={updateQuotationStatus.isPending}
                            onClick={handleRejectSubmit}
                            className="font-semibold"
                        >
                            Confirm Reject
                        </LoaderButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog to Book Order */}
            <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-indigo-900 flex items-center gap-2">
                            <Check className="w-6 h-6 p-1 bg-indigo-50 rounded-full text-indigo-600 border border-indigo-100" />
                            Book Order Requests
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4 text-sm text-slate-700">
                        <div className="flex justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <span className="font-semibold text-slate-500">Total Order Amount:</span>
                            <span className="font-bold text-slate-900 text-lg">₹{quotation.orderAmount?.toLocaleString()}</span>
                        </div>

                        {/* B2B Order Options */}
                        <div className="grid grid-cols-2 gap-3 bg-indigo-50/55 p-3 rounded-lg border border-indigo-100/50 mb-1">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-indigo-900 font-bold">PAYMENT MODE</span>
                                <Select onValueChange={(val) => setBookingPaymentMode(val)} defaultValue={bookingPaymentMode}>
                                    <SelectTrigger className="border-slate-200 h-9 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="complete">Complete</SelectItem>
                                        <SelectItem value="parcel">Parcel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-indigo-900 font-bold">PAYMENT METHOD</span>
                                <Select onValueChange={(val) => setBookingPaymentMethod(val)} defaultValue={bookingPaymentMethod}>
                                    <SelectTrigger className="border-slate-200 h-9 bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COD">COD</SelectItem>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dimensions Fields */}
                        <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2">
                            <span className="text-xs text-slate-400 font-bold">ORDER PACKAGING DIMENSIONS</span>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-semibold">Length (cm)</span>
                                    <Input
                                        type="number"
                                        value={bookingLength}
                                        onChange={(e) => setBookingLength(e.target.value)}
                                        className="h-8 border-slate-200 text-xs bg-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-semibold">Breadth (cm)</span>
                                    <Input
                                        type="number"
                                        value={bookingBreadth}
                                        onChange={(e) => setBookingBreadth(e.target.value)}
                                        className="h-8 border-slate-200 text-xs bg-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-semibold">Height (cm)</span>
                                    <Input
                                        type="number"
                                        value={bookingHeight}
                                        onChange={(e) => setBookingHeight(e.target.value)}
                                        className="h-8 border-slate-200 text-xs bg-white"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-slate-400 font-semibold">Weight (kg)</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={bookingWeight}
                                        onChange={(e) => setBookingWeight(e.target.value)}
                                        className="h-8 border-slate-200 text-xs bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => setBookingDialogOpen(false)} className="text-slate-400 hover:bg-slate-100">
                            Cancel
                        </Button>
                        <LoaderButton
                            loading={bookQuotation.isPending}
                            onClick={handleBookingSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                        >
                            Book Order
                        </LoaderButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </InnerDashboardLayout>
    )
}
