import { motion, AnimatePresence } from "framer-motion";

/**
 * Full Chop Gee brand mark — reproduces the uploaded reference image:
 *
 *  ┌────────────────────────────────────┐
 *  │  [orange rounded-square badge]     │
 *  │   ╭──╮  ╭──╮  ← orange C, green G │
 *  │   │  ╰──╯  │  ← hands clasped in  │
 *  │   │  🤝  │     the centre gap      │
 *  │   ╰──  ──╯                         │
 *  │     CHOP GEE                       │
 *  └────────────────────────────────────┘
 *
 * The viewBox is 200 × 220 to give room for the badge background,
 * the overlapping letters, the handshake, and the wordmark.
 *
 * Key design decisions that match the reference photo:
 *  • Orange C arcs left-open, green G arcs right-open — they share
 *    the vertical centre so their open mouths face each other.
 *  • The clasped hands sit exactly in that shared gap.
 *  • Left hand: medium-warm brown (#A0522D / sienna family).
 *  • Right hand: deeper warm brown (#5C3317) — same family, slightly darker.
 *  • A green location pin caps the top-right of the G.
 *  • A shallow smile arc sits inside the G opening.
 *  • A subtle green leaf swoosh runs underneath both letters.
 */
function ChopGeeBadge({ size = 180 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Chop Gee logo"
    >
      {/* ── Badge background (rounded square, lighter orange) ────── */}
      <rect
        x="8" y="8" width="184" height="184" rx="36"
        fill="rgba(255,255,255,0.22)"
      />

      {/* ══════════════════════════════════════════════════════════
          ORANGE  C   — centred at (82, 90), radius 42
          Opens to the right (gap from ~y=55 to ~y=125)
         ══════════════════════════════════════════════════════════ */}
      <path
        d="M124 56 A42 42 0 1 0 124 124"
        stroke="#E05A1A"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* ══════════════════════════════════════════════════════════
          GREEN  G   — centred at (118, 90), radius 42
          Opens to the left (gap from ~y=55 to ~y=125)
         ══════════════════════════════════════════════════════════ */}
      <path
        d="M76 56 A42 42 0 1 1 76 124"
        stroke="#3DAA2F"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
      {/* G crossbar — extends inward from the mid-point of the opening */}
      <line
        x1="118" y1="90" x2="158" y2="90"
        stroke="#3DAA2F"
        strokeWidth="20"
        strokeLinecap="round"
      />

      {/* ── Location pin on top-right of G ──────────────────────── */}
      <circle cx="162" cy="42" r="12" fill="#3DAA2F" />
      <path
        d="M162 54 L162 64"
        stroke="#3DAA2F" strokeWidth="5" strokeLinecap="round"
      />
      {/* White inner dot */}
      <circle cx="162" cy="41" r="5" fill="white" />

      {/* ── Smile inside G ──────────────────────────────────────── */}
      <path
        d="M131 108 Q143 118 155 108"
        stroke="#3DAA2F" strokeWidth="5"
        strokeLinecap="round" fill="none"
      />

      {/* ══════════════════════════════════════════════════════════
          HANDSHAKE  — sits in the shared gap between C and G
          Left hand comes from the left (C side), right from the right (G side).
          Both hands point toward each other and clasp at x≈100.
         ══════════════════════════════════════════════════════════ */}

      {/* ── Left hand (medium warm brown, #A0522D family) ─────── */}
      <g>
        {/* Palm body */}
        <ellipse cx="97" cy="105" rx="22" ry="16" fill="#9C6437" />
        {/* Wrist / arm extension going left */}
        <rect x="58" y="99" width="32" height="14" rx="6" fill="#9C6437" />

        {/* Four fingers pointing right (stacked vertically, angled) */}
        {/* Index */}
        <rect x="107" y="78" width="10" height="28" rx="5" fill="#8B5530"
          transform="rotate(-8 112 92)" />
        {/* Middle */}
        <rect x="116" y="72" width="10" height="32" rx="5" fill="#8B5530"
          transform="rotate(-8 121 88)" />
        {/* Ring */}
        <rect x="108" y="85" width="10" height="26" rx="5" fill="#8B5530"
          transform="rotate(-4 113 98)" />
        {/* Pinky */}
        <rect x="100" y="91" width="9" height="22" rx="4.5" fill="#8B5530"
          transform="rotate(-2 104 102)" />

        {/* Thumb — angled upward-left */}
        <ellipse cx="72" cy="97" rx="7" ry="12" fill="#8B5530"
          transform="rotate(30 72 97)" />

        {/* Knuckle highlight lines */}
        <ellipse cx="112" cy="82" rx="3.5" ry="2" fill="#B07840" opacity="0.5" />
        <ellipse cx="121" cy="76" rx="3.5" ry="2" fill="#B07840" opacity="0.5" />
        <ellipse cx="113" cy="89" rx="3" ry="1.8" fill="#B07840" opacity="0.4" />

        {/* Palm crease */}
        <path d="M68 108 Q85 103 100 109"
          stroke="#7A4528" strokeWidth="1.5"
          strokeLinecap="round" fill="none" opacity="0.4" />
      </g>

      {/* ── Right hand (deeper warm brown, #5C3317 family, mirrored) ── */}
      <g transform="translate(200,0) scale(-1,1)">
        {/* Palm body */}
        <ellipse cx="97" cy="105" rx="22" ry="16" fill="#6B3C1C" />
        {/* Wrist / arm extension going left (which is right in screen space) */}
        <rect x="58" y="99" width="32" height="14" rx="6" fill="#6B3C1C" />

        {/* Four fingers */}
        <rect x="107" y="78" width="10" height="28" rx="5" fill="#5A3015"
          transform="rotate(-8 112 92)" />
        <rect x="116" y="72" width="10" height="32" rx="5" fill="#5A3015"
          transform="rotate(-8 121 88)" />
        <rect x="108" y="85" width="10" height="26" rx="5" fill="#5A3015"
          transform="rotate(-4 113 98)" />
        <rect x="100" y="91" width="9" height="22" rx="4.5" fill="#5A3015"
          transform="rotate(-2 104 102)" />

        {/* Thumb */}
        <ellipse cx="72" cy="97" rx="7" ry="12" fill="#5A3015"
          transform="rotate(30 72 97)" />

        {/* Knuckle highlights */}
        <ellipse cx="112" cy="82" rx="3.5" ry="2" fill="#8B5030" opacity="0.5" />
        <ellipse cx="121" cy="76" rx="3.5" ry="2" fill="#8B5030" opacity="0.5" />
        <ellipse cx="113" cy="89" rx="3" ry="1.8" fill="#8B5030" opacity="0.4" />

        {/* Palm crease */}
        <path d="M68 108 Q85 103 100 109"
          stroke="#4A2A10" strokeWidth="1.5"
          strokeLinecap="round" fill="none" opacity="0.4" />
      </g>

      {/* ── Leaf swoosh beneath C and G ─────────────────────────── */}
      <path
        d="M62 148 Q100 162 138 148"
        stroke="#3DAA2F" strokeWidth="4.5"
        strokeLinecap="round" fill="none" opacity="0.6"
      />

      {/* ── CHOP GEE wordmark ────────────────────────────────────── */}
      <text
        x="100" y="178"
        textAnchor="middle"
        fontFamily="DM Sans, sans-serif"
        fontWeight="800"
        fontSize="18"
        fill="#3D1A00"
        letterSpacing="3"
      >
        CHOP GEE
      </text>
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

          {/* ── Brand mark badge — scale-in then handshake bounce ── */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="mb-6"
          >
            {/*
              The badge itself bounces gently to simulate the handshake
              "shake" motion — scale + slight y-bounce, looping forever.
            */}
            <motion.div
              animate={{
                y: [0, -10, 0, -6, 0, -3, 0],
                scale: [1, 1.03, 1, 1.02, 1, 1.01, 1],
              }}
              transition={{
                delay: 1.0,
                duration: 0.75,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.8,
              }}
            >
              <ChopGeeBadge size={200} />
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
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
