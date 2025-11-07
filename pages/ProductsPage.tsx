
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Filters, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { AIQuizModal } from '../components/AIQuizModal';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, LeafIcon, MinusIcon, PlusIcon, StarIcon, XIcon } from '../components/Icons';

const RatingFilter: React.FC<{ currentRating: number; onRatingChange: (rating: number) => void }> = ({ currentRating, onRatingChange }) => {
    return (
        <div>
            {[4, 3, 2, 1].map(rating => (
                <button key={rating} onClick={() => onRatingChange(rating)} className={`flex items-center space-x-2 text-sm text-gray-600 mb-1 w-full text-left ${currentRating === rating ? 'font-bold' : ''}`}>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < rating} className="w-4 h-4" />)}
                    </div>
                    <span>& up</span>
                </button>
            ))}
             {currentRating > 0 && <button onClick={() => onRatingChange(currentRating)} className="text-xs text-red-500 mt-2">Clear</button>}
        </div>
    );
};

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b py-4">
            <button className="w-full flex justify-between items-center text-left font-semibold text-gray-700" onClick={() => setIsOpen(!isOpen)}>
                {title}
                {isOpen ? <MinusIcon className="w-3 h-3"/> : <PlusIcon className="w-3 h-3"/>}
            </button>
            {isOpen && <div className="mt-3">{children}</div>}
        </div>
    );
};


