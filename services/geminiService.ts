
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Quiz } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using fallback data. Functionality will be limited.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const fallbackProducts: Product[] = [
    { id: '1', name: 'Solgar Magnesium Citrate', brand: 'Solgar', category: 'Health', price: 208.00, imageUrl: 'https://picsum.photos/seed/mag1/400/400', description: 'Highly absorbable magnesium for muscle and nerve function.', rating: 5, reviewCount: 12, size: '60s', tags: ['New'] },
    { id: '2', name: 'Yenn Magnesium Spray with MSM', brand: 'Yenn', category: 'Health', price: 149.00, imageUrl: 'https://picsum.photos/seed/mag2/400/400', description: 'Topical magnesium spray for targeted relief and relaxation.', rating: 4, reviewCount: 10, size: '100ml', tags: [] },
    { id: '3', name: 'Essentially Young Magnesium Bath Flakes', brand: 'Essentially Young', category: 'Body & Beauty', price: 185.00, imageUrl: 'https://picsum.photos/seed/mag3/400/400', description: 'Pure magnesium chloride flakes for a restorative and relaxing bath.', rating: 5, reviewCount: 8, size: '1kg', tags: [] },
    { id: '4', name: 'Organic Baby Shampoo', brand: 'Earth Mama', category: 'Baby & Kids', price: 125.50, imageUrl: 'https://picsum.photos/seed/baby1/400/400', description: 'Gentle, tear-free organic shampoo for babies.', rating: 5, reviewCount: 34, size: '250ml', tags: ['Eco-Friendly'] },
    { id: '5', name: 'Reusable Beeswax Food Wraps', brand: 'EcoWrap', category: 'Home & Lifestyle', price: 210.00, imageUrl: 'https://picsum.photos/seed/home1/400/400', description: 'A sustainable alternative to plastic wrap for food storage.', rating: 4, reviewCount: 55, size: '3 Pack', tags: ['Sustainable'] },
    { id: '6', name: 'Almond Flour', brand: 'Goodness Grains', category: 'Food', price: 95.00, imageUrl: 'https://picsum.photos/seed/food1/400/400', description: 'Gluten-free, low-carb flour perfect for baking.', rating: 5, reviewCount: 102, size: '500g', tags: ['Bestseller'] },
    { id: '7', name: 'All Natural Magnesium Body Butter', brand: 'The Apothecary', category: 'Body & Beauty', price: 154.95, imageUrl: 'https://picsum.photos/seed/mag4/400/400', description: 'A rich and creamy body butter infused with magnesium for skin health.', rating: 4, reviewCount: 23, size: '100g', tags: [] }
];

export const generateProducts = async (): Promise<Product[]> => {
  if (!ai) {
    return fallbackProducts;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a JSON array of 30 unique products for an online store like 'Faithful to Nature'. Categories must be 'Body & Beauty', 'Baby & Kids', 'Home & Lifestyle', 'Health', or 'Food'. Ensure variety in brands, realistic pricing, ratings, and descriptions. Also include relevant tags like 'Bestseller', 'New', 'Eco-Friendly', 'Organic', 'Vegan' where appropriate. Some products can have an empty array for tags.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique identifier" },
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Body & Beauty', 'Baby & Kids', 'Home & Lifestyle', 'Health', 'Food'] },
              price: { type: Type.NUMBER },
              imageUrl: { type: Type.STRING, description: "A placeholder image URL from picsum.photos" },
              description: { type: Type.STRING },
              rating: { type: Type.INTEGER, description: "Rating from 1 to 5" },
              reviewCount: { type: Type.INTEGER },
              size: { type: Type.STRING, description: "e.g., '100ml', '250g', '60s'" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING, description: "e.g. 'New', 'Bestseller', 'Eco-Friendly'" } }
            },
            required: ['id', 'name', 'brand', 'category', 'price', 'imageUrl', 'description', 'rating', 'reviewCount', 'size', 'tags']
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const products = JSON.parse(jsonText);
    
    // Add unique seed to picsum photos to avoid same image
    return products.map((p: Product, i: number) => ({...p, imageUrl: `https://picsum.photos/seed/${p.id || i}/400/400`}));

  } catch (error) {
    console.error("Error generating products with Gemini:", error);
    return fallbackProducts;
  }
};


export const generateQuiz = async (context: string): Promise<Quiz> => {
    if (!ai) {
        return {
            title: `Find your perfect ${context} product`,
            questions: [{
                question: 'What is your main goal?',
                options: ['Option A', 'Option B', 'Option C']
            }]
        };
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert AI shopping assistant for an e-commerce store focused on natural and organic products. A user is looking at products related to '${context}'. Generate a short, engaging quiz with 3 multiple-choice questions to help them find the perfect product. The goal is to understand their specific needs, preferences, or lifestyle related to this topic. Return the response as a JSON object. Do not include any text outside of the JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A friendly and engaging title for the quiz." },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["question", "options"]
                            }
                        }
                    },
                    required: ["title", "questions"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Could not generate the quiz.");
    }
};

export const getProductRecommendations = async (
    answers: { [key: string]: string },
    context: string,
    products: Product[]
): Promise<string[]> => {
    if (!ai) {
        // Return first 3 from the provided (already filtered) list
        return products.slice(0, 3).map(p => p.id);
    }

    const simplifiedProductList = products.map(({ id, name, description, tags }) => ({ id, name, description, tags }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert AI shopping assistant. A user has completed a quiz about products related to '${context}'. Their answers are: ${JSON.stringify(answers)}. Based *only* on the following list of available products, select up to 5 of the most relevant products that match their needs. Prioritize products that are a strong fit. Return a JSON array containing only the 'id' of each recommended product. Do not recommend products not in this list. \n\nAvailable Products:\n${JSON.stringify(simplifiedProductList)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "The product ID"
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting recommendations:", error);
        throw new Error("Could not get recommendations.");
    }
};
