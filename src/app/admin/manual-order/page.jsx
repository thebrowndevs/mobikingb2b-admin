"use client"
import React, { useEffect, useState } from 'react'
import InnerDashboardLayout from '@/components/dashboard/InnerDashboardLayout'
import PCard from '@/components/custom/PCard'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useUsers } from '@/hooks/useUsers'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import UserDialog from '../customers/components/UserDialog'
import { Separator } from '@/components/ui/separator'
import LoaderButton from '@/components/custom/LoaderButton'
import { useRouter } from 'next/navigation'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination"
import { getPaginationRange } from "@/lib/services/getPaginationRange"
import { useSubCategories } from '@/hooks/useSubCategories'
import api from '@/lib/api'
import ProductGrid from './components/ProductGrid'
import OrderItemRow from './components/OrderItemRow'
import { manualOrderSchema } from '@/lib/validations/posSchema'
import SuccessMessage from './components/SuccessMessage'
import FormInputField from '@/components/custom/FormInputField'
import { Textarea } from '@/components/ui/textarea'
import NotAuthorizedPage from '@/components/notAuthorized'

const FILTERS = [
    // { key: '_all_', label: 'ALL' },
    { key: 'InStock', label: 'In stock' },
    { key: 'OutOfStock', label: 'Out of stock' },
    { key: 'Active', label: 'Active' },
    { key: 'Inactive', label: 'Not Active' },
]

const customerFields = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Customer name', colSpan: 'col-span-2 sm:col-span-1' },
    { name: 'phoneNo', label: 'Phone Number', type: 'tel', placeholder: 'Enter phone number', colSpan: 'col-span-2 sm:col-span-1' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'yourname@gmail.com', colSpan: 'col-span-2 sm:col-span-1' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'H. No 50' },
    { name: 'address2', label: 'Address 2', type: 'text', placeholder: 'Ashok Nagar' },
    { name: 'city', label: 'City', type: 'text', placeholder: 'Rohtak' },
    { name: 'pincode', label: 'Pincode', type: 'text', placeholder: '145412' },
    { name: 'state', label: 'State', type: 'text', placeholder: 'Haryana' },
    { name: 'country', label: 'Country', type: 'text', placeholder: 'India' },
    { name: 'gst', label: 'GST Number', type: 'text', placeholder: 'Enter GST number' },
]

function page() {
    const router = useRouter();
    const { createCustomer } = useUsers();
    const [createdOrder, setCreatedOrder] = useState(null)
    const [categoryFilter, setCategoryFilter] = useState()
    const [typeFilter, setTypeFilter] = useState('InStock')
    const [linkSent, setLinkSent] = useState(false)

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

    const { createManualOrder, permissionsManual: { canViewManual, canAddManual, canEditManual, canDeleteManual } } = useOrders()
    const [addedProducts, setAddedProducts] = useState([])
    const [addUserDialog, setAddUserDialog] = useState(false)

    // form hook
    const form = useForm({
        resolver: zodResolver(manualOrderSchema),
        mode: "onSubmit",
        defaultValues: {
            userId: "",
            name: "",
            phoneNo: "",
            gst: "",
            method: "Online",
            subtotal: 0,
            discount: 0,
            deliveryCharge: 0,
            orderAmount: 0,
            comments: '',
            items: []
        }
    })

    const { watch, setValue, reset } = form;
    const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
    const items = useWatch({ control: form.control, name: "items" })
    const discount = watch('discount')
    const deliveryCharge = watch('deliveryCharge')

    useEffect(() => {
        const subtotal = items.reduce((a, i) => a + (i.price || 0) * (i.quantity || 0), 0)
        const orderAmount = subtotal - discount + deliveryCharge;

        if (form.getValues("subtotal") !== subtotal) form.setValue("subtotal", subtotal)
        if (form.getValues("orderAmount") !== orderAmount) form.setValue("orderAmount", orderAmount)
    }, [items, discount, form, deliveryCharge])

    const watchSubTotal = watch('subtotal')
    const watchOrderAmount = watch('orderAmount')

    async function onSubmit(values) {
        try {
            setLinkSent(false)
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

            const res2 = await createManualOrder.mutateAsync(payload)
            const created = res2?.data?.data;
            reset();
            setCreatedOrder(created);
            // router.push('/admin/orders')
        } catch (err) {
            console.error('Error in creating order:', err)
        }
    }

    function onError(errors) {
        console.log("❌ Validation errors:", errors);
    }

    if (!canViewManual) return <NotAuthorizedPage />

    return (
        <InnerDashboardLayout>
            <div className='flex items-center justify-between w-full mb-3'>
                <h1 className="text-primary font-bold sm:text-2xl lg:text-3xl mb-0">Create Manual Order</h1>
            </div>

            <div className='flex flex-col-reverse lg:flex-col-reverse gap-4 w-full'>
                {/* Left Column: Product Grid (70% width) */}
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

                {/* Right Column: Order Form (30% width) */}
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

                                    {customerFields.map((f) => (
                                        <FormInputField
                                            key={f.name}
                                            control={form.control}
                                            name={f.name}
                                            label={f.label}
                                            type={f.type}
                                            placeholder={f.placeholder}
                                            className={f.colSpan || ''}
                                        />
                                    ))}

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
                                                        <SelectItem value="COD">
                                                            <div className="flex items-center gap-2">
                                                                <span>COD</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="Online">
                                                            <div className="flex items-center gap-2">
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

                                            {/* delivery charges */}
                                            <FormField
                                                control={form.control}
                                                name="deliveryCharge"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between gap-2">
                                                        <FormLabel>Delivery Charge</FormLabel>
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
                                {canAddManual &&
                                    <LoaderButton
                                        loading={createManualOrder.isPending || createCustomer.isPending}
                                        type="submit"
                                        disabled={items?.length < 1 || createManualOrder.isPending || createCustomer.isPending}
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