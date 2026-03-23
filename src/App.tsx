import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import AdminRoute from "./components/AdminRoute.tsx";
import RiderApplicationPage from "./pages/RiderApplicationPage.tsx";
import HeroLoader from "@/components/HeroLoader";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { AuthProvider, OAUTH_PENDING_KEY } from "@/lib/auth-context";

const queryClient = new QueryClient();

const MIN_LOADER_MS = 3000;

/** Detect whether the page is loading as a result of an OAuth redirect.
 *  In that case we skip the 2.5 s Spaghetti Loader so the Location Picker
 *  can appear as soon as the session is confirmed — well under 500 ms. */
function isOAuthReturn(): boolean {
  // Supabase PKCE flow appends ?code= to the URL
  if (window.location.search.includes("code=")) return true;
  // Supabase implicit flow appends #access_token= to the URL
  if (window.location.hash.includes("access_token")) return true;
  // Flag we set in AuthPage before triggering the Google redirect
  if (localStorage.getItem(OAUTH_PENDING_KEY) === "true") return true;
  return false;
}

function AppShell() {
  // True only on the very first render (website entry / hard-refresh).
  // A React state variable that starts true means it resets on every hard
  // refresh but NOT on in-app navigation, exactly the desired behaviour.
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // If Supabase env vars are missing (e.g. local dev without a .env file),
    // skip the session check entirely to prevent a white-screen crash.
    // The app will still render; features that require auth will simply be unavailable.
    if (!supabaseConfigured) {
      setIsInitialLoading(false);
      return;
    }

    // If the user is returning from a Google OAuth redirect, bypass the
    // Spaghetti Loader entirely — they should land on the Location Picker
    // as fast as possible (target < 500 ms total).
    const skipLoader = isOAuthReturn();

    const startTime = Date.now();

    supabase.auth.getSession().then(({ data: { session } }) => {
      // Skip the splash for:
      //  1. Returning authenticated users (already logged in) — go straight to dashboard.
      //  2. OAuth returns — snap to Location Picker immediately, no waiting.
      // Only show the 2.5 s intro on a true first visit where there is no session yet.
      if (session || skipLoader) {
        setIsInitialLoading(false);
      } else {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setIsInitialLoading(false), remaining);
      }
    });
  }, []);

  if (!supabaseConfigured) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '12px', fontFamily: 'sans-serif', color: '#555' }}>
        <div style={{ fontSize: '2rem' }}>🍽️</div>
        <p style={{ margin: 0, fontSize: '1.1rem' }}>Connecting…</p>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Setting up your environment</p>
      </div>
    );
  }

  return (
    <>
      <HeroLoader show={isInitialLoading} />
      {/* Keep the orange background on the root container until the splash has fully
          faded out so no white bleed-through is visible during the 0.8 s exit
          animation. Fades out in sync with the HeroLoader's exit transition. */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "#F97316",
          opacity: isInitialLoading ? 1 : 0,
          transition: "opacity 0.8s ease-in-out",
          zIndex: 40,
          pointerEvents: "none",
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/rider-apply"
            element={
              <AuthProvider>
                <RiderApplicationPage />
              </AuthProvider>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AuthProvider>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </AuthProvider>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppShell />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
