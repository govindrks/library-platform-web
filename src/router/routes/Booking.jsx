import BookingSummary from "../../views/Booking/BookingSummary";

import BookingSuccess from "../../views/Booking/BookingSuccess";

import CreateBooking from "../../views/LibraryOwner/CreateBooking";

// ============================================================
// LEGACY BOOKING ROUTES
// ============================================================

/**
 * Temporary legacy booking routes.
 *
 * Canonical student booking and seat-change routes now live in:
 *
 * StudentRoutes.jsx
 *
 * /student/bookings
 * /student/bookings/:bookingId
 * /student/seat-change
 * /student/seat-change/request
 *
 * The following old routes have been removed:
 *
 * /my-bookings
 * /request-seat-change
 * /my-seat-change-requests
 */

const bookingRoutes = [
  // ==========================================================
  // BOOKING SUMMARY
  // ==========================================================

  {
    path: "/booking/summary",

    element: <BookingSummary />,
  },

  // ==========================================================
  // OWNER CREATE BOOKING
  // ==========================================================

  {
    path: "/owner/bookings/create",

    element: <CreateBooking />,
  },

  // ==========================================================
  // BOOKING SUCCESS
  // ==========================================================

  {
    path: "/booking/success",

    element: <BookingSuccess />,
  },
];

export default bookingRoutes;
