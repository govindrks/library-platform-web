import {
  HelpOutlineOutlined,
  Logout,
  Menu as MenuIcon,
  NotificationsNone,
  Person,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { useNotifications } from "../../context/NotificationContext";

import { drawerWidth } from "./StudentSidebar";

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

// ============================================================
// COMPONENT
// ============================================================

function StudentTopbar({ onMenuClick }) {
  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { user, logout } = useAuth();

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const { unreadCount } = useNotifications();

  // ==========================================================
  // ACCOUNT MENU
  // ==========================================================

  const [anchorEl, setAnchorEl] = useState(null);

  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName = user?.fullName?.trim() || "Member";

  const profileImageUrl = user?.profileImageUrl || "";

  const initials = useMemo(() => getInitials(userName), [userName]);

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
  // NOTIFICATION NAVIGATION
  // ==========================================================

  const handleNotificationNavigation = () => {
    navigate("/student/notifications");
  };

  // ==========================================================
  // PROFILE NAVIGATION
  // ==========================================================

  const handleProfileNavigation = () => {
    handleUserMenuClose();

    navigate("/student/profile");
  };

  // ==========================================================
  // MENU NOTIFICATION NAVIGATION
  // ==========================================================

  const handleMenuNotificationNavigation = () => {
    handleUserMenuClose();

    handleNotificationNavigation();
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    handleUserMenuClose();

    logout();

    navigate("/login", {
      replace: true,

      state: {
        message: "You have been signed out successfully.",
      },
    });
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        width: {
          md: `calc(100% - ${drawerWidth}px)`,
        },

        ml: {
          md: `${drawerWidth}px`,
        },

        borderBottom: "1px solid",

        borderColor: "divider",

        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "76px !important",

          px: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {/* =================================================== */}
        {/* MOBILE MENU */}
        {/* =================================================== */}

        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          sx={{
            mr: 1,

            display: {
              md: "none",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* =================================================== */}
        {/* TITLE */}
        {/* =================================================== */}

        <Typography variant="h6" fontWeight={700}>
          Member Portal
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
          }}
        />

        {/* =================================================== */}
        {/* HELP */}
        {/* =================================================== */}

        <Tooltip title="Help & Support">
          <IconButton
            aria-label="Help and support"
            onClick={() => navigate("/student/help")}
          >
            <HelpOutlineOutlined />
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
          <IconButton
            aria-label="Notifications"
            onClick={handleNotificationNavigation}
            sx={{
              ml: 0.5,
            }}
          >
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

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 2,
            my: 2,
          }}
        />

        {/* =================================================== */}
        {/* USER */}
        {/* =================================================== */}

        <Box
          onClick={handleUserMenuOpen}
          role="button"
          tabIndex={0}
          aria-label="Open account menu"
          sx={{
            display: "flex",

            alignItems: "center",

            gap: 1.25,

            cursor: "pointer",
          }}
        >
          <Avatar
            src={profileImageUrl || undefined}
            alt={userName}
            sx={{
              width: 40,

              height: 40,

              bgcolor: "primary.main",

              color: "primary.contrastText",

              fontWeight: 700,
            }}
          >
            {!profileImageUrl ? initials : null}
          </Avatar>

          <Box
            sx={{
              display: {
                xs: "none",

                sm: "block",
              },
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              {userName}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Member
            </Typography>
          </Box>
        </Box>

        {/* =================================================== */}
        {/* ACCOUNT MENU */}
        {/* =================================================== */}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
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
          {/* PROFILE */}

          <MenuItem onClick={handleProfileNavigation}>
            <Person
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />
            My Profile
          </MenuItem>

          {/* NOTIFICATIONS */}

          <MenuItem onClick={handleMenuNotificationNavigation}>
            <NotificationsNone
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />

            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                width: "100%",
              }}
            >
              Notifications
              <Box
                sx={{
                  flexGrow: 1,
                }}
              />
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 2,

                    fontWeight: 700,

                    color: "error.main",
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Typography>
              )}
            </Box>
          </MenuItem>

          <Divider />

          {/* LOGOUT */}

          <MenuItem onClick={handleLogout}>
            <Logout
              fontSize="small"
              sx={{
                mr: 1.5,
              }}
            />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default StudentTopbar;
