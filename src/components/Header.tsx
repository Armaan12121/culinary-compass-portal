
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ChefHat,
  User,
  LogOut,
  BookOpen,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, signOut } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-6 w-6 text-recipe-orange" />
            <span className="font-playfair font-bold text-xl">
              Culinary Compass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium hover:text-recipe-orange transition-colors"
            >
              Home
            </Link>
            <Link
              to="/recipes"
              className="text-sm font-medium hover:text-recipe-orange transition-colors"
            >
              Recipes
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-recipe-orange transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium hover:text-recipe-orange transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Search & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="search"
                placeholder="Search recipes..."
                className="w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {profile?.username
                          ? getInitials(profile.username)
                          : user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/create-recipe" className="flex items-center cursor-pointer">
                      <ChefHat className="mr-2 h-4 w-4" />
                      <span>Create Recipe</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved-recipes" className="flex items-center cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Saved Recipes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-recipe-orange hover:bg-recipe-orange/90">
                <Link to="/auth/sign-in">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="search"
                placeholder="Search recipes..."
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Home</span>
              </Link>
              <Link
                to="/recipes"
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Recipes</span>
              </Link>
              <Link
                to="/categories"
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Categories</span>
              </Link>
              <Link
                to="/about"
                className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>About</span>
              </Link>
            </nav>

            {user ? (
              <div className="space-y-2 pt-2 border-t">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/create-recipe"
                  className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ChefHat className="h-4 w-4" />
                  <span>Create Recipe</span>
                </Link>
                <Link
                  to="/saved-recipes"
                  className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" />
                  <span>Saved Recipes</span>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 p-2 hover:bg-slate-100"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="pt-2 border-t">
                <Button
                  asChild
                  className="w-full bg-recipe-orange hover:bg-recipe-orange/90"
                >
                  <Link to="/auth/sign-in" onClick={() => setIsMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
