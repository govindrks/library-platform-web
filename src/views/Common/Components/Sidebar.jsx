import {
  CalendarMonth,
  CardMembership,
  Dashboard,
  LibraryBooks,
  Notifications,
  Payments,
  Person,
  ReceiptLong,
} from "@mui/icons-material";

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import { useLocation, useNavigate } from "react-router-dom";

import ownerMenu from "../../../navigation/ownerMenu";

import adminMenu from "../../../navigation/adminMenu";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// CONSTANTS
// ============================================================

const drawerWidth = 250;

// ============================================================
// STUDENT MENU
// ============================================================

/**
 * Shared Sidebar normally serves ADMIN / LIBRARY_OWNER through
 * VerticalLayout.
 *
 * USER currently uses StudentLayout + StudentSidebar.
 *
 * We still keep this USER menu valid as a safe fallback in case
 * Sidebar is ever rendered for a USER.
 */

const userMenu = [
  {
    title: "OVERVIEW",

    items: [
      {
        label: "Dashboard",

        path: "/student/dashboard",

        icon: Dashboard,
      },
    ],
  },

  {
    title: "LIBRARIES",

    items: [
      {
        label: "Browse Libraries",

        path: "/student/libraries",

        icon: LibraryBooks,
      },

      {
        label: "My Bookings",

        path: "/student/bookings",

        icon: CalendarMonth,
      },

      {
        label: "Membership",

        path: "/student/membership",

        icon: CardMembership,
      },
    ],
  },

  {
    title: "FINANCE",

    items: [
      {
        label: "Payments",

        path: "/student/payments",

        icon: Payments,
      },

      {
        label: "Invoices",

        path: "/student/invoices",

        icon: ReceiptLong,
      },
    ],
  },

  {
    title: "ACCOUNT",

    items: [
      {
        label: "Notifications",

        path: "/student/notifications",

        icon: Notifications,
      },

      {
        label: "My Profile",

        path: "/student/profile",

        icon: Person,
      },
    ],
  },
];

// ============================================================
// NORMALIZE OWNER MENU
// ============================================================

/**
 * ownerMenu uses:
 *
 * section
 * items
 *
 * Sidebar expects:
 *
 * title
 * items
 */

const normalizeOwnerMenu = ownerMenu.map((section) => ({
  title: section.section,

  items: section.items,
}));

// ============================================================
// NORMALIZE ADMIN MENU
// ============================================================

const normalizeAdminMenu = adminMenu.map((section) => ({
  title: section.section,

  items: section.items,
}));

// ============================================================
// SIDEBAR
// ============================================================

