import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { partner, admin, token, isSessionReady } = useAuth();

  if (isSessionReady === false) return null;

  if (!token) {
    if (role === "partner") return <Navigate to="/partner/login" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/checkout" replace />;
  }

  if (role === "customer") return <Navigate to="/checkout" replace />;
  if (role === "partner" && !partner) return <Navigate to="/partner/login" replace />;
  if (role === "admin" && !admin) return <Navigate to="/admin" replace />;

  return children;
}
