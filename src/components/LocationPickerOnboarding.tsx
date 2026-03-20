import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Search, Loader2, MapPin, X, ChevronRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, DeliveryAddress } from "@/lib/auth-context";
import { clearRecentLocations } from "@/components/LocationSearchModal";

// Fix default marker icon paths broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Default center: KWASU, Malete, Kwara State
const DEFAULT_CENTER: L.LatLngExpression = [8.5672, 4.9208];
const DEFAULT_ZOOM = 15;

const provider = new OpenStreetMapProvider({
  params: { countrycodes: "ng", addressdetails: 1 },
});

interface SearchResult {
  label: string;
  x: number;
  y: number;
}


interface Props {
  onComplete: () => void;
}

export default function LocationPickerOnboarding({ onComplete }: Props) {
  const { user, refreshProfile } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
      DEFAULT_CENTER,
      DEFAULT_ZOOM
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom orange pin icon
    const orangeIcon = L.divIcon({
      html: `<div style="
        width: 36px; height: 36px;
        background: hsl(24, 95%, 53%);
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: "",
    });

    const marker = L.marker(DEFAULT_CENTER, { draggable: true, icon: orangeIcon }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", async () => {
      const latlng = marker.getLatLng();
      await reverseGeocode(latlng.lat, latlng.lng);
    });

    leafletMap.current = map;

    // Call invalidateSize immediately after mount so Leaflet measures the
    // correct container dimensions on first render — no entrance animation
    // means we don't have to wait for any transition to settle.
    const sizeTimer = setTimeout(() => {
      leafletMap.current?.invalidateSize({ animate: false });
    }, 0);

    return () => {
      clearTimeout(sizeTimer);
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveMarker = useCallback((lat: number, lng: number) => {
    const latlng: L.LatLngExpression = [lat, lng];
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    }
    if (leafletMap.current) {
      leafletMap.current.flyTo(latlng, DEFAULT_ZOOM, { duration: 1 });
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const raw = await provider.search({ query: `${lat}, ${lng}` });
      const label =
        raw.length > 0
          ? raw[0].label
          : `Near (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      setSelectedAddress({ label, lat, lng });
    } catch {
      setSelectedAddress({
        label: `Near (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        lat,
        lng,
      });
    }
  }, []);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const raw = await provider.search({ query: query + " Nigeria" });
        setSearchResults(raw.slice(0, 5).map((r) => ({ label: r.label, x: r.x, y: r.y })));
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  function handleSearchSelect(result: SearchResult) {
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedAddress({ label: result.label, lat: result.y, lng: result.x });
    moveMarker(result.y, result.x);
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
        moveMarker(latitude, longitude);
        await reverseGeocode(latitude, longitude);
        setGeoLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please enable it in your browser settings.");
        } else if (err.code === err.TIMEOUT) {
          setGeoError("Chop Gee is having trouble finding you! Try moving near a window or search for your hostel manually.");
        } else {
          setGeoError("Chop Gee is having trouble finding you! Try moving near a window or search for your hostel manually.");
        }
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleConfirm() {
    if (!selectedAddress) return;
    setSaving(true);
    try {
      if (user) {
        await supabase
          .from("profiles")
          .update({ last_delivery_address: selectedAddress as any })
          .eq("user_id", user.id);
        await refreshProfile();
      }
      // Clear any temporary search history now that a real address is saved
      clearRecentLocations();
    } catch {
      // Non-fatal — proceed anyway
    } finally {
      setSaving(false);
      onComplete();
    }
  }

  async function handleSkip() {
    if (user) {
      const pendingAddress = { label: "Pending", lat: 0, lng: 0 };
      try {
        await supabase
          .from("profiles")
          .update({ last_delivery_address: pendingAddress as any })
          .eq("user_id", user.id);
        await refreshProfile();
      } catch {
        // Non-fatal — proceed anyway
      }
    }
    onComplete();
  }

  return (
    <motion.div
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-background flex flex-col max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-4 shrink-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full headie-gradient flex items-center justify-center shadow-glow">
                <MapPin size={16} className="text-primary-foreground" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Step 1 of 2
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              Where should we<br />deliver to?
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pin your hostel, street, or favourite hangout.
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-muted-foreground text-xs font-medium mt-1 shrink-0"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-5 pb-3 shrink-0 relative">
        <div className="bg-secondary rounded-2xl px-4 py-3.5 flex items-center gap-3 border-2 border-transparent focus-within:border-primary transition-colors">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for your hostel or street…"
            className="bg-transparent flex-1 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searching && <Loader2 size={16} className="text-primary animate-spin shrink-0" />}
          {query.length > 0 && !searching && (
            <button onClick={() => { setQuery(""); setShowResults(false); }} className="text-muted-foreground">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-5 right-5 top-full mt-1 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden z-10"
            >
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSearchSelect(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-0"
                >
                  <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground line-clamp-2">{r.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Current Location Button */}
      <div className="px-5 pb-3 shrink-0">
        <button
          onClick={handleCurrentLocation}
          disabled={geoLoading}
          className="w-full flex items-center gap-3 bg-primary/10 hover:bg-primary/20 active:bg-primary/25 transition-colors rounded-2xl px-4 py-3 text-primary font-semibold text-sm disabled:opacity-60"
        >
          {geoLoading ? (
            <Loader2 size={17} className="animate-spin shrink-0" />
          ) : (
            <Navigation size={17} className="shrink-0" />
          )}
          {geoLoading ? "Finding your location…" : "Use Current Location"}
        </button>
        {geoError && (
          <p className="text-xs text-destructive mt-1.5 px-1">{geoError}</p>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 mx-5 rounded-2xl overflow-hidden border border-border shadow-soft min-h-0 relative">
        <div ref={mapRef} className="w-full h-full" />
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <p className="text-[11px] text-center text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 w-fit mx-auto">
            Drag the pin to fine-tune your location
          </p>
        </div>
      </div>

      {/* Selected address + Confirm */}
      <div className="px-5 pt-4 pb-8 shrink-0">
        {selectedAddress && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 rounded-2xl px-4 py-3 mb-3"
          >
            <MapPin size={16} className="text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground line-clamp-2 flex-1">
              {selectedAddress.label}
            </span>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirm}
          disabled={!selectedAddress || saving}
          className="w-full headie-gradient text-primary-foreground rounded-2xl py-4 font-semibold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {selectedAddress ? "Confirm Location" : "Select a Location First"}
              {selectedAddress && <ChevronRight size={16} />}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