function Sidebar({ mobileOpen, onMobileClose }) {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { role } = useAuth();

  // ==========================================================
  // SELECT MENU BY ROLE
  // ==========================================================

  let menuSections = userMenu;

  if (role === "LIBRARY_OWNER") {
    menuSections = normalizeOwnerMenu;
  }

  if (role === "ADMIN") {
    menuSections = normalizeAdminMenu;
  }

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNavigation = (path) => {
    if (!path) {
      return;
    }

    navigate(path);

    onMobileClose?.();
  };

  // ==========================================================
  // ACTIVE ROUTE
  // ==========================================================

  const isActive = (path) => {
    if (!path) {
      return false;
    }

    const currentPath = location.pathname;

    // --------------------------------------------------------
    // STUDENT HELP & SUPPORT FALLBACK
    // --------------------------------------------------------
    //
    // Normally USER uses StudentSidebar.
    //
    // Keep this here in case Shared Sidebar is ever used for
    // a student.
    // --------------------------------------------------------

    if (path === "/student/help-support") {
      return (
        currentPath === "/student/help-support" ||
        currentPath.startsWith("/student/help-support/") ||
        currentPath.startsWith("/student/support/tickets/")
      );
    }

    // --------------------------------------------------------
    // ADMIN SUPPORT DASHBOARD
    // --------------------------------------------------------
    //
    // Important:
    //
    // /admin/support should NOT also remain selected when the
    // user opens /admin/support/tickets.
    // --------------------------------------------------------

    if (path === "/admin/support") {
      return currentPath === "/admin/support";
    }

    // --------------------------------------------------------
    // ADMIN SUPPORT TICKETS
    // --------------------------------------------------------

    if (path === "/admin/support/tickets") {
      return (
        currentPath === "/admin/support/tickets" ||
        currentPath.startsWith("/admin/support/tickets/")
      );
    }

    // --------------------------------------------------------
    // OWNER HELP & SUPPORT
    // --------------------------------------------------------
    //
    // Do not keep this selected when navigating to either of
    // the dedicated support queues.
    // --------------------------------------------------------

    if (path === "/owner/help-support") {
      return currentPath === "/owner/help-support";
    }

    // --------------------------------------------------------
    // OWNER -> LIBRARYHUB SUPPORT TICKETS
    // --------------------------------------------------------

    if (path === "/owner/support/tickets") {
      return (
        currentPath === "/owner/support/tickets" ||
        currentPath.startsWith("/owner/support/tickets/")
      );
    }

    // --------------------------------------------------------
    // STUDENT -> LIBRARY OWNER SUPPORT
    // --------------------------------------------------------

    if (path === "/owner/student-support") {
      return (
        currentPath === "/owner/student-support" ||
        currentPath.startsWith("/owner/student-support/")
      );
    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return (
      currentPath === path ||
      (path !== "/" && currentPath.startsWith(`${path}/`))
    );
  };

  // ==========================================================
  // DRAWER CONTENT
  // ==========================================================

  const drawerContent = (
    <Box
      sx={{
        height: "100%",

        display: "flex",

        flexDirection: "column",

        backgroundColor: "background.paper",
      }}
    >
      {/* ===================================================== */}
      {/* LOGO */}
      {/* ===================================================== */}

      <Box
        sx={{
          height: 72,

          display: "flex",

          alignItems: "center",

          px: 2.5,
        }}
      >
        <Box
          sx={{
            width: 38,

            height: 38,

            borderRadius: 2,

            backgroundColor: "primary.main",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: "white",

            fontWeight: 700,

            fontSize: 18,
          }}
        >
          L
        </Box>

        <Box
          sx={{
            ml: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,

              lineHeight: 1.1,
            }}
          >
            LibraryHub
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {role === "ADMIN"
              ? "Platform Administration"
              : role === "LIBRARY_OWNER"
                ? "Library Management"
                : "Member Portal"}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* ===================================================== */}
      {/* NAVIGATION */}
      {/* ===================================================== */}

      <Box
        sx={{
          flex: 1,

          overflowY: "auto",

          px: 1.5,

          py: 2,
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <Box
            key={section.title || sectionIndex}
            sx={{
              mb: 2.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",

                px: 1.5,

                mb: 0.75,

                fontWeight: 700,

                color: "text.secondary",

                letterSpacing: "0.08em",
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const Icon = item.icon;

                const active = isActive(item.path);

                return (
                  <ListItemButton
                    key={`${section.title}-${item.label}-${item.path}`}
                    selected={active}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      minHeight: 42,

                      mb: 0.5,

                      borderRadius: 1.5,

                      px: 1.5,

                      "&.Mui-selected": {
                        backgroundColor: "primary.light",

                        color: "primary.main",
                      },

                      "&.Mui-selected:hover": {
                        backgroundColor: "primary.light",
                      },

                      "&:hover": {
                        backgroundColor: "secondary.light",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 38,

                        color: active ? "primary.main" : "text.secondary",
                      }}
                    >
                      {Icon && <Icon fontSize="small" />}
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",

                        fontWeight: active ? 600 : 500,
                      }}
                    />

                    {/* =================================== */}
                    {/* OPTIONAL BADGE */}
                    {/* =================================== */}

                    {item.badge != null && (
                      <Box
                        sx={{
                          minWidth: 22,

                          height: 22,

                          px: 0.75,

                          borderRadius: 50,

                          backgroundColor: "primary.main",

                          color: "primary.contrastText",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          fontSize: 11,

                          fontWeight: 800,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <Box
        sx={{
          px: 2,

          py: 1.5,

          borderTop: "1px solid",

          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          LibraryHub v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ===================================================== */}
      {/* DESKTOP DRAWER */}
      {/* ===================================================== */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",

            md: "block",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,

            boxSizing: "border-box",

            borderRight: "1px solid",

            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ===================================================== */}
      {/* MOBILE DRAWER */}
      {/* ===================================================== */}

      <Drawer
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",

            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,

            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
