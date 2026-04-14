import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { customer, partner, admin } = useAuth();

  if (role === "customer" && !customer) return <Navigate to="/login" replace />;
  if (role === "partner" && !partner) return <Navigate to="/partner/login" replace />;
  if (role === "admin" && !admin) return <Navigate to="/admin" replace />;

  return children;
}
