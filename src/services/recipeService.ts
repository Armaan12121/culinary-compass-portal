
import { supabase } from "@/integrations/supabase/client";
import { Recipe, Ingredient } from "@/types";

// Function to fetch all recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `);

  if (error) {
    console.error('Error fetching recipes:', error);
    throw new Error('Failed to fetch recipes');
  }

  // Transform the data to match our Recipe interface
  return data.map(transformDbRecipeToRecipe);
}

// Function to fetch a single recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Recipe not found
    }
    console.error('Error fetching recipe:', error);
    throw new Error('Failed to fetch recipe');
  }

  return transformDbRecipeToRecipe(data);
}

// Function to save a recipe
export async function saveRecipe(recipe: Omit<Recipe, 'id' | 'ratings' | 'averageRating'>): Promise<Recipe> {
  // First, insert the recipe
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.imageUrl,
      prep_time: recipe.prepTime,
      cook_time: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      dietary_types: recipe.dietaryTypes,
      instructions: recipe.instructions,
      author_id: recipe.author_id
    })
    .select()
    .single();

  if (recipeError) {
    console.error('Error saving recipe:', recipeError);
    throw new Error('Failed to save recipe');
  }

  // Next, handle ingredients (assuming we have a separate function for this)
  // For simplicity, we're not implementing this part yet

  return transformDbRecipeToRecipe(recipeData);
}

// Helper function to transform database recipe to our Recipe interface
function transformDbRecipeToRecipe(dbRecipe: any): Recipe {
  // Calculate average rating if ratings exist
  let averageRating = 0;
  if (dbRecipe.ratings && dbRecipe.ratings.length > 0) {
    const sum = dbRecipe.ratings.reduce((total: number, rating: any) => total + rating.value, 0);
    averageRating = sum / dbRecipe.ratings.length;
  }
  
  // For now, we'll use an empty array for ingredients since we haven't implemented that part yet
  const ingredients: Ingredient[] = [];

  return {
    id: dbRecipe.id,
    title: dbRecipe.title,
    description: dbRecipe.description,
    imageUrl: dbRecipe.image_url,
    prepTime: dbRecipe.prep_time,
    cookTime: dbRecipe.cook_time,
    servings: dbRecipe.servings,
    difficulty: dbRecipe.difficulty as 'easy' | 'medium' | 'hard',
    cuisine: dbRecipe.cuisine,
    dietaryTypes: dbRecipe.dietary_types,
    ingredients: ingredients,
    instructions: dbRecipe.instructions,
    author_id: dbRecipe.author_id,
    ratings: dbRecipe.ratings.map((r: any) => ({
      userId: r.user_id,
      value: r.value,
      comment: r.comment
    })),
    averageRating,
    created_at: dbRecipe.created_at,
    updated_at: dbRecipe.updated_at
  };
}

// Helper function to add a specific recipe to a user's saved recipes
export async function saveRecipeForUser(recipeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_recipes')
    .insert({
      user_id: userId,
      recipe_id: recipeId
    });

  if (error) {
    console.error('Error saving recipe for user:', error);
    throw new Error('Failed to save recipe');
  }
}

// Helper function to remove a specific recipe from a user's saved recipes
export async function unsaveRecipeForUser(recipeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);

  if (error) {
    console.error('Error removing saved recipe:', error);
    throw new Error('Failed to remove saved recipe');
  }
}

// Function to check if a recipe is saved by a user
export async function isRecipeSavedByUser(recipeId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();

  if (error) {
    console.error('Error checking if recipe is saved:', error);
    throw new Error('Failed to check if recipe is saved');
  }

  return !!data;
}
