import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import chopgeeLogo from "@/assets/chopgee-final-removebg-preview.png";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast("Hey bestie, drop your email first 📧");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "https://headie-feast.vercel.app/reset-password",
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast("Oops! Something went wrong 😅", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="mb-4 flex items-center justify-center">
            <img
              src={chopgeeLogo}
              alt="Chop Gee logo"
              style={{ width: 140, height: 140, objectFit: "contain" }}
            />
          </div>
          <h1 className="font-sans text-3xl font-extrabold text-foreground mb-2 tracking-wide">
            Forgot your password?
          </h1>
          <p className="text-muted-foreground text-sm max-w-[260px] mx-auto">
            No worries bestie — we've got you. Enter your email and we'll send a reset link your way.
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-secondary rounded-2xl p-6 text-center space-y-3"
          >
            <div className="text-4xl">📧</div>
            <p className="font-semibold text-foreground text-base">Check your email!</p>
            <p className="text-muted-foreground text-sm">
              A reset link has been sent to your bestie inbox. 📧
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="text-primary text-sm font-semibold hover:underline mt-2 inline-block"
            >
              Back to Sign In
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="w-full max-w-sm space-y-4"
          >
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full chopgee-gradient text-primary-foreground rounded-2xl py-3.5 font-semibold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
