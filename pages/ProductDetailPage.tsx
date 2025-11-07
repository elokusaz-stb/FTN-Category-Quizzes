
import React, { useState } from 'react';
import { Product } from '../types';
import { MinusIcon, PlusIcon, StarIcon, ChevronLeftIcon } from '../components/Icons';

interface ProductDetailPageProps {
    product: Product;
    onAddToCart: (product: Product, quantity: number) => void;
    onBack: () => void;
}

const RatingStars: React.FC<{ rating: number; reviewCount: number }> = ({ rating, reviewCount }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < rating} className="w-5 h-5" />
        ))}
        {reviewCount > 0 && <span className="text-sm text-gray-600 ml-2 hover:underline cursor-pointer">({reviewCount} reviews)</span>}
    </div>
);

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onAddToCart, onBack }) => {
    const [quantity, setQuantity] = useState(1);
    
    const handleAddToCart = () => {
        onAddToCart(product, quantity);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={onBack} className="flex items-center text-sm text-gray-600 hover:text-green-800 mb-6">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to products
            </button>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg shadow-md" />
                </div>
                <div className="md:w-1/2">
                    <h2 className="text-sm uppercase text-gray-500">{product.brand}</h2>
                    <h1 className="text-3xl font-bold text-gray-800 mt-1">{product.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{product.size}</p>
                    
                    <div className="my-4">
                        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                    </div>

                    <p className="text-4xl font-light text-green-800 my-4">R{product.price.toFixed(2)}</p>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-gray-600 hover:bg-gray-100"><MinusIcon className="w-5 h-5" /></button>
                            <span className="px-6 text-lg font-semibold">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-gray-600 hover:bg-gray-100"><PlusIcon className="w-5 h-5"/></button>
                        </div>
                        <button
                          onClick={handleAddToCart}
                          className="w-full bg-green-800 text-white text-md font-bold uppercase px-6 py-3 rounded hover:bg-green-900 transition-colors"
                        >
                          Add to Basket
                        </button>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-3">Product Description</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
