import PlatformDashboard from "../../views/Admin/PlatformDashboard";
import Libraries from "../../views/Admin/Libraries";
import Users from "../../views/Admin/Users";
import PlatformPlans from "../../views/Admin/PlatformPlans";
import Subscriptions from "../../views/Admin/Subscriptions";
import Payments from "../../views/Admin/Payments";
import Reports from "../../views/Admin/Reports";
import Settings from "../../views/Admin/Settings";

// ============================================================
// ADMIN ROUTES
// ============================================================

const adminRoutes = [
  // =========================================================
  // DASHBOARD
  // =========================================================

  {
    path: "/admin/dashboard",
    element: <PlatformDashboard />,
  },

  // =========================================================
  // LIBRARIES
  // =========================================================

  {
    path: "/admin/libraries",
    element: <Libraries />,
  },

  // =========================================================
  // USERS
  // =========================================================

  {
    path: "/admin/users",
    element: <Users />,
  },

  // =========================================================
  // PLATFORM PLANS
  // =========================================================

  {
    path: "/admin/platform-plans",
    element: <PlatformPlans />,
  },

  // =========================================================
  // PLATFORM SUBSCRIPTIONS
  // =========================================================

  {
    path: "/admin/subscriptions",
    element: <Subscriptions />,
  },

  // =========================================================
  // PAYMENTS
  // =========================================================

  {
    path: "/admin/payments",
    element: <Payments />,
  },

  // =========================================================
  // REPORTS
  // =========================================================

  {
    path: "/admin/reports",
    element: <Reports />,
  },

  // =========================================================
  // SETTINGS
  // =========================================================

  {
    path: "/admin/settings",
    element: <Settings />,
  },
];

export default adminRoutes;
