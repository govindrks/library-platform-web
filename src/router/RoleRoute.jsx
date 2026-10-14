import { Navigate, Outlet } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../context/AuthContext";

// ============================================================
// ROLE ROUTE
// ============================================================

function RoleRoute({ allowedRoles = [] }) {
  const { role, isAuthenticated, initializing } = useAuth();

  // ==========================================================
  // AUTH INITIALIZATION
  // ==========================================================

  if (initializing) {
    return (
      <Box
        sx={{
          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  /*
   * ProtectedRoute normally handles this first.
   *
   * Keep this fallback so RoleRoute remains safe even if it is
   * accidentally mounted somewhere without ProtectedRoute.
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================================
  // ROLE NOT AVAILABLE
  // ==========================================================

  if (!role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================================
  // ROLE NOT ALLOWED
  // ==========================================================

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    /*
     * Let DashboardRedirect resolve the user's actual
     * destination.
     *
     * Example:
     *
     * USER tries /owner/dashboard
     *
     * → /dashboard
     * → /student/dashboard
     */
    return <Navigate to="/dashboard" replace />;
  }

  // ==========================================================
  // AUTHORIZED
  // ==========================================================

  return <Outlet />;
}

export default RoleRoute;
