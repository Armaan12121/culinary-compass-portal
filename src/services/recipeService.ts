
import { supabase } from '@/integrations/supabase/client';
import { Recipe, Ingredient } from '@/types';

export interface RecipeFilter {
  cuisines?: string[];
  dietaryTypes?: string[];
  difficulty?: string;
  searchQuery?: string;
}

export const recipeService = {
  async getRecipes(filters?: RecipeFilter) {
    let query = supabase
      .from('recipes')
      .select('*, ratings(*)');

    // Apply filters if provided
    if (filters) {
      // Filter by cuisine
      if (filters.cuisines && filters.cuisines.length > 0) {
        query = query.in('cuisine', filters.cuisines);
      }
      
      // Filter by dietary types (must contain all selected dietary types)
      if (filters.dietaryTypes && filters.dietaryTypes.length > 0) {
        filters.dietaryTypes.forEach(diet => {
          query = query.contains('dietary_types', [diet]);
        });
      }
      
      // Filter by difficulty
      if (filters.difficulty && filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }
      
      // Search by title or description
      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;

    // Process the data to match our Recipe type
    return data.map((item: any) => {
      const averageRating = item.ratings && item.ratings.length
        ? item.ratings.reduce((sum: number, rating: any) => sum + rating.value, 0) / item.ratings.length
        : undefined;

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        servings: item.servings,
        difficulty: item.difficulty,
        cuisine: item.cuisine,
        dietaryTypes: item.dietary_types,
        instructions: item.instructions,
        author: item.author_id,
        ratings: item.ratings || [],
        averageRating: averageRating,
        ingredients: [] // We'll fetch ingredients separately when needed
      } as Recipe;
    });
  },
  
  async getRecipeById(id: string): Promise<Recipe> {
    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (recipeError) throw recipeError;
    
    // Get recipe ingredients
    const { data: recipeIngredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        amount, 
        unit, 
        ingredients (
          id, 
          name
        )
      `)
      .eq('recipe_id', id);
    
    if (ingredientsError) throw ingredientsError;
    
    // Get ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .eq('recipe_id', id);
    
    if (ratingsError) throw ratingsError;
    
    // Calculate average rating
    const averageRating = ratings.length
      ? ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length
      : undefined;
    
    // Format ingredients
    const ingredients = recipeIngredients.map(item => ({
      name: item.ingredients.name,
      amount: item.amount,
      unit: item.unit
    })) as Ingredient[];
    
    return {
      ...recipe,
      imageUrl: recipe.image_url,
      prepTime: recipe.prep_time,
      cookTime: recipe.cook_time,
      dietaryTypes: recipe.dietary_types,
      ingredients,
      ratings,
      averageRating
    } as Recipe;
  },
  
  async createRecipe(recipe: Omit<Recipe, 'id' | 'ratings' | 'averageRating'>): Promise<string> {
    // Extract ingredients to insert separately
    const { ingredients, ...recipeData } = recipe;
    
    // Convert to Supabase format
    const supabaseRecipe = {
      title: recipeData.title,
      description: recipeData.description,
      image_url: recipeData.imageUrl,
      prep_time: recipeData.prepTime,
      cook_time: recipeData.cookTime,
      servings: recipeData.servings,
      difficulty: recipeData.difficulty,
      cuisine: recipeData.cuisine,
      dietary_types: recipeData.dietaryTypes,
      instructions: recipeData.instructions,
      author_id: recipeData.author
    };
    
    // Insert recipe
    const { data: newRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert(supabaseRecipe)
      .select()
      .single();
    
    if (recipeError) throw recipeError;
    
    // Add ingredients one by one
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        // First check if ingredient exists
        let ingredientId;
        const { data: existingIngredient } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredient.name)
          .maybeSingle();
        
        if (existingIngredient) {
          ingredientId = existingIngredient.id;
        } else {
          // Create new ingredient
          const { data: newIngredient, error: ingredientError } = await supabase
            .from('ingredients')
            .insert({ name: ingredient.name })
            .select()
            .single();
          
          if (ingredientError) throw ingredientError;
          ingredientId = newIngredient.id;
        }
        
        // Link ingredient to recipe
        await supabase
          .from('recipe_ingredients')
          .insert({
            recipe_id: newRecipe.id,
            ingredient_id: ingredientId,
            amount: ingredient.amount,
            unit: ingredient.unit
          });
      }
    }
    
    return newRecipe.id;
  },
  
  async updateRecipe(id: string, recipe: Partial<Recipe>): Promise<void> {
    const { ingredients, ...recipeData } = recipe;
    
    // Convert to Supabase format
    const supabaseRecipe: any = {};
    if (recipeData.title) supabaseRecipe.title = recipeData.title;
    if (recipeData.description) supabaseRecipe.description = recipeData.description;
    if (recipeData.imageUrl) supabaseRecipe.image_url = recipeData.imageUrl;
    if (recipeData.prepTime) supabaseRecipe.prep_time = recipeData.prepTime;
    if (recipeData.cookTime) supabaseRecipe.cook_time = recipeData.cookTime;
    if (recipeData.servings) supabaseRecipe.servings = recipeData.servings;
    if (recipeData.difficulty) supabaseRecipe.difficulty = recipeData.difficulty;
    if (recipeData.cuisine) supabaseRecipe.cuisine = recipeData.cuisine;
    if (recipeData.dietaryTypes) supabaseRecipe.dietary_types = recipeData.dietaryTypes;
    if (recipeData.instructions) supabaseRecipe.instructions = recipeData.instructions;
    
    // Update recipe if there are changes
    if (Object.keys(supabaseRecipe).length > 0) {
      const { error } = await supabase
        .from('recipes')
        .update(supabaseRecipe)
        .eq('id', id);
      
      if (error) throw error;
    }
    
    // Update ingredients if provided
    if (ingredients && ingredients.length > 0) {
      // Delete existing recipe ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);
      
      // Add new ingredients
      for (const ingredient of ingredients) {
        // Check if ingredient exists
        let ingredientId;
        const { data: existingIngredient } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', ingredient.name)
          .maybeSingle();
        
        if (existingIngredient) {
          ingredientId = existingIngredient.id;
        } else {
          // Create new ingredient
          const { data: newIngredient, error: ingredientError } = await supabase
            .from('ingredients')
            .insert({ name: ingredient.name })
            .select()
            .single();
          
          if (ingredientError) throw ingredientError;
          ingredientId = newIngredient.id;
        }
        
        // Link ingredient to recipe
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
  },
  
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  async rateRecipe(recipeId: string, userId: string, value: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('ratings')
      .upsert(
        {
          recipe_id: recipeId,
          user_id: userId,
          value,
          comment
        },
        { onConflict: 'recipe_id,user_id' }
      );
    
    if (error) throw error;
  },
  
  async saveRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_recipes')
      .insert({
        recipe_id: recipeId,
        user_id: userId
      });
    
    if (error && error.code !== '23505') throw error; // Ignore unique constraint errors
  },
  
  async unsaveRecipe(recipeId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .match({
        recipe_id: recipeId,
        user_id: userId
      });
    
    if (error) throw error;
  },
  
  async getSavedRecipes(userId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const recipeIds = data.map(item => item.recipe_id);
    if (recipeIds.length === 0) return [];
    
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*, ratings(*)')
      .in('id', recipeIds);
    
    if (recipesError) throw recipesError;
    
    // Process the data to match our Recipe type
    return recipes.map((item: any) => {
      const averageRating = item.ratings && item.ratings.length
        ? item.ratings.reduce((sum: number, rating: any) => sum + rating.value, 0) / item.ratings.length
        : undefined;

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        servings: item.servings,
        difficulty: item.difficulty,
        cuisine: item.cuisine,
        dietaryTypes: item.dietary_types,
        instructions: item.instructions,
        author: item.author_id,
        ratings: item.ratings || [],
        averageRating: averageRating,
        ingredients: []
      } as Recipe;
    });
  },
  
  async isSaved(recipeId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('id')
      .match({
        recipe_id: recipeId,
        user_id: userId
      })
      .maybeSingle();
    
    if (error) throw error;
    return !!data;
  }
};
