
import { Recipe } from "../types";

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Margherita Pizza",
    description: "Classic Italian pizza with fresh mozzarella, tomatoes, and basil",
    imageUrl: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "Italian",
    dietaryTypes: ["Vegetarian"],
    ingredients: [
      { name: "Pizza dough", amount: 1, unit: "ball" },
      { name: "Fresh mozzarella", amount: 200, unit: "g" },
      { name: "Fresh basil leaves", amount: 10, unit: "" },
      { name: "Tomato sauce", amount: 100, unit: "ml" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Preheat your oven to 475°F (245°C) with a pizza stone or steel inside.",
      "Stretch your pizza dough on a floured surface into a 12-inch circle.",
      "Spread tomato sauce evenly across the dough, leaving a small border for the crust.",
      "Tear the mozzarella into pieces and distribute across the pizza.",
      "Bake for 12-15 minutes until the crust is golden and cheese is bubbly.",
      "Remove from oven, top with fresh basil leaves, drizzle with olive oil, and sprinkle with salt."
    ],
    author: "Chef Marco",
    ratings: [
      { userId: "user1", value: 5, comment: "Perfect recipe! Just like in Naples." },
      { userId: "user2", value: 4, comment: "Delicious and simple." }
    ],
    averageRating: 4.5
  },
  {
    id: "2",
    title: "Thai Green Curry",
    description: "Aromatic and spicy Thai curry with vegetables and your choice of protein",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3",
    prepTime: 25,
    cookTime: 20,
    servings: 4,
    difficulty: "medium",
    cuisine: "Thai",
    dietaryTypes: ["Gluten-Free"],
    ingredients: [
      { name: "Green curry paste", amount: 2, unit: "tbsp" },
      { name: "Coconut milk", amount: 400, unit: "ml" },
      { name: "Chicken breast", amount: 400, unit: "g" },
      { name: "Bell peppers", amount: 2, unit: "" },
      { name: "Thai eggplant", amount: 100, unit: "g" },
      { name: "Thai basil leaves", amount: 1, unit: "handful" },
      { name: "Fish sauce", amount: 1, unit: "tbsp" },
      { name: "Palm sugar", amount: 1, unit: "tsp" },
      { name: "Lime leaves", amount: 4, unit: "" }
    ],
    instructions: [
      "Heat a tablespoon of oil in a large pan or wok over medium heat.",
      "Add the green curry paste and cook for 1 minute until fragrant.",
      "Add half of the coconut milk and bring to a simmer.",
      "Add chicken and cook for 5 minutes.",
      "Add the vegetables and the remaining coconut milk. Cook for 10 minutes.",
      "Season with fish sauce and palm sugar to taste.",
      "Stir in Thai basil leaves and lime leaves just before serving.",
      "Serve hot with steamed jasmine rice."
    ],
    author: "Chef Supatra",
    ratings: [
      { userId: "user3", value: 5, comment: "Tastes like authentic Thai street food!" },
      { userId: "user4", value: 4, comment: "Delicious but quite spicy." },
      { userId: "user5", value: 5, comment: "My family loved this recipe." }
    ],
    averageRating: 4.7
  },
  {
    id: "3",
    title: "Vegan Buddha Bowl",
    description: "Nourishing bowl packed with colorful vegetables, grains, and plant-based protein",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3",
    prepTime: 20,
    cookTime: 30,
    servings: 2,
    difficulty: "easy",
    cuisine: "Mediterranean",
    dietaryTypes: ["Vegan", "Vegetarian", "Dairy-Free"],
    ingredients: [
      { name: "Quinoa", amount: 100, unit: "g" },
      { name: "Sweet potato", amount: 1, unit: "medium" },
      { name: "Chickpeas", amount: 400, unit: "g" },
      { name: "Avocado", amount: 1, unit: "" },
      { name: "Kale", amount: 100, unit: "g" },
      { name: "Carrots", amount: 2, unit: "" },
      { name: "Tahini", amount: 2, unit: "tbsp" },
      { name: "Lemon juice", amount: 1, unit: "tbsp" },
      { name: "Maple syrup", amount: 1, unit: "tsp" },
      { name: "Sesame seeds", amount: 1, unit: "tbsp" },
      { name: "Olive oil", amount: 2, unit: "tbsp" },
      { name: "Salt", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Dice sweet potato, toss with olive oil and salt, and roast for 25 minutes.",
      "Rinse chickpeas, toss with spices and olive oil, and roast for 20 minutes until crispy.",
      "Cook quinoa according to package instructions.",
      "Make dressing by whisking together tahini, lemon juice, maple syrup, and water.",
      "Massage kale with olive oil and salt until softened.",
      "Slice carrots and avocado.",
      "Assemble bowls with quinoa as the base, then arrange vegetables, chickpeas, and avocado.",
      "Drizzle with tahini dressing and sprinkle with sesame seeds."
    ],
    author: "Chef Olivia",
    ratings: [
      { userId: "user6", value: 5, comment: "So tasty and filling!" },
      { userId: "user7", value: 5, comment: "Great balanced meal." },
      { userId: "user8", value: 4, comment: "Delicious but took longer to prepare than expected." }
    ],
    averageRating: 4.7
  },
  {
    id: "4",
    title: "Classic Beef Bourguignon",
    description: "Traditional French beef stew braised in red wine with mushrooms and herbs",
    imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?ixlib=rb-4.0.3",
    prepTime: 30,
    cookTime: 180,
    servings: 6,
    difficulty: "hard",
    cuisine: "French",
    dietaryTypes: [],
    ingredients: [
      { name: "Beef chuck", amount: 1.5, unit: "kg" },
      { name: "Bacon", amount: 200, unit: "g" },
      { name: "Carrots", amount: 3, unit: "large" },
      { name: "Onions", amount: 2, unit: "large" },
      { name: "Mushrooms", amount: 500, unit: "g" },
      { name: "Red wine", amount: 750, unit: "ml" },
      { name: "Beef stock", amount: 500, unit: "ml" },
      { name: "Tomato paste", amount: 2, unit: "tbsp" },
      { name: "Garlic", amount: 4, unit: "cloves" },
      { name: "Thyme", amount: 1, unit: "sprig" },
      { name: "Bay leaves", amount: 2, unit: "" },
      { name: "Pearl onions", amount: 12, unit: "small" },
      { name: "Butter", amount: 3, unit: "tbsp" },
      { name: "Flour", amount: 3, unit: "tbsp" }
    ],
    instructions: [
      "Preheat oven to 325°F (165°C).",
      "Cook the bacon in a large Dutch oven over medium heat until crispy. Remove and set aside.",
      "Pat the beef dry and season with salt and pepper. Brown in batches in the bacon fat. Set aside.",
      "In the same pot, sauté the carrots and chopped onions until softened.",
      "Add garlic and cook for 1 minute.",
      "Return the beef and bacon to the pot. Add wine, stock, tomato paste, herbs, and bring to a simmer.",
      "Cover and transfer to the oven. Cook for 2.5-3 hours until the beef is very tender.",
      "While the stew is cooking, sauté mushrooms and pearl onions in butter until browned.",
      "Make a beurre manié by mixing softened butter with flour.",
      "When the stew is done, remove from oven, stir in the beurre manié to thicken.",
      "Add the mushrooms and pearl onions, simmer for 10 more minutes.",
      "Adjust seasoning and serve hot with crusty bread or mashed potatoes."
    ],
    author: "Chef Pierre",
    ratings: [
      { userId: "user9", value: 5, comment: "Worth every minute of cooking time!" },
      { userId: "user10", value: 5, comment: "A perfect winter comfort food." }
    ],
    averageRating: 5.0
  },
  {
    id: "5",
    title: "Spicy Tuna Poke Bowl",
    description: "Fresh Hawaiian-inspired bowl with marinated tuna, rice, and vegetables",
    imageUrl: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?ixlib=rb-4.0.3",
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    difficulty: "medium",
    cuisine: "Japanese",
    dietaryTypes: ["Dairy-Free"],
    ingredients: [
      { name: "Sushi-grade tuna", amount: 250, unit: "g" },
      { name: "Soy sauce", amount: 3, unit: "tbsp" },
      { name: "Sesame oil", amount: 1, unit: "tbsp" },
      { name: "Sriracha", amount: 1, unit: "tbsp" },
      { name: "Sushi rice", amount: 200, unit: "g" },
      { name: "Rice vinegar", amount: 1, unit: "tbsp" },
      { name: "Sugar", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Cucumber", amount: 1, unit: "medium" },
      { name: "Avocado", amount: 1, unit: "" },
      { name: "Edamame", amount: 100, unit: "g" },
      { name: "Nori sheets", amount: 2, unit: "" },
      { name: "Sesame seeds", amount: 1, unit: "tbsp" },
      { name: "Green onions", amount: 2, unit: "" }
    ],
    instructions: [
      "Cook sushi rice according to package instructions.",
      "Mix rice vinegar, sugar, and salt. Fold into the cooked rice and let cool.",
      "Cut tuna into 1/2-inch cubes.",
      "Mix soy sauce, sesame oil, and sriracha. Toss the tuna in this sauce.",
      "Dice cucumber and avocado.",
      "Cook edamame according to package instructions.",
      "Cut nori sheets into thin strips.",
      "Assemble bowls with rice as the base, then arrange tuna, cucumber, avocado, and edamame.",
      "Garnish with nori strips, sesame seeds, and sliced green onions."
    ],
    author: "Chef Kenji",
    ratings: [
      { userId: "user11", value: 5, comment: "So fresh and delicious!" },
      { userId: "user12", value: 4, comment: "Great flavors, but be sure to use very fresh tuna." }
    ],
    averageRating: 4.5
  },
  {
    id: "6",
    title: "Chocolate Lava Cake",
    description: "Decadent dessert with a warm, gooey chocolate center",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d8e3ddc1d?ixlib=rb-4.0.3",
    prepTime: 15,
    cookTime: 12,
    servings: 4,
    difficulty: "medium",
    cuisine: "French",
    dietaryTypes: ["Vegetarian"],
    ingredients: [
      { name: "Dark chocolate", amount: 200, unit: "g" },
      { name: "Unsalted butter", amount: 100, unit: "g" },
      { name: "Eggs", amount: 4, unit: "" },
      { name: "Egg yolks", amount: 2, unit: "" },
      { name: "Sugar", amount: 100, unit: "g" },
      { name: "Flour", amount: 2, unit: "tbsp" },
      { name: "Vanilla extract", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat oven to 425°F (220°C). Butter and lightly flour four ramekins.",
      "Melt chocolate and butter together over a double boiler or in microwave.",
      "In a separate bowl, whisk together eggs, egg yolks, sugar, and vanilla until pale and fluffy.",
      "Fold the melted chocolate mixture into the egg mixture.",
      "Gently fold in flour and salt until just combined.",
      "Divide batter among the ramekins, filling each about 3/4 full.",
      "Bake for 10-12 minutes, until the sides are firm but the center is still soft.",
      "Let cool for 1 minute, then run a knife around the edges and invert onto dessert plates.",
      "Serve immediately with ice cream or whipped cream if desired."
    ],
    author: "Chef Sophie",
    ratings: [
      { userId: "user13", value: 5, comment: "Perfect dessert for date night!" },
      { userId: "user14", value: 4, comment: "Delicious but watch the baking time carefully." },
      { userId: "user15", value: 5, comment: "Restaurant quality at home!" }
    ],
    averageRating: 4.7
  }
];
