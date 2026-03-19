import { motion, AnimatePresence } from "framer-motion";
import { Users, Copy, Check, X } from "lucide-react";
import { useState } from "react";

interface GroupOrderProps {
  show: boolean;
  onClose: () => void;
}

export default function GroupOrder({ show, onClose }: GroupOrderProps) {
  const [copied, setCopied] = useState(false);
  const fakeLink = "headie.app/feast/a8f3k2";

  const handleCopy = () => {
    navigator.clipboard.writeText(fakeLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-end justify-center"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-card rounded-t-3xl p-6 max-w-lg w-full shadow-elevated"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-foreground">🎉 Host a Feast!</h3>
              <button onClick={onClose} className="text-muted-foreground"><X size={20} /></button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Share this link with your squad. Everyone picks what they want, you checkout together. Easy peasy! 🍕
            </p>

            <div className="flex items-center gap-2 bg-secondary rounded-2xl p-3 mb-4">
              <span className="flex-1 text-sm font-mono text-foreground truncate">{fakeLink}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopy}
                className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-1"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </motion.button>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users size={16} />
              <span>0 friends joined so far</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
