
import { Heart, Clock, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const { title, description, imageUrl, prepTime, cookTime, difficulty, cuisine, averageRating } = recipe;

  const totalTime = prepTime + cookTime;

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
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full h-8 w-8 p-0"
        >
          <Heart className="h-4 w-4 text-recipe-red" />
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
          {averageRating && (
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
        >
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecipeCard;
