import { useState, useEffect } from "react";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
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
import RestaurantMenuPage from "@/components/RestaurantMenuPage";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import { AnimatePresence } from "framer-motion";

function AppContent() {
  const {
    user,
    loading,
    isAuthenticating,
    showLocationPicker,
    completeLocationPicker,
    showTourGuide,
    completeTour,
  } = useAuth();
  const [activePage, setActivePage] = useState("home");
  const [activeRestaurant, setActiveRestaurant] = useState<string | null>(null);
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  // Show the push notification prompt once the user is fully settled:
  // logged in, onboarding done, no spinner visible.
  const onboardingDone =
    !!user && !loading && !isAuthenticating && !showLocationPicker && !showTourGuide;

  useEffect(() => {
    if (!onboardingDone) return;
    // Small delay so the dashboard has time to settle before the prompt appears
    const t = setTimeout(() => setShowPushPrompt(true), 600);
    return () => clearTimeout(t);
    // Only ever run this once after onboarding completes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingDone]);

  // Initial auth check (page load / hard-refresh)
  if (loading) return <HeroLoader show={true} />;

  if (!user) {
    return <AuthPage />;
  }

  const handleRestaurantClick = (name: string) => {
    setActiveRestaurant(name);
    setActivePage("restaurant");
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <DiscoveryPage onRestaurantClick={handleRestaurantClick} />;
      case "restaurant":
        return activeRestaurant ? (
          <RestaurantMenuPage
            restaurantName={activeRestaurant}
            onBack={() => {
              setActivePage("home");
              setActiveRestaurant(null);
            }}
          />
        ) : (
          <DiscoveryPage onRestaurantClick={handleRestaurantClick} />
        );
      case "search":
        return <MenuPage onBack={() => setActivePage("home")} />;
      case "cart":
        return <CartPage onCheckout={() => setActivePage("tracking")} />;
      case "tracking":
        return <TrackingPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <DiscoveryPage onRestaurantClick={handleRestaurantClick} />;
    }
  };

  return (
    <CartProvider>
      {/*
        Post-login authenticating overlay — shown while the profile fetch is
        in-flight after sign-in.  Uses a lightweight spinner instead of the
        full Spaghetti Loader so the transition to the Location Picker feels
        instant (resolves within 1 s via the safety timeout in auth-context).
      */}
      {isAuthenticating && !showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Almost there…</p>
          </div>
        </div>
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

      {/* Push notification permission prompt — shown once per user after
          the location picker and onboarding tour have been dismissed. */}
      {showPushPrompt && (
        <PushNotificationPrompt onDone={() => setShowPushPrompt(false)} />
      )}

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
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  </AuthProvider>
);

export default Index;
