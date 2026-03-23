import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

/** Hardcoded admin email that always has access regardless of DB state. */
const FORCE_ADMIN_EMAIL = "enemalivictor5@gmail.com";

/**
 * AdminRoute — wraps any /admin/* page.
 * - If auth is still loading, shows a spinner.
 * - If the user is not logged in OR is_admin !== true (and not force-admin email), redirects to "/" with a toast alert.
 * - Otherwise renders children normally.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Admin check: trust is_admin from DB, OR always allow the force-admin email.
  const isAdmin = profile?.is_admin === true || user?.email === FORCE_ADMIN_EMAIL;

  useEffect(() => {
    if (loading) return;

    if (!user || !isAdmin) {
      // Redirect to home. We pass a state flag so Index.tsx can fire a toast.
      navigate("/", { replace: true, state: { restrictedAccess: true } });
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
