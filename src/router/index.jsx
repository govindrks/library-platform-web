import { Navigate, Route, Routes } from "react-router-dom";

// ============================================================
// LAYOUTS
// ============================================================

import PublicLayout from "../layouts/PublicLayout";

import VerticalLayout from "../layouts/VerticalLayout";

import StudentLayout from "../layouts/StudentLayout/StudentLayout";

// ============================================================
// GUARDS
// ============================================================

import ProtectedRoute from "./ProtectedRoute";

import PublicRoute from "./PublicRoute";

import RoleRoute from "./RoleRoute";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "../views/Public/Home";

import LibraryList from "../views/Public/LibraryList";

import LibraryDetails from "../views/Public/LibraryDetails";

import SeatAvailability from "../views/Public/SeatAvailability";

import LibraryEnquiry from "../views/Public/LibraryEnquiry";

import PlatformPlans from "../views/Public/PlatformPlans";

import QrRedirect from "../views/Public/QrRedirect";

// ============================================================
// AUTH
// ============================================================

import Login from "../views/Auth/Login";

import Register from "../views/Auth/Register";

// ============================================================
// COMMON
// ============================================================

import Maintenance from "../views/Common/Maintenance";

// ============================================================
// LIBRARY OWNER
// ============================================================

import RegisterLibrary from "../views/LibraryOwner/RegisterLibrary";

import SeatChangeRequests from "../views/LibraryOwner/SeatChangeRequests";

import SubscriptionBilling from "../views/LibraryOwner/SubscriptionBilling";

import AutomationCenter from "../views/LibraryOwner/AutomationCenter";

import Notifications from "../views/LibraryOwner/Notifications";

import Settings from "../views/LibraryOwner/Settings";

import Coupons from "../views/LibraryOwner/Coupons";

import LibraryEnquiries from "../views/LibraryOwner/components/LibraryEnquiries";

// ============================================================
// STUDENT / MEMBER
// ============================================================

import MembershipPaymentSuccess from "../views/Student/Membership/MembershipPaymentSuccess";

// ============================================================
// ROUTE GROUPS
// ============================================================

import adminRoutes from "./routes/Admin";

import ownerRoutes from "./routes/Owner";

import studentRoutes from "./routes/StudentRoutes";

import bookingRoutes from "./routes/Booking";

import reportRoutes from "./routes/Reports";

// ============================================================
// DASHBOARD ROLE DISPATCHER
// ============================================================

import DashboardRedirect from "./routes/Dashboard";
import LibraryOwnerFeatures from "../views/LibraryOwner/LibraryOwnerFeatures";

// ============================================================
// LOGIN OVERLAY
// ============================================================
//
// Home remains rendered underneath Login.
//
// ============================================================

function LoginOverlay() {
  return (
    <>
      <Home />

      <Login />
    </>
  );
}

// ============================================================
// REGISTER OVERLAY
// ============================================================
//
// Home remains rendered underneath Register.
//
// ============================================================

function RegisterOverlay() {
  return (
    <>
      <Home />

      <Register />
    </>
  );
}

// ============================================================
// APP ROUTER
// ============================================================

function AppRouter() {
  return (
    <Routes>
      {/* ===================================================== */}
      {/* MAINTENANCE */}
      {/* ===================================================== */}

      <Route path="/maintenance" element={<Maintenance />} />

      {/* ===================================================== */}
      {/* PUBLIC APPLICATION */}
      {/* ===================================================== */}

      <Route element={<PublicLayout />}>
        {/* =================================================== */}
        {/* PUBLIC QR CAMPAIGN RESOLVER */}
        {/* =================================================== */}

        <Route path="/q/:code" element={<QrRedirect />} />

        {/* =================================================== */}
        {/* HOME */}
        {/* =================================================== */}

        <Route path="/" element={<Home />} />

        {/* =================================================== */}
        {/* PUBLIC LIBRARY LIST */}
        {/* =================================================== */}

        <Route path="/libraries" element={<LibraryList />} />

        {/* =================================================== */}
        {/* PUBLIC LIBRARY DETAILS */}
        {/* =================================================== */}

        <Route path="/libraries/:libraryId" element={<LibraryDetails />} />

        {/* =================================================== */}
        {/* PUBLIC SEAT AVAILABILITY */}
        {/* =================================================== */}

        <Route
          path="/libraries/:libraryId/seats"
          element={<SeatAvailability />}
        />

        {/* =================================================== */}
        {/* PUBLIC MEMBERSHIP ENQUIRY */}
        {/* =================================================== */}

        <Route
          path="/libraries/:libraryId/enquiry"
          element={<LibraryEnquiry />}
        />

        {/* =================================================== */}
        {/* PLATFORM PLANS */}
        {/* =================================================== */}

        <Route path="/platform-plans" element={<PlatformPlans />} />

        {/* =================================================== */}
        {/* LIBRARY OWNER INTRO */}
        {/* =================================================== */}

        <Route path="/register-library" element={<LibraryOwnerFeatures />} />

        {/* =================================================== */}
        {/* PUBLIC LIBRARY REGISTRATION */}
        {/* =================================================== */}

        <Route path="/register-library/start" element={<RegisterLibrary />} />

        {/* =================================================== */}
        {/* AUTHENTICATION OVER HOME */}
        {/* =================================================== */}

        <Route element={<PublicRoute />}>
          {/* =============================================== */}
          {/* LOGIN */}
          {/* =============================================== */}

          <Route path="/login" element={<LoginOverlay />} />

          {/* =============================================== */}
          {/* REGISTER */}
          {/* =============================================== */}

          <Route path="/register" element={<RegisterOverlay />} />

          {/* =============================================== */}
          {/* LEGACY WHATSAPP LOGIN */}
          {/* =============================================== */}
          {/* WhatsApp login is now inside Login.jsx. */}
          {/* Keep old URL compatibility. */}

          <Route path="/whatsapp-login" element={<LoginOverlay />} />
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* PROTECTED APPLICATION */}
      {/* ===================================================== */}

      <Route element={<ProtectedRoute />}>
        {/* =================================================== */}
        {/* DASHBOARD ROLE DISPATCHER */}
        {/* =================================================== */}

        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* =================================================== */}
        {/* ADMIN + LIBRARY OWNER */}
        {/* =================================================== */}

        <Route element={<VerticalLayout />}>
          {/* ================================================= */}
          {/* ADMIN */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            {adminRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* ================================================= */}
          {/* LIBRARY OWNER */}
          {/* ================================================= */}

          <Route element={<RoleRoute allowedRoles={["LIBRARY_OWNER"]} />}>
            {/* =============================================== */}
            {/* CORE OWNER ROUTES */}
            {/* =============================================== */}

            {ownerRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* =============================================== */}
            {/* REPORT ROUTES */}
            {/* =============================================== */}

            {reportRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* =============================================== */}
            {/* MEMBERSHIP ENQUIRIES */}
            {/* =============================================== */}

            <Route path="/owner/enquiries" element={<LibraryEnquiries />} />

            {/* =============================================== */}
            {/* AUTOMATION CENTER */}
            {/* =============================================== */}

            <Route path="/owner/automation" element={<AutomationCenter />} />

            {/* =============================================== */}
            {/* OWNER NOTIFICATIONS */}
            {/* =============================================== */}

            <Route path="/owner/notifications" element={<Notifications />} />

            {/* =============================================== */}
            {/* OWNER SETTINGS */}
            {/* =============================================== */}

            <Route path="/owner/settings" element={<Settings />} />

            {/* =============================================== */}
            {/* SEAT CHANGE REQUESTS */}
            {/* =============================================== */}

            <Route
              path="/owner/seat-change-requests"
              element={<SeatChangeRequests />}
            />

            {/* =============================================== */}
            {/* COUPONS */}
            {/* =============================================== */}

            <Route path="/owner/coupons" element={<Coupons />} />

            {/* =============================================== */}
            {/* PLATFORM SUBSCRIPTION / BILLING */}
            {/* =============================================== */}

            <Route
              path="/owner/subscription"
              element={<SubscriptionBilling />}
            />
          </Route>
        </Route>

        {/* =================================================== */}
        {/* STUDENT / MEMBER APPLICATION */}
        {/* =================================================== */}

        <Route element={<RoleRoute allowedRoles={["USER"]} />}>
          <Route element={<StudentLayout />}>
            {/* =============================================== */}
            {/* STUDENT ROUTES */}
            {/* =============================================== */}

            {studentRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* =============================================== */}
            {/* LEGACY BOOKING ROUTES */}
            {/* =============================================== */}

            {bookingRoutes.map((route) => (
              <Route
                key={`booking-${route.path}`}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* =============================================== */}
            {/* LEGACY MEMBERSHIP PAYMENT SUCCESS */}
            {/* =============================================== */}

            <Route
              path="/member/membership/payment-success"
              element={<MembershipPaymentSuccess />}
            />
          </Route>
        </Route>
      </Route>

      {/* ===================================================== */}
      {/* FALLBACK */}
      {/* ===================================================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
