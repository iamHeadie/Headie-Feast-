import { motion } from "framer-motion";
import jollof from "@/assets/jollof.jpg";

interface RestaurantBannerCardProps {
  onRestaurantClick?: (name: string) => void;
}

export default function RestaurantBannerCard({ onRestaurantClick }: RestaurantBannerCardProps) {
  return (
    <div className="px-4 mb-6">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onRestaurantClick?.("Choplife Kitchen")}
        className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg focus:outline-none"
        style={{ display: "block" }}
      >
        {/* Background image */}
        <img
          src={jollof}
          alt="Choplife Kitchen"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* PRIME badge — top left */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md tracking-wide uppercase">
            PRIME
          </span>
        </div>

        {/* Discount badge — top right */}
        <div className="absolute top-3 right-3">
          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            -25% some items
          </span>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h2 className="text-white font-bold text-xl leading-tight mb-1 text-left">
            Choplife Kitchen
          </h2>
          <div className="flex items-center gap-3 text-white/90 text-sm">
            <span>⭐ 4.8</span>
            <span className="text-white/50">•</span>
            <span>25–35 min</span>
            <span className="text-white/50">•</span>
            <span>From ₦2,800</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}
