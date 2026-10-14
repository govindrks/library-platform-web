import { Navigate, Outlet } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../context/AuthContext";

// ============================================================
// PUBLIC AUTH ROUTE
// ============================================================

function PublicRoute() {
  const { isAuthenticated, role, initializing } = useAuth();

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
   * Login and Register are accessible when logged out.
   */
  if (!isAuthenticated) {
    return <Outlet />;
  }

  // ==========================================================
  // AUTHENTICATED ADMIN
  // ==========================================================

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ==========================================================
  // AUTHENTICATED LIBRARY OWNER
  // ==========================================================

  if (role === "LIBRARY_OWNER") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // ==========================================================
  // AUTHENTICATED STUDENT
  // ==========================================================

  if (role === "USER") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // ==========================================================
  // UNKNOWN ROLE
  // ==========================================================

  /*
   * Send unknown authenticated roles through the generic
   * dashboard dispatcher.
   */
  return <Navigate to="/dashboard" replace />;
}

export default PublicRoute;
