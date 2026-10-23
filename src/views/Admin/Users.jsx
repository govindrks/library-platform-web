import {
  AccountCircleOutlined,
  AdminPanelSettingsOutlined,
  ApartmentOutlined,
  BadgeOutlined,
  Close,
  EmailOutlined,
  FilterAltOutlined,
  GroupsOutlined,
  LocationOnOutlined,
  ManageAccountsOutlined,
  PersonOutlineOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import adminApi from "../../api/adminApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// ROLE OPTIONS
// ============================================================

const ROLE_OPTIONS = [
  {
    value: "ADMIN",
    label: "Administrators",
  },
  {
    value: "LIBRARY_OWNER",
    label: "Library Owners",
  },
  {
    value: "USER",
    label: "Students / Users",
  },
];

// ============================================================
// HELPERS
// ============================================================

const displayEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getRoleColor = (role) => {
  switch (role) {
    case "ADMIN":
      return "error";

    case "LIBRARY_OWNER":
      return "primary";

    case "USER":
      return "success";

    default:
      return "default";
  }
};

const getRoleIcon = (role) => {
  switch (role) {
    case "ADMIN":
      return <AdminPanelSettingsOutlined fontSize="small" />;

    case "LIBRARY_OWNER":
      return <ManageAccountsOutlined fontSize="small" />;

    default:
      return <PersonOutlineOutlined fontSize="small" />;
  }
};

const getLibraryRelationships = (user) => {
  if (Array.isArray(user?.libraries) && user.libraries.length > 0) {
    return user.libraries;
  }

  /*
   * Backward-compatible fallback while frontend/backend deployments
   * may temporarily be on different versions.
   */
  if (user?.libraryId) {
    return [
      {
        libraryId: user.libraryId,
        libraryName: user.libraryName,
        libraryCity: user.libraryCity,
        libraryState: user.libraryState,
        libraryStatus: user.libraryStatus,
        relationship:
          user.role === "LIBRARY_OWNER"
            ? "OWNER"
            : user.role === "USER"
              ? "MEMBER"
              : "LINKED",
        subscriptionId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
      },
    ];
  }

  return [];
};

const getRelationshipLabel = (relationship, role) => {
  if (relationship === "OWNER") {
    return "Owner";
  }

  if (relationship === "MEMBER") {
    return "Member";
  }

  if (role === "LIBRARY_OWNER") {
    return "Owner";
  }

  if (role === "USER") {
    return "Member";
  }

  return "Linked";
};

const getLibraryStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "error";
    case "DRAFT":
      return "warning";
    default:
      return "default";
  }
};

const getSubscriptionStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "warning";
    case "EXPIRED":
    case "CANCELLED":
      return "error";
    case "PENDING_PAYMENT":
      return "info";
    default:
      return "default";
  }
};

// ============================================================
// PREMIUM STAT CARD
// ============================================================

function StatCard({ title, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();

  const palette =
    tone === "success"
      ? theme.palette.success
      : tone === "error"
        ? theme.palette.error
        : tone === "warning"
          ? theme.palette.warning
          : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        p: 2.4,
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.12),
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(palette.main, 0.035)} 100%
        )`,
        transition: "all .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(palette.main, 0.24),
          boxShadow: `0 16px 34px ${alpha(theme.palette.common.black, 0.07)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 92,
          height: 92,
          borderRadius: "50%",
          right: -32,
          top: -34,
          bgcolor: alpha(palette.main, 0.065),
        }}
      />

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={750}>
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.55,
              fontWeight: 900,
              letterSpacing: "-0.035em",
            }}
          >
            {value ?? 0}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.3,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(palette.main, 0.1),
            color: palette.main,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// DETAIL BLOCK
// ============================================================

