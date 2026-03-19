import { ArrowLeft, Users } from "lucide-react";
import { motion } from "framer-motion";
import { allItems } from "@/lib/data";
import FoodCard from "@/components/FoodCard";
import GroupOrder from "@/components/GroupOrder";
import { useState } from "react";

interface MenuPageProps {
  onBack: () => void;
}

export default function MenuPage({ onBack }: MenuPageProps) {
  const [showGroupOrder, setShowGroupOrder] = useState(false);

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-secondary rounded-full p-2 text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Full Menu</h1>
            <p className="text-xs text-muted-foreground">All the good stuff 😋</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowGroupOrder(true)}
          className="bg-secondary text-foreground rounded-2xl px-3 py-2 text-sm font-semibold flex items-center gap-1.5"
        >
          <Users size={14} /> Host a Feast
        </motion.button>
      </div>

      <div className="px-4 space-y-3">
        {allItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FoodCard item={item} />
          </motion.div>
        ))}
      </div>

      <GroupOrder show={showGroupOrder} onClose={() => setShowGroupOrder(false)} />
    </div>
  );
}
