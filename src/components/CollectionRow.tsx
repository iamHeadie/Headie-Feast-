import { Collection } from "@/lib/data";
import FoodCard from "./FoodCard";

interface CollectionRowProps {
  collection: Collection;
}

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
        {collection.items.map((item) => (
          <FoodCard key={item.id} item={item} variant="compact" />
        ))}
      </div>
    </div>
  );
}
