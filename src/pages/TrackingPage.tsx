import { motion } from "framer-motion";
import { Check, Circle, Phone, MessageSquare } from "lucide-react";
import { trackingSteps } from "@/lib/data";
import ChopgeeHug from "@/components/ChopgeeHug";
import MapTracker from "@/components/MapTracker";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TrackingPage() {
  const [showHug, setShowHug] = useState(false);
  const [elapsedMin, setElapsedMin] = useState(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsedMin((p) => p + 1), 60000);
    // Show Chop Gee Hug after 2 mins for demo
    const hugTimer = setTimeout(() => setShowHug(true), 8000);
    return () => { clearInterval(timer); clearTimeout(hugTimer); };
  }, []);

  // Fetch the most recent active order for map tracking
  useEffect(() => {
    supabase
      .from("order_history")
      .select("id")
      .in("status", ["confirmed", "preparing", "on_the_way"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.id) setActiveOrderId(data.id);
      });
  }, []);

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">Your Order is Coming! 🏃‍♂️</h1>
        <p className="text-sm text-muted-foreground mt-1">Estimated arrival: 12 min</p>
      </div>

      {/* Hero driver card */}
      <div className="px-4 mb-6">
        <div className="chopgee-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
              🦸
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Tunde O.</h4>
              <p className="text-xs text-muted-foreground">Your Chop Gee Driver</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-gold">⭐ 4.9</span>
                <span className="text-xs text-muted-foreground">• 1,200+ deliveries</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-secondary rounded-full p-2.5 text-foreground">
                <Phone size={16} />
              </button>
              <button className="bg-primary rounded-full p-2.5 text-primary-foreground">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live map */}
      {activeOrderId && <MapTracker orderId={activeOrderId} />}

      {/* Timeline */}
      <div className="px-4">
        <h3 className="font-serif font-bold text-foreground mb-4">Order Timeline</h3>
        <div className="space-y-0">
          {trackingSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-3"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step.completed ? <Check size={14} strokeWidth={3} /> : <Circle size={14} />}
                </div>
                {i < trackingSteps.length - 1 && (
                  <div className={`w-0.5 h-12 ${step.completed ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-6">
                <h4 className={`text-sm font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </h4>
                <p className="text-xs text-muted-foreground">{step.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ChopgeeHug show={showHug} onDismiss={() => setShowHug(false)} />
    </div>
  );
}
