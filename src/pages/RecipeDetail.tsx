
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Users, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getRecipeById, isRecipeSavedByUser, saveRecipeForUser, unsaveRecipeForUser } from "@/services/recipeService";
import { Recipe } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return;
      
      try {
        const recipe = await getRecipeById(id);
        setRecipe(recipe);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast({
          title: "Error",
          description: "Failed to load the recipe. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        
        // Check if this recipe is saved by the user
        if (id) {
          try {
            const saved = await isRecipeSavedByUser(id, data.session.user.id);
            setIsSaved(saved);
          } catch (error) {
            console.error("Error checking if recipe is saved:", error);
          }
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
      
      if (session?.user && id) {
        isRecipeSavedByUser(id, session.user.id)
          .then(saved => setIsSaved(saved))
          .catch(err => console.error("Error checking if recipe is saved:", err));
      } else {
        setIsSaved(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [id]);

  const handleSearch = (query: string) => {
    // Search functionality would be implemented here
    console.log("Search for:", query);
  };

  const handleSaveToggle = async () => {
    if (!userId || !id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSaved) {
        await unsaveRecipeForUser(id, userId);
        setIsSaved(false);
        toast({
          title: "Recipe unsaved",
          description: `${recipe?.title} has been removed from your saved recipes`,
        });
      } else {
        await saveRecipeForUser(id, userId);
        setIsSaved(true);
        toast({
          title: "Recipe saved",
          description: `${recipe?.title} has been added to your saved recipes`,
        });
      }
    } catch (error) {
      console.error("Error saving/unsaving recipe:", error);
      toast({
        title: "Error",
        description: "There was a problem saving this recipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="mb-6">
            <Button variant="ghost" className="group mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Recipes
              </Link>
            </Button>
            
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-24" />
              </div>
            ) : recipe ? (
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
                    {recipe.title}
                  </h1>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1"
                    onClick={handleSaveToggle}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-recipe-red text-recipe-red" : ""}`} />
                    {isSaved ? "Saved" : "Save Recipe"}
                  </Button>
                </div>
                <p className="text-muted-foreground text-lg mb-4">{recipe.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-2 flex-col">
                    <Clock className="h-5 w-5 text-recipe-orange" />
                    <div className="text-center">
                      <div className="font-semibold">{recipe.prepTime + recipe.cookTime} min</div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-2 flex-col">
                    <div className="capitalize font-semibold">{recipe.difficulty}</div>
                    <div className="text-sm text-muted-foreground">Difficulty</div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center gap-2 flex-col">
                    <Users className="h-5 w-5 text-recipe-orange" />
                    <div className="text-center">
                      <div className="font-semibold">{recipe.servings}</div>
                      <div className="text-sm text-muted-foreground">Servings</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-baseline gap-2">
                          <div className="h-2 w-2 rounded-full bg-recipe-orange mt-1"></div>
                          <span>
                            {ingredient.amount} {ingredient.unit} {ingredient.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
                    <ol className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-recipe-orange text-white flex items-center justify-center">
                            {index + 1}
                          </div>
                          <p>{instruction}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
                
                {recipe.ratings && recipe.ratings.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
                    <div className="flex items-center mb-4">
                      <Star className="h-6 w-6 fill-recipe-orange text-recipe-orange mr-2" />
                      <span className="text-2xl font-bold mr-2">
                        {typeof recipe.averageRating === 'number' ? recipe.averageRating.toFixed(1) : recipe.averageRating}
                      </span>
                      <span className="text-muted-foreground">({recipe.ratings.length} reviews)</span>
                    </div>
                    
                    <div className="space-y-4">
                      {recipe.ratings.map((rating, index) => (
                        <div key={index} className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="bg-recipe-orange/20 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                                <User className="h-4 w-4" />
                              </div>
                              <div className="font-medium">User</div>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-recipe-orange text-recipe-orange" />
                              <span className="text-sm font-medium ml-1">{rating.value}</span>
                            </div>
                          </div>
                          {rating.comment && <p className="text-sm">{rating.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">Recipe not found</h2>
                <p className="text-muted-foreground mb-4">
                  The recipe you're looking for doesn't exist or may have been removed.
                </p>
                <Button asChild>
                  <Link to="/">Browse Recipes</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecipeDetail;
