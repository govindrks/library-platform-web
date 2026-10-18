import {
  AutoAwesomeRounded,
  DashboardRounded,
  ExpandMore,
  HelpOutlineRounded,
  LibraryBooksRounded,
  LogoutRounded,
  MenuRounded,
  NotificationsNoneRounded,
  PersonRounded,
  SearchRounded,
  SettingsRounded,
  TuneRounded,
} from "@mui/icons-material";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Select,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";

import libraryApi from "../../../api/libraryApi";
import getImageUrl from "../../../utility/imageUrl";

// ============================================================
// CONSTANTS
// ============================================================

const drawerWidth = 250;

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

// ============================================================
// IMAGE ROLES
// ============================================================

const IMAGE_ROLES = {
  PROFILE: "PROFILE",
  COVER: "COVER",
  GALLERY: "GALLERY",
};

// ============================================================
// SEARCH DESTINATIONS
// ============================================================

const OWNER_SEARCH_ITEMS = [
  {
    label: "Dashboard",
    description: "Operational overview",
    path: "/owner/dashboard",
    icon: DashboardRounded,
    keywords: "dashboard overview operations",
  },

  {
    label: "Library Profile",
    description: "Library identity, location and images",
    path: "/owner/library",
    icon: LibraryBooksRounded,
    keywords: "library profile identity image location",
  },

  {
    label: "Members",
    description: "Members and memberships",
    path: "/owner/members",
    icon: PersonRounded,
    keywords: "members students memberships subscriptions",
  },

  {
    label: "Bookings",
    description: "Manage library bookings",
    path: "/owner/bookings",
    icon: LibraryBooksRounded,
    keywords: "booking reservations seats",
  },

  {
    label: "Seat Availability",
    description: "Live seat occupancy",
    path: "/owner/seat-availability",
    icon: TuneRounded,
    keywords: "seat availability occupancy",
  },

  {
    label: "Seat Mapping",
    description: "Configure floors and seats",
    path: "/owner/seat-mapping",
    icon: TuneRounded,
    keywords: "seat map layout floors",
  },

  {
    label: "Payments",
    description: "Payment transactions",
    path: "/owner/payments",
    icon: LibraryBooksRounded,
    keywords: "payment transaction cash upi",
  },

  {
    label: "Revenue",
    description: "Revenue and profitability",
    path: "/owner/revenue",
    icon: DashboardRounded,
    keywords: "revenue income net expenses profit",
  },

  {
    label: "Expenses",
    description: "Operating expenses",
    path: "/owner/expenses",
    icon: LibraryBooksRounded,
    keywords: "expense cost vendor electricity rent",
  },

  {
    label: "Automation",
    description: "Automation workflows",
    path: "/owner/automation",
    icon: AutoAwesomeRounded,
    keywords: "automation workflow rules execution",
  },

  {
    label: "Settings",
    description: "Library configuration",
    path: "/owner/settings",
    icon: SettingsRounded,
    keywords: "settings preferences booking notifications",
  },
];

const ADMIN_SEARCH_ITEMS = [
  {
    label: "Admin Dashboard",
    description: "Platform administration",
    path: "/admin/dashboard",
    icon: DashboardRounded,
    keywords: "dashboard platform admin",
  },

  {
    label: "Settings",
    description: "Platform settings",
    path: "/admin/settings",
    icon: SettingsRounded,
    keywords: "settings platform",
  },
];

const MEMBER_SEARCH_ITEMS = [
  {
    label: "My Profile",
    description: "Member profile",
    path: "/student/profile",
    icon: PersonRounded,
    keywords: "profile account",
  },

  {
    label: "Notifications",
    description: "Member notifications",
    path: "/student/notifications",
    icon: NotificationsNoneRounded,
    keywords: "notification alerts",
  },
];

// ============================================================
// GENERAL HELPERS
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
      return String(role)
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

const normalizeLibraries = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

// ============================================================
// LIBRARY IMAGE HELPERS
// ============================================================

