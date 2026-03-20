import { motion, AnimatePresence } from "framer-motion";

/** CG logo: orange 'C', green 'G' with a location pin and smile, matching the Chop Gee brand. */
function CGLogo() {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chop Gee logo"
    >
      {/* Orange C */}
      <path
        d="M54 18 A36 36 0 1 0 54 102"
        stroke="#E05A1A"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      {/* Green G body */}
      <path
        d="M106 18 A36 36 0 1 1 138 84"
        stroke="#3DAA2F"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      {/* Green G horizontal crossbar */}
      <line
        x1="112"
        y1="60"
        x2="138"
        y2="60"
        stroke="#3DAA2F"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Location pin on top of G */}
      <circle cx="140" cy="18" r="9" fill="#3DAA2F" />
      <path
        d="M140 27 L140 35"
        stroke="#3DAA2F"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* White dot inside pin */}
      <circle cx="140" cy="17" r="3.5" fill="white" />
      {/* Smile inside G */}
      <path
        d="M115 78 Q124 86 133 78"
        stroke="#3DAA2F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Subtle leaf swoosh between C and G */}
      <path
        d="M58 108 Q80 118 102 108"
        stroke="#3DAA2F"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

/** Left hand (coming from left, slightly rotated) */
function LeftHand() {
  return (
    <svg width="80" height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Palm */}
      <ellipse cx="40" cy="45" rx="28" ry="22" fill="#8B5E3C" />
      {/* Fingers */}
      <rect x="14" y="18" width="12" height="30" rx="6" fill="#7A5230" />
      <rect x="28" y="12" width="12" height="34" rx="6" fill="#7A5230" />
      <rect x="42" y="12" width="12" height="34" rx="6" fill="#7A5230" />
      <rect x="56" y="18" width="12" height="28" rx="6" fill="#7A5230" />
      {/* Thumb */}
      <ellipse cx="10" cy="44" rx="8" ry="12" fill="#7A5230" transform="rotate(-20 10 44)" />
      {/* Knuckle highlights */}
      <ellipse cx="20" cy="22" rx="3.5" ry="2" fill="#A06B45" opacity="0.6" />
      <ellipse cx="34" cy="16" rx="3.5" ry="2" fill="#A06B45" opacity="0.6" />
      <ellipse cx="48" cy="16" rx="3.5" ry="2" fill="#A06B45" opacity="0.6" />
      <ellipse cx="62" cy="22" rx="3.5" ry="2" fill="#A06B45" opacity="0.6" />
    </svg>
  );
}

/** Right hand (coming from right, mirror) */
function RightHand() {
  return (
    <svg width="80" height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
      <ellipse cx="40" cy="45" rx="28" ry="22" fill="#6B4226" />
      <rect x="14" y="18" width="12" height="30" rx="6" fill="#5C3820" />
      <rect x="28" y="12" width="12" height="34" rx="6" fill="#5C3820" />
      <rect x="42" y="12" width="12" height="34" rx="6" fill="#5C3820" />
      <rect x="56" y="18" width="12" height="28" rx="6" fill="#5C3820" />
      <ellipse cx="10" cy="44" rx="8" ry="12" fill="#5C3820" transform="rotate(-20 10 44)" />
      <ellipse cx="20" cy="22" rx="3.5" ry="2" fill="#8B5030" opacity="0.6" />
      <ellipse cx="34" cy="16" rx="3.5" ry="2" fill="#8B5030" opacity="0.6" />
      <ellipse cx="48" cy="16" rx="3.5" ry="2" fill="#8B5030" opacity="0.6" />
      <ellipse cx="62" cy="22" rx="3.5" ry="2" fill="#8B5030" opacity="0.6" />
    </svg>
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
            background: "linear-gradient(160deg, #F97316 0%, #EA580C 50%, #C2410C 100%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          aria-label="Chop Gee loading"
        >
          {/* Ambient radial glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 400,
              height: 400,
              background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -52%)",
            }}
          />

          {/* CG Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="mb-2"
          >
            <CGLogo />
          </motion.div>

          {/* CHOP GEE wordmark */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white text-3xl font-extrabold tracking-widest mb-6"
            style={{ fontFamily: "DM Sans, sans-serif", letterSpacing: "0.18em" }}
          >
            CHOP GEE
          </motion.h1>

          {/* Handshake animation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-center mb-8"
            style={{ gap: 0 }}
          >
            {/* Left hand slides in from the left */}
            <motion.div
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
              style={{ marginRight: -8 }}
            >
              {/* Bounce loop after meeting */}
              <motion.div
                animate={{ y: [0, -6, 0, -3, 0] }}
                transition={{
                  delay: 1.15,
                  duration: 0.55,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.8,
                }}
              >
                <LeftHand />
              </motion.div>
            </motion.div>

            {/* Right hand slides in from the right */}
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
              style={{ marginLeft: -8 }}
            >
              <motion.div
                animate={{ y: [0, -6, 0, -3, 0] }}
                transition={{
                  delay: 1.15,
                  duration: 0.55,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.8,
                }}
              >
                <RightHand />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-white/90 text-sm font-medium tracking-wide text-center px-8"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Chop Gee: Your obsessed food bestie
          </motion.p>

          {/* Loading dots */}
          <div className="flex gap-2 mt-6">
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
