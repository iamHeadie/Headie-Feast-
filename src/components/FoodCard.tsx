import { Star, Clock, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { FoodItem } from "@/lib/data";
import QuantityStepper from "@/components/QuantityStepper";
import { useCart } from "@/lib/cart-context";

interface FoodCardProps {
  item: FoodItem;
  variant?: "compact" | "full" | "dish";
}

export default function FoodCard({ item, variant = "full" }: FoodCardProps) {
  const { items, addItem, removeItem } = useCart();
  const quantity = items.find((i) => i.id === item.id)?.quantity ?? 0;

  if (variant === "dish") {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="flex-shrink-0 min-w-[160px] max-w-[170px] bg-card rounded-[18px] border border-border/40 shadow-[0_2px_14px_rgba(0,0,0,0.08)] overflow-hidden cursor-pointer"
      >
        {/* Dish image */}
        <div className="relative h-[110px] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Rating badge */}
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <Star size={8} fill="#fbbf24" className="text-amber-400" />
            <span className="text-[9px] font-bold text-white">{item.rating}</span>
          </div>
        </div>

        {/* Info section */}
        <div className="p-2.5 pt-2">
          <h4 className="font-bold text-sm text-foreground truncate leading-tight">
            {item.name}
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {item.restaurant}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-bold text-primary">
              ₦{item.price.toLocaleString()}
            </span>
            {quantity === 0 ? (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); addItem(item); }}
                className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md"
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus size={14} strokeWidth={3} className="text-primary-foreground" />
              </motion.button>
            ) : (
              <div
                className="flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                  aria-label={`Remove one ${item.name}`}
                >
                  <Minus size={10} strokeWidth={3} className="text-foreground" />
                </button>
                <span className="text-xs font-bold w-4 text-center text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => addItem(item)}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                  aria-label={`Add one more ${item.name}`}
                >
                  <Plus size={10} strokeWidth={3} className="text-primary-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="headie-card min-w-[160px] max-w-[180px] flex-shrink-0 cursor-pointer"
      >
        <div className="relative h-28 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          <QuantityStepper item={item} variant="compact" />
        </div>
        <div className="p-2.5">
          <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{item.restaurant}</p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-bold text-primary">₦{item.price.toLocaleString()}</span>
            <span className="flex items-center gap-0.5 text-xs text-gold">
              <Star size={10} fill="currentColor" /> {item.rating}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className="headie-card flex gap-3 p-3 cursor-pointer"
    >
      <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-xs text-gold">
            <Star size={10} fill="currentColor" /> {item.rating}
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Clock size={10} /> {item.prepTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary">₦{item.price.toLocaleString()}</span>
          <QuantityStepper item={item} variant="full" />
        </div>
      </div>
    </motion.div>
  );
}
