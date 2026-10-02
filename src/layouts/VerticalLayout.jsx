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
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "background.default",
                overflowX: "hidden",
            }}
        >

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={handleMobileClose}
            />


            {/* =========================================
                HEADER
            ========================================= */}

            <Header
                onMenuClick={handleMenuClick}
            />


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <Box
                component="main"
                sx={{
                    width: {
                        xs: "100%",
                        md: `calc(100% - ${drawerWidth}px)`,
                    },

                    marginLeft: {
                        xs: 0,
                        md: `${drawerWidth}px`,
                    },

                    minHeight: "100vh",

                    boxSizing: "border-box",

                    pt: "72px",

                    overflowX: "hidden",
                }}
            >

                <Box
                    sx={{
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",

                        p: {
                            xs: 1.5,
                            sm: 2,
                            md: 2.5,
                            lg: 3,
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