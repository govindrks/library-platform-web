import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleRoute({ allowedRoles = [] }) {
    const user = useSelector(
        (state) => state.auth.user
    );

    const role = user?.role;

    if (!role) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return <Outlet />;
}

export default RoleRoute;