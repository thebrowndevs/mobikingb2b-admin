import React, { useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function OrderItemRow({ index, allProducts, onRemove }) {
    const { control, getValues, setValue } = useFormContext()
    const productId = useWatch({ control, name: `items.${index}.productId` })
    const quantity = useWatch({ control, name: `items.${index}.quantity` })

    const selected = allProducts.find((p) => p._id === productId)
    const variants = selected ? Object.entries(selected.variants || {}) : []
    const price = selected?.sellingPrice?.slice(-1)[0]?.price || 0

    const total = (quantity || 0) * price

    // reset variant when product changes
    useEffect(() => {
        const cur = getValues(`items.${index}.variantName`)
        const hasKey = variants.some(([key]) => key === cur)
        if (cur && !hasKey) setValue(`items.${index}.variantName`, '')
    }, [productId, variants, getValues, setValue, index])

    // sync price
    useEffect(() => {
        if (getValues(`items.${index}.price`) !== price) {
            setValue(`items.${index}.price`, price)
        }
    }, [quantity, productId, price, getValues, setValue, index])

    return (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full p-2 border-b">
            <div className="w-12 h-12 flex-shrink-0 self-start sm:self-auto">
                {selected?.images?.[0] ? (
                    <img
                        src={selected.images[0]}
                        alt={selected.fullName}
                        className="w-full h-full object-cover rounded-md"
                    />
                ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-md w-full h-full" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate max-w-[300px] text-wrap">
                    {selected?.fullName || 'Product not selected'}
                </p>
                {selected?.variants && (
                    <p className="text-xs text-gray-500 truncate">
                        {getValues(`items.${index}.variantName`) || 'No variant selected'}
                    </p>
                )}
            </div>

            <FormField
                control={control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                    <FormItem className="w-full sm:w-20">
                        <FormControl>
                            <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                className="text-center"
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className="w-full sm:w-20 text-right font-medium">₹{price}</div>
            <div className="w-full sm:w-20 text-right font-bold">₹{total}</div>

            <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 self-end sm:self-auto"
            >
                &times;
            </Button>
        </div>

    )
}

export default OrderItemRow