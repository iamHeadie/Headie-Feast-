import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Search, Loader2, Navigation, Clock } from "lucide-react";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, DeliveryAddress } from "@/lib/auth-context";

interface SearchResult {
  label: string;
  x: number; // lng
  y: number; // lat
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAddressSelected: (address: DeliveryAddress) => void;
}

const POPULAR_SPOTS: SearchResult[] = [
  { label: "Kwara State University (KWASU), Malete, Kwara State, Nigeria", x: 4.9208, y: 8.5672 },
  { label: "KWASU Main Gate, Malete, Kwara State, Nigeria", x: 4.9195, y: 8.5660 },
  { label: "KWASU Student Hostel, Malete, Kwara State, Nigeria", x: 4.9215, y: 8.5680 },
  { label: "Malete Market, Malete, Kwara State, Nigeria", x: 4.9180, y: 8.5645 },
  { label: "KWASU Senate Building, Malete, Kwara State, Nigeria", x: 4.9200, y: 8.5670 },
];

const RECENT_KEY = "headie_recent_locations";

function getRecentLocations(): SearchResult[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecentLocation(result: SearchResult) {
  const prev = getRecentLocations().filter((r) => r.label !== result.label);
  const updated = [result, ...prev].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

const provider = new OpenStreetMapProvider({
  params: {
    countrycodes: "ng",
    addressdetails: 1,
  },
});

export default function LocationSearchModal({ open, onClose, onAddressSelected }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setGeoError(null);
      setRecentLocations(getRecentLocations());
      // Auto-focus with slight delay to let animation start
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const raw = await provider.search({ query: query + " Nigeria" });
        setResults(
          raw.slice(0, 6).map((r) => ({
            label: r.label,
            x: r.x,
            y: r.y,
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  async function handleSelect(result: SearchResult) {
    const address: DeliveryAddress = {
      label: result.label,
      lat: result.y,
      lng: result.x,
    };
    saveRecentLocation(result);
    if (user) {
      setSaving(true);
      await supabase
        .from("profiles")
        .update({ last_delivery_address: address as any })
        .eq("user_id", user.id);
      setSaving(false);
    }
    onAddressSelected(address);
    onClose();
  }

  async function handleCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    // Check permission state first to avoid a denied-flash before the prompt
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (status.state === "denied") {
          setGeoError("Location access denied. Please enable it in your browser settings.");
          return;
        }
      } catch {
        // Permissions API unavailable — fall through to getCurrentPosition
      }
    }

    setGeoLoading(true);
    setGeoError(null);

    // getCurrentPosition triggers the browser "Allow location" pop-up immediately
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const raw = await provider.search({
            query: `${latitude}, ${longitude}`,
          });
          if (raw.length > 0) {
            const result: SearchResult = { label: raw[0].label, x: raw[0].x, y: raw[0].y };
            await handleSelect(result);
          } else {
            const result: SearchResult = {
              label: `Current Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
              x: longitude,
              y: latitude,
            };
            await handleSelect(result);
          }
        } catch {
          setGeoError("Could not resolve your location. Please search manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please enable it in your browser settings.");
        } else if (err.code === err.TIMEOUT) {
          setGeoError("Location timed out. Please try again.");
        } else {
          setGeoError("Could not get location. Please search manually.");
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const showDefaultContent = !query.trim() && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 280 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-12 pb-4">
            <button
              onClick={onClose}
              className="bg-secondary rounded-full p-2.5 text-foreground shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-serif font-bold text-foreground">Delivery Location</h2>
          </div>

          {/* Large search input */}
          <div className="px-4 pb-3">
            <div className="bg-secondary rounded-2xl px-4 py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-primary transition-colors">
              <Search size={20} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your address..."
                className="bg-transparent flex-1 text-base font-medium text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
              />
              {loading && <Loader2 size={18} className="text-primary animate-spin shrink-0" />}
              {query.length > 0 && !loading && (
                <button
                  onClick={() => setQuery("")}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Current Location button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleCurrentLocation}
              disabled={geoLoading || saving}
              className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 active:bg-primary/25 transition-colors rounded-2xl px-4 py-3.5 text-primary font-semibold text-sm disabled:opacity-60"
            >
              {geoLoading ? (
                <Loader2 size={18} className="animate-spin shrink-0" />
              ) : (
                <Navigation size={18} className="shrink-0" />
              )}
              {geoLoading ? "Finding your location…" : "Use Current Location"}
            </button>
            {geoError && (
              <p className="text-xs text-destructive mt-2 px-1">{geoError}</p>
            )}
          </div>

          {/* Results / Default content */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {saving && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Saving address…
              </div>
            )}

            {!saving && query.trim() && !loading && results.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                No results found. Try a different search.
              </p>
            )}

            {/* Search results */}
            {!saving && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-3 bg-secondary hover:bg-secondary/80 active:bg-primary/10 transition-colors rounded-2xl px-4 py-4 text-left"
                  >
                    <span className="text-lg shrink-0 mt-0.5">📍</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {result.label}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Default content: Recent + Popular */}
            {!saving && showDefaultContent && (
              <>
                {recentLocations.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Recent Locations
                      </span>
                    </div>
                    <div className="space-y-1">
                      {recentLocations.map((loc, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(loc)}
                          className="w-full flex items-start gap-3 bg-secondary hover:bg-secondary/80 active:bg-primary/10 transition-colors rounded-2xl px-4 py-4 text-left"
                        >
                          <span className="text-lg shrink-0 mt-0.5">📍</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                              {loc.label}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Popular Spots in Malete
                    </span>
                  </div>
                  <div className="space-y-1">
                    {POPULAR_SPOTS.map((spot, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(spot)}
                        className="w-full flex items-start gap-3 bg-secondary hover:bg-secondary/80 active:bg-primary/10 transition-colors rounded-2xl px-4 py-4 text-left"
                      >
                        <span className="text-lg shrink-0 mt-0.5">📍</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                            {spot.label}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
