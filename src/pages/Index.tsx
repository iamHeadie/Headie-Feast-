import { useState } from "react";
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
import { AnimatePresence } from "framer-motion";

function AppContent() {
  const { user, loading, showLocationPicker, completeLocationPicker, showTourGuide, completeTour } = useAuth();
  const [activePage, setActivePage] = useState("home");

  if (loading) return null;

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
