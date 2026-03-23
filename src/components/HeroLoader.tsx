import { motion, AnimatePresence } from "framer-motion";
import chopgeeLogo from "@/assets/chopgee-final-removebg-preview.png";

const LOGO_SIZE = 220;

/**
 * Renders the Chop Gee logo as two halves that fly in from opposite sides,
 * meet in the middle, shake to simulate a handshake, then hold steady.
 *
 * Timeline (total ≈ 1.5 s — well under the 2.5 s budget):
 *  0.00 – 0.45 s  Left half slides in from -100 vw, right from +100 vw
 *  0.50 – 1.00 s  Jiggle / vibration envelope (0.5 s shake)
 *  1.00 – 1.50 s  Unified logo holds centered
 *  Exit           Parent AnimatePresence fades the whole loader out
 */
function HandshakeSplitLogo() {
  return (
    <div
      style={{
        position: "relative",
        width: LOGO_SIZE,
        height: LOGO_SIZE,
      }}
    >
      {/*
        Jiggle envelope — wraps both halves so they shake together
        as a single unified logo once the slide-in has finished.
        delay matches the slide-in duration so the shake begins the
        instant the two halves meet.
      */}
      <motion.div
        style={{ position: "absolute", inset: 0 }}
        animate={{
          x: [0, -10, 10, -8, 8, -5, 5, -3, 3, 0],
        }}
        transition={{
          delay: 0.5,
          duration: 0.5,
          ease: "easeInOut",
          times: [0, 0.08, 0.22, 0.38, 0.52, 0.64, 0.76, 0.86, 0.94, 1],
        }}
      >
        {/* ── LEFT half: clip-path keeps only the left 50 % ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: "inset(0 50% 0 0)",
          }}
          initial={{ x: "-100vw" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={chopgeeLogo}
            alt=""
            aria-hidden={true}
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              objectFit: "contain",
              display: "block",
            }}
          />
        </motion.div>

        {/* ── RIGHT half: clip-path keeps only the right 50 % ── */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: "inset(0 0 0 50%)",
          }}
          initial={{ x: "100vw" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={chopgeeLogo}
            alt="Chop Gee logo"
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              objectFit: "contain",
              display: "block",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
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

          {/* ── Handshake split logo ── */}
          <div className="mb-6">
            <HandshakeSplitLogo />
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
