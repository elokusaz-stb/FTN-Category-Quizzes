import React from 'react';
import { BasketIcon, HeartIcon, SearchIcon, UserIcon } from './Icons';
import { Category } from '../types';

interface HeaderProps {
    cartItemCount: number;
    onNavigate: (page: 'cart' | 'home' | 'products', category?: Category) => void;
    onSearch: (term: string) => void;
}

const NavLink: React.FC<{ onClick?: () => void, children: React.ReactNode, isDeal?: boolean, disabled?: boolean }> = ({ onClick, children, isDeal = false, disabled = false }) => (
    <button onClick={onClick} disabled={disabled} className={`text-sm font-semibold tracking-wider uppercase transition-colors duration-200 ${isDeal ? 'text-red-600' : 'text-gray-600 hover:text-green-800'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {children}
    </button>
);

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onNavigate, onSearch }) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
    }
    
    return (
        <header className="bg-white shadow-sm font-sans">
            <div className="bg-green-800 text-white text-center py-2 text-xs">
                <p>Free delivery on orders over R400. All deliveries are Carbon Neutral! <span className="ml-4 font-bold">Change the way you shop, for Good. <a href="#" className="underline">Read our Better Product Policy.</a></span></p>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => onNavigate('home')}>
                        <img src="https://i.imgur.com/J4yP9pS.png" alt="Faithful to Nature" className="h-10" />
                    </div>
                    <div className="w-full md:w-1/3">
                        <p className="text-xs text-gray-500 mb-1">Welcome to Faithful to Nature!</p>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-green-700">
                                <SearchIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                    <div className="flex items-center space-x-6 text-xs text-gray-600">
                        <div className="text-center">
                            <UserIcon className="mx-auto h-6 w-6" />
                            <span>ACCOUNT</span>
                        </div>
                        <div className="text-center">
                            <HeartIcon className="mx-auto h-6 w-6" />
                            <span>my ftn shop</span>
                        </div>
                        <div className="text-center cursor-pointer" onClick={() => onNavigate('cart')}>
                            <div className="relative">
                                <BasketIcon className="mx-auto h-6 w-6" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">{cartItemCount}</span>
                                )}
                            </div>
                            <span>BASKET ({cartItemCount})</span>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="border-t border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center space-x-8 h-12">
                        <NavLink onClick={() => onNavigate('products', 'Food')}>FOOD</NavLink>
                        <NavLink onClick={() => onNavigate('products', 'Health')}>HEALTH</NavLink>
                        <NavLink onClick={() => onNavigate('products', 'Body & Beauty')}>BODY & BEAUTY</NavLink>
                        <NavLink onClick={() => onNavigate('products', 'Home & Lifestyle')}>HOME & LIFESTYLE</NavLink>
                        <NavLink onClick={() => onNavigate('products', 'Baby & Kids')}>BABY & KIDS</NavLink>
                        <NavLink disabled>NEW</NavLink>
                        <NavLink href="#" isDeal disabled>DEALS</NavLink>
                        <NavLink disabled>FESTIVE GIFT GUIDE</NavLink>
                    </div>
                </div>
            </nav>
        </header>
    );
};