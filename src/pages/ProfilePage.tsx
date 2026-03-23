import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, LogOut, ChevronRight, RefreshCw, Loader2, Check, X,
  Heart, History, Settings2, Pencil, ShieldCheck, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useCart } from "@/lib/cart-context";
import type { FoodItem } from "@/lib/data";
import { useNavigate } from "react-router-dom";

const DIETARY_OPTIONS = [
  {
    label: "🌶️ Extra Spicy",
    value: "Extra Spicy",
    description: "For the gees that love that real Atarodo heat",
    selectedBg: "#C0392B",
    selectedText: "#fff",
  },
  {
    label: "✋ No Pepper",
    value: "No Pepper",
    description: "For those who can't handle the heat at all",
    selectedBg: "#5B8FF9",
    selectedText: "#fff",
  },
  {
    label: "🥩 Meat Lover",
    value: "Meat Lover",
    description: "Always want extra protein — Chicken, Turkey, Beef",
    selectedBg: "#8B2500",
    selectedText: "#fff",
  },
  {
    label: "🥬 Fit-Fam",
    value: "Fit-Fam",
    description: "Healthy & low calorie — more veggies, less oil",
    selectedBg: "#3A7D44",
    selectedText: "#fff",
  },
  {
    label: "🍲 Swallow Fan",
    value: "Swallow Fan",
    description: "Prefers Amala, Pounded Yam, or Eba over rice",
    selectedBg: "#C07B2A",
    selectedText: "#fff",
  },
  {
    label: "🥤 Sweet Tooth",
    value: "Sweet Tooth",
    description: "Always adds a cold drink or dessert to the order",
    selectedBg: "#8E44AD",
    selectedText: "#fff",
  },
];

export default function ProfilePage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"prefs" | "favorites" | "orders">("prefs");
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (profile) setNameValue(profile.display_name || "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("order_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setOrders(data || []));
    supabase
      .from("favorite_spots")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => setFavorites(data || []));
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size before uploading (5 MB limit)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast("File too large", { description: "Please choose an image under 5 MB." });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filename = `avatar.${ext}`;
      // RLS policy requires path: {user.id}/{filename}
      const path = `${user.id}/${filename}`;

      // Remove any previously uploaded avatar files so stale variants don't linger
      const { data: existing } = await supabase.storage
        .from("avatars")
        .list(user.id);
      if (existing && existing.length > 0) {
        const oldPaths = existing.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(oldPaths);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        const msg = uploadError.message ?? "";
        const status = (uploadError as any).statusCode;
        if (status === "403" || msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("permission")) {
          throw new Error("Permission denied — please sign out and sign back in, then try again.");
        }
        if (status === "413" || msg.toLowerCase().includes("too large")) {
          throw new Error("File rejected by server — please choose an image under 5 MB.");
        }
        throw uploadError;
      }

      // Fetch the public URL for the newly uploaded image
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);
      if (updateError) throw updateError;

      await refreshProfile();
      toast("Looking good! 😎");
    } catch (err: any) {
      const msg: string = err.message ?? "";
      const isRLS =
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("row-level security") ||
        (err as any).statusCode === "403";
      const isSize =
        msg.toLowerCase().includes("too large") ||
        (err as any).statusCode === "413";

      if (isRLS) {
        toast("Permission denied", { description: msg || "Sign out and sign back in, then retry." });
      } else if (isSize) {
        toast("File too large", { description: "Please choose an image under 5 MB." });
      } else {
        toast("Upload failed", { description: msg || "Something went wrong. Please try again." });
      }
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveName = async () => {
    if (!user || !nameValue.trim()) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ display_name: nameValue.trim() })
      .eq("user_id", user.id);
    await refreshProfile();
    setEditingName(false);
    setSaving(false);
    toast("Name updated! ✅");
  };

  const toggleDiet = async (value: string) => {
    if (!user || !profile) return;
    const current = profile.dietary_preferences || [];
    const updated = current.includes(value)
      ? current.filter((d) => d !== value)
      : [...current, value];
    await supabase
      .from("profiles")
      .update({ dietary_preferences: updated })
      .eq("user_id", user.id);
    await refreshProfile();
  };

  const reorder = (items: any[]) => {
    (items as FoodItem[]).forEach((item) => addItem(item));
    toast("Added to cart! 🛒");
  };

  const avatarUrl = profile?.avatar_url;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold text-foreground">Your Profile</h1>
        <button
          onClick={signOut}
          className="text-destructive text-sm font-medium flex items-center gap-1"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden border-4 border-primary/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                😎
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-glow"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2 mt-3">
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              className="bg-secondary rounded-xl px-3 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 w-40 text-center"
            />
            <button onClick={saveName} disabled={saving} className="text-primary">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button onClick={() => setEditingName(false)} className="text-muted-foreground">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 mt-3"
          >
            <span className="font-serif text-xl font-bold text-foreground">
              {profile?.display_name || "Set your name"}
            </span>
            <Pencil size={14} className="text-muted-foreground" />
          </button>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>

        {/* Admin Badge & Dashboard Button */}
        {profile?.is_admin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
              <ShieldCheck size={13} />
              Chopgee Admin
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 bg-[#F97316] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg active:shadow-md"
              style={{ boxShadow: "0 4px 18px rgba(249,115,22,0.4)" }}
            >
              <LayoutDashboard size={18} />
              Open Admin Dashboard
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 mb-4">
        {([
          { id: "prefs" as const, icon: Settings2, label: "Preferences" },
          { id: "favorites" as const, icon: Heart, label: "Favorites" },
          { id: "orders" as const, icon: History, label: "Orders" },
        ]).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === "prefs" && (
            <motion.div
              key="prefs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-serif font-bold text-foreground mb-1">Dietary Preferences</h3>
              <p className="text-xs text-muted-foreground mb-3">Tell us how you like your food — we'll use this to recommend meals.</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((opt) => {
                  const selected = profile?.dietary_preferences?.includes(opt.value);
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDiet(opt.value)}
                      title={opt.description}
                      style={
                        selected
                          ? {
                              backgroundColor: opt.selectedBg,
                              color: opt.selectedText,
                              outline: `2px solid ${opt.selectedBg}`,
                              outlineOffset: "2px",
                            }
                          : undefined
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                        selected
                          ? ""
                          : "bg-secondary text-foreground hover:brightness-95"
                      }`}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-serif font-bold text-foreground mb-3">Favorite Spots ❤️</h3>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💔</div>
                  <p className="text-muted-foreground text-sm">No favorites yet. Start exploring!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="chopgee-card p-3 flex items-center justify-between"
                    >
                      <span className="font-semibold text-sm text-foreground">{fav.restaurant_name}</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "orders" && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-serif font-bold text-foreground mb-3">Order History 📋</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-muted-foreground text-sm">No orders yet. Let's fix that!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="chopgee-card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                          <p className="font-semibold text-sm text-foreground">
                            ₦{order.total.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded-full capitalize">
                          {order.status}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => reorder(order.items)}
                        className="w-full bg-secondary text-foreground rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw size={12} /> Reorder in 1-Tap
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
