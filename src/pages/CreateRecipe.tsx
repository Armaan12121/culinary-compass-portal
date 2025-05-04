
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileService } from "@/services/profileService";
import { recipeService } from "@/services/recipeService";
import { Ingredient, Recipe } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronLeft, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableDietaryTypes, setAvailableDietaryTypes] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState("basic");

  // Recipe fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [cuisine, setCuisine] = useState("");
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: 1, unit: "cup" }
  ]);
  const [instructions, setInstructions] = useState<string[]>(["", ""]);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
        const cuisines = await profileService.getCuisines();
        const dietaryTypes = await profileService.getDietaryTypes();
        setAvailableCuisines(cuisines);
        setAvailableDietaryTypes(dietaryTypes);
        
        if (cuisines.length > 0) {
          setCuisine(cuisines[0]);
        }
      } catch (error: any) {
        console.error("Error loading form options:", error);
        toast({
          title: "Error",
          description: `Failed to load form options: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [toast]);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to create recipes",
        variant: "destructive"
      });
      navigate("/auth/sign-in");
    }
  }, [user, navigate, toast]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: 1, unit: "cup" }]);
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setIngredients(updatedIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...instructions];
    updatedInstructions[index] = value;
    setInstructions(updatedInstructions);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate fields
    if (
      !title.trim() || 
      !description.trim() || 
      !cuisine || 
      ingredients.some(ing => !ing.name.trim()) ||
      instructions.some(inst => !inst.trim())
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name.trim());
      const validInstructions = instructions.filter(inst => inst.trim());
      
      // Create recipe object
      const recipe: Omit<Recipe, 'id' | 'ratings' | 'averageRating'> = {
        title,
        description,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Default image if none provided
        prepTime,
        cookTime,
        servings,
        difficulty,
        cuisine,
        dietaryTypes,
        ingredients: validIngredients,
        instructions: validInstructions,
        author: user.id,
      };

      const recipeId = await recipeService.createRecipe(recipe);
      
      toast({
        title: "Recipe created",
        description: "Your recipe has been created successfully!",
      });
      
      navigate(`/recipe/${recipeId}`);
    } catch (error: any) {
      console.error("Error creating recipe:", error);
      toast({
        title: "Error",
        description: `Failed to create recipe: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <h1 className="text-3xl font-playfair mb-6">Create New Recipe</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <Tabs value={activeStep} onValueChange={setActiveStep}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Homemade Pasta Carbonara"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your recipe in a few sentences"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a URL to an image of your recipe
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={prepTime}
                      onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                    <Input
                      id="cookTime"
                      type="number"
                      value={cookTime}
                      onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                      min={0}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 0)}
                      min={1}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine <span className="text-red-500">*</span></Label>
                    <Select
                      value={cuisine}
                      onValueChange={setCuisine}
                      required
                    >
                      <SelectTrigger id="cuisine">
                        <SelectValue placeholder="Select cuisine" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCuisines.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Dietary Types</Label>
                    <MultiSelect
                      options={availableDietaryTypes.map(type => ({ value: type, label: type }))}
                      selected={dietaryTypes}
                      onChange={setDietaryTypes}
                      placeholder="Select dietary types..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveStep("ingredients")}
                    className="bg-recipe-orange hover:bg-recipe-orange/90"
                  >
                    Next: Ingredients
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="ingredients" className="space-y-6">
                <h2 className="text-xl font-playfair">Ingredients</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  List all ingredients needed for your recipe
                </p>
                
                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-2">
                        <Label htmlFor={`amount-${index}`}>Amount</Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(index, "amount", parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.1}
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <Label htmlFor={`unit-${index}`}>Unit</Label>
                        <Input
                          id={`unit-${index}`}
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                          placeholder="e.g. cup, tbsp, g"
                        />
                      </div>
                      
                      <div className="col-span-6">
                        <Label htmlFor={`name-${index}`}>Ingredient Name</Label>
                        <Input
                          id={`name-${index}`}
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(index, "name", e.target.value)}
                          placeholder="e.g. all-purpose flour"
                          required
                        />
                      </div>
                      
                      <div className="col-span-1 pt-7">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => removeIngredient(index)}
                          disabled={ingredients.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIngredient}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Ingredient
                </Button>
                
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    onClick={() => setActiveStep("basic")}
                    variant="outline"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => setActiveStep("instructions")}
                    className="bg-recipe-orange hover:bg-recipe-orange/90"
                  >
                    Next: Instructions
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="instructions" className="space-y-6">
                <h2 className="text-xl font-playfair">Instructions</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide step-by-step instructions on how to prepare your recipe
                </p>
                
                <div className="space-y-6">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="min-w-8 h-8 rounded-full bg-recipe-orange text-white flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <Textarea
                          value={instruction}
                          onChange={(e) => updateInstruction(index, e.target.value)}
                          placeholder={`Step ${index + 1}: e.g. Preheat the oven to 350°F`}
                          required
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeInstruction(index)}
                        disabled={instructions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addInstruction}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Step
                </Button>
                
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    onClick={() => setActiveStep("ingredients")}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                className="bg-recipe-olive hover:bg-recipe-olive/90"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Recipe...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Recipe
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default CreateRecipe;
