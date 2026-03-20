import { motion, AnimatePresence } from "framer-motion";

/**
 * CG logo — faithfully reproduces the Chop Gee brand mark:
 *  • Orange 'C' and green 'G' centred and overlapping naturally
 *  • Green 'G' carries a location-pin at its top-right
 *  • A curved smile sits inside the open mouth of the G
 *  • A subtle green leaf swoosh runs beneath both letters
 *
 * The viewBox is 200 × 140 so there is comfortable padding around
 * both glyphs and no part floats outside the frame.
 */
function CGLogo() {
  return (
    <svg
      width="180"
      height="134"
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chop Gee logo"
    >
      {/* ── Orange C ──────────────────────────────────────────── */}
      {/* Centre of C arc: (72, 70), radius 44 — opens to the right */}
      <path
        d="M116 36 A44 44 0 1 0 116 104"
        stroke="#E05A1A"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Green G ───────────────────────────────────────────── */}
      {/* Centre of G arc: (128, 70), radius 44 — opens to the left */}
      <path
        d="M84 36 A44 44 0 1 1 84 104"
        stroke="#3DAA2F"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      {/* G crossbar — from the mid-point of the G opening rightward */}
      <line
        x1="128"
        y1="70"
        x2="172"
        y2="70"
        stroke="#3DAA2F"
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* ── Location pin on top of G ──────────────────────────── */}
      {/* Pin body (teardrop): circle + triangle tail */}
      <circle cx="172" cy="30" r="11" fill="#3DAA2F" />
      <path
        d="M172 41 L172 52"
        stroke="#3DAA2F"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* White dot inside pin */}
      <circle cx="172" cy="29" r="4.5" fill="white" />

      {/* ── Smile inside G ────────────────────────────────────── */}
      <path
        d="M143 90 Q156 102 169 90"
        stroke="#3DAA2F"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Leaf swoosh beneath C and G ───────────────────────── */}
      <path
        d="M68 122 Q100 134 132 122"
        stroke="#3DAA2F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

/**
 * Left hand of the handshake — more detailed, realistic SVG.
 * Fingers point right; thumb points up-right.
 */
function LeftHand() {
  return (
    <svg
      width="90"
      height="76"
      viewBox="0 0 90 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Palm */}
      <ellipse cx="48" cy="52" rx="30" ry="21" fill="#9C6B3E" />
      {/* Wrist extension */}
      <rect x="14" y="48" width="24" height="22" rx="6" fill="#9C6B3E" />

      {/* Index finger */}
      <rect x="52" y="14" width="13" height="38" rx="6.5" fill="#8A5C32" />
      {/* Middle finger */}
      <rect x="66" y="8" width="13" height="44" rx="6.5" fill="#8A5C32" />
      {/* Ring finger */}
      <rect x="55" y="22" width="12" height="32" rx="6" fill="#8A5C32" />
      {/* Pinky */}
      <rect x="44" y="28" width="11" height="26" rx="5.5" fill="#8A5C32" />

      {/* Thumb */}
      <ellipse
        cx="22"
        cy="43"
        rx="9"
        ry="14"
        fill="#8A5C32"
        transform="rotate(-25 22 43)"
      />

      {/* Knuckle highlights */}
      <ellipse cx="58" cy="18" rx="4" ry="2.5" fill="#B07840" opacity="0.55" />
      <ellipse cx="72" cy="12" rx="4" ry="2.5" fill="#B07840" opacity="0.55" />
      <ellipse cx="61" cy="26" rx="3.5" ry="2" fill="#B07840" opacity="0.45" />
      <ellipse cx="50" cy="32" rx="3" ry="2" fill="#B07840" opacity="0.4" />

      {/* Palm crease */}
      <path
        d="M24 54 Q40 50 60 56"
        stroke="#7A4E2A"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

/**
 * Right hand of the handshake — mirror of the left hand with a
 * slightly darker skin tone so the two hands read as distinct.
 */
function RightHand() {
  return (
    <svg
      width="90"
      height="76"
      viewBox="0 0 90 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: "scaleX(-1)" }}
    >
      {/* Palm */}
      <ellipse cx="48" cy="52" rx="30" ry="21" fill="#6B4020" />
      {/* Wrist extension */}
      <rect x="14" y="48" width="24" height="22" rx="6" fill="#6B4020" />

      {/* Index finger */}
      <rect x="52" y="14" width="13" height="38" rx="6.5" fill="#5C3418" />
      {/* Middle finger */}
      <rect x="66" y="8" width="13" height="44" rx="6.5" fill="#5C3418" />
      {/* Ring finger */}
      <rect x="55" y="22" width="12" height="32" rx="6" fill="#5C3418" />
      {/* Pinky */}
      <rect x="44" y="28" width="11" height="26" rx="5.5" fill="#5C3418" />

      {/* Thumb */}
      <ellipse
        cx="22"
        cy="43"
        rx="9"
        ry="14"
        fill="#5C3418"
        transform="rotate(-25 22 43)"
      />

      {/* Knuckle highlights */}
      <ellipse cx="58" cy="18" rx="4" ry="2.5" fill="#8B5030" opacity="0.55" />
      <ellipse cx="72" cy="12" rx="4" ry="2.5" fill="#8B5030" opacity="0.55" />
      <ellipse cx="61" cy="26" rx="3.5" ry="2" fill="#8B5030" opacity="0.45" />
      <ellipse cx="50" cy="32" rx="3" ry="2" fill="#8B5030" opacity="0.4" />

      {/* Palm crease */}
      <path
        d="M24 54 Q40 50 60 56"
        stroke="#4A2A10"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
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

          {/* CG Logo card — matches the rounded-square brand icon */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="mb-3"
            style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 28,
              padding: "16px 20px 12px",
              backdropFilter: "blur(4px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
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
            className="flex items-end justify-center mb-8"
            style={{ gap: 0 }}
          >
            {/* Left hand slides in from the left */}
            <motion.div
              initial={{ x: -70, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
              style={{ marginRight: -10 }}
            >
              {/* Bounce after meeting — simulates the shake */}
              <motion.div
                animate={{ y: [0, -7, 0, -4, 0, -2, 0] }}
                transition={{
                  delay: 1.1,
                  duration: 0.65,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.6,
                }}
              >
                <LeftHand />
              </motion.div>
            </motion.div>

            {/* Right hand slides in from the right */}
            <motion.div
              initial={{ x: 70, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
              style={{ marginLeft: -10 }}
            >
              <motion.div
                animate={{ y: [0, -7, 0, -4, 0, -2, 0] }}
                transition={{
                  delay: 1.1,
                  duration: 0.65,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 1.6,
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
