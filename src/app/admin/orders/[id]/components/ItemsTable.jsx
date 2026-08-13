'use client'
import React, { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrders } from "@/hooks/useOrders"
import api from "@/lib/api"
import { Edit, Trash, Plus, Minus, Search, Check, X, Loader2, RefreshCw } from "lucide-react"
import { toast } from "react-hot-toast"

const calculateB2BItemPrice = (product, quantity) => {
    if (!product.sellingPrice) return 0;
    if (product.sellingPrice.type === "fixed") {
        if (product.sellingPrice.slabs && product.sellingPrice.slabs.length > 0) {
            return product.sellingPrice.slabs[0].price;
        }
        return product.basePrice || 0;
    }

    const slabs = product.sellingPrice.slabs || [];
    if (slabs.length === 0) return product.basePrice || 0;

    const sortedSlabs = [...slabs].sort((a, b) => a.quantity - b.quantity);

    let matchedPrice = sortedSlabs[0].price;
    for (const slab of sortedSlabs) {
        if (quantity >= slab.quantity) {
            matchedPrice = slab.price;
        } else {
            break;
        }
    }
    return matchedPrice;
};

function ItemsTable({ order, isNewOrder, canEdit, isAdmin }) {
    const { updateOrder, updateOrderItems } = useOrders()
    const [isEditing, setIsEditing] = useState(false)
    const [editItems, setEditItems] = useState([])
    const [editDiscount, setEditDiscount] = useState(0)
    const [editDiscountPercent, setEditDiscountPercent] = useState(0)
    const [discountMode, setDiscountMode] = useState('flat')
    const [editDeliveryCharge, setEditDeliveryCharge] = useState(0)

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

    // Product search inside editor
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState("")
    const [addQuantity, setAddQuantity] = useState(1)

    // Initialize edit states
    useEffect(() => {
        if (isEditing && order) {
            setEditItems((order.items || []).map(it => ({
                productId: it.productId?._id || it.productId,
                variantId: it.variantId?._id || it.variantId,
                name: it.productId?.fullName || it.productId?.name || it.name,
                variantName: it.variantName,
                quantity: it.quantity,
                price: it.price || 0,
                discount: it.discount || 0,
                discountPercent: it.discountPercent || 0,
                discountType: it.discountType || (it.discountPercent > 0 && it.discount === 0 ? 'percentage' : 'flat'),
                discountMode: it.discountType === 'percentage' || (!it.discountType && it.discountPercent > 0) ? 'percent' : 'flat',
                images: it.productId?.images || it.images || []
            })))
            setEditDiscount(order.discount || 0)
            setEditDiscountPercent(order.discountPercent || 0)
            setDiscountMode(order.discountType === 'percentage' || (!order.discountType && order.discountPercent > 0) ? 'percent' : 'flat')
            setEditDeliveryCharge(order.deliveryCharge || 0)
        }
    }, [isEditing, order])

    const canEditOrderItems = () => {
        if (!isAdmin) return false;
        if (order?.shippingType === 'Manual') {
            return !['Shipped', 'Delivered', 'Cancelled', 'Rejected', 'Returned'].includes(order?.status);
        } else {
            return (
                !order?.awbCode &&
                !order?.shipmentId &&
                !order?.pickupScheduled &&
                !order?.courierName &&
                !['Shipped', 'Delivered', 'Cancelled', 'Rejected', 'Returned'].includes(order?.status)
            );
        }
    }

    const handleSearch = async (val) => {
        setSearchQuery(val)
        if (val.trim().length < 2) {
            setSearchResults([])
            return
        }
        setSearching(true)
        try {
            const res = await api.get(`/products/all/search?q=${val}`)
            setSearchResults(res.data?.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setSearching(false)
        }
    }

    const selectProduct = async (prod) => {
        setSearching(true)
        try {
            const res = await api.get(`/products/${prod._id}`)
            const fullProd = res.data?.data
            setSelectedProduct(fullProd)
            setSearchResults([])
            setSearchQuery("")

            // Default variant selection
            if (fullProd?.variants) {
                const keys = Object.keys(fullProd.variants)
                if (keys.length > 0) {
                    setSelectedVariant(keys[0])
                } else {
                    setSelectedVariant("")
                }
            } else {
                setSelectedVariant("")
            }
        } catch (err) {
            console.error(err)
            toast.error("Failed to load product details.")
        } finally {
            setSearching(false)
        }
    }

    const handleAddItem = () => {
        if (!selectedProduct) return

        const qty = Math.floor(Number(addQuantity || 1))
        if (qty <= 0) {
            toast.error("Quantity must be at least 1.")
            return
        }

        const variantName = selectedVariant || ""

        // Check if item already exists in edit list
        const exists = editItems.find(
            it => it.productId === selectedProduct._id && it.variantName === variantName
        )
        if (exists) {
            toast.error("This product/variant is already in the list. Please adjust its quantity below.")
            return
        }

        // Fetch price based on slab logic
        const basePrice = calculateB2BItemPrice(selectedProduct, qty)

        const newItem = {
            productId: selectedProduct._id,
            name: selectedProduct.fullName || selectedProduct.name,
            variantName,
            quantity: qty,
            price: basePrice,
            discount: 0,
            discountPercent: 0,
            discountMode: 'flat',
            images: selectedProduct.images || []
        }

        setEditItems([...editItems, newItem])
        setSelectedProduct(null)
        setSelectedVariant("")
        setAddQuantity(1)
        toast.success("Product added to list.")
    }

    const updateItemQty = (index, val) => {
        const newItems = [...editItems]
        newItems[index].quantity = val === "" ? "" : Math.max(1, parseInt(val) || 1)
        setEditItems(newItems)
    }

    const updateItemDiscount = (index, mode, val) => {
        const newItems = [...editItems]
        newItems[index].discountMode = mode
        if (mode === 'percent') {
            const valPercent = val === "" ? "" : parseFloat(val) || 0
            newItems[index].discountPercent = valPercent
            const basePrice = newItems[index].price
            newItems[index].discount = valPercent > 0 ? parseFloat((basePrice * (valPercent / 100)).toFixed(2)) : 0
        } else {
            const valFlat = val === "" ? "" : parseFloat(val) || 0
            newItems[index].discount = valFlat
            const basePrice = newItems[index].price
            newItems[index].discountPercent = basePrice > 0 ? parseFloat(((valFlat / basePrice) * 100).toFixed(2)) : 0
        }
        setEditItems(newItems)
    }

    const removeItem = (index) => {
        const newItems = [...editItems]
        newItems.splice(index, 1)
        setEditItems(newItems)
    }

    const localTotals = () => {
        let subtotal = 0;
        const itemsList = isEditing ? editItems : (order?.items || []);
        itemsList.forEach((it, idx) => {
            const qty = (editingQtyIndex === idx) ? (parseFloat(tempQty) || 0) : (parseFloat(it.quantity) || 0);
            const price = parseFloat(it.price) || 0;
            subtotal += qty * (price - (parseFloat(it.discount) || 0));
        });

        const subtotalFixed = parseFloat(subtotal.toFixed(2));

        let flatDiscount = 0;
        let percentDiscount = 0;

        if (editingDiscount) {
            // User is actively editing discount — use temp values directly
            flatDiscount = parseFloat(tempDiscount) || 0;
            percentDiscount = parseFloat(tempDiscountPercent) || 0;
            // Live-derive the companion value based on which mode is active
            if (tempDiscountMode === 'percent') {
                flatDiscount = parseFloat(((subtotalFixed * percentDiscount) / 100).toFixed(2));
            } else {
                percentDiscount = subtotalFixed > 0 ? parseFloat(((flatDiscount / subtotalFixed) * 100).toFixed(2)) : 0;
            }
        } else {
            // Not editing discount — resolve from saved order or editDiscount state
            flatDiscount = isEditing ? (parseFloat(editDiscount) || 0) : (order?.discount || 0);
            percentDiscount = isEditing ? (parseFloat(editDiscountPercent) || 0) : (order?.discountPercent || 0);

            // Resolve the saved discount type — flat anchors the flat amount, percentage anchors the %
            const savedDiscountType = isEditing
                ? (discountMode === 'percent' ? 'percentage' : 'flat')
                : (order?.discountType || (order?.discountPercent > 0 && order?.discount === 0 ? 'percentage' : 'flat'));

            if (savedDiscountType === 'percentage') {
                // Percentage is the anchor — flat amount must follow the new subtotal
                flatDiscount = parseFloat(((subtotalFixed * percentDiscount) / 100).toFixed(2));
            } else {
                // Flat is the anchor — keep flatDiscount constant, only update percent display
                percentDiscount = subtotalFixed > 0 ? parseFloat(((flatDiscount / subtotalFixed) * 100).toFixed(2)) : 0;
            }
        }

        const delCharge = isEditing ? (parseFloat(editDeliveryCharge) || 0) : (order?.deliveryCharge || 0);
        const totalAmount = parseFloat((Math.max(0, subtotalFixed - flatDiscount) + delCharge).toFixed(2));

        return {
            subtotal: subtotalFixed,
            discount: flatDiscount,
            discountPercent: percentDiscount,
            deliveryCharge: delCharge,
            orderAmount: totalAmount
        };
    }

    const totals = (isEditing || editingDiscount || editingQtyIndex !== null) ? localTotals() : {
        subtotal: order?.subtotal || 0,
        discount: order?.discount || 0,
        discountPercent: order?.discountPercent || 0,
        deliveryCharge: order?.deliveryCharge || 0,
        orderAmount: order?.orderAmount || 0
    }

    const handleSaveInlineQty = (idx) => {
        const parsed = parseInt(tempQty);
        if (isNaN(parsed) || parsed <= 0) {
            toast.error("Please enter a valid quantity.");
            return;
        }
        const originalItem = order.items[idx];
        if (originalItem.quantity === parsed) {
            setEditingQtyIndex(null);
            return;
        }

        const updatedItemsList = (order.items || []).map((it, i) => {
            const isTarget = i === idx;
            return {
                productId: it.productId?._id || it.productId,
                variantId: it.variantId?._id || it.variantId,
                variantName: it.variantName,
                quantity: isTarget ? parsed : it.quantity,
                price: it.price || 0,
                discount: it.discount || 0,
                discountPercent: it.discountPercent || 0,
                discountType: it.discountType || (it.discountPercent > 0 && it.discount === 0 ? 'percentage' : 'flat')
            };
        });

        updateOrderItems.mutate({ data: { items: updatedItemsList, discountType: order?.discountType || 'flat' }, id: order._id }, {
            onSuccess: () => {
                setEditingQtyIndex(null);
            }
        });
    }

    const handleSaveChanges = () => {
        const payload = {
            items: editItems.map(it => ({
                productId: it.productId,
                variantId: it.variantId,
                variantName: it.variantName,
                quantity: Number(it.quantity),
                price: Number(it.price),
                discount: Number(it.discount || 0),
                discountPercent: Number(it.discountPercent || 0),
                discountType: it.discountType || (it.discountMode === 'percent' ? 'percentage' : 'flat')
            })),
            discountType: order?.discountType || 'flat'
        }

        updateOrderItems.mutate({ data: payload, id: order._id }, {
            onSuccess: () => {
                setIsEditing(false)
            }
        })
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between w-full pb-1 border-b border-slate-100">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Items & Charges</h2>
                    <p className="text-xs text-slate-400">Manage products, quantities, discounts, and shipping charges.</p>
                </div>
                {canEditOrderItems() && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    size="sm"
                                    onClick={handleSaveChanges}
                                    disabled={updateOrder.isPending}
                                    className="bg-slate-900 hover:bg-slate-800 text-white gap-1 text-xs"
                                >
                                    {updateOrder.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                    Save Changes
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsEditing(false)}
                                    className="gap-1 text-xs text-slate-500 border-slate-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsEditing(true)}
                                className="gap-1.5 text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
                            >
                                <Edit className="w-3.5 h-3.5" />
                                Edit Items
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Product Search (Editing Mode Only) */}
            {isEditing && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New Product</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        {/* Search Input */}
                        <div className="md:col-span-6 relative">
                            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Search Product</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <Input
                                    placeholder="Type brand, model, or product name..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9 h-9 text-xs border-slate-200"
                                />
                                {searching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-2.5" />}
                            </div>

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {searchResults.map((prod) => (
                                        <div
                                            key={prod._id}
                                            onClick={() => selectProduct(prod)}
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between border-b border-slate-100 last:border-0"
                                        >
                                            <span className="font-semibold text-slate-700">{prod.fullName || prod.name}</span>
                                            <span className="text-slate-400 font-mono text-[10px]">₹{prod.basePrice}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* selected Product Detail Block */}
                        {selectedProduct && (
                            <>
                                {/* Variant Selection */}
                                <div className="md:col-span-3">
                                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Select Variant</label>
                                    {selectedProduct.variants ? (
                                        <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                                            <SelectTrigger className="h-9 text-xs border-slate-200 bg-white">
                                                <SelectValue placeholder="Variant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(selectedProduct.variants).map((key) => (
                                                    <SelectItem key={key} value={key} className="text-xs">
                                                        {key} (Stock: {selectedProduct.variants[key] || 0})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-xs text-slate-400 py-2">No variants available</div>
                                    )}
                                </div>

                                {/* Quantity Input */}
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Quantity</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={addQuantity}
                                        onChange={(e) => setAddQuantity(e.target.value)}
                                        className="h-9 text-center text-xs border-slate-200 bg-white"
                                    />
                                </div>

                                {/* Add Button */}
                                <div className="md:col-span-1">
                                    <Button
                                        onClick={handleAddItem}
                                        className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Image</TableHead>
                            <TableHead className="font-semibold text-slate-700">Product</TableHead>
                            <TableHead className="font-semibold text-slate-700">Variant</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-center w-28">Qty</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Selling Price</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right w-44">Discount</TableHead>
                            <TableHead className="font-semibold text-slate-700 text-right">Total Price</TableHead>
                            {isEditing && <TableHead className="w-10"></TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(isEditing ? editItems : order?.items || []).map((item, idx) => {
                            const product = item?.productId
                            const image = product?.images?.[0] || item?.images?.[0]
                            const name = product?.fullName || product?.name || item?.name
                            const variant = item?.variantName
                            const quantity = editingQtyIndex === idx ? (parseFloat(tempQty) || 0) : item?.quantity
                            const sellingPrice = item?.price
                            const discountVal = item?.discount || 0
                            const discountPercent = item?.discountPercent || 0
                            const totalPrice = (parseFloat(item.price || 0) - parseFloat(item.discount || 0)) * (parseFloat(quantity) || 0)

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

                                    {/* Qty Cell */}
                                    <TableCell className="text-center">
                                        {editingQtyIndex === idx ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <Input
                                                    type="number"
                                                    min={1}
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
                                                <span className="font-bold text-slate-800">{quantity}</span>
                                                {!isEditing && canEditOrderItems() && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingQtyIndex(idx);
                                                            setTempQty(quantity);
                                                        }}
                                                        className="w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Selling Price Cell */}
                                    <TableCell className="text-right text-slate-600 font-medium">
                                        {isEditing ? (
                                            <Input
                                                type="number"
                                                min={0}
                                                value={item.price ?? ""}
                                                onChange={(e) => {
                                                    const newItems = [...editItems];
                                                    newItems[idx].price = e.target.value === "" ? "" : parseFloat(e.target.value) || 0;
                                                    setEditItems(newItems);
                                                }}
                                                className="w-24 h-8 text-right text-xs font-bold border-slate-200 ml-auto"
                                            />
                                        ) : (
                                            <span>₹{(item.price || 0).toLocaleString()}</span>
                                        )}
                                    </TableCell>

                                    {/* Discount Cell */}
                                    <TableCell className="text-right">
                                        {isEditing ? (
                                            <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-8 w-32 ml-auto">
                                                {item.discountMode === 'percent' ? (
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={item.discountPercent ?? ""}
                                                        onChange={(e) => updateItemDiscount(idx, 'percent', e.target.value)}
                                                        className="text-center font-bold h-full w-20 border-0 focus:ring-0 rounded-none text-xs p-0 bg-white"
                                                    />
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={item.discount ?? ""}
                                                        onChange={(e) => updateItemDiscount(idx, 'flat', e.target.value)}
                                                        className="text-right font-bold h-full w-20 border-0 focus:ring-0 rounded-none text-xs p-1 bg-white"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => updateItemDiscount(idx, item.discountMode === 'percent' ? 'flat' : 'percent', item.discountMode === 'percent' ? item.discount : item.discountPercent)}
                                                    className="bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-[10px] font-black h-full w-12 flex items-center justify-center text-slate-600 transition-colors"
                                                >
                                                    {item.discountMode === 'percent' ? '%' : '₹'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end text-emerald-600 font-semibold">
                                                {discountVal > 0 ? (
                                                    <>
                                                        <span>-₹{discountVal.toLocaleString()}</span>
                                                        {discountPercent > 0 && (
                                                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">({discountPercent}%)</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Total Price Cell */}
                                    <TableCell className="text-right font-bold text-slate-800">
                                        ₹{totalPrice?.toLocaleString()}
                                    </TableCell>

                                    {/* Delete Action (Editing Only) */}
                                    {isEditing && (
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(idx)}
                                                className="w-8 h-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pricing Summary */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
                <div className="w-full sm:w-80 space-y-3 text-sm">
                    {/* Subtotal */}
                    <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Subtotal</span>
                        <span>₹{totals.subtotal?.toLocaleString()}</span>
                    </div>

                    {/* Global Discount */}
                    <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>Global Discount:</span>
                        {isEditing ? (
                            <span className="font-bold text-slate-700">
                                {order?.discount > 0 ? `-${order?.discountPercent > 0 ? `(${order.discountPercent}%) ` : ''}₹${order?.discount?.toLocaleString()}` : '—'}
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
                                                            setTempDiscount(parseFloat(((totals.subtotal * valPercent) / 100).toFixed(2)));
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
                                                            setTempDiscountPercent(totals.subtotal > 0 ? parseFloat(((valFlat / totals.subtotal) * 100).toFixed(2)) : 0);
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
                                            onClick={() => {
                                                const calculatedOrderAmount = parseFloat((Math.max(0, (order?.subtotal || 0) - Number(tempDiscount || 0)) + (order?.deliveryCharge || 0)).toFixed(2));
                                                updateOrder.mutate({
                                                    data: {
                                                        discount: Number(tempDiscount || 0),
                                                        discountPercent: Number(tempDiscountPercent || 0),
                                                        discountType: tempDiscountMode === 'percent' ? 'percentage' : 'flat',
                                                        orderAmount: calculatedOrderAmount
                                                    },
                                                    id: order._id
                                                }, {
                                                    onSuccess: () => setEditingDiscount(false)
                                                });
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
                                        <span className={order?.discount > 0 ? "text-emerald-600 font-bold" : "font-bold text-slate-700"}>
                                            {order?.discount > 0 ? `-${order?.discountPercent > 0 ? `(${order.discountPercent}%) ` : ''}₹${order?.discount?.toLocaleString()}` : '—'}
                                        </span>
                                        {canEditOrderItems() && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingDiscount(true);
                                                    setTempDiscount(order?.discount || 0);
                                                    setTempDiscountPercent(order?.discountPercent || 0);
                                                    setTempDiscountMode(order?.discountType === 'percentage' ? 'percent' : 'flat');
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

                    {/* Delivery Charge */}
                    <div className="flex justify-between items-center text-slate-500 font-semibold">
                        <span>Delivery Charge:</span>
                        {isEditing ? (
                            <span className="font-bold text-slate-700">₹{totals.deliveryCharge?.toLocaleString()}</span>
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
                                            onClick={() => {
                                                updateOrder.mutate({ data: { deliveryCharge: Number(tempDelCharge || 0) }, id: order._id }, {
                                                    onSuccess: () => setEditingDelCharge(false)
                                                });
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
                                        <span className="font-bold text-slate-700">₹{totals.deliveryCharge?.toLocaleString()}</span>
                                        {canEditOrderItems() && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingDelCharge(true);
                                                    setTempDelCharge(order?.deliveryCharge || 0);
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

                    {/* Total Amount */}
                    <div className="flex justify-between text-slate-800 font-bold text-base pt-2 border-t border-slate-100">
                        <span>Total Amount</span>
                        <span>₹{totals.orderAmount?.toLocaleString()}</span>
                    </div>

                    {/* Amount Paid */}
                    {!isEditing && order?.amountPaid > 0 && (
                        <div className="flex justify-between text-slate-500 font-semibold text-xs pt-1">
                            <span>Amount Paid</span>
                            <span>₹{order?.amountPaid?.toLocaleString()}</span>
                        </div>
                    )}

                    {/* Remaining Balance */}
                    {!isEditing && order?.remainingAmount > 0 && (
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
