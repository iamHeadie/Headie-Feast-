import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { FoodItem } from "@/lib/data";
import { useCart } from "@/lib/cart-context";

interface QuantityStepperProps {
  item: FoodItem;
  /** "pill"    → wide green pill with "+ Add" label (RestaurantMenuPage)
   *  "compact" → small rounded stepper (FoodCard compact)
   *  "full"    → standard rounded stepper (FoodCard full)
   */
  variant?: "pill" | "compact" | "full";
}

export default function QuantityStepper({
  item,
  variant = "full",
}: QuantityStepperProps) {
  const { items, addItem, removeItem } = useCart();
  const quantity = items.find((i) => i.id === item.id)?.quantity ?? 0;

  /* ── pill variant ─────────────────────────────────────────────── */
  if (variant === "pill") {
    return (
      /* Fixed-size container — never changes dimensions when toggling states */
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[100px] h-8 flex items-center justify-between bg-green-500 rounded-full shadow-md overflow-hidden whitespace-nowrap">
        {quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addItem(item)}
            aria-label={`Add ${item.name} to cart`}
            className="w-full h-full flex items-center justify-center gap-1 text-white text-[13px] font-bold hover:bg-green-600 active:bg-green-700 transition-colors"
          >
            <Plus size={13} strokeWidth={3} />
            Add
          </motion.button>
        ) : (
          <>
            <button
              onClick={() => removeItem(item.id)}
              aria-label={`Remove one ${item.name}`}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-white hover:bg-green-600 active:bg-green-700 transition-colors"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            {/* Fixed-width number slot so 1→10 never shifts the buttons */}
            <span className="w-5 flex-shrink-0 text-center text-[13px] font-bold text-white select-none">
              {quantity}
            </span>
            <button
              onClick={() => addItem(item)}
              aria-label={`Add one more ${item.name}`}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-white hover:bg-green-600 active:bg-green-700 transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </>
        )}
      </div>
    );
  }

  /* ── compact variant ──────────────────────────────────────────── */
  if (variant === "compact") {
    return (
      /* Fixed container anchored to bottom-right — never moves */
      <div
        className="absolute bottom-2 right-0 w-[88px] h-7 flex items-center justify-between bg-primary rounded-full shadow-glow overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {quantity === 0 ? (
          <motion.button
            whileTap={{ scale: 1.1 }}
            onClick={(e) => { e.stopPropagation(); addItem(item); }}
            aria-label={`Add ${item.name} to cart`}
            className="w-full h-full flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
          >
            <Plus size={14} strokeWidth={3} />
          </motion.button>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
              aria-label={`Remove one ${item.name}`}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
            >
              <Minus size={12} strokeWidth={3} />
            </button>
            <span className="w-4 flex-shrink-0 text-center text-[12px] font-bold text-primary-foreground select-none">
              {quantity}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); addItem(item); }}
              aria-label={`Add one more ${item.name}`}
              className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </>
        )}
      </div>
    );
  }

  /* ── full variant ─────────────────────────────────────────────── */
  return (
    /* Fixed-size container matches the "+ Add" button footprint exactly */
    <div className="w-[100px] h-8 flex items-center justify-between bg-primary rounded-full shadow-glow overflow-hidden">
      {quantity === 0 ? (
        <motion.button
          whileTap={{ scale: 1.1 }}
          onClick={() => addItem(item)}
          aria-label={`Add ${item.name} to cart`}
          className="w-full h-full flex items-center justify-center gap-1 text-primary-foreground text-sm font-bold hover:bg-primary/80 active:bg-primary/60 transition-colors"
        >
          <Plus size={16} strokeWidth={3} />
          Add
        </motion.button>
      ) : (
        <>
          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove one ${item.name}`}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <span className="w-5 flex-shrink-0 text-center text-sm font-bold text-primary-foreground select-none">
            {quantity}
          </span>
          <button
            onClick={() => addItem(item)}
            aria-label={`Add one more ${item.name}`}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </>
      )}
    </div>
  );
}
