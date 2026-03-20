import { ArrowLeft, Star } from "lucide-react";
import { motion } from "framer-motion";
import { allItems, restaurants } from "@/lib/data";
import FoodCard from "./FoodCard";

interface RestaurantMenuPageProps {
  restaurantName: string;
  onBack: () => void;
}

const categoryEmoji: Record<string, string> = {
  "Jollof Rice": "🍚",
  Spaghetti: "🍝",
  Swallows: "🫕",
  Grills: "🔥",
  Shawarma: "🌯",
  Extras: "➕",
};

export default function RestaurantMenuPage({ restaurantName, onBack }: RestaurantMenuPageProps) {
  const restaurant = restaurants.find((r) => r.name === restaurantName);
  const menuItems = allItems.filter((item) => item.restaurant === restaurantName);

  // Group items by their primary tag / category
  const grouped: Record<string, typeof menuItems> = {};

  menuItems.forEach((item) => {
    const tag = item.tags.find((t) =>
      ["Jollof Rice", "Spaghetti", "Swallows", "Grills", "Shawarma", "Extra"].includes(t)
    ) ?? item.tags[0];
    const label = tag === "Extra" ? "Extras" : tag;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  const avgRating =
    menuItems.length > 0
      ? (menuItems.reduce((sum, i) => sum + i.rating, 0) / menuItems.length).toFixed(1)
      : "—";

  return (
    <div className="pb-24 min-h-screen bg-background">
      {/* Header */}
      <div className="headie-gradient px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="bg-white/20 rounded-full p-2 text-white backdrop-blur-sm"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </div>

        <div>
          <p className="text-white/80 text-sm font-medium mb-1">📍 Malete, Kwara State</p>
          <h1 className="text-3xl font-serif font-bold text-white leading-tight">
            {restaurantName}
          </h1>

          {restaurant && (
            <div className="flex flex-wrap gap-2 mt-3">
              {restaurant.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
                >
                  {categoryEmoji[cat] ?? "🍽️"} {cat}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-white/90">
              <Star size={14} className="fill-white/90 text-white/90" />
              <span className="text-sm font-semibold">{avgRating}</span>
            </div>
            <span className="text-white/60 text-sm">·</span>
            <span className="text-white/80 text-sm">{menuItems.length} items on the menu</span>
            <span className="text-white/60 text-sm">·</span>
            <span className="text-white/80 text-sm">~15 – 25 min</span>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-4 pt-5 space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-base font-serif font-bold text-foreground mb-3">
              {categoryEmoji[category] ?? "🍽️"} {category}
            </h2>
            <div className="space-y-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {menuItems.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">Menu coming soon</p>
            <p className="text-sm mt-1">Check back later for deliciousness</p>
          </div>
        )}
      </div>
    </div>
  );
}
