import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

// ============================================================
// LAYOUTS
// ============================================================

import PublicLayout from "../layouts/PublicLayout";
import VerticalLayout from "../layouts/VerticalLayout";

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
import PlatformPlans from "../views/Public/PlatformPlans";

// ============================================================
// AUTH
// ============================================================

import Login from "../views/Auth/Login";
import Register from "../views/Auth/Register";

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

// ============================================================
// STUDENT / MEMBER
// ============================================================

import MembershipPaymentSuccess
    from "../views/Student/Membership/MembershipPaymentSuccess";

// ============================================================
// ROUTE GROUPS
// ============================================================

import ownerRoutes from "./routes/Owner";
import bookingRoutes from "./routes/Booking";
import reportRoutes from "./routes/Reports";

// ============================================================
// DASHBOARD ROLE DISPATCHER
// ============================================================

import DashboardRedirect from "./routes/Dashboard";

// ============================================================
// APP ROUTER
// ============================================================

function AppRouter() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =================================================
                    PUBLIC APPLICATION
                ================================================== */}

                <Route element={<PublicLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/libraries"
                        element={<LibraryList />}
                    />

                    <Route
                        path="/libraries/:libraryId"
                        element={<LibraryDetails />}
                    />

                    <Route
                        path="/libraries/:libraryId/seats"
                        element={<SeatAvailability />}
                    />

                    <Route
                        path="/platform-plans"
                        element={<PlatformPlans />}
                    />

                    {/*
                     * Registration starts publicly because Step 1
                     * creates the LIBRARY_OWNER account.
                     *
                     * After Step 1, the JWT is used by the remaining
                     * onboarding API calls.
                     */}
                    <Route
                        path="/register-library"
                        element={<RegisterLibrary />}
                    />

                </Route>


                {/* =================================================
                    AUTHENTICATION
                ================================================== */}

                <Route element={<PublicRoute />}>

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                </Route>


                {/* =================================================
                    PROTECTED APPLICATION
                ================================================== */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<VerticalLayout />}>

                        {/* =========================================
                            DASHBOARD ROLE DISPATCHER
                        ========================================== */}

                        <Route
                            path="/dashboard"
                            element={<DashboardRedirect />}
                        />


                        {/* =========================================
                            STUDENT / USER ROUTES
                        ========================================== */}

                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={["USER"]}
                                />
                            }
                        >

                            {bookingRoutes.map((route) => (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={route.element}
                                />
                            ))}

                            <Route
                                path="/member/membership/payment-success"
                                element={
                                    <MembershipPaymentSuccess />
                                }
                            />

                        </Route>


                        {/* =========================================
                            LIBRARY OWNER ROUTES
                        ========================================== */}

                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={[
                                        "LIBRARY_OWNER",
                                    ]}
                                />
                            }
                        >

                            {/* -------------------------------------
                                CORE OWNER ROUTES
                            -------------------------------------- */}

                            {ownerRoutes.map((route) => (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={route.element}
                                />
                            ))}


                            {/* -------------------------------------
                                REPORTS
                            -------------------------------------- */}

                            {reportRoutes.map((route) => (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={route.element}
                                />
                            ))}


                            {/* -------------------------------------
                                AUTOMATION CENTER
                            -------------------------------------- */}

                            <Route
                                path="/owner/automation"
                                element={
                                    <AutomationCenter />
                                }
                            />


                            {/* -------------------------------------
                                NOTIFICATIONS
                            -------------------------------------- */}

                            <Route
                                path="/owner/notifications"
                                element={
                                    <Notifications />
                                }
                            />


                            {/* -------------------------------------
                                SETTINGS
                            -------------------------------------- */}

                            <Route
                                path="/owner/settings"
                                element={
                                    <Settings />
                                }
                            />


                            {/* -------------------------------------
                                SEAT CHANGE REQUESTS
                            -------------------------------------- */}

                            <Route
                                path="/owner/seat-change-requests"
                                element={
                                    <SeatChangeRequests />
                                }
                            />


                            {/* -------------------------------------
                                COUPONS
                            -------------------------------------- */}

                            <Route
                                path="/owner/coupons"
                                element={
                                    <Coupons />
                                }
                            />


                            {/* -------------------------------------
                                PLATFORM SUBSCRIPTION / BILLING
                            -------------------------------------- */}

                            <Route
                                path="/owner/subscription"
                                element={
                                    <SubscriptionBilling />
                                }
                            />

                        </Route>

                    </Route>

                </Route>


                {/* =================================================
                    FALLBACK
                ================================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default AppRouter;