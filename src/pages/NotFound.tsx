
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-recipe-cream p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-recipe-orange/10 rounded-full p-6">
            <ChefHat className="h-16 w-16 text-recipe-orange" />
          </div>
        </div>
        <h1 className="text-4xl font-bold font-playfair mb-4 text-recipe-red">Recipe Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! It looks like the page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild size="lg" className="bg-recipe-orange hover:bg-recipe-orange/90">
          <a href="/">Return to Kitchen</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
