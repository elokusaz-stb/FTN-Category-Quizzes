import React from 'react';
import { CartItem } from '../types';
import { MinusIcon, PlusIcon, XIcon } from '../components/Icons';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigateHome: () => void;
  discount: number; // e.g., 0.1 for 10%
}

export const CartPage: React.FC<CartPageProps> = ({ cartItems, onUpdateQuantity, onRemoveItem, onNavigateHome, discount }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shipping = subtotalAfterDiscount > 400 ? 0 : 50;
  const total = subtotalAfterDiscount + shipping;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
            <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
            <button onClick={onNavigateHome} className="bg-green-800 text-white font-bold py-3 px-6 rounded hover:bg-green-900 transition-colors">
                Continue Shopping
            </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="hidden sm:grid grid-cols-6 gap-4 font-semibold text-sm text-gray-500 border-b pb-2 mb-4">
              <div className="col-span-3">PRODUCT</div>
              <div>PRICE</div>
              <div>QUANTITY</div>
              <div>SUBTOTAL</div>
            </div>
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="grid grid-cols-6 gap-4 items-center border-b py-4">
                <div className="col-span-6 sm:col-span-3 flex items-center gap-4">
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded" />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.size}</p>
                    <button onClick={() => onRemoveItem(product.id)} className="text-red-500 text-sm mt-1 sm:hidden">Remove</button>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <span className="sm:hidden font-semibold">Price: </span>
                    R{product.price.toFixed(2)}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="flex items-center border border-gray-300 rounded w-max">
                    <button onClick={() => onUpdateQuantity(product.id, quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><MinusIcon /></button>
                    <span className="px-3 text-sm">{quantity}</span>
                    <button onClick={() => onUpdateQuantity(product.id, quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"><PlusIcon /></button>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 font-semibold">
                    <span className="sm:hidden font-semibold">Subtotal: </span>
                    R{(product.price * quantity).toFixed(2)}
                </div>
                <div className="hidden sm:block">
                  <button onClick={() => onRemoveItem(product.id)} className="text-gray-400 hover:text-red-500">
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-1/3">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
               {discount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                    <span>Quiz Discount ({discount * 100}%)</span>
                    <span>-R{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mb-4">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
              <button className="w-full bg-green-800 text-white font-bold py-3 mt-6 rounded hover:bg-green-900 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};