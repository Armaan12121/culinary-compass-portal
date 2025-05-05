
export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    cuisines: string[];
    dietaryRestrictions: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  savedRecipes: string[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryTypes: string[];
  ingredients: Ingredient[];
  instructions: string[];
  author_id?: string; // Changed from author to author_id to match Supabase
  ratings: Rating[];
  averageRating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Rating {
  userId: string;
  value: number; // 1-5
  comment?: string;
}

export const CUISINES = [
  "Italian", 
  "Mexican", 
  "Japanese", 
  "Indian", 
  "French", 
  "Mediterranean", 
  "Chinese", 
  "Thai", 
  "American", 
  "Middle Eastern"
];

export const DIETARY_TYPES = [
  "Vegetarian", 
  "Vegan", 
  "Gluten-Free", 
  "Dairy-Free", 
  "Keto", 
  "Paleo", 
  "Low-Carb", 
  "Low-Fat", 
  "High-Protein"
];
