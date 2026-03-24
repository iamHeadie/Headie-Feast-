import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Phone, Upload, ImageOff,
  User, Mail, Bike, Lock, Eye, EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/components/ui/sonner";
import officialLogo from "@/assets/gee-final-logo.png";

const VEHICLE_OPTIONS = [
  { value: "motorcycle", label: "🏍️ Motorcycle" },
  { value: "bicycle", label: "🚲 Bicycle" },
  { value: "walking", label: "🚶 Walking" },
];

export default function RiderApplicationPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const idFileRef = useRef<HTMLInputElement>(null);

  const isGuest = !user;

  const [fullName, setFullName] = useState(profile?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [vehicleType, setVehicleType] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already applied → redirect to success
  const alreadyApplied =
    profile?.role === "rider" &&
    (profile?.rider_status === "pending" ||
      profile?.rider_status === "active" ||
      profile?.rider_status === "approved");

  if (alreadyApplied) {
    navigate("/rider/onboarding/success", { replace: true });
    return null;
  }

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast("File too large", { description: "Please choose an image under 10 MB." });
      return;
    }
    setIdFile(file);
    setIdPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast("Full name required", { description: "Please enter your full name." });
      return;
    }
    if (isGuest && !email.trim()) {
      toast("Email required", { description: "Please enter your email address." });
      return;
    }
    if (isGuest && !password.trim()) {
      toast("Password required", { description: "Please create a password." });
      return;
    }
    if (!phone.trim()) {
      toast("Phone number required", { description: "Please enter your phone number." });
      return;
    }
    if (!vehicleType) {
      toast("Vehicle type required", { description: "Please select how you will deliver." });
      return;
    }
    if (!idFile) {
      toast("ID document required", { description: "Please upload a photo of your ID." });
      return;
    }

    setSubmitting(true);

    try {
      let userId: string;

      if (isGuest) {
        // Create new account
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Account creation failed. Please try again.");
        userId = authData.user.id;
      } else {
        userId = user!.id;
      }

      // Upload ID to the private rider-ids bucket
      const ext = idFile.name.split(".").pop() ?? "jpg";
      const filePath = `${userId}/id.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("rider-ids")
        .upload(filePath, idFile, { upsert: true });
      if (uploadError) throw new Error(`ID upload failed: ${uploadError.message}`);

      // Submit rider data securely via Edge Function — SUPABASE_SECRET_KEY never leaves the server
      const { error: fnError } = await supabase.functions.invoke("rider-onboarding", {
        body: {
          display_name: fullName.trim(),
          phone: phone.trim(),
          vehicle_type: vehicleType,
          id_image_url: filePath,
        },
      });
      if (fnError) throw new Error(`Profile update failed: ${fnError.message}`);

      navigate("/rider/onboarding/success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast("Application failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      {/* Top Bar */}
      <div
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #F97316, #FB923C)" }}
      >
        <button
          onClick={() => navigate("/")}
          className="text-white/90 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <img src={officialLogo} alt="Chopgee" className="w-8 h-8 object-contain" />
        <div className="flex-1">
          <h1 className="text-white font-bold text-base leading-tight">Rider Application</h1>
          <p className="text-white/70 text-xs">Join the Chopgee delivery team</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-24 space-y-6 max-w-lg mx-auto">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-5 py-4 border border-orange-100">
          <h2 className="text-xl font-serif font-bold text-foreground">Ride with Chopgee 🏍️</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your details and upload a valid ID. Once approved, you'll start earning!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <User size={16} className="text-[#F97316]" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Amara Johnson"
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40 placeholder:text-muted-foreground"
            />
          </div>

          {/* Email — only for unauthenticated users */}
          {isGuest && (
            <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
              <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Mail size={16} className="text-[#F97316]" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40 placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Password — only for unauthenticated users */}
          {isGuest && (
            <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
              <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <Lock size={16} className="text-[#F97316]" />
                Create Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-secondary rounded-xl px-4 pr-10 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40 placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Phone size={16} className="text-[#F97316]" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40 placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Customers and admins will use this number to reach you during deliveries.
            </p>
          </div>

          {/* Vehicle Type */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Bike size={16} className="text-[#F97316]" />
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40"
            >
              <option value="" disabled>Select your vehicle…</option>
              {VEHICLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* National ID / Student ID Upload */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Upload size={16} className="text-[#F97316]" />
              Upload National ID / Student ID <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a clear photo of your National ID or Student ID card.
            </p>

            {idPreviewUrl ? (
              <div className="relative">
                <img
                  src={idPreviewUrl}
                  alt="ID Preview"
                  className="w-full h-40 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIdFile(null);
                    setIdPreviewUrl(null);
                    if (idFileRef.current) idFileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 text-xs px-2"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => idFileRef.current?.click()}
                className="w-full h-32 rounded-xl border-2 border-dashed border-[#F97316]/40 bg-orange-50/50 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
              >
                <ImageOff size={24} className="text-[#F97316]/60" />
                <span className="text-sm font-semibold text-[#F97316]">Tap to upload ID photo</span>
                <span className="text-xs text-muted-foreground">JPG, PNG — Max 10 MB</span>
              </button>
            )}
            <input
              ref={idFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIdFileChange}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#ea6c0f] text-white py-4 rounded-2xl font-bold text-base shadow-lg disabled:opacity-60 transition-colors"
            style={{ boxShadow: "0 4px 18px rgba(249,115,22,0.35)" }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting Application…
              </>
            ) : (
              "Submit My Application 🚀"
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
