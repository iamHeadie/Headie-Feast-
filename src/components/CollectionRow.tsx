import { Collection, allItems } from "@/lib/data";
import FoodCard from "./FoodCard";

interface CollectionRowProps {
  collection: Collection;
  onRestaurantClick?: (name: string) => void;
}

export default function CollectionRow({ collection }: CollectionRowProps) {
  const tags = collection.categoryTags ?? [];

  const items = allItems.filter(
    (item) =>
      collection.restaurants.includes(item.restaurant) &&
      item.tags.some((t) => tags.includes(t))
  );

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="px-4 mb-3">
        <h3 className="text-lg font-serif font-bold text-foreground">
          {collection.emoji} {collection.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{collection.description}</p>
      </div>

      {/* Horizontal scrolling food card row */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {items.map((item) => (
          <FoodCard key={item.id} item={item} variant="dish" />
        ))}
      </div>
    </div>
  );
}
