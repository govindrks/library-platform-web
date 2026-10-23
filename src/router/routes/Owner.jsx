import OwnerDashboard from "../../views/LibraryOwner/OwnerDashboard";

import LibraryProfile from "../../views/LibraryOwner/LibraryProfile";
import Amenities from "../../views/LibraryOwner/Amenities";
import MembershipPlans from "../../views/LibraryOwner/MembershipPlans";

import SlotManagement from "../../views/LibraryOwner/SlotManagement";
import SeatMapping from "../../views/LibraryOwner/SeatMapping";
import SeatAvailability from "../../views/LibraryOwner/SeatAvailability";

import Bookings from "../../views/LibraryOwner/Bookings";
import Members from "../../views/LibraryOwner/Members";
import CreateBooking from "../../views/LibraryOwner/CreateBooking";

import Payments from "../../views/LibraryOwner/Payments";
import Refunds from "../../views/LibraryOwner/Refunds";
import Invoices from "../../views/LibraryOwner/Invoices";
import Coupons from "../../views/LibraryOwner/Coupons";
import Expenses from "../../views/LibraryOwner/Expenses";

import Revenue from "../../views/LibraryOwner/Revenue";
import Occupancy from "../../views/LibraryOwner/Occupancy";

import Reports from "../../views/Reports/Reports";


// ============================================================
// WHATSAPP
// ============================================================

import WhatsAppSettings from "../../views/LibraryOwner/whatsapp/WhatsAppSettings";

import WhatsAppMessages from "../../views/LibraryOwner/whatsapp/WhatsAppMessages";

import WhatsAppUsage from "../../views/LibraryOwner/whatsapp/WhatsAppUsage";


// ============================================================
// SUPPORT
// ============================================================

import HelpSupport from "../../views/LibraryOwner/support/HelpSupport";

import MySupportTickets from "../../views/LibraryOwner/support/MySupportTickets";

import StudentSupportTickets from "../../views/LibraryOwner/support/StudentSupportTickets";

import OwnerSupportTicketDetails from "../../views/LibraryOwner/support/OwnerSupportTicketDetails";



// ============================================================
// CORE LIBRARY OWNER ROUTES
// ============================================================

const ownerRoutes = [

  // ==========================================================
  // OWNER DASHBOARD
  // ==========================================================

  {
    path: "/owner/dashboard",
    element: <OwnerDashboard />,
  },


  // ==========================================================
  // LIBRARY
  // ==========================================================

  {
    path: "/owner/library",
    element: <LibraryProfile />,
  },

  {
    path: "/owner/amenities",
    element: <Amenities />,
  },

  {
    path: "/owner/membership-plans",
    element: <MembershipPlans />,
  },


  // ==========================================================
  // SEATS
  // ==========================================================

  {
    path: "/owner/slots",
    element: <SlotManagement />,
  },

  {
    path: "/owner/seat-mapping",
    element: <SeatMapping />,
  },

  {
    path: "/owner/seat-availability",
    element: <SeatAvailability />,
  },


  // ==========================================================
  // BOOKINGS
  // ==========================================================

  {
    path: "/owner/bookings",
    element: <Bookings />,
  },

  {
    path: "/owner/bookings/create",
    element: <CreateBooking />,
  },

  {
    path: "/owner/members",
    element: <Members />,
  },


  // ==========================================================
  // FINANCE
  // ==========================================================

  {
    path: "/owner/payments",
    element: <Payments />,
  },

  {
    path: "/owner/refunds",
    element: <Refunds />,
  },

  {
    path: "/owner/invoices",
    element: <Invoices />,
  },

  {
    path: "/owner/expenses",
    element: <Expenses />,
  },

  {
    path: "/owner/coupons",
    element: <Coupons />,
  },


  // ==========================================================
  // INSIGHTS
  // ==========================================================

  {
    path: "/owner/revenue",
    element: <Revenue />,
  },

  {
    path: "/owner/occupancy",
    element: <Occupancy />,
  },


  // ==========================================================
  // REPORTS
  // ==========================================================

  {
    path: "/owner/reports",
    element: <Reports />,
  },


  // ==========================================================
  // WHATSAPP
  // ==========================================================

  {
    path: "/owner/whatsapp/settings",
    element: <WhatsAppSettings />,
  },

  {
    path: "/owner/whatsapp/messages",
    element: <WhatsAppMessages />,
  },

  {
    path: "/owner/whatsapp/usage",
    element: <WhatsAppUsage />,
  },


  // ==========================================================
  // HELP & SUPPORT
  // ==========================================================

  {
    path: "/owner/help-support",
    element: <HelpSupport />,
  },


  // ==========================================================
  // OWNER -> LIBRARYHUB SUPPORT
  // ==========================================================

  {
    path: "/owner/support/tickets",
    element: <MySupportTickets />,
  },

  {
    path: "/owner/support/tickets/:ticketId",
    element: <OwnerSupportTicketDetails />,
  },


  // ==========================================================
  // STUDENT -> LIBRARY OWNER SUPPORT
  // ==========================================================

  {
    path: "/owner/student-support",
    element: <StudentSupportTickets />,
  },

  {
    path: "/owner/student-support/:libraryId/tickets/:ticketId",
    element: <OwnerSupportTicketDetails />,
  },
];


export default ownerRoutes;