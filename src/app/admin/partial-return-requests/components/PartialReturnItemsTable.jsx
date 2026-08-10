'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

/**
 * PartialReturnItemsTable
 *
 * Renders an intersection of:
 *   - orderItems  -> full data (image, price, discount, order qty, discountPercent)
 *   - returnItems -> partial return specific data (return qty, sku, fullName)
 *
 * For each returnItem, we find its counterpart in orderItems by productId + variantName.
 * If not found (orderRef not populated), we fall back to returnItem data gracefully.
 */
export default function PartialReturnItemsTable({ orderItems = [], returnItems = [] }) {
    if (!returnItems || returnItems.length === 0) {
        return (
            <div className="border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">
                No items selected for return.
            </div>
        );
    }

    const orderItemMap = {};
    (orderItems || []).forEach((oi) => {
        const pid = oi?.productId?._id?.toString() || oi?.productId?.toString() || '';
        const vname = (oi?.variantName || '').toLowerCase().trim();
        const key = `${pid}::${vname}`;
        orderItemMap[key] = oi;
    });

    const findOrderItem = (returnItem) => {
        const pid =
            returnItem?.productId?._id?.toString() ||
            returnItem?.productId?.toString() ||
            '';
        const vname = (returnItem?.variantName || '').toLowerCase().trim();
        return orderItemMap[`${pid}::${vname}`] || null;
    };

    const returnSubtotal = returnItems.reduce((acc, it) => acc + (it.quantity || 0) * (it.price || 0), 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Items Selected for Return
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                    {returnItems.length} item{returnItems.length !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 w-14">Image</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Product</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4">Variant</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 text-center">Order Qty</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 text-right">Unit Price</TableHead>
                            <TableHead className="font-bold text-slate-600 text-xs uppercase tracking-wide py-3 px-4 text-right">Discount</TableHead>
                            <TableHead className="font-bold text-indigo-700 text-xs uppercase tracking-wide py-3 px-4 text-center border-l border-indigo-100 bg-indigo-50/40">Return Qty</TableHead>
                            <TableHead className="font-bold text-emerald-700 text-xs uppercase tracking-wide py-3 px-4 text-right bg-emerald-50/40">Return Total</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {returnItems.map((returnItem, idx) => {
                            const oi = findOrderItem(returnItem);

                            const image =
                                oi?.productId?.images?.[0] ||
                                oi?.productId?.photos?.[0] ||
                                returnItem?.productId?.images?.[0] ||
                                returnItem?.productId?.photos?.[0] ||
                                null;

                            const productName =
                                returnItem?.fullName ||
                                oi?.productId?.fullName ||
                                oi?.productId?.name ||
                                returnItem?.productId?.fullName ||
                                returnItem?.productId?.name ||
                                '-';

                            const variantName = returnItem?.variantName || oi?.variantName || '-';
                            const sku = returnItem?.sku || oi?.sku || null;
                            const orderQty = oi?.quantity ?? '-';
                            const unitPrice = returnItem?.price ?? oi?.price ?? 0;
                            const discountVal = oi?.discount || 0;
                            const discountPercent = oi?.discountPercent || 0;
                            const returnQty = returnItem?.quantity || 0;
                            const returnTotal = returnQty * unitPrice;

                            return (
                                <TableRow
                                    key={returnItem._id || idx}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40 transition-colors"
                                >
                                    <TableCell className="px-4 py-3 align-top">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={productName}
                                                className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-slate-50"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-medium">
                                                N/A
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 align-top max-w-[200px]">
                                        <p className="text-sm font-semibold text-slate-800 whitespace-normal break-words leading-snug">
                                            {productName}
                                        </p>
                                        {sku && (
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {sku}</p>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 align-top">
                                        <span className="text-xs text-slate-600 font-mono capitalize">{variantName}</span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center align-top">
                                        <span className="text-sm font-bold text-slate-700">{orderQty}</span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-right align-top">
                                        <span className="text-sm text-slate-600 font-medium">&#x20B9;{unitPrice?.toLocaleString()}</span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-right align-top">
                                        {discountPercent > 0 ? (
                                            <span className="text-xs text-emerald-600 font-semibold">{discountPercent}% (-&#x20B9;{discountVal?.toLocaleString()})</span>
                                        ) : discountVal > 0 ? (
                                            <span className="text-xs text-emerald-600 font-semibold">-&#x20B9;{discountVal?.toLocaleString()}</span>
                                        ) : (
                                            <span className="text-xs text-slate-300">-</span>
                                        )}
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-center align-top border-l border-indigo-100 bg-indigo-50/20">
                                        <span className="text-sm font-extrabold text-indigo-700">{returnQty}</span>
                                    </TableCell>

                                    <TableCell className="px-4 py-3 text-right align-top bg-emerald-50/20">
                                        <span className="text-sm font-extrabold text-emerald-700">&#x20B9;{returnTotal?.toLocaleString()}</span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
                <div className="flex items-center gap-8 text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span>Return Items:</span>
                        <span className="font-bold text-slate-700">{returnItems.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span>Return Subtotal:</span>
                        <span className="font-extrabold text-emerald-700">&#x20B9;{returnSubtotal?.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
