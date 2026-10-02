import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-800" />
    </div>
  );
}

// Only logged-in users can see these pages
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

// Logged-in users get sent to the dashboard instead of login/register
export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}
