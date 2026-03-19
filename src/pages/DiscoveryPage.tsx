import { useState } from "react";
import { MapPin, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { collections } from "@/lib/data";
import CollectionRow from "@/components/CollectionRow";
import ShakeToDecide from "@/components/ShakeToDecide";
import LocationSearchModal from "@/components/LocationSearchModal";
import { useAuth, DeliveryAddress } from "@/lib/auth-context";

export default function DiscoveryPage() {
  const { profile, refreshProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [localAddress, setLocalAddress] = useState<DeliveryAddress | null>(null);

  const savedAddress = (profile?.last_delivery_address as DeliveryAddress | null) ?? null;
  const displayAddress = localAddress ?? savedAddress;

  function handleAddressSelected(address: DeliveryAddress) {
    setLocalAddress(address);
    refreshProfile();
  }

  const shortLabel = displayAddress
    ? displayAddress.label.split(",").slice(0, 2).join(",")
    : null;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hey bestie 👋</p>
          <h1 className="text-2xl font-serif font-bold text-foreground">What's your vibe today?</h1>
          {shortLabel && (
            <p className="text-xs text-primary font-medium mt-0.5 truncate max-w-[220px]">
              📍 {shortLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setModalOpen(true)}
            className="bg-primary/10 rounded-full p-2.5 text-primary"
            aria-label="Change delivery location"
          >
            <MapPin size={18} />
          </motion.button>
          <button className="relative bg-secondary rounded-full p-2.5 text-foreground">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-5">
        <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-muted-foreground text-sm">🔍</span>
          <span className="text-muted-foreground text-sm">Search for something delicious...</span>
        </div>
      </div>

      {/* Quick tags */}
      <div className="flex gap-2 px-4 mb-6 overflow-x-auto scrollbar-hide">
        {["🔥 Trending", "🥗 Healthy", "🍕 Fast Food", "🍣 Asian", "🍰 Desserts"].map((tag) => (
          <motion.button
            key={tag}
            whileTap={{ scale: 0.95 }}
            className="bg-secondary text-foreground text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap"
          >
            {tag}
          </motion.button>
        ))}
      </div>

      {/* Shake to decide */}
      <div className="mb-6">
        <ShakeToDecide />
      </div>

      {/* Collections */}
      {collections.map((collection) => (
        <CollectionRow key={collection.id} collection={collection} />
      ))}

      <LocationSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddressSelected={handleAddressSelected}
      />
    </div>
  );
}
