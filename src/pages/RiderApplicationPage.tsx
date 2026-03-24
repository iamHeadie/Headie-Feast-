import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Phone, Upload, ImageOff, User, Mail, Bike } from "lucide-react";
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

  const [fullName, setFullName] = useState(profile?.display_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [vehicleType, setVehicleType] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If the user already applied or is approved, redirect them away
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
    if (!user) {
      toast("Not signed in", { description: "Please sign in to apply." });
      return;
    }
    if (!fullName.trim()) {
      toast("Full name required", { description: "Please enter your full name." });
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
      // 1. Upload ID image to Supabase storage
      const ext = idFile.name.split(".").pop();
      const filePath = `${user.id}/id.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("id_images")
        .upload(filePath, idFile, { upsert: true });

      if (uploadError) throw new Error(`ID upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from("id_images")
        .getPublicUrl(filePath);

      // 2. Update profile: display_name, phone, vehicle_type, id_image_url, role, rider_status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: fullName.trim(),
          phone: phone.trim(),
          vehicle_type: vehicleType,
          id_image_url: publicUrl,
          role: "rider",
          rider_status: "pending",
        })
        .eq("user_id", user.id);

      if (updateError) throw new Error(`Profile update failed: ${updateError.message}`);

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
          <h1 className="text-white font-bold text-base leading-tight">Become a Rider</h1>
          <p className="text-white/70 text-xs">Join the Chopgee delivery team</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-24 space-y-6 max-w-lg mx-auto">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-5 py-4 border border-orange-100">
          <h2 className="text-xl font-serif font-bold text-foreground">Ride with Chopgee 🏍️</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your details and upload a valid ID. Once approved, you'll be ready to earn!
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

          {/* Email */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Mail size={16} className="text-[#F97316]" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              readOnly
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none opacity-70 cursor-default"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              This is your account email — contact us to change it.
            </p>
          </div>

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
              This number is how the admin and customers can reach you during deliveries.
            </p>
          </div>

          {/* Vehicle Type */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Bike size={16} className="text-[#F97316]" />
              How will you deliver? <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#F97316]/40"
            >
              <option value="" disabled>Select your delivery method…</option>
              {VEHICLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* National ID / Student ID */}
          <div className="bg-white rounded-2xl shadow-soft border border-border/50 p-4">
            <label className="block text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <Upload size={16} className="text-[#F97316]" />
              National ID / Student ID <span className="text-red-500">*</span>
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
