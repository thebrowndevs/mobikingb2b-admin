import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

function ItemsTable({ order, isNewOrder, canEdit }) {
    const items = order?.items || []

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between w-full pb-1">
                <h2 className="text-lg font-bold text-slate-800">Items List</h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Image</TableHead>
                            <TableHead className="font-semibold text-slate-700">Product</TableHead>
                            <TableHead className="font-semibold text-slate-700">Variant</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center">Qty</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Selling Price</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Discount</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Total Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, idx) => {
                            const product = item?.productId
                            const image = product?.images?.[0] || item?.images?.[0]
                            const name = product?.fullName || product?.name || item?.name
                            const variant = item?.variantName
                            const quantity = item?.quantity
                            const sellingPrice = item?.price
                            const discountVal = item?.discount || 0
                            const discountPercent = item?.discountPercent || 0
                            const totalPrice = (sellingPrice * quantity) - discountVal

                            return (
                                <TableRow key={idx} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <img
                                            src={image}
                                            alt={name}
                                            className="w-12 h-12 object-cover rounded-lg border border-slate-100"
                                        />
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-800 max-w-[250px] truncate" title={name}>
                                        {name}
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-mono text-xs">{variant}</TableCell>
                                    <TableCell className="text-center font-bold text-slate-800">{quantity}</TableCell>
                                    <TableCell className="text-right text-slate-600 font-medium">₹{sellingPrice?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-emerald-600 font-semibold">
                                        {discountPercent > 0 ? (
                                            <span>{discountPercent}% (-₹{discountVal})</span>
                                        ) : discountVal > 0 ? (
                                            <span>₹{discountVal}</span>
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-slate-800">₹{totalPrice?.toLocaleString()}</TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pricing Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="w-full sm:w-80 space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Subtotal</span>
                        <span>₹{order?.subtotal?.toLocaleString() ?? "0"}</span>
                    </div>
                    {order?.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Discount {order?.discountPercent > 0 ? `(${order.discountPercent}%)` : ''}</span>
                            <span>-₹{order?.discount?.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Delivery Charge</span>
                        <span>₹{order?.deliveryCharge?.toLocaleString() ?? "0"}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold text-base pt-2 border-t border-slate-100">
                        <span>Total Amount</span>
                        <span>₹{order?.orderAmount?.toLocaleString() ?? "0"}</span>
                    </div>
                    {order?.amountPaid > 0 && (
                        <div className="flex justify-between text-slate-500 font-semibold text-xs pt-1">
                            <span>Amount Paid</span>
                            <span>₹{order?.amountPaid?.toLocaleString()}</span>
                        </div>
                    )}
                    {order?.remainingAmount > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold text-xs">
                            <span>Remaining Balance</span>
                            <span>₹{order?.remainingAmount?.toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemsTable
