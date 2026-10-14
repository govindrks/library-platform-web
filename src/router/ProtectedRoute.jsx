import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../context/AuthContext";

// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute() {
  const location = useLocation();

  const { isAuthenticated, initializing } = useAuth();

  // ==========================================================
  // AUTH INITIALIZATION
  // ==========================================================

  /*
   * AuthContext may still be restoring:
   *
   * - JWT
   * - cached user
   * - backend profile
   *
   * Never redirect while this process is still running.
   */
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
    return (
      <Navigate
        to="/login"
        replace
        state={{
          /*
           * Preserve the complete destination.
           *
           * Example:
           *
           * /student/libraries/4/book-seat?slot=3
           */
          from: location.pathname + location.search,

          /*
           * Preserve optional booking flow information.
           */
          action: location.state?.action,

          seatId: location.state?.seatId,

          libraryId: location.state?.libraryId,

          date: location.state?.date,

          slotId: location.state?.slotId,
        }}
      />
    );
  }

  // ==========================================================
  // AUTHENTICATED
  // ==========================================================

  return <Outlet />;
}

export default ProtectedRoute;
