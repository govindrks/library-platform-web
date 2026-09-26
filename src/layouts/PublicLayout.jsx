import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import PublicHeader from "../views/Public/components/PublicHeader";

function PublicLayout() {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "background.default",
            }}
        >
            <PublicHeader />

            <Box component="main">
                <Outlet />
            </Box>
        </Box>
    );
}

export default PublicLayout;