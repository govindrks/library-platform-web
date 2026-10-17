import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import studentMenu from "./studentMenu";


// ============================================================
// CONSTANTS
// ============================================================

const drawerWidth = 260;


// ============================================================
// STUDENT SIDEBAR
// ============================================================

function StudentSidebar({
  mobileOpen,
  onMobileClose,
}) {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();


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
    const currentPath =
      location.pathname;


    // ------------------------------------------------------
    // DASHBOARD
    // ------------------------------------------------------

    if (
      path ===
      "/student/dashboard"
    ) {
      return (
        currentPath ===
        "/student/dashboard"
      );
    }


    // ------------------------------------------------------
    // BROWSE LIBRARIES
    // ------------------------------------------------------
    //
    // This should remain active on:
    //
    // /student/libraries
    // /student/libraries/3
    // /student/libraries/3/plans
    //
    // but NOT for the dedicated Find Seats menu item if
    // that menu item later receives its own route.
    // ------------------------------------------------------

    if (
      path ===
      "/student/libraries"
    ) {
      return (
        currentPath ===
          "/student/libraries" ||
        currentPath.startsWith(
          "/student/libraries/",
        )
      );
    }


    // ------------------------------------------------------
    // MEMBERSHIP
    // ------------------------------------------------------

    if (
      path ===
      "/student/membership"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/membership/",
        )
      );
    }


    // ------------------------------------------------------
    // BOOKINGS
    // ------------------------------------------------------

    if (
      path ===
      "/student/bookings"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/bookings/",
        )
      );
    }


    // ------------------------------------------------------
    // SEAT CHANGE
    // ------------------------------------------------------

    if (
      path ===
      "/student/seat-change"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/seat-change/",
        )
      );
    }


    // ------------------------------------------------------
    // PAYMENTS
    // ------------------------------------------------------

    if (
      path ===
      "/student/payments"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/payments/",
        )
      );
    }


    // ------------------------------------------------------
    // INVOICES
    // ------------------------------------------------------

    if (
      path ===
      "/student/invoices"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/invoices/",
        )
      );
    }


    // ------------------------------------------------------
    // NOTIFICATIONS
    // ------------------------------------------------------

    if (
      path ===
      "/student/notifications"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/notifications/",
        )
      );
    }


    // ------------------------------------------------------
    // PROFILE
    // ------------------------------------------------------

    if (
      path ===
      "/student/profile"
    ) {
      return (
        currentPath === path ||
        currentPath.startsWith(
          "/student/profile/",
        )
      );
    }


    // ------------------------------------------------------
    // HELP & SUPPORT
    // ------------------------------------------------------
    //
    // Keep Help & Support active for both:
    //
    // /student/help-support
    //
    // and:
    //
    // /student/support/tickets/:ticketId
    //
    // ------------------------------------------------------

    if (
      path ===
      "/student/help-support"
    ) {
      return (
        currentPath ===
          "/student/help-support" ||
        currentPath.startsWith(
          "/student/help-support/",
        ) ||
        currentPath.startsWith(
          "/student/support/tickets/",
        )
      );
    }


    // ------------------------------------------------------
    // DEFAULT
    // ------------------------------------------------------

    return (
      currentPath === path ||
      currentPath.startsWith(
        `${path}/`,
      )
    );
  };


  // ==========================================================
  // SIDEBAR CONTENT
  // ==========================================================

  const content = (
    <Box
      sx={{
        height: "100%",

        display: "flex",

        flexDirection: "column",

        bgcolor:
          "background.paper",
      }}
    >

      {/* ===================================================== */}
      {/* LOGO */}
      {/* ===================================================== */}

      <Toolbar
        sx={{
          minHeight:
            "76px !important",

          px: 2.5,

          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 44,

            height: 44,

            borderRadius: 2.7,

            background:
              "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",

            color:
              "primary.contrastText",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            fontWeight: 900,

            fontSize: 20,

            flexShrink: 0,

            boxShadow:
              "0 7px 18px rgba(79,70,229,0.24)",
          }}
        >
          L
        </Box>

        <Box
          sx={{
            ml: 1.5,

            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            lineHeight={1.1}
            noWrap
          >
            LibraryHub
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
          >
            Member Portal
          </Typography>
        </Box>
      </Toolbar>

      <Divider />


      {/* ===================================================== */}
      {/* MENU */}
      {/* ===================================================== */}

      <Box
        sx={{
          flexGrow: 1,

          overflowY: "auto",

          overflowX: "hidden",

          py: 1.5,

          px: 1.25,

          scrollbarWidth:
            "thin",

          "&::-webkit-scrollbar":
            {
              width: 5,
            },

          "&::-webkit-scrollbar-thumb":
            {
              bgcolor:
                "action.disabled",

              borderRadius: 20,
            },
        }}
      >
        {studentMenu.map(
          (
            section,
            sectionIndex,
          ) => (
            <Box
              key={
                section.title ||
                section.section ||
                sectionIndex
              }
              sx={{
                mb: 2,
              }}
            >

              {/* ============================================= */}
              {/* SECTION TITLE */}
              {/* ============================================= */}

              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  display: "block",

                  px: 1.5,

                  mb: 0.75,

                  letterSpacing:
                    0.65,

                  fontSize: 11.5,
                }}
              >
                {section.title ||
                  section.section}
              </Typography>


              {/* ============================================= */}
              {/* MENU ITEMS */}
              {/* ============================================= */}

              <List disablePadding>
                {section.items.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      isActive(
                        item.path,
                      );

                    return (
                      <Tooltip
                        key={`${section.title || section.section}-${item.label}-${item.path}`}
                        title=""
                        placement="right"
                      >
                        <ListItemButton
                          selected={
                            active
                          }
                          onClick={() =>
                            handleNavigation(
                              item.path,
                            )
                          }
                          sx={{
                            position:
                              "relative",

                            borderRadius:
                              2.5,

                            mb: 0.5,

                            minHeight: 48,

                            px: 1.5,

                            overflow:
                              "hidden",

                            color: active
                              ? "primary.main"
                              : "text.primary",

                            transition:
                              "all 0.18s ease",

                            "&::before":
                              {
                                content:
                                  '""',

                                position:
                                  "absolute",

                                left: 0,

                                top: "50%",

                                transform:
                                  "translateY(-50%)",

                                width:
                                  active
                                    ? 4
                                    : 0,

                                height:
                                  "58%",

                                borderRadius:
                                  "0 6px 6px 0",

                                bgcolor:
                                  "primary.main",

                                transition:
                                  "width 0.18s ease",
                              },

                            "&:hover": {
                              bgcolor:
                                active
                                  ? "rgba(79,70,229,0.10)"
                                  : "action.hover",

                              transform:
                                "translateX(2px)",
                            },

                            "&.Mui-selected":
                              {
                                bgcolor:
                                  "rgba(79,70,229,0.09)",

                                color:
                                  "primary.main",

                                "& .MuiListItemIcon-root":
                                  {
                                    color:
                                      "primary.main",
                                  },
                              },

                            "&.Mui-selected:hover":
                              {
                                bgcolor:
                                  "rgba(79,70,229,0.12)",
                              },
                          }}
                        >

                          {/* ================================= */}
                          {/* ICON */}
                          {/* ================================= */}

                          <ListItemIcon
                            sx={{
                              minWidth:
                                40,

                              color:
                                active
                                  ? "primary.main"
                                  : "text.secondary",

                              transition:
                                "color 0.18s ease",
                            }}
                          >
                            <Icon fontSize="small" />
                          </ListItemIcon>


                          {/* ================================= */}
                          {/* LABEL */}
                          {/* ================================= */}

                          <ListItemText
                            primary={
                              item.label
                            }
                            primaryTypographyProps={{
                              fontSize:
                                15,

                              lineHeight:
                                1.35,

                              fontWeight:
                                active
                                  ? 700
                                  : 500,
                            }}
                          />


                          {/* ================================= */}
                          {/* OPTIONAL BADGE */}
                          {/* ================================= */}

                          {item.badge !=
                            null && (
                            <Box
                              sx={{
                                minWidth:
                                  22,

                                height:
                                  22,

                                px: 0.75,

                                borderRadius:
                                  50,

                                bgcolor:
                                  "primary.main",

                                color:
                                  "primary.contrastText",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                fontSize:
                                  11,

                                fontWeight:
                                  800,
                              }}
                            >
                              {
                                item.badge
                              }
                            </Box>
                          )}
                        </ListItemButton>
                      </Tooltip>
                    );
                  },
                )}
              </List>
            </Box>
          ),
        )}
      </Box>


      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <Divider />

      <Box
        sx={{
          px: 2.5,

          py: 1.5,

          flexShrink: 0,

          bgcolor:
            "rgba(248,250,252,0.5)",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={500}
        >
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
      {/* DESKTOP */}
      {/* ===================================================== */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",

            md: "block",
          },

          width: drawerWidth,

          flexShrink: 0,

          "& .MuiDrawer-paper":
            {
              width:
                drawerWidth,

              boxSizing:
                "border-box",

              borderRight:
                "1px solid",

              borderColor:
                "divider",

              backgroundImage:
                "none",
            },
        }}
        open
      >
        {content}
      </Drawer>


      {/* ===================================================== */}
      {/* MOBILE */}
      {/* ===================================================== */}

      <Drawer
        variant="temporary"
        open={Boolean(
          mobileOpen,
        )}
        onClose={
          onMobileClose
        }
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",

            md: "none",
          },

          "& .MuiDrawer-paper":
            {
              width:
                drawerWidth,

              boxSizing:
                "border-box",

              backgroundImage:
                "none",
            },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}


export default StudentSidebar;

export { drawerWidth };