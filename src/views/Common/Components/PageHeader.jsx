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
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Paper,
  Popover,
  Select,
  Stack,
  TextField,
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

const drawerWidth = 250;
const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const OWNER_SEARCH_ITEMS = [
  {
    label: "Dashboard",
    description: "Operational overview",
    path: "/owner/dashboard",
    icon: DashboardRounded,
    keywords: "dashboard overview operations",
  },
  {
    label: "Members",
    description: "Members and memberships",
    path: "/owner/members",
    icon: PersonRounded,
    keywords: "members students membership subscription",
  },
  {
    label: "Bookings",
    description: "Manage library bookings",
    path: "/owner/bookings",
    icon: LibraryBooksRounded,
    keywords: "booking reservations seat",
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
    keywords: "seat map layout floor",
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
    keywords: "revenue net expenses profit",
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
    keywords: "settings preferences notifications booking",
  },
];

const ADMIN_SEARCH_ITEMS = [
  {
    label: "Admin Dashboard",
    description: "Platform administration",
    path: "/admin/dashboard",
    icon: DashboardRounded,
    keywords: "admin platform dashboard",
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

const normalizeLibraries = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const formatRole = (role) => {
  if (!role) return "User";
  if (role === "ADMIN") return "Admin";
  if (role === "LIBRARY_OWNER") return "Library Owner";
  if (role === "USER") return "Member";
  return String(role)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function Header({ onMenuClick }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const userName = user?.fullName?.trim() || "User";
  const userRole = role || user?.role || null;
  const profileImageUrl = user?.profileImageUrl || "";
  const isAdmin = userRole === "ADMIN";
  const isLibraryOwner = userRole === "LIBRARY_OWNER";
  const isUser = userRole === "USER";
  const userInitials = useMemo(() => getInitials(userName), [userName]);
  const userRoleLabel = useMemo(() => formatRole(userRole), [userRole]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchAnchor, setSearchAnchor] = useState(null);
  const searchRef = useRef(null);

  const userMenuOpen = Boolean(anchorEl);

  const searchItems = useMemo(() => {
    if (isLibraryOwner) return OWNER_SEARCH_ITEMS;
    if (isAdmin) return ADMIN_SEARCH_ITEMS;
    if (isUser) return MEMBER_SEARCH_ITEMS;
    return [];
  }, [isLibraryOwner, isAdmin, isUser]);

  const filteredSearchItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return searchItems.slice(0, 6);
    return searchItems
      .filter((item) =>
        `${item.label} ${item.description} ${item.keywords}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 8);
  }, [searchItems, searchQuery]);

  useEffect(() => {
    if (!isLibraryOwner) {
      setLibraries([]);
      setSelectedLibraryId("");
      return undefined;
    }

    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);
        const response = await libraryApi.getMyLibraries();
        if (!active) return;

        const list = normalizeLibraries(response);
        setLibraries(list);

        if (!list.length) {
          setSelectedLibraryId("");
          return;
        }

        const stored = Number(localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY));
        const storedExists =
          Number.isFinite(stored) &&
          list.some((item) => Number(item.id) === stored);
        const nextId = storedExists ? stored : list[0].id;

        setSelectedLibraryId(String(nextId));
        localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(nextId));
      } catch (error) {
        console.error("Unable to load owner libraries in header:", error);
      } finally {
        if (active) setLoadingLibraries(false);
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, [isLibraryOwner]);

  useEffect(() => {
    if (!isLibraryOwner) return undefined;

    const handleLibraryChanged = (event) => {
      const id = Number(event?.detail?.libraryId);
      if (Number.isFinite(id)) setSelectedLibraryId(String(id));
    };

    const handleStorage = (event) => {
      if (event.key !== OWNER_SELECTED_LIBRARY_KEY) return;
      const id = Number(event.newValue);
      if (Number.isFinite(id)) setSelectedLibraryId(String(id));
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isLibraryOwner]);

  const handleLibraryChange = (event) => {
    const value = event.target.value;
    setSelectedLibraryId(value);
    localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(value));
    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: Number(value) },
      }),
    );
  };

  const handleNotificationNavigation = () => {
    setAnchorEl(null);
    if (isLibraryOwner) return navigate("/owner/notifications");
    if (isUser) return navigate("/student/notifications");
    if (isAdmin) return navigate("/admin/dashboard");
    return navigate("/dashboard");
  };

  const handleSettingsNavigation = () => {
    setAnchorEl(null);
    if (isAdmin) return navigate("/admin/settings");
    if (isLibraryOwner) return navigate("/owner/settings");
    if (isUser) return navigate("/student/profile");
    return navigate("/dashboard");
  };

  const handleProfileNavigation = () => {
    setAnchorEl(null);
    if (isUser) return navigate("/student/profile");
    if (isLibraryOwner) return navigate("/owner/library");
    if (isAdmin) return navigate("/admin/dashboard");
    return navigate("/dashboard");
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate("/login", { replace: true });
  };

  const navigateFromSearch = (item) => {
    setSearchQuery("");
    setSearchAnchor(null);
    navigate(item.path);
  };

  const pageLabel = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/revenue")) return "Revenue";
    if (path.includes("/expenses")) return "Expenses";
    if (path.includes("/automation")) return "Automation";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/members")) return "Members";
    if (path.includes("/bookings")) return "Bookings";
    if (path.includes("/seat")) return "Seats";
    if (path.includes("/payments")) return "Payments";
    if (path.includes("/dashboard")) return "Dashboard";
    return isLibraryOwner
      ? "Library Workspace"
      : isAdmin
        ? "Platform Administration"
        : "Member Portal";
  }, [location.pathname, isLibraryOwner, isAdmin]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
        ml: { xs: 0, md: `${drawerWidth}px` },
        bgcolor: alpha(theme.palette.background.paper, 0.92),
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.8),
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: "76px !important",
          px: { xs: 1.5, sm: 2, md: 3 },
          gap: { xs: 1, md: 1.5 },
        }}
      >
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: "flex", md: "none" } }}
        >
          <MenuRounded />
        </IconButton>

        <Box
          sx={{
            minWidth: { xs: 0, md: 185 },
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", fontWeight: 650, lineHeight: 1.1 }}
          >
            {isLibraryOwner
              ? "LibraryHub Owner"
              : isAdmin
                ? "LibraryHub Admin"
                : "LibraryHub"}
          </Typography>
          <Typography variant="body2" fontWeight={850} noWrap sx={{ mt: 0.35 }}>
            {pageLabel}
          </Typography>
        </Box>

        {isLibraryOwner && (
          <Paper
            variant="outlined"
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              minWidth: 210,
              height: 44,
              px: 0.7,
              borderRadius: 2.5,
              borderColor: alpha(theme.palette.primary.main, 0.14),
              bgcolor: alpha(theme.palette.primary.main, 0.025),
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.8,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                mr: 0.5,
              }}
            >
              <LibraryBooksRounded fontSize="small" />
            </Box>

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

        <Paper
          ref={searchRef}
          component="form"
          elevation={0}
          onSubmit={(event) => {
            event.preventDefault();
            if (filteredSearchItems.length)
              navigateFromSearch(filteredSearchItems[0]);
          }}
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            width: { sm: 220, lg: 340, xl: 420 },
            height: 44,
            px: 1.2,
            bgcolor: alpha(theme.palette.action.hover, 0.65),
            border: "1px solid",
            borderColor: searchAnchor
              ? alpha(theme.palette.primary.main, 0.42)
              : "divider",
            borderRadius: 2.5,
            transition: "all 0.2s ease",
            "&:focus-within": {
              bgcolor: "background.paper",
              borderColor: "primary.main",
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
            },
          }}
        >
          <SearchRounded
            fontSize="small"
            sx={{ color: "text.secondary", mr: 0.5 }}
          />
          <TextField
            variant="standard"
            fullWidth
            value={searchQuery}
            onFocus={() => setSearchAnchor(searchRef.current)}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchAnchor(searchRef.current);
            }}
            placeholder={
              isLibraryOwner
                ? "Search LibraryHub..."
                : isAdmin
                  ? "Search platform..."
                  : "Search..."
            }
            InputProps={{ disableUnderline: true }}
            inputProps={{ "aria-label": "Search LibraryHub" }}
            sx={{ "& input": { fontSize: "0.875rem", py: 0.7 } }}
          />
        </Paper>

        <Box sx={{ flex: 1 }} />

        {isLibraryOwner && (
          <Chip
            size="small"
            label="Live"
            color="success"
            variant="outlined"
            sx={{ display: { xs: "none", lg: "inline-flex" }, fontWeight: 800 }}
          />
        )}

        <Tooltip title="Help & Documentation">
          <IconButton sx={{ display: { xs: "none", sm: "inline-flex" } }}>
            <HelpOutlineRounded />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={
            unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
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

        <ButtonBase
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            borderRadius: 2.5,
            px: { xs: 0.3, sm: 0.75 },
            py: 0.45,
            ml: 0.2,
            textAlign: "left",
            transition: "all 0.18s ease",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={profileImageUrl || undefined}
              alt={userName}
              sx={{
                width: 38,
                height: 38,
                bgcolor: "primary.main",
                fontSize: 13,
                fontWeight: 850,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              {!profileImageUrl ? userInitials : null}
            </Avatar>
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                minWidth: 0,
                maxWidth: 145,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={800}
                noWrap
                sx={{ lineHeight: 1.15 }}
              >
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {userRoleLabel}
              </Typography>
            </Box>
            <ExpandMore
              fontSize="small"
              sx={{
                display: { xs: "none", md: "block" },
                color: "text.secondary",
              }}
            />
          </Stack>
        </ButtonBase>

        <MuiMenu
          anchorEl={anchorEl}
          open={userMenuOpen}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 260,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
              },
            },
          }}
        >
          <Box sx={{ px: 2, pt: 1.5, pb: 1.3 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                src={profileImageUrl || undefined}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "primary.main",
                  fontWeight: 850,
                }}
              >
                {!profileImageUrl ? userInitials : null}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={850} noWrap>
                  {userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userRoleLabel}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileNavigation} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <PersonRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="My Profile" />
          </MenuItem>
          <MenuItem onClick={handleNotificationNavigation} sx={{ py: 1.1 }}>
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
          <MenuItem onClick={handleSettingsNavigation} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <SettingsRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
          <Divider sx={{ my: 0.8 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.1, color: "error.main" }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </MuiMenu>

        <Popover
          open={Boolean(searchAnchor)}
          anchorEl={searchAnchor}
          onClose={() => setSearchAnchor(null)}
          disableAutoFocus
          disableEnforceFocus
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                width: searchAnchor?.offsetWidth || 340,
                maxWidth: "calc(100vw - 32px)",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 18px 55px rgba(15,23,42,0.14)",
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ px: 1.5, pt: 1.4, pb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {searchQuery ? "Search Results" : "Quick Navigation"}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 0.8 }}>
            {filteredSearchItems.length > 0 ? (
              filteredSearchItems.map((item) => {
                const Icon = item.icon;
                return (
                  <MenuItem
                    key={item.path}
                    selected={location.pathname === item.path}
                    onClick={() => navigateFromSearch(item)}
                    sx={{ py: 1.1, borderRadius: 2, mb: 0.35 }}
                  >
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 1.8,
                          bgcolor: alpha(theme.palette.primary.main, 0.07),
                          color: "primary.main",
                        }}
                      >
                        <Icon fontSize="small" />
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{ fontWeight: 750, fontSize: 13 }}
                      secondaryTypographyProps={{ fontSize: 11 }}
                    />
                  </MenuItem>
                );
              })
            ) : (
              <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
                <SearchRounded sx={{ color: "text.disabled", fontSize: 34 }} />
                <Typography variant="body2" fontWeight={750} mt={1}>
                  No matching page
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try another keyword.
                </Typography>
              </Box>
            )}
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
