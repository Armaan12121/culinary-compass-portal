
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecipeCard from "./RecipeCard";
import { Recipe } from "@/types";

interface FeaturedSectionProps {
  title: string;
  description?: string;
  recipes: Recipe[];
  viewAllLink?: string;
}

const FeaturedSection = ({
  title,
  description,
  recipes,
  viewAllLink,
}: FeaturedSectionProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold font-playfair">{title}</h2>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          {viewAllLink && (
            <Button
              variant="outline"
              className="mt-4 md:mt-0 group"
              asChild
            >
              <a href={viewAllLink}>
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
