import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


// ============================================================
// LAYOUTS
// ============================================================

import PublicLayout
  from "../layouts/PublicLayout";

import VerticalLayout
  from "../layouts/VerticalLayout";

import StudentLayout
  from "../layouts/StudentLayout/StudentLayout";


// ============================================================
// GUARDS
// ============================================================

import ProtectedRoute
  from "./ProtectedRoute";

import PublicRoute
  from "./PublicRoute";

import RoleRoute
  from "./RoleRoute";


// ============================================================
// PUBLIC PAGES
// ============================================================

import Home
  from "../views/Public/Home";

import LibraryList
  from "../views/Public/LibraryList";

import LibraryDetails
  from "../views/Public/LibraryDetails";

import SeatAvailability
  from "../views/Public/SeatAvailability";

import PlatformPlans
  from "../views/Public/PlatformPlans";


// ============================================================
// AUTH
// ============================================================

import Login
  from "../views/Auth/Login";

import Register
  from "../views/Auth/Register";


// ============================================================
// COMMON
// ============================================================

import Maintenance
  from "../views/Common/Maintenance";


// ============================================================
// LIBRARY OWNER
// ============================================================

import RegisterLibrary
  from "../views/LibraryOwner/RegisterLibrary";

import SeatChangeRequests
  from "../views/LibraryOwner/SeatChangeRequests";

import SubscriptionBilling
  from "../views/LibraryOwner/SubscriptionBilling";

import AutomationCenter
  from "../views/LibraryOwner/AutomationCenter";

import Notifications
  from "../views/LibraryOwner/Notifications";

import Settings
  from "../views/LibraryOwner/Settings";

import Coupons
  from "../views/LibraryOwner/Coupons";


// ============================================================
// STUDENT / MEMBER
// ============================================================

import MembershipPaymentSuccess
  from "../views/Student/Membership/MembershipPaymentSuccess";


// ============================================================
// ROUTE GROUPS
// ============================================================

import adminRoutes
  from "./routes/Admin";

import ownerRoutes
  from "./routes/Owner";

import studentRoutes
  from "./routes/StudentRoutes";

import bookingRoutes
  from "./routes/Booking";

import reportRoutes
  from "./routes/Reports";


// ============================================================
// DASHBOARD ROLE DISPATCHER
// ============================================================

import DashboardRedirect
  from "./routes/Dashboard";