function DetailBlock({ icon, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(79,70,229,.08)",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Typography fontWeight={850}>{title}</Typography>
      </Stack>

      {children}
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Users() {
  const theme = useTheme();

  const [users, setUsers] = useState([]);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    admins: 0,
    libraryOwners: 0,
    students: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  // =========================================================
  // LOAD SUMMARY
  // =========================================================

  const loadSummary = useCallback(async () => {
    try {
      const response = await adminApi.getUserSummary();

      setSummary(response || {});
    } catch (requestError) {
      console.error("Admin user summary failed:", requestError);
    }
  }, []);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getUsers({
        search,
        role: roleFilter,
      });

      setUsers(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Admin users load failed:", requestError);

      setError(
        requestError?.response?.data?.message || "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  // =========================================================
  // DETAILS
  // =========================================================

  const handleViewUser = async (userId) => {
    try {
      setError("");

      const response = await adminApi.getUser(userId);

      setSelectedUser(response);

      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message || "Unable to load user details.",
      );
    }
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
  };

  const hasFilters = Boolean(search.trim()) || Boolean(roleFilter);

  // =========================================================
  // VISIBLE RELATION SUMMARY
  // =========================================================

  const visibleMappedUsers = useMemo(
    () =>
      users.filter((user) => getLibraryRelationships(user).length > 0).length,
    [users],
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ pb: 5 }}>
      {/* =================================================== */}
      {/* HERO */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: {
            xs: 2.5,
            md: 3.2,
          },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #F3F1FF 48%, #EEF5FF 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -80,
            top: -105,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          spacing={2}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box>
            <Chip
              label="PLATFORM ACCOUNTS"
              size="small"
              sx={{
                mb: 1.3,
                fontWeight: 850,
                letterSpacing: 0.7,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Users
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.65,
                maxWidth: 760,
                lineHeight: 1.7,
              }}
            >
              Manage platform administrators, library owners and students while
              keeping every account correctly mapped to its related library.
            </Typography>
          </Box>

          {!loading && (
            <Chip
              icon={<ApartmentOutlined />}
              label={`${visibleMappedUsers} mapped in current result`}
              variant="outlined"
              color="primary"
              sx={{
                fontWeight: 750,
              }}
            />
          )}
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* =================================================== */}
      {/* STATISTICS */}
      {/* =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Total Accounts"
            value={summary.totalUsers}
            helper="All registered platform accounts"
            icon={<GroupsOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Library Owners"
            value={summary.libraryOwners}
            helper="Accounts managing libraries"
            icon={<ApartmentOutlined />}
            tone="primary"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Students / Users"
            value={summary.students}
            helper="Member-facing platform accounts"
            icon={<PersonOutlineOutlined />}
            tone="success"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Administrators"
            value={summary.admins}
            helper="Platform-level administrators"
            icon={<AdminPanelSettingsOutlined />}
            tone="error"
          />
        </Grid>
      </Grid>

      {/* =================================================== */}
      {/* FILTERS */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: "#FFFFFF",
          boxShadow: "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={1.25}
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.95),
                },
                "&:hover fieldset": {
                  borderColor: alpha(theme.palette.primary.main, 0.32),
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(
                    theme.palette.primary.main,
                    0.08,
                  )}`,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                },
              },
              "& .MuiInputBase-input": {
                py: 0,
                height: 48,
                boxSizing: "border-box",
                fontSize: 14,
                fontWeight: 550,
              },
              "& .MuiInputBase-input::placeholder": {
                color: "text.secondary",
                opacity: 0.78,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.8,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      color: "primary.main",
                    }}
                  >
                    <Search
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            sx={{
              minWidth: {
                xs: "100%",
                md: 230,
              },
            }}
          >
            <InputLabel
              sx={{
                bgcolor: "#FFFFFF",
                px: 0.45,
                transform: "translate(14px, 14px) scale(1)",
                "&.MuiInputLabel-shrink": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              }}
            >
              Role
            </InputLabel>

            <Select
              label="Role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              startAdornment={
                <FilterAltOutlined
                  sx={{
                    ml: 0.2,
                    mr: 1,
                    fontSize: 19,
                    color: roleFilter ? "primary.main" : "text.secondary",
                  }}
                />
              }
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontSize: 14,
                fontWeight: 650,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.divider, 0.95),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.primary.main, 0.32),
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(
                    theme.palette.primary.main,
                    0.08,
                  )}`,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                },
              }}
            >
              <MenuItem value="">All Roles</MenuItem>

              {ROLE_OPTIONS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                height: 48,
                minWidth: 118,
                borderRadius: 2.7,
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* USER TABLE */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 2.5,
            },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            spacing={1}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
          >
            <Box>
              <Typography fontWeight={850}>Account Directory</Typography>

              <Typography variant="caption" color="text.secondary">
                User identity, role and related library mapping.
              </Typography>
            </Box>

            {!loading && (
              <Chip
                size="small"
                variant="outlined"
                label={`${users.length} result${users.length === 1 ? "" : "s"}`}
                sx={{
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </Box>

        <TableContainer>
          <Table
            sx={{
              minWidth: 1080,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.025),
                }}
              >
                {[
                  "User",
                  "Role",
                  "Related Library",
                  "Location",
                  "Registered",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 850,
                      color: "text.secondary",
                      letterSpacing: 0.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}

                <TableCell
                  align="right"
                  sx={{
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 850,
                    color: "text.secondary",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({
                  length: 5,
                }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Skeleton variant="circular" width={42} height={42} />

                        <Box>
                          <Skeleton width={140} height={20} />

                          <Skeleton width={170} height={15} />
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Skeleton width={100} />
                    </TableCell>

                    <TableCell>
                      <Skeleton width={150} />
                    </TableCell>

                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>

                    <TableCell>
                      <Skeleton width={90} />
                    </TableCell>

                    <TableCell align="right">
                      <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{
                          ml: "auto",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 9,
                    }}
                  >
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        mx: "auto",
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        color: "primary.main",
                      }}
                    >
                      <AccountCircleOutlined
                        sx={{
                          fontSize: 31,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      fontWeight={850}
                      sx={{
                        mt: 1.5,
                      }}
                    >
                      No users found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Try another search or role filter.
                    </Typography>

                    {hasFilters && (
                      <Button
                        onClick={clearFilters}
                        sx={{
                          mt: 1.5,
                          textTransform: "none",
                          fontWeight: 750,
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const libraryRelationships = getLibraryRelationships(user);

                  const primaryLibrary = libraryRelationships[0] ?? null;

                  const additionalLibraryCount = Math.max(
                    0,
                    libraryRelationships.length - 1,
                  );

                  return (
                    <TableRow
                      hover
                      key={user.id}
                      sx={{
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="center"
                        >
                          <Avatar
                            src={
                              user.profileImageUrl
                                ? getImageUrl(user.profileImageUrl)
                                : undefined
                            }
                            alt={user.fullName || "User"}
                            imgProps={{
                              referrerPolicy: "no-referrer",
                            }}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              fontWeight: 850,
                              border: "1px solid",
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.1,
                              ),
                            }}
                          >
                            {!user.profileImageUrl
                              ? user.fullName?.charAt(0)?.toUpperCase() || "U"
                              : null}
                          </Avatar>

                          <Box
                            sx={{
                              minWidth: 0,
                            }}
                          >
                            <Typography fontWeight={800} noWrap>
                              {user.fullName || "Unnamed User"}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <EmailOutlined
                                sx={{
                                  fontSize: 14,
                                }}
                                color="action"
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {user.email || "-"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          icon={getRoleIcon(user.role)}
                          label={displayEnum(user.role)}
                          color={getRoleColor(user.role)}
                          variant="outlined"
                          sx={{
                            fontWeight: 750,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {primaryLibrary ? (
                          <Stack spacing={0.55}>
                            <Stack
                              direction="row"
                              spacing={0.7}
                              alignItems="center"
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Typography variant="body2" fontWeight={800}>
                                {primaryLibrary.libraryName ||
                                  `Library #${primaryLibrary.libraryId}`}
                              </Typography>

                              {additionalLibraryCount > 0 && (
                                <Chip
                                  size="small"
                                  label={`+${additionalLibraryCount} more`}
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    height: 21,
                                    fontSize: 10,
                                    fontWeight: 800,
                                  }}
                                />
                              )}
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={0.6}
                              useFlexGap
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Chip
                                size="small"
                                label={getRelationshipLabel(
                                  primaryLibrary.relationship,
                                  user.role,
                                )}
                                variant="outlined"
                                sx={{
                                  height: 21,
                                  fontSize: 10,
                                  fontWeight: 750,
                                }}
                              />

                              {primaryLibrary.subscriptionStatus && (
                                <Chip
                                  size="small"
                                  label={displayEnum(
                                    primaryLibrary.subscriptionStatus,
                                  )}
                                  color={getSubscriptionStatusColor(
                                    primaryLibrary.subscriptionStatus,
                                  )}
                                  variant="outlined"
                                  sx={{
                                    height: 21,
                                    fontSize: 10,
                                    fontWeight: 750,
                                  }}
                                />
                              )}

                              {primaryLibrary.libraryStatus && (
                                <Chip
                                  size="small"
                                  label={displayEnum(
                                    primaryLibrary.libraryStatus,
                                  )}
                                  color={getLibraryStatusColor(
                                    primaryLibrary.libraryStatus,
                                  )}
                                  variant="outlined"
                                  sx={{
                                    height: 21,
                                    fontSize: 10,
                                    fontWeight: 750,
                                  }}
                                />
                              )}
                            </Stack>
                          </Stack>
                        ) : user.role === "ADMIN" ? (
                          <Chip
                            size="small"
                            label="Platform Level"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="No Library Relationship"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: 11,
                              color: "text.secondary",
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        {primaryLibrary ? (
                          <Stack
                            direction="row"
                            spacing={0.6}
                            alignItems="center"
                          >
                            <LocationOnOutlined
                              fontSize="small"
                              sx={{
                                color: "text.disabled",
                              }}
                            />

                            <Typography variant="body2" noWrap>
                              {[
                                primaryLibrary.libraryCity,
                                primaryLibrary.libraryState,
                              ]
                                .filter(Boolean)
                                .join(", ") || "-"}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={650}>
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Open account view">
                          <IconButton
                            onClick={() => handleViewUser(user.id)}
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.055),
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.11,
                                ),
                              },
                            }}
                          >
                            <VisibilityOutlined />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* =================================================== */}
      {/* DETAILS DIALOG */}
      {/* =================================================== */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(15,23,42,.22)",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              px: {
                xs: 2.5,
                md: 3,
              },
              py: 2.6,
              color: "#FFFFFF",
              background:
                "linear-gradient(135deg, #312E81 0%, #4F46E5 60%, #2563EB 100%)",
            }}
          >
            <IconButton
              onClick={() => setDetailsOpen(false)}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                color: "rgba(255,255,255,.88)",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,.10)",
                },
              }}
            >
              <Close />
            </IconButton>

            <Typography
              variant="overline"
              sx={{
                opacity: 0.72,
                fontWeight: 850,
                letterSpacing: 0.8,
              }}
            >
              PLATFORM ACCOUNT
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mt: 0.15,
                fontWeight: 900,
              }}
            >
              User Details
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.4,
                color: "rgba(255,255,255,.74)",
              }}
            >
              Review identity, role and library relationship.
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 2.2,
              md: 3,
            },
            bgcolor: "#F8FAFD",
          }}
        >
          {selectedUser && (
            <Stack spacing={2.4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.4,
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack alignItems="center" spacing={1.1}>
                  <Avatar
                    src={
                      selectedUser.profileImageUrl
                        ? getImageUrl(selectedUser.profileImageUrl)
                        : undefined
                    }
                    alt={selectedUser.fullName || "User"}
                    imgProps={{
                      referrerPolicy: "no-referrer",
                    }}
                    sx={{
                      width: 82,
                      height: 82,
                      fontSize: 30,
                      fontWeight: 900,
                      bgcolor: alpha(theme.palette.primary.main, 0.11),
                      color: "primary.main",
                      border: "3px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.09),
                    }}
                  >
                    {!selectedUser.profileImageUrl
                      ? selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"
                      : null}
                  </Avatar>

                  <Typography variant="h6" fontWeight={900}>
                    {selectedUser.fullName || "Unnamed User"}
                  </Typography>

                  <Chip
                    icon={getRoleIcon(selectedUser.role)}
                    label={displayEnum(selectedUser.role)}
                    color={getRoleColor(selectedUser.role)}
                    variant="outlined"
                    sx={{
                      fontWeight: 750,
                    }}
                  />
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <DetailBlock icon={<EmailOutlined />} title="Account">
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>

                    <Typography
                      fontWeight={700}
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {selectedUser.email || "-"}
                    </Typography>
                  </DetailBlock>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <DetailBlock icon={<BadgeOutlined />} title="Registration">
                    <Typography variant="caption" color="text.secondary">
                      Registered
                    </Typography>

                    <Typography fontWeight={700}>
                      {formatDate(selectedUser.createdAt)}
                    </Typography>
                  </DetailBlock>
                </Grid>
              </Grid>

              {/* LIBRARY RELATIONSHIPS */}

              {getLibraryRelationships(selectedUser).length > 0 ? (
                <Box>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    spacing={1}
                    sx={{
                      mb: 1.4,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900}>
                        Library Relationships
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.25,
                        }}
                      >
                        Libraries connected to this account through ownership or
                        membership.
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={`${getLibraryRelationships(selectedUser).length} ${
                        getLibraryRelationships(selectedUser).length === 1
                          ? "library"
                          : "libraries"
                      }`}
                      color="primary"
                      variant="outlined"
                      sx={{
                        fontWeight: 750,
                      }}
                    />
                  </Stack>

                  <Stack spacing={1.35}>
                    {getLibraryRelationships(selectedUser).map((library) => (
                      <Paper
                        key={`${library.relationship}-${library.libraryId}-${library.subscriptionId ?? "none"}`}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.11),
                          bgcolor: alpha(theme.palette.primary.main, 0.018),
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          justifyContent="space-between"
                          spacing={1.3}
                        >
                          <Box>
                            <Stack
                              direction="row"
                              spacing={0.8}
                              alignItems="center"
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Typography variant="subtitle1" fontWeight={850}>
                                {library.libraryName ||
                                  `Library #${library.libraryId}`}
                              </Typography>

                              <Chip
                                size="small"
                                label={getRelationshipLabel(
                                  library.relationship,
                                  selectedUser.role,
                                )}
                                color={
                                  library.relationship === "OWNER"
                                    ? "primary"
                                    : "success"
                                }
                                variant="outlined"
                                sx={{
                                  height: 23,
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                }}
                              />
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={0.6}
                              alignItems="center"
                              sx={{
                                mt: 0.7,
                              }}
                            >
                              <LocationOnOutlined
                                fontSize="small"
                                color="action"
                              />

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {[library.libraryCity, library.libraryState]
                                  .filter(Boolean)
                                  .join(", ") || "Location unavailable"}
                              </Typography>
                            </Stack>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={0.7}
                            useFlexGap
                            flexWrap="wrap"
                            alignItems="flex-start"
                          >
                            {library.libraryStatus && (
                              <Chip
                                size="small"
                                label={`Library ${displayEnum(
                                  library.libraryStatus,
                                )}`}
                                color={getLibraryStatusColor(
                                  library.libraryStatus,
                                )}
                                variant="outlined"
                                sx={{
                                  fontWeight: 750,
                                }}
                              />
                            )}

                            {library.subscriptionStatus && (
                              <Chip
                                size="small"
                                label={`Membership ${displayEnum(
                                  library.subscriptionStatus,
                                )}`}
                                color={getSubscriptionStatusColor(
                                  library.subscriptionStatus,
                                )}
                                variant="outlined"
                                sx={{
                                  fontWeight: 750,
                                }}
                              />
                            )}
                          </Stack>
                        </Stack>

                        {library.relationship === "MEMBER" && (
                          <>
                            <Divider
                              sx={{
                                my: 1.5,
                              }}
                            />

                            <Grid container spacing={1.2}>
                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Subscription ID
                                </Typography>

                                <Typography variant="body2" fontWeight={750}>
                                  {library.subscriptionId
                                    ? `#${library.subscriptionId}`
                                    : "-"}
                                </Typography>
                              </Grid>

                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Started
                                </Typography>

                                <Typography variant="body2" fontWeight={750}>
                                  {formatDate(library.subscriptionStartDate)}
                                </Typography>
                              </Grid>

                              <Grid
                                size={{
                                  xs: 12,
                                  sm: 4,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Ends
                                </Typography>

                                <Typography variant="body2" fontWeight={750}>
                                  {formatDate(library.subscriptionEndDate)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ) : selectedUser.role === "ADMIN" ? (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  This administrator is a platform-level account and is not tied
                  to a tenant library.
                </Alert>
              ) : (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  No library relationship is currently available for this
                  account.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.7,
          }}
        >
          <Button
            onClick={() => setDetailsOpen(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 750,
              borderRadius: 2.2,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;
