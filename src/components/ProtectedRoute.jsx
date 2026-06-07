import { Navigate, Outlet, useLocation } from "react-router-dom";
import { validateSession } from "../services/auth";

export default function ProtectedRoute({ roles = [] }) {
  const location = useLocation();
  const validation = validateSession(roles);

  if (!validation.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!validation.isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ session: validation.session }} />;
}
