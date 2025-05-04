
import { ChefHat, Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-recipe-olive text-white">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="h-6 w-6" />
              <h3 className="text-xl font-bold font-playfair">Culinary Compass</h3>
            </div>
            <p className="text-white/80 mb-6">
              Discover recipes tailored to your preferences and dietary needs.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-recipe-orange transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-recipe-orange transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-recipe-orange transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-playfair">Explore</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Recipes
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Meal Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Cooking Techniques
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Seasonal Favorites
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-playfair">About</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-playfair">Subscribe</h4>
            <p className="text-white/80 mb-4">
              Get our latest recipes and cooking tips delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-white/20 border-0 focus:bg-white/30 placeholder:text-white/60" 
              />
              <Button className="bg-recipe-orange hover:bg-recipe-orange/90">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-6 text-center text-white/60">
          <p>© {new Date().getFullYear()} Culinary Compass. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
