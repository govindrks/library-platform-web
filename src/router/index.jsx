import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import VerticalLayout from "../layouts/VerticalLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

// Public pages
import Home from "../views/Public/Home";
import LibraryList from "../views/Public/LibraryList";
import LibraryDetails from "../views/Public/LibraryDetails";
import SeatAvailability from "../views/Public/SeatAvailability";

// Auth
import Login from "../views/Auth/Login";
import Register from "../views/Auth/Register";

// Library Owner
import RegisterLibrary from "../views/LibraryOwner/RegisterLibrary";

// Routes
import reportRoutes from "./routes/Reports";

// Dashboard
import Dashboard from "../views/Dashboard/Dashboard";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =====================================================
                    PUBLIC
                ====================================================== */}

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

                    {/* Register Your Library */}
                    <Route
                        path="/register-library"
                        element={<RegisterLibrary />}
                    />

                </Route>


                {/* =====================================================
                    AUTH
                ====================================================== */}

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


                {/* =====================================================
                    PROTECTED APPLICATION
                ====================================================== */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<VerticalLayout />}>

                        {/* -----------------------------
                            COMMON AUTHENTICATED ROUTES
                        ------------------------------ */}

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />


                        {/* -----------------------------
                            LIBRARY OWNER ROUTES
                        ------------------------------ */}

                        <Route
                            element={
                                <RoleRoute
                                    allowedRoles={["LIBRARY_OWNER"]}
                                />
                            }
                        >

                            {reportRoutes.map((route) => (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={route.element}
                                />
                            ))}

                        </Route>

                    </Route>

                </Route>


                {/* =====================================================
                    FALLBACK
                ====================================================== */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;