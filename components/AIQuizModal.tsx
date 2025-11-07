import React, { useState, useEffect } from 'react';
import { Product, Quiz } from '../types';
import { generateQuiz, getProductRecommendations } from '../services/geminiService';
import { XIcon, StarIcon } from './Icons';

interface AIQuizModalProps {
    context: string;
    productsForQuiz: Product[];
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
    onAddMultipleToCart: (products: Product[], discount: number) => void;
}

type QuizStep = 'intro' | 'questions' | 'loading' | 'results' | 'error';

export const AIQuizModal: React.FC<AIQuizModalProps> = ({ context, productsForQuiz, onClose, onAddToCart, onAddMultipleToCart }) => {
    const [step, setStep] = useState<QuizStep>('intro');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    
    const startQuiz = async () => {
        setStep('loading');
        try {
            const generatedQuiz = await generateQuiz(context);
            setQuiz(generatedQuiz);
            setStep('questions');
        } catch (e) {
            setStep('error');
        }
    };
    
    const handleAnswer = (question: string, answer: string) => {
        const newAnswers = { ...answers, [question]: answer };
        setAnswers(newAnswers);
        
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of quiz, get recommendations
            getRecommendations(newAnswers);
        }
    };

    const getRecommendations = async (finalAnswers: { [key: string]: string }) => {
        setStep('loading');
        try {
            const recommendedIds = await getProductRecommendations(finalAnswers, context, productsForQuiz);
            const products = recommendedIds.map(id => productsForQuiz.find(p => p.id === id)).filter(Boolean) as Product[];
            setRecommendedProducts(products);
            setStep('results');
        } catch (e) {
            setStep('error');
        }
    };

    const handleAddAllAndClose = () => {
        onAddMultipleToCart(recommendedProducts, 0.10); // 10% discount
        onClose();
    }

    const handleSingleAddToCart = (product: Product) => {
        onAddToCart(product, 1);
        // Maybe show a small confirmation?
        alert(`${product.name} added to cart!`);
    }

    const renderContent = () => {
        switch(step) {
            case 'intro':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Struggling to Choose?</h2>
                        <p className="text-gray-600 mb-6">Let our AI assistant find the perfect {context} products for you in just a few clicks.</p>
                        <button onClick={startQuiz} className="bg-green-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-900 transition-colors">Start Quiz</button>
                    </div>
                );
            case 'loading':
                 return (
                    <div className="flex flex-col justify-center items-center text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-800 mb-4"></div>
                        <p className="text-gray-600">Finding the best questions for you...</p>
                    </div>
                 );
            case 'questions':
                if (!quiz) return <p>Something went wrong.</p>;
                const currentQuestion = quiz.questions[currentQuestionIndex];
                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-1 text-center">{quiz.title}</h2>
                        <p className="text-center text-gray-500 mb-6">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                        <p className="text-lg text-center font-medium mb-8">{currentQuestion.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map(option => (
                                <button key={option} onClick={() => handleAnswer(currentQuestion.question, option)} className="w-full text-left bg-gray-100 p-4 rounded-lg border-2 border-transparent hover:border-green-600 hover:bg-green-50 transition-all">
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'results':
                return (
                     <div>
                        <h2 className="text-2xl font-bold text-center mb-2">We've found your perfect match!</h2>
                        <p className="text-center text-gray-600 mb-8">Based on your answers, we recommend these products:</p>
                        <div className="space-y-4 mb-8 max-h-96 overflow-y-auto p-2">
                             {recommendedProducts.map(p => (
                                <div key={p.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border">
                                    <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover rounded"/>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.brand}</p>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < p.rating} className="w-4 h-4" />)}
                                            <span className="text-xs text-gray-500 ml-1">({p.reviewCount})</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">R{p.price.toFixed(2)}</p>
                                        <button onClick={() => handleSingleAddToCart(p)} className="text-sm bg-green-700 text-white px-3 py-1 rounded mt-2 hover:bg-green-800">Add to Cart</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded-lg text-center">
                            <h3 className="font-bold">Exclusive Offer!</h3>
                            <p className="text-sm mb-3">Add all recommended items to your cart and get a 10% discount!</p>
                            <button onClick={handleAddAllAndClose} className="w-full bg-green-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-900 transition-colors">
                                Add All & Get 10% Off
                            </button>
                        </div>
                         <button onClick={onClose} className="w-full text-center mt-4 text-sm text-gray-600 hover:underline">Or see all products in this category</button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong.</h2>
                        <p className="text-gray-600 mb-6">We had trouble generating your quiz. Please try again later.</p>
                        <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors">Close</button>
                    </div>
                );

        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-2xl relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
                    <XIcon className="w-6 h-6"/>
                </button>
                <div className="p-8">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};