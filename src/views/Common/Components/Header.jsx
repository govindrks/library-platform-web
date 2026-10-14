import {
  ExpandMore,
  Help,
  Logout,
  Menu,
  NotificationsNone,
  Person,
  Search,
  Settings,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Toolbar,
  Tooltip,
  Typography,
  Menu as MuiMenu,
} from "@mui/material";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import { useNotifications } from "../../../context/NotificationContext";

// ============================================================
// CONSTANTS
// ============================================================

const drawerWidth = 250;

// ============================================================
// HELPERS
// ============================================================

const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const formatRole = (role) => {
  if (!role) {
    return "User";
  }

  switch (role) {
    case "ADMIN":
      return "Admin";

    case "LIBRARY_OWNER":
      return "Library Owner";

    case "USER":
      return "Member";

    default:
      return role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

// ============================================================
// COMPONENT
// ============================================================

function Header({ onMenuClick }) {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { user, role, logout } = useAuth();

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const { unreadCount } = useNotifications();

  // ==========================================================
  // USER MENU STATE
  // ==========================================================

  const [anchorEl, setAnchorEl] = useState(null);

  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName = user?.fullName?.trim() || "User";

  const userRole = role || user?.role || null;

  const profileImageUrl = user?.profileImageUrl || "";

  const isAdmin = userRole === "ADMIN";

  const isLibraryOwner = userRole === "LIBRARY_OWNER";

  const isUser = userRole === "USER";

  const userInitials = useMemo(() => getInitials(userName), [userName]);

  const userRoleLabel = useMemo(() => formatRole(userRole), [userRole]);

  const userMenuOpen = Boolean(anchorEl);

  // ==========================================================
  // USER MENU
  // ==========================================================

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const handleNotificationNavigation = () => {
    handleUserMenuClose();

    if (isLibraryOwner) {
      navigate("/owner/notifications");

      return;
    }

    if (isUser) {
      navigate("/student/notifications");

      return;
    }

    /*
     * No /admin/notifications route currently exists.
     *
     * Keep ADMIN inside a valid route instead of allowing the
     * wildcard router to send the user somewhere unexpected.
     */
    if (isAdmin) {
      navigate("/admin/dashboard");

      return;
    }

    navigate("/dashboard");
  };

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const handleSettingsNavigation = () => {
    handleUserMenuClose();

    if (isAdmin) {
      navigate("/admin/settings");

      return;
    }

    if (isLibraryOwner) {
      navigate("/owner/settings");

      return;
    }

    /*
     * There is currently no /student/settings route.
     */
    if (isUser) {
      navigate("/student/profile");

      return;
    }

    navigate("/dashboard");
  };

  // ==========================================================
  // PROFILE
  // ==========================================================

  const handleProfileNavigation = () => {
    handleUserMenuClose();

    if (isUser) {
      navigate("/student/profile");

      return;
    }

    /*
     * Library owner currently has Library Profile rather than a
     * dedicated /owner/profile route.
     */
    if (isLibraryOwner) {
      navigate("/owner/library");

      return;
    }

    /*
     * No dedicated ADMIN profile route currently exists.
     */
    if (isAdmin) {
      navigate("/admin/dashboard");

      return;
    }

    navigate("/dashboard");
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    handleUserMenuClose();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: {
          xs: "100%",

          md: `calc(100% - ${drawerWidth}px)`,
        },

        ml: {
          xs: 0,

          md: `${drawerWidth}px`,
        },

        backgroundColor: "background.paper",

        color: "text.primary",

        borderBottom: "1px solid",

        borderColor: "divider",

        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "72px !important",

          px: {
            xs: 2,

            md: 3,
          },

          gap: 2,
        }}
      >
        {/* =================================================== */}
        {/* MOBILE MENU */}
        {/* =================================================== */}

        <IconButton
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "flex",

              md: "none",
            },
          }}
        >
          <Menu />
        </IconButton>

        {/* =================================================== */}
        {/* ADMIN TITLE */}
        {/* =================================================== */}

        {isAdmin && (
          <Box
            sx={{
              minWidth: {
                xs: "auto",

                sm: 190,
              },
            }}
          >
            <Typography variant="body1" fontWeight={700}>
              Platform Administration
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: {
                  xs: "none",

                  sm: "block",
                },
              }}
            >
              LibraryHub
            </Typography>
          </Box>
        )}

        {/* =================================================== */}
        {/* LIBRARY OWNER LIBRARY SELECTOR */}
        {/* =================================================== */}

        {isLibraryOwner && (
          <Select
            value="main-library"
            variant="standard"
            disableUnderline
            IconComponent={ExpandMore}
            sx={{
              minWidth: 180,

              "& .MuiSelect-select": {
                py: 0.5,

                fontWeight: 600,
              },
            }}
          >
            <MenuItem value="main-library">Main Library</MenuItem>

            <MenuItem value="city-library">City Library</MenuItem>
          </Select>
        )}

        {/* =================================================== */}
        {/* USER TITLE */}
        {/* =================================================== */}

        {isUser && (
          <Box
            sx={{
              minWidth: {
                xs: "auto",

                sm: 150,
              },
            }}
          >
            <Typography variant="body1" fontWeight={700}>
              Member Portal
            </Typography>
          </Box>
        )}

        {/* =================================================== */}
        {/* SEARCH */}
        {/* =================================================== */}

        <Paper
          component="form"
          elevation={0}
          onSubmit={(event) => event.preventDefault()}
          sx={{
            display: {
              xs: "none",

              sm: "flex",
            },

            alignItems: "center",

            width: {
              sm: 240,

              lg: 340,
            },

            height: 40,

            px: 1.5,

            backgroundColor: "background.default",

            border: "1px solid",

            borderColor: "divider",

            borderRadius: 2,
          }}
        >
          <Search
            fontSize="small"
            sx={{
              color: "text.secondary",

              mr: 1,
            }}
          />

          <InputBase
            placeholder={isAdmin ? "Search platform..." : "Search..."}
            sx={{
              flex: 1,

              fontSize: "0.875rem",
            }}
          />
        </Paper>

        <Box
          sx={{
            flex: 1,
          }}
        />

        {/* =================================================== */}
        {/* HELP */}
        {/* =================================================== */}

        <Tooltip title="Help & Documentation">
          <IconButton>
            <Help />
          </IconButton>
        </Tooltip>

        {/* =================================================== */}
        {/* NOTIFICATIONS */}
        {/* =================================================== */}

        <Tooltip
          title={
            unreadCount > 0
              ? `${unreadCount} unread notification${
                  unreadCount === 1 ? "" : "s"
                }`
              : "Notifications"
          }
        >
          <IconButton onClick={handleNotificationNavigation}>
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              invisible={unreadCount <= 0}
            >
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* =================================================== */}
        {/* USER PROFILE */}
        {/* =================================================== */}

        <Box>
          <Box
            onClick={handleUserMenuOpen}
            sx={{
              display: "flex",

              alignItems: "center",

              gap: 1,

              ml: 1,

              cursor: "pointer",

              borderRadius: 2,

              px: 1,

              py: 0.5,

              "&:hover": {
                backgroundColor: "background.default",
              },
            }}
          >
            <Avatar
              src={profileImageUrl || undefined}
              alt={userName}
              sx={{
                width: 36,

                height: 36,

                backgroundColor: "primary.main",

                fontSize: 14,

                fontWeight: 600,
              }}
            >
              {!profileImageUrl ? userInitials : null}
            </Avatar>

            <Box
              sx={{
                display: {
                  xs: "none",

                  sm: "block",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,

                  lineHeight: 1.2,
                }}
              >
                {userName}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {userRoleLabel}
              </Typography>
            </Box>

            <ExpandMore
              fontSize="small"
              sx={{
                color: "text.secondary",

                display: {
                  xs: "none",

                  sm: "block",
                },
              }}
            />
          </Box>

          {/* ================================================= */}
          {/* USER MENU */}
          {/* ================================================= */}

          <MuiMenu
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: "bottom",

              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",

              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleProfileNavigation}>
              <Person
                fontSize="small"
                sx={{
                  mr: 1.5,
                }}
              />
              My Profile
            </MenuItem>

            <MenuItem onClick={handleNotificationNavigation}>
              <NotificationsNone
                fontSize="small"
                sx={{
                  mr: 1.5,
                }}
              />
              Notifications
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 2,

                    color: "error.main",

                    fontWeight: 700,
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Typography>
              )}
            </MenuItem>

            <MenuItem onClick={handleSettingsNavigation}>
              <Settings
                fontSize="small"
                sx={{
                  mr: 1.5,
                }}
              />
              Settings
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <Logout
                fontSize="small"
                sx={{
                  mr: 1.5,
                }}
              />
              Logout
            </MenuItem>
          </MuiMenu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
