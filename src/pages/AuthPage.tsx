import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, User, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { OAUTH_PENDING_KEY } from "@/lib/auth-context";
import chopgeeLogo from "@/assets/chop-gee-login.jpg";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Flag the pending OAuth redirect BEFORE we navigate away.
      // App.tsx reads this on the return trip to skip the splash loader
      // so the Location Picker appears immediately after the popup closes.
      localStorage.setItem(OAUTH_PENDING_KEY, "true");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      localStorage.removeItem(OAUTH_PENDING_KEY);
      toast("Google sign-in failed 😅", { description: err.message });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast("Please fill in all fields 📝");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast("Account created! 🎉", {
          description: "Check your email to verify your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast("Welcome back! 🎉");
      }
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
          {/* Chop Gee brand mark — real brand photo */}
          <div className="mb-4 flex items-center justify-center">
            <img
              src={chopgeeLogo}
              alt="Chop Gee logo"
              style={{ width: 120, height: 120 }}
              className="object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="font-sans text-4xl font-extrabold text-foreground mb-2 tracking-wide">Chop Gee</h1>
          <p className="text-muted-foreground text-sm max-w-[260px] mx-auto">
            Your obsessed food bestie. Never eat a bad meal again.
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3"
        >
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="name"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="What should we call you?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary rounded-2xl pl-10 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full headie-gradient text-primary-foreground rounded-2xl py-3.5 font-semibold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === "signup" ? "Join the Inner Circle 🎉" : "Sign In"}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="w-full max-w-sm flex items-center gap-3 mt-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google Sign In */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full max-w-sm mt-3 bg-secondary text-foreground rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-3 border border-border hover:bg-accent transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </motion.button>

        {/* Mode toggles */}
        <div className="mt-6 space-y-2 text-center">
          {mode === "signin" && (
            <p className="text-muted-foreground text-xs">
              New here?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-semibold">
                Create an account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground text-xs">
              Already in the club?{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-semibold">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
