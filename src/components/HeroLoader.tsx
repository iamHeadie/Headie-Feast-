import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils } from "lucide-react";

const messages = [
  "Your Headie hero has prepared your meal...",
  "Setting the table for a Hero...",
  "Polishing the special spaghetti fork...",
  "Almost time to join the feast...",
];

function SteamWisp({ delay, xOffset }: { delay: number; xOffset: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ bottom: 4, left: `calc(50% + ${xOffset}px)`, translateX: "-50%" }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.75, 0.6, 0],
        y: [0, -30, -55, -80],
        x: [0, xOffset > 0 ? 4 : -4, xOffset > 0 ? -3 : 3, 0],
      }}
      transition={{
        duration: 2.8,
        delay,
        repeat: Infinity,
        repeatDelay: 0.3,
        ease: "easeOut",
      }}
    >
      <svg width="10" height="44" viewBox="0 0 10 44" fill="none">
        <path
          d="M5 44 C1 34 9 26 5 18 C1 10 9 2 5 -6"
          stroke="rgba(255,220,170,0.65)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

function SpaghettiPlate() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Plate drop shadow */}
      <ellipse cx="100" cy="175" rx="80" ry="12" fill="rgba(0,0,0,0.3)" />

      {/* Plate outer rim */}
      <circle cx="100" cy="100" r="88" fill="#f0ebe0" />
      <circle cx="100" cy="100" r="84" fill="#e8e0d0" stroke="#cfc4ae" strokeWidth="1.5" />

      {/* Plate well */}
      <circle cx="100" cy="100" r="74" fill="#faf6ee" />

      {/* Sauce base */}
      <ellipse cx="100" cy="112" rx="58" ry="42" fill="#d4601a" />
      <ellipse cx="100" cy="112" rx="54" ry="38" fill="#e07228" />

      {/* Spaghetti strands — layered */}
      <path d="M50 108 Q65 92 82 104 Q96 115 112 100 Q126 85 148 104" stroke="#c85a12" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M48 118 Q63 102 80 114 Q94 126 112 111 Q126 97 150 114" stroke="#b84e0e" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M55 98 Q68 84 84 96 Q98 108 115 94 Q128 82 145 96" stroke="#d4601a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M52 128 Q68 114 84 124 Q98 133 114 120 Q130 107 150 122" stroke="#c85a12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M56 88 Q70 76 86 86 Q100 95 116 83 Q130 72 144 86" stroke="#e07830" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Meatballs */}
      <circle cx="86" cy="102" r="14" fill="#5c2810" />
      <circle cx="86" cy="102" r="12" fill="#6e3218" />
      <circle cx="86" cy="101" r="10" fill="#7a3a1e" />
      <circle cx="116" cy="108" r="13" fill="#5c2810" />
      <circle cx="116" cy="108" r="11" fill="#6e3218" />
      <circle cx="116" cy="107" r="9" fill="#7a3a1e" />
      <circle cx="100" cy="88" r="11" fill="#5c2810" />
      <circle cx="100" cy="88" r="9" fill="#6e3218" />
      <circle cx="100" cy="87" r="7.5" fill="#7a3a1e" />

      {/* Sauce highlights */}
      <path d="M65 110 Q80 98 96 107" stroke="#ff7040" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M106 92 Q120 82 132 92" stroke="#ff7040" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Parsley */}
      <circle cx="78" cy="114" r="2.5" fill="#4a8228" />
      <circle cx="122" cy="100" r="2.5" fill="#4a8228" />
      <circle cx="100" cy="128" r="2.5" fill="#3d7020" />
      <circle cx="110" cy="84" r="2" fill="#4a8228" />
      <circle cx="68" cy="122" r="2" fill="#4a8228" />

      {/* Plate rim highlight */}
      <path d="M30 80 Q50 28 100 16" stroke="rgba(255,255,255,0.4)" strokeWidth="5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

interface HeroLoaderProps {
  show: boolean;
}

export default function HeroLoader({ show }: HeroLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [showMsg, setShowMsg] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMsg(false);
      const t = setTimeout(() => {
        setMsgIndex((i) => (i + 1) % messages.length);
        setShowMsg(true);
      }, 400);
      return () => clearTimeout(t);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #1a0a00 0%, #3d1200 40%, #6b2000 100%)",
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340,
              height: 340,
              background: "radial-gradient(circle, rgba(220,100,20,0.18) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -56%)",
            }}
          />

          {/* Main content row: fork | plate+steam | knife */}
          <div className="relative flex items-center justify-center gap-8 mb-6">
            {/* Fork (left) */}
            <motion.div
              className="text-amber-300 flex-shrink-0"
              animate={{
                rotate: [0, -10, 0, 10, 0],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Utensils size={40} strokeWidth={1.5} />
            </motion.div>

            {/* Plate with steam above */}
            <div className="relative flex flex-col items-center">
              {/* Steam container */}
              <div className="relative w-48 h-16">
                <SteamWisp delay={0}   xOffset={-32} />
                <SteamWisp delay={0.5} xOffset={-14} />
                <SteamWisp delay={0.9} xOffset={6} />
                <SteamWisp delay={0.3} xOffset={26} />
                <SteamWisp delay={1.3} xOffset={38} />
              </div>

              {/* Plate entrance animation */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "backOut" }}
              >
                <SpaghettiPlate />
              </motion.div>
            </div>

            {/* Knife (right) — mirrored Utensils */}
            <motion.div
              className="text-amber-300 flex-shrink-0"
              style={{ transform: "scaleX(-1)" }}
              animate={{
                rotate: [0, 10, 0, -10, 0],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <Utensils size={40} strokeWidth={1.5} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h1
            className="text-amber-100 text-2xl font-bold tracking-widest mb-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.15em" }}
          >
            HERO'S FEAST
          </motion.h1>

          {/* Cycling messages */}
          <div className="h-7 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showMsg && (
                <motion.p
                  key={msgIndex}
                  className="text-amber-300/80 text-sm font-medium tracking-wide text-center px-8"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  {messages[msgIndex]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Loading dots */}
          <div className="flex gap-2 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber-500"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.4, delay: i * 0.22, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
