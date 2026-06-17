import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { validateSessionWithApi } from "../services/auth";

export default function ProtectedRoute({ roles = [] }) {
  const location = useLocation();
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function validate() {
      const result = await validateSessionWithApi(roles);
      if (mounted) {
        setValidation(result);
      }
    }

    validate();

    return () => {
      mounted = false;
    };
  }, [roles]);

  if (!validation) {
    return null;
  }

  if (!validation.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!validation.isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ session: validation.session }} />;
}
