/**
 * NotificationContext — global in-app notification state.
 *
 * Responsibilities:
 *  • Store all in-app notifications (seeded with welcome stubs).
 *  • Listen for CHOP_GEE_PUSH messages relayed by the service worker so that
 *    every push notification that fires on the device ALSO appears in the
 *    Activity drawer without any extra server round-trips.
 *  • Expose helpers to add notifications and clear the unread badge.
 */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { Bell, Gift, Flame, Truck } from "lucide-react";
import React from "react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface AppNotification {
  id: string;
  iconType: "bell" | "gift" | "flame" | "truck" | "order";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationState {
  notifications: AppNotification[];
}

type Action =
  | { type: "ADD"; notification: AppNotification }
  | { type: "MARK_ALL_READ" };

/* ─── Icon renderer (kept outside React tree so it's stable) ────────────── */

export function renderIcon(iconType: AppNotification["iconType"]) {
  switch (iconType) {
    case "gift":  return <Gift  size={18} className="text-primary" />;
    case "flame": return <Flame size={18} className="text-orange-500" />;
    case "truck": return <Truck size={18} className="text-sage" />;
    default:      return <Bell  size={18} className="text-primary" />;
  }
}

/* ─── Seeded welcome notifications ─────────────────────────────────────── */

const SEED: AppNotification[] = [
  {
    id: "seed-1",
    iconType: "gift",
    title: "Welcome Gift 🎁",
    message: "Hey bestie! Use code CHOPGEE10 for 10% off your first Choplife order.",
    time: "Just now",
    read: false,
  },
  {
    id: "seed-2",
    iconType: "flame",
    title: "Trending 🔥",
    message: "Everyone in Malete is ordering from Choplife Kitchen right now. Don't dull!",
    time: "5 min ago",
    read: false,
  },
  {
    id: "seed-3",
    iconType: "truck",
    title: "Quick Tip 🚚",
    message: "Remember to set your hostel location for faster delivery.",
    time: "1 hr ago",
    read: false,
  },
];

/* ─── Reducer ────────────────────────────────────────────────────────────── */

function reducer(state: NotificationState, action: Action): NotificationState {
  switch (action.type) {
    case "ADD":
      return { notifications: [action.notification, ...state.notifications] };
    case "MARK_ALL_READ":
      return {
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    default:
      return state;
  }
}

/* ─── Context ────────────────────────────────────────────────────────────── */

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "read" | "time">) => void;
  markAllRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/* ─── Provider ───────────────────────────────────────────────────────────── */

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: SEED });

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "read" | "time">) => {
      dispatch({
        type: "ADD",
        notification: {
          ...n,
          id: `push-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          read: false,
          time: "Just now",
        },
      });
    },
    []
  );

  const markAllRead = useCallback(() => dispatch({ type: "MARK_ALL_READ" }), []);

  /* Listen for push messages relayed by the service worker */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "CHOP_GEE_PUSH") return;

      addNotification({
        iconType: "bell",
        title:   event.data.title  || "Chop Gee Update 🍽️",
        message: event.data.body   || "You have a new update.",
      });
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [addNotification]);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications: state.notifications, unreadCount, addNotification, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
