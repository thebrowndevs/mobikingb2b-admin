import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

function ProductCard({ product, onAddItem, setAddedProducts }) {
    const regularEntries = Object.entries(product.variants || {}).filter(([_, qty]) => qty > 0);
    const scratchyEntries = Object.entries(product.scratchyVariants || {}).filter(([_, qty]) => qty > 0);

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

    const [selectedVariant, setSelectedVariant] = useState(options[0]?.value || '');
    const price = product?.sellingPrice?.slice(-1)[0]?.price || 0;

    const handleAddToCart = () => {
        const isScratchy = selectedVariant.endsWith('::scratchy');
        const variantName = isScratchy ? selectedVariant.replace('::scratchy', '') : selectedVariant;

        onAddItem({
            productId: product._id,
            variantName: options.length > 0 ? variantName : undefined,
            quantity: 1,
            price: price,
            isScratchy: isScratchy
        });
        setAddedProducts(prev => [...prev, product])
        // Reset variant selection after adding
        if (options.length > 0) setSelectedVariant('');
    };

    return (
        <Card className="h-full flex py-0 shadow-none rounded">
            <div className="p-3 pb-0">
                <div className="aspect-square w-full bg-gray-100 rounded-md overflow-hidden">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-md w-full h-full" />
                    )}
                </div>
            </div>

            <div className="p-3 flex-1 flex flex-col">
                {/* Title and price area */}
                <div className="flex-1">
                    <h3 className="font-medium text-xs line-clamp-4">{product.fullName}</h3>
                    <p className="text-primary font-bold mt-1">₹{price}</p>
                </div>

                {/* Bottom action button */}
                <div className="mt-auto">
                    {options.length > 0 ? (
                        <>
                            <div className="my-2">
                                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label} <Badge variant="outline" className={`ml-2 ${opt.isScratchy ? "bg-green-50 text-green-700 border-green-200" : ""}`}>{opt.qty} in stock</Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={handleAddToCart}
                                disabled={!selectedVariant}
                            >
                                Add to Cart
                            </Button>
                        </>
                    ) : (
                        <Button disabled size="sm" className="w-full">
                            Out of Stock
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default ProductCard