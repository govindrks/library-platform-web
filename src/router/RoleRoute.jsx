import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useSelector } from "react-redux";

/**
 * Route guard responsible for role-based authorization.
 *
 * Authentication itself is handled by ProtectedRoute.
 *
 * RoleRoute only verifies that the authenticated user's role
 * is allowed to access the nested route.
 *
 * Example:
 *
 * <Route
 *     element={
 *         <RoleRoute
 *             allowedRoles={["LIBRARY_OWNER"]}
 *         />
 *     }
 * >
 *     ...
 * </Route>
 */
function RoleRoute({
    allowedRoles = [],
}) {

    // =========================================================
    // AUTHENTICATED USER FROM REDUX
    // =========================================================

    const user = useSelector(
        (state) => state.auth.user
    );

    const role = user?.role;


    // =========================================================
    // USER INFORMATION NOT AVAILABLE
    // =========================================================
    //
    // Normally ProtectedRoute should handle unauthenticated
    // users before RoleRoute is reached.
    //
    // This remains as a safety fallback.
    // =========================================================

    if (!role) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    // =========================================================
    // ROLE AUTHORIZATION
    // =========================================================

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
    ) {

        /*
         * Redirect to the generic dashboard dispatcher.
         *
         * /dashboard will examine the user's actual role and
         * send them to the appropriate dashboard:
         *
         * LIBRARY_OWNER -> /owner/dashboard
         * USER          -> /student/dashboard
         * ADMIN         -> /admin/dashboard
         */

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    // =========================================================
    // AUTHORIZED
    // =========================================================

    return <Outlet />;
}

export default RoleRoute;