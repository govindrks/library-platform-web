import { Navigate } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// DASHBOARD ROLE REDIRECT
// ============================================================

function DashboardRedirect() {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ==========================================================
  // ADMIN
  // ==========================================================

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ==========================================================
  // LIBRARY OWNER
  // ==========================================================

  if (role === "LIBRARY_OWNER") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // ==========================================================
  // STUDENT
  // ==========================================================

  if (role === "USER") {
    return <Navigate to="/student/dashboard" replace />;
  }

  // ==========================================================
  // UNKNOWN ROLE
  // ==========================================================

  return <Navigate to="/" replace />;
}

export default DashboardRedirect;
