import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CheckCircle, ArrowLeft, Loader2,
  ImageOff, Check, X, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import officialLogo from "@/assets/gee-final-logo.png";

interface RiderProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  id_image_url: string | null;
  rider_status: string | null;
  avatar_url: string | null;
  vehicle_type: string | null;
}

interface Stats {
  totalCommunity: number;
  pendingRiders: number;
  activeRiders: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ totalCommunity: 0, pendingRiders: 0, activeRiders: 0 });
  const [riders, setRiders] = useState<RiderProfile[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [idSignedUrls, setIdSignedUrls] = useState<Record<string, string>>({});

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    const [totalRes, pendingRes, activeRes] = await Promise.all([
      // Use SECURITY DEFINER RPC to bypass RLS and get the true profiles count.
      // The profiles_select_admin_all policy has a self-referencing subquery that
      // can return wrong counts when queried directly; the RPC always returns the
      // real row count from public.profiles regardless of the caller's RLS context.
      supabase.rpc("get_profiles_count"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "rider")
        .eq("rider_status", "pending"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "rider")
        .eq("rider_status", "active"),
    ]);

    if (totalRes.error) {
      console.error("[AdminDashboard] totalCommunity count error:", totalRes.error);
    }
    if (pendingRes.error) {
      console.error("[AdminDashboard] pendingRiders count error:", pendingRes.error);
    }
    if (activeRes.error) {
      console.error("[AdminDashboard] activeRiders count error:", activeRes.error);
    }

    setStats({
      totalCommunity: totalRes.error ? 0 : Number(totalRes.data ?? 0),
      pendingRiders: pendingRes.count ?? 0,
      activeRiders: activeRes.count ?? 0,
    });
    setLoadingStats(false);
  }, []);

  const fetchRiders = useCallback(async () => {
    setLoadingRiders(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, display_name, phone, id_image_url, rider_status, avatar_url, vehicle_type")
      .eq("role", "rider")
      .order("rider_status", { ascending: true }); // pending first
    if (error) {
      toast("Failed to load riders", { description: error.message });
      setLoadingRiders(false);
      return;
    }

    const riderList = (data as RiderProfile[]) ?? [];
    setRiders(riderList);

    // Generate signed URLs for the private rider-ids bucket.
    // id_image_url is stored as a file path (e.g. "userId/id.jpg").
    // Legacy records may still hold a full https:// public URL — pass those through as-is.
    const urlMap: Record<string, string> = {};
    await Promise.all(
      riderList
        .filter((r) => r.id_image_url)
        .map(async (r) => {
          const val = r.id_image_url!;
          if (val.startsWith("http")) {
            urlMap[r.id] = val;
          } else {
            const { data: signed } = await supabase.storage
              .from("rider-ids")
              .createSignedUrl(val, 3600);
            if (signed?.signedUrl) urlMap[r.id] = signed.signedUrl;
          }
        })
    );
    setIdSignedUrls(urlMap);
    setLoadingRiders(false);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRiders();
  }, [fetchStats, fetchRiders]);

  const handleApprove = async (rider: RiderProfile) => {
    setProcessingId(rider.id);
    const { error } = await supabase
      .from("profiles")
      .update({ rider_status: "active" })
      .eq("id", rider.id);

    if (error) {
      toast("Approval failed", { description: error.message });
      setProcessingId(null);
      return;
    }

    // Trigger welcome email via Supabase Edge Function
    try {
      await supabase.functions.invoke("send-rider-welcome", {
        body: {
          user_id: rider.user_id,
          display_name: rider.display_name ?? "Rider",
        },
      });
    } catch {
      // Email failure is non-blocking — approval already succeeded
      toast("Rider approved!", {
        description: "Welcome email could not be sent — check Edge Function logs.",
      });
      setProcessingId(null);
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, rider_status: "active" } : r))
      );
      fetchStats();
      return;
    }

    toast("Rider approved!", { description: `${rider.display_name ?? "Rider"} is now active. Welcome email sent.` });
    setProcessingId(null);
    setRiders((prev) =>
      prev.map((r) => (r.id === rider.id ? { ...r, rider_status: "active" } : r))
    );
    fetchStats();
  };

  const handleReject = async (rider: RiderProfile) => {
    setProcessingId(rider.id);
    const { error } = await supabase
      .from("profiles")
      .update({ rider_status: "rejected" })
      .eq("id", rider.id);

    if (error) {
      toast("Rejection failed", { description: error.message });
    } else {
      toast("Rider rejected", { description: `${rider.display_name ?? "Rider"}'s application has been rejected.` });
      setRiders((prev) =>
        prev.map((r) => (r.id === rider.id ? { ...r, rider_status: "rejected" } : r))
      );
      fetchStats();
    }
    setProcessingId(null);
  };

  const statusColor = (status: string | null) => {
    if (status === "active" || status === "approved") return "bg-green-100 text-green-700 border-green-200";
    if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const statusLabel = (status: string | null) => {
    if (status === "active" || status === "approved") return "Active";
    if (status === "rejected") return "Rejected";
    return "Pending";
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
          <h1 className="text-white font-bold text-base leading-tight">Admin Command Center</h1>
          <p className="text-white/70 text-xs">Chopgee God View</p>
        </div>
        <button
          onClick={() => { fetchStats(); fetchRiders(); }}
          className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="px-4 pt-5 pb-24 space-y-6 max-w-2xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-5 py-4 border border-orange-100">
          <h2 className="text-2xl font-serif font-bold text-foreground">Welcome Boss 👑</h2>
          <p className="text-sm text-muted-foreground mt-0.5">You're in the command center. Make it count.</p>
        </div>

        {/* Stats Cards */}
        <section>
          <h2 className="text-sm font-bold text-[#0 0% 45%] text-muted-foreground uppercase tracking-wider mb-3">
            God View Stats
          </h2>
          {loadingStats ? (
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-soft border border-border/50 animate-pulse h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={<Users size={20} className="text-blue-500" />}
                value={stats.totalCommunity}
                label="Total Community"
                bg="bg-blue-50"
              />
              <StatCard
                icon={<Clock size={20} className="text-amber-500" />}
                value={stats.pendingRiders}
                label="Pending Riders"
                bg="bg-amber-50"
              />
              <StatCard
                icon={<CheckCircle size={20} className="text-green-500" />}
                value={stats.activeRiders}
                label="Active Riders"
                bg="bg-green-50"
              />
            </div>
          )}
        </section>

        {/* Rider Management */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Rider Applications
            </h2>
            <span className="text-xs text-muted-foreground">{riders.length} total</span>
          </div>

          {loadingRiders ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-soft border border-border/50 animate-pulse h-28" />
              ))}
            </div>
          ) : riders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏍️</div>
              <p className="text-muted-foreground text-sm font-medium">No rider applications yet.</p>
              <p className="text-muted-foreground text-xs mt-1">They'll appear here when riders sign up.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {riders.map((rider) => (
                  <motion.div
                    key={rider.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-soft border border-border/50 overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Rider header */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden flex-shrink-0 border-2 border-primary/20">
                          {rider.avatar_url ? (
                            <img src={rider.avatar_url} alt={rider.display_name ?? "Rider"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🏍️</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => idSignedUrls[rider.id] && setExpandedImage(idSignedUrls[rider.id])}
                              className="font-bold text-foreground text-sm truncate hover:text-[#F97316] transition-colors text-left"
                              title={idSignedUrls[rider.id] ? "Click to view ID" : undefined}
                            >
                              {rider.display_name ?? "Unnamed Rider"}
                            </button>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusColor(rider.rider_status)}`}>
                              {statusLabel(rider.rider_status)}
                            </span>
                          </div>
                          {rider.phone ? (
                            <a
                              href={`tel:${rider.phone}`}
                              className="text-xs text-blue-600 font-semibold mt-0.5 hover:underline flex items-center gap-1"
                            >
                              📞 {rider.phone}
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">
                              No Number Provided
                            </p>
                          )}
                          {rider.vehicle_type && (
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                              {rider.vehicle_type === "motorcycle" ? "🏍️" : rider.vehicle_type === "bicycle" ? "🚲" : "🚶"} {rider.vehicle_type}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            ID: {rider.user_id.slice(0, 16)}…
                          </p>
                        </div>
                      </div>

                      {/* ID Image */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground font-semibold mb-1.5">ID Document</p>
                        {idSignedUrls[rider.id] ? (
                          <button
                            className="w-full rounded-xl overflow-hidden border border-border/50 bg-secondary"
                            onClick={() => setExpandedImage(idSignedUrls[rider.id])}
                          >
                            <img
                              src={idSignedUrls[rider.id]}
                              alt="ID Document"
                              className="w-full h-28 object-cover"
                            />
                            <p className="text-xs text-muted-foreground py-1 text-center">Tap to enlarge</p>
                          </button>
                        ) : (
                          <div className="w-full h-20 rounded-xl border border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-1">
                            <ImageOff size={18} className="text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">No ID image uploaded</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {rider.rider_status === "pending" && (
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={processingId === rider.id}
                            onClick={() => handleApprove(rider)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                          >
                            {processingId === rider.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Check size={15} />
                            )}
                            Approve
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={processingId === rider.id}
                            onClick={() => handleReject(rider)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                          >
                            {processingId === rider.id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <X size={15} />
                            )}
                            Reject
                          </motion.button>
                        </div>
                      )}

                      {(rider.rider_status === "active" || rider.rider_status === "approved") && (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold bg-green-50 rounded-xl px-3 py-2">
                          <CheckCircle size={14} />
                          This rider is active and approved
                        </div>
                      )}

                      {rider.rider_status === "rejected" && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-red-600 text-xs font-semibold bg-red-50 rounded-xl px-3 py-2 flex-1">
                            <X size={14} />
                            Application rejected
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            disabled={processingId === rider.id}
                            onClick={() => handleApprove(rider)}
                            className="ml-2 flex items-center gap-1 bg-green-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
                          >
                            {processingId === rider.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Check size={12} />
                            )}
                            Re-approve
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* Expanded ID Image Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              className="relative max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={expandedImage}
                alt="ID Document Full View"
                className="w-full rounded-2xl shadow-2xl"
              />
              <button
                onClick={() => setExpandedImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon, value, label, bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-3 border border-border/50 shadow-soft flex flex-col items-center text-center gap-1`}>
      <div className="mb-0.5">{icon}</div>
      <span className="text-xl font-bold text-foreground leading-none">{value}</span>
      <span className="text-[10px] text-muted-foreground font-semibold leading-tight">{label}</span>
    </div>
  );
}
