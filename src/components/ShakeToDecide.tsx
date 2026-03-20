import { useState } from "react";
import { Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allItems, FoodItem } from "@/lib/data";
import FoodCard from "./FoodCard";

export default function ShakeToDecide() {
  const [result, setResult] = useState<FoodItem | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleShake = () => {
    setShaking(true);
    setResult(null);
    setTimeout(() => {
      const random = allItems[Math.floor(Math.random() * allItems.length)];
      setResult(random);
      setShaking(false);
    }, 800);
  };

  return (
    <div className="px-4">
      <motion.button
        whileTap={{ scale: 0.95 }}
        animate={shaking ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        onClick={handleShake}
        className="w-full headie-gradient text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-3 shadow-glow font-semibold text-lg"
      >
        <Shuffle size={22} />
        {shaking ? "Deciding..." : "Can't decide? Shake it! 🎲"}
      </motion.button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
          >
            <p className="text-sm text-muted-foreground mb-2 text-center font-medium">
              Chop Gee says you should try... 🤤
            </p>
            <FoodCard item={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
