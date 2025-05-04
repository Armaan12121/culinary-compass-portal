
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import CategorySection from "@/components/CategorySection";
import RecipeFilters from "@/components/RecipeFilters";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
import { Recipe } from "@/types";
import { recipeService } from "@/services/recipeService";
import { useToast } from "@/components/ui/use-toast";
import { profileService } from "@/services/profileService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChefHat, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    cuisines: [] as string[],
    dietaryTypes: [] as string[],
    difficulty: "all",
  });
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [topRatedRecipes, setTopRatedRecipes] = useState<Recipe[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableDietaryTypes, setAvailableDietaryTypes] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Load recipes and filter options from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cuisines and dietary types
        const cuisines = await profileService.getCuisines();
        const dietaryTypes = await profileService.getDietaryTypes();
        setAvailableCuisines(cuisines);
        setAvailableDietaryTypes(dietaryTypes);

        // Load all recipes
        const allRecipes = await recipeService.getRecipes();
        setRecipes(allRecipes);

        // Get top rated recipes
        const topRated = [...allRecipes]
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 3);
        setTopRatedRecipes(topRated);
      } catch (error: any) {
        console.error("Error fetching recipes:", error);
        toast({
          title: "Error loading recipes",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Filter recipes based on search query and filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      const filteredRecipes = await recipeService.getRecipes({
        cuisines: filters.cuisines,
        dietaryTypes: filters.dietaryTypes,
        difficulty: filters.difficulty === "all" ? undefined : filters.difficulty,
        searchQuery: searchQuery
      });
      setRecipes(filteredRecipes);
    } catch (error: any) {
      console.error("Error applying filters:", error);
      toast({
        title: "Error filtering recipes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when search or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery]);

  // Handle search input changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: {
    cuisines: string[];
    dietaryTypes: string[];
    difficulty: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      <main>
        <HeroSection />

        {/* Create Recipe Button (for authenticated users) */}
        {user && (
          <div className="container mx-auto px-4 md:px-6 py-6">
            <Button 
              className="bg-recipe-olive hover:bg-recipe-olive/90 flex items-center gap-2"
              asChild
            >
              <Link to="/create-recipe">
                <ChefHat className="h-4 w-4" />
                Create New Recipe
              </Link>
            </Button>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 py-8">
          <RecipeFilters 
            onFilterChange={handleFilterChange}
            availableCuisines={availableCuisines}
            availableDietaryTypes={availableDietaryTypes}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-recipe-orange" />
          </div>
        ) : recipes.length > 0 ? (
          <FeaturedSection
            title="Recipes For You"
            description={
              searchQuery || filters.cuisines.length > 0 || filters.dietaryTypes.length > 0 || filters.difficulty !== "all"
                ? "Based on your search and preferences"
                : "Personalized recipe recommendations just for you"
            }
            recipes={recipes}
          />
        ) : (
          <div className="container mx-auto px-4 md:px-6 py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find more recipes.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  cuisines: [],
                  dietaryTypes: [],
                  difficulty: "all",
                });
              }}
            >
              Clear filters
            </Button>
          </div>
        )}

        <CategorySection />

        {topRatedRecipes.length > 0 && (
          <FeaturedSection
            title="Top Rated Recipes"
            description="Loved by our community of home cooks"
            recipes={topRatedRecipes}
          />
        )}

        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
