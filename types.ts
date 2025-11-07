export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  description: string;
  rating: number;
  reviewCount: number;
  size: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Category = 'Body & Beauty' | 'Baby & Kids' | 'Home & Lifestyle' | 'Health' | 'Food';

export interface Filters {
  category: Category | 'All';
  rating: number;
  brand: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}