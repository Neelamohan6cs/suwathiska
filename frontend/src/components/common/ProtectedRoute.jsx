import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "./PageLoader";

export function ProtectedCustomerRoute({ children }) {
  const { isAuthenticated, role, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;

  if (!isAuthenticated || role !== "customer") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function ProtectedRoleRoute({ role: requiredRole, loginPath, children }) {
  const { isAuthenticated, role, initializing } = useAuth();

  if (initializing) return <PageLoader />;

  if (!isAuthenticated || role !== requiredRole) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
}
