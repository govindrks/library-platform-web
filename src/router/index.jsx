import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import VerticalLayout from "../layouts/VerticalLayout";

import Dashboard from "../views/Dashboard/Dashboard";
import Login from "../views/Auth/Login";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Authentication */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Application */}
                <Route element={<VerticalLayout />}>
                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="*"
                        element={<Dashboard />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;