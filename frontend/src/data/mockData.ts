import { Restaurant } from "../types";

const restaurantTemplates: Omit<Restaurant, "lat" | "lng">[] = [
  {
    id: "1",
    name: "Burger Palace",
    cuisine: "American",
    rating: 4.5,
    menu: [
      { id: "m1", name: "Classic Burger", description: "Beef patty with lettuce, tomato, cheese", price: 45000, isRecommended: true },
      { id: "m2", name: "Cheese Burger", description: "Double cheese with special sauce", price: 55000 },
      { id: "m3", name: "Fries", description: "Crispy golden fries", price: 20000 },
      { id: "m4", name: "Soda", description: "Refreshing cola drink", price: 12000 },
    ],
  },
  {
    id: "2",
    name: "Pizza Heaven",
    cuisine: "Italian",
    rating: 4.7,
    menu: [
      { id: "m5", name: "Margherita Pizza", description: "Fresh tomatoes, mozzarella, basil", price: 75000, isRecommended: true },
      { id: "m6", name: "Pepperoni Pizza", description: "Spicy pepperoni with cheese", price: 85000 },
      { id: "m7", name: "Garlic Bread", description: "Toasted with garlic butter", price: 25000 },
      { id: "m8", name: "Iced Tea", description: "Freshly brewed iced tea", price: 15000 },
    ],
  },
  {
    id: "3",
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.8,
    menu: [
      { id: "m9", name: "Salmon Sashimi", description: "Fresh raw salmon slices", price: 95000, isRecommended: true },
      { id: "m10", name: "California Roll", description: "Crab, avocado, cucumber roll", price: 65000 },
      { id: "m11", name: "Miso Soup", description: "Traditional Japanese soup", price: 18000 },
      { id: "m12", name: "Green Tea", description: "Hot Japanese green tea", price: 10000 },
    ],
  },
  {
    id: "4",
    name: "Pad Thai House",
    cuisine: "Thai",
    rating: 4.3,
    menu: [
      { id: "m13", name: "Pad Thai", description: "Stir-fried rice noodles with shrimp", price: 55000, isRecommended: true },
      { id: "m14", name: "Green Curry", description: "Thai green curry with chicken", price: 60000 },
      { id: "m15", name: "Spring Rolls", description: "Crispy vegetable rolls", price: 22000 },
      { id: "m16", name: "Thai Ice Tea", description: "Sweet orange tea with milk", price: 18000 },
    ],
  },
  {
    id: "5",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.4,
    menu: [
      { id: "m17", name: "Beef Tacos", description: "Three tacos with seasoned beef", price: 48000, isRecommended: true },
      { id: "m18", name: "Chicken Burrito", description: "Grilled chicken with rice and beans", price: 52000 },
      { id: "m19", name: "Nachos", description: "Tortilla chips with cheese dip", price: 35000 },
      { id: "m20", name: "Lime Margarita", description: "Classic lime cocktail", price: 40000 },
    ],
  },
  {
    id: "6",
    name: "Noodle Bar",
    cuisine: "Chinese",
    rating: 4.2,
    menu: [
      { id: "m21", name: "Chicken Ramen", description: "Japanese style noodle soup", price: 58000, isRecommended: true },
      { id: "m22", name: "Beef Chow Mein", description: "Stir-fried noodles with beef", price: 50000 },
      { id: "m23", name: "Dumplings", description: "Steamed pork dumplings", price: 30000 },
      { id: "m24", name: "Soy Milk", description: "Fresh hot soy milk", price: 12000 },
    ],
  },
  {
    id: "7",
    name: "Indian Spice",
    cuisine: "Indian",
    rating: 4.6,
    menu: [
      { id: "m25", name: "Chicken Tikka Masala", description: "Creamy tomato curry with chicken", price: 65000, isRecommended: true },
      { id: "m26", name: "Butter Naan", description: "Soft bread with butter", price: 15000 },
      { id: "m27", name: "Samosa", description: "Crispy potato pastry", price: 20000 },
      { id: "m28", name: "Mango Lassi", description: "Sweet yogurt mango drink", price: 22000 },
    ],
  },
  {
    id: "8",
    name: "Seaside Grill",
    cuisine: "Seafood",
    rating: 4.5,
    menu: [
      { id: "m29", name: "Grilled Salmon", description: "Fresh salmon with herbs", price: 85000, isRecommended: true },
      { id: "m30", name: "Fish and Chips", description: "Beer battered fish with fries", price: 60000 },
      { id: "m31", name: "Clam Chowder", description: "Creamy seafood soup", price: 35000 },
      { id: "m32", name: "Lemonade", description: "Fresh squeezed lemonade", price: 15000 },
    ],
  },
];

export function generateNearbyRestaurants(
  baseLat: number,
  baseLng: number,
  count: number = 8
): Restaurant[] {
  const lngScale = Math.cos((baseLat * Math.PI) / 180);

  return restaurantTemplates.slice(0, count).map((t, i) => {
    const angle = ((2 * Math.PI) / count) * i + (Math.random() - 0.5) * 0.8;
    const distKm = 0.3 + Math.random() * 1.0;
    const latOffset = (distKm / 111.32) * Math.cos(angle);
    const lngOffset = (distKm / (111.32 * lngScale)) * Math.sin(angle);

    return {
      ...t,
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
    };
  });
}
