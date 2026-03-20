import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

// Default fallback: Malete, Kwara State
const MALETE_FALLBACK: L.LatLngExpression = [8.7129, 4.4782];

interface DriverLocation {
  lat: number;
  lng: number;
}

interface MapTrackerProps {
  orderId: string;
}

function parseDriverLocation(raw: unknown): DriverLocation | null {
  try {
    const loc: DriverLocation =
      typeof raw === "string" ? JSON.parse(raw) : (raw as DriverLocation);
    if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
      return loc;
    }
  } catch {
    // malformed JSON — ignore
  }
  return null;
}

export default function MapTracker({ orderId }: MapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map once (map div is always mounted so Leaflet has a container)
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    try {
      const map = L.map(mapRef.current).setView(MALETE_FALLBACK, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      leafletMap.current = map;
    } catch (err) {
      console.error("Map initialization failed:", err);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Fetch initial driver location from Supabase
  useEffect(() => {
    setIsLoading(true);
    const fetchLocation = async () => {
      try {
        const { data } = await supabase
          .from("order_history")
          .select("driver_location")
          .eq("id", orderId)
          .maybeSingle();
        if (data?.driver_location) {
          const loc = parseDriverLocation(data.driver_location);
          if (loc) setDriverLocation(loc);
        }
      } catch (err) {
        console.error("Failed to fetch driver location:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocation();
  }, [orderId]);

  // Subscribe to realtime updates on order_history
  useEffect(() => {
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "order_history",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          try {
            const raw = (payload.new as any).driver_location;
            if (!raw) return;
            const loc = parseDriverLocation(raw);
            if (loc) setDriverLocation(loc);
          } catch (err) {
            console.error("Failed to parse realtime driver location:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Update marker and pan map when driver location changes
  useEffect(() => {
    if (!leafletMap.current || !driverLocation) return;

    try {
      const { lat, lng } = driverLocation;
      if (typeof lat !== "number" || typeof lng !== "number") return;

      const latlng: L.LatLngExpression = [lat, lng];

      if (markerRef.current) {
        markerRef.current.setLatLng(latlng);
      } else {
        markerRef.current = L.marker(latlng)
          .addTo(leafletMap.current)
          .bindPopup("Your Chop Gee driver is here!");
      }

      leafletMap.current.panTo(latlng);
    } catch (err) {
      console.error("Failed to update map marker:", err);
    }
  }, [driverLocation]);

  return (
    <div className="px-4 mb-6">
      {/* Map container is always in the DOM so Leaflet can attach;
          a loading overlay covers it until the Supabase fetch completes. */}
      <div className="relative" style={{ height: "220px", borderRadius: "1rem", overflow: "hidden" }}>
        <div
          ref={mapRef}
          className="w-full h-full border border-border"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-secondary flex flex-col items-center justify-center gap-2 z-[1000]">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading map…</p>
          </div>
        )}
      </div>
      {!isLoading && !driverLocation && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Waiting for rider location…
        </p>
      )}
    </div>
  );
}
