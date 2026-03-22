import { Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  /* ── zero state: show the original "+ Add" button ─────────────── */
  if (quantity === 0) {
    if (variant === "pill") {
      return (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => addItem(item)}
          aria-label={`Add ${item.name} to cart`}
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-[13px] font-bold px-4 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap transition-colors"
        >
          <Plus size={13} strokeWidth={3} />
          Add
        </motion.button>
      );
    }
    if (variant === "compact") {
      return (
        <motion.button
          whileTap={{ scale: 1.3 }}
          onClick={(e) => { e.stopPropagation(); addItem(item); }}
          aria-label={`Add ${item.name} to cart`}
          className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center shadow-glow"
        >
          <Plus size={14} strokeWidth={3} />
        </motion.button>
      );
    }
    /* full */
    return (
      <motion.button
        whileTap={{ scale: 1.3 }}
        onClick={() => addItem(item)}
        aria-label={`Add ${item.name} to cart`}
        className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-glow"
      >
        <Plus size={16} strokeWidth={3} />
      </motion.button>
    );
  }

  /* ── non-zero state: horizontal stepper ───────────────────────── */
  if (variant === "pill") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="stepper-pill"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center bg-green-500 rounded-full shadow-md overflow-hidden whitespace-nowrap"
        >
          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove one ${item.name}`}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-600 active:bg-green-700 transition-colors"
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <span className="min-w-[22px] text-center text-[13px] font-bold text-white select-none px-0.5">
            {quantity}
          </span>
          <button
            onClick={() => addItem(item)}
            aria-label={`Add one more ${item.name}`}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-600 active:bg-green-700 transition-colors"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "compact") {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="stepper-compact"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 right-0 flex items-center bg-primary rounded-full shadow-glow overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
            aria-label={`Remove one ${item.name}`}
            className="w-7 h-7 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
          >
            <Minus size={12} strokeWidth={3} />
          </button>
          <span className="min-w-[16px] text-center text-[12px] font-bold text-primary-foreground select-none">
            {quantity}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); addItem(item); }}
            aria-label={`Add one more ${item.name}`}
            className="w-7 h-7 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  /* full */
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="stepper-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center bg-primary rounded-full shadow-glow overflow-hidden"
      >
        <button
          onClick={() => removeItem(item.id)}
          aria-label={`Remove one ${item.name}`}
          className="w-8 h-8 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <span className="min-w-[20px] text-center text-sm font-bold text-primary-foreground select-none">
          {quantity}
        </span>
        <button
          onClick={() => addItem(item)}
          aria-label={`Add one more ${item.name}`}
          className="w-8 h-8 flex items-center justify-center text-primary-foreground hover:bg-primary/80 active:bg-primary/60 transition-colors"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
