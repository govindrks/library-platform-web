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
import Refunds from "../../views/LibraryOwner/Refunds";
import Invoices from "../../views/LibraryOwner/Invoices";
import Coupons from "../../views/LibraryOwner/Coupons";
import Revenue from "../../views/LibraryOwner/Revenue";
import Occupancy from "../../views/LibraryOwner/Occupancy";


// ============================================================
// REPORTS
// ============================================================
import BookingReport from "../../views/Reports/BookingReport";
import RevenueReport from "../../views/Reports/RevenueReport";
import OccupancyReport from "../../views/Reports/OccupancyReport";
import PaymentReport from "../../views/Reports/PaymentReport";
import RefundReport from "../../views/Reports/RefundReport";
// import MembershipReport from "../../views/Reports/MembershipReport";
import Reports from "../../views/Reports/Reports";
import MembershipReport from "../../views/Reports/MembershipReport";




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
    // LIBRARY
    // =========================================================

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


    // =========================================================
    // SEATS
    // =========================================================

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


    // =========================================================
    // BOOKINGS
    // =========================================================

    {
        path: "/owner/bookings",
        element: <Bookings />,
    },

    {
        path: "/owner/members",
        element: <Members />,
    },


    // =========================================================
    // FINANCE
    // =========================================================

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
        path: "/owner/coupons",
        element: <Coupons />,
    },


    // =========================================================
    // INSIGHTS
    // =========================================================

    {
        path: "/owner/revenue",
        element: <Revenue />,
    },

    {
        path: "/owner/occupancy",
        element: <Occupancy />,
    },


    // =========================================================
    // REPORTS LANDING PAGE
    // =========================================================

    {
        path: "/owner/reports",
        element: <Reports />,
    },


    // =========================================================
    // BOOKING REPORT
    // =========================================================

    {
        path: "/owner/reports/bookings",
        element: <BookingReport />,
    },


    // =========================================================
    // REVENUE REPORT
    // =========================================================

    {
        path: "/owner/reports/revenue",
        element: <RevenueReport />,
    },


    // =========================================================
    // OCCUPANCY REPORT
    // =========================================================

    {
        path: "/owner/reports/occupancy",
        element: <OccupancyReport />,
    },


    // =========================================================
    // PAYMENT REPORT
    // =========================================================

    {
        path: "/owner/reports/payments",
        element: <PaymentReport />,
    },


    // =========================================================
    // REFUND REPORT
    // =========================================================

    {
        path: "/owner/reports/refunds",
        element: <RefundReport />,
    },


    // =========================================================
    // MEMBERSHIP REPORT
    // =========================================================

    {
        path: "/owner/reports/membership",
        element: <MembershipReport />,
    },

];

export default ownerRoutes;