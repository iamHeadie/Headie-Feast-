import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute — wraps any /admin/* page.
 * - If auth is still loading, shows a spinner.
 * - If the user is not logged in OR is_admin !== true, redirects to "/" with a toast alert.
 * - Otherwise renders children normally.
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user || !profile?.is_admin) {
      // Redirect to home. We pass a state flag so Index.tsx can fire a toast.
      navigate("/", { replace: true, state: { restrictedAccess: true } });
    }
  }, [loading, user, profile, navigate]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile?.is_admin) {
    return null;
  }

  return <>{children}</>;
}
