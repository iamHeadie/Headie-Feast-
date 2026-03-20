import { createContext, useContext, useLayoutEffect, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface DeliveryAddress {
  label: string;
  lat: number;
  lng: number;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  dietary_preferences: string[] | null;
  has_completed_tour: boolean;
  last_delivery_address: DeliveryAddress | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** True while the post-login profile fetch is in-flight.
   *  Drives a lightweight spinner — never the full Spaghetti Loader. */
  isAuthenticating: boolean;
  isNewUser: boolean;
  setIsNewUser: (v: boolean) => void;
  showLocationPicker: boolean;
  completeLocationPicker: () => void;
  showTourGuide: boolean;
  completeTour: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** localStorage key that caches whether the user still needs to pick a location.
 *  Lets us show the Location Picker immediately on sign-in — no DB round-trip. */
const LOCATION_PENDING_KEY = "chopgee_location_pending";

/** localStorage key set before Google OAuth redirect so App.tsx can skip the
 *  splash on the return trip. */
export const OAUTH_PENDING_KEY = "chopgee_oauth_pending";

/** Returns true if the user account was created within 10 seconds of their last sign-in. */
function detectNewUser(user: User): boolean {
  // Primary: created_at vs last_sign_in_at within 10 seconds
  if (user.created_at && user.last_sign_in_at) {
    const createdAt = new Date(user.created_at).getTime();
    const lastSignIn = new Date(user.last_sign_in_at).getTime();
    if (Math.abs(lastSignIn - createdAt) <= 10000) {
      return true;
    }
  }

  // Fallback: check Google identity created_at matches current session time
  if (user.identities && user.identities.length > 0) {
    const now = Date.now();
    for (const identity of user.identities) {
      if (identity.created_at) {
        const identityCreated = new Date(identity.created_at).getTime();
        if (Math.abs(now - identityCreated) <= 10000) {
          return true;
        }
      }
    }
  }

  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTourGuide, setShowTourGuide] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      setProfile(null);
      return null;
    }

    // Safely parse delivery_coords / last_delivery_address from Supabase JSON
    let lastDeliveryAddress: DeliveryAddress | null = null;
    try {
      const raw = data.last_delivery_address;
      if (raw) {
        const parsed: DeliveryAddress =
          typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as DeliveryAddress);
        if (
          parsed &&
          typeof parsed.lat === "number" &&
          typeof parsed.lng === "number" &&
          typeof parsed.label === "string"
        ) {
          lastDeliveryAddress = parsed;
        }
      }
    } catch {
      // Malformed JSON — fall back to null
    }

    const profile: Profile = {
      ...(data as unknown as Profile),
      last_delivery_address: lastDeliveryAddress,
    };

    setProfile(profile);
    return profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  /** Call when the user finishes or skips the location picker. Transitions to the onboarding tour. */
  const completeLocationPicker = useCallback(() => {
    // Clear the cache — next sign-in goes straight to the dashboard
    localStorage.removeItem(LOCATION_PENDING_KEY);
    setShowLocationPicker(false);
    // Only show the tour if this user hasn't completed it yet
    setProfile((prev) => {
      if (prev && !prev.has_completed_tour) {
        setShowTourGuide(true);
      }
      return prev;
    });
  }, []);

  /** Call when the user finishes or skips the tour. Updates DB and hides the tour. */
  const completeTour = useCallback(async () => {
    setShowTourGuide(false);
    setIsNewUser(false);
    if (user) {
      await supabase
        .from("profiles")
        .update({ has_completed_tour: true })
        .eq("user_id", user.id);
      // Update local profile state so we don't re-trigger
      setProfile((prev) => prev ? { ...prev, has_completed_tour: true } : prev);
    }
  }, [user]);

  // useLayoutEffect runs synchronously before the browser paints the first frame,
  // ensuring auth-driven state (e.g. showLocationPicker from cache) is applied
  // before any flicker can occur.
  useLayoutEffect(() => {
    let mounted = true;

    // Check if we flagged a new user before OAuth redirect
    const pendingNewUser = localStorage.getItem("chopgee_new_user");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fast path: if we cached that this user needs a location, show the picker
        // immediately — don't wait for the DB round-trip.
        const locationCached = localStorage.getItem(LOCATION_PENDING_KEY) === "true";
        if (locationCached) {
          setShowLocationPicker(true);
          setLoading(false); // unblock UI now; profile loads in background
        }

        if (pendingNewUser === "true") {
          localStorage.removeItem("chopgee_new_user");
          setIsNewUser(true);
        }

        fetchProfile(session.user.id).then((profileData) => {
          if (!mounted) return;
          if (profileData) {
            // Show location picker when address is missing or only a skip placeholder
            const hasRealAddress =
              profileData.last_delivery_address !== null &&
              profileData.last_delivery_address.label !== "Pending";
            if (!hasRealAddress) {
              if (!profileData.last_delivery_address) {
                // Cache so the next sign-in is instant
                localStorage.setItem(LOCATION_PENDING_KEY, "true");
                setShowLocationPicker(true);
              }
              // If label === "Pending" they skipped — go straight to dashboard
            } else {
              // Has a real address — ensure cache is cleared
              localStorage.removeItem(LOCATION_PENDING_KEY);
              if (!profileData.has_completed_tour) {
                setShowTourGuide(true);
              }
            }
          } else if (pendingNewUser === "true") {
            // No profile yet (first Google sign-in before DB trigger)
            localStorage.setItem(LOCATION_PENDING_KEY, "true");
            setShowLocationPicker(true);
          }
          // Always finish loading AFTER the profile check (unless cache already did it)
          if (!locationCached) {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN") {
            // Clear the OAuth pending flag that bypassed the splash loader
            localStorage.removeItem(OAUTH_PENDING_KEY);

            // AGGRESSIVE TRIGGER (useLayoutEffect path): Force showLocationPicker
            // true the instant SIGNED_IN fires — no DB round-trip, no delay.
            // If the user already has a delivery address, the background profile
            // fetch below will close the picker immediately after confirming.
            setShowLocationPicker(true);
            setIsAuthenticating(false);
          }

          // setTimeout(0) defers the Supabase fetch to avoid internal SDK deadlocks.
          setTimeout(() => {
            if (!mounted) return;
            // Safety cap: resolve isAuthenticating within 1 s regardless of
            // network speed, then snap the user to wherever they belong.
            const authTimeout = setTimeout(() => setIsAuthenticating(false), 1000);

            // Background fetch: confirms whether the picker should stay open or close.
            fetchProfile(session.user.id).then((profileData) => {
              clearTimeout(authTimeout);
              if (!mounted) return;
              if (event === "SIGNED_IN") {
                const newUser = detectNewUser(session.user);
                if (newUser) {
                  setIsNewUser(true);
                }

                if (profileData) {
                  const hasRealAddress =
                    profileData.last_delivery_address !== null &&
                    profileData.last_delivery_address.label !== "Pending";
                  if (hasRealAddress) {
                    // Returning user with saved address — close picker, go to dashboard
                    localStorage.removeItem(LOCATION_PENDING_KEY);
                    setShowLocationPicker(false);
                    if (!profileData.has_completed_tour) {
                      setShowTourGuide(true);
                    }
                  } else {
                    // No address or "Pending" skip — cache and keep picker open
                    if (!profileData.last_delivery_address) {
                      localStorage.setItem(LOCATION_PENDING_KEY, "true");
                    }
                    // showLocationPicker is already true from the aggressive trigger
                  }
                } else {
                  // No profile yet (Google first-time) — flag it, keep picker open
                  localStorage.setItem("chopgee_new_user", "true");
                  localStorage.setItem(LOCATION_PENDING_KEY, "true");
                  setIsNewUser(true);
                  // showLocationPicker is already true from the aggressive trigger
                }

                // Release the authenticating flag — UI transitions immediately.
                setIsAuthenticating(false);
              }
            });
          }, 0);
        } else {
          setProfile(null);
          setIsAuthenticating(false);
          setShowLocationPicker(false);
          setShowTourGuide(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Suppress the React SSR warning for useLayoutEffect — this is a client-only app.
  useEffect(() => {}, []);

  // Window focus listener: if the app is already open and a user logs in
  // (or returns from minimizing), re-trigger the location picker without
  // needing a full minimize/resume cycle.
  useEffect(() => {
    const handleWindowFocus = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const locationCached = localStorage.getItem(LOCATION_PENDING_KEY) === "true";
          if (locationCached) {
            setShowLocationPicker(true);
          }
        }
      });
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, []);

  const signOut = useCallback(async () => {
    // Clear all local state and caches for immediate UI feedback
    localStorage.removeItem(LOCATION_PENDING_KEY);
    localStorage.removeItem(OAUTH_PENDING_KEY);
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsNewUser(false);
    setIsAuthenticating(false);
    setShowLocationPicker(false);
    setShowTourGuide(false);
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // Even if signOut fails, we've already cleared local state
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isAuthenticating, isNewUser, setIsNewUser, showLocationPicker, completeLocationPicker, showTourGuide, completeTour, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