const resolveImageRole = (image) => {
  if (image?.imageRole) {
    return image.imageRole;
  }

  if (image?.profile) {
    return IMAGE_ROLES.PROFILE;
  }

  if (image?.cover) {
    return IMAGE_ROLES.COVER;
  }

  return IMAGE_ROLES.GALLERY;
};

const resolveLibraryProfileImage = (library) => {
  if (!library) {
    return "";
  }

  const images = Array.isArray(library?.images) ? library.images : [];

  const profileImage =
    images.find((image) => resolveImageRole(image) === IMAGE_ROLES.PROFILE) ||
    null;

  const rawUrl = profileImage?.imageUrl || library?.profileImageUrl || "";

  if (!rawUrl) {
    return "";
  }

  return getImageUrl(rawUrl);
};

// ============================================================
// COMPONENT
// ============================================================

function Header({ onMenuClick }) {
  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const { user, role, logout } = useAuth();

  const { unreadCount } = useNotifications();

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const userName = user?.fullName?.trim() || "User";

  const userRole = role || user?.role || null;

  const userProfileImageUrl = user?.profileImageUrl || "";

  const isAdmin = userRole === "ADMIN";

  const isLibraryOwner = userRole === "LIBRARY_OWNER";

  const isUser = userRole === "USER";

  const userInitials = useMemo(() => getInitials(userName), [userName]);

  const userRoleLabel = useMemo(() => formatRole(userRole), [userRole]);

  // =========================================================
  // USER MENU
  // =========================================================

  const [anchorEl, setAnchorEl] = useState(null);

  const userMenuOpen = Boolean(anchorEl);

  // =========================================================
  // LIBRARY STATE
  // =========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [selectedLibraryDetails, setSelectedLibraryDetails] = useState(null);

  const [loadingLibraries, setLoadingLibraries] = useState(false);

  const [loadingLibraryIdentity, setLoadingLibraryIdentity] = useState(false);

  const [libraryIdentityVersion, setLibraryIdentityVersion] = useState(0);

  // =========================================================
  // SEARCH STATE
  // =========================================================

  const [searchQuery, setSearchQuery] = useState("");

  const [searchAnchor, setSearchAnchor] = useState(null);

  const searchRef = useRef(null);

  // =========================================================
  // SELECTED LIBRARY SUMMARY
  // =========================================================

  const selectedLibrarySummary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,
    [libraries, selectedLibraryId],
  );

  // =========================================================
  // LIBRARY PROFILE IMAGE
  // =========================================================

  const libraryProfileImageUrl = useMemo(() => {
    const detailsImage = resolveLibraryProfileImage(selectedLibraryDetails);

    if (detailsImage) {
      return detailsImage;
    }

    return resolveLibraryProfileImage(selectedLibrarySummary);
  }, [selectedLibraryDetails, selectedLibrarySummary]);

  // =========================================================
  // HEADER IDENTITY
  // =========================================================

  const headerDisplayName = isLibraryOwner
    ? selectedLibraryDetails?.name || selectedLibrarySummary?.name || userName
    : userName;

  const headerProfileImageUrl = isLibraryOwner
    ? libraryProfileImageUrl
    : userProfileImageUrl;

  const headerInitials = isLibraryOwner
    ? getInitials(headerDisplayName)
    : userInitials;

  // =========================================================
  // SEARCH ITEMS
  // =========================================================

  const searchItems = useMemo(() => {
    if (isLibraryOwner) {
      return OWNER_SEARCH_ITEMS;
    }

    if (isAdmin) {
      return ADMIN_SEARCH_ITEMS;
    }

    if (isUser) {
      return MEMBER_SEARCH_ITEMS;
    }

    return [];
  }, [isLibraryOwner, isAdmin, isUser]);

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return searchItems.slice(0, 6);
    }

    return searchItems
      .filter((item) => {
        const searchable =
          `${item.label} ${item.description} ${item.keywords}`.toLowerCase();

        return searchable.includes(query);
      })
      .slice(0, 8);
  }, [searchItems, searchQuery]);

  // =========================================================
  // LOAD OWNER LIBRARIES
  // =========================================================

  useEffect(() => {
    if (!isLibraryOwner) {
      setLibraries([]);

      setSelectedLibraryId("");

      setSelectedLibraryDetails(null);

      return;
    }

    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        const response = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const list = normalizeLibraries(response);

        setLibraries(list);

        if (list.length === 0) {
          setSelectedLibraryId("");

          setSelectedLibraryDetails(null);

          return;
        }

        const stored = getStoredLibraryId();

        const storedExists =
          stored != null && list.some((item) => Number(item.id) === stored);

        const nextId = storedExists ? stored : list[0].id;

        setSelectedLibraryId(String(nextId));

        localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(nextId));
      } catch (error) {
        console.error("Unable to load owner libraries in header:", error);
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, [isLibraryOwner]);

  // =========================================================
  // LOAD SELECTED LIBRARY IDENTITY
  // =========================================================

  useEffect(() => {
    if (!isLibraryOwner || !selectedLibraryId) {
      setSelectedLibraryDetails(null);

      return;
    }

    let active = true;

    const loadLibraryIdentity = async () => {
      try {
        setLoadingLibraryIdentity(true);

        const details = await libraryApi.getOwnerLibraryDetails(
          Number(selectedLibraryId),
        );

        if (!active) {
          return;
        }

        setSelectedLibraryDetails(details || null);
      } catch (error) {
        console.error("Unable to load library identity for header:", error);

        if (active) {
          setSelectedLibraryDetails(null);
        }
      } finally {
        if (active) {
          setLoadingLibraryIdentity(false);
        }
      }
    };

    loadLibraryIdentity();

    return () => {
      active = false;
    };
  }, [isLibraryOwner, selectedLibraryId, libraryIdentityVersion]);

  // =========================================================
  // SYNC OWNER LIBRARY CHANGES
  // =========================================================

  useEffect(() => {
    if (!isLibraryOwner) {
      return undefined;
    }

    const handleLibraryChanged = (event) => {
      const id = Number(event?.detail?.libraryId);

      if (Number.isFinite(id)) {
        setSelectedLibraryId(String(id));
      }
    };

    const handleStorage = (event) => {
      if (event.key !== OWNER_SELECTED_LIBRARY_KEY) {
        return;
      }

      const id = Number(event.newValue);

      if (Number.isFinite(id)) {
        setSelectedLibraryId(String(id));
      }
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("owner-library-changed", handleLibraryChanged);

      window.removeEventListener("storage", handleStorage);
    };
  }, [isLibraryOwner]);

  // =========================================================
  // SYNC LIBRARY PROFILE IMAGE CHANGES
  // =========================================================

  useEffect(() => {
    if (!isLibraryOwner) {
      return undefined;
    }

    const handleLibraryProfileUpdated = (event) => {
      const libraryId = Number(event?.detail?.libraryId);

      if (
        Number.isFinite(libraryId) &&
        libraryId === Number(selectedLibraryId)
      ) {
        setLibraryIdentityVersion((previous) => previous + 1);
      }
    };

    window.addEventListener(
      "owner-library-profile-updated",
      handleLibraryProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        "owner-library-profile-updated",
        handleLibraryProfileUpdated,
      );
    };
  }, [isLibraryOwner, selectedLibraryId]);

  // =========================================================
  // LIBRARY CHANGE
  // =========================================================

  const handleLibraryChange = (event) => {
    const value = event.target.value;

    setSelectedLibraryId(value);

    setSelectedLibraryDetails(null);

    localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(value));

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: {
          libraryId: Number(value),
        },
      }),
    );
  };

  // =========================================================
  // USER MENU
  // =========================================================

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // =========================================================
  // NOTIFICATION NAVIGATION
  // =========================================================

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

    if (isAdmin) {
      navigate("/admin/dashboard");

      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // SETTINGS NAVIGATION
  // =========================================================

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

    if (isUser) {
      navigate("/student/profile");

      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // PROFILE NAVIGATION
  // =========================================================

  const handleProfileNavigation = () => {
    handleUserMenuClose();

    if (isUser) {
      navigate("/student/profile");

      return;
    }

    if (isLibraryOwner) {
      navigate("/owner/library");

      return;
    }

    if (isAdmin) {
      navigate("/admin/dashboard");

      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    handleUserMenuClose();

    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const openSearch = () => {
    setSearchAnchor(searchRef.current);
  };

  const closeSearch = () => {
    setSearchAnchor(null);
  };

  const navigateFromSearch = (item) => {
    setSearchQuery("");

    closeSearch();

    navigate(item.path);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (filteredSearchItems.length > 0) {
      navigateFromSearch(filteredSearchItems[0]);
    }
  };

  // =========================================================
  // CURRENT PAGE LABEL
  // =========================================================

  const pageLabel = useMemo(() => {
    const path = location.pathname;

    if (path.includes("/revenue")) {
      return "Revenue";
    }

    if (path.includes("/expenses")) {
      return "Expenses";
    }

    if (path.includes("/automation")) {
      return "Automation";
    }

    if (path.includes("/settings")) {
      return "Settings";
    }

    if (path.includes("/members")) {
      return "Members";
    }

    if (path.includes("/bookings")) {
      return "Bookings";
    }

    if (path.includes("/seat")) {
      return "Seats";
    }

    if (path.includes("/payments")) {
      return "Payments";
    }

    if (path.includes("/library")) {
      return "Library Profile";
    }

    if (path.includes("/dashboard")) {
      return "Dashboard";
    }

    return isLibraryOwner
      ? "Library Workspace"
      : isAdmin
        ? "Platform Administration"
        : "Member Portal";
  }, [location.pathname, isLibraryOwner, isAdmin]);

  // =========================================================
  // RENDER
  // =========================================================

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

        bgcolor: alpha(theme.palette.background.paper, 0.94),

        color: "text.primary",

        borderBottom: "1px solid",

        borderColor: alpha(theme.palette.divider, 0.82),

        backdropFilter: "blur(18px)",

        WebkitBackdropFilter: "blur(18px)",

        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "76px !important",

          px: {
            xs: 1.5,

            sm: 2,

            md: 3,
          },

          gap: {
            xs: 1,

            md: 1.5,
          },
        }}
      >
        {/* =====================================================
            MOBILE MENU
           ===================================================== */}

        <IconButton
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "flex",

              md: "none",
            },
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* =====================================================
            WORKSPACE CONTEXT
           ===================================================== */}

        <Box
          sx={{
            minWidth: {
              xs: 0,

              md: 185,
            },

            display: {
              xs: "none",

              sm: "block",
            },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",

              fontWeight: 650,

              lineHeight: 1.1,
            }}
          >
            {isLibraryOwner
              ? "LibraryHub Owner"
              : isAdmin
                ? "LibraryHub Admin"
                : "LibraryHub"}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={850}
            noWrap
            sx={{
              mt: 0.35,
            }}
          >
            {pageLabel}
          </Typography>
        </Box>

        {/* =====================================================
            OWNER LIBRARY SELECTOR
           ===================================================== */}

        {isLibraryOwner && (
          <Paper
            variant="outlined"
            sx={{
              display: {
                xs: "none",

                md: "flex",
              },

              alignItems: "center",

              minWidth: 210,

              height: 44,

              px: 0.7,

              borderRadius: 2.5,

              borderColor: alpha(theme.palette.primary.main, 0.14),

              bgcolor: alpha(theme.palette.primary.main, 0.025),
            }}
          >
            <Avatar
              src={libraryProfileImageUrl || undefined}
              sx={{
                width: 30,

                height: 30,

                bgcolor: "primary.main",

                color: "primary.contrastText",

                fontSize: 11,

                fontWeight: 850,

                mr: 0.6,
              }}
            >
              {!libraryProfileImageUrl ? headerInitials : null}
            </Avatar>

            {loadingLibraries ? (
              <Stack direction="row" alignItems="center" spacing={1} px={1}>
                <CircularProgress size={16} />

                <Typography variant="body2" color="text.secondary">
                  Loading...
                </Typography>
              </Stack>
            ) : (
              <Select
                value={selectedLibraryId}
                onChange={handleLibraryChange}
                variant="standard"
                disableUnderline
                displayEmpty
                IconComponent={ExpandMore}
                sx={{
                  flex: 1,

                  minWidth: 0,

                  "& .MuiSelect-select": {
                    py: 0.6,

                    pr: "28px !important",

                    fontWeight: 800,

                    fontSize: 13,
                  },
                }}
              >
                {libraries.length === 0 ? (
                  <MenuItem value="" disabled>
                    No library
                  </MenuItem>
                ) : (
                  libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            )}
          </Paper>
        )}

        {/* =====================================================
            GLOBAL SEARCH
           ===================================================== */}

        <Paper
          ref={searchRef}
          component="form"
          elevation={0}
          onSubmit={handleSearchSubmit}
          sx={{
            display: {
              xs: "none",

              sm: "flex",
            },

            alignItems: "center",

            width: {
              sm: 220,

              lg: 340,

              xl: 420,
            },

            height: 44,

            px: 1.5,

            ml: {
              md: 0.5,
            },

            backgroundColor: "#FFFFFF",

            border: "1px solid",

            borderColor: searchAnchor
              ? alpha(theme.palette.primary.main, 0.45)
              : alpha(theme.palette.divider, 0.95),

            borderRadius: 999,

            transition: "border-color 0.2s ease, box-shadow 0.2s ease",

            boxShadow: searchAnchor
              ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`
              : "0 2px 8px rgba(15,23,42,0.025)",

            "&:hover": {
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },

            "&:focus-within": {
              borderColor: theme.palette.primary.main,

              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
            },
          }}
        >
          <SearchRounded
            fontSize="small"
            sx={{
              color: searchAnchor ? "primary.main" : "text.secondary",

              mr: 1,
            }}
          />

          <InputBase
            fullWidth
            value={searchQuery}
            placeholder={
              isLibraryOwner
                ? "Search LibraryHub..."
                : isAdmin
                  ? "Search platform..."
                  : "Search..."
            }
            onFocus={openSearch}
            onChange={(event) => {
              setSearchQuery(event.target.value);

              openSearch();
            }}
            inputProps={{
              "aria-label": "Search LibraryHub",

              autoComplete: "off",
            }}
            sx={{
              flex: 1,

              minWidth: 0,

              color: "text.primary",

              fontSize: "0.875rem",

              "& input": {
                p: 0,

                height: 40,

                lineHeight: "40px",

                backgroundColor: "transparent !important",

                color: `${theme.palette.text.primary} !important`,

                WebkitTextFillColor: `${theme.palette.text.primary} !important`,

                "&::placeholder": {
                  color: theme.palette.text.secondary,

                  opacity: 0.78,
                },

                "&:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #FFFFFF inset",

                  WebkitTextFillColor: theme.palette.text.primary,

                  caretColor: theme.palette.text.primary,
                },
              },
            }}
          />
        </Paper>

        <Box
          sx={{
            flex: 1,
          }}
        />

        {/* =====================================================
            LIVE STATUS
           ===================================================== */}

        {isLibraryOwner && (
          <Chip
            size="small"
            label="Live"
            color="success"
            variant="outlined"
            sx={{
              display: {
                xs: "none",

                lg: "inline-flex",
              },

              fontWeight: 800,
            }}
          />
        )}

        {/* =====================================================
            HELP
           ===================================================== */}

        <Tooltip title="Help & Documentation">
          <IconButton
            sx={{
              display: {
                xs: "none",

                sm: "inline-flex",
              },
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
        </Tooltip>

        {/* =====================================================
            NOTIFICATIONS
           ===================================================== */}

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
            onClick={handleNotificationNavigation}
            sx={{
              bgcolor:
                unreadCount > 0
                  ? alpha(theme.palette.error.main, 0.045)
                  : "transparent",
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              invisible={unreadCount <= 0}
            >
              <NotificationsNoneRounded />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* =====================================================
            HEADER IDENTITY
           ===================================================== */}

        <ButtonBase
          onClick={handleUserMenuOpen}
          sx={{
            borderRadius: 2.5,

            px: {
              xs: 0.3,

              sm: 0.75,
            },

            py: 0.45,

            ml: 0.2,

            textAlign: "left",

            transition: "all 0.18s ease",

            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {loadingLibraryIdentity &&
            isLibraryOwner &&
            !selectedLibraryDetails ? (
              <Box
                sx={{
                  width: 38,

                  height: 38,

                  display: "grid",

                  placeItems: "center",
                }}
              >
                <CircularProgress size={22} />
              </Box>
            ) : (
              <Avatar
                src={headerProfileImageUrl || undefined}
                alt={headerDisplayName}
                sx={{
                  width: 38,

                  height: 38,

                  bgcolor: "primary.main",

                  fontSize: 13,

                  fontWeight: 850,

                  border: "2px solid",

                  borderColor: alpha(theme.palette.primary.main, 0.12),

                  boxShadow: `0 0 0 3px ${alpha(
                    theme.palette.primary.main,
                    0.06,
                  )}`,
                }}
              >
                {!headerProfileImageUrl ? headerInitials : null}
              </Avatar>
            )}

            <Box
              sx={{
                display: {
                  xs: "none",

                  md: "block",
                },

                minWidth: 0,

                maxWidth: 155,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={800}
                noWrap
                sx={{
                  lineHeight: 1.15,
                }}
              >
                {headerDisplayName}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap>
                {userRoleLabel}
              </Typography>
            </Box>

            <ExpandMore
              fontSize="small"
              sx={{
                display: {
                  xs: "none",

                  md: "block",
                },

                color: "text.secondary",
              }}
            />
          </Stack>
        </ButtonBase>

        {/* =====================================================
            USER MENU
           ===================================================== */}

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
          slotProps={{
            paper: {
              sx: {
                mt: 1,

                minWidth: 275,

                borderRadius: 3,

                border: "1px solid",

                borderColor: "divider",

                boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
              },
            },
          }}
        >
          <Box
            sx={{
              px: 2,

              pt: 1.6,

              pb: 1.4,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                src={headerProfileImageUrl || undefined}
                alt={headerDisplayName}
                sx={{
                  width: 46,

                  height: 46,

                  bgcolor: "primary.main",

                  fontWeight: 850,

                  border: "2px solid",

                  borderColor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                {!headerProfileImageUrl ? headerInitials : null}
              </Avatar>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography variant="body2" fontWeight={850} noWrap>
                  {headerDisplayName}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {userRoleLabel}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          <MenuItem
            onClick={handleProfileNavigation}
            sx={{
              py: 1.1,
            }}
          >
            <ListItemIcon>
              {isLibraryOwner ? (
                <LibraryBooksRounded fontSize="small" />
              ) : (
                <PersonRounded fontSize="small" />
              )}
            </ListItemIcon>

            <ListItemText
              primary={isLibraryOwner ? "Library Profile" : "My Profile"}
            />
          </MenuItem>

          <MenuItem
            onClick={handleNotificationNavigation}
            sx={{
              py: 1.1,
            }}
          >
            <ListItemIcon>
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                invisible={unreadCount <= 0}
              >
                <NotificationsNoneRounded fontSize="small" />
              </Badge>
            </ListItemIcon>

            <ListItemText primary="Notifications" />
          </MenuItem>

          <MenuItem
            onClick={handleSettingsNavigation}
            sx={{
              py: 1.1,
            }}
          >
            <ListItemIcon>
              <SettingsRounded fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Settings" />
          </MenuItem>

          <Divider
            sx={{
              my: 0.8,
            }}
          />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.1,

              color: "error.main",
            }}
          >
            <ListItemIcon
              sx={{
                color: "error.main",
              }}
            >
              <LogoutRounded fontSize="small" />
            </ListItemIcon>

            <ListItemText primary="Logout" />
          </MenuItem>
        </MuiMenu>

        {/* =====================================================
            SEARCH POPOVER
           ===================================================== */}

        <Popover
          open={Boolean(searchAnchor)}
          anchorEl={searchAnchor}
          onClose={closeSearch}
          disableAutoFocus
          disableEnforceFocus
          anchorOrigin={{
            vertical: "bottom",

            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",

            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,

                width: searchAnchor?.offsetWidth || 340,

                maxWidth: "calc(100vw - 32px)",

                borderRadius: 3,

                border: "1px solid",

                borderColor: "divider",

                backgroundColor: "background.paper",

                boxShadow: "0 20px 60px rgba(15, 23, 42, 0.14)",

                overflow: "hidden",
              },
            },
          }}
        >
          {/* SEARCH HEADER */}

          <Box
            sx={{
              px: 1.8,

              pt: 1.5,

              pb: 1.1,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  {searchQuery ? "Search Results" : "Quick Navigation"}
                </Typography>

                {searchQuery && (
                  <Typography variant="body2" fontWeight={800} mt={0.2}>
                    {filteredSearchItems.length} result
                    {filteredSearchItems.length === 1 ? "" : "s"}
                  </Typography>
                )}
              </Box>

              {searchQuery && (
                <Chip
                  size="small"
                  label="Clear"
                  variant="outlined"
                  onClick={() => setSearchQuery("")}
                  sx={{
                    height: 25,

                    fontSize: 11,

                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* SEARCH RESULTS */}

          {filteredSearchItems.length > 0 ? (
            <MenuList
              dense
              disablePadding
              sx={{
                p: 0.8,
              }}
            >
              {filteredSearchItems.map((item) => {
                const Icon = item.icon;

                const selected = location.pathname === item.path;

                return (
                  <MenuItem
                    key={item.path}
                    selected={selected}
                    onClick={() => navigateFromSearch(item)}
                    sx={{
                      minHeight: 56,

                      px: 1.2,

                      py: 0.9,

                      mb: 0.35,

                      borderRadius: 2,

                      transition: "all 0.18s ease",

                      "&:last-of-type": {
                        mb: 0,
                      },

                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.055,
                        ),
                      },

                      "&.Mui-selected": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.075,
                        ),
                      },

                      "&.Mui-selected:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.11,
                        ),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: "44px !important",
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,

                          height: 36,

                          display: "grid",

                          placeItems: "center",

                          borderRadius: 2,

                          backgroundColor: selected
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.065),

                          color: "primary.main",
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                    </ListItemIcon>

                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontWeight: 800,

                        fontSize: 13,

                        color: selected ? "primary.main" : "text.primary",
                      }}
                      secondaryTypographyProps={{
                        fontSize: 11.5,

                        color: "text.secondary",
                      }}
                    />

                    {selected && (
                      <Chip
                        size="small"
                        label="Current"
                        color="primary"
                        variant="outlined"
                        sx={{
                          ml: 1,

                          height: 22,

                          fontSize: 10,

                          fontWeight: 750,
                        }}
                      />
                    )}
                  </MenuItem>
                );
              })}
            </MenuList>
          ) : (
            <Box
              sx={{
                py: 5,

                px: 3,

                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 48,

                  height: 48,

                  display: "grid",

                  placeItems: "center",

                  mx: "auto",

                  borderRadius: 2.5,

                  backgroundColor: alpha(theme.palette.primary.main, 0.055),

                  color: "text.disabled",
                }}
              >
                <SearchRounded
                  sx={{
                    fontSize: 27,
                  }}
                />
              </Box>

              <Typography variant="body2" fontWeight={800} mt={1.4}>
                No matching page
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",

                  mt: 0.35,
                }}
              >
                Try searching for members, revenue, expenses, seats or
                automation.
              </Typography>
            </Box>
          )}

          {filteredSearchItems.length > 0 && (
            <>
              <Divider />

              <Box
                sx={{
                  px: 1.8,

                  py: 1,

                  backgroundColor: alpha(theme.palette.action.hover, 0.4),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Press Enter to open the first result
                </Typography>
              </Box>
            </>
          )}
        </Popover>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
