import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import VerticalLayout from "../layouts/VerticalLayout";
import Dashboard from "../views/Dashboard/Dashboard";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
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