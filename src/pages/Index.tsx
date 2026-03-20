import { useState, useEffect } from "react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import BottomNav from "@/components/BottomNav";
import DiscoveryPage from "./DiscoveryPage";
import MenuPage from "./MenuPage";
import CartPage from "./CartPage";
import TrackingPage from "./TrackingPage";
import ProfilePage from "./ProfilePage";
import AuthPage from "./AuthPage";
import OnboardingTour from "@/components/OnboardingTour";
import LocationPickerOnboarding from "@/components/LocationPickerOnboarding";
import HeroLoader from "@/components/HeroLoader";
import { AnimatePresence } from "framer-motion";

function AppContent() {
  const {
    user,
    loading,
    locationCheckPending,
    showLocationPicker,
    completeLocationPicker,
    showTourGuide,
    completeTour,
  } = useAuth();
  const [activePage, setActivePage] = useState("home");

  // Optimistic UI: show the Spaghetti Loader if the profile address check takes
  // longer than 500 ms post-login.  This prevents the Dashboard from flashing
  // into view while we're still waiting for the Supabase profiles query.
  const [showOptimisticLoader, setShowOptimisticLoader] = useState(false);

  useEffect(() => {
    if (!locationCheckPending) {
      setShowOptimisticLoader(false);
      return;
    }
    // Give the DB check 500 ms before showing the loader so fast connections
    // snap directly to the Location Picker with no visible intermediate step.
    const timer = setTimeout(() => setShowOptimisticLoader(true), 500);
    return () => clearTimeout(timer);
  }, [locationCheckPending]);

  // Initial auth check — show loader until we know whether a session exists.
  if (loading) return <HeroLoader show={true} />;

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <DiscoveryPage />;
      case "search":
        return <MenuPage onBack={() => setActivePage("home")} />;
      case "cart":
        return <CartPage onCheckout={() => setActivePage("tracking")} />;
      case "tracking":
        return <TrackingPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DiscoveryPage />;
    }
  };

  return (
    <CartProvider>
      {/*
        Optimistic loader overlay — shown when the post-login profile check is
        still in-flight after the 500 ms threshold.  Dismissed the instant the
        check resolves (replaced by the Location Picker if address is NULL).
      */}
      {showOptimisticLoader && !showLocationPicker && (
        <HeroLoader show={true} />
      )}

      <AnimatePresence>
        {showLocationPicker && (
          <LocationPickerOnboarding onComplete={completeLocationPicker} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showTourGuide && !showLocationPicker && (
          <OnboardingTour onComplete={completeTour} />
        )}
      </AnimatePresence>

      {/*
        Dashboard renders unconditionally once the user is known — even while
        the Location Picker or loader is visible.  This lets React Query fire
        its fetches in the background so the feed is ready the moment the user
        dismisses the Location Picker (parallel loading, zero wasted time).
      */}
      <div className="min-h-screen bg-background max-w-lg mx-auto relative">
        {renderPage()}
        <BottomNav active={activePage} onNavigate={setActivePage} />
      </div>
    </CartProvider>
  );
}

const Index = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default Index;