const FiltersSidebar: React.FC<{
    allProducts: Product[];
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ allProducts, filters, setFilters }) => {

    const categories = useMemo(() => {
        const counts: Record<string, number> = {};
        allProducts.forEach(p => {
            counts[p.category] = (counts[p.category] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    }, [allProducts]);

    const brands = useMemo(() => {
        const brandSet = new Set<string>();
        allProducts.forEach(p => brandSet.add(p.brand));
        return Array.from(brandSet).sort();
    }, [allProducts]);
    
    const handleCategoryChange = (category: Category | 'All') => {
        setFilters(f => ({ ...f, category, brand: [], rating: 0 }));
    };

    const handleRatingChange = (rating: number) => {
        setFilters(f => f.rating === rating ? { ...f, rating: 0 } : { ...f, rating });
    };
    
    const handleBrandChange = (brand: string) => {
        setFilters(f => {
            const newBrands = f.brand.includes(brand)
                ? f.brand.filter(b => b !== brand)
                : [...f.brand, brand];
            return { ...f, brand: newBrands };
        });
    };

    const clearFilters = () => {
      setFilters({ category: 'All', rating: 0, brand: [] });
    }

    const activeFiltersCount = (filters.category !== 'All' ? 1 : 0) + filters.brand.length + (filters.rating > 0 ? 1 : 0);


    return (
        <aside className="w-full lg:w-1/4 pr-8">
            {activeFiltersCount > 0 && (
              <div className="bg-gray-100 p-4 mb-4 rounded">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">Currently Shopping By:</h3>
                    <button onClick={clearFilters} className="text-sm text-red-600 hover:underline">Clear All</button>
                </div>
                 <div className="flex flex-wrap gap-2">
                    {filters.category !== 'All' && (
                       <div className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded text-sm">
                         <span>Category: {filters.category}</span>
                         <button onClick={() => handleCategoryChange('All')}><XIcon className="w-3 h-3"/></button>
                       </div>
                    )}
                    {filters.brand.map(b => (
                        <div key={b} className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded text-sm">
                         <span>{b}</span>
                         <button onClick={() => handleBrandChange(b)}><XIcon className="w-3 h-3"/></button>
                       </div>
                    ))}
                    {filters.rating > 0 && (
                        <div className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded text-sm">
                            <span>{filters.rating}+ Stars</span>
                            <button onClick={() => handleRatingChange(filters.rating)}><XIcon className="w-3 h-3"/></button>
                        </div>
                    )}
                </div>
              </div>
            )}
            <FilterSection title="Category">
                <ul>
                    {categories.map(([name, count]) => (
                        <li key={name} className="mb-1">
                            <button 
                                onClick={() => handleCategoryChange(name as Category)} 
                                className={`text-sm text-left w-full ${filters.category === name ? 'font-bold text-green-800' : 'text-gray-600'}`}>
                                {name} ({count})
                            </button>
                        </li>
                    ))}
                </ul>
            </FilterSection>
            <FilterSection title="Rating Filter">
                <RatingFilter currentRating={filters.rating} onRatingChange={handleRatingChange} />
            </FilterSection>
             <FilterSection title="Brand">
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {brands.map(brand => (
                        <li key={brand}>
                            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filters.brand.includes(brand)}
                                    onChange={() => handleBrandChange(brand)}
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-3">{brand}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </FilterSection>
        </aside>
    );
};


export const ProductsPage: React.FC<{
    products: Product[];
    allProducts: Product[];
    onAddToCart: (product: Product, quantity: number) => void;
    onAddMultipleToCart: (products: Product[], discount: number) => void;
    onViewProduct: (product: Product) => void;
    isLoading: boolean;
    searchTerm: string;
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}> = ({ products, allProducts, onAddToCart, onAddMultipleToCart, onViewProduct, isLoading, searchTerm, filters, setFilters }) => {
    
    const [sortOrder, setSortOrder] = useState('Relevance');
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);

    const quizContext = searchTerm || (filters.category !== 'All' ? filters.category : null);

    useEffect(() => {
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [filters, searchTerm, sortOrder, itemsPerPage]);
    
    useEffect(() => {
        setShowQuizPrompt(false); // Reset on change
        if (quizContext) {
          const timer = setTimeout(() => {
            setShowQuizPrompt(true);
          }, 3000); // 3-second delay
          return () => clearTimeout(timer);
        }
    }, [quizContext]);


    const sortedProducts = useMemo(() => {
        return [...products].sort((a, b) => {
            switch (sortOrder) {
                case 'Price: Low to High': return a.price - b.price;
                case 'Price: High to Low': return b.price - a.price;
                case 'Name: A to Z': return a.name.localeCompare(b.name);
                default: return 0; // Relevance
            }
        });
    }, [products, sortOrder]);

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const Pagination: React.FC = () => (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 border rounded disabled:opacity-50"><ChevronLeftIcon /></button>
            {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 border rounded ${currentPage === i + 1 ? 'bg-green-800 text-white' : ''}`}>{i + 1}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border rounded disabled:opacity-50"><ChevronRightIcon /></button>
        </div>
    );
    
    const pageTitle = searchTerm ? `Search results for '${searchTerm}'` : filters.category !== 'All' ? filters.category : 'All Products';
    const breadcrumb = searchTerm ? `Search Results For: '${searchTerm}'` : filters.category !== 'All' ? filters.category : 'All Categories';

    if (isLoading) {
        return <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-800"></div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isQuizOpen && quizContext && (
                <AIQuizModal 
                    context={quizContext}
                    productsForQuiz={products}
                    onClose={() => setIsQuizOpen(false)}
                    onAddToCart={onAddToCart}
                    onAddMultipleToCart={onAddMultipleToCart}
                />
            )}
            <div className="text-sm text-gray-500 mb-4">
                Home > {breadcrumb}
            </div>
            <div className="flex flex-col lg:flex-row">
                <FiltersSidebar allProducts={allProducts} filters={filters} setFilters={setFilters} />

                <div className="w-full lg:w-3/4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                        <h1 className="text-2xl font-light text-gray-800">{pageTitle}</h1>
                         {showQuizPrompt && quizContext && (
                            <button 
                                onClick={() => setIsQuizOpen(true)} 
                                className="flex items-center text-green-800 hover:text-green-900 transition-colors mt-3 sm:mt-0 p-2 rounded-lg hover:bg-green-50"
                            >
                                <LeafIcon className="w-8 h-8 mr-2 flex-shrink-0" />
                                <span className="font-semibold text-sm text-left">
                                    Need help choosing? Take an AI quiz to help you out
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-b py-2 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="sort" className="text-sm text-gray-600">Sort By</label>
                                <div className="relative">
                                    <select id="sort" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-md py-1 pl-3 pr-8 text-sm focus:outline-none">
                                        <option>Relevance</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Name: A to Z</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">{products.length} Item(s)</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                            <label htmlFor="show" className="text-sm text-gray-600">Show</label>
                            <select id="show" value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="border border-gray-300 rounded-md py-1 px-2 text-sm focus:outline-none">
                                <option>12</option>
                                <option>24</option>
                                <option>36</option>
                            </select>
                        </div>
                    </div>
                    
                    {paginatedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {paginatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16">
                            <h2 className="text-xl font-semibold text-gray-700">No products found</h2>
                            <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
                        </div>
                    )}
                    
                    {totalPages > 1 && <Pagination />}

                </div>
            </div>
        </div>
    );
};
