import { Button } from '@/components/ui/button';
import React from 'react'

function VariantSelector({ variants, selectedVariant, setSelectedVariant }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700">Select Variant:</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(variants || {}).map(([variantName, stock]) => (
                    stock > 0 &&
                    <Button
                        key={variantName}
                        variant={variantName === selectedVariant ? "default" : "outline"}
                        onClick={() => setSelectedVariant(variantName)}
                        className={`rounded-full text-sm capitalize transition-all ${stock === 0
                            ? "relative text-muted-foreground/80 line-through"
                            : ""
                            }`}
                        disabled={stock === 0}
                    >
                        {variantName}
                    </Button>
                ))}
            </div>
        </div>
    );
}
export default VariantSelector