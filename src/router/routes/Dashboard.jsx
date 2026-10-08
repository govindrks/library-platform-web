import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Central dashboard dispatcher.
 *
 * Redirects authenticated users to the dashboard
 * that belongs to their role.
 */
function DashboardRedirect() {

    const user = useSelector(
        (state) => state.auth.user
    );

    const role = user?.role;


    // =========================================================
    // NOT AUTHENTICATED
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
    // LIBRARY OWNER
    // =========================================================

    if (role === "LIBRARY_OWNER") {
        return (
            <Navigate
                to="/owner/dashboard"
                replace
            />
        );
    }


    // =========================================================
    // STUDENT / USER
    // =========================================================

    if (role === "USER") {
        return (
            <Navigate
                to="/student/dashboard"
                replace
            />
        );
    }


    // =========================================================
    // PLATFORM ADMIN
    // =========================================================

    if (role === "ADMIN") {
        return (
            <Navigate
                to="/admin/dashboard"
                replace
            />
        );
    }


    // =========================================================
    // UNKNOWN ROLE
    // =========================================================

    return (
        <Navigate
            to="/"
            replace
        />
    );
}

export default DashboardRedirect;