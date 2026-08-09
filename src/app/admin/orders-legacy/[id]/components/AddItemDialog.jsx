"use client"
import React, { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useProducts } from '@/hooks/useProducts'
import LoaderButton from '@/components/custom/LoaderButton'
import { useOrders } from '@/hooks/useOrders'

function AddItemDialog({ open, onOpenChange, orderId }) {
  const { productsQuery, availableProductsQuery } = useProducts()
  const allProducts = availableProductsQuery?.data || []
  const { addItemInOrder } = useOrders()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // console.log("allProducts", allProducts);
  const filtered = useMemo(() => {
    if (!debouncedSearchTerm) return allProducts;
    const term = debouncedSearchTerm.toLowerCase()
    return allProducts.filter(p =>
      (p.fullName || p.name).toLowerCase().includes(term)
    )
  }, [debouncedSearchTerm, allProducts])

  async function handleAddProduct() {
    const data = {
      orderId,
      productId: selectedProduct._id,
      variantName: selectedVariant,
    }

    try {
      await addItemInOrder.mutateAsync({ ...data })
      onOpenChange(false)
      setSearchTerm("")
      setSelectedProduct(null)
      setSelectedVariant('')
    } catch (error) {
      console.log(error)
    }
    console.log(data)

  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Add Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {availableProductsQuery?.isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse">Loading products data...</p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value)
                  setSelectedProduct(null)
                  setSelectedVariant("")
                }}
              />

              {/* Product List */}
              {filtered.length > 0 && !selectedProduct && (
                <div className="max-h-80 overflow-y-auto border rounded-md p-2">
                  {filtered.map(prod => (
                    <div
                      key={prod._id}
                      className="flex items-center space-x-4 p-2 hover:bg-muted cursor-pointer"
                      onClick={() => setSelectedProduct(prod)}
                    >
                      <img
                        src={prod.images?.[0]}
                        alt={prod.fullName}
                        className="h-12 w-12 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">{prod.fullName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                          Variants: {Object.keys(prod.variants || {}).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Variant Selector */}
              {selectedProduct && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Selected Product:</p>
                    <button
                      className="text-sm text-red-500 underline"
                      onClick={() => {
                        setSelectedProduct(null)
                        setSelectedVariant("")
                      }}
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedProduct.images?.[0]}
                      alt={selectedProduct.fullName}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium line-clamp-2 max-w-[350px] text-wrap">{selectedProduct.fullName}</p>
                      <label className="block text-sm text-gray-600 mt-1">Choose variant:</label>
                      <select
                        className="mt-1 w-full border rounded p-2"
                        value={selectedVariant}
                        onChange={e => setSelectedVariant(e.target.value)}
                      >
                        <option value="">-- select --</option>
                        {Object.keys(selectedProduct.variants || {}).map(v => (
                          <option key={v} value={v}>
                            {v} ({selectedProduct.variants[v]} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <LoaderButton
            onClick={() => handleAddProduct()}
            loading={addItemInOrder.isPending}
          >
            Add Item
          </LoaderButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddItemDialog
