
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import { getAllRecipes } from "@/services/recipeService";
import { Recipe } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [userSavedRecipes, setUserSavedRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session?.user) {
          navigate("/sign-in");
          return;
        }

        const userId = session.session.user.id;
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        if (profile) {
          // Convert the jsonb preferences to the expected TypeScript type
          const preferences = profile.preferences ? {
            cuisines: Array.isArray(profile.preferences.cuisines) ? profile.preferences.cuisines : [],
            dietaryRestrictions: Array.isArray(profile.preferences.dietaryRestrictions) ? profile.preferences.dietaryRestrictions : [],
            skillLevel: (profile.preferences.skillLevel === 'beginner' || 
                          profile.preferences.skillLevel === 'intermediate' || 
                          profile.preferences.skillLevel === 'advanced') 
                        ? profile.preferences.skillLevel 
                        : 'beginner'
          } : {
            cuisines: [],
            dietaryRestrictions: [],
            skillLevel: "beginner"
          };
          
          const userData: User = {
            id: profile.id,
            name: profile.full_name || "",
            email: session.session.user.email || "",
            preferences: preferences,
            savedRecipes: []
          };

          setUser(userData);
          setUsername(profile.username || "");
          setFullName(profile.full_name || "");
          setEmail(session.session.user.email || "");
          
          // Fetch saved recipes
          const { data: savedRecipesData, error: savedRecipesError } = await supabase
            .from("saved_recipes")
            .select("recipe_id")
            .eq("user_id", userId);
            
          if (savedRecipesError) {
            throw savedRecipesError;
          }
          
          const recipeIds = savedRecipesData.map(item => item.recipe_id);
          setSavedRecipes(recipeIds);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

  // Fetch actual recipe data for saved recipes
  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (savedRecipes.length === 0) {
        setUserSavedRecipes([]);
        setLoadingRecipes(false);
        return;
      }

      try {
        setLoadingRecipes(true);
        const allRecipes = await getAllRecipes();
        const filtered = allRecipes.filter(recipe => 
          savedRecipes.includes(recipe.id)
        );
        setUserSavedRecipes(filtered);
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        toast({
          title: "Error",
          description: "Failed to load saved recipes.",
          variant: "destructive"
        });
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchSavedRecipes();
  }, [savedRecipes, toast]);

  const handleSearch = (query: string) => {
    // Search functionality
    console.log("Search for:", query);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          full_name: fullName
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onSearch={handleSearch} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-full">
            <p>Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onSearch={handleSearch} />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="max-w-md">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <Button type="submit" disabled={updating}>
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="saved">
              {loadingRecipes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg overflow-hidden shadow">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userSavedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSavedRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No saved recipes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse recipes and click the heart icon to save your favorites.
                  </p>
                  <Button onClick={() => navigate('/')}>Browse Recipes</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <div className="max-w-md">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Preferred Cuisines</h3>
                    <div className="flex flex-wrap gap-2">
                      {user?.preferences.cuisines.length ? (
                        user.preferences.cuisines.map((cuisine, index) => (
                          <div key={index} className="bg-recipe-orange/20 text-recipe-orange px-3 py-1 rounded-full text-sm">
                            {cuisine}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No preferred cuisines set</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Dietary Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {user?.preferences.dietaryRestrictions.length ? (
                        user.preferences.dietaryRestrictions.map((diet, index) => (
                          <div key={index} className="bg-recipe-olive/20 text-recipe-olive px-3 py-1 rounded-full text-sm">
                            {diet}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No dietary restrictions set</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Skill Level</h3>
                    <div className="bg-muted/50 px-3 py-1 rounded-full text-sm inline-block capitalize">
                      {user?.preferences.skillLevel || "beginner"}
                    </div>
                  </div>
                  
                  <Button onClick={() => toast({
                    title: "Coming Soon",
                    description: "Preference editing will be available soon!"
                  })}>
                    Edit Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
