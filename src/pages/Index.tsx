
import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedSection from "@/components/FeaturedSection";
import CategorySection from "@/components/CategorySection";
import RecipeFilters from "@/components/RecipeFilters";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
import { mockRecipes } from "@/data/mockData";
import { Recipe } from "@/types";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    cuisines: [] as string[],
    dietaryTypes: [] as string[],
    difficulty: "all",
  });

  // Filter recipes based on search query and filters
  const filteredRecipes = mockRecipes.filter((recipe) => {
    // Search filter
    if (
      searchQuery &&
      !recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Cuisine filter
    if (filters.cuisines.length > 0 && !filters.cuisines.includes(recipe.cuisine)) {
      return false;
    }

    // Dietary filter
    if (filters.dietaryTypes.length > 0) {
      const hasAllDietaryTypes = filters.dietaryTypes.every(diet => 
        recipe.dietaryTypes.includes(diet)
      );
      if (!hasAllDietaryTypes) return false;
    }

    // Difficulty filter
    if (filters.difficulty !== "all" && recipe.difficulty !== filters.difficulty) {
      return false;
    }

    return true;
  });

  // Get top rated recipes
  const topRatedRecipes = [...mockRecipes]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3);

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

        <div className="container mx-auto px-4 md:px-6 py-8">
          <RecipeFilters onFilterChange={handleFilterChange} />
        </div>

        {filteredRecipes.length > 0 ? (
          <FeaturedSection
            title="Recipes For You"
            description={
              searchQuery || filters.cuisines.length > 0 || filters.dietaryTypes.length > 0 || filters.difficulty !== "all"
                ? "Based on your search and preferences"
                : "Personalized recipe recommendations just for you"
            }
            recipes={filteredRecipes}
          />
        ) : (
          <div className="container mx-auto px-4 md:px-6 py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find more recipes.
            </p>
          </div>
        )}

        <CategorySection />

        <FeaturedSection
          title="Top Rated Recipes"
          description="Loved by our community of home cooks"
          recipes={topRatedRecipes}
          viewAllLink="#"
        />

        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
