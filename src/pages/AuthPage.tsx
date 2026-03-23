import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, User, Phone, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { OAUTH_PENDING_KEY } from "@/lib/auth-context";
import chopgeeLogo from "@/assets/chopgee-final-removebg-preview.png";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      localStorage.setItem(OAUTH_PENDING_KEY, "true");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://headie-feast.vercel.app",
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
    if (mode === "signup" && !name.trim()) {
      toast("What should we call you? 👀", { description: "Please enter your name." });
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: authData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;

        // Immediately save name + phone to profiles (the DB trigger creates the row)
        if (authData.user) {
          await supabase
            .from("profiles")
            .upsert(
              {
                user_id: authData.user.id,
                display_name: name.trim() || email.split("@")[0],
                phone: phone.trim() || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
        }

        toast("You're in the squad! 🎉", {
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFBF0" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        {/* Logo */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="mb-3 flex items-center justify-center">
            <img
              src={chopgeeLogo}
              alt="Chop Gee logo"
              style={{ width: 160, height: 160, objectFit: "contain" }}
            />
          </div>

          <AnimatePresence mode="wait">
            {mode === "signup" ? (
              <motion.div
                key="signup-header"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-sans text-3xl font-extrabold text-foreground mb-1 tracking-wide">
                  Welcome to the Squad! 🍲
                </h1>
                <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
                  Let's get your profile set up, bestie.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signin-header"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-sans text-4xl font-extrabold text-foreground mb-2 tracking-wide">
                  Chop Gee
                </h1>
                <p className="text-muted-foreground text-sm max-w-[260px] mx-auto">
                  Your obsessed food bestie. Never eat a bad meal again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-3"
        >
          {/* Sign-up only fields */}
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="signup-fields"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Full Name */}
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="What should we call you? (Full Name)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 border border-border/50"
                    style={{ "--tw-ring-color": "#F97316" } as React.CSSProperties}
                  />
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 border border-border/50"
                    style={{ "--tw-ring-color": "#F97316" } as React.CSSProperties}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 border border-border/50"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={mode === "signup" ? "Create Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white rounded-2xl pl-10 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 border border-border/50"
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

          {mode === "signin" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-semibold hover:underline"
                style={{ color: "#F97316" }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full text-white rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg"
            style={{ background: "linear-gradient(135deg, #F97316, #FB923C)", boxShadow: "0 4px 18px rgba(249,115,22,0.4)" }}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === "signup" ? "Join the Squad 🎉" : "Sign In"}
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
          className="w-full max-w-sm mt-3 bg-white text-foreground rounded-2xl py-3.5 font-semibold text-sm flex items-center justify-center gap-3 border border-border hover:bg-secondary/50 transition-colors disabled:opacity-60"
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
        <div className="mt-6 text-center">
          {mode === "signin" && (
            <p className="text-muted-foreground text-xs">
              New here?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-semibold hover:underline"
                style={{ color: "#F97316" }}
              >
                Create an account
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-muted-foreground text-xs">
              Already in the club?{" "}
              <button
                onClick={() => setMode("signin")}
                className="font-semibold hover:underline"
                style={{ color: "#F97316" }}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
