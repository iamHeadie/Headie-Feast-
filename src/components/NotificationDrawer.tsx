import { useState } from "react";
import { Bell, X, Gift, Flame, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: <Gift size={18} className="text-primary" />,
    title: "Welcome Gift 🎁",
    message: "Hey bestie! Use code CHOPGEE10 for 10% off your first Choplife order.",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    icon: <Flame size={18} className="text-orange-500" />,
    title: "Trending 🔥",
    message: "Everyone in Malete is ordering from Choplife Kitchen right now. Don't dull!",
    time: "5 min ago",
    read: false,
  },
  {
    id: "3",
    icon: <Truck size={18} className="text-sage" />,
    title: "Quick Tip 🚚",
    message: "Remember to set your hostel location for faster delivery.",
    time: "1 hr ago",
    read: false,
  },
];

export default function NotificationDrawer() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function openDrawer() {
    setOpen(true);
    // Mark all as read when drawer opens
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <>
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={openDrawer}
        className="relative bg-secondary rounded-full p-2.5 text-foreground"
        aria-label="Open notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-50 shadow-2xl flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-border">
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">Activity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="bg-muted rounded-full p-2 text-muted-foreground"
                aria-label="Close notifications"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Bell size={36} className="mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="headie-card p-4 flex gap-3 items-start"
                  >
                    <div className="bg-secondary rounded-full p-2.5 shrink-0 mt-0.5">
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium uppercase tracking-wide">
                        {notification.time}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border">
              <p className="text-center text-xs text-muted-foreground">
                You're all caught up, bestie ✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
