import { Home, Search, ShoppingBag, MapPin, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { motion, AnimatePresence } from "framer-motion";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Discover" },
  { id: "search", icon: Search, label: "Search" },
  { id: "cart", icon: ShoppingBag, label: "Cart" },
  { id: "tracking", icon: MapPin, label: "Track" },
  { id: "profile", icon: User, label: "Profile" },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const { itemCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {id === "cart" && itemCount > 0 && (
                  <AnimatePresence>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
