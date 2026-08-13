import React, { useState } from 'react'
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import LoaderButton from '@/components/custom/LoaderButton'
import { BsCashCoin } from "react-icons/bs"
import { FaGoogle, FaRegAddressCard } from "react-icons/fa"
import { IoQrCode } from "react-icons/io5"

export default function BillingForm({
    control,
    watch,
    setValue,
    isGstVerified,
    gstVerifying,
    setVerificationStatus,
    setIsGstVerified,
    billingSameAsRegistered,
    setBillingSameAsRegistered,
    billAddress,
    setBillAddress,
    billAddress2,
    setBillAddress2,
    billCity,
    setBillCity,
    billState,
    setBillState,
    billPincode,
    setBillPincode,
    billCountry,
    setBillCountry,
    canAddPos,
    loading,
    createPosOrder,
    createCustomer
}) {
    const [globalMode, setGlobalMode] = useState('flat') // default is flat for global

    const subtotal = watch('subtotal') || 0
    const discount = watch('discount') || 0
    const discountPercent = watch('discountPercent') || 0
    const deliveryCharge = watch('deliveryCharge') || 0
    const orderAmount = watch('orderAmount') || 0
    const items = watch('items') || []

    const toggleGlobalMode = () => {
        setGlobalMode(prev => prev === 'percent' ? 'flat' : 'percent')
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* COLUMN 1: Customer & Address details (2/3 width) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 flex flex-col justify-between">
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

                {/* Address Rows */}
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

                    {/* Billing Address Override */}
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

            {/* COLUMN 2: Unified Checkout, Comments, and Pricing Box (1/3 width) */}
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
                                <span className="font-bold text-slate-800">₹{subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>

                            {/* Global Discount and Toggle */}
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-500 font-semibold text-xs">Global Discount:</span>

                                <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-7 w-24">
                                    {globalMode === 'percent' ? (
                                        <FormField
                                            control={control}
                                            name="discountPercent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            {...field}
                                                            onChange={(e) => {
                                                                const valStr = e.target.value
                                                                if (valStr === "") {
                                                                    field.onChange("")
                                                                    setValue('discount', 0)
                                                                } else {
                                                                    const valPercent = parseFloat(valStr) || 0
                                                                    field.onChange(valPercent)
                                                                    setValue('discount', parseFloat((subtotal * (valPercent / 100)).toFixed(2)))
                                                                }
                                                            }}
                                                            className="text-center font-bold h-full w-14 border-0 focus:ring-0 rounded-none text-xs p-0"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ) : (
                                        <FormField
                                            control={control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            {...field}
                                                            onChange={(e) => {
                                                                const valStr = e.target.value
                                                                if (valStr === "") {
                                                                    field.onChange("")
                                                                    setValue('discountPercent', 0)
                                                                } else {
                                                                    const valFlat = parseFloat(valStr) || 0
                                                                    field.onChange(valFlat)
                                                                    setValue('discountPercent', parseFloat((subtotal > 0 ? (valFlat / subtotal) * 100 : 0).toFixed(2)))
                                                                }
                                                            }}
                                                            className="text-right font-bold h-full w-14 border-0 focus:ring-0 rounded-none text-xs p-1"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <button
                                        type="button"
                                        onClick={toggleGlobalMode}
                                        className="bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-[10px] font-black h-full w-10 flex items-center justify-center text-slate-600 transition-colors"
                                    >
                                        {globalMode === 'percent' ? '%' : '₹'}
                                    </button>
                                </div>
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

                            <Separator className="bg-slate-200/50" />

                            {/* Quotation Total */}
                            <div className="flex justify-between text-slate-800 font-extrabold text-sm pt-1">
                                <span>Quotation Total:</span>
                                <span>₹{orderAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Comments Textarea */}
                    <FormField
                        control={control}
                        name='comments'
                        render={({ field }) => (
                            <FormItem className="pt-2">
                                <FormLabel className="text-slate-450 font-bold text-[9px] uppercase">Internal Comments</FormLabel>
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
    )
}
