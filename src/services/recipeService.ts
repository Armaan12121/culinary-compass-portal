
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
      ratings(*),
      recipe_ingredients(id, amount, unit, ingredient_id, ingredients(id, name))
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

  // Process ingredients
  const ingredients: Ingredient[] = data.recipe_ingredients?.map((item: any) => ({
    name: item.ingredients?.name || "Unknown ingredient",
    amount: item.amount,
    unit: item.unit
  })) || [];

  const recipe = transformDbRecipeToRecipe(data);
  recipe.ingredients = ingredients;
  
  return recipe;
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

  // Next, handle ingredients by inserting them into the recipe_ingredients table
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    for (const ingredient of recipe.ingredients) {
      // First check if the ingredient exists
      let ingredientId = null;
      const { data: existingIngredient } = await supabase
        .from('ingredients')
        .select('id')
        .eq('name', ingredient.name)
        .maybeSingle();
      
      if (existingIngredient) {
        ingredientId = existingIngredient.id;
      } else {
        // Create the ingredient
        const { data: newIngredient, error: ingredientError } = await supabase
          .from('ingredients')
          .insert({ name: ingredient.name })
          .select()
          .single();
        
        if (ingredientError) {
          console.error('Error creating ingredient:', ingredientError);
          continue;
        }
        
        ingredientId = newIngredient.id;
      }
      
      // Now add the recipe_ingredient relationship
      const { error: recipeIngredientError } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipeData.id,
          ingredient_id: ingredientId,
          amount: ingredient.amount,
          unit: ingredient.unit
        });
      
      if (recipeIngredientError) {
        console.error('Error saving recipe ingredient:', recipeIngredientError);
      }
    }
  }

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
  
  // For now, we'll use an empty array for ingredients since we handle them separately
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
    ratings: dbRecipe.ratings ? dbRecipe.ratings.map((r: any) => ({
      userId: r.user_id,
      value: r.value,
      comment: r.comment
    })) : [],
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

// Function to rate a recipe
export async function rateRecipe(recipeId: string, userId: string, value: number, comment?: string): Promise<void> {
  // Check if the user has already rated this recipe
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .maybeSingle();
  
  if (existingRating) {
    // Update existing rating
    const { error } = await supabase
      .from('ratings')
      .update({ value, comment })
      .eq('id', existingRating.id);
      
    if (error) {
      console.error('Error updating rating:', error);
      throw new Error('Failed to update recipe rating');
    }
  } else {
    // Create new rating
    const { error } = await supabase
      .from('ratings')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
        value,
        comment
      });
      
    if (error) {
      console.error('Error creating rating:', error);
      throw new Error('Failed to rate recipe');
    }
  }
}

// Function to get user's saved recipes
export async function getUserSavedRecipes(userId: string): Promise<Recipe[]> {
  const { data: savedRecipes, error: savedError } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', userId);
    
  if (savedError) {
    console.error('Error fetching saved recipes:', savedError);
    throw new Error('Failed to fetch saved recipes');
  }

  if (!savedRecipes.length) return [];
  
  const recipeIds = savedRecipes.map(item => item.recipe_id);
  
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `)
    .in('id', recipeIds);
    
  if (error) {
    console.error('Error fetching saved recipe details:', error);
    throw new Error('Failed to fetch saved recipe details');
  }
  
  return data.map(transformDbRecipeToRecipe);
}

// Function to get ingredients for a recipe
export async function getRecipeIngredients(recipeId: string): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('recipe_ingredients')
    .select(`
      amount,
      unit,
      ingredients (id, name)
    `)
    .eq('recipe_id', recipeId);
    
  if (error) {
    console.error('Error fetching recipe ingredients:', error);
    throw new Error('Failed to fetch recipe ingredients');
  }
  
  return data.map((item: any) => ({
    name: item.ingredients?.name || "Unknown",
    amount: item.amount,
    unit: item.unit
  }));
}
