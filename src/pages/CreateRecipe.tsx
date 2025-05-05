
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CUISINES, DIETARY_TYPES } from "@/types";
import { saveRecipe } from "@/services/recipeService";
import { supabase } from "@/integrations/supabase/client";

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cuisine, setCuisine] = useState("");
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);
  
  const [ingredients, setIngredients] = useState([
    { name: "", amount: 1, unit: "" }
  ]);
  
  const [instructions, setInstructions] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create recipes",
          variant: "destructive",
        });
        navigate("/sign-in");
        return;
      }
      
      setUserId(data.session.user.id);
    };
    
    checkAuth();
  }, [navigate, toast]);

  const handleSearch = (query: string) => {
    // Search functionality
    console.log("Search for:", query);
  };

  const handleDietaryChange = (diet: string) => {
    setDietaryTypes(prev => {
      if (prev.includes(diet)) {
        return prev.filter(item => item !== diet);
      } else {
        return [...prev, diet];
      }
    });
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: 1, unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create recipes",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation
    if (!title.trim() || !description.trim() || !imageUrl.trim() || !cuisine) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (ingredients.some(i => !i.name.trim() || !i.unit.trim())) {
      toast({
        title: "Incomplete ingredients",
        description: "Please fill out all ingredient fields",
        variant: "destructive"
      });
      return;
    }
    
    if (instructions.some(i => !i.trim())) {
      toast({
        title: "Incomplete instructions",
        description: "Please fill out all instruction steps",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const recipeData = {
        title,
        description,
        imageUrl,
        prepTime,
        cookTime,
        servings,
        difficulty,
        cuisine,
        dietaryTypes,
        ingredients,
        instructions: instructions.filter(i => i.trim()),
        author_id: userId,
      };
      
      const savedRecipe = await saveRecipe(recipeData);
      
      toast({
        title: "Recipe created!",
        description: "Your recipe has been successfully created."
      });
      
      navigate(`/recipe/${savedRecipe.id}`);
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your recipe. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-8 font-playfair">Create New Recipe</h1>
          
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Recipe Title*</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Classic Spaghetti Carbonara"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Briefly describe your recipe"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">Image URL*</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="prepTime">Prep Time (min)*</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      min="0"
                      value={prepTime}
                      onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min)*</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      min="0"
                      value={cookTime}
                      onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="servings">Servings*</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficulty Level*</Label>
                  <Select 
                    value={difficulty} 
                    onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cuisine">Cuisine*</Label>
                  <Select 
                    value={cuisine} 
                    onValueChange={setCuisine}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      {CUISINES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block mb-2">Dietary Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_TYPES.map((diet) => (
                      <Button
                        key={diet}
                        type="button"
                        variant={dietaryTypes.includes(diet) ? "default" : "outline"}
                        size="sm"
                        className={dietaryTypes.includes(diet) ? "bg-recipe-olive hover:bg-recipe-olive/90" : ""}
                        onClick={() => handleDietaryChange(diet)}
                      >
                        {diet}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Ingredients*</h3>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex flex-wrap gap-2 items-end">
                    <div className="w-20">
                      <Label htmlFor={`amount-${index}`}>Amount*</Label>
                      <Input
                        id={`amount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={ingredient.amount}
                        onChange={(e) => updateIngredient(index, "amount", parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    
                    <div className="w-24">
                      <Label htmlFor={`unit-${index}`}>Unit*</Label>
                      <Input
                        id={`unit-${index}`}
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        placeholder="g, cup, tbsp"
                        required
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Label htmlFor={`ingredient-${index}`}>Ingredient*</Label>
                      <Input
                        id={`ingredient-${index}`}
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        placeholder="e.g., Flour"
                        required
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={addIngredient}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Instructions*</h3>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-2 flex-shrink-0 w-6 h-6 rounded-full bg-recipe-orange text-white flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        required
                        className="min-h-[80px]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      disabled={instructions.length <= 1}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={addInstruction}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full md:w-auto bg-recipe-orange hover:bg-recipe-orange/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Recipe..." : "Create Recipe"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateRecipe;
