'use client';

import React, { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Package, Search, Loader2, X } from 'lucide-react';
import api from '@/lib/api';

export default function SubCategoryProductsSheet({ open, onOpenChange, subCategory }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || !subCategory?._id) {
            setProducts([]);
            setSearchTerm('');
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        api.get(`/categories/subCategories/products/${subCategory._id}`)
            .then(res => {
                if (isMounted) {
                    setProducts(res.data?.data || []);
                }
            })
            .catch(err => {
                if (isMounted) {
                    setError(err?.response?.data?.message || 'Failed to fetch products');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [open, subCategory?._id]);

    const filteredProducts = products.filter(p => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return p?.fullName?.toLowerCase().includes(q) || p?.slug?.toLowerCase().includes(q);
    });

    const discountPercentage = (product) => {
        const displayPrice = product?.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;
        if (product?.regularPrice && product.regularPrice > displayPrice) {
            return Math.round(((product.regularPrice - displayPrice) / product.regularPrice) * 100);
        }
        return 0;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="sm:max-w-2xl w-full p-6 flex flex-col bg-white overflow-y-auto">
                <SheetHeader className="border-b pb-4">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <SheetTitle className="text-xl font-bold text-gray-800">
                            {subCategory?.name || 'Subcategory'} Products
                        </SheetTitle>
                    </div>
                    <SheetDescription className="text-xs text-gray-500">
                        {isLoading ? 'Loading products...' : `Total ${products.length} products associated with this subcategory`}
                    </SheetDescription>

                    {/* Search bar inside sheet */}
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Filter products by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-8 text-sm bg-gray-50 border-gray-200"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </SheetHeader>

                <div className="flex-1 py-4 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <span className="text-sm">Fetching products...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-rose-500 text-sm">
                            {error}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm italic">
                            No products found for this subcategory.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredProducts.map((product, idx) => {
                                const displayPrice = product?.sellingPrice?.[product.sellingPrice?.length - 1]?.price;
                                const discount = discountPercentage(product);

                                return (
                                    <div
                                        key={product._id || idx}
                                        className="flex gap-3 p-3 border rounded-xl items-start bg-white hover:shadow-md transition-shadow border-gray-200"
                                    >
                                        <img
                                            src={product?.images?.[0] || product?.photos?.[0] || '/not-found-img.webp'}
                                            alt={product?.fullName || 'Product'}
                                            className="w-14 h-14 object-cover rounded-lg shrink-0 border"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                                                {product?.fullName || 'Untitled Product'}
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900">
                                                    ₹{displayPrice ?? product?.regularPrice ?? '0'}
                                                </span>
                                                {product?.regularPrice && discount > 0 && (
                                                    <>
                                                        <span className="text-[11px] line-through text-gray-400">
                                                            ₹{product.regularPrice}
                                                        </span>
                                                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                                                            {discount}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <span className={`text-[11px] font-medium ${product?.totalStock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                                    {product?.totalStock > 0 ? `Stock: ${product.totalStock}` : "Out of Stock"}
                                                </span>

                                                <Badge className={`text-[9px] px-1.5 py-0.2 uppercase font-semibold ${product?.active !== false
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-gray-100 text-gray-600 border-gray-300'
                                                    }`}>
                                                    {product?.active !== false ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
