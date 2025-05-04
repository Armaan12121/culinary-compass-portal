
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    content:
      "Culinary Compass transformed my cooking routine. The personalized recommendations are spot-on for my dietary preferences.",
    author: "Alex Morgan",
    role: "Home Cook",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    id: 2,
    content:
      "I love how easy it is to find recipes based on what I already have in my kitchen. Saves me time and reduces food waste!",
    author: "Michael Chen",
    role: "Busy Parent",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 5,
  },
  {
    id: 3,
    content:
      "As someone with dietary restrictions, this platform has been a game-changer. The filtering options are incredible.",
    author: "Sarah Johnson",
    role: "Nutritionist",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
  },
];

const TestimonialSection = () => {
  return (
    <section className="py-16 bg-recipe-cream">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-playfair text-center mb-12">
          What Our Community Says
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < testimonial.rating
                        ? "fill-recipe-orange text-recipe-orange"
                        : "text-muted stroke-muted"
                    )}
                  />
                ))}
              </div>
              <p className="italic text-muted-foreground mb-6">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