// ============================================================
// APP ROUTER
// ============================================================

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ====================================================
            MAINTENANCE
        ==================================================== */}

        <Route
          path="/maintenance"
          element={
            <Maintenance />
          }
        />


        {/* ====================================================
            PUBLIC APPLICATION
        ==================================================== */}

        <Route
          element={
            <PublicLayout />
          }
        >
          <Route
            path="/"
            element={
              <Home />
            }
          />

          <Route
            path="/libraries"
            element={
              <LibraryList />
            }
          />

          <Route
            path="/libraries/:libraryId"
            element={
              <LibraryDetails />
            }
          />

          <Route
            path="/libraries/:libraryId/seats"
            element={
              <SeatAvailability />
            }
          />

          <Route
            path="/platform-plans"
            element={
              <PlatformPlans />
            }
          />


          {/*
           * Registration starts publicly because
           * Step 1 creates the LIBRARY_OWNER account.
           *
           * After Step 1, JWT is used by the remaining
           * onboarding API calls.
           */}

          <Route
            path="/register-library"
            element={
              <RegisterLibrary />
            }
          />
        </Route>


        {/* ====================================================
            AUTHENTICATION
        ==================================================== */}

        <Route
          element={
            <PublicRoute />
          }
        >
          <Route
            path="/login"
            element={
              <Login />
            }
          />

          <Route
            path="/register"
            element={
              <Register />
            }
          />
        </Route>


        {/* ====================================================
            PROTECTED APPLICATION
        ==================================================== */}

        <Route
          element={
            <ProtectedRoute />
          }
        >

          {/* ==================================================
              DASHBOARD ROLE DISPATCHER

              /dashboard
                  ADMIN
                      -> /admin/dashboard

                  LIBRARY_OWNER
                      -> /owner/dashboard

                  USER
                      -> /student/dashboard
          ================================================== */}

          <Route
            path="/dashboard"
            element={
              <DashboardRedirect />
            }
          />


          {/* ==================================================
              ADMIN + LIBRARY OWNER APPLICATION

              Uses:
              VerticalLayout
          ================================================== */}

          <Route
            element={
              <VerticalLayout />
            }
          >

            {/* ================================================
                ADMIN ROUTES
            ================================================ */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "ADMIN",
                  ]}
                />
              }
            >
              {adminRoutes.map(
                (route) => (
                  <Route
                    key={
                      route.path
                    }
                    path={
                      route.path
                    }
                    element={
                      route.element
                    }
                  />
                )
              )}
            </Route>


            {/* ================================================
                LIBRARY OWNER ROUTES
            ================================================ */}

            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "LIBRARY_OWNER",
                  ]}
                />
              }
            >

              {/* ----------------------------------------------
                  CORE OWNER ROUTES
              ---------------------------------------------- */}

              {ownerRoutes.map(
                (route) => (
                  <Route
                    key={
                      route.path
                    }
                    path={
                      route.path
                    }
                    element={
                      route.element
                    }
                  />
                )
              )}


              {/* ----------------------------------------------
                  REPORT ROUTES
              ---------------------------------------------- */}

              {reportRoutes.map(
                (route) => (
                  <Route
                    key={
                      route.path
                    }
                    path={
                      route.path
                    }
                    element={
                      route.element
                    }
                  />
                )
              )}


              {/* ----------------------------------------------
                  AUTOMATION CENTER
              ---------------------------------------------- */}

              <Route
                path="/owner/automation"
                element={
                  <AutomationCenter />
                }
              />


              {/* ----------------------------------------------
                  OWNER NOTIFICATIONS
              ---------------------------------------------- */}

              <Route
                path="/owner/notifications"
                element={
                  <Notifications />
                }
              />


              {/* ----------------------------------------------
                  OWNER SETTINGS
              ---------------------------------------------- */}

              <Route
                path="/owner/settings"
                element={
                  <Settings />
                }
              />


              {/* ----------------------------------------------
                  SEAT CHANGE REQUESTS
              ---------------------------------------------- */}

              <Route
                path="/owner/seat-change-requests"
                element={
                  <SeatChangeRequests />
                }
              />


              {/* ----------------------------------------------
                  COUPONS
              ---------------------------------------------- */}

              <Route
                path="/owner/coupons"
                element={
                  <Coupons />
                }
              />


              {/* ----------------------------------------------
                  PLATFORM SUBSCRIPTION / BILLING
              ---------------------------------------------- */}

              <Route
                path="/owner/subscription"
                element={
                  <SubscriptionBilling />
                }
              />

            </Route>

          </Route>


          {/* ==================================================
              STUDENT / MEMBER APPLICATION

              IMPORTANT:

              USER no longer uses VerticalLayout.

              USER
                  -> StudentLayout
                  -> StudentSidebar
                  -> StudentTopbar
                  -> Student pages
          ================================================== */}

          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "USER",
                ]}
              />
            }
          >
            <Route
              element={
                <StudentLayout />
              }
            >

              {/* ----------------------------------------------
                  NEW STUDENT ROUTES
              ---------------------------------------------- */}

              {studentRoutes.map(
                (route) => (
                  <Route
                    key={
                      route.path
                    }
                    path={
                      route.path
                    }
                    element={
                      route.element
                    }
                  />
                )
              )}


              {/* ----------------------------------------------
                  EXISTING / LEGACY BOOKING ROUTES

                  Keep temporarily so existing student booking
                  pages are not broken during migration.
              ---------------------------------------------- */}

              {bookingRoutes.map(
                (route) => (
                  <Route
                    key={
                      `booking-${route.path}`
                    }
                    path={
                      route.path
                    }
                    element={
                      route.element
                    }
                  />
                )
              )}


              {/* ----------------------------------------------
                  LEGACY MEMBERSHIP PAYMENT SUCCESS

                  Keep while older payment flow still references:
                  /member/membership/payment-success
              ---------------------------------------------- */}

              <Route
                path="/member/membership/payment-success"
                element={
                  <MembershipPaymentSuccess />
                }
              />

            </Route>
          </Route>

        </Route>


        {/* ====================================================
            FALLBACK
        ==================================================== */}

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