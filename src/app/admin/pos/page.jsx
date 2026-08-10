"use client"
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUsers } from '@/hooks/useUsers'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { Separator } from '@/components/ui/separator'
import LoaderButton from '@/components/custom/LoaderButton'
import { BsCashCoin } from "react-icons/bs"
import { FaGoogle, FaRegAddressCard } from "react-icons/fa"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { useSubCategories } from '@/hooks/useSubCategories'
import api from '@/lib/api'
import ProductGrid from './components/ProductGrid'
import { posSchema } from '@/lib/validations/posSchema'
import SuccessMessage from './components/SuccessMessage'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import NotAuthorizedPage from '@/components/notAuthorized'
import { IoQrCode } from "react-icons/io5"
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { getSlabPrice } from './components/ProductCard'

const FILTERS = [
    { key: 'InStock', label: 'In stock' },
    { key: 'OutOfStock', label: 'Out of stock' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Not Active' },
]

function Page() {
    const { createCustomer } = useUsers()
    const [createdOrder, setCreatedOrder] = useState(null)
    const [categoryFilter, setCategoryFilter] = useState()
    const [typeFilter, setTypeFilter] = useState('InStock')

    // Debounce state
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

    // Products search query
    const { productsPaginationQuery } = useProducts()
    const products = productsPaginationQuery({
        page: page,
        limit: limit,
        searchQuery: debouncedSearch,
        category: categoryFilter,
        filterBy: typeFilter,
    })

    const { subCategoriesQuery } = useSubCategories()
    const activeSubCategoriesQuery = subCategoriesQuery()
    const subCategories = activeSubCategoriesQuery.data?.data || []

    const allProducts = products.data?.products || []
    const totalPages = products.data?.pagination?.totalPages || 1
    const paginationRange = getPaginationRange(page, totalPages)

    const { createPosOrder, permissionsPos: { canAddPos, canViewPos } } = useOrders()
    const [addedProducts, setAddedProducts] = useState([])
    const [linkSent, setLinkSent] = useState(false)
    const [loading, setLoading] = useState(false)

    // GST validation & fetching flags
    const [gstVerifying, setGstVerifying] = useState(false)
    const [isGstVerified, setIsGstVerified] = useState(false)
    const [customerLoading, setCustomerLoading] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState("")
    const [billingSameAsRegistered, setBillingSameAsRegistered] = useState(true)

    // Cache products from paginated search queries to prevent items in cart from disappearing
    useEffect(() => {
        if (allProducts && allProducts.length > 0) {
            setAddedProducts(prev => {
                const existingIds = new Set(prev.map(p => p._id));
                const newProducts = allProducts.filter(p => !existingIds.has(p._id));
                if (newProducts.length > 0) {
                    return [...prev, ...newProducts];
                }
                return prev;
            });
        }
    }, [allProducts]);

    // Form setup
    const form = useForm({
        resolver: zodResolver(posSchema),
        mode: "onSubmit",
        defaultValues: {
            userId: "",
            name: "",
            phoneNo: "",
            email: "",
            gst: "",
            method: "Cash",
            paymentMode: "complete",
            address: "",
            address2: "",
            city: "",
            state: "",
            pincode: "",
            country: "India",
            subtotal: 0,
            discount: 0,
            deliveryCharge: 0,
            orderAmount: 0,
            comments: '',
            items: []
        }
    })

    const { watch, setValue, reset, control } = form
    const { fields, append, remove } = useFieldArray({ control, name: "items" })
    const items = useWatch({ control, name: "items" })
    const discount = watch('discount')
    const deliveryCharge = watch('deliveryCharge')
    const phoneNo = watch('phoneNo')
    const gst = watch('gst')

    // Billing details states
    const [billAddress, setBillAddress] = useState("")
    const [billAddress2, setBillAddress2] = useState("")
    const [billCity, setBillCity] = useState("")
    const [billState, setBillState] = useState("")
    const [billPincode, setBillPincode] = useState("")
    const [billCountry, setBillCountry] = useState("India")

    // Automatic combined slab price mapping logic from the website
    useEffect(() => {
        // Group items by productId to find total product quantity in cart
        const productQuantities = {}
        items.forEach((item) => {
            if (!item.productId) return
            productQuantities[item.productId] = (productQuantities[item.productId] || 0) + (item.quantity || 0)
        })

        // Fetch product slab details and update unit price
        items.forEach((item, idx) => {
            if (!item.productId) return
            const selectedProduct = addedProducts.find(p => p._id === item.productId)
            if (selectedProduct) {
                const totalQty = productQuantities[item.productId]
                const resolvedSlabPrice = getSlabPrice(selectedProduct, totalQty)

                // If the resolved slab price for this combined quantity changes, update the price on this row
                const lastSlabPrice = form.getValues(`items.${idx}._lastSlabPrice`)
                if (lastSlabPrice !== resolvedSlabPrice) {
                    setValue(`items.${idx}.price`, resolvedSlabPrice)
                    setValue(`items.${idx}._lastSlabPrice`, resolvedSlabPrice)
                }
            }
        })
    }, [items, addedProducts, setValue])

    // Recalculate subtotal/total updates
    useEffect(() => {
        const subtotal = items.reduce((a, item) => {
            const unitPrice = Number(item.price || 0)
            const qty = Number(item.quantity || 0)
            const itemDiscount = Number(item.discountPercent || 0)
            const rowTotal = (unitPrice * qty) * (1 - itemDiscount / 100)
            return a + rowTotal
        }, 0)

        const total = subtotal + Number(deliveryCharge || 0) - Number(discount || 0)

        if (form.getValues("subtotal") !== subtotal) setValue("subtotal", subtotal)
        if (form.getValues("orderAmount") !== total) setValue("orderAmount", total)
    }, [items, discount, deliveryCharge, setValue])

    // Auto-fetch Customer on 10 digit phone number
    useEffect(() => {
        const fetchCustomer = async () => {
            if (phoneNo?.length === 10) {
                setCustomerLoading(true)
                try {
                    const res = await api.get(`/users/customer/${phoneNo}`)
                    if (res?.data?.statusCode === 201 && res?.data?.data) {
                        const userId = res.data.data
                        const userRes = await api.get(`/users/customer/id/${userId}`)
                        const user = userRes?.data?.data

                        if (user) {
                            setValue('userId', user._id)
                            setValue('name', user.name || "")
                            setValue('email', user.email || "")
                            setValue('gst', user.business?.gstNumber || "")

                            const bName = user.business?.businessName ? ` (${user.business.businessName})` : ""
                            setVerificationStatus(
                                user.business?.isApproved
                                    ? `Verified Customer${bName}`
                                    : `Pending Verification${bName}`
                            )

                            // Load registered address
                            const addr = user.business?.regsiteredAddress || {}
                            setValue('address', addr.street || "")
                            setValue('address2', addr.street2 || "")
                            setValue('city', addr.city || "")
                            setValue('state', addr.state || "")
                            setValue('pincode', addr.pinCode || "")
                            setValue('country', addr.country || "India")
                        }
                    } else {
                        setValue('userId', '')
                        setVerificationStatus("New Customer (Unregistered)")
                    }
                } catch (e) {
                    console.error("Error fetching customer details", e)
                } finally {
                    setCustomerLoading(false)
                }
            } else {
                setVerificationStatus("")
            }
        }
        fetchCustomer()
    }, [phoneNo, setValue])

    // Auto-verify GST on 15 digit entry
    useEffect(() => {
        const verifyGstInput = async () => {
            if (gst?.length === 15 && !isGstVerified) {
                setGstVerifying(true)
                try {
                    const res = await api.post("/onboarding/gst/verify", { gstin: gst })
                    const data = res?.data?.data
                    if (data) {
                        setValue('name', data.tradeName || data.legalName || "")
                        setIsGstVerified(true)
                        toast.success("GSTIN verified successfully!")

                        // Load address
                        const addr = data.principalAddress || {}
                        setValue('address', addr.street || "")
                        setValue('address2', addr.street2 || "")
                        setValue('city', addr.city || "")
                        setValue('state', addr.state || "")
                        setValue('pincode', addr.pinCode || "")
                        setValue('country', addr.country || "India")
                    }
                } catch (err) {
                    toast.error(err?.response?.data?.message || "GSTIN verification failed. Please check government records.")
                } finally {
                    setGstVerifying(false)
                }
            } else if (gst?.length !== 15) {
                setIsGstVerified(false)
            }
        }
        verifyGstInput()
    }, [gst, setValue, isGstVerified])

    async function onSubmit(values) {
        setLoading(true)
        try {
            setLinkSent(false)
            setCreatedOrder(null)
            let finalUserId = values.userId

            if (!finalUserId) {
                const res = await createCustomer.mutateAsync({
                    name: values.name,
                    phoneNo: values.phoneNo,
                    role: 'user',
                })
                finalUserId = res?.data?.data?._id
            }

            const payload = {
                ...values,
                userId: finalUserId,
                address: billingSameAsRegistered ? values.address : billAddress,
                address2: billingSameAsRegistered ? values.address2 : billAddress2,
                city: billingSameAsRegistered ? values.city : billCity,
                state: billingSameAsRegistered ? values.state : billState,
                pincode: billingSameAsRegistered ? values.pincode : billPincode,
                country: billingSameAsRegistered ? values.country : billCountry
            }

            const res2 = await createPosOrder.mutateAsync(payload)
            const created = res2?.data?.data?.quotation
            reset()
            setCreatedOrder(created)
            setBillAddress("")
            setBillAddress2("")
            setBillCity("")
            setBillState("")
            setBillPincode("")
        } catch (err) {
            console.error('Error in creating POS quotation:', err)
        } finally {
            setLoading(false)
        }
    }

    function onError(errors) {
        console.log("Validation errors:", errors)
    }

    if (!canViewPos) return <NotAuthorizedPage />

    // Group/Club fields of the same product next to each other inside the checkout cart
    const sortedFieldsWithIndex = fields
        .map((field, originalIndex) => ({ field, originalIndex }))
        .sort((a, b) => String(a.field.productId).localeCompare(String(b.field.productId)))

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3 border-b border-slate-100 pb-3'>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        Create POS Quotation
                    </h1>
                    <p className="text-slate-500 text-xs mt-0.5">Generate a wholesale POS invoice or quotation dynamically</p>
                </div>
                <div>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs">
                        <Link href={'/admin/posOrders'}>View History</Link>
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
                    {/* Top Row: Products List (Left, 8/12 width) and POS Checkout Cart (Right, 4/12 width) */}
                    <div className='flex flex-col lg:flex-row gap-4 w-full items-stretch'>
                        {/* Products List (Left, 8/12) */}
                        <div className="w-full lg:w-8/12">
                            <div className="h-full bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <h2 className="font-bold text-base text-slate-800 uppercase tracking-wide">Products List</h2>

                                    {/* Toolbar */}
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="flex-1 bg-white border-slate-200 h-8 rounded-lg text-xs"
                                        />

                                        <div className="flex gap-2">
                                            <Select value={categoryFilter} onValueChange={(val) => {
                                                setCategoryFilter(val === '__all__' ? undefined : val)
                                                setPage(1)
                                            }}>
                                                <SelectTrigger className="w-[120px] border-slate-200 h-8 rounded-lg text-xs">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent className="text-xs">
                                                    <SelectItem value="__all__" className="text-xs">All Categories</SelectItem>
                                                    {subCategories?.map((n) => (
                                                        <SelectItem key={n._id} value={String(n._id)} className="text-xs">
                                                            {n.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={typeFilter} onValueChange={(val) => {
                                                setTypeFilter(val === '_aa_' ? undefined : val)
                                                setPage(1)
                                            }}>
                                                <SelectTrigger className="w-[110px] border-slate-200 h-8 rounded-lg text-xs">
                                                    <SelectValue placeholder="Filter By" />
                                                </SelectTrigger>
                                                <SelectContent className="text-xs">
                                                    <SelectItem value="_aa_" className="text-xs">All</SelectItem>
                                                    {FILTERS?.map((n, idx) => (
                                                        <SelectItem key={idx} value={n.key} className="text-xs">
                                                            {n.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Scrollable Fixed Sized Grid Container to contain products inside card bounds */}
                                    <div className="max-h-[500px] overflow-y-auto pr-1">
                                        <ProductGrid
                                            loading={products.isFetching}
                                            allProducts={allProducts}
                                            setAddedProducts={setAddedProducts}
                                            onAddItem={(item) => append(item)}
                                            cartItems={items}
                                        />
                                    </div>
                                </div>

                                <div className="flex w-full justify-between items-center pt-3 border-t border-slate-50 mt-3 flex-shrink-0">
                                    <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                                        <SelectTrigger className="w-[95px] border-slate-200 h-8 rounded-lg text-[10px] font-semibold">
                                            <SelectValue placeholder="Items per page" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 5, 10, 20, 50].map((n) => (
                                                <SelectItem key={n} value={String(n)} className="text-xs">
                                                    {n} / page
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Pagination className={'inline justify-end mx-1 w-fit'}>
                                        <PaginationContent>
                                            {page > 1 && (
                                                <PaginationItem>
                                                    <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} className="h-8 text-xs" />
                                                </PaginationItem>
                                            )}

                                            {paginationRange.map((p, i) => (
                                                <PaginationItem key={i}>
                                                    {p === 'ellipsis-left' || p === 'ellipsis-right' ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={p === page}
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                setPage(p)
                                                            }}
                                                            className="h-8 w-8 text-xs"
                                                        >
                                                            {p}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ))}

                                            {page < totalPages && (
                                                <PaginationItem>
                                                    <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} className="h-8 text-xs" />
                                                </PaginationItem>
                                            )}
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        </div>

                        {/* POS Checkout Cart (Right, 4/12) */}
                        <div className="w-full lg:w-4/12">
                            <div className="h-full bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col justify-start">
                                <div className="flex justify-between items-center pb-1">
                                    <h2 className='font-bold text-base text-slate-800 uppercase tracking-wide'>POS Checkout Cart</h2>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {items.length} product{items.length !== 1 ? 's' : ''} added
                                    </span>
                                </div>
                                <Separator className="bg-slate-50" />

                                {/* Scrollable Fixed Sized Cart Container rendering clubbed items */}
                                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[560px] overflow-y-auto flex-1">
                                    {fields.length === 0 ? (
                                        <div className="py-24 text-center text-slate-400 text-sm italic">
                                            No products selected. Select variants from the left panel.
                                        </div>
                                    ) : (
                                        (() => {
                                            // Group fields by productId
                                            const grouped = {};
                                            sortedFieldsWithIndex.forEach(({ field, originalIndex }) => {
                                                const pId = field.productId;
                                                if (!grouped[pId]) grouped[pId] = [];
                                                grouped[pId].push({ field, originalIndex });
                                            });

                                            return Object.entries(grouped).map(([pId, variantItems]) => {
                                                const selectedProduct = addedProducts.find(p => p._id === pId);
                                                return (
                                                    <div key={pId} className="p-3.5 space-y-3 bg-white border-b border-slate-100 last:border-0">
                                                        {/* Product Header: image & wrapped title */}
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 flex-shrink-0 mt-0.5">
                                                                {selectedProduct?.images?.[0] ? (
                                                                    <img
                                                                        src={selectedProduct.images[0]}
                                                                        alt={selectedProduct.fullName}
                                                                        className="w-full h-full object-cover rounded-lg border border-slate-100"
                                                                    />
                                                                ) : (
                                                                    <div className="bg-slate-100 border border-slate-200 rounded-lg w-full h-full" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-800 leading-tight break-words flex-1">
                                                                {selectedProduct?.fullName || 'Product not selected'}
                                                            </p>
                                                        </div>

                                                        {/* Variants List for this product */}
                                                        <div className="space-y-3 pl-2 border-l-2 border-slate-100/80">
                                                            {variantItems.map(({ field, originalIndex }) => {
                                                                // Find variant availableStock correctly from array of variant documents
                                                                const vName = field.variantName;
                                                                const regularVariants = selectedProduct && Array.isArray(selectedProduct.variants)
                                                                    ? selectedProduct.variants.map(v => [v.name, v.availableStock])
                                                                    : [];
                                                                const scratchyVariants = selectedProduct && selectedProduct.scratchyVariants
                                                                    ? Object.entries(
                                                                        selectedProduct.scratchyVariants instanceof Map
                                                                            ? Object.fromEntries(selectedProduct.scratchyVariants)
                                                                            : selectedProduct.scratchyVariants
                                                                    )
                                                                    : [];
                                                                const variants = [...regularVariants, ...scratchyVariants];
                                                                const matchedVariant = variants.find(([key]) => key === vName);
                                                                const maxStock = matchedVariant ? matchedVariant[1] : 0;

                                                                const qty = watch(`items.${originalIndex}.quantity`) || 0;
                                                                const prc = watch(`items.${originalIndex}.price`) || 0;
                                                                const disc = watch(`items.${originalIndex}.discountPercent`) || 0;
                                                                const itemTotal = (Number(prc) * Number(qty)) * (1 - Number(disc) / 100);
                                                                const isLowStock = qty > maxStock;

                                                                return (
                                                                    <div key={field.id} className="space-y-2 pb-2.5 border-b border-slate-100/60 last:border-0 last:pb-0">
                                                                        {/* Variant Row 1: variant name (clearly with blue color highlighted), total sum price, close button */}
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide leading-none">
                                                                                    {vName || 'No variant'}
                                                                                </span>
                                                                                {field.isScratchy && (
                                                                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md uppercase leading-none">
                                                                                        Scratchy
                                                                                    </span>
                                                                                )}
                                                                                {isLowStock && (
                                                                                    <span className="text-rose-600 font-extrabold text-[8px] uppercase tracking-wide leading-none">
                                                                                        ERROR ({maxStock} LEFT)
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-extrabold text-slate-900 text-xs">
                                                                                    ₹{itemTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </span>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    type="button"
                                                                                    onClick={() => remove(originalIndex)}
                                                                                    className="text-slate-400 hover:text-rose-600 h-5 w-5 hover:bg-rose-50 rounded-full"
                                                                                >
                                                                                    <span className="text-[14px] font-bold">×</span>
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Variant Row 2: quantity, price per unit, discount inputs */}
                                                                        <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-100/80">
                                                                            {/* Qty */}
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[8.5px] text-slate-400 font-bold uppercase">Qty:</span>
                                                                                <FormField
                                                                                    control={control}
                                                                                    name={`items.${originalIndex}.quantity`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min={1}
                                                                                                    {...field}
                                                                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                                                                                    className="text-center font-extrabold h-7 w-12 border-slate-200 focus:border-slate-450 focus:ring-0 rounded-md text-xs p-1 bg-white"
                                                                                                />
                                                                                            </FormControl>
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </div>

                                                                            {/* Price */}
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[8.5px] text-slate-400 font-bold uppercase">Price:</span>
                                                                                <FormField
                                                                                    control={control}
                                                                                    name={`items.${originalIndex}.price`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    {...field}
                                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                                    className="text-right font-bold h-7 w-20 border-slate-200 focus:border-slate-450 focus:ring-0 rounded-md text-xs p-1 bg-white"
                                                                                                />
                                                                                            </FormControl>
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </div>

                                                                            {/* Discount */}
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[8.5px] text-slate-400 font-bold uppercase">Disc:</span>
                                                                                <FormField
                                                                                    control={control}
                                                                                    name={`items.${originalIndex}.discountPercent`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    type="number"
                                                                                                    min={0}
                                                                                                    max={100}
                                                                                                    {...field}
                                                                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                                                                    className="text-center font-bold h-7 w-12 border-slate-200 focus:border-slate-450 focus:ring-0 rounded-md text-xs p-1 bg-white"
                                                                                                />
                                                                                            </FormControl>
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: 2/3 (Customer) vs 1/3 (Checkout Box) Column Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

                        {/* COLUMN 1 (Customer & Address details - 2/3 width) */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                            {/* Row 1: Customer Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-1">
                                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                        Customer Details
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setValue('userId', '')
                                            setValue('name', '')
                                            setValue('phoneNo', '')
                                            setValue('email', '')
                                            setValue('gst', '')
                                            setValue('address', '')
                                            setValue('address2', '')
                                            setValue('city', '')
                                            setValue('state', '')
                                            setValue('pincode', '')
                                            setVerificationStatus("")
                                            setIsGstVerified(false)
                                        }}
                                        className="h-7 text-[10px] font-bold text-slate-500 hover:text-slate-900 px-2 rounded-md hover:bg-slate-100"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <Separator className="bg-slate-50" />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Mobile Number */}
                                    <FormField
                                        control={control}
                                        name="phoneNo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-450 font-bold text-[9px] uppercase">Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Customer phone"
                                                        type="tel"
                                                        maxLength={10}
                                                        {...field}
                                                        className="border-slate-200 h-9 rounded-lg text-xs"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Customer Name */}
                                    <FormField
                                        control={control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-450 font-bold text-[9px] uppercase">Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={isGstVerified}
                                                        placeholder="Customer name"
                                                        className="border-slate-200 h-9 rounded-lg text-xs"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* GST Number */}
                                    <FormField
                                        control={control}
                                        name="gst"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-450 font-bold text-[9px] uppercase flex items-center gap-1">
                                                    GST Number (Optional)
                                                    {gstVerifying && <span className="text-[8px] text-slate-400 normal-case">(verifying...)</span>}
                                                    {isGstVerified && <span className="text-[8px] text-emerald-600 normal-case">(Verified ✅)</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Customer's GST number"
                                                        maxLength={15}
                                                        className="border-slate-200 h-9 rounded-lg font-mono uppercase text-xs"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Address Rows */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 flex-1">
                                {/* Registered Address */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <FaRegAddressCard /> Registered Address
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Street Address" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="address2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="Street Address 2 (Optional)" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="City" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="State" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="pincode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Pincode" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={control}
                                                name="country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Country" {...field} disabled={isGstVerified} className="border-slate-200 h-9 rounded-lg text-xs" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Address Override Block */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                                            Billing Address
                                        </h4>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                id="billing_same"
                                                checked={billingSameAsRegistered}
                                                onChange={(e) => setBillingSameAsRegistered(e.target.checked)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                            />
                                            <label htmlFor="billing_same" className="font-bold text-slate-500 text-[10px] uppercase cursor-pointer">Same as Registered</label>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {billingSameAsRegistered ? (
                                            <div className="h-36 border border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50/50">
                                                <p className="text-[10px] text-slate-400 font-semibold italic text-center px-4">
                                                    Billing address matches registered details. Toggle to override.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Input placeholder="Billing Street Address" value={billAddress} onChange={(e) => setBillAddress(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                <Input placeholder="Billing Street Address 2" value={billAddress2} onChange={(e) => setBillAddress2(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input placeholder="City" value={billCity} onChange={(e) => setBillCity(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                    <Input placeholder="State" value={billState} onChange={(e) => setBillState(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                    <Input placeholder="Pincode" value={billPincode} onChange={(e) => setBillPincode(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                    <Input placeholder="Country" value={billCountry} onChange={(e) => setBillCountry(e.target.value)} className="bg-white border-slate-200 h-9 rounded-lg text-xs" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2 (Unified Checkout, Comments, and Pricing Box - exactly 1/3 width) */}
                        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                                <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider pb-1">
                                    Checkout Configuration
                                </h3>
                                <Separator className="bg-slate-50" />

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Payment Method */}
                                    <FormField
                                        control={control}
                                        name="method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold text-[9px] uppercase">Payment Method</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full border-slate-200 h-9 rounded-lg text-xs">
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="text-xs">
                                                        <SelectItem value="Cash" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <BsCashCoin className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>Cash</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="UPI" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <IoQrCode className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>UPI</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Online" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <FaGoogle className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>Online</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="COD" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <BsCashCoin className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>COD</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Mixed" className="text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <BsCashCoin className="w-3.5 h-3.5 text-slate-600" />
                                                                <span>Mixed</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Payment Mode */}
                                    <FormField
                                        control={control}
                                        name="paymentMode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-400 font-bold text-[9px] uppercase">Dispatch mode</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full border-slate-200 h-9 rounded-lg text-xs">
                                                            <SelectValue placeholder="Select mode" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="text-xs">
                                                        <SelectItem value="complete" className="text-xs">Complete Dispatch</SelectItem>
                                                        <SelectItem value="parcel" className="text-xs">Parcel Dispatch</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between flex-1 mt-2">
                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                                        Pricing Summary
                                    </h3>
                                    <Separator className="bg-slate-200/50" />

                                    <div className="space-y-2 text-xs">
                                        {/* Subtotal */}
                                        <div className="flex justify-between text-slate-500 font-semibold">
                                            <span>Subtotal:</span>
                                            <span className="font-bold text-slate-800">₹{watch('subtotal')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>

                                        {/* Delivery Charge */}
                                        <FormField
                                            control={control}
                                            name="deliveryCharge"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between gap-4">
                                                    <FormLabel className="text-slate-500 font-semibold text-xs">Delivery Charge (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            className="w-24 text-right font-semibold h-7 border-slate-200 rounded-md text-xs bg-white"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Global Discount */}
                                        <FormField
                                            control={control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center justify-between gap-4">
                                                    <FormLabel className="text-slate-500 font-semibold text-xs">Global Discount (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                            className="w-24 text-right font-semibold h-7 border-slate-200 rounded-md text-xs bg-white"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <Separator className="bg-slate-200/50" />

                                        {/* Quotation Total */}
                                        <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-1">
                                            <span>Quotation Total:</span>
                                            <span>₹{watch('orderAmount')?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments Textarea */}
                                <FormField
                                    control={control}
                                    name='comments'
                                    render={({ field }) => (
                                        <FormItem className="pt-2">
                                            <FormLabel className="text-slate-400 font-bold text-[9px] uppercase">Internal Comments</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='Add custom invoice remarks...'
                                                    {...field}
                                                    className="border-slate-200 rounded-lg min-h-[45px] text-xs bg-white"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-3">
                                    {canAddPos && (
                                        <LoaderButton
                                            loading={loading || createPosOrder.isPending || createCustomer.isPending}
                                            type="submit"
                                            disabled={items?.length < 1 || loading || createPosOrder.isPending || createCustomer.isPending}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 shadow-xs rounded-lg text-xs"
                                        >
                                            Create POS Quotation
                                        </LoaderButton>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </Form>

            {createdOrder &&
                <SuccessMessage
                    reset={reset}
                    order={createdOrder}
                    resetOrder={setCreatedOrder}
                    linkSent={linkSent}
                    setLinkSent={setLinkSent}
                />
            }
        </InnerDashboardLayout>
    )
}

export default Page