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
  is_admin: boolean | null;
  phone: string | null;
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

/**
 * sessionStorage key — once the Location Picker has been shown once during a
 * browser session, we NEVER re-trigger it, even if the user minimises the app,
 * switches tabs, or the Supabase client fires another SIGNED_IN event on resume.
 * sessionStorage is cleared automatically when the tab is closed but survives
 * page refreshes, which is exactly the desired behaviour.
 */
const SESSION_GUARD_KEY = "chopgee_picker_shown_session";

function hasPickerBeenShownInSession(): boolean {
  try { return sessionStorage.getItem(SESSION_GUARD_KEY) === "true"; } catch { return false; }
}

function markPickerShownInSession(): void {
  try { sessionStorage.setItem(SESSION_GUARD_KEY, "true"); } catch {}
}

/** Hardcoded admin email that bypasses onboarding flows (location picker, tour). */
const FORCE_ADMIN_EMAIL = "enemalivictor5@gmail.com";

/** Returns true if the user should skip the location picker and onboarding tour. */
function isForceAdmin(user: User): boolean {
  return user.email === FORCE_ADMIN_EMAIL;
}

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
        // Admin bypass: skip location picker and onboarding entirely.
        if (isForceAdmin(session.user)) {
          localStorage.removeItem(LOCATION_PENDING_KEY);
          fetchProfile(session.user.id).then(() => {
            if (!mounted) return;
            setLoading(false);
          });
          return;
        }

        // Fast path: if we cached that this user needs a location, show the picker
        // immediately — but only if it hasn't been shown yet this browser session.
        // The session guard prevents re-triggering on minimize / tab-resume / refresh.
        const locationCached = localStorage.getItem(LOCATION_PENDING_KEY) === "true";
        if (locationCached) {
          if (!hasPickerBeenShownInSession()) {
            markPickerShownInSession();
            setShowLocationPicker(true);
          }
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
                // Only show picker if not already shown this session
                if (!hasPickerBeenShownInSession()) {
                  markPickerShownInSession();
                  setShowLocationPicker(true);
                }
              }
              // If label === "Pending" they skipped — go straight to dashboard
            } else {
              // Has a real address — ensure cache is cleared, picker closed
              localStorage.removeItem(LOCATION_PENDING_KEY);
              setShowLocationPicker(false);
              if (!profileData.has_completed_tour) {
                setShowTourGuide(true);
              }
            }
          } else if (pendingNewUser === "true") {
            // No profile yet (first Google sign-in before DB trigger)
            localStorage.setItem(LOCATION_PENDING_KEY, "true");
            if (!hasPickerBeenShownInSession()) {
              markPickerShownInSession();
              setShowLocationPicker(true);
            }
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
            setIsAuthenticating(false);
            // NOTE: We do NOT use an "aggressive trigger" (setShowLocationPicker(true))
            // here anymore. The old pattern caused two bugs:
            //   1. Flash: returning users with a saved address briefly saw the picker
            //      before the DB fetch confirmed they didn't need it.
            //   2. Pop-up loop: Supabase re-fires SIGNED_IN on minimize/resume, which
            //      re-opened the picker every time the user came back to the app.
            // The session guard below + DB-confirmed display fixes both.
          }

          // Admin bypass: skip location picker and onboarding entirely.
          if (isForceAdmin(session.user)) {
            localStorage.removeItem(LOCATION_PENDING_KEY);
            setShowLocationPicker(false);
            setIsAuthenticating(false);
            setTimeout(() => {
              if (!mounted) return;
              fetchProfile(session.user.id);
            }, 0);
            return;
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
                // Session guard: if the picker was already shown this browser session,
                // skip all picker logic entirely. This is the primary defence against
                // the minimize/resume pop-up loop — Supabase fires SIGNED_IN again on
                // token refresh, but we honour the guard and do nothing.
                const alreadyShown = hasPickerBeenShownInSession();

                const newUser = detectNewUser(session.user);
                if (newUser) {
                  setIsNewUser(true);
                }

                if (profileData) {
                  const hasRealAddress =
                    profileData.last_delivery_address !== null &&
                    profileData.last_delivery_address.label !== "Pending";
                  if (hasRealAddress) {
                    // Returning user with saved address — go straight to dashboard.
                    // Zero pop-ups: clear cache and ensure picker is closed.
                    localStorage.removeItem(LOCATION_PENDING_KEY);
                    setShowLocationPicker(false);
                    if (!profileData.has_completed_tour) {
                      setShowTourGuide(true);
                    }
                  } else {
                    // No address or "Pending" skip — only show picker if not already
                    // shown this session (prevents minimize/resume re-trigger).
                    if (!profileData.last_delivery_address) {
                      localStorage.setItem(LOCATION_PENDING_KEY, "true");
                    }
                    if (!alreadyShown) {
                      markPickerShownInSession();
                      setShowLocationPicker(true);
                    }
                  }
                } else {
                  // No profile yet (Google first-time) — flag it and show picker once.
                  localStorage.setItem("chopgee_new_user", "true");
                  localStorage.setItem(LOCATION_PENDING_KEY, "true");
                  setIsNewUser(true);
                  if (!alreadyShown) {
                    markPickerShownInSession();
                    setShowLocationPicker(true);
                  }
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

  // NOTE: No window.focus / visibilitychange listeners are used here.
  // The Supabase auth state change handler covers all login events, and the
  // SESSION_GUARD_KEY in sessionStorage prevents the picker from re-appearing
  // when the user minimises and returns to the app (even if Supabase re-fires
  // a SIGNED_IN event on token refresh).

  const signOut = useCallback(async () => {
    // Clear all local state and caches for immediate UI feedback
    localStorage.removeItem(LOCATION_PENDING_KEY);
    localStorage.removeItem(OAUTH_PENDING_KEY);
    // Clear the session guard so the picker can show again on the next sign-in
    try { sessionStorage.removeItem(SESSION_GUARD_KEY); } catch {}
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
