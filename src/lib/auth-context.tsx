import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
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

  useEffect(() => {
    let mounted = true;

    // Check if we flagged a new user before OAuth redirect
    const pendingNewUser = localStorage.getItem("headie_new_user");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((profileData) => {
          if (!mounted) return;
          if (pendingNewUser === "true") {
            localStorage.removeItem("headie_new_user");
            setIsNewUser(true);
          }
          if (profileData) {
            // Show location picker whenever the user has no saved delivery address
            if (!profileData.last_delivery_address) {
              setShowLocationPicker(true);
            } else if (!profileData.has_completed_tour) {
              setShowTourGuide(true);
            }
          } else if (pendingNewUser === "true") {
            // No profile yet (first Google sign-in before DB trigger) — flag it
            setShowLocationPicker(true);
          }
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            if (!mounted) return;
            fetchProfile(session.user.id).then((profileData) => {
              if (!mounted) return;
              if (event === "SIGNED_IN") {
                const newUser = detectNewUser(session.user);
                if (newUser) {
                  setIsNewUser(true);
                }

                if (profileData) {
                  // Show location picker whenever user has no saved delivery address
                  if (!profileData.last_delivery_address) {
                    setShowLocationPicker(true);
                  } else if (!profileData.has_completed_tour) {
                    setShowTourGuide(true);
                  }
                } else {
                  // No profile yet (Google first-time) — flag for after redirect/retry
                  localStorage.setItem("headie_new_user", "true");
                  setIsNewUser(true);
                  setShowLocationPicker(true);
                }
              }
            });
          }, 0);
        } else {
          setProfile(null);
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

  const signOut = useCallback(async () => {
    // Clear state first for immediate UI feedback
    setProfile(null);
    setUser(null);
    setSession(null);
    setIsNewUser(false);
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
      value={{ user, session, profile, loading, isNewUser, setIsNewUser, showLocationPicker, completeLocationPicker, showTourGuide, completeTour, refreshProfile, signOut }}
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
