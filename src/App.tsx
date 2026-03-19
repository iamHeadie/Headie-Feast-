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

const queryClient = new QueryClient();

const MIN_LOADER_MS = 2500;

function AppShell() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    supabase.auth.getSession().then(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
      setTimeout(() => setShowLoader(false), remaining);
    });
  }, []);

  return (
    <>
      <HeroLoader show={showLoader} />
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
