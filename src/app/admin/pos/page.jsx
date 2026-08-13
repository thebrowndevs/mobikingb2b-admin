"use client"
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import { Form } from '@/components/ui/form'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUsers } from '@/hooks/useUsers'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { useSubCategories } from '@/hooks/useSubCategories'
import api from '@/lib/api'
import { posSchema } from '@/lib/validations/posSchema'
import SuccessMessage from './components/SuccessMessage'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import NotAuthorizedPage from '@/components/notAuthorized'
import { toast } from 'sonner'
import { getSlabPrice } from './components/ProductCard'

// Modular POS sub-components
import ProductsSection from './components/ProductsSection'
import CartSection from './components/CartSection'
import BillingForm from './components/BillingForm'

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

    // Debounce search state
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 550)
        return () => clearTimeout(handler)
    }, [searchTerm])

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)

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

    // GST verification
    const [gstVerifying, setGstVerifying] = useState(false)
    const [isGstVerified, setIsGstVerified] = useState(false)
    const [customerLoading, setCustomerLoading] = useState(false)
    const [verificationStatus, setVerificationStatus] = useState("")
    const [billingSameAsRegistered, setBillingSameAsRegistered] = useState(true)

    // Address override states
    const [billAddress, setBillAddress] = useState("")
    const [billAddress2, setBillAddress2] = useState("")
    const [billCity, setBillCity] = useState("")
    const [billState, setBillState] = useState("")
    const [billPincode, setBillPincode] = useState("")
    const [billCountry, setBillCountry] = useState("India")

    // Cache products from paginated queries
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

    // React Hook Form
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
            discountPercent: 0,
            deliveryCharge: 0,
            orderAmount: 0,
            comments: '',
            items: []
        }
    })

    const { watch, setValue, reset, control, setError, clearErrors } = form
    const { fields, append, remove } = useFieldArray({ control, name: "items" })
    const items = useWatch({ control, name: "items" })
    const discount = watch('discount')
    const discountPercent = watch('discountPercent')
    const deliveryCharge = watch('deliveryCharge')
    const phoneNo = watch('phoneNo')
    const gst = watch('gst')

    // Clear GST errors on any input value change
    useEffect(() => {
        clearErrors('gst')
    }, [gst, clearErrors])

    // Slab pricing syncer triggered deeply by serializing items
    const itemsSerialized = JSON.stringify(
        items?.map(it => ({ productId: it.productId, quantity: it.quantity }))
    )

    useEffect(() => {
        const productQuantities = {}
        items.forEach((item) => {
            if (!item.productId) return
            productQuantities[item.productId] = (productQuantities[item.productId] || 0) + (item.quantity || 0)
        })

        items.forEach((item, idx) => {
            if (!item.productId) return
            const selectedProduct = addedProducts.find(p => p._id === item.productId)
            if (selectedProduct) {
                const totalQty = productQuantities[item.productId]
                const resolvedSlabPrice = getSlabPrice(selectedProduct, totalQty)

                const lastSlabPrice = form.getValues(`items.${idx}._lastSlabPrice`)
                if (lastSlabPrice !== resolvedSlabPrice) {
                    setValue(`items.${idx}.price`, resolvedSlabPrice)
                    setValue(`items.${idx}._lastSlabPrice`, resolvedSlabPrice)
                }
            }
        })
    }, [itemsSerialized, addedProducts, setValue, items])

    // Update totals
    useEffect(() => {
        const subtotal = items.reduce((a, item) => {
            const unitPrice = Number(item.price || 0)
            const qty = Number(item.quantity || 0)
            const itemDiscPercent = Number(item.discountPercent || 0)
            const itemDiscFlat = Number(item.discount || 0)

            // Calculate item subtotal
            const baseSum = unitPrice * qty
            const rowTotal = itemDiscPercent > 0
                ? baseSum * (1 - itemDiscPercent / 100)
                : Math.max(0, baseSum - itemDiscFlat);

            return a + rowTotal
        }, 0)

        const total = Math.max(0, subtotal - Number(discount || 0)) + Number(deliveryCharge || 0)

        if (form.getValues("subtotal") !== subtotal) setValue("subtotal", subtotal)
        if (form.getValues("orderAmount") !== total) setValue("orderAmount", total)
    }, [items, discount, deliveryCharge, setValue])

    // Auto-fetch Customer info on 10 digits
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
                            setValue('name', user.business?.businessName || user.name || "")
                            setValue('email', user.email || "")
                            setValue('gst', user.business?.gstNumber || "")

                            const bName = user.business?.businessName ? ` (${user.business.businessName})` : ""
                            setVerificationStatus(
                                user.business?.isApproved
                                    ? `Verified Customer${bName}`
                                    : `Pending Verification${bName}`
                            )

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

    // Auto-verify GST on 15 digits
    useEffect(() => {
        const verifyGstInput = async () => {
            if (gst?.length === 15 && !isGstVerified) {
                setGstVerifying(true)
                try {
                    const res = await api.post("/onboarding/gst/verify-pos", { gstin: gst, phoneNo: phoneNo })
                    const data = res?.data?.data
                    if (data?.alreadyRegistered) {
                        toast.success("GST already registered! Loading customer...")
                        const u = data.user
                        setValue('userId', u._id)
                        setValue('name', u.businessName || u.name)
                        setValue('phoneNo', u.phoneNo)
                        setValue('email', u.email)
                        setValue('address', u.address)
                        setValue('address2', u.address2)
                        setValue('city', u.city)
                        setValue('state', u.state)
                        setValue('pincode', u.pincode)
                        setValue('country', u.country)
                        setVerificationStatus("Existing Customer (Loaded)")
                        setIsGstVerified(true)
                    } else if (data) {
                        setValue('name', data.tradeName || data.legalName || "")
                        setIsGstVerified(true)
                        toast.success("GSTIN verified successfully!")

                        const addr = data.principalAddress || {}
                        setValue('address', addr.street || "")
                        setValue('address2', addr.street2 || "")
                        setValue('city', addr.city || "")
                        setValue('state', addr.state || "")
                        setValue('pincode', addr.pinCode || "")
                        setValue('country', addr.country || "India")
                    }
                } catch (err) {
                    const errMsg = err?.response?.data?.message || "GSTIN verification failed. Please check government records."
                    setError('gst', { type: 'manual', message: errMsg })
                    toast.error(errMsg)
                } finally {
                    setGstVerifying(false)
                }
            } else if (gst?.length !== 15) {
                setIsGstVerified(false)
            }
        }
        verifyGstInput()
    }, [gst, setValue, isGstVerified, setError])

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
                    email: values.email,
                    gstNumber: values.gst,
                    isPos: true,
                    role: 'user',
                })
                finalUserId = res?.data?.data?._id
            }

            // Map and calculate both flat discount and discountPercent values for items and totals
            const finalItems = values.items.map(item => {
                const itemQty = Number(item.quantity || 1)
                const itemPrice = Number(item.price || 0)
                const baseSum = itemQty * itemPrice

                let calculatedFlat = Number(item.discount || 0)
                let calculatedPercent = Number(item.discountPercent || 0)

                // If user entered percentage, compute flat. Else compute percentage.
                if (calculatedPercent > 0 && calculatedFlat === 0) {
                    calculatedFlat = baseSum * (calculatedPercent / 100)
                } else if (calculatedFlat > 0 && calculatedPercent === 0) {
                    calculatedPercent = baseSum > 0 ? (calculatedFlat / baseSum) * 100 : 0
                }

                return {
                    productId: item.productId,
                    variantName: item.variantName,
                    quantity: itemQty,
                    price: itemPrice,
                    discount: calculatedFlat,
                    discountPercent: calculatedPercent,
                    isScratchy: item.isScratchy
                }
            })

            let finalGlobalFlat = Number(values.discount || 0)
            let finalGlobalPercent = Number(values.discountPercent || 0)
            const calculatedSubtotal = finalItems.reduce((acc, it) => acc + (it.price * it.quantity - it.discount), 0)

            if (finalGlobalPercent > 0 && finalGlobalFlat === 0) {
                finalGlobalFlat = calculatedSubtotal * (finalGlobalPercent / 100)
            } else if (finalGlobalFlat > 0 && finalGlobalPercent === 0) {
                finalGlobalPercent = calculatedSubtotal > 0 ? (finalGlobalFlat / calculatedSubtotal) * 100 : 0
            }

            const payload = {
                ...values,
                userId: finalUserId,
                items: finalItems,
                discount: finalGlobalFlat,
                discountPercent: finalGlobalPercent,
                subtotal: calculatedSubtotal,
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

    // Group items index logic
    const sortedFieldsWithIndex = fields
        .map((field, originalIndex) => ({ field, originalIndex }))
        .sort((a, b) => String(a.field.productId).localeCompare(String(b.field.productId)))

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3 border-b border-slate-100 pb-3'>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tighter"> Create POS Quotation</h1>
                    <p className="text-sm text-slate-500">Generate a wholesale POS invoice or quotation dynamically</p>
                </div>
                <div>
                    <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50 h-8 text-xs">
                        <Link href={'/admin/posOrders'}>View History</Link>
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
                    {/* Top Row: Products List and POS Cart */}
                    <div className='flex flex-col lg:flex-row gap-4 w-full items-stretch'>
                        <div className="w-full lg:w-8/12">
                            <ProductsSection
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                categoryFilter={categoryFilter}
                                setCategoryFilter={setCategoryFilter}
                                typeFilter={typeFilter}
                                setTypeFilter={setTypeFilter}
                                subCategories={subCategories}
                                FILTERS={FILTERS}
                                loading={products.isFetching}
                                allProducts={allProducts}
                                setAddedProducts={setAddedProducts}
                                onAddItem={(item) => append(item)}
                                cartItems={items}
                                limit={limit}
                                setLimit={setLimit}
                                page={page}
                                setPage={setPage}
                                totalPages={totalPages}
                                paginationRange={paginationRange}
                            />
                        </div>

                        <div className="w-full lg:w-4/12">
                            <CartSection
                                fields={fields}
                                addedProducts={addedProducts}
                                sortedFieldsWithIndex={sortedFieldsWithIndex}
                                watch={watch}
                                control={control}
                                setValue={setValue}
                                remove={remove}
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Customer billing, configs, and pricing summary */}
                    <BillingForm
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        isGstVerified={isGstVerified}
                        gstVerifying={gstVerifying}
                        setVerificationStatus={setVerificationStatus}
                        setIsGstVerified={setIsGstVerified}
                        billingSameAsRegistered={billingSameAsRegistered}
                        setBillingSameAsRegistered={setBillingSameAsRegistered}
                        billAddress={billAddress}
                        setBillAddress={setBillAddress}
                        billAddress2={billAddress2}
                        setBillAddress2={setBillAddress2}
                        billCity={billCity}
                        setBillCity={setBillCity}
                        billState={billState}
                        setBillState={setBillState}
                        billPincode={billPincode}
                        setBillPincode={setBillPincode}
                        billCountry={billCountry}
                        setBillCountry={setBillCountry}
                        canAddPos={canAddPos}
                        loading={loading}
                        createPosOrder={createPosOrder}
                        createCustomer={createCustomer}
                    />
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