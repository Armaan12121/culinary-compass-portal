
import { Search, ChefHat, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-recipe-orange" />
            <h1 className="text-2xl font-bold text-recipe-orange">
              Culinary Compass
            </h1>
          </div>

          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              placeholder="Search recipes..."
              onChange={handleSearchInput}
              className="pl-10 bg-muted/50"
            />
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost">Recipes</Button>
            <Button variant="ghost">Cuisines</Button>
            <Button variant="ghost">Meal Plans</Button>
            <Button className="bg-recipe-orange hover:bg-recipe-orange/90">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
