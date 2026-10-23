import PlatformDashboard from "../../views/Admin/PlatformDashboard";

import Libraries from "../../views/Admin/Libraries";

import Users from "../../views/Admin/Users";

import PlatformPlans from "../../views/Admin/PlatformPlans";

import Subscriptions from "../../views/Admin/Subscriptions";

import Payments from "../../views/Admin/Payments";

import Reports from "../../views/Admin/Reports";

import Settings from "../../views/Admin/Settings";


// ============================================================
// LIBRARY REPORTS
// ============================================================
//
// Shared report components.
//
// Library Owner:
//   /owner/reports/...
//
// Platform Admin:
//   /admin/reports/libraries/:libraryId/...
//
// The report components detect the Admin libraryId from the
// route and otherwise preserve the normal Owner library flow.
// ============================================================

import BookingReport from "../../views/Reports/BookingReport";

import RevenueReport from "../../views/Reports/RevenueReport";

import OccupancyReport from "../../views/Reports/OccupancyReport";

import PaymentReport from "../../views/Reports/PaymentReport";

import RefundReport from "../../views/Reports/RefundReport";

import MembershipReport from "../../views/Reports/MembershipReport";



// ============================================================
// WHATSAPP
// ============================================================

import WhatsAppOverview from "../../views/Admin/whatsapp/WhatsAppOverview";

import WhatsAppTemplates from "../../views/Admin/whatsapp/WhatsAppTemplates";

import WhatsAppFailures from "../../views/Admin/whatsapp/WhatsAppFailures";


// ============================================================
// SUPPORT
// ============================================================

import SupportDashboard from "../../views/Admin/support/SupportDashboard";

import SupportTickets from "../../views/Admin/support/SupportTickets";

import SupportTicketDetails from "../../views/Admin/support/SupportTicketDetails";



// ============================================================
// ADMIN ROUTES
// ============================================================

const adminRoutes = [

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    path: "/admin/dashboard",
    element: <PlatformDashboard />,
  },


  // ==========================================================
  // LIBRARIES
  // ==========================================================

  {
    path: "/admin/libraries",
    element: <Libraries />,
  },


  // ==========================================================
  // USERS
  // ==========================================================

  {
    path: "/admin/users",
    element: <Users />,
  },


  // ==========================================================
  // PLATFORM PLANS
  // ==========================================================

  {
    path: "/admin/platform-plans",
    element: <PlatformPlans />,
  },


  // ==========================================================
  // PLATFORM SUBSCRIPTIONS
  // ==========================================================

  {
    path: "/admin/subscriptions",
    element: <Subscriptions />,
  },


  // ==========================================================
  // PAYMENTS
  // ==========================================================

  {
    path: "/admin/payments",
    element: <Payments />,
  },


  // ==========================================================
  // WHATSAPP
  // ==========================================================

  {
    path: "/admin/whatsapp/overview",
    element: <WhatsAppOverview />,
  },

  {
    path: "/admin/whatsapp/templates",
    element: <WhatsAppTemplates />,
  },

  {
    path: "/admin/whatsapp/failures",
    element: <WhatsAppFailures />,
  },


  // ==========================================================
  // REPORTS
  // ==========================================================

  {
    path: "/admin/reports",
    element: <Reports />,
  },


  // ==========================================================
  // LIBRARY-SPECIFIC REPORTS
  // ==========================================================

  {
    path: "/admin/reports/libraries/:libraryId/bookings",
    element: <BookingReport />,
  },

  {
    path: "/admin/reports/libraries/:libraryId/revenue",
    element: <RevenueReport />,
  },

  {
    path: "/admin/reports/libraries/:libraryId/occupancy",
    element: <OccupancyReport />,
  },

  {
    path: "/admin/reports/libraries/:libraryId/payments",
    element: <PaymentReport />,
  },

  {
    path: "/admin/reports/libraries/:libraryId/refunds",
    element: <RefundReport />,
  },

  {
    path: "/admin/reports/libraries/:libraryId/membership",
    element: <MembershipReport />,
  },


  // ==========================================================
  // SUPPORT
  // ==========================================================

  {
    path: "/admin/support",
    element: <SupportDashboard />,
  },

  {
    path: "/admin/support/tickets",
    element: <SupportTickets />,
  },

  {
    path: "/admin/support/tickets/:ticketId",
    element: <SupportTicketDetails />,
  },


  // ==========================================================
  // SETTINGS
  // ==========================================================

  {
    path: "/admin/settings",
    element: <Settings />,
  },
];


export default adminRoutes;
