import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { useState } from "react";

interface HeadieHugProps {
  show: boolean;
  onDismiss: () => void;
}

export default function HeadieHug({ show, onDismiss }: HeadieHugProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-card rounded-3xl p-6 max-w-sm w-full text-center relative shadow-elevated"
          >
            <button onClick={onDismiss} className="absolute top-3 right-3 text-muted-foreground">
              <X size={20} />
            </button>

            <motion.div
              animate={revealed ? {} : { y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-4"
            >
              🤗
            </motion.div>

            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              {revealed ? "You got 20% off!" : "A Headie Hug for you!"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {revealed
                ? "We're sorry your order took longer than expected. Here's a little something to make it better 💛"
                : "We noticed your wait was a bit longer. Tap to unwrap your surprise!"}
            </p>

            {!revealed ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setRevealed(true)}
                className="headie-gradient text-primary-foreground rounded-2xl px-6 py-3 font-semibold shadow-glow"
              >
                <Gift size={18} className="inline mr-2" />
                Unwrap Surprise
              </motion.button>
            ) : (
              <div className="bg-secondary rounded-2xl p-4">
                <p className="text-2xl font-serif font-bold text-primary">HEADIE20</p>
                <p className="text-xs text-muted-foreground mt-1">Use on your next order</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
