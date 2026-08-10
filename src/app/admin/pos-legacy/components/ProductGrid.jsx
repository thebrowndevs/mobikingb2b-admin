import React from 'react'
import ProductCard from './ProductCard';
import Loader from '@/components/Loader';

function ProductGrid({ loading, allProducts, onAddItem, setAddedProducts }) {
    // console.log(loading)
    if (loading) return <Loader />
    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1">
                {allProducts.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onAddItem={onAddItem}
                        setAddedProducts={setAddedProducts}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProductGrid