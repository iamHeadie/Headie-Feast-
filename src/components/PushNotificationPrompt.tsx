/**
 * PushNotificationPrompt
 *
 * Shown once per user (tracked via localStorage) after they register or log in
 * for the first time. Requests browser push-notification permission, registers
 * the service worker subscription, and saves the status to the Supabase
 * profiles table so the server can send targeted pushes later.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const ASKED_KEY = "chopgee_push_asked";

/** Convert a base64url VAPID public key to a Uint8Array for pushManager. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

interface Props {
  /** Called when the user accepts or declines so the parent can unmount. */
  onDone: () => void;
}

export default function PushNotificationPrompt({ onDone }: Props) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Only render if the user hasn't been asked before */
  useEffect(() => {
    const asked = localStorage.getItem(ASKED_KEY);
    if (!asked && "Notification" in window) {
      // Small delay so the prompt doesn't fight the location picker / tour
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    } else {
      onDone();
    }
  }, [onDone]);

  async function savePermissionToSupabase(granted: boolean, subscription: PushSubscription | null) {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({
        push_permission: granted ? "granted" : "denied",
        push_subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
      } as any)
      .eq("user_id", user.id);
  }

  async function handleAllow() {
    setSaving(true);
    localStorage.setItem(ASKED_KEY, "true");

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted" && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        /* Attempt to create a real push subscription if a VAPID key is set */
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
        let subscription: PushSubscription | null = null;

        if (vapidKey) {
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });
          } catch {
            // VAPID key not valid yet — still save "granted" status
          }
        }

        await savePermissionToSupabase(true, subscription);
      } else {
        await savePermissionToSupabase(false, null);
      }
    } catch {
      // Permission request failed silently
    } finally {
      setSaving(false);
      setVisible(false);
      onDone();
    }
  }

  async function handleDecline() {
    localStorage.setItem(ASKED_KEY, "true");
    await savePermissionToSupabase(false, null);
    setVisible(false);
    onDone();
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleDecline}
          />

          {/* Card — slides up from the bottom */}
          <motion.div
            key="card"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
          >
            <div className="bg-background rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl">
              {/* Drag handle */}
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-6" />

              {/* Dismiss */}
              <button
                onClick={handleDecline}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bell size={32} className="text-primary" />
                </div>
              </div>

              {/* Copy */}
              <h2 className="text-xl font-bold text-foreground text-center leading-snug mb-2">
                Hey Bestie! 🔔
              </h2>
              <p className="text-sm text-muted-foreground text-center leading-relaxed mb-8 max-w-xs mx-auto">
                Can we send you updates on your orders and special deals? We promise
                we'll only buzz you when it really matters!
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAllow}
                  disabled={saving}
                  className="w-full headie-gradient text-primary-foreground rounded-2xl py-3.5 font-semibold text-sm shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Allow Notifications 🙌"
                  )}
                </button>

                <button
                  onClick={handleDecline}
                  disabled={saving}
                  className="w-full bg-secondary text-foreground rounded-2xl py-3.5 font-semibold text-sm disabled:opacity-60"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
