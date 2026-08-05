"use client"
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import PCard from '@/components/custom/PCard'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUsers } from '@/hooks/useUsers'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import UserDialog from '../customers/components/UserDialog'
import { Separator } from '@/components/ui/separator'
import LoaderButton from '@/components/custom/LoaderButton'
import { BsCashCoin } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { useSubCategories } from '@/hooks/useSubCategories'
import api from '@/lib/api'
import ProductGrid from './components/ProductGrid'
import OrderItemRow from './components/OrderItemRow'
import { posSchema } from '@/lib/validations/posSchema'
import SuccessMessage from './components/SuccessMessage'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import NotAuthorizedPage from '@/components/notAuthorized'
import { IoQrCode } from "react-icons/io5";
const FILTERS = [
    // { key: '_all_', label: 'ALL' },
    { key: 'InStock', label: 'In stock' },
    { key: 'OutOfStock', label: 'Out of stock' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Not Active' },
]

function page() {
    const { createCustomer } = useUsers();
    const [createdOrder, setCreatedOrder] = useState(null)
    const [categoryFilter, setCategoryFilter] = useState()
    const [typeFilter, setTypeFilter] = useState('InStock')

    // debounce hook
    function useDebouncedValue(value, delay = 500) {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            setPage(1)
            return () => clearTimeout(handler);
        }, [value, delay]);

        return debouncedValue;
    }
    const [searchTerm, setSearchTerm] = useState("")
    const debouncedSearch = useDebouncedValue(searchTerm, 500);
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    // products data
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

    const { createPosOrder, permissionsPos: { canAddPos, canDeletePos, canEditPos, canViewPos } } = useOrders()
    const [addedProducts, setAddedProducts] = useState([])
    const [addUserDialog, setAddUserDialog] = useState(false)
    const [linkSent, setLinkSent] = useState(false)
    const [loading, setLoading] = useState(false)

    // form hook
    const form = useForm({
        resolver: zodResolver(posSchema),
        mode: "onSubmit",
        defaultValues: {
            userId: "",
            name: "",
            phoneNo: "",
            gst: "",
            method: "Cash",
            subtotal: 0,
            discount: 0,
            orderAmount: 0,
            comments: '',
            items: []
        }
    })

    const { watch, setValue, reset } = form;
    const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
    const items = useWatch({ control: form.control, name: "items" })
    const discount = watch('discount')

    useEffect(() => {
        const subtotal = items.reduce((a, i) => a + (i.price || 0) * (i.quantity || 0), 0)
        const orderAmount = subtotal - discount;

        if (form.getValues("subtotal") !== subtotal) form.setValue("subtotal", subtotal)
        if (form.getValues("orderAmount") !== orderAmount) form.setValue("orderAmount", orderAmount)
    }, [items, discount, form])

    const watchSubTotal = watch('subtotal')
    const watchOrderAmount = watch('orderAmount')

    async function onSubmit(values) {
        setLoading(true);
        try {
            setLinkSent(false)
            setCreatedOrder(null);
            let finalUserId;
            const res = await api.get(`/users/customer/${values.phoneNo}`);

            if (res?.data?.statusCode === 200) {
                const res = await createCustomer.mutateAsync({
                    name: values.name,
                    phoneNo: values.phoneNo,
                    role: 'user',
                })
                finalUserId = res?.data?.data?._id
                form.setValue('userId', finalUserId)
            } else {
                finalUserId = res.data?.data;
            }

            const payload = {
                ...values,
                userId: finalUserId,
            }

            const res2 = await createPosOrder.mutateAsync(payload)
            const created = res2?.data?.data;
            reset();
            setCreatedOrder(created)
            // router.push('/admin/orders')
        } catch (err) {
            console.error('Error in creating order:', err)
        } finally {
            setLoading(false)
        }
    }

    function onError(errors) {
        console.log("Validation errors:", errors);
    }

    if (!canViewPos) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Create POS Order</h1>
                <div>
                    <Button><Link href={'/admin/posOrders'}>View History</Link> </Button>
                </div>
            </div>

            <div className='flex flex-col-reverse lg:flex-col-reverse gap-4 w-full'>
                {/* Product Grid */}
                <div className="w-full lg:w-full">
                    <PCard className="h-full">
                        <h2 className="font-semibold text-xl uppercase text-gray-600 mb-4">Products</h2>

                        {/* Toolbar */}
                        <div className="flex flex-wrap justify-between items-center gap-2">
                            {/* Search Bar */}
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full flex-1 bg-white"
                            />

                            <Select value={categoryFilter} onValueChange={(val) => {
                                setCategoryFilter(val === '__all__' ? undefined : val)
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All Categories</SelectItem>
                                    {subCategories?.map((n) => (
                                        <SelectItem key={n._id} value={String(n._id)}>
                                            {n.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* filter by */}
                            <Select value={typeFilter} onValueChange={(val) => {
                                setTypeFilter(val === '_aa_' ? undefined : val)
                                setPage(1)
                            }}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Filter By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_aa_">All</SelectItem>
                                    {FILTERS?.map((n, idx) => (
                                        <SelectItem key={idx} value={n.key}>
                                            {n.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <ProductGrid
                            loading={products.isFetching}
                            allProducts={allProducts}
                            setAddedProducts={setAddedProducts}
                            onAddItem={(item) => append(item)}
                        />

                        <div className="flex w-full justify-end gap-2 items-center">
                            {/* Limit Dropdown */}
                            <Select value={String(limit)} onValueChange={(val) => { setPage(1); setLimit(Number(val)) }}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Items per page" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 5, 10, 20, 50].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n} / page
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Pagination */}
                            <Pagination className={'inline justify-end mx-1 w-fit'}>
                                <PaginationContent>
                                    {page > 1 && (
                                        <PaginationItem>
                                            <PaginationPrevious href="#" onClick={() => setPage((p) => p - 1)} />
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
                                                >
                                                    {p}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}

                                    {page < totalPages && (
                                        <PaginationItem>
                                            <PaginationNext href="#" onClick={() => setPage((p) => p + 1)} />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </PCard>
                </div>

                {/* Order Form  */}
                <div className="w-full lg:w-full">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-2">
                            {/* user personal details */}
                            <PCard>
                                <div className="flex gap-2 justify-between items-center mb-3">
                                    <h2 className='font-semibold text-xl uppercase text-gray-600'>Customer Details</h2>
                                </div>
                                <Separator className="mb-4" />
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                    {/* phone no */}
                                    <FormField
                                        control={form.control}
                                        name="phoneNo"
                                        render={({ field }) => (
                                            <FormItem className="relative col-span-2 sm:col-span-1">
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter phone number"
                                                        type={'tel'}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Customer name */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2 sm:col-span-1">
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Customer name"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* GST Number */}
                                    <FormField
                                        control={form.control}
                                        name="gst"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>GST Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Customer's GST number"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* payment method */}
                                    <FormField
                                        control={form.control}
                                        name="method"
                                        render={({ field }) => (
                                            <FormItem className="">
                                                <FormLabel>Payment Method</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className={'w-full'}>
                                                            <SelectValue placeholder="Select method" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Cash">
                                                            <div className="flex items-center gap-2">
                                                                <BsCashCoin className="w-4 h-4 text-gray-600" />
                                                                <span>Cash</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="UPI">
                                                            <div className="flex items-center gap-2">
                                                                <IoQrCode className="w-4 h-4 text-gray-600" />
                                                                <span>UPI</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Online">
                                                            <div className="flex items-center gap-2">
                                                                <FaGoogle className="w-4 h-4 text-gray-600" />
                                                                <span>Online</span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </PCard>

                            <div className='grid grid-cols-10 gap-3 w-full '>
                                {/* items table */}
                                <div className={'col-span-10 lg:col-span-7 w-full'}>
                                    <div className={'bg-white rounded-sm overflow-x-scroll p-4'}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className='font-semibold text-xl uppercase text-gray-600'>Order Items</h2>
                                            <div className="text-sm text-gray-500">
                                                {items.length} item{items.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>

                                        <div className="border rounded-lg overflow-x-auto overflow-scroll">
                                            {fields.length === 0 ? (
                                                <div className="py-10 text-center text-gray-500">
                                                    No items added. Select products from the left panel.
                                                </div>
                                            ) : (
                                                <div className="max-h-64 ">
                                                    {fields.map((item, i) => (
                                                        <OrderItemRow
                                                            key={item.id}
                                                            index={i}
                                                            allProducts={addedProducts}
                                                            onRemove={() => remove(i)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* totals */}
                                <div className={'col-span-10 lg:col-span-3 w-full'}>
                                    <PCard>
                                        <div className="space-y-3">
                                            {/* Sub total */}
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">₹{watchSubTotal}</span>
                                            </div>

                                            {/* discount */}
                                            <FormField
                                                control={form.control}
                                                name="discount"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between gap-2">
                                                        <FormLabel>Discount</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type={'number'}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    field.onChange(value === '' ? '' : Number(value));
                                                                }}
                                                                placeholder="Eg. 240"
                                                                className="max-w-24 text-right border-none border-b rounded-none border-black appearance-none"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Separator />

                                            {/* Total amount */}
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total Amount:</span>
                                                <span className="text-primary">₹{watchOrderAmount}</span>
                                            </div>

                                            <Separator />

                                            <FormField
                                                control={form.control}
                                                name='comments'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Comments</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder='Add comments on order...'
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </PCard>
                                </div>
                            </div>

                            <div className='flex items-center justify-end'>
                                {canAddPos &&
                                    <LoaderButton
                                        loading={loading || createPosOrder.isPending || createCustomer.isPending}
                                        type="submit"
                                        disabled={items?.length < 1 || loading || createPosOrder.isPending || createCustomer.isPending}
                                        className="mb-5"
                                    >
                                        Create Order
                                    </LoaderButton>
                                }
                            </div>
                        </form>
                    </Form>
                </div>
                {createdOrder &&
                    <SuccessMessage
                        reset={reset}
                        order={createdOrder}
                        resetOrder={setCreatedOrder}
                        linkSent={linkSent}
                        setLinkSent={setLinkSent}
                    />
                }
            </div>

            <UserDialog
                open={addUserDialog}
                onOpenChange={setAddUserDialog}
            />
        </InnerDashboardLayout>
    )
}

export default page