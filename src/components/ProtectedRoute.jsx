import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/common/hooks/useAuth";

export default function ProtectedRoute({ roles = [] }) {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles.length > 0) {
    const userRole = user.role ? user.role.toUpperCase() : "";
    const allowedUpper = roles.map((r) => r.toUpperCase());
    const hasRole = allowedUpper.some((r) => {
      if (r === "REFEREE" && userRole === "RACE_REFEREE") return true;
      if (r === "OWNER" && (userRole === "HORSE_OWNER" || userRole === "OWNER")) return true;
      return r === userRole;
    });

    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet context={{ session: { user } }} />;
}
