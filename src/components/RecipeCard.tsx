
import { Heart, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { recipeService } from "@/services/recipeService";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { title, description, imageUrl, prepTime, cookTime, difficulty, cuisine, averageRating, id } = recipe;
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const totalTime = prepTime + cookTime;

  // Check if recipe is saved when the user is authenticated
  const checkIfSaved = async () => {
    if (user) {
      try {
        const saved = await recipeService.isSaved(id, user.id);
        setIsSaved(saved);
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
      }
    }
  };

  // Call the function when the component mounts
  useState(() => {
    checkIfSaved();
  });

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save recipes",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      if (isSaved) {
        await recipeService.unsaveRecipe(id, user.id);
        toast({ title: "Recipe removed from your saved recipes" });
      } else {
        await recipeService.saveRecipe(id, user.id);
        toast({ title: "Recipe saved to your collection" });
      }
      setIsSaved(!isSaved);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
          onClick={handleSaveClick}
          disabled={isSaving}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-recipe-red text-recipe-red" : "text-recipe-red"}`} />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="flex items-center gap-1">
            <span className="bg-recipe-orange text-white px-2 py-0.5 text-xs rounded-full">
              {cuisine}
            </span>
            <span className={`text-white px-2 py-0.5 text-xs rounded-full capitalize ${
              difficulty === "easy" 
                ? "bg-green-600" 
                : difficulty === "medium" 
                ? "bg-amber-500" 
                : "bg-red-600"
            }`}>
              {difficulty}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-playfair font-semibold text-lg line-clamp-1">{title}</h3>
          {averageRating !== undefined && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-recipe-orange text-recipe-orange" />
              <span className="text-sm font-medium ml-1">{averageRating.toFixed(1)}</span>
            </div>
          )}
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
          <Link to={`/recipe/${id}`}>View Recipe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
