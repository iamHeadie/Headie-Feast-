import { motion } from "framer-motion";
import jollof from "@/assets/jollof.jpg";

interface RestaurantBannerCardProps {
  onRestaurantClick?: (name: string) => void;
  className?: string;
}

export default function RestaurantBannerCard({ onRestaurantClick, className = "mb-6" }: RestaurantBannerCardProps) {
  return (
    <div className={`px-4 ${className}`}>
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

        {/* Subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Restaurant name — bottom left */}
        <div className="absolute bottom-0 left-0 px-4 pb-4">
          <h2 className="text-white font-bold text-xl leading-tight text-left">
            Choplife Kitchen
          </h2>
        </div>
      </motion.button>
    </div>
  );
}
