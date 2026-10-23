import {
  ApartmentOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlineRounded,
  Close,
  EmailOutlined,
  FilterAltOutlined,
  LocationOnOutlined,
  ManageAccountsOutlined,
  PauseCircleOutlineRounded,
  Search,
  VisibilityOutlined,
  WarningAmberRounded,
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

const STATUS_OPTIONS = ["DRAFT", "ACTIVE", "SUSPENDED"];

const displayEnum = (value) => {
  if (!value) return "-";

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) return "-";

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

function MetricCard({ label, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();

  const palette =
    tone === "success"
      ? theme.palette.success
      : tone === "warning"
        ? theme.palette.warning
        : tone === "error"
          ? theme.palette.error
          : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        p: 2.4,
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.12),
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
          palette.main,
          0.035,
        )} 100%)`,
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
          width: 90,
          height: 90,
          borderRadius: "50%",
          right: -30,
          top: -34,
          bgcolor: alpha(palette.main, 0.07),
        }}
      />

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={750}>
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.55,
              fontWeight: 900,
              letterSpacing: "-0.035em",
            }}
          >
            {value}
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

function InfoBlock({ icon, title, children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2.25,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.6 }}>
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

function Libraries() {
  const theme = useTheme();

  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

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
    const timer = setTimeout(loadLibraries, 300);

    return () => clearTimeout(timer);
  }, [loadLibraries]);

  const statistics = useMemo(
    () => ({
      total: libraries.length,
      active: libraries.filter((library) => library.status === "ACTIVE").length,
      draft: libraries.filter((library) => library.status === "DRAFT").length,
      suspended: libraries.filter((library) => library.status === "SUSPENDED")
        .length,
    }),
    [libraries],
  );

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

  const handleStatusChange = async (library, status) => {
    if (!library?.id || !status || library.status === status) return;

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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const hasFilters = Boolean(search.trim()) || Boolean(statusFilter);

  return (
    <Box sx={{ pb: 5 }}>
      {/* HERO */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 2.5, md: 3.2 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #F4F2FF 48%, #EEF4FF 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -85,
            top: -100,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Chip
              label="PLATFORM DIRECTORY"
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
              sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
            >
              Libraries
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.65, maxWidth: 720, lineHeight: 1.7 }}
            >
              Monitor every tenant library, owner, subscription and operational
              status from one premium platform-control workspace.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              icon={<CheckCircleOutlineRounded />}
              label={`${statistics.active} Active`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 750 }}
            />

            {statistics.suspended > 0 && (
              <Chip
                icon={<WarningAmberRounded />}
                label={`${statistics.suspended} Suspended`}
                color="error"
                variant="outlined"
                sx={{ fontWeight: 750 }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2.5 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Visible Libraries"
            value={statistics.total}
            helper="Current search and filter result"
            icon={<ApartmentOutlined />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Active"
            value={statistics.active}
            helper="Operating on the platform"
            icon={<CheckCircleOutlineRounded />}
            tone="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Draft"
            value={statistics.draft}
            helper="Still completing setup"
            icon={<PauseCircleOutlineRounded />}
            tone="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Suspended"
            value={statistics.suspended}
            helper="Requires platform attention"
            icon={<WarningAmberRounded />}
            tone="error"
          />
        </Grid>
      </Grid>

      {/* FILTERS */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: alpha(theme.palette.background.paper, 0.98),
          boxShadow: "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            fullWidth
            placeholder="Search library, owner, email or city..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                transition:
                  "border-color .18s ease, box-shadow .18s ease, background-color .18s ease",
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
                color: "text.primary",
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
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.8,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      color: "primary.main",
                    }}
                  >
                    <Search sx={{ fontSize: 19 }} />
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            sx={{
              minWidth: {
                xs: "100%",
                md: 220,
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
              Status
            </InputLabel>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              startAdornment={
                <FilterAltOutlined
                  sx={{
                    ml: 0.2,
                    mr: 1,
                    fontSize: 19,
                    color: statusFilter ? "primary.main" : "text.secondary",
                  }}
                />
              }
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontSize: 14,
                fontWeight: 650,
                transition: "border-color .18s ease, box-shadow .18s ease",
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
              <MenuItem value="">All Statuses</MenuItem>

              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {displayEnum(status)}
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
                px: 2,
                borderRadius: 2.7,
                textTransform: "none",
                fontWeight: 750,
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* DIRECTORY */}
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
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography fontWeight={850}>Library Directory</Typography>
              <Typography variant="caption" color="text.secondary">
                Review identity, owner, subscription and status.
              </Typography>
            </Box>

            {!loading && (
              <Chip
                size="small"
                variant="outlined"
                label={`${libraries.length} result${libraries.length === 1 ? "" : "s"}`}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.025) }}
              >
                {[
                  "Library",
                  "Owner",
                  "Location",
                  "Seats",
                  "Subscription",
                  "Library Status",
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
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Skeleton variant="circular" width={42} height={42} />
                        <Box>
                          <Skeleton width={140} height={20} />
                          <Skeleton width={55} height={15} />
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Skeleton width={150} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={35} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={120} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={85} />
                    </TableCell>

                    <TableCell align="right">
                      <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{ ml: "auto" }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : libraries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 9 }}>
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        color: "primary.main",
                      }}
                    >
                      <ApartmentOutlined sx={{ fontSize: 30 }} />
                    </Box>

                    <Typography variant="h6" fontWeight={850} sx={{ mt: 1.5 }}>
                      No libraries found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Try another search or status filter.
                    </Typography>

                    {hasFilters && (
                      <Button
                        onClick={clearFilters}
                        sx={{ mt: 1.5, textTransform: "none", fontWeight: 750 }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                libraries.map((library) => (
                  <TableRow
                    hover
                    key={library.id}
                    sx={{ "&:last-child td": { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.4} alignItems="center">
                        <Avatar
                          src={
                            library.profileImageUrl
                              ? getImageUrl(library.profileImageUrl)
                              : undefined
                          }
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: "primary.main",
                            fontWeight: 850,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          {library.name?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={800} noWrap>
                            {library.name}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Library #{library.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {library.ownerName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {library.ownerEmail || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.6} alignItems="center">
                        <LocationOnOutlined
                          fontSize="small"
                          sx={{ color: "text.disabled" }}
                        />

                        <Typography variant="body2" noWrap>
                          {[library.city, library.state]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>
                        {library.totalSeats ?? 0}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {library.subscriptionId ? (
                        <Stack spacing={0.6}>
                          <Typography variant="body2" fontWeight={700}>
                            {library.planName || "-"}
                          </Typography>

                          <Chip
                            size="small"
                            label={displayEnum(library.subscriptionStatus)}
                            color={getSubscriptionStatusColor(
                              library.subscriptionStatus,
                            )}
                            variant="outlined"
                            sx={{
                              alignSelf: "flex-start",
                              height: 23,
                              fontSize: 11,
                              fontWeight: 750,
                            }}
                          />
                        </Stack>
                      ) : (
                        <Chip
                          size="small"
                          label="No Subscription"
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
                      <Chip
                        size="small"
                        color={getLibraryStatusColor(library.status)}
                        label={displayEnum(library.status)}
                        variant={
                          library.status === "ACTIVE" ? "filled" : "outlined"
                        }
                        sx={{ fontWeight: 800, minWidth: 82 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Open platform view">
                        <IconButton
                          onClick={() => openDetails(library.id)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.055),
                            color: "primary.main",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.11),
                            },
                          }}
                        >
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
      </Paper>

      {/* DETAILS */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(15,23,42,.22)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              position: "relative",
              px: { xs: 2.5, md: 3.2 },
              py: 2.6,
              background:
                "linear-gradient(135deg, #312E81 0%, #4F46E5 60%, #2563EB 100%)",
              color: "#FFFFFF",
            }}
          >
            <IconButton
              onClick={() => setDetailsOpen(false)}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                color: "rgba(255,255,255,.85)",
                "&:hover": { bgcolor: "rgba(255,255,255,.10)" },
              }}
            >
              <Close />
            </IconButton>

            <Typography
              variant="overline"
              sx={{ opacity: 0.72, fontWeight: 850, letterSpacing: 0.8 }}
            >
              PLATFORM ADMINISTRATION
            </Typography>

            <Typography variant="h5" sx={{ mt: 0.2, fontWeight: 900 }}>
              Library Details
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 0.4, color: "rgba(255,255,255,.74)" }}
            >
              Review identity, subscription and platform status.
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: { xs: 2.2, md: 3 },
            bgcolor: "#F8FAFD",
          }}
        >
          {selectedLibrary && (
            <Stack spacing={2.5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ sm: "center" }}
                >
                  <Avatar
                    src={
                      selectedLibrary.profileImageUrl
                        ? getImageUrl(selectedLibrary.profileImageUrl)
                        : undefined
                    }
                    sx={{
                      width: 82,
                      height: 82,
                      fontSize: 30,
                      fontWeight: 900,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      color: "primary.main",
                      border: "3px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    {selectedLibrary.name?.charAt(0)?.toUpperCase()}
                  </Avatar>

                  <Box flex={1}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Typography variant="h5" fontWeight={900}>
                        {selectedLibrary.name}
                      </Typography>

                      <Chip
                        size="small"
                        label={displayEnum(selectedLibrary.status)}
                        color={getLibraryStatusColor(selectedLibrary.status)}
                        sx={{ fontWeight: 800 }}
                      />
                    </Stack>

                    <Typography
                      color="text.secondary"
                      sx={{ mt: 0.7, lineHeight: 1.65 }}
                    >
                      {selectedLibrary.description ||
                        "No description provided."}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoBlock
                    icon={<ManageAccountsOutlined />}
                    title="Library Owner"
                  >
                    <Typography fontWeight={750}>
                      {selectedLibrary.ownerName || "-"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.7}
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <EmailOutlined fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {selectedLibrary.ownerEmail || "-"}
                      </Typography>
                    </Stack>
                  </InfoBlock>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoBlock
                    icon={<ApartmentOutlined />}
                    title="Library Information"
                  >
                    <Typography variant="body2">
                      Seats: <strong>{selectedLibrary.totalSeats ?? 0}</strong>
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 0.8 }}>
                      Contact: {selectedLibrary.contactNumber || "-"}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 0.8 }}>
                      Email: {selectedLibrary.email || "-"}
                    </Typography>
                  </InfoBlock>
                </Grid>
              </Grid>

              <InfoBlock icon={<LocationOnOutlined />} title="Location">
                <Typography sx={{ lineHeight: 1.65 }}>
                  {[
                    selectedLibrary.address,
                    selectedLibrary.city,
                    selectedLibrary.state,
                    selectedLibrary.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Location not configured"}
                </Typography>
              </InfoBlock>

              <InfoBlock
                icon={<CalendarMonthOutlined />}
                title="Platform Subscription"
              >
                {selectedLibrary.subscriptionId ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Plan
                      </Typography>
                      <Typography fontWeight={750}>
                        {selectedLibrary.planName || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
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
                          sx={{ fontWeight: 750 }}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Subscription period
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={650}
                        sx={{ mt: 0.35 }}
                      >
                        {formatDate(selectedLibrary.subscriptionStartDate)}
                        {" → "}
                        {formatDate(selectedLibrary.subscriptionEndDate)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Auto-renew
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ mt: 0.35 }}
                      >
                        {selectedLibrary.autoRenew ? "Enabled" : "Disabled"}
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                    This library does not currently have a platform
                    subscription.
                  </Alert>
                )}
              </InfoBlock>

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.warning.main, 0.22),
                  bgcolor: alpha(theme.palette.warning.main, 0.035),
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.7 }}
                >
                  <WarningAmberRounded color="warning" />
                  <Typography fontWeight={850}>
                    Administrative Status
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, lineHeight: 1.6 }}
                >
                  Control whether this tenant is active, still in draft, or
                  suspended on the platform.
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
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: 2.4,
                    }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {displayEnum(status)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.7 }}>
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

export default Libraries;
