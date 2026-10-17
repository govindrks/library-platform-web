import {
  ExpandMoreRounded,
  HelpOutlineRounded,
  LogoutRounded,
  Menu as MenuIcon,
  NotificationsNoneRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  alpha,
  useTheme,
} from "@mui/material/styles";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useNotifications,
} from "../../context/NotificationContext";

import {
  drawerWidth,
} from "./StudentSidebar";


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
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase(),
    )
    .join("");
};


const getGreeting = () => {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
};


const getFirstName = (
  fullName,
) => {
  if (!fullName) {
    return "Member";
  }

  return (
    fullName
      .trim()
      .split(/\s+/)[0] ||
    "Member"
  );
};


// ============================================================
// COMPONENT
// ============================================================

function StudentTopbar({
  onMenuClick,
}) {
  const theme =
    useTheme();

  const navigate =
    useNavigate();


  // ==========================================================
  // AUTH
  // ==========================================================

  const {
    user,
    logout,
  } = useAuth();


  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const {
    unreadCount,
  } = useNotifications();


  // ==========================================================
  // ACCOUNT MENU
  // ==========================================================

  const [
    anchorEl,
    setAnchorEl,
  ] = useState(null);


  const menuOpen =
    Boolean(anchorEl);


  // ==========================================================
  // USER INFORMATION
  // ==========================================================

  const userName =
    user?.fullName?.trim() ||
    "Member";


  const firstName =
    getFirstName(
      userName,
    );


  const profileImageUrl =
    user?.profileImageUrl ||
    "";


  const initials =
    useMemo(
      () =>
        getInitials(
          userName,
        ),
      [userName],
    );


  const greeting =
    useMemo(
      () =>
        getGreeting(),
      [],
    );


  // ==========================================================
  // USER MENU
  // ==========================================================

  const handleUserMenuOpen =
    (event) => {
      setAnchorEl(
        event.currentTarget,
      );
    };


  const handleUserMenuClose =
    () => {
      setAnchorEl(
        null,
      );
    };


  // ==========================================================
  // NOTIFICATION NAVIGATION
  // ==========================================================

  const handleNotificationNavigation =
    () => {
      navigate(
        "/student/notifications",
      );
    };


  // ==========================================================
  // HELP NAVIGATION
  // ==========================================================

  const handleHelpNavigation =
    () => {
      navigate(
        "/student/help-support",
      );
    };


  // ==========================================================
  // PROFILE NAVIGATION
  // ==========================================================

  const handleProfileNavigation =
    () => {
      handleUserMenuClose();

      navigate(
        "/student/profile",
      );
    };


  // ==========================================================
  // MENU NOTIFICATION NAVIGATION
  // ==========================================================

  const handleMenuNotificationNavigation =
    () => {
      handleUserMenuClose();

      handleNotificationNavigation();
    };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    () => {
      handleUserMenuClose();

      logout();

      navigate(
        "/login",
        {
          replace: true,

          state: {
            message:
              "You have been signed out successfully.",
          },
        },
      );
    };


  // ==========================================================
  // SHARED ACTION BUTTON STYLE
  // ==========================================================

  const actionButtonSx = {
    width: 42,
    height: 42,
    borderRadius: 2.5,

    border:
      "1px solid",

    borderColor:
      "divider",

    color:
      "text.secondary",

    bgcolor:
      alpha(
        theme.palette.background.paper,
        0.72,
      ),

    transition:
      "all 0.2s ease",

    "&:hover": {
      color:
        "primary.main",

      borderColor:
        alpha(
          theme.palette.primary.main,
          0.28,
        ),

      bgcolor:
        alpha(
          theme.palette.primary.main,
          0.07,
        ),

      transform:
        "translateY(-1px)",
    },
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: {
            md:
              `calc(100% - ${drawerWidth}px)`,
          },

          ml: {
            md:
              `${drawerWidth}px`,
          },

          borderBottom:
            "1px solid",

          borderColor:
            alpha(
              theme.palette.divider,
              0.78,
            ),

          bgcolor:
            alpha(
              theme.palette.background.paper,
              0.88,
            ),

          backdropFilter:
            "blur(18px)",

          WebkitBackdropFilter:
            "blur(18px)",

          boxShadow:
            `0 6px 28px ${alpha(
              theme.palette.common.black,
              theme.palette.mode ===
                "dark"
                ? 0.18
                : 0.035,
            )}`,

          zIndex:
            theme.zIndex.drawer +
            1,
        }}
      >
        <Toolbar
          sx={{
            minHeight:
              "76px !important",

            px: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },

            gap: 1,
          }}
        >

          {/* ================================================= */}
          {/* MOBILE MENU */}
          {/* ================================================= */}

          <IconButton
            edge="start"
            onClick={
              onMenuClick
            }
            aria-label="Open navigation menu"
            sx={{
              mr: 0.5,

              display: {
                md: "none",
              },

              borderRadius: 2,
            }}
          >
            <MenuIcon />
          </IconButton>


          {/* ================================================= */}
          {/* PORTAL CONTEXT */}
          {/* ================================================= */}

          <Stack
            spacing={0.15}
            sx={{
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.85}
            >
              <Typography
                variant="subtitle1"
                fontWeight={800}
                noWrap
                sx={{
                  letterSpacing:
                    "-0.02em",

                  color:
                    "text.primary",
                }}
              >
                {greeting},{" "}
                {firstName}
              </Typography>


              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius:
                    "50%",

                  bgcolor:
                    "success.main",

                  boxShadow:
                    `0 0 0 4px ${alpha(
                      theme.palette.success.main,
                      0.12,
                    )}`,

                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              />
            </Stack>


            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                fontWeight:
                  500,

                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              Manage your membership,
              bookings and library
              experience
            </Typography>
          </Stack>


          <Box
            sx={{
              flexGrow: 1,
            }}
          />


          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <Stack
            direction="row"
            alignItems="center"
            spacing={{
              xs: 0.5,
              sm: 0.8,
            }}
          >

            {/* =============================================== */}
            {/* HELP */}
            {/* =============================================== */}

            <Tooltip
              title="Help & Support"
              arrow
            >
              <IconButton
                aria-label="Help and support"
                onClick={
                  handleHelpNavigation
                }
                sx={
                  actionButtonSx
                }
              >
                <HelpOutlineRounded
                  fontSize="small"
                />
              </IconButton>
            </Tooltip>


            {/* =============================================== */}
            {/* NOTIFICATIONS */}
            {/* =============================================== */}

            <Tooltip
              arrow
              title={
                unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount ===
                      1
                        ? ""
                        : "s"
                    }`

                  : "Notifications"
              }
            >
              <IconButton
                aria-label="Notifications"
                onClick={
                  handleNotificationNavigation
                }
                sx={
                  actionButtonSx
                }
              >
                <Badge
                  badgeContent={
                    unreadCount
                  }
                  color="error"
                  max={99}
                  invisible={
                    unreadCount <= 0
                  }
                  sx={{
                    "& .MuiBadge-badge":
                      {
                        fontSize:
                          "0.65rem",

                        minWidth:
                          17,

                        height:
                          17,

                        fontWeight:
                          800,

                        border:
                          "2px solid",

                        borderColor:
                          "background.paper",
                      },
                  }}
                >
                  <NotificationsNoneRounded
                    fontSize="small"
                  />
                </Badge>
              </IconButton>
            </Tooltip>


            {/* =============================================== */}
            {/* DIVIDER */}
            {/* =============================================== */}

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: {
                  xs: 0.5,
                  sm: 1,
                },

                my: 1.25,
              }}
            />


            {/* =============================================== */}
            {/* PROFILE CAPSULE */}
            {/* =============================================== */}

            <Box
              onClick={
                handleUserMenuOpen
              }
              role="button"
              tabIndex={0}
              aria-label="Open account menu"
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key === " "
                ) {
                  handleUserMenuOpen(
                    event,
                  );
                }
              }}
              sx={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap: 1.1,

                cursor:
                  "pointer",

                py: 0.55,

                pl: 0.65,

                pr: {
                  xs: 0.65,
                  sm: 1.15,
                },

                borderRadius:
                  3,

                border:
                  "1px solid",

                borderColor:
                  menuOpen
                    ? alpha(
                        theme
                          .palette
                          .primary
                          .main,
                        0.35,
                      )
                    : "transparent",

                bgcolor:
                  menuOpen
                    ? alpha(
                        theme
                          .palette
                          .primary
                          .main,
                        0.07,
                      )
                    : "transparent",

                transition:
                  "all 0.2s ease",

                "&:hover": {
                  bgcolor:
                    alpha(
                      theme
                        .palette
                        .primary
                        .main,
                      0.055,
                    ),

                  borderColor:
                    alpha(
                      theme
                        .palette
                        .primary
                        .main,
                      0.16,
                    ),
                },
              }}
            >
              <Box
                sx={{
                  position:
                    "relative",
                }}
              >
                <Avatar
                  src={
                    profileImageUrl ||
                    undefined
                  }
                  alt={
                    userName
                  }
                  sx={{
                    width: 42,
                    height: 42,

                    bgcolor:
                      "primary.main",

                    color:
                      "primary.contrastText",

                    fontWeight:
                      800,

                    fontSize:
                      "0.9rem",

                    border:
                      "2px solid",

                    borderColor:
                      alpha(
                        theme
                          .palette
                          .primary
                          .main,
                        0.12,
                      ),

                    boxShadow:
                      `0 5px 16px ${alpha(
                        theme
                          .palette
                          .primary
                          .main,
                        0.18,
                      )}`,
                  }}
                >
                  {!profileImageUrl
                    ? initials
                    : null}
                </Avatar>


                <Box
                  sx={{
                    position:
                      "absolute",

                    right: 0,
                    bottom: 1,

                    width: 11,
                    height: 11,

                    borderRadius:
                      "50%",

                    bgcolor:
                      "success.main",

                    border:
                      "2px solid",

                    borderColor:
                      "background.paper",
                  }}
                />
              </Box>


              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  minWidth: 0,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={800}
                  noWrap
                  sx={{
                    lineHeight:
                      1.25,
                  }}
                >
                  {userName}
                </Typography>


                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{
                    display:
                      "block",

                    mt: 0.15,

                    fontWeight:
                      500,
                  }}
                >
                  LibraryHub Member
                </Typography>
              </Box>


              <ExpandMoreRounded
                fontSize="small"
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },

                  color:
                    "text.secondary",

                  transition:
                    "transform 0.2s ease",

                  transform:
                    menuOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                }}
              />
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>


      {/* ===================================================== */}
      {/* PREMIUM ACCOUNT MENU */}
      {/* ===================================================== */}

      <Menu
        anchorEl={
          anchorEl
        }
        open={
          menuOpen
        }
        onClose={
          handleUserMenuClose
        }
        anchorOrigin={{
          vertical:
            "bottom",

          horizontal:
            "right",
        }}
        transformOrigin={{
          vertical:
            "top",

          horizontal:
            "right",
        }}
        slotProps={{
          paper: {
            elevation: 0,

            sx: {
              mt: 1.4,

              minWidth:
                280,

              borderRadius:
                3,

              overflow:
                "hidden",

              border:
                "1px solid",

              borderColor:
                alpha(
                  theme
                    .palette
                    .divider,
                  0.9,
                ),

              bgcolor:
                alpha(
                  theme
                    .palette
                    .background
                    .paper,
                  0.98,
                ),

              boxShadow:
                `0 20px 55px ${alpha(
                  theme
                    .palette
                    .common
                    .black,
                  theme.palette
                    .mode ===
                    "dark"
                    ? 0.32
                    : 0.12,
                )}`,

              "& .MuiMenu-list":
                {
                  p: 1,
                },
            },
          },
        }}
      >

        {/* ================================================ */}
        {/* ACCOUNT HEADER */}
        {/* ================================================ */}

        <Box
          sx={{
            p: 1.5,

            mb: 0.75,

            borderRadius:
              2.5,

            background:
              `linear-gradient(
                135deg,
                ${alpha(
                  theme
                    .palette
                    .primary
                    .main,
                  0.11,
                )},
                ${alpha(
                  theme
                    .palette
                    .primary
                    .main,
                  0.025,
                )}
              )`,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
          >
            <Avatar
              src={
                profileImageUrl ||
                undefined
              }
              alt={
                userName
              }
              sx={{
                width: 48,
                height: 48,

                bgcolor:
                  "primary.main",

                fontWeight:
                  800,

                boxShadow:
                  `0 6px 18px ${alpha(
                    theme
                      .palette
                      .primary
                      .main,
                    0.2,
                  )}`,
              }}
            >
              {!profileImageUrl
                ? initials
                : null}
            </Avatar>


            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={800}
                noWrap
              >
                {userName}
              </Typography>


              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
                sx={{
                  mt: 0.25,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,

                    bgcolor:
                      "success.main",

                    borderRadius:
                      "50%",
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Active Member
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>


        {/* ================================================ */}
        {/* PROFILE */}
        {/* ================================================ */}

        <MenuItem
          onClick={
            handleProfileNavigation
          }
          sx={{
            py: 1.15,

            px: 1.4,

            borderRadius:
              2,

            mb: 0.35,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth:
                "36px !important",
            }}
          >
            <PersonOutlineRounded
              fontSize="small"
            />
          </ListItemIcon>

          <Box>
            <Typography
              variant="body2"
              fontWeight={700}
            >
              My Profile
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Personal details &
              preferences
            </Typography>
          </Box>
        </MenuItem>


        {/* ================================================ */}
        {/* NOTIFICATIONS */}
        {/* ================================================ */}

        <MenuItem
          onClick={
            handleMenuNotificationNavigation
          }
          sx={{
            py: 1.15,

            px: 1.4,

            borderRadius:
              2,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth:
                "36px !important",
            }}
          >
            <NotificationsNoneRounded
              fontSize="small"
            />
          </ListItemIcon>


          <Box
            sx={{
              display:
                "flex",

              alignItems:
                "center",

              width:
                "100%",

              gap: 1,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
              >
                Notifications
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Updates &
                reminders
              </Typography>
            </Box>


            {unreadCount >
              0 && (
              <Box
                sx={{
                  px: 0.8,

                  py: 0.2,

                  minWidth:
                    24,

                  borderRadius:
                    5,

                  textAlign:
                    "center",

                  bgcolor:
                    alpha(
                      theme
                        .palette
                        .error
                        .main,
                      0.1,
                    ),
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="error.main"
                >
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </Typography>
              </Box>
            )}
          </Box>
        </MenuItem>


        <Divider
          sx={{
            my: 1,
          }}
        />


        {/* ================================================ */}
        {/* LOGOUT */}
        {/* ================================================ */}

        <MenuItem
          onClick={
            handleLogout
          }
          sx={{
            py: 1.1,

            px: 1.4,

            borderRadius:
              2,

            color:
              "error.main",

            "&:hover": {
              bgcolor:
                alpha(
                  theme
                    .palette
                    .error
                    .main,
                  0.07,
                ),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth:
                "36px !important",

              color:
                "error.main",
            }}
          >
            <LogoutRounded
              fontSize="small"
            />
          </ListItemIcon>

          <Typography
            variant="body2"
            fontWeight={700}
          >
            Sign Out
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}


export default StudentTopbar;