
import React, { useState } from 'react';
import { Product } from '../types';
import { MinusIcon, PlusIcon, StarIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onViewProduct: (product: Product) => void;
}

const RatingStars: React.FC<{ rating: number; reviewCount: number }> = ({ rating, reviewCount }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} filled={i < rating} className="w-4 h-4" />
        ))}
        {reviewCount > 0 && <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>}
    </div>
);


export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewProduct }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
  };
  
  const increment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(q => Math.max(1, q - 1));
  };


  return (
    <div className="border border-gray-200 rounded-lg p-4 text-center group cursor-pointer" onClick={() => onViewProduct(product)}>
      <div className="relative mb-4">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover mx-auto" />
        {product.tags && product.tags.length > 0 && (
            <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {product.tags[0].toUpperCase()}
            </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-700 h-10 overflow-hidden">{product.name}</h3>
      <p className="text-xs text-gray-500 mb-2">{product.size}</p>
      <p className="text-md font-bold text-gray-800 mb-2">R{product.price.toFixed(2)}</p>
      <div className="flex justify-center mb-3">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="flex items-center border border-gray-300 rounded">
            <button onClick={decrement} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><MinusIcon /></button>
            <span className="px-3 text-sm">{quantity}</span>
            <button onClick={increment} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><PlusIcon /></button>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-green-800 text-white text-xs font-bold uppercase px-4 py-2 rounded hover:bg-green-900 transition-colors"
        >
          Add to Basket
        </button>
      </div>
    </div>
  );
};
