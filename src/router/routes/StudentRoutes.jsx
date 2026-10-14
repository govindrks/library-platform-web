import StudentDashboard from "../../views/Student/dashboard/StudentDashboard";

import BrowseLibraries from "../../views/Student/libraries/BrowseLibraries";

import LibraryDetails from "../../views/Student/libraries/LibraryDetails";

import LibraryMembershipPlans from "../../views/Student/libraries/LibraryMembershipPlans";

import BookSeat from "../../views/Student/booking/BookSeat";

import BookingReview from "../../views/Student/booking/BookingReview";

import MyBookings from "../../views/Student/booking/MyBookings";

import BookingDetails from "../../views/Student/booking/BookingDetails";

import MembershipDetails from "../../views/Student/Membership/MembershipDetails";

import MembershipPayment from "../../views/Student/Membership/MembershipPayment";

import StudentInvoices from "../../views/Student/payments/StudentInvoices";

import StudentPayments from "../../views/Student/payments/StudentPayments";

import StudentProfile from "../../views/Student/profile/StudentProfile";

import StudentNotifications from "../../views/Student/notifications/StudentNotifications";

import MySeatChangeRequests from "../../views/Student/seats/MySeatChangeRequests";

import SeatChangeRequest from "../../views/Student/seats/SeatChangeRequest";
import HelpSupport from "../../views/Student/support/HelpSupport";

const studentRoutes = [
  // ============================================================
  // DASHBOARD
  // ============================================================

  {
    path: "/student/dashboard",

    element: <StudentDashboard />,
  },

  // ============================================================
  // LIBRARY DISCOVERY
  // ============================================================

  {
    path: "/student/libraries",

    element: <BrowseLibraries />,
  },

  {
    path: "/student/libraries/:libraryId",

    element: <LibraryDetails />,
  },

  {
    path: "/student/libraries/:libraryId/plans",

    element: <LibraryMembershipPlans />,
  },

  // ============================================================
  // BOOKING FLOW
  // ============================================================

  {
    path: "/student/libraries/:libraryId/book-seat",

    element: <BookSeat />,
  },

  {
    path: "/student/libraries/:libraryId/booking-review",

    element: <BookingReview />,
  },

  // ============================================================
  // MY BOOKINGS
  // ============================================================

  {
    path: "/student/bookings",

    element: <MyBookings />,
  },

  {
    path: "/student/bookings/:bookingId",

    element: <BookingDetails />,
  },

  // ============================================================
  // MEMBERSHIP
  // ============================================================

  {
    path: "/student/membership",

    element: <MembershipDetails />,
  },

  {
    path: "/student/membership/payment",

    element: <MembershipPayment />,
  },

  // ============================================================
  // SEAT CHANGE
  // ============================================================

  {
    path: "/student/seat-change",

    element: <MySeatChangeRequests />,
  },

  {
    path: "/student/seat-change/request",

    element: <SeatChangeRequest />,
  },

  // ============================================================
  // PAYMENTS
  // ============================================================

  {
    path: "/student/payments",

    element: <StudentPayments />,
  },

  {
    path: "/student/invoices",

    element: <StudentInvoices />,
  },

  // ============================================================
  // ACCOUNT
  // ============================================================

  {
    path: "/student/notifications",

    element: <StudentNotifications />,
  },

  {
    path: "/student/profile",

    element: <StudentProfile />,
  },

  {
    path: "/student/help-support",
    element: <HelpSupport />,
  },
];

export default studentRoutes;
