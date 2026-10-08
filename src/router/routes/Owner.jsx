import OwnerDashboard from "../../views/LibraryOwner/OwnerDashboard";
import LibraryProfile from "../../views/LibraryOwner/LibraryProfile";
import Amenities from "../../views/LibraryOwner/Amenities";
import MembershipPlans from "../../views/LibraryOwner/MembershipPlans";
import SlotManagement from "../../views/LibraryOwner/SlotManagement";
import SeatMapping from "../../views/LibraryOwner/SeatMapping";
import SeatAvailability from "../../views/LibraryOwner/SeatAvailability";
import Bookings from "../../views/LibraryOwner/Bookings";
import Members from "../../views/LibraryOwner/Members";
import Payments from "../../views/LibraryOwner/Payments";

/**
 * Core Library Owner routes.
 *
 * These routes are mounted inside:
 *
 * ProtectedRoute
 *      ↓
 * VerticalLayout
 *      ↓
 * RoleRoute [LIBRARY_OWNER]
 *
 * in AppRouter.
 *
 * IMPORTANT:
 * Do not check onboardingCompleted here.
 *
 * A LIBRARY_OWNER is allowed to access owner pages even when
 * the library is still being configured or is in DRAFT state.
 */
const ownerRoutes = [
  // =========================================================
  // OWNER DASHBOARD
  // =========================================================

  {
    path: "/owner/dashboard",
    element: <OwnerDashboard />,
  },

  // =========================================================
  // LIBRARY PROFILE
  // =========================================================

  {
    path: "/owner/library",
    element: <LibraryProfile />,
  },

  // =========================================================
  // AMENITIES
  // =========================================================

  {
    path: "/owner/amenities",
    element: <Amenities />,
  },

  // =========================================================
  // MEMBERSHIP PLANS
  // =========================================================

  {
    path: "/owner/membership-plans",
    element: <MembershipPlans />,
  },

  // =========================================================
  // SLOT MANAGEMENT
  // =========================================================

  {
    path: "/owner/slots",
    element: <SlotManagement />,
  },

  // =========================================================
  // SEAT MAPPING
  // =========================================================

  {
    path: "/owner/seat-mapping",
    element: <SeatMapping />,
  },

  // =========================================================
  // SEAT AVAILABILITY
  // =========================================================

  {
    path: "/owner/seat-availability",
    element: <SeatAvailability />,
  },

  // =========================================================
  // BOOKINGS
  // =========================================================

  {
    path: "/owner/bookings",
    element: <Bookings />,
  },

  // =========================================================
  // MEMBERS
  // =========================================================

  {
    path: "/owner/members",
    element: <Members />,
  },

  // =========================================================
  // PAYMENTS
  // =========================================================

  {
    path: "/owner/payments",
    element: <Payments />,
  },
];

export default ownerRoutes;
