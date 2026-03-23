import { motion, AnimatePresence } from "framer-motion";
import officialLogo from "@/assets/gee-final-logo.png";

interface HeroLoaderProps {
  show: boolean;
}

export default function HeroLoader({ show }: HeroLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: "#F97316" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          aria-label="Chop Gee loading"
        >
          {/* Logo — gentle scale-up and fade-in */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-6"
          >
            <img
              src={officialLogo}
              alt="Chop Gee logo"
              style={{ width: 220, height: 220, objectFit: "contain" }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.45 }}
            className="text-white/90 text-sm font-semibold tracking-wide text-center px-8"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Chop Gee: Your obsessed food bestie
          </motion.p>

          {/* Loading dots */}
          <div className="flex gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/70"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
