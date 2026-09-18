import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/domains/auth/store/useAuthStore";

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/" replace />;
  return <Outlet />;
}
