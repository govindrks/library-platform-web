import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import studentMenu
  from "./studentMenu";

const drawerWidth = 260;

function StudentSidebar({
  mobileOpen,
  onMobileClose,
}) {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const handleNavigation =
    (path) => {
      navigate(path);

      onMobileClose?.();
    };

  const isActive =
    (path) => {
      if (
        path ===
        "/student/dashboard"
      ) {
        return (
          location.pathname ===
          path
        );
      }

      /*
       * Browse Libraries and Find Seats currently
       * share /student/libraries.
       *
       * Only highlight the exact menu target here
       * to avoid several menu entries appearing active.
       */
      return (
        location.pathname ===
          path ||
        (
          path !==
            "/student/libraries" &&
          location.pathname.startsWith(
            `${path}/`
          )
        )
      );
    };

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
      {/* ======================================================
          LOGO
      ====================================================== */}

      <Toolbar
        sx={{
          minHeight:
            "76px !important",
          px: 2.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            bgcolor:
              "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            fontWeight: 800,
            fontSize: 20,
            flexShrink: 0,
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
            fontWeight={800}
            lineHeight={1.1}
          >
            LibraryHub
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Member Portal
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* ======================================================
          MENU
      ====================================================== */}

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 1.5,
          px: 1.25,
        }}
      >
        {studentMenu.map(
          (section) => (
            <Box
              key={
                section.title
              }
              sx={{
                mb: 2,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  display: "block",
                  px: 1.5,
                  mb: 0.75,
                  letterSpacing:
                    0.6,
                }}
              >
                {section.title}
              </Typography>

              <List
                disablePadding
              >
                {section.items.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      isActive(
                        item.path
                      );

                    return (
                      <ListItemButton
                        key={
                          item.label
                        }
                        selected={
                          active
                        }
                        onClick={() =>
                          handleNavigation(
                            item.path
                          )
                        }
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          minHeight: 46,

                          "&.Mui-selected":
                            {
                              bgcolor:
                                "action.selected",

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
                                "action.selected",
                            },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color:
                              active
                                ? "primary.main"
                                : "text.secondary",
                          }}
                        >
                          <Icon
                            fontSize="small"
                          />
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            item.label
                          }
                          primaryTypographyProps={{
                            fontSize: 15,
                            fontWeight:
                              active
                                ? 700
                                : 500,
                          }}
                        />
                      </ListItemButton>
                    );
                  }
                )}
              </List>
            </Box>
          )
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          px: 2.5,
          py: 1.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
        >
          LibraryHub v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* DESKTOP */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width:
            drawerWidth,
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
            },
        }}
        open
      >
        {content}
      </Drawer>

      {/* MOBILE */}

      <Drawer
        variant="temporary"
        open={
          mobileOpen
        }
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
            },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

export default StudentSidebar;

export {
  drawerWidth,
};