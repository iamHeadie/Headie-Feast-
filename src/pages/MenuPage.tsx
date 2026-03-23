import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Search, X, UtensilsCrossed, Store, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allItems, restaurants } from "@/lib/data";
import FoodCard from "@/components/FoodCard";

type Tab = "all" | "restaurants" | "food" | "drinks";

interface MenuPageProps {
  onBack: () => void;
  onRestaurantClick?: (name: string) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "restaurants", label: "Restaurants" },
  { id: "food", label: "Food" },
  { id: "drinks", label: "Drinks" },
];

export default function MenuPage({ onBack, onRestaurantClick }: MenuPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    let base = allItems;

    if (activeTab === "food") {
      base = allItems.filter((item) => !item.tags.includes("Drink"));
    } else if (activeTab === "drinks") {
      base = allItems.filter((item) => item.tags.includes("Drink"));
    }

    if (!trimmed) return base;

    return base.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.description.toLowerCase().includes(trimmed) ||
        item.tags.some((t) => t.toLowerCase().includes(trimmed)) ||
        item.restaurant.toLowerCase().includes(trimmed)
    );
  }, [activeTab, trimmed]);

  const filteredRestaurants = useMemo(() => {
    if (!trimmed) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(trimmed) ||
        r.location.toLowerCase().includes(trimmed) ||
        r.categories.some((c) => c.toLowerCase().includes(trimmed))
    );
  }, [trimmed]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setQuery("");
    inputRef.current?.focus();
  }

  const placeholders: Record<Tab, string> = {
    all: "Search food, drinks or restaurants...",
    restaurants: "Search for a restaurant...",
    food: "Search for a dish...",
    drinks: "Search for a drink...",
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="bg-secondary rounded-full p-2 text-foreground flex-shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-serif font-bold text-foreground leading-tight">
            Search
          </h1>
          <p className="text-xs text-muted-foreground">Find your next craving</p>
        </div>
      </div>

      {/* ── Sticky search + tabs wrapper ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pb-1">
        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholders[activeTab]}
              enterKeyHint="search"
              className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex gap-1 border-b border-border">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex-1 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {/* RESTAURANTS TAB */}
          {activeTab === "restaurants" && (
            <div className="px-4 pt-4 space-y-3">
              {filteredRestaurants.length === 0 ? (
                <EmptyState query={query} label="restaurant" />
              ) : (
                filteredRestaurants.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <RestaurantCard
                      restaurant={r}
                      onClick={() => onRestaurantClick?.(r.name)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* ALL / FOOD / DRINKS TABS */}
          {activeTab !== "restaurants" && (
            <div className="px-4 pt-4 space-y-3">
              {/* Section label */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {activeTab === "all" && "Everything"}
                  {activeTab === "food" && "Food Items"}
                  {activeTab === "drinks" && "Drinks & Beverages"}
                </p>
                <span className="text-xs text-muted-foreground">
                  {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <EmptyState query={query} label={activeTab === "drinks" ? "drink" : "item"} />
              ) : (
                filteredItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <FoodCard item={item} />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Restaurant card ───────────────────────────────────────────────────────────

interface RestaurantCardProps {
  restaurant: { id: string; name: string; categories: string[]; location: string; logo?: string };
  onClick?: () => void;
}

function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full headie-card flex items-center gap-4 p-4 text-left"
    >
      {/* Logo / placeholder */}
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/40">
        {restaurant.logo ? (
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <Store size={28} className="text-primary" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-base leading-tight">{restaurant.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{restaurant.location}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {restaurant.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full"
            >
              {cat}
            </span>
          ))}
          {restaurant.categories.length > 3 && (
            <span className="text-[10px] text-muted-foreground px-1 py-0.5">
              +{restaurant.categories.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <UtensilsCrossed size={14} className="text-primary-foreground" />
      </div>
    </motion.button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ query, label }: { query: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <Coffee size={48} className="text-muted-foreground/30 mb-4" />
      <p className="font-semibold text-foreground">
        {query ? `No ${label}s found for "${query}"` : `No ${label}s available`}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {query ? "Try a different search term" : "Check back soon"}
      </p>
    </motion.div>
  );
}
