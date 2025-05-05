
import { supabase } from "@/integrations/supabase/client";
import { Recipe, Ingredient, RecipeFilter } from "@/types";

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

// Function to fetch recipes with filtering
export async function getFilteredRecipes(filter: RecipeFilter): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `);

  // Apply filters
  if (filter.cuisine) {
    query = query.eq('cuisine', filter.cuisine);
  }

  if (filter.difficulty) {
    query = query.eq('difficulty', filter.difficulty);
  }

  if (filter.dietaryTypes && filter.dietaryTypes.length > 0) {
    // Filter for recipes that have ALL the specified dietary types
    filter.dietaryTypes.forEach(type => {
      query = query.contains('dietary_types', [type]);
    });
  }

  if (filter.searchQuery) {
    query = query.or(`title.ilike.%${filter.searchQuery}%,description.ilike.%${filter.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered recipes:', error);
    throw new Error('Failed to fetch recipes with filters');
  }

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

// Function to update a recipe
export async function updateRecipe(id: string, recipe: Partial<Recipe>): Promise<Recipe> {
  const updateData: any = {};
  
  if (recipe.title) updateData.title = recipe.title;
  if (recipe.description) updateData.description = recipe.description;
  if (recipe.imageUrl) updateData.image_url = recipe.imageUrl;
  if (recipe.prepTime) updateData.prep_time = recipe.prepTime;
  if (recipe.cookTime) updateData.cook_time = recipe.cookTime;
  if (recipe.servings) updateData.servings = recipe.servings;
  if (recipe.difficulty) updateData.difficulty = recipe.difficulty;
  if (recipe.cuisine) updateData.cuisine = recipe.cuisine;
  if (recipe.dietaryTypes) updateData.dietary_types = recipe.dietaryTypes;
  if (recipe.instructions) updateData.instructions = recipe.instructions;

  const { data, error } = await supabase
    .from('recipes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recipe:', error);
    throw new Error('Failed to update recipe');
  }

  // If ingredients were provided, update them too
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    // First delete existing ingredients
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id);

    // Then add the new ones
    for (const ingredient of recipe.ingredients) {
      let ingredientId = null;
      
      // Check if the ingredient exists
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
      
      // Add the recipe_ingredient relationship
      await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: id,
          ingredient_id: ingredientId,
          amount: ingredient.amount,
          unit: ingredient.unit
        });
    }
  }

  return await getRecipeById(id) as Recipe;
}

// Function to delete a recipe
export async function deleteRecipe(id: string): Promise<void> {
  // First delete related records from recipe_ingredients
  await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', id);
    
  // Then delete related records from ratings
  await supabase
    .from('ratings')
    .delete()
    .eq('recipe_id', id);
    
  // Finally delete the recipe
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting recipe:', error);
    throw new Error('Failed to delete recipe');
  }
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

// Function to get recipes by user ID
export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `)
    .eq('author_id', userId);
    
  if (error) {
    console.error('Error fetching user recipes:', error);
    throw new Error('Failed to fetch user recipes');
  }
  
  return data.map(transformDbRecipeToRecipe);
}

// Function to search recipes by title or description
export async function searchRecipes(query: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      ratings(*)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    
  if (error) {
    console.error('Error searching recipes:', error);
    throw new Error('Failed to search recipes');
  }
  
  return data.map(transformDbRecipeToRecipe);
}
