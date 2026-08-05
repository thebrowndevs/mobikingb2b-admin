'use client';

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, Minus, Plus, Search, RefreshCw, ShoppingCart, Calendar, User } from "lucide-react";
import { usePartialReturnRequests } from "@/hooks/usePartialReturnRequests";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

const PARTIAL_RETURN_REASONS = [
    "Defective / Damaged Item",
    "Received Wrong Variant or Model",
    "Item No Longer Needed",
    "Quality Not as Expected",
    "Other"
];

export default function PartialReturnCreateDialog({ open, onOpenChange, order: initialOrder }) {
    const [order, setOrder] = useState(initialOrder || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [quantities, setQuantities] = useState({});
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { raiseRequest } = usePartialReturnRequests();

    // Reset state on open/change
    useEffect(() => {
        if (open) {
            setOrder(initialOrder || null);
            setSearchQuery("");
            setSearchResults([]);
            setSelectedItems({});
            setQuantities({});
            setReason("");
            setOtherReason("");
        }
    }, [open, initialOrder]);

    // Setup initial items state when order is selected
    useEffect(() => {
        if (order?.items) {
            const initialItems = {};
            const initialQty = {};

            order.items.forEach((it, index) => {
                const key = it.index !== undefined ? it.index : (it._id || index);
                initialItems[key] = false;
                initialQty[key] = 1;
            });

            setSelectedItems(initialItems);
            setQuantities(initialQty);
        }
    }, [order]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            setSearching(true);
            setSearchResults([]);
            const query = searchQuery.trim();
            const isNumeric = /^\d+$/.test(query);
            const queryParam = isNumeric || query.toLowerCase().startsWith("mob") ? "order" : "customer";
            const res = await api.get("/orders/paginated", {
                params: { searchQuery: query, queryParameter: queryParam, limit: 10 }
            });
            const orders = res.data?.data?.orders || res.data?.orders || [];
            setSearchResults(orders);
            if (orders.length === 0) {
                toast.error("No matching orders found");
            }
        } catch (err) {
            console.error("Order search error:", err);
            toast.error("Failed to search orders");
        } finally {
            setSearching(false);
        }
    };

    const handleSelectOrder = async (selectedOrder) => {
        try {
            setSearching(true);
            // Fetch detailed order (to ensure we get all items populated)
            const res = await api.get(`/orders/details/${selectedOrder._id}`);
            const detailed = res.data?.data?.order || res.data?.order || selectedOrder;
            setOrder(detailed);
        } catch (err) {
            console.error("Fetch detailed order error:", err);
            setOrder(selectedOrder);
        } finally {
            setSearching(false);
        }
    };

    const toggleItemSelect = (key) => {
        setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleQtyChange = (key, maxQty, delta) => {
        setQuantities(prev => {
            const current = prev[key] || 1;
            const next = Math.max(1, Math.min(maxQty, current + delta));
            return { ...prev, [key]: next };
        });
    };

    const selectedKeys = Object.keys(selectedItems).filter(k => selectedItems[k]);
    const finalReason = reason === "Other" ? otherReason.trim() : reason;
    const canSubmit = selectedKeys.length > 0 && finalReason && (reason !== "Other" || otherReason.trim().length >= 3) && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit || !order) return;

        try {
            setSubmitting(true);

            const itemsToReturn = order.items
                .map((it, index) => {
                    const key = it.index !== undefined ? it.index : (it._id || index);
                    return { ...it, originalIndex: index, key };
                })
                .filter(it => selectedItems[it.key])
                .map(it => ({
                    _id: it._id,
                    productId: it.productId?._id || it.productId,
                    sku: it.sku,
                    fullName: it.fullName || it.productId?.fullName || "Item",
                    variantName: it.variantName,
                    quantity: quantities[it.key] || 1,
                    price: it.price,
                    index: it.index !== undefined ? it.index : it.originalIndex,
                    isScratchy: it.isScratchy
                }));

            const payload = {
                orderId: order._id,
                reason: finalReason,
                items: itemsToReturn
            };

            await raiseRequest.mutateAsync(payload);
            onOpenChange(false);
        } catch (err) {
            console.error("Raise partial return request error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-6 overflow-hidden bg-white rounded-lg shadow-xl border">
                <DialogHeader className="border-b pb-3 mb-2">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin-slow" /> Raise Partial Return Request
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500">
                        Raise a partial return request on behalf of a user.
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Search Order (if not pre-selected) */}
                {!order ? (
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden py-2">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Enter Order ID or phone number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-9 text-sm border-gray-200"
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={searching} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 h-10">
                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                            </Button>
                        </div>

                        {/* Search Results */}
                        <div className="flex-1 overflow-y-auto border rounded-lg divide-y bg-gray-50 max-h-[300px]">
                            {searching ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                                    <span className="text-xs">Searching orders...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((o) => (
                                    <div
                                        key={o._id}
                                        onClick={() => handleSelectOrder(o)}
                                        className="p-3 hover:bg-indigo-50/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <p className="font-semibold text-indigo-900 font-mono">{o.orderId}</p>
                                            <p className="text-gray-500 mt-0.5 flex items-center gap-1">
                                                <User className="w-3.5 h-3.5" /> {o.name || o.email || "Guest Customer"} ({o.phoneNo || "N/A"})
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" /> {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{o.orderAmount || o.totalAmount}</p>
                                            <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold">
                                                {o.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                                    <span className="text-xs">Search for an order to start returning items</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Step 2: Select Items and Reason
                    <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1 max-h-[60vh]">
                        {/* Selected Order Overview */}
                        <div className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-lg flex items-center justify-between text-xs mb-3">
                            <div>
                                <p className="font-bold text-indigo-900">Order: <span className="font-mono">{order.orderId}</span></p>
                                <p className="text-gray-600 mt-0.5">Customer: {order.name || order.phoneNo}</p>
                            </div>
                            {!initialOrder && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setOrder(null)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                    Change Order
                                </Button>
                            )}
                        </div>

                        {/* Items Checklist */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Order Items</label>
                            {order.items?.map((it, index) => {
                                const key = it.index !== undefined ? it.index : (it._id || index);
                                const isAlreadyReturned = it.isReturned || (it.returnStatus && it.returnStatus !== "Rejected");
                                const isChecked = Boolean(selectedItems[key]);
                                const currentQty = quantities[key] || 1;

                                return (
                                    <div
                                        key={key}
                                        className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-colors ${isAlreadyReturned
                                                ? "bg-gray-50 opacity-60 cursor-not-allowed border-gray-200"
                                                : isChecked
                                                    ? "border-indigo-600 bg-indigo-50/20"
                                                    : "bg-white border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            id={`item-${key}`}
                                            checked={isChecked}
                                            disabled={isAlreadyReturned}
                                            onChange={() => toggleItemSelect(key)}
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 accent-indigo-600 cursor-pointer disabled:cursor-not-allowed"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <label htmlFor={`item-${key}`} className={`font-medium text-gray-900 cursor-pointer block truncate ${isAlreadyReturned ? "cursor-not-allowed text-gray-500" : ""}`}>
                                                {it.fullName || it.productId?.fullName || "Product Item"}
                                            </label>

                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                                                {it.variantName && <span>Variant: <span className="capitalize text-gray-700 font-medium">{it.variantName}</span></span>}
                                                <span>Qty: <span className="text-gray-700 font-medium">{it.quantity}</span></span>
                                                <span>Price: <span className="text-gray-700 font-medium">₹{it.price}</span></span>
                                            </div>

                                            {isAlreadyReturned && (
                                                <Badge className="mt-2 text-[10px] bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 animate-none">
                                                    {it.returnStatus || "Requested"}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Quantity Counter for selected items */}
                                        {isChecked && !isAlreadyReturned && (
                                            <div className="flex items-center border rounded bg-white shrink-0 shadow-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(key, it.quantity, -1)}
                                                    disabled={currentQty <= 1}
                                                    className="p-1 hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>

                                                <span className="px-2 py-0.5 text-xs font-bold min-w-[20px] text-center text-gray-700">
                                                    {currentQty}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => handleQtyChange(key, it.quantity, 1)}
                                                    disabled={currentQty >= it.quantity}
                                                    className="p-1 hover:bg-gray-100 disabled:opacity-30 text-gray-500"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-3 border-t pt-3">
                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wide">Reason for Return</label>
                            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2.5">
                                {PARTIAL_RETURN_REASONS.map((r) => (
                                    <div key={r} className="flex items-center gap-2.5">
                                        <RadioGroupItem value={r} id={`reason-${r}`} className="text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                                        <label htmlFor={`reason-${r}`} className="text-sm cursor-pointer font-medium text-gray-700">
                                            {r}
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {reason === "Other" && (
                                <Input
                                    placeholder="Specify your return reason..."
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    className="mt-2 text-sm border-gray-200 focus:border-indigo-500"
                                />
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="border-t pt-3 mt-4 flex items-center gap-2 justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs px-4 h-9">
                        Cancel
                    </Button>
                    {order && (
                        <Button
                            onClick={handleSubmit}
                            disabled={!canSubmit || submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 h-9 font-semibold"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Submit Return
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
