import { useState } from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { collections } from "@/lib/data";
import CollectionRow from "@/components/CollectionRow";
import ShakeToDecide from "@/components/ShakeToDecide";
import LocationSearchModal from "@/components/LocationSearchModal";
import SearchBar from "@/components/SearchBar";
import NotificationDrawer from "@/components/NotificationDrawer";
import { useAuth, DeliveryAddress } from "@/lib/auth-context";

interface DiscoveryPageProps {
  onRestaurantClick?: (name: string) => void;
}

export default function DiscoveryPage({ onRestaurantClick }: DiscoveryPageProps) {
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
          <NotificationDrawer />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-5">
        <SearchBar onRestaurantClick={onRestaurantClick} />
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
      <div className="mb-4">
        <ShakeToDecide />
      </div>

      {/* Restaurant Filter — Choplife Kitchen pill */}
      <div className="px-4 mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-orange-100 border border-orange-300 text-orange-800 font-semibold text-sm px-4 py-2 rounded-full shadow-sm"
          aria-label="Filter by Choplife Kitchen"
        >
          <img
            src="/choplife-logo.svg"
            alt="Choplife Kitchen logo"
            className="w-5 h-5 object-contain rounded-full"
          />
          Choplife Kitchen
        </motion.button>
      </div>

      {/* Collections */}
      {collections.map((collection) => (
        <CollectionRow
          key={collection.id}
          collection={collection}
          onRestaurantClick={onRestaurantClick}
        />
      ))}

      <LocationSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddressSelected={handleAddressSelected}
      />
    </div>
  );
}
