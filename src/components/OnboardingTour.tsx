import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, Search } from "lucide-react";

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    emoji: "🎉",
    title: "Welcome to the inner circle",
    subtitle: "Headie is here to make sure you never eat a bad meal again.",
    description: "We curate the best food spots, track your orders with personality, and surprise you with treats along the way.",
    icon: Sparkles,
    color: "from-primary to-accent",
  },
  {
    emoji: "🔍",
    title: "Discover your next obsession",
    subtitle: "Shake to Decide. Browse curated collections. Find hidden gems.",
    description: "Our 'Headie's Choice' algorithm learns your taste. The more you order, the better we get at reading your cravings.",
    icon: Search,
    color: "from-accent to-primary",
  },
  {
    emoji: "🦸",
    title: "Meet your Headie Hero",
    subtitle: "Live tracking with personality. Status updates that make you smile.",
    description: "Every delivery is handled by a certified Headie Hero. Track them in real-time with updates like 'guarding your food with their life.'",
    icon: MapPin,
    color: "from-primary to-coral",
  },
];

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background"
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center"
          >
            {/* Icon circle */}
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center mb-8 shadow-glow`}>
              <span className="text-5xl">{current.emoji}</span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-foreground mb-2 leading-tight">
              {current.title}
            </h1>
            <p className="text-primary font-semibold text-sm mb-3">{current.subtitle}</p>
            <p className="text-muted-foreground text-sm max-w-[300px] leading-relaxed">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-10 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => (isLast ? onComplete() : setStep(step + 1))}
            className="w-full headie-gradient text-primary-foreground rounded-2xl py-4 font-semibold text-sm shadow-glow flex items-center justify-center gap-2"
          >
            {isLast ? "Let's Eat! 🍽️" : "Next"}
            <ArrowRight size={16} />
          </motion.button>
          {!isLast && (
            <button
              onClick={onComplete}
              className="text-muted-foreground text-xs font-medium mx-auto block"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
