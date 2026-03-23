import { motion, AnimatePresence } from "framer-motion";
import chopgeeGif from "@/assets/chopgee-gif.mp4";

// Scaled up for a dramatic feel — larger than the original 220 px logo
const LOGO_SIZE = 300;

/**
 * Displays the animated Chopgee GIF (delivered as an MP4 for better
 * compression). The video autoplays, loops, and is muted so it behaves
 * exactly like an animated GIF.
 *
 * mix-blend-mode: multiply blends any non-transparent areas of the video
 * into the orange background so the logo sits seamlessly on the gradient.
 */
function ChopgeeAnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Container background matches the gradient midpoint so multiply
        // blending merges the logo into the orange seamlessly.
        backgroundColor: "#EA580C",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      <video
        src={chopgeeGif}
        autoPlay
        loop
        muted
        playsInline
        aria-label="Chop Gee animated logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          // Blends white/light pixels into the orange background so the
          // logo appears as if it has a transparent background.
          mixBlendMode: "multiply",
        }}
      />
    </motion.div>
  );
}

interface HeroLoaderProps {
  show: boolean;
}

export default function HeroLoader({ show }: HeroLoaderProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
          style={{
            background:
              "linear-gradient(160deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          aria-label="Chop Gee loading"
        >
          {/* Ambient radial glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 420,
              height: 420,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.13) 0%, transparent 65%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -52%)",
            }}
          />

          {/* ── Animated Chopgee logo ── */}
          <div className="mb-6">
            <ChopgeeAnimatedLogo />
          </div>

          {/* Tagline — fades in after slide-in + shake completes */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
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
