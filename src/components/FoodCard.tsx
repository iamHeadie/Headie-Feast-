import { Plus, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { FoodItem } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

interface FoodCardProps {
  item: FoodItem;
  variant?: "compact" | "full";
}

export default function FoodCard({ item, variant = "full" }: FoodCardProps) {
  const { addItem, lastAdded } = useCart();
  const isPopping = lastAdded === item.id;

  if (variant === "compact") {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="headie-card min-w-[160px] max-w-[180px] flex-shrink-0 cursor-pointer"
      >
        <div className="relative h-28 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
          <motion.button
            whileTap={{ scale: 1.3 }}
            animate={isPopping ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={(e) => { e.stopPropagation(); addItem(item); }}
            className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-glow"
          >
            <Plus size={14} strokeWidth={3} />
          </motion.button>
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
          <motion.button
            whileTap={{ scale: 1.3 }}
            animate={isPopping ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={() => addItem(item)}
            className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-glow"
          >
            <Plus size={16} strokeWidth={3} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
