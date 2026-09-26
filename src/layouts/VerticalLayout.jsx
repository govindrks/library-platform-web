import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../views/Common/Components/Header";
import Sidebar from "../views/Common/Components/Sidebar";

const drawerWidth = 250;

function VerticalLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleMenuClick = () => {
        setMobileOpen(true);
    };

    const handleMobileClose = () => {
        setMobileOpen(false);
    };

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "background.default",
            }}
        >
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={handleMobileClose}
            />

            <Header onMenuClick={handleMenuClick} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },
                    minHeight: "100vh",
                    pt: "72px",
                }}
            >
                <Box
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                            lg: 4,
                        },
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}

export default VerticalLayout;