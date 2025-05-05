
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const Profile = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/sign-in");
    }

    if (user) {
      setName(user.name);
      
      // Safely access preferences object with type checking
      const preferences = user.preferences;
      
      // Set form state
      setSelectedCuisines(preferences.cuisines || []);
      setSelectedDietaryRestrictions(preferences.dietaryRestrictions || []);
      setSkillLevel(preferences.skillLevel || "beginner");
    }
  }, [user, isLoading, navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name,
          preferences: {
            cuisines: selectedCuisines,
            dietaryRestrictions: selectedDietaryRestrictions,
            skillLevel
          },
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      toast.error("Failed to update profile", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/sign-in");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      toast.error("Failed to sign out", { description: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-24 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect in the useEffect
  }

  const cuisineOptions = [
    "Italian", "Mexican", "Chinese", "Japanese", "Indian", 
    "Thai", "French", "Mediterranean", "American", "Middle Eastern"
  ];

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
    "Keto", "Paleo", "Low-Carb", "Low-Fat", "Nut-Free"
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-recipe-orange text-white text-xl">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="bg-white rounded-lg shadow-md">
        <TabsList className="w-full border-b">
          <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1">Preferences</TabsTrigger>
          <TabsTrigger value="savedRecipes" className="flex-1">Saved Recipes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="p-6 space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="max-w-md"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={user.email} 
              disabled 
              className="max-w-md bg-muted/50"
            />
          </div>
          
          <Button 
            onClick={handleSaveProfile} 
            className="bg-recipe-orange hover:bg-recipe-orange/90"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </TabsContent>
        
        <TabsContent value="preferences" className="p-6 space-y-6">
          <div>
            <h3 className="font-medium mb-3">Skill Level</h3>
            <Select value={skillLevel} onValueChange={(value: "beginner" | "intermediate" | "advanced") => setSkillLevel(value)}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select skill level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Favorite Cuisines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cuisineOptions.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cuisine-${cuisine}`}
                    checked={selectedCuisines.includes(cuisine)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCuisines([...selectedCuisines, cuisine]);
                      } else {
                        setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
                      }
                    }}
                  />
                  <label htmlFor={`cuisine-${cuisine}`}>{cuisine}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3">Dietary Restrictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dietaryOptions.map((diet) => (
                <div key={diet} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`diet-${diet}`}
                    checked={selectedDietaryRestrictions.includes(diet)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedDietaryRestrictions([...selectedDietaryRestrictions, diet]);
                      } else {
                        setSelectedDietaryRestrictions(selectedDietaryRestrictions.filter(d => d !== diet));
                      }
                    }}
                  />
                  <label htmlFor={`diet-${diet}`}>{diet}</label>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleSaveProfile} 
            className="bg-recipe-orange hover:bg-recipe-orange/90"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </TabsContent>
        
        <TabsContent value="savedRecipes" className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You haven't saved any recipes yet.</p>
            <Button onClick={() => navigate("/")} variant="outline">Browse Recipes</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
