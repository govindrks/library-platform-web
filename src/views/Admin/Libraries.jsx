import {
  ApartmentOutlined,
  CalendarMonthOutlined,
  Close,
  EmailOutlined,
  LocationOnOutlined,
  ManageAccountsOutlined,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
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
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import adminApi from "../../api/adminApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// STATUS OPTIONS
// ============================================================
//
// Keep only statuses that exist in your LibraryStatus enum.
// If you later add another enum value, add it here.
//

const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "SUSPENDED"];

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

    case "PENDING_PAYMENT":
      return "warning";

    case "FAILED":
    case "SUSPENDED":
      return "error";

    default:
      return "default";
  }
};

// ============================================================
// COMPONENT
// ============================================================

function Libraries() {
  const [libraries, setLibraries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [selectedLibrary, setSelectedLibrary] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [statusSaving, setStatusSaving] = useState(false);

  // =========================================================
  // LOAD LIBRARIES
  // =========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getLibraries({
        search,

        status: statusFilter,
      });

      setLibraries(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Admin libraries load failed:", requestError);

      setError(
        requestError?.response?.data?.message || "Unable to load libraries.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLibraries();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadLibraries]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const statistics = useMemo(() => {
    return {
      total: libraries.length,

      active: libraries.filter((library) => library.status === "ACTIVE").length,

      draft: libraries.filter((library) => library.status === "DRAFT").length,

      suspended: libraries.filter((library) => library.status === "SUSPENDED")
        .length,
    };
  }, [libraries]);

  // =========================================================
  // DETAILS
  // =========================================================

  const openDetails = async (libraryId) => {
    try {
      setError("");

      const response = await adminApi.getLibrary(libraryId);

      setSelectedLibrary(response);

      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load library details.",
      );
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const handleStatusChange = async (library, status) => {
    if (!library?.id || !status || library.status === status) {
      return;
    }

    try {
      setStatusSaving(true);

      setError("");

      const updated = await adminApi.updateLibraryStatus(library.id, status);

      setLibraries((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      );

      if (selectedLibrary?.id === updated.id) {
        setSelectedLibrary(updated);
      }

      setSuccess(
        `${updated.name} status changed to ${displayEnum(updated.status)}.`,
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to update library status.",
      );
    } finally {
      setStatusSaving(false);
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
          Libraries
        </Typography>

        <Typography color="text.secondary" mt={0.5}>
          Monitor and manage every library registered on LibraryHub.
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

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* =================================================
                KPI
            ================================================= */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Showing Libraries
              </Typography>

              <Typography variant="h4" fontWeight={800}>
                {statistics.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Active
              </Typography>

              <Typography variant="h4" fontWeight={800} color="success.main">
                {statistics.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Draft
              </Typography>

              <Typography variant="h4" fontWeight={800} color="warning.main">
                {statistics.draft}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                Suspended
              </Typography>

              <Typography variant="h4" fontWeight={800} color="error.main">
                {statistics.suspended}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
                FILTER
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
              placeholder="Search library, owner, email, city..."
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
                minWidth: 200,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>

                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {displayEnum(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
                TABLE
            ================================================= */}

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Library</TableCell>

                <TableCell>Owner</TableCell>

                <TableCell>Location</TableCell>

                <TableCell>Seats</TableCell>

                <TableCell>Subscription</TableCell>

                <TableCell>Library Status</TableCell>

                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : libraries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <Typography fontWeight={600}>No libraries found</Typography>

                    <Typography variant="body2" color="text.secondary">
                      Try another search or status filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                libraries.map((library) => (
                  <TableRow hover key={library.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={
                            library.profileImageUrl
                              ? getImageUrl(library.profileImageUrl)
                              : undefined
                          }
                        >
                          {library.name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography fontWeight={700}>
                            {library.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            #{library.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {library.ownerName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {library.ownerEmail || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <LocationOnOutlined fontSize="small" color="action" />

                        <Typography variant="body2">
                          {[library.city, library.state]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{library.totalSeats ?? 0}</TableCell>

                    <TableCell>
                      {library.subscriptionId ? (
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {library.planName || "-"}
                          </Typography>

                          <Chip
                            size="small"
                            label={displayEnum(library.subscriptionStatus)}
                            color={getSubscriptionStatusColor(
                              library.subscriptionStatus,
                            )}
                            variant="outlined"
                          />
                        </Stack>
                      ) : (
                        <Chip
                          size="small"
                          label="No Subscription"
                          variant="outlined"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={getLibraryStatusColor(library.status)}
                        label={displayEnum(library.status)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton onClick={() => openDetails(library.id)}>
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
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Library Details
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Platform administration view
              </Typography>
            </Box>

            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedLibrary && (
            <Stack spacing={3}>
              {/* PROFILE */}

              <Stack
                direction={{
                  xs: "column",

                  sm: "row",
                }}
                spacing={2}
                alignItems={{
                  sm: "center",
                }}
              >
                <Avatar
                  src={
                    selectedLibrary.profileImageUrl
                      ? getImageUrl(selectedLibrary.profileImageUrl)
                      : undefined
                  }
                  sx={{
                    width: 80,

                    height: 80,

                    fontSize: 30,
                  }}
                >
                  {selectedLibrary.name?.charAt(0)?.toUpperCase()}
                </Avatar>

                <Box flex={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" fontWeight={800}>
                      {selectedLibrary.name}
                    </Typography>

                    <Chip
                      size="small"
                      label={displayEnum(selectedLibrary.status)}
                      color={getLibraryStatusColor(selectedLibrary.status)}
                    />
                  </Stack>

                  <Typography color="text.secondary">
                    {selectedLibrary.description || "No description provided."}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* INFORMATION */}

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                      >
                        <ManageAccountsOutlined color="primary" />

                        <Typography fontWeight={700}>Library Owner</Typography>
                      </Stack>

                      <Typography fontWeight={600}>
                        {selectedLibrary.ownerName || "-"}
                      </Typography>

                      <Stack direction="row" spacing={0.5} mt={1}>
                        <EmailOutlined fontSize="small" color="action" />

                        <Typography variant="body2" color="text.secondary">
                          {selectedLibrary.ownerEmail || "-"}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                      >
                        <ApartmentOutlined color="primary" />

                        <Typography fontWeight={700}>
                          Library Information
                        </Typography>
                      </Stack>

                      <Typography variant="body2">
                        Seats:{" "}
                        <strong>{selectedLibrary.totalSeats ?? 0}</strong>
                      </Typography>

                      <Typography variant="body2" mt={0.75}>
                        Contact: {selectedLibrary.contactNumber || "-"}
                      </Typography>

                      <Typography variant="body2" mt={0.75}>
                        Email: {selectedLibrary.email || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* LOCATION */}

              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <LocationOnOutlined color="primary" />

                    <Typography fontWeight={700}>Location</Typography>
                  </Stack>

                  <Typography>
                    {[
                      selectedLibrary.address,
                      selectedLibrary.city,
                      selectedLibrary.state,
                      selectedLibrary.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Location not configured"}
                  </Typography>
                </CardContent>
              </Card>

              {/* SUBSCRIPTION */}

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} mb={2}>
                    Platform Subscription
                  </Typography>

                  {selectedLibrary.subscriptionId ? (
                    <Grid container spacing={2}>
                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Plan
                        </Typography>

                        <Typography fontWeight={600}>
                          {selectedLibrary.planName}
                        </Typography>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>

                        <Box mt={0.5}>
                          <Chip
                            size="small"
                            label={displayEnum(
                              selectedLibrary.subscriptionStatus,
                            )}
                            color={getSubscriptionStatusColor(
                              selectedLibrary.subscriptionStatus,
                            )}
                          />
                        </Box>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Stack direction="row" spacing={1}>
                          <CalendarMonthOutlined fontSize="small" />

                          <Typography variant="body2">
                            {formatDate(selectedLibrary.subscriptionStartDate)}
                            {" → "}
                            {formatDate(selectedLibrary.subscriptionEndDate)}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Typography variant="body2">
                          Auto-renew:{" "}
                          <strong>
                            {selectedLibrary.autoRenew ? "Enabled" : "Disabled"}
                          </strong>
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      This library does not currently have a platform
                      subscription.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* ADMIN STATUS CONTROL */}

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700}>
                    Administrative Status
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Change whether this library is active, draft, or suspended
                    on the platform.
                  </Typography>

                  <FormControl fullWidth size="small">
                    <InputLabel>Library Status</InputLabel>

                    <Select
                      label="Library Status"
                      value={selectedLibrary.status || ""}
                      disabled={statusSaving}
                      onChange={(event) =>
                        handleStatusChange(selectedLibrary, event.target.value)
                      }
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {displayEnum(status)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
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

export default Libraries;
