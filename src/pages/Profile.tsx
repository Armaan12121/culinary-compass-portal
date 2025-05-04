
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/MultiSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { profileService } from "@/services/profileService";
import { recipeService } from "@/services/recipeService";
import { useToast } from "@/components/ui/use-toast";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Save, Upload } from "lucide-react";

const Profile = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableDietaryTypes, setAvailableDietaryTypes] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<{
    cuisines: string[];
    dietaryRestrictions: string[];
    skillLevel: string;
  }>({
    cuisines: [],
    dietaryRestrictions: [],
    skillLevel: "beginner"
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setFullName(profile.full_name || "");
      setPreferences(profile.preferences || {
        cuisines: [],
        dietaryRestrictions: [],
        skillLevel: "beginner"
      });
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load available cuisines and dietary types
        const cuisines = await profileService.getCuisines();
        const dietaryTypes = await profileService.getDietaryTypes();
        setAvailableCuisines(cuisines);
        setAvailableDietaryTypes(dietaryTypes);

        // Load saved recipes if user is logged in
        if (user) {
          const saved = await recipeService.getSavedRecipes(user.id);
          setSavedRecipes(saved);
        }
      } catch (error: any) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Error",
          description: `Failed to load profile data: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaveLoading(true);
    try {
      await updateProfile({
        username,
        full_name: fullName,
        preferences
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-playfair mb-4">Please sign in</h1>
            <p className="mb-6">You need to be signed in to view your profile.</p>
            <Button asChild>
              <a href="/auth/sign-in">Sign In</a>
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-playfair mb-6">My Profile</h1>

          <Tabs defaultValue="preferences">
            <TabsList className="mb-6">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
              <TabsTrigger value="account">Account Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Your Preferences</CardTitle>
                  <CardDescription>
                    Update your cooking preferences to get personalized recipe recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-recipe-orange" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <Label>Favorite Cuisines</Label>
                        <MultiSelect
                          options={availableCuisines.map(cuisine => ({ value: cuisine, label: cuisine }))}
                          selected={preferences.cuisines}
                          onChange={(selected) => setPreferences({...preferences, cuisines: selected})}
                          placeholder="Select cuisines..."
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Dietary Restrictions</Label>
                        <MultiSelect
                          options={availableDietaryTypes.map(type => ({ value: type, label: type }))}
                          selected={preferences.dietaryRestrictions}
                          onChange={(selected) => setPreferences({...preferences, dietaryRestrictions: selected})}
                          placeholder="Select dietary restrictions..."
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Cooking Skill Level</Label>
                        <RadioGroup
                          value={preferences.skillLevel}
                          onValueChange={(value) => setPreferences({...preferences, skillLevel: value})}
                          className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="beginner" id="beginner" />
                            <Label htmlFor="beginner">Beginner</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="intermediate" id="intermediate" />
                            <Label htmlFor="intermediate">Intermediate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advanced" id="advanced" />
                            <Label htmlFor="advanced">Advanced</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-recipe-orange hover:bg-recipe-orange/90"
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Recipes</CardTitle>
                  <CardDescription>
                    Recipes you've saved for easy access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-recipe-orange" />
                    </div>
                  ) : savedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't saved any recipes yet.</p>
                      <Button asChild variant="outline">
                        <a href="/">Explore Recipes</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user.email || ""} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Button
                      variant="destructive"
                      onClick={() => signOut()}
                    >
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-recipe-orange hover:bg-recipe-orange/90"
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
