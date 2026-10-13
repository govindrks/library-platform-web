import {
  AccountCircleOutlined,
  AdminPanelSettingsOutlined,
  ApartmentOutlined,
  Close,
  EmailOutlined,
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
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  Select,
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
  Button,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import adminApi from "../../api/adminApi";

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

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, icon }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={0.5}>
              {value ?? 0}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,

              height: 46,

              borderRadius: 2,

              bgcolor: "action.hover",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              color: "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Users() {
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

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        pb: 5,
      }}
    >
      {/* =================================================
                HEADER
            ================================================= */}

      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Users
        </Typography>

        <Typography color="text.secondary" mt={0.5}>
          View administrators, library owners and students registered on
          LibraryHub.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
                STATISTICS
            ================================================= */}

      <Grid container spacing={2} mb={3}>
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
            icon={<ApartmentOutlined />}
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
            icon={<PersonOutlineOutlined />}
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
            icon={<AdminPanelSettingsOutlined />}
          />
        </Grid>
      </Grid>

      {/* =================================================
                FILTERS
            ================================================= */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 220,
              }}
            >
              <InputLabel>Role</InputLabel>

              <Select
                label="Role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>

                {ROLE_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
                USER TABLE
            ================================================= */}

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>

                <TableCell>Role</TableCell>

                <TableCell>Library</TableCell>

                <TableCell>Location</TableCell>

                <TableCell>Registered</TableCell>

                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <AccountCircleOutlined
                      sx={{
                        fontSize: 48,

                        color: "text.disabled",
                      }}
                    />

                    <Typography fontWeight={600} mt={1}>
                      No users found
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Try another search or role filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow hover key={user.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar>
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </Avatar>

                        <Box>
                          <Typography fontWeight={700}>
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
                            >
                              {user.email}
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
                      />
                    </TableCell>

                    <TableCell>
                      {user.role === "LIBRARY_OWNER" ? (
                        user.libraryId ? (
                          <Stack>
                            <Typography variant="body2" fontWeight={600}>
                              {user.libraryName}
                            </Typography>

                            <Chip
                              size="small"
                              label={displayEnum(user.libraryStatus)}
                              sx={{
                                mt: 0.5,

                                width: "fit-content",
                              }}
                              variant="outlined"
                            />
                          </Stack>
                        ) : (
                          <Chip
                            size="small"
                            label="No Library"
                            variant="outlined"
                          />
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      {user.libraryId ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <LocationOnOutlined fontSize="small" color="action" />

                          <Typography variant="body2">
                            {[user.libraryCity, user.libraryState]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </Typography>
                        </Stack>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>{formatDate(user.createdAt)}</TableCell>

                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton onClick={() => handleViewUser(user.id)}>
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* =================================================
                DETAILS DIALOG
            ================================================= */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              User Details
            </Typography>

            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={3}>
              <Stack alignItems="center" spacing={1}>
                <Avatar
                  sx={{
                    width: 80,

                    height: 80,

                    fontSize: 30,
                  }}
                >
                  {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>

                <Typography variant="h6" fontWeight={700}>
                  {selectedUser.fullName}
                </Typography>

                <Chip
                  icon={getRoleIcon(selectedUser.role)}
                  label={displayEnum(selectedUser.role)}
                  color={getRoleColor(selectedUser.role)}
                  variant="outlined"
                />
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>

                <Typography fontWeight={600}>{selectedUser.email}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Registered
                </Typography>

                <Typography fontWeight={600}>
                  {formatDate(selectedUser.createdAt)}
                </Typography>
              </Box>

              {selectedUser.role === "LIBRARY_OWNER" && (
                <>
                  <Divider />

                  <Card variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                      >
                        <ApartmentOutlined color="primary" />

                        <Typography fontWeight={700}>Owned Library</Typography>
                      </Stack>

                      {selectedUser.libraryId ? (
                        <>
                          <Typography variant="h6" fontWeight={700}>
                            {selectedUser.libraryName}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {[
                              selectedUser.libraryCity,
                              selectedUser.libraryState,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </Typography>

                          <Chip
                            size="small"
                            sx={{
                              mt: 1.5,
                            }}
                            label={displayEnum(selectedUser.libraryStatus)}
                            variant="outlined"
                          />
                        </>
                      ) : (
                        <Alert severity="info">
                          This owner has not created a library yet.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;
