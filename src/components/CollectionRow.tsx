import { motion } from "framer-motion";
import { Collection } from "@/lib/data";

interface CollectionRowProps {
  collection: Collection;
}

const chipColors = [
  "bg-orange-50 text-orange-800",
  "bg-amber-50 text-amber-800",
  "bg-rose-50 text-rose-800",
  "bg-emerald-50 text-emerald-800",
  "bg-violet-50 text-violet-800",
];

export default function CollectionRow({ collection }: CollectionRowProps) {
  return (
    <div className="mb-6">
      <div className="px-4 mb-3">
        <h3 className="text-lg font-serif font-bold text-foreground">
          {collection.emoji} {collection.title}
        </h3>
        <p className="text-xs text-muted-foreground">{collection.description}</p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {collection.restaurants.map((name, i) => (
          <motion.button
            key={name}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold text-sm whitespace-nowrap shadow-sm ${chipColors[i % chipColors.length]}`}
          >
            {name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
