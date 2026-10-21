import {
  ApartmentRounded,
  CloseRounded,
  DashboardRounded,
  KeyboardArrowDownRounded,
  LocationOnRounded,
  LoginRounded,
  MenuRounded,
  SearchRounded,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import studentLibraryApi from "../../../api/studentLibraryApi";

// ============================================================
// NAVIGATION
// ============================================================

const navigationItems = [
  {
    label: "Home",
    path: "/",
    exact: true,
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

// ============================================================
// HELPERS
// ============================================================

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

function PublicHeader() {
  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const { isAuthenticated } = useAuth();

  // ==========================================================
  // STATE
  // ==========================================================

  const [mobileOpen, setMobileOpen] = useState(false);

  const [locationAnchor, setLocationAnchor] = useState(null);

  const [cities, setCities] = useState([]);

  const [loadingCities, setLoadingCities] = useState(false);

  // ==========================================================
  // CURRENT CITY
  // ==========================================================

  const currentCity = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return params.get("city") || "All Cities";
  }, [location.search]);

  // ==========================================================
  // ACTIVE ROUTE
  // ==========================================================

  const isActiveRoute = useCallback(
    (item) => {
      if (item.exact) {
        return location.pathname === item.path;
      }

      return (
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
      );
    },
    [location.pathname],
  );

  // ==========================================================
  // LOAD PUBLIC CITIES
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadCities = async () => {
      try {
        setLoadingCities(true);

        const response = await studentLibraryApi.getAll();

        if (!active) {
          return;
        }

        const list = normalizeList(response);

        const uniqueCities = [
          ...new Set(
            list
              .map((library) => String(library?.city || "").trim())
              .filter(Boolean),
          ),
        ].sort((first, second) => first.localeCompare(second));

        setCities(uniqueCities);
      } catch (error) {
        console.error("Unable to load public library cities:", error);

        if (active) {
          setCities([]);
        }
      } finally {
        if (active) {
          setLoadingCities(false);
        }
      }
    };

    loadCities();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation = (path) => {
    setMobileOpen(false);

    navigate(path);
  };

  // ==========================================================
  // LOCATION
  // ==========================================================

  const handleLocationOpen = (event) => {
    setLocationAnchor(event.currentTarget);
  };

  const handleLocationClose = () => {
    setLocationAnchor(null);
  };

  const handleSelectCity = (city) => {
    handleLocationClose();

    setMobileOpen(false);

    if (!city) {
      navigate("/libraries");

      return;
    }

    navigate(`/libraries?city=${encodeURIComponent(city)}`);
  };

  // ==========================================================
  // REGISTER LIBRARY
  // ==========================================================

  const handleRegisterLibrary = () => {
    setMobileOpen(false);

    navigate("/register-library");
  };

  // ==========================================================
  // AUTH
  // ==========================================================

  const handleAuthNavigation = () => {
    setMobileOpen(false);

    navigate(isAuthenticated ? "/dashboard" : "/login");
  };

  // ==========================================================
  // HEADER
  // ==========================================================

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: "text.primary",

          bgcolor: "rgba(255,255,255,.94)",

          backdropFilter: "blur(18px)",

          WebkitBackdropFilter: "blur(18px)",

          borderBottom: "1px solid",

          borderColor: alpha(theme.palette.divider, 0.85),

          boxShadow: "0 8px 28px rgba(15,23,42,.035)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: "72px !important",

              gap: {
                xs: 1,
                lg: 2,
              },
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

                width: 42,

                height: 42,

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              <MenuRounded />
            </IconButton>

            {/* ================================================= */}
            {/* LOGO */}
            {/* ================================================= */}

            <Stack
              direction="row"
              spacing={1.15}
              alignItems="center"
              onClick={() => handleNavigation("/")}
              sx={{
                cursor: "pointer",

                flexShrink: 0,

                mr: {
                  xs: "auto",
                  lg: 1,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 42,

                  height: 42,

                  borderRadius: 2,

                  bgcolor: "primary.main",

                  fontWeight: 900,

                  boxShadow: `0 7px 18px ${alpha(
                    theme.palette.primary.main,
                    0.24,
                  )}`,
                }}
              >
                L
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,

                    fontSize: 23,

                    letterSpacing: "-0.045em",

                    lineHeight: 1,
                  }}
                >
                  Library
                  <Box
                    component="span"
                    sx={{
                      color: "primary.main",
                    }}
                  >
                    Hub
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },

                    mt: 0.35,

                    fontSize: 9.5,

                    letterSpacing: "0.11em",

                    textTransform: "uppercase",

                    color: "text.secondary",

                    fontWeight: 750,
                  }}
                >
                  Study space platform
                </Typography>
              </Box>
            </Stack>

            {/* ================================================= */}
            {/* DESKTOP NAV */}
            {/* ================================================= */}

            <Stack
              direction="row"
              alignItems="stretch"
              sx={{
                display: {
                  xs: "none",
                  lg: "flex",
                },

                flex: 1,

                height: 72,
              }}
            >
              {navigationItems.map((item) => {
                const active = isActiveRoute(item);

                return (
                  <Button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      px: 1.6,

                      minWidth: 0,

                      borderRadius: 0,

                      position: "relative",

                      color: active ? "primary.main" : "text.secondary",

                      fontWeight: active ? 800 : 650,

                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),

                        color: "primary.main",
                      },

                      "&::after": active
                        ? {
                            content: '""',

                            position: "absolute",

                            left: 14,

                            right: 14,

                            bottom: 0,

                            height: 3,

                            borderRadius: "3px 3px 0 0",

                            bgcolor: "primary.main",
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
            {/* CITY SELECTOR */}
            {/* ================================================= */}

            <Button
              startIcon={<LocationOnRounded />}
              endIcon={
                loadingCities ? (
                  <CircularProgress size={14} />
                ) : (
                  <KeyboardArrowDownRounded />
                )
              }
              onClick={handleLocationOpen}
              sx={{
                display: {
                  xs: "none",
                  md: "inline-flex",
                },

                height: 44,

                maxWidth: 175,

                px: 1.5,

                border: "1px solid",

                borderColor: "divider",

                borderRadius: 2.3,

                color: "text.primary",

                bgcolor: "background.paper",

                fontWeight: 700,

                textTransform: "none",

                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.4),

                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  maxWidth: 105,

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: "nowrap",
                }}
              >
                {currentCity}
              </Box>
            </Button>

            <Menu
              anchorEl={locationAnchor}
              open={Boolean(locationAnchor)}
              onClose={handleLocationClose}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,

                    minWidth: 220,

                    maxHeight: 390,

                    borderRadius: 3,

                    border: "1px solid",

                    borderColor: "divider",

                    boxShadow: "0 18px 45px rgba(15,23,42,.13)",
                  },
                },
              }}
            >
              <MenuItem onClick={() => handleSelectCity(null)}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SearchRounded fontSize="small" color="primary" />

                  <Typography fontWeight={700}>All Cities</Typography>
                </Stack>
              </MenuItem>

              <Divider />

              {cities.map((city) => (
                <MenuItem
                  key={city}
                  selected={currentCity === city}
                  onClick={() => handleSelectCity(city)}
                >
                  <LocationOnRounded
                    sx={{
                      mr: 1,

                      fontSize: 18,

                      color: "text.secondary",
                    }}
                  />

                  {city}
                </MenuItem>
              ))}

              {!loadingCities && cities.length === 0 && (
                <MenuItem disabled>No cities available</MenuItem>
              )}
            </Menu>

            {/* ================================================= */}
            {/* REGISTER */}
            {/* ================================================= */}

            <Button
              variant="outlined"
              startIcon={<ApartmentRounded />}
              onClick={handleRegisterLibrary}
              sx={{
                display: {
                  xs: "none",
                  xl: "inline-flex",
                },

                minHeight: 44,

                borderRadius: 2.3,

                px: 1.8,

                fontWeight: 750,

                whiteSpace: "nowrap",
              }}
            >
              Register Library
            </Button>

            {/* ================================================= */}
            {/* AUTH */}
            {/* ================================================= */}

            <Button
              variant="contained"
              startIcon={
                isAuthenticated ? <DashboardRounded /> : <LoginRounded />
              }
              onClick={handleAuthNavigation}
              sx={{
                minHeight: 44,

                px: {
                  xs: 1.5,
                  sm: 2,
                },

                borderRadius: 2.3,

                fontWeight: 800,

                boxShadow: "none",

                whiteSpace: "nowrap",
              }}
            >
              <Box
                component="span"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline",
                  },
                }}
              >
                {isAuthenticated ? "Dashboard" : "Sign In"}
              </Box>

              <Box
                component="span"
                sx={{
                  display: {
                    xs: "inline",
                    sm: "none",
                  },
                }}
              >
                {isAuthenticated ? "Open" : "Login"}
              </Box>
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ====================================================== */}
      {/* MOBILE DRAWER */}
      {/* ====================================================== */}

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: 290,
                sm: 330,
              },

              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Box
          sx={{
            minHeight: "100%",

            display: "flex",

            flexDirection: "column",

            p: 2.5,
          }}
        >
          {/* ================================================== */}
          {/* DRAWER HEADER */}
          {/* ================================================== */}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  width: 39,

                  height: 39,

                  borderRadius: 2,

                  bgcolor: "primary.main",

                  fontWeight: 900,
                }}
              >
                L
              </Avatar>

              <Typography variant="h6" fontWeight={900}>
                Library
                <Box component="span" color="primary.main">
                  Hub
                </Box>
              </Typography>
            </Stack>

            <IconButton onClick={() => setMobileOpen(false)} size="small">
              <CloseRounded />
            </IconButton>
          </Stack>

          {/* ================================================== */}
          {/* MOBILE LOCATION */}
          {/* ================================================== */}

          <Box
            sx={{
              p: 1.6,

              mb: 2.5,

              borderRadius: 3,

              bgcolor: alpha(theme.palette.primary.main, 0.055),

              border: "1px solid",

              borderColor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              DISCOVER LIBRARIES IN
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.8} mt={0.5}>
              <LocationOnRounded color="primary" fontSize="small" />

              <Typography fontWeight={800}>{currentCity}</Typography>
            </Stack>
          </Box>

          {/* ================================================== */}
          {/* MOBILE NAV */}
          {/* ================================================== */}

          <Stack spacing={0.6}>
            {navigationItems.map((item) => {
              const active = isActiveRoute(item);

              return (
                <Button
                  key={item.path}
                  fullWidth
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 46,

                    px: 1.6,

                    justifyContent: "flex-start",

                    borderRadius: 2.2,

                    color: active ? "primary.main" : "text.primary",

                    bgcolor: active
                      ? alpha(theme.palette.primary.main, 0.075)
                      : "transparent",

                    fontWeight: active ? 800 : 650,

                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Divider
            sx={{
              my: 2.5,
            }}
          />

          {/* ================================================== */}
          {/* CITY LIST MOBILE */}
          {/* ================================================== */}

          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={750}
            mb={1}
          >
            POPULAR LOCATIONS
          </Typography>

          <Stack spacing={0.4}>
            <Button
              startIcon={<SearchRounded />}
              onClick={() => handleSelectCity(null)}
              sx={{
                justifyContent: "flex-start",

                borderRadius: 2,

                color: "text.secondary",
              }}
            >
              All Cities
            </Button>

            {cities.slice(0, 6).map((city) => (
              <Button
                key={city}
                startIcon={<LocationOnRounded />}
                onClick={() => handleSelectCity(city)}
                sx={{
                  justifyContent: "flex-start",

                  borderRadius: 2,

                  color:
                    currentCity === city ? "primary.main" : "text.secondary",

                  fontWeight: currentCity === city ? 800 : 600,
                }}
              >
                {city}
              </Button>
            ))}
          </Stack>

          {/* push actions down */}

          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          <Divider
            sx={{
              my: 2.5,
            }}
          />

          {/* ================================================== */}
          {/* MOBILE ACTIONS */}
          {/* ================================================== */}

          <Stack spacing={1.2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ApartmentRounded />}
              onClick={handleRegisterLibrary}
              sx={{
                minHeight: 48,

                borderRadius: 2.5,

                fontWeight: 750,
              }}
            >
              Register Your Library
            </Button>

            <Button
              fullWidth
              variant="contained"
              startIcon={
                isAuthenticated ? <DashboardRounded /> : <LoginRounded />
              }
              onClick={handleAuthNavigation}
              sx={{
                minHeight: 48,

                borderRadius: 2.5,

                fontWeight: 800,

                boxShadow: "none",
              }}
            >
              {isAuthenticated ? "Open Dashboard" : "Sign In"}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default PublicHeader;
