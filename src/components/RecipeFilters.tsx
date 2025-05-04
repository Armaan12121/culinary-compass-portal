
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CUISINES, DIETARY_TYPES } from "@/types";

interface RecipeFiltersProps {
  onFilterChange: (filters: {
    cuisines: string[];
    dietaryTypes: string[];
    difficulty: string;
  }) => void;
}

const RecipeFilters = ({ onFilterChange }: RecipeFiltersProps) => {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietaryTypes, setSelectedDietaryTypes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("all");

  const toggleCuisine = (cuisine: string) => {
    const updatedCuisines = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine];
    
    setSelectedCuisines(updatedCuisines);
    updateFilters(updatedCuisines, selectedDietaryTypes, difficulty);
  };

  const toggleDietaryType = (diet: string) => {
    const updatedDiets = selectedDietaryTypes.includes(diet)
      ? selectedDietaryTypes.filter(d => d !== diet)
      : [...selectedDietaryTypes, diet];
    
    setSelectedDietaryTypes(updatedDiets);
    updateFilters(selectedCuisines, updatedDiets, difficulty);
  };

  const setDifficultyFilter = (value: string) => {
    setDifficulty(value);
    updateFilters(selectedCuisines, selectedDietaryTypes, value);
  };

  const updateFilters = (cuisines: string[], dietaryTypes: string[], diff: string) => {
    onFilterChange({ cuisines, dietaryTypes, difficulty: diff });
  };

  return (
    <div className="py-8 space-y-6">
      <div>
        <h3 className="font-playfair font-semibold mb-3 text-lg">Difficulty</h3>
        <Tabs defaultValue="all" onValueChange={setDifficultyFilter}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Levels</TabsTrigger>
            <TabsTrigger value="easy">Easy</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <h3 className="font-playfair font-semibold mb-3 text-lg">Cuisines</h3>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((cuisine) => (
            <Button
              key={cuisine}
              variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
              size="sm"
              className={
                selectedCuisines.includes(cuisine)
                  ? "bg-recipe-orange hover:bg-recipe-orange/90"
                  : ""
              }
              onClick={() => toggleCuisine(cuisine)}
            >
              {cuisine}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-playfair font-semibold mb-3 text-lg">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TYPES.map((diet) => (
            <Button
              key={diet}
              variant={selectedDietaryTypes.includes(diet) ? "default" : "outline"}
              size="sm"
              className={
                selectedDietaryTypes.includes(diet)
                  ? "bg-recipe-sage hover:bg-recipe-sage/90"
                  : ""
              }
              onClick={() => toggleDietaryType(diet)}
            >
              {diet}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;
