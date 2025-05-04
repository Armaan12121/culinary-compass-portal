
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-recipe-olive py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-opacity-10 pattern-dots pattern-gray-700 pattern-bg-transparent pattern-size-2"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair">
              Discover Your Next
              <br />
              Culinary Adventure
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Personalized recipes based on your preferences, dietary needs, and what's in your kitchen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-recipe-orange hover:bg-recipe-orange/90">
                Explore Recipes
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
                Create Account
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 animate-fade-in [animation-delay:300ms]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg h-48 shadow-lg transform translate-y-8">
                <img 
                  src="https://images.unsplash.com/photo-1606313564200-e75d8e3ddc1d" 
                  alt="Delicious dessert" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="overflow-hidden rounded-lg h-64 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                  alt="Healthy bowl" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="overflow-hidden rounded-lg h-64 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd" 
                  alt="Thai curry" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="overflow-hidden rounded-lg h-48 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1604068549290-dea0e4a305ca" 
                  alt="Pizza" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
