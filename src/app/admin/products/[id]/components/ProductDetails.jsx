import React, { useState, useMemo } from "react";
import ImageGallery from './ImageGallery'
import VariantSelector from './VariantSelector';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import ProductInfoBlock from "./ProductInfoBlock";

function ProductDetails({ product }) {
    const [selectedVariant, setSelectedVariant] = useState("");

    const { variantStock, displayPrice } = useMemo(() => {
        if (!product) return {};
        const stock = product.variants?.[selectedVariant] || 0;

        // Get last selling price
        const price = product.sellingPrice?.[product.sellingPrice?.length - 1]?.price || 0;

        return {
            variantStock: stock,
            displayPrice: price,
        };
    }, [product, selectedVariant]);

    const discountPercentage = useMemo(() => {
        if (product?.regularPrice && product.regularPrice > displayPrice) {
            return Math.round(((product.regularPrice - displayPrice) / product.regularPrice) * 100);
        }
        return 0;
    }, [product, displayPrice]);


    return (
        <div className="w-full mx-auto">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-4">
                {/* Image Gallery Section */}
                <div className="sm:sticky sm:top-4 sm:h-screen w-full sm:w-[40%]">
                    <ImageGallery
                        images={product?.images || []}
                        fullName={product?.fullName}
                    />
                </div>

                {/* Product Info Section */}
                <div className="space-y-3 flex-1">
                    <div className="pb-2 border-b">
                        <span className="text-sm text-muted-foreground">
                            {product?.category?.name || "Electronics"}
                        </span>
                        <h1 className="text-2xl md:text-2xl font-semibold text-gray-900 mt-1">
                            {product?.fullName}
                        </h1>
                    </div>

                    {/* Price Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div>
                                <span className="text-3xl font-bold text-gray-900">
                                    ₹{displayPrice.toLocaleString()}
                                </span>

                                {product?.regularPrice && product?.regularPrice > displayPrice && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg line-through text-gray-500">
                                            ₹{product?.regularPrice.toLocaleString()}
                                        </span>
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                                            {discountPercentage}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="ml-auto">
                                {product?.totalStock > 0 ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div className="flex flex-wrap gap-2">
                        {product?.variants && Object.entries(product.variants).length > 0 &&
                            Object.entries(product.variants).map(([key, value], idx) => (
                                <div key={idx} className="bg-white border border-black rounded p-3 text-sm flex gap-1">
                                    <strong>{key}:</strong>
                                    <p>{value}</p>
                                </div>
                            ))
                        }
                    </div>

                    {/* Key Features */}
                    {product?.descriptionPoints && product?.descriptionPoints.length > 0 && (
                        <Card className={''}>
                            <CardContent className="px-6">
                                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {product.descriptionPoints.map((point, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="bg-primary/10 p-1 rounded-full mr-3 mt-0.5">
                                                <Tag className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-gray-700">{point.replace(/["\\]/g, '')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Key Information Table */}
                    {product?.keyInformation && product?.keyInformation.length > 0 && (
                        <Card>
                            <CardContent className="">
                                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    {product?.keyInformation.map((info, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} p-4`}
                                        >
                                            <div className="w-1/3 font-medium text-gray-700">{info.title}</div>
                                            <div className="w-2/3 text-gray-600">{info.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Toggleable Product Details */}
                    <div className="transition-all ease-in-out duration-500">
                        <div className="p-0">
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out`}
                            >
                                <ProductInfoBlock
                                    description={product.description}
                                />

                                <Card className="mt-0">
                                    <CardContent>
                                        <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Category</div>
                                                <div className="font-medium">{product?.category?.name || "—"}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Variant</div>
                                                <div className="font-medium capitalize">{selectedVariant || "—"}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProductDetails
