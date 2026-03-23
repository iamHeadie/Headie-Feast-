import { Minus, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";

interface CartPageProps {
  onCheckout: () => void;
}

export default function CartPage({ onCheckout }: CartPageProps) {
  const { items, addItem, removeItem, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="pb-24 flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl mb-4"
        >
          😢
        </motion.div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Your stomach is calling!</h2>
        <p className="text-muted-foreground text-sm">Add some delicious food to make it happy</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Your Feast 🍽️</h1>
          <p className="text-xs text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""} ready to go</p>
        </div>
        <button onClick={clearCart} className="text-destructive text-sm font-medium flex items-center gap-1">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      <div className="px-4 space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="chopgee-card flex items-center gap-3 p-3"
            >
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.restaurant}</p>
                <span className="text-sm font-bold text-primary">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-full px-2 py-1">
                <button onClick={() => removeItem(item.id)} className="text-foreground">
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-foreground w-5 text-center">{item.quantity}</span>
                <button onClick={() => addItem(item)} className="text-primary">
                  <Plus size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Totals */}
      <div className="px-4 mt-6">
        <div className="bg-secondary rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">₦{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="text-sage font-medium">FREE 🎉</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg text-primary">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onCheckout}
          className="w-full chopgee-gradient text-primary-foreground rounded-2xl py-4 mt-4 font-semibold text-lg shadow-glow"
        >
          Order Now 🚀
        </motion.button>
      </div>
    </div>
  );
}
