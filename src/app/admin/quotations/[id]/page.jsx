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
import CallAttemptDialog from '@/components/CallAttemptDialog'
import BookOrderDialog from '@/components/BookOrderDialog'
import ActivityLogDrawer from '@/components/ActivityLogDrawer'
import { PhoneCall, Clock } from 'lucide-react'

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
        updateQuotationItems,
        addItemQuantity,
        removeItemQuantity,
        permissions
    } = useQuotations()

    const { data: quotation, isLoading, refetch } = getSingleQuotation(quotationId)

    // Edit toggles
    const [isEditingCustomer, setIsEditingCustomer] = useState(false)
    const [isEditingItems, setIsEditingItems] = useState(false)
    const [isActivityOpen, setIsActivityOpen] = useState(false)

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
    const [editDiscountPercent, setEditDiscountPercent] = useState(0)
    const [discountMode, setDiscountMode] = useState('flat')
    const [editItemDiscounts, setEditItemDiscounts] = useState({}) // maps variantName -> discount
    const [editItemDiscountPercents, setEditItemDiscountPercents] = useState({}) // maps variantName -> discountPercent
    const [itemDiscountModes, setItemDiscountModes] = useState({}) // maps variantName -> 'flat' | 'percent'

    // Inline Qty edit state
    const [editingQtyIndex, setEditingQtyIndex] = useState(null)
    const [tempQty, setTempQty] = useState("")

    // Inline Global Discount edit state
    const [editingDiscount, setEditingDiscount] = useState(false)
    const [tempDiscount, setTempDiscount] = useState(0)
    const [tempDiscountPercent, setTempDiscountPercent] = useState(0)
    const [tempDiscountMode, setTempDiscountMode] = useState('flat')

    // Inline Delivery Charge edit state
    const [editingDelCharge, setEditingDelCharge] = useState(false)
    const [tempDelCharge, setTempDelCharge] = useState(0)

    // Per-item pricing edit state
    const [editItemPrices, setEditItemPrices] = useState({})

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
            setEditDiscountPercent(quotation.discountPercent || 0)
            setDiscountMode(quotation.discountPercent > 0 ? 'percent' : 'flat')



            const discounts = {}
            const discountPercents = {}
            const modes = {}
            const prices = {}
                ; (quotation.items || []).forEach(it => {
                    const itemKey = String(it.variantId?._id || it.variantId || `${it.productId?._id || it.productId}_${it.variantName}`)
                    discounts[itemKey] = it.discount || 0
                    discountPercents[itemKey] = it.discountPercent || 0
                    modes[itemKey] = it.discountPercent > 0 ? 'percent' : 'flat'
                    prices[itemKey] = it.price || 0
                })
            setEditItemDiscounts(discounts)
            setEditItemDiscountPercents(discountPercents)
            setItemDiscountModes(modes)
            setEditItemPrices(prices)
        }
    }, [quotation])

    const getRecalculatedTotals = () => {
        if (!quotation) return { subtotal: 0, discount: 0, discountPercent: 0, deliveryCharge: 0, orderAmount: 0 };
        let subtotal = 0;
        (quotation.items || []).forEach((it, idx) => {
            const itemKey = String(it.variantId?._id || it.variantId || `${it.productId?._id || it.productId}_${it.variantName}`);
            const qty = editingQtyIndex === idx ? (parseFloat(tempQty) || 0) : (it.quantity || 0);
            const price = editItemPrices[itemKey] !== undefined ? Number(editItemPrices[itemKey] || 0) : (it.price || 0);
            const discount = editItemDiscounts[itemKey] !== undefined ? Number(editItemDiscounts[itemKey] || 0) : (it.discount || 0);
            subtotal += qty * (price - discount);
        });

        const subtotalFixed = parseFloat(subtotal.toFixed(2));

        let flatDiscount = 0;
        let percentDiscount = 0;

        if (editingDiscount) {
            // User is actively editing discount — use temp values, live-derive companion
            flatDiscount = parseFloat(tempDiscount) || 0;
            percentDiscount = parseFloat(tempDiscountPercent) || 0;
            if (tempDiscountMode === 'percent') {
                flatDiscount = parseFloat(((subtotalFixed * percentDiscount) / 100).toFixed(2));
            } else {
                percentDiscount = subtotalFixed > 0 ? parseFloat(((flatDiscount / subtotalFixed) * 100).toFixed(2)) : 0;
            }
        } else {
            // Not editing discount — use saved values, anchor by discountType
            flatDiscount = parseFloat(editDiscount) || 0;
            percentDiscount = parseFloat(editDiscountPercent) || 0;

            // Resolve saved discount type: flat holds flat amount constant, percentage holds % constant
            const savedDiscountType = quotation?.discountType
                || (quotation?.discountPercent > 0 && quotation?.discount === 0 ? 'percentage' : 'flat');

            if (savedDiscountType === 'percentage') {
                // % is the anchor — flat follows new subtotal
                flatDiscount = parseFloat(((subtotalFixed * percentDiscount) / 100).toFixed(2));
            } else {
                // Flat is the anchor — keep flat constant, only recalculate % for display
                percentDiscount = subtotalFixed > 0 ? parseFloat(((flatDiscount / subtotalFixed) * 100).toFixed(2)) : 0;
            }
        }

        const delCharge = editingDelCharge
            ? (parseFloat(tempDelCharge) || 0)
            : (parseFloat(editDeliveryCharge) || 0);

        const orderAmount = parseFloat((Math.max(0, subtotalFixed - flatDiscount) + delCharge).toFixed(2));

        return {
            subtotal: subtotalFixed,
            discount: flatDiscount,
            discountPercent: percentDiscount,
            deliveryCharge: delCharge,
            orderAmount
        };
    };

    const totals = (isEditingItems || editingDiscount || editingDelCharge || editingQtyIndex !== null) ? getRecalculatedTotals() : {
        subtotal: quotation?.subtotal || 0,
        discount: quotation?.discount || 0,
        discountPercent: quotation?.discountPercent || 0,
        deliveryCharge: quotation?.deliveryCharge || 0,
        orderAmount: quotation?.orderAmount || 0
    };



    const handleProductSearch = async (val) => {
        setSearchQuery(val)
        if (!val.trim()) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const res = await api.get(`/products/all/search?q=${val}`)
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
            const res = await api.get(`/products/${prod._id}`)
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
    const handleSaveInlineQty = async (idx) => {
        const parsed = parseInt(tempQty);
        if (isNaN(parsed) || parsed < 0) {
            toast.error("Please enter a valid quantity (0 to delete).");
            return;
        }
        const originalItem = quotation.items[idx];
        if (originalItem.quantity === parsed) {
            setEditingQtyIndex(null);
            return;
        }

        const updatedItemsList = (quotation.items || []).map((it, i) => {
            const isTarget = i === idx;
            return {
                productId: it.productId?._id || it.productId,
                variantId: it.variantId?._id || it.variantId,
                variantName: it.variantName,
                quantity: isTarget ? parsed : it.quantity,
                price: it.price || 0,
                discount: it.discount || 0,
                discountPercent: it.discountPercent || 0,
                discountType: it.discountType || (it.discountPercent > 0 && it.discount === 0 ? "percentage" : "flat")
            };
        });

        try {
            await updateQuotationItems.mutateAsync({
                id: quotation._id,
                data: { items: updatedItemsList, discountType: quotation?.discountType || 'flat' }
            });
            toast.success(parsed === 0 ? "Item removed successfully." : "Quantity updated successfully.");
            setEditingQtyIndex(null);
            refetch();
        } catch (err) {
            console.error(err);
        }
    }

    const handleSaveCharges = async () => {
        try {
            // Re-submit the existing items with updated discounts and prices
            const itemsData = (quotation.items || []).map((it) => {
                const itemKey = String(it.variantId?._id || it.variantId || `${it.productId?._id || it.productId}_${it.variantName}`);
                return {
                    productId: it.productId?._id || it.productId,
                    variantId: it.variantId?._id || it.variantId,
                    variantName: it.variantName,
                    quantity: it.quantity,
                    price: Number(editItemPrices[itemKey] ?? it.price),
                    discount: Number(editItemDiscounts[itemKey] || 0),
                    discountPercent: Number(editItemDiscountPercents[itemKey] || 0),
                    discountType: itemDiscountModes[itemKey] === 'percent' ? 'percentage' : 'flat'
                };
            })

            await updateQuotationItems.mutateAsync({
                id: quotation._id,
                data: { items: itemsData, discountType: quotation?.discountType || 'flat' }
            })
            toast.success("Items pricing and discounts updated successfully.")
            setIsEditingItems(false)
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

    const handleBookingSubmit = async (payload) => {
        try {
            await bookQuotation.mutateAsync(payload)
            setBookingDialogOpen(false)
            toast.success("Order booked successfully!")
            router.push("/admin/orders")
        } catch (err) {
            console.error(err)
        }
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
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Items List Card */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800">Items List</CardTitle>
                                {isActionable && (
                                    <div className="flex items-center gap-2">
                                        {isEditingItems ? (
                                            <>
                                                <LoaderButton
                                                    loading={updateQuotationItems.isPending}
                                                    onClick={handleSaveCharges}
                                                    size="sm"
                                                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Save
                                                </LoaderButton>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsEditingItems(false)}
                                                    className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 gap-1.5"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditingItems(true)}
                                                className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 gap-1.5"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Items
                                            </Button>
                                        )}
                                    </div>
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
                                            {(quotation.items || []).map((it, idx) => {
                                                const itemKey = String(it.variantId?._id || it.variantId || `${it.productId?._id || it.productId}_${it.variantName}`);
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50/20">
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800">{it.productId?.fullName || it.productId?.name}</span>
                                                                <span className="text-xs text-slate-400">Variant: {it.variantName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {editingQtyIndex === idx ? (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Input
                                                                        type="number"
                                                                        min={0}
                                                                        value={tempQty}
                                                                        onChange={(e) => setTempQty(e.target.value)}
                                                                        className="w-16 h-8 text-center text-xs font-bold border-slate-200"
                                                                    />
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => handleSaveInlineQty(idx)}
                                                                        className="w-8 h-8 text-emerald-600 hover:bg-emerald-50"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        onClick={() => setEditingQtyIndex(null)}
                                                                        className="w-8 h-8 text-slate-400 hover:bg-slate-100"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <span className="font-bold">{it.quantity}</span>
                                                                    {!isEditingItems && isActionable && (
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            onClick={() => {
                                                                                setEditingQtyIndex(idx);
                                                                                setTempQty(it.quantity);
                                                                            }}
                                                                            className="w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                                                        >
                                                                            <Edit className="w-3 h-3" />
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-mono">
                                                            {isEditingItems ? (
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={editItemPrices[itemKey] ?? ""}
                                                                    onChange={(e) => {
                                                                        setEditItemPrices({
                                                                            ...editItemPrices,
                                                                            [itemKey]: e.target.value === "" ? "" : parseFloat(e.target.value) || 0
                                                                        });
                                                                    }}
                                                                    className="w-24 h-8 text-right text-xs font-bold border-slate-200 ml-auto"
                                                                />
                                                            ) : (
                                                                <span>₹{(it.price || 0).toLocaleString()}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            {isEditingItems ? (
                                                                <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-7 w-28 ml-auto">
                                                                    {itemDiscountModes[itemKey] === 'percent' ? (
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            max={100}
                                                                            value={editItemDiscountPercents[itemKey] ?? ""}
                                                                            onChange={(e) => {
                                                                                const valStr = e.target.value;
                                                                                if (valStr === "") {
                                                                                    setEditItemDiscountPercents({
                                                                                        ...editItemDiscountPercents,
                                                                                        [itemKey]: ""
                                                                                    });
                                                                                    setEditItemDiscounts({
                                                                                        ...editItemDiscounts,
                                                                                        [itemKey]: 0
                                                                                    });
                                                                                } else {
                                                                                    const valPercent = parseFloat(valStr) || 0;
                                                                                    const basePrice = it.appliedSlab?.price || it.price;
                                                                                    const flatDiscount = parseFloat((basePrice * (valPercent / 100)).toFixed(2));
                                                                                    setEditItemDiscountPercents({
                                                                                        ...editItemDiscountPercents,
                                                                                        [itemKey]: valPercent
                                                                                    });
                                                                                    setEditItemDiscounts({
                                                                                        ...editItemDiscounts,
                                                                                        [itemKey]: flatDiscount
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="text-center font-bold h-full w-16 border-0 focus:ring-0 rounded-none text-xs p-0 bg-white"
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            type="number"
                                                                            min={0}
                                                                            value={editItemDiscounts[itemKey] ?? ""}
                                                                            onChange={(e) => {
                                                                                const valStr = e.target.value;
                                                                                if (valStr === "") {
                                                                                    setEditItemDiscounts({
                                                                                        ...editItemDiscounts,
                                                                                        [itemKey]: ""
                                                                                    });
                                                                                    setEditItemDiscountPercents({
                                                                                        ...editItemDiscountPercents,
                                                                                        [itemKey]: 0
                                                                                    });
                                                                                } else {
                                                                                    const valFlat = parseFloat(valStr) || 0;
                                                                                    const basePrice = it.appliedSlab?.price || it.price;
                                                                                    const percentDiscount = basePrice > 0 ? parseFloat(((valFlat / basePrice) * 100).toFixed(2)) : 0;
                                                                                    setEditItemDiscounts({
                                                                                        ...editItemDiscounts,
                                                                                        [itemKey]: valFlat
                                                                                    });
                                                                                    setEditItemDiscountPercents({
                                                                                        ...editItemDiscountPercents,
                                                                                        [itemKey]: percentDiscount
                                                                                    });
                                                                                }
                                                                            }}
                                                                            className="text-right font-bold h-full w-16 border-0 focus:ring-0 rounded-none text-xs p-1 bg-white"
                                                                        />
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setItemDiscountModes({
                                                                                ...itemDiscountModes,
                                                                                [itemKey]: itemDiscountModes[itemKey] === 'percent' ? 'flat' : 'percent'
                                                                            });
                                                                        }}
                                                                        className="bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-[10px] font-black h-full w-10 flex items-center justify-center text-slate-600 transition-colors"
                                                                    >
                                                                        {itemDiscountModes[itemKey] === 'percent' ? '%' : '₹'}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-end text-emerald-600 font-semibold">
                                                                    {it.discount > 0 ? (
                                                                        <>
                                                                            <span>-₹{it.discount.toLocaleString()}</span>
                                                                            {it.discountPercent > 0 && (
                                                                                <span className="text-[10px] text-slate-400 font-medium mt-0.5">({it.discountPercent}%)</span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-slate-400">-</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                            ₹{(
                                                                (editingQtyIndex === idx ? (parseFloat(tempQty) || 0) : it.quantity) * (
                                                                    (editItemPrices[itemKey] !== undefined ? Number(editItemPrices[itemKey] || 0) : (it.price || 0)) -
                                                                    (editItemDiscounts[itemKey] !== undefined ? Number(editItemDiscounts[itemKey] || 0) : (it.discount || 0))
                                                                )
                                                            ).toLocaleString()}
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
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Pane (White Financial Summary card) */}
                    <div className="flex flex-col gap-6">

                        {/* Call Attempts Card */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
                                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <PhoneCall className="h-4 w-4 text-emerald-600" />
                                    Call Attempts ({quotation.callAttempts?.noOfAttempts || 0}/3)
                                </CardTitle>
                                <CallAttemptDialog quotation={quotation} type="quotation" />
                            </CardHeader>
                            <CardContent className="pt-4 text-xs space-y-3">
                                {(!quotation.callAttempts?.history || quotation.callAttempts.history.length === 0) ? (
                                    <p className="text-slate-400 italic">No call attempts recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {[...quotation.callAttempts.history].sort((a, b) => a.attemptNo - b.attemptNo).map((item, idx) => {
                                            const empName = item.employeeId?.name || 'User'
                                            const empRole = item.employeeId?.role ? ` (${item.employeeId.role})` : ''
                                            return (
                                                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-3xs space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-emerald-700">Attempt #{item.attemptNo}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {item.date ? format(new Date(item.date), 'dd MMM, hh:mm a') : '—'}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 italic">"{item.remarks}"</p>
                                                    <div className="text-[10px] text-slate-400 font-semibold">By: {empName}{empRole}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* White Background Box for Financial Summary */}
                        <Card className="border-slate-100 shadow-sm bg-white">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-bold text-slate-800">Financial Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-slate-700">₹{totals.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Global Discount:</span>
                                    {isEditingItems ? (
                                        <span className="font-bold text-slate-700">
                                            {totals.discountPercent > 0 ? `(${totals.discountPercent}%) ` : ''}
                                            ₹{totals.discount?.toLocaleString() || '0'}
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            {editingDiscount ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-8 w-28">
                                                        {tempDiscountMode === 'percent' ? (
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={tempDiscountPercent}
                                                                onChange={(e) => {
                                                                    const valStr = e.target.value;
                                                                    if (valStr === "") {
                                                                        setTempDiscountPercent("");
                                                                        setTempDiscount(0);
                                                                    } else {
                                                                        const valPercent = parseFloat(valStr) || 0;
                                                                        setTempDiscountPercent(valPercent);
                                                                        setTempDiscount(parseFloat(((totals.subtotal || 0) * (valPercent / 100)).toFixed(2)));
                                                                    }
                                                                }}
                                                                className="text-center font-bold h-full w-16 border-0 focus:ring-0 rounded-none text-xs p-0 bg-white"
                                                            />
                                                        ) : (
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={tempDiscount}
                                                                onChange={(e) => {
                                                                    const valStr = e.target.value;
                                                                    if (valStr === "") {
                                                                        setTempDiscount("");
                                                                        setTempDiscountPercent(0);
                                                                    } else {
                                                                        const valFlat = parseFloat(valStr) || 0;
                                                                        setTempDiscount(valFlat);
                                                                        setTempDiscountPercent((totals.subtotal || 0) > 0 ? parseFloat(((valFlat / (totals.subtotal || 0)) * 100).toFixed(2)) : 0);
                                                                    }
                                                                }}
                                                                className="text-right font-bold h-full w-16 border-0 focus:ring-0 rounded-none text-xs p-1 bg-white"
                                                            />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setTempDiscountMode(prev => prev === 'percent' ? 'flat' : 'percent')}
                                                            className="bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-[10px] font-black h-full w-8 flex items-center justify-center text-slate-600 transition-colors"
                                                        >
                                                            {tempDiscountMode === 'percent' ? '%' : '₹'}
                                                        </button>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            try {
                                                                const finalOrderAmount = parseFloat((Math.max(0, (totals.subtotal || 0) - Number(tempDiscount || 0)) + (totals.deliveryCharge || 0)).toFixed(2));
                                                                await updateQuotation.mutateAsync({
                                                                    quotationId: quotation._id,
                                                                    discount: Number(tempDiscount || 0),
                                                                    discountPercent: Number(tempDiscountPercent || 0),
                                                                    discountType: tempDiscountMode === 'percent' ? 'percentage' : 'flat',
                                                                    orderAmount: finalOrderAmount
                                                                });
                                                                setEditingDiscount(false);
                                                                refetch();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="w-8 h-8 text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingDiscount(false)}
                                                        className="w-8 h-8 text-slate-400 hover:bg-slate-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-700">
                                                        {totals.discountPercent > 0 ? `(${totals.discountPercent}%) ` : ''}
                                                        ₹{totals.discount?.toLocaleString() || '0'}
                                                    </span>
                                                    {isActionable && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingDiscount(true);
                                                                setTempDiscount(totals.discount || 0);
                                                                setTempDiscountPercent(totals.discountPercent || 0);
                                                                setTempDiscountMode(quotation.discountType === 'percentage' ? 'percent' : 'flat');
                                                            }}
                                                            className="w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-slate-500">
                                    <span>Delivery Charge:</span>
                                    {isEditingItems ? (
                                        <span className="font-bold text-slate-700">₹{totals.deliveryCharge?.toLocaleString() || '0'}</span>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            {editingDelCharge ? (
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        value={tempDelCharge}
                                                        onChange={(e) => {
                                                            const valStr = e.target.value;
                                                            setTempDelCharge(valStr === "" ? "" : parseFloat(valStr) || 0);
                                                        }}
                                                        className="w-24 h-8 text-right border-slate-200 text-xs font-bold bg-white p-1"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={async () => {
                                                            try {
                                                                const finalOrderAmount = parseFloat((Math.max(0, (totals.subtotal || 0) - (totals.discount || 0)) + Number(tempDelCharge || 0)).toFixed(2));
                                                                await updateQuotation.mutateAsync({
                                                                    quotationId: quotation._id,
                                                                    deliveryCharge: Number(tempDelCharge || 0),
                                                                    orderAmount: finalOrderAmount
                                                                });
                                                                setEditingDelCharge(false);
                                                                refetch();
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }}
                                                        className="w-8 h-8 text-emerald-600 hover:bg-emerald-50"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setEditingDelCharge(false)}
                                                        className="w-8 h-8 text-slate-400 hover:bg-slate-100"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-700">₹{totals.deliveryCharge?.toLocaleString() || '0'}</span>
                                                    {isActionable && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingDelCharge(true);
                                                                setTempDelCharge(totals.deliveryCharge || 0);
                                                            }}
                                                            className="w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Separator className="my-2 bg-slate-100" />
                                <div className="flex justify-between text-base font-extrabold text-slate-900">
                                    <span>Order Total:</span>
                                    <span>₹{totals.orderAmount?.toLocaleString()}</span>
                                </div>


                            </CardContent>
                        </Card>

                        {/* Notes / Warehouse Instructions */}
                        <Card className="border-slate-100 shadow-sm bg-white mt-4">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="text-sm font-bold text-slate-805 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    Notes / Warehouse Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-slate-650 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                                    {quotation.comments || 'No specific warehouse instructions.'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Activity Timeline Audit Trail Drawer */}
                        {isActivityOpen && (
                            <ActivityLogDrawer
                                open={isActivityOpen}
                                onOpenChange={setIsActivityOpen}
                                id={quotationId}
                                type="quotation"
                            />
                        )}
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

            {/* Book Order Dialog Component */}
            <BookOrderDialog
                isOpen={bookingDialogOpen}
                onOpenChange={setBookingDialogOpen}
                quotation={quotation}
                onBook={handleBookingSubmit}
                isPending={bookQuotation.isPending}
            />
        </InnerDashboardLayout>
    )
}
