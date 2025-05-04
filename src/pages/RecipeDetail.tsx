
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { recipeService } from "@/services/recipeService";
import { useAuth } from "@/contexts/AuthContext";
import { Recipe } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock,
  ChefHat,
  Users,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Printer,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        if (!id) return;
        const recipeData = await recipeService.getRecipeById(id);
        setRecipe(recipeData);

        // Check if recipe is saved
        if (user) {
          const isSaved = await recipeService.isSaved(id, user.id);
          setSaved(isSaved);
        }
      } catch (error: any) {
        console.error("Error loading recipe:", error);
        toast({
          title: "Error",
          description: `Failed to load recipe: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, user, toast]);

  const handleToggleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save recipes",
        variant: "default"
      });
      return;
    }

    try {
      setSavingRecipe(true);
      if (saved) {
        await recipeService.unsaveRecipe(id!, user.id);
        toast({ title: "Recipe removed from saved recipes" });
      } else {
        await recipeService.saveRecipe(id!, user.id);
        toast({ title: "Recipe saved to your collection" });
      }
      setSaved(!saved);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSavingRecipe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-recipe-orange" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-playfair mb-4">Recipe not found</h1>
            <p className="mb-6">The recipe you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/">Browse Recipes</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div
          className="relative h-96 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)), url(${recipe.imageUrl || "/placeholder.svg"})`
          }}
        >
          <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 text-white bg-black/20 hover:bg-black/40"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to recipes
              </Link>
            </Button>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-recipe-orange">{recipe.cuisine}</Badge>
              {recipe.dietaryTypes.map((diet) => (
                <Badge key={diet} variant="outline" className="text-white border-white">
                  {diet}
                </Badge>
              ))}
              <Badge
                className={`${
                  recipe.difficulty === "easy"
                    ? "bg-green-600"
                    : recipe.difficulty === "medium"
                    ? "bg-amber-500"
                    : "bg-red-600"
                }`}
              >
                {recipe.difficulty}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-white mb-2">
              {recipe.title}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">{recipe.description}</p>

            <div className="flex items-center mt-4 text-white/80 space-x-6">
              {recipe.averageRating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(recipe.averageRating!)
                          ? "fill-recipe-orange text-recipe-orange"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                  <span className="ml-1">
                    {recipe.averageRating.toFixed(1)} ({recipe.ratings.length})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3 space-y-10">
              {/* Recipe Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-md">
                  <Clock className="h-6 w-6 text-recipe-orange mb-2" />
                  <span className="text-sm text-muted-foreground">Prep Time</span>
                  <span className="font-semibold">{recipe.prepTime} min</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-md">
                  <ChefHat className="h-6 w-6 text-recipe-orange mb-2" />
                  <span className="text-sm text-muted-foreground">Cook Time</span>
                  <span className="font-semibold">{recipe.cookTime} min</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-md">
                  <Users className="h-6 w-6 text-recipe-orange mb-2" />
                  <span className="text-sm text-muted-foreground">Servings</span>
                  <span className="font-semibold">{recipe.servings}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-muted rounded-md">
                  <Star className="h-6 w-6 text-recipe-orange mb-2" />
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="font-semibold">
                    {recipe.averageRating ? recipe.averageRating.toFixed(1) : "No ratings"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-playfair text-2xl mb-4">About This Recipe</h2>
                <p className="text-muted-foreground">{recipe.description}</p>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant={saved ? "default" : "outline"}
                    className={saved ? "bg-recipe-orange hover:bg-recipe-orange/90" : ""}
                    onClick={handleToggleSave}
                    disabled={savingRecipe}
                  >
                    {savingRecipe ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 mr-2 ${saved ? "fill-current" : ""}`} />
                    )}
                    {saved ? "Saved" : "Save Recipe"}
                  </Button>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Ingredients */}
              <div>
                <h2 className="font-playfair text-2xl mb-6">Ingredients</h2>
                <Card className="p-6">
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-6 w-6 rounded-full border border-recipe-orange flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-recipe-orange">{index + 1}</span>
                        </div>
                        <span>
                          {ingredient.amount} {ingredient.unit} {ingredient.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="font-playfair text-2xl mb-6">Instructions</h2>
                <ol className="space-y-8">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="ml-10 relative">
                      <span className="absolute -left-10 font-playfair text-2xl text-recipe-orange font-bold">
                        {index + 1}.
                      </span>
                      <p className="text-muted-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <Separator />

              {/* Reviews */}
              <div>
                <h2 className="font-playfair text-2xl mb-6">Reviews</h2>
                {recipe.ratings.length > 0 ? (
                  <div className="space-y-6">
                    {recipe.ratings.map((rating, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating.value
                                    ? "fill-recipe-orange text-recipe-orange"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">User</span>
                        </div>
                        {rating.comment && <p className="text-sm">{rating.comment}</p>}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                )}

                {user ? (
                  <Button className="mt-6 bg-recipe-orange hover:bg-recipe-orange/90">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Write a Review
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="mt-6">
                    <Link to="/auth/sign-in">Sign in to write a review</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RecipeDetail;
