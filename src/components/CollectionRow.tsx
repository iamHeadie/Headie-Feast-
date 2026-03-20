import { motion } from "framer-motion";
import { Collection, restaurants } from "@/lib/data";

interface CollectionRowProps {
  collection: Collection;
  onRestaurantClick?: (name: string) => void;
}

const chipColors = [
  "bg-orange-50 text-orange-800",
  "bg-amber-50 text-amber-800",
  "bg-rose-50 text-rose-800",
  "bg-emerald-50 text-emerald-800",
  "bg-violet-50 text-violet-800",
];

// Build a map of restaurant name -> data for logo & navigability
const restaurantMap = new Map(restaurants.map((r) => [r.name, r]));

export default function CollectionRow({ collection, onRestaurantClick }: CollectionRowProps) {
  return (
    <div className="mb-6">
      <div className="px-4 mb-3">
        <h3 className="text-lg font-serif font-bold text-foreground">
          {collection.emoji} {collection.title}
        </h3>
        <p className="text-xs text-muted-foreground">{collection.description}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {collection.restaurants.map((name, i) => {
          const restaurantData = restaurantMap.get(name);
          const isNavigable = !!restaurantData;
          const logo = restaurantData?.logo;

          return (
            <motion.button
              key={name}
              whileTap={{ scale: 0.95 }}
              onClick={() => isNavigable && onRestaurantClick?.(name)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm whitespace-nowrap shadow-sm transition-shadow ${
                chipColors[i % chipColors.length]
              } ${isNavigable ? "ring-2 ring-orange-300 cursor-pointer hover:shadow-md" : "cursor-default"}`}
            >
              {logo && (
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="w-8 h-8 rounded-full object-contain bg-white shadow-sm flex-shrink-0"
                />
              )}
              <span>{name}</span>
              {isNavigable && <span className="text-xs opacity-70">↗</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
