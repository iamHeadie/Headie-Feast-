import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import HeroLoader from "@/components/HeroLoader";
import { supabase } from "@/integrations/supabase/client";
import { OAUTH_PENDING_KEY } from "@/lib/auth-context";

const queryClient = new QueryClient();

const MIN_LOADER_MS = 2500;

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
    // If the user is returning from a Google OAuth redirect, bypass the
    // Spaghetti Loader entirely — they should land on the Location Picker
    // as fast as possible (target < 500 ms total).
    const skipLoader = isOAuthReturn();

    const startTime = Date.now();

    supabase.auth.getSession().then(() => {
      if (skipLoader) {
        // No minimum wait — dismiss as soon as the session is confirmed
        setIsInitialLoading(false);
      } else {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
        setTimeout(() => setIsInitialLoading(false), remaining);
      }
    });
  }, []);

  return (
    <>
      <HeroLoader show={isInitialLoading} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
