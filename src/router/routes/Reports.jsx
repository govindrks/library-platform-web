import BookingReport from "../../views/Reports/BookingReport";

import RevenueReport from "../../views/Reports/RevenueReport";

import OccupancyReport from "../../views/Reports/OccupancyReport";

import PaymentReport from "../../views/Reports/PaymentReport";

import RefundReport from "../../views/Reports/RefundReport";

import MembershipReport from "../../views/Reports/MembershipReport";

// ============================================================
// OWNER REPORT ROUTES
// ============================================================

const reportRoutes = [
  {
    path: "/owner/reports/bookings",

    element: <BookingReport />,
  },

  {
    path: "/owner/reports/revenue",

    element: <RevenueReport />,
  },

  {
    path: "/owner/reports/occupancy",

    element: <OccupancyReport />,
  },

  {
    path: "/owner/reports/payments",

    element: <PaymentReport />,
  },

  {
    path: "/owner/reports/refunds",

    element: <RefundReport />,
  },

  {
    path: "/owner/reports/membership",

    element: <MembershipReport />,
  },
];

export default reportRoutes;
