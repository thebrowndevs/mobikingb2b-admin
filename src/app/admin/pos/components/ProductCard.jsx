import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export function getSlabPrice(product, totalQty = 1) {
    const slabs = product?.sellingPrice?.slabs || [];
    if (slabs.length === 0) {
        const base = product?.sellingPrice?.price || product?.basePrice || 0;
        return Number(base);
    }
    // Sort descending by quantity threshold
    const sorted = [...slabs].sort((a, b) => b.quantity - a.quantity);
    let activeSlab = slabs[0];
    for (const slab of sorted) {
        if (totalQty >= slab.quantity) {
            activeSlab = slab;
            break;
        }
    }
    return Number(activeSlab.price);
}

function ProductCard({ product, onAddItem, setAddedProducts, cartItems = [] }) {
    const regularEntries = Array.isArray(product.variants)
        ? product.variants.filter(v => v && v.availableStock > 0).map(v => [v.name, v.availableStock])
        : [];

    const scratchyEntries = product.scratchyVariants
        ? Object.entries(
            product.scratchyVariants instanceof Map
                ? Object.fromEntries(product.scratchyVariants)
                : product.scratchyVariants
        ).filter(([_, qty]) => qty > 0)
        : [];

    const options = [
        ...regularEntries.map(([key, qty]) => ({
            value: key,
            label: `${key} (Regular)`,
            qty,
            isScratchy: false
        })),
        ...scratchyEntries.map(([key, qty]) => ({
            value: `${key}::scratchy`,
            label: `${key} (Scratchy)`,
            qty,
            isScratchy: true
        }))
    ];

    // Filter out options that are already in the cart
    const isAlreadyInCart = (varName) => {
        return cartItems?.some(item => item.productId === product._id && item.variantName === varName);
    };
    const availableOptions = options.filter(opt => {
        const nameClean = opt.isScratchy ? opt.value.replace('::scratchy', '') : opt.value;
        return !isAlreadyInCart(nameClean);
    });

    const [selectedVariant, setSelectedVariant] = useState(availableOptions[0]?.value || '');

    // Default base price (qty = 1)
    const price = getSlabPrice(product, 1);

    const handleAddToCart = () => {
        const activeOption = selectedVariant || availableOptions[0]?.value;
        if (!activeOption) return;

        const isScratchy = activeOption.endsWith('::scratchy');
        const variantName = isScratchy ? activeOption.replace('::scratchy', '') : activeOption;
        const matchedOpt = options.find(o => o.value === activeOption);

        onAddItem({
            productId: product._id,
            variantName: options.length > 0 ? variantName : undefined,
            quantity: 1,
            price: price,
            discountPercent: 0,
            isScratchy: isScratchy,
            maxStock: matchedOpt ? matchedOpt.qty : 0
        });
        setAddedProducts(prev => [...prev, product])
        setSelectedVariant('');
    };

    const slabs = product?.sellingPrice?.slabs || [];

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-2 hover:shadow-md transition-all duration-200 flex flex-col justify-between max-h-[395px]">
            <div className="space-y-1 flex flex-col justify-between">
                <div>
                    {/* Image block */}
                    <div className="h-32 w-full bg-slate-50 rounded-lg overflow-hidden border border-slate-100 relative flex-shrink-0 flex items-center justify-center">
                        {product.images?.[0] ? (
                            <img
                                src={product.images[0]}
                                alt={product.fullName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="bg-slate-100 border border-slate-200 rounded-lg w-full h-full" />
                        )}
                    </div>

                    {/* Title & default unit price */}
                    <div className="mt-2">
                        <h3 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-2" title={product.fullName}>
                            {product.fullName}
                        </h3>
                        {/* <p className="text-slate-900 font-extrabold text-[13px] mt-1">₹{price?.toLocaleString()}</p> */}
                    </div>
                </div>

                {/* Slabs vertical list layout matching website design for high contrast visibility */}
                {slabs.length > 0 && (
                    <div className="bg-slate-55/40 border border-slate-200/50 rounded-lg mt- flex flex-col gap-1.5 flex-shrink-0 bg-yellow-50 p-1">
                        {/* <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Wholesale Pricing Slabs:</span> */}
                        <div className="flex flex-col gap-1">
                            {slabs.slice(0, 3).map((slab, index) => {
                                const minQty = slab.quantity;
                                const nextSlab = slabs[index + 1];
                                const rangeLabel = nextSlab ? `${minQty} to ${nextSlab.quantity - 1} units` : `≥${minQty} units`;
                                return (
                                    <div key={index} className="flex justify-between items-center text-[10px] text-slate-600 font-semibold border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                        <span className="text-slate-800 text-[9px]">{rangeLabel}</span>
                                        <span className="font-extrabold text-slate-900">₹{slab.price}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Selection actions area */}
            <div className="mt-3.5 space-y-2 flex-shrink-0">
                {availableOptions.length > 0 ? (
                    <>
                        <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                            <SelectTrigger className="w-full border-slate-200 h-8 text-[11px] rounded-lg">
                                <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent className="text-[11px]">
                                {availableOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                                        {opt.label} <Badge variant="outline" className={`ml-1 text-[8px] px-1 py-0 font-bold ${opt.isScratchy ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}>{opt.qty} in stock</Badge>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            size="sm"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-8 text-xs shadow-xs rounded-lg"
                            onClick={handleAddToCart}
                            disabled={!selectedVariant}
                        >
                            Add to Cart
                        </Button>
                    </>
                ) : (
                    <Button disabled size="sm" className="w-full bg-slate-100 text-slate-400 text-xs h-8 rounded-lg">
                        {options.length > 0 ? "All variants added" : "Out of Stock"}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ProductCard