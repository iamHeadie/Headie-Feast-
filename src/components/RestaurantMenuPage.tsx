import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allItems, restaurants } from "@/lib/data";
import { useCart } from "@/lib/cart-context";
import QuantityStepper from "@/components/QuantityStepper";

interface RestaurantMenuPageProps {
  restaurantName: string;
  onBack: () => void;
}

type Tab = "all" | "main" | "extras";

const MAIN_MEAL_TAGS = [
  "Jollof Rice",
  "Spaghetti",
  "Macaroni",
  "Rice & Beans",
  "Rice and Beans",
  "Shawarma",
  "Grills",
  "Pepper Soup",
  "Sauce",
  "Main Meal",
];

function isMainMeal(tags: string[]) {
  return tags.some((t) => MAIN_MEAL_TAGS.includes(t));
}
function isExtra(tags: string[]) {
  return tags.includes("Extra");
}

function MenuItemCard({ item }: { item: ReturnType<typeof allItems>[number] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-soft border border-gray-50"
    >
      {/* Left: text info */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="font-bold text-[15px] text-foreground leading-tight">
          {item.name}
        </h4>
        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-extrabold text-primary">
            ₦{item.price.toLocaleString()}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium">
            <Star size={10} fill="currentColor" />
            {item.rating}
          </span>
        </div>
      </div>

      {/* Right: image + quantity stepper */}
      <div className="relative flex-shrink-0">
        <div className="w-[88px] h-[88px] rounded-xl overflow-hidden bg-gray-100">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "/placeholder.svg";
            }}
          />
        </div>
        {/* Quantity stepper — overlapping bottom-center of image */}
        <QuantityStepper item={item} variant="pill" />
      </div>
    </motion.div>
  );
}

export default function RestaurantMenuPage({
  restaurantName,
  onBack,
}: RestaurantMenuPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const restaurant = restaurants.find((r) => r.name === restaurantName);
  const menuItems = allItems.filter(
    (item) => item.restaurant === restaurantName
  );

  const filteredItems =
    activeTab === "all"
      ? menuItems
      : activeTab === "main"
      ? menuItems.filter((item) => isMainMeal(item.tags))
      : menuItems.filter((item) => isExtra(item.tags));

  const avgRating =
    menuItems.length > 0
      ? (
          menuItems.reduce((sum, i) => sum + i.rating, 0) / menuItems.length
        ).toFixed(1)
      : "—";

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "main", label: "Main Meals" },
    { id: "extras", label: "Extras" },
  ];

  return (
    <div className="pb-28 min-h-screen bg-gray-50">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="chopgee-gradient px-4 pt-10 pb-7">
        <div className="flex items-center gap-3 mb-5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="bg-white/20 rounded-full p-2 text-white backdrop-blur-sm"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </div>

        {/* Restaurant identity */}
        <div className="flex items-center gap-3 mb-3">
          {restaurant?.logo && (
            <img
              src={restaurant.logo}
              alt={`${restaurantName} logo`}
              className="w-14 h-14 rounded-full bg-white shadow-lg object-contain p-1 flex-shrink-0"
            />
          )}
          <div>
            <p className="text-white/75 text-xs font-medium uppercase tracking-wider mb-0.5">
              📍 Malete, Kwara State
            </p>
            <h1 className="text-3xl font-serif font-extrabold text-white leading-tight tracking-tight">
              {restaurantName}
            </h1>
          </div>
        </div>

        {/* Category chips */}
        {restaurant && (
          <div className="flex flex-wrap gap-2 mb-4">
            {restaurant.categories.map((cat) => (
              <span
                key={cat}
                className="bg-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-white/85 text-sm">
          <span className="flex items-center gap-1 font-semibold">
            <Star size={13} className="fill-white/85 text-white/85" />
            {avgRating}
          </span>
          <span className="text-white/50">·</span>
          <span>{menuItems.length} items</span>
          <span className="text-white/50">·</span>
          <span>~15 – 25 min</span>
        </div>
      </div>

      {/* ── Sticky Tab Navigation ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Menu Items ───────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-4">
        {/* Tab title */}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          {activeTab === "all"
            ? `All Items (${filteredItems.length})`
            : activeTab === "main"
            ? `Main Meals (${filteredItems.length})`
            : `Extras (${filteredItems.length})`}
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 pb-6"
          >
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="font-semibold">Nothing here yet</p>
                <p className="text-sm mt-1">
                  Try the{" "}
                  <button
                    onClick={() => setActiveTab("all")}
                    className="text-primary underline font-medium"
                  >
                    All
                  </button>{" "}
                  tab to see everything
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
