import { useState } from "react";
import { Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { allItems, FoodItem } from "@/lib/data";
import FoodCard from "./FoodCard";

const MAIN_MEAL_TAGS = [
  "Jollof Rice",
  "Spaghetti",
  "Macaroni",
  "Rice & Beans",
  "Shawarma",
  "Grills",
  "Main Meal",
];

function isMainMeal(tags: string[]) {
  return tags.some((t) => MAIN_MEAL_TAGS.includes(t));
}

function isExtra(tags: string[]) {
  return tags.some((t) => ["Extra", "Side"].includes(t));
}

const choplifeMainMeals = allItems.filter(
  (item) =>
    item.restaurant === "Choplife Kitchen" &&
    isMainMeal(item.tags) &&
    !isExtra(item.tags)
);

export default function ShakeToDecide() {
  const [result, setResult] = useState<FoodItem | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleShake = () => {
    if (choplifeMainMeals.length === 0) return;
    setShaking(true);
    setResult(null);
    setTimeout(() => {
      const random =
        choplifeMainMeals[Math.floor(Math.random() * choplifeMainMeals.length)];
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
        className="w-full chopgee-gradient text-primary-foreground rounded-2xl p-4 flex items-center justify-center gap-3 shadow-glow font-semibold text-lg"
      >
        <Shuffle size={22} />
        {shaking ? "Deciding..." : "Can't decide? Shake it! 🎲"}
      </motion.button>

      <AnimatePresence>
        {choplifeMainMeals.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-center text-sm text-muted-foreground bg-muted rounded-xl px-4 py-3"
          >
            This spot is all about the extras! Pick a main meal from the
            dashboard first. 😅
          </motion.div>
        ) : (
          result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <p className="text-sm text-muted-foreground mb-2 text-center font-medium">
                Chop Gee says you should try... 🤤
              </p>
              <FoodCard item={result} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
