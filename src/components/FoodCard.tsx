import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { FoodItem } from "@/lib/data";
import QuantityStepper from "@/components/QuantityStepper";

interface FoodCardProps {
  item: FoodItem;
  variant?: "compact" | "full";
}

export default function FoodCard({ item, variant = "full" }: FoodCardProps) {
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
