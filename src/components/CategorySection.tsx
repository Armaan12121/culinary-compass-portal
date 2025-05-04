
import { ChefHat, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "Quick & Easy",
    description: "Meals ready in 30 minutes or less",
    icon: Clock,
    bgColor: "bg-recipe-orange/10",
    iconColor: "text-recipe-orange",
    link: "#",
  },
  {
    title: "Healthy Options",
    description: "Nutritious meals for a balanced diet",
    icon: Award,
    bgColor: "bg-recipe-sage/20",
    iconColor: "text-recipe-sage",
    link: "#",
  },
  {
    title: "Cooking Techniques",
    description: "Master new culinary skills",
    icon: ChefHat,
    bgColor: "bg-recipe-olive/10",
    iconColor: "text-recipe-olive",
    link: "#",
  },
];

const CategorySection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-playfair text-center mb-12">
          Explore by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={category.title} 
              className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("rounded-full p-4", category.bgColor)}>
                <category.icon className={cn("h-8 w-8", category.iconColor)} />
              </div>
              <h3 className="font-playfair font-semibold text-xl mt-4">{category.title}</h3>
              <p className="text-muted-foreground my-3">{category.description}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                asChild
              >
                <a href={category.link}>Explore Recipes</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
