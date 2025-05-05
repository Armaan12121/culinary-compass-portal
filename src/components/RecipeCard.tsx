
import { useState, useEffect } from "react";
import { Heart, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Recipe } from "@/types";
import { isRecipeSavedByUser, saveRecipeForUser, unsaveRecipeForUser } from "@/services/recipeService";
import { supabase } from "@/integrations/supabase/client";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { title, description, imageUrl, prepTime, cookTime, difficulty, cuisine, averageRating } = recipe;
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const totalTime = prepTime + cookTime;

  // Check if the user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUserId(data.session.user.id);
        
        // Check if this recipe is saved by the user
        if (recipe.id) {
          try {
            const saved = await isRecipeSavedByUser(recipe.id, data.session.user.id);
            setIsSaved(saved);
          } catch (error) {
            console.error("Error checking if recipe is saved:", error);
          }
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserId(session?.user?.id || null);
        
        if (session?.user && recipe.id) {
          try {
            const saved = await isRecipeSavedByUser(recipe.id, session.user.id);
            setIsSaved(saved);
          } catch (error) {
            console.error("Error checking if recipe is saved:", error);
          }
        } else {
          setIsSaved(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [recipe.id]);

  const handleSaveToggle = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save recipes",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isSaved) {
        await unsaveRecipeForUser(recipe.id, userId);
        setIsSaved(false);
        toast({
          title: "Recipe unsaved",
          description: `${title} has been removed from your saved recipes`,
        });
      } else {
        await saveRecipeForUser(recipe.id, userId);
        setIsSaved(true);
        toast({
          title: "Recipe saved",
          description: `${title} has been added to your saved recipes`,
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
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className={`absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0 ${
            isSaved ? "text-recipe-red" : ""
          }`}
          onClick={handleSaveToggle}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-recipe-red text-recipe-red" : "text-recipe-red"}`} />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-1">
            <span className="bg-recipe-orange text-white px-2 py-0.5 text-xs rounded-full">
              {cuisine}
            </span>
            <span className="bg-recipe-olive/80 text-white px-2 py-0.5 text-xs rounded-full capitalize">
              {difficulty}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-playfair font-semibold text-lg line-clamp-1">{title}</h3>
          {averageRating ? (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-recipe-orange text-recipe-orange" />
              <span className="text-sm font-medium ml-1">{typeof averageRating === 'number' ? averageRating.toFixed(1) : averageRating}</span>
            </div>
          ) : null}
        </div>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-xs">{totalTime} min</span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs hover:bg-recipe-orange hover:text-white"
          asChild
        >
          <Link to={`/recipe/${recipe.id}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
