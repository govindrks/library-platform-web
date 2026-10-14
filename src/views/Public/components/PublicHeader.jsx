import { KeyboardArrowDown, LocationOn, Menu } from "@mui/icons-material";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// COMPONENT
// ============================================================

function PublicHeader() {
  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { isAuthenticated } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [mobileOpen, setMobileOpen] = useState(false);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigationItems = [
    {
      label: "Home",

      path: "/",
    },

    {
      label: "Search",

      path: "/libraries",
    },

    {
      label: "Libraries",

      path: "/libraries",
    },

    {
      label: "How It Works",

      path: "/how-it-works",
    },

    {
      label: "Membership Plans",

      path: "/membership-plans",
    },

    {
      label: "About",

      path: "/about",
    },
  ];

  // ==========================================================
  // NAVIGATE
  // ==========================================================

  const handleNavigation = (path) => {
    setMobileOpen(false);

    navigate(path);
  };

  // ==========================================================
  // REGISTER LIBRARY
  // ==========================================================

  const handleRegisterLibrary = () => {
    setMobileOpen(false);

    navigate("/register-library");
  };

  // ==========================================================
  // AUTH NAVIGATION
  // ==========================================================

  const handleAuthNavigation = () => {
    setMobileOpen(false);

    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFF",

          color: "#11194B",

          borderBottom: "1px solid #E7EDF5",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 64,

                md: 72,
              },

              gap: 3,
            }}
          >
            {/* ================================================= */}
            {/* MOBILE MENU */}
            {/* ================================================= */}

            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: {
                  xs: "flex",

                  lg: "none",
                },
              }}
            >
              <Menu />
            </IconButton>

            {/* ================================================= */}
            {/* LOGO */}
            {/* ================================================= */}

            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              onClick={() => handleNavigation("/")}
              sx={{
                cursor: "pointer",

                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,

                  height: 40,

                  borderRadius: 1.5,

                  backgroundColor: "#146EF5",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#FFFFFF",

                    fontSize: 24,

                    fontWeight: 900,
                  }}
                >
                  L
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontWeight: 800,

                  fontSize: 24,

                  letterSpacing: "-0.04em",
                }}
              >
                LibraryHub
              </Typography>
            </Stack>

            {/* ================================================= */}
            {/* DESKTOP NAVIGATION */}
            {/* ================================================= */}

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                ml: 4,

                display: {
                  xs: "none",

                  lg: "flex",
                },

                flex: 1,
              }}
            >
              {navigationItems.map((item) => {
                const active = item.path === "/";

                return (
                  <Button
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      minHeight: 72,

                      px: 1.8,

                      borderRadius: 0,

                      color: active ? "#146EF5" : "#273C63",

                      fontWeight: active ? 800 : 600,

                      position: "relative",

                      "&::after": active
                        ? {
                            content: '""',

                            position: "absolute",

                            bottom: 0,

                            left: 12,

                            right: 12,

                            height: 3,

                            borderRadius: "3px 3px 0 0",

                            backgroundColor: "#146EF5",
                          }
                        : {},
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            {/* ================================================= */}
            {/* LOCATION */}
            {/* ================================================= */}

            <Button
              startIcon={<LocationOn />}
              endIcon={<KeyboardArrowDown />}
              sx={{
                display: {
                  xs: "none",

                  md: "flex",
                },

                minWidth: 180,

                height: 44,

                border: "1px solid #E1EAF5",

                borderRadius: 2,

                color: "#172554",

                fontWeight: 700,

                backgroundColor: "#FFFFFF",
              }}
            >
              Bengaluru
            </Button>

            {/* ================================================= */}
            {/* REGISTER LIBRARY */}
            {/* ================================================= */}

            <Button
              variant="outlined"
              onClick={handleRegisterLibrary}
              sx={{
                display: {
                  xs: "none",

                  sm: "inline-flex",
                },

                height: 44,

                borderRadius: 1.5,

                borderColor: "#146EF5",

                color: "#146EF5",

                fontWeight: 700,

                whiteSpace: "nowrap",

                "&:hover": {
                  borderColor: "#075BD3",

                  backgroundColor: "#F1F7FF",
                },
              }}
            >
              Register Your Library
            </Button>

            {/* ================================================= */}
            {/* SIGN IN / DASHBOARD */}
            {/* ================================================= */}

            <Button
              variant="contained"
              onClick={handleAuthNavigation}
              sx={{
                minWidth: 105,

                height: 44,

                borderRadius: 1.5,

                backgroundColor: "#146EF5",

                fontWeight: 700,

                fontSize: 15,

                "&:hover": {
                  backgroundColor: "#075BD3",
                },
              }}
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ===================================================== */}
      {/* MOBILE NAVIGATION */}
      {/* ===================================================== */}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box
          sx={{
            width: 280,

            p: 3,
          }}
        >
          {/* ================================================= */}
          {/* MOBILE HEADER */}
          {/* ================================================= */}

          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box
              sx={{
                width: 36,

                height: 36,

                borderRadius: 1.5,

                backgroundColor: "#146EF5",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  color: "#FFFFFF",

                  fontWeight: 900,

                  fontSize: 21,
                }}
              >
                L
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
              }}
            >
              LibraryHub
            </Typography>
          </Stack>

          <Stack spacing={1}>
            {/* =============================================== */}
            {/* NAVIGATION */}
            {/* =============================================== */}

            {navigationItems.map((item) => (
              <Button
                key={item.label}
                fullWidth
                sx={{
                  justifyContent: "flex-start",

                  py: 1.2,

                  color: "#273C63",

                  fontWeight: 600,
                }}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
              </Button>
            ))}

            <Box
              sx={{
                height: 1,

                backgroundColor: "#E7EDF5",

                my: 1,
              }}
            />

            {/* =============================================== */}
            {/* REGISTER LIBRARY */}
            {/* =============================================== */}

            <Button
              fullWidth
              variant="outlined"
              onClick={handleRegisterLibrary}
              sx={{
                justifyContent: "flex-start",

                py: 1.2,

                borderColor: "#146EF5",

                color: "#146EF5",

                fontWeight: 700,

                "&:hover": {
                  borderColor: "#075BD3",

                  backgroundColor: "#F1F7FF",
                },
              }}
            >
              Register Your Library
            </Button>

            {/* =============================================== */}
            {/* AUTH */}
            {/* =============================================== */}

            <Button
              fullWidth
              variant="contained"
              onClick={handleAuthNavigation}
              sx={{
                justifyContent: "flex-start",

                py: 1.2,

                backgroundColor: "#146EF5",

                fontWeight: 700,

                "&:hover": {
                  backgroundColor: "#075BD3",
                },
              }}
            >
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default PublicHeader;
