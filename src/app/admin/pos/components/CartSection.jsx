import React, { useState } from 'react'
import { FormField, FormItem, FormControl } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function CartSection({
    fields,
    addedProducts,
    sortedFieldsWithIndex,
    watch,
    control,
    setValue,
    remove
}) {
    // Mode dictionary: originalIndex -> 'percent' | 'flat'
    const [rowModes, setRowModes] = useState({})

    return (
        <div className="h-full bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col justify-start">
            <div className="flex justify-between items-center pb-1">
                <h2 className='font-bold text-base text-slate-800 uppercase tracking-wide'>POS Checkout Cart</h2>
                <span className="text-xs font-semibold text-slate-500">
                    {fields.length} product{fields.length !== 1 ? 's' : ''} added
                </span>
            </div>
            <Separator className="bg-slate-50" />

            {/* Scrollable Fixed Sized Cart Container rendering clubbed items */}
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-150 max-h-[560px] overflow-y-auto flex-1 bg-white">
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
                                            const discVal = watch(`items.${originalIndex}.discount`) || 0;
                                            const discPercent = watch(`items.${originalIndex}.discountPercent`) || 0;

                                            const baseSum = Number(prc) * Number(qty);
                                            const mode = rowModes[originalIndex] || 'percent'; // default is percent

                                            const itemTotal = mode === 'percent'
                                                ? baseSum * (1 - Number(discPercent) / 100)
                                                : Math.max(0, baseSum - Number(discVal));

                                            const isLowStock = qty > maxStock;

                                            const toggleMode = () => {
                                                const nextMode = mode === 'percent' ? 'flat' : 'percent'
                                                setRowModes(prev => ({
                                                    ...prev,
                                                    [originalIndex]: nextMode
                                                }))
                                            }

                                            return (
                                                <div key={field.id} className="space-y-2 pb-2.5 border-b border-slate-100/60 last:border-0 last:pb-0">
                                                    {/* Variant Row 1: variant name, total sum price, close button */}
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
                                                    <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100/80">
                                                        {/* Qty */}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[8.5px] text-slate-450 font-bold uppercase">Qty:</span>
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
                                                                                onChange={(e) => {
                                                                                    const nextQty = parseInt(e.target.value) || 1
                                                                                    field.onChange(nextQty)
                                                                                    // Re-calculate cross fields
                                                                                    const currentPrice = watch(`items.${originalIndex}.price`) || 0
                                                                                    const currentSum = currentPrice * nextQty
                                                                                    if (mode === 'percent') {
                                                                                        const currentPercent = watch(`items.${originalIndex}.discountPercent`) || 0
                                                                                        setValue(`items.${originalIndex}.discount`, currentSum * (currentPercent / 100))
                                                                                    } else {
                                                                                        const currentFlat = watch(`items.${originalIndex}.discount`) || 0
                                                                                        setValue(`items.${originalIndex}.discountPercent`, currentSum > 0 ? (currentFlat / currentSum) * 100 : 0)
                                                                                    }
                                                                                }}
                                                                                className="text-center font-extrabold h-7 w-11 border-slate-200 focus:border-slate-450 focus:ring-0 rounded-md text-xs p-0 bg-white"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        {/* Price */}
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-[8.5px] text-slate-450 font-bold uppercase">Price:</span>
                                                            <FormField
                                                                control={control}
                                                                name={`items.${originalIndex}.price`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                {...field}
                                                                                onChange={(e) => {
                                                                                    const nextPrice = parseFloat(e.target.value) || 0
                                                                                    field.onChange(nextPrice)
                                                                                    // Re-calculate cross fields
                                                                                    const currentQty = watch(`items.${originalIndex}.quantity`) || 0
                                                                                    const currentSum = nextPrice * currentQty
                                                                                    if (mode === 'percent') {
                                                                                        const currentPercent = watch(`items.${originalIndex}.discountPercent`) || 0
                                                                                        setValue(`items.${originalIndex}.discount`, currentSum * (currentPercent / 100))
                                                                                    } else {
                                                                                        const currentFlat = watch(`items.${originalIndex}.discount`) || 0
                                                                                        setValue(`items.${originalIndex}.discountPercent`, currentSum > 0 ? (currentFlat / currentSum) * 100 : 0)
                                                                                    }
                                                                                }}
                                                                                className="text-right font-bold h-7 w-18 border-slate-200 focus:border-slate-450 focus:ring-0 rounded-md text-xs p-1 bg-white"
                                                                            />
                                                                        </FormControl>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        {/* Discount Input & Toggle */}
                                                        <div className="flex items-center gap-1 flex-1">
                                                            <span className="text-[8.5px] text-slate-450 font-bold uppercase">Disc:</span>

                                                            <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-7">
                                                                {mode === 'percent' ? (
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
                                                                                        onChange={(e) => {
                                                                                            const valPercent = parseFloat(e.target.value) || 0
                                                                                            field.onChange(valPercent)
                                                                                            setValue(`items.${originalIndex}.discount`, baseSum * (valPercent / 100))
                                                                                        }}
                                                                                        className="text-center font-bold h-full w-10 border-0 focus:ring-0 rounded-none text-xs p-0"
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                ) : (
                                                                    <FormField
                                                                        control={control}
                                                                        name={`items.${originalIndex}.discount`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormControl>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min={0}
                                                                                        {...field}
                                                                                        onChange={(e) => {
                                                                                            const valFlat = parseFloat(e.target.value) || 0
                                                                                            field.onChange(valFlat)
                                                                                            setValue(`items.${originalIndex}.discountPercent`, baseSum > 0 ? (valFlat / baseSum) * 100 : 0)
                                                                                        }}
                                                                                        className="text-right font-bold h-full w-12 border-0 focus:ring-0 rounded-none text-xs p-1"
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    onClick={toggleMode}
                                                                    className="bg-slate-100 hover:bg-slate-200 border-l border-slate-200 text-[10px] font-black h-full px-1.5 flex items-center justify-center text-slate-600 transition-colors"
                                                                >
                                                                    {mode === 'percent' ? '%' : '₹'}
                                                                </button>
                                                            </div>
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
    )
}
