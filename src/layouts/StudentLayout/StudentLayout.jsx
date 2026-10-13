import {
  Box,
  Toolbar,
} from "@mui/material";

import {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import StudentSidebar, {
  drawerWidth,
} from "./StudentSidebar";

import StudentTopbar
  from "./StudentTopbar";


function StudentLayout() {
  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  const handleMenuClick =
    () => {
      setMobileOpen(
        (previous) =>
          !previous
      );
    };


  const handleMobileClose =
    () => {
      setMobileOpen(
        false
      );
    };


  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor:
          "background.default",
      }}
    >
      {/* STUDENT SIDEBAR */}

      <StudentSidebar
        mobileOpen={
          mobileOpen
        }
        onMobileClose={
          handleMobileClose
        }
      />


      {/* STUDENT TOPBAR */}

      <StudentTopbar
        onMenuClick={
          handleMenuClick
        }
      />


      {/* PAGE CONTENT */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            md:
              `calc(100% - ${drawerWidth}px)`,
          },

          minWidth: 0,

          p: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
        }}
      >
        {/*
         * Creates the same vertical space as
         * the fixed StudentTopbar.
         */}
        <Toolbar
          sx={{
            minHeight:
              "76px !important",
          }}
        />

        <Outlet />
      </Box>
    </Box>
  );
}

export default StudentLayout;