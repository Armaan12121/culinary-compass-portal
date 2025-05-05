
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
  avatar_url?: string;
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
  id?: string;
  ingredient_id?: string;
}

export interface Rating {
  userId: string;
  value: number; // 1-5
  comment?: string;
  id?: string;
  recipe_id?: string;
  user_id?: string;
  created_at?: string;
}

export interface RecipeFilter {
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  dietaryTypes?: string[];
  searchQuery?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  preferences?: {
    cuisines: string[];
    dietaryRestrictions: string[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
  };
  created_at?: string;
  updated_at?: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  amount: number;
  unit: string;
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

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced"
] as const;

export const DIFFICULTY_LEVELS = [
  "easy",
  "medium",
  "hard"
] as const;

// API response interfaces
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  nextPage: number | null;
  prevPage: number | null;
}
