import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import officialLogo from "@/assets/gee-final-logo.png";

export default function RiderOnboardingSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFBF0] flex flex-col">
      {/* Top Bar */}
      <div
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #F97316, #FB923C)" }}
      >
        <img src={officialLogo} alt="Chopgee" className="w-8 h-8 object-contain" />
        <h1 className="text-white font-bold text-base">Application Submitted</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-7xl"
        >
          🛵
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-serif font-bold text-foreground">Application Received! 🛵</h2>
          <p className="text-base text-muted-foreground max-w-xs leading-relaxed">
            We will review your ID and get back to you within 72 hours.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="mt-2 bg-[#F97316] text-white py-3 px-10 rounded-2xl font-bold text-sm shadow-lg"
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}
