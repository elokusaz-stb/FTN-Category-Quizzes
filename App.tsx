import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Product, CartItem, Filters, Category } from './types';
import { generateProducts } from './services/geminiService';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';

type Page = 'home' | 'products' | 'productDetail' | 'cart';

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0); // 0 for no discount, 0.1 for 10%
    const [currentPage, setCurrentPage] = useState<Page>('products');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [filters, setFilters] = useState<Filters>({
        category: 'All',
        rating: 0,
        brand: []
    });

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const cachedProducts = sessionStorage.getItem('products');
            if (cachedProducts) {
                setProducts(JSON.parse(cachedProducts));
            } else {
                const fetchedProducts = await generateProducts();
                setProducts(fetchedProducts);
                sessionStorage.setItem('products', JSON.stringify(fetchedProducts));
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddToCart = (productToAdd: Product, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product.id === productToAdd.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.product.id === productToAdd.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { product: productToAdd, quantity }];
        });
    };

    const handleAddMultipleToCart = (productsToAdd: Product[], appliedDiscount: number) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            productsToAdd.forEach(productToAdd => {
                const existingItemIndex = newCart.findIndex(item => item.product.id === productToAdd.id);
                if (existingItemIndex > -1) {
                    newCart[existingItemIndex].quantity += 1;
                } else {
                    newCart.push({ product: productToAdd, quantity: 1 });
                }
            });
            return newCart;
        });
        setDiscount(appliedDiscount);
        alert(`${productsToAdd.length} items added to your cart with a ${appliedDiscount * 100}% discount!`);
    };


    const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            if (newQuantity <= 0) {
                return prevCart.filter(item => item.product.id !== productId);
            }
            return prevCart.map(item =>
                item.product.id === productId ? { ...item, quantity: newQuantity } : item
            );
        });
    };
    
    const handleRemoveFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const handleViewProduct = (product: Product) => {
        setSelectedProduct(product);
        setCurrentPage('productDetail');
    };

    const handleNavigate = (page: Page, category?: Category) => {
        // When clicking logo, go to main product page with all filters reset.
        if (page === 'home') {
            setCurrentPage('products');
            setFilters({ category: 'All', rating: 0, brand: [] });
            setSearchTerm('');
            setDiscount(0); // Reset discount
            return;
        }
        // When clicking a category link, go to products page for that category and reset other filters.
        if (page === 'products' && category) {
            setFilters({ category, rating: 0, brand: [] });
            setSearchTerm('');
            setDiscount(0); // Reset discount
        }
        setCurrentPage(page);
    };


    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setFilters({ category: 'All', rating: 0, brand: [] });
        setCurrentPage('products');
        setDiscount(0); // Reset discount
    }

    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => filters.category === 'All' || p.category === filters.category)
        .filter(p => p.rating >= filters.rating)
        .filter(p => filters.brand.length === 0 || filters.brand.includes(p.brand));


    const renderPage = () => {
        switch (currentPage) {
            case 'productDetail':
                return selectedProduct && <ProductDetailPage product={selectedProduct} onAddToCart={handleAddToCart} onBack={() => setCurrentPage('products')} />;
            case 'cart':
                return <CartPage cartItems={cart} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onNavigateHome={() => handleNavigate('home')} discount={discount} />;
            case 'products':
            case 'home':
            default:
                return <ProductsPage
                    products={filteredProducts}
                    allProducts={products}
                    onAddToCart={handleAddToCart}
                    onAddMultipleToCart={handleAddMultipleToCart}
                    onViewProduct={handleViewProduct}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    filters={filters}
                    setFilters={setFilters}
                />;
        }
    };
    
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <div className="bg-white min-h-screen font-sans">
            <Header cartItemCount={cartItemCount} onNavigate={handleNavigate} onSearch={handleSearch}/>
            <main>
                {renderPage()}
            </main>
        </div>
    );
};

export default App;