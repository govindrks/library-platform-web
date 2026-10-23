import {
  AutorenewOutlined,
  CalendarMonthOutlined,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  Close,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined,
  LocationOnOutlined,
  PaymentsOutlined,
  Refresh,
  Search,
  TimelineOutlined,
  VisibilityOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
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

// ============================================================
// SUBSCRIPTION STATUS
// ============================================================

const STATUS_OPTIONS = [
  "ACTIVE",
  "PENDING_PAYMENT",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "SUSPENDED",
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
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
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

const formatMoney = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "PENDING_PAYMENT":
      return "warning";

    case "FAILED":
    case "SUSPENDED":
      return "error";

    case "EXPIRED":
    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const getStatusTone = (status, theme) => {
  switch (status) {
    case "ACTIVE":
      return theme.palette.success;

    case "PENDING_PAYMENT":
      return theme.palette.warning;

    case "FAILED":
    case "SUSPENDED":
      return theme.palette.error;

    case "EXPIRED":
    case "CANCELLED":
      return theme.palette.grey;

    default:
      return theme.palette.primary;
  }
};

const daysUntil = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const end = new Date(dateValue);
  const now = new Date();

  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diff = end.getTime() - now.getTime();

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, helper, icon, tone = "primary" }) {
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
        p: 2.35,
        position: "relative",
        overflow: "hidden",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.12),
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(palette.main, 0.04)} 100%
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
// INFO TILE
// ============================================================

function InfoTile({ title, value, helper }) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 1.8,
        borderRadius: 2.6,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {title}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={850}
        sx={{
          mt: 0.4,
        }}
      >
        {value}
      </Typography>

      {helper && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.35,
          }}
        >
          {helper}
        </Typography>
      )}
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Subscriptions() {
  const theme = useTheme();

  const [subscriptions, setSubscriptions] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    pendingPayment: 0,
    expired: 0,
    cancelled: 0,
    failed: 0,
    suspended: 0,
    expiringIn7Days: 0,
  });

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  // =========================================================
  // LOAD SUMMARY
  // =========================================================

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);

      const response = await adminApi.getPlatformSubscriptionSummary();

      setSummary(response || {});
    } catch (requestError) {
      console.error("Subscription summary load failed:", requestError);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // =========================================================
  // LOAD SUBSCRIPTIONS
  // =========================================================

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getPlatformSubscriptions({
        search,
        status: statusFilter,
      });

      setSubscriptions(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Subscriptions load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load platform subscriptions.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubscriptions();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadSubscriptions]);

  const refreshAll = async () => {
    await Promise.all([loadSummary(), loadSubscriptions()]);
  };

  // =========================================================
  // DERIVED REAL METRICS
  // =========================================================

  const health = useMemo(() => {
    const total = Number(summary.total || 0);

    const active = Number(summary.active || 0);

    const risky =
      Number(summary.pendingPayment || 0) +
      Number(summary.failed || 0) +
      Number(summary.suspended || 0) +
      Number(summary.expiringIn7Days || 0);

    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      activeRate,
      risky,
    };
  }, [summary]);

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleView = async (subscriptionId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await adminApi.getPlatformSubscription(subscriptionId);

      setSelectedSubscription(response);
      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load subscription details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const hasFilters = Boolean(search.trim()) || Boolean(statusFilter);

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ pb: 5 }}>
      {/* =================================================== */}
      {/* PREMIUM HERO */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: {
            xs: 2.6,
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
            width: 230,
            height: 230,
            borderRadius: "50%",
            right: -80,
            top: -120,
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
              label="SUBSCRIPTION OPERATIONS"
              size="small"
              icon={<WorkspacePremiumOutlined />}
              sx={{
                mb: 1.3,
                fontWeight: 850,
                letterSpacing: 0.7,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Platform Subscriptions
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.65,
                maxWidth: 800,
                lineHeight: 1.7,
              }}
            >
              Monitor live LibraryHub subscriptions, payment state, renewals and
              expiry across every tenant library.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              icon={<CheckCircleOutlineOutlined />}
              label={`${health.activeRate}% active health`}
              color={
                health.activeRate >= 80
                  ? "success"
                  : health.activeRate >= 50
                    ? "warning"
                    : "error"
              }
              variant="outlined"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFFFFF",
              }}
            />

            <Tooltip title="Refresh live subscription data">
              <IconButton
                onClick={refreshAll}
                disabled={loading || summaryLoading}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                {loading || summaryLoading ? (
                  <CircularProgress size={18} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

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
      {/* PRIMARY METRICS */}
      {/* =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2,
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
            label="Total Subscriptions"
            value={summaryLoading ? "—" : summary.total}
            helper="All platform subscription records"
            icon={<PaymentsOutlined />}
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
            label="Active"
            value={summaryLoading ? "—" : summary.active}
            helper="Currently enabled tenant subscriptions"
            icon={<CheckCircleOutlineOutlined />}
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
            label="Expiring in 7 Days"
            value={summaryLoading ? "—" : summary.expiringIn7Days}
            helper="Renewal attention required soon"
            icon={<WarningAmberOutlined />}
            tone="warning"
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
            label="Pending Payment"
            value={summaryLoading ? "—" : summary.pendingPayment}
            helper="Awaiting successful subscription payment"
            icon={<HourglassEmptyOutlined />}
            tone="warning"
          />
        </Grid>
      </Grid>

      {/* =================================================== */}
      {/* SECONDARY HEALTH STRIP */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 3.2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid container spacing={1}>
          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Expired"
              value={summary.expired || 0}
              helper="Ended subscriptions"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Cancelled"
              value={summary.cancelled || 0}
              helper="Cancelled by lifecycle action"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Failed / Suspended"
              value={
                Number(summary.failed || 0) + Number(summary.suspended || 0)
              }
              helper="Subscriptions requiring review"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Attention Queue"
              value={health.risky}
              helper="Pending, expiring, failed or suspended"
            />
          </Grid>
        </Grid>
      </Paper>

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
            placeholder="Search library, owner, email, plan or status..."
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
                md: 225,
              },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontWeight: 650,
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
      {/* TABLE */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#FFFFFF",
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
              <Typography fontWeight={900}>Subscription Directory</Typography>

              <Typography variant="caption" color="text.secondary">
                Live tenant subscription, billing and lifecycle state.
              </Typography>
            </Box>

            {!loading && (
              <Chip
                size="small"
                variant="outlined"
                label={`${subscriptions.length} result${
                  subscriptions.length === 1 ? "" : "s"
                }`}
                sx={{
                  fontWeight: 750,
                }}
              />
            )}
          </Stack>
        </Box>

        <TableContainer>
          <Table
            sx={{
              minWidth: 1180,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.025),
                }}
              >
                {[
                  "Library",
                  "Owner",
                  "Plan",
                  "Amount",
                  "Validity",
                  "Renewal",
                  "Status",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 850,
                      color: "text.secondary",
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
                    {Array.from({
                      length: 7,
                    }).map((__, cell) => (
                      <TableCell key={cell}>
                        <Skeleton
                          width={cell === 0 ? 145 : cell === 1 ? 150 : 95}
                        />
                      </TableCell>
                    ))}

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
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
                      <WorkspacePremiumOutlined
                        sx={{
                          fontSize: 30,
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
                      No subscriptions found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Try another search or status filter.
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
                subscriptions.map((subscription) => {
                  const tone = getStatusTone(subscription.status, theme);

                  const remainingDays = daysUntil(subscription.endDate);

                  const expiresSoon =
                    subscription.status === "ACTIVE" &&
                    remainingDays !== null &&
                    remainingDays >= 0 &&
                    remainingDays <= 7;

                  return (
                    <TableRow
                      hover
                      key={subscription.id}
                      sx={{
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                        bgcolor:
                          subscription.status === "FAILED" ||
                          subscription.status === "SUSPENDED"
                            ? alpha(theme.palette.error.main, 0.012)
                            : "transparent",
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.1}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: alpha(
                                tone.main || theme.palette.primary.main,
                                0.08,
                              ),
                              color: tone.main || theme.palette.primary.main,
                              flexShrink: 0,
                            }}
                          >
                            <WorkspacePremiumOutlined
                              sx={{
                                fontSize: 20,
                              }}
                            />
                          </Box>

                          <Box>
                            <Typography fontWeight={800}>
                              {subscription.libraryName || "-"}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <LocationOnOutlined
                                sx={{
                                  fontSize: 14,
                                }}
                                color="action"
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {[
                                  subscription.libraryCity,
                                  subscription.libraryState,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {subscription.ownerName || "-"}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {subscription.ownerEmail || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800}>
                          {subscription.platformPlanName || "-"}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {displayEnum(subscription.billingCycle)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={800} color="primary.main">
                          {formatMoney(
                            subscription.amount,
                            subscription.currency,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={650}>
                          {formatDate(subscription.startDate)}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            to {formatDate(subscription.endDate)}
                          </Typography>

                          {expiresSoon && (
                            <Chip
                              size="small"
                              color="warning"
                              variant="outlined"
                              label={`${remainingDays}d`}
                              sx={{
                                height: 20,
                                fontSize: 9.5,
                                fontWeight: 800,
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          icon={<AutorenewOutlined />}
                          label={subscription.autoRenew ? "Auto" : "Manual"}
                          color={subscription.autoRenew ? "primary" : "default"}
                          sx={{
                            fontWeight: 750,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={displayEnum(subscription.status)}
                          color={getStatusColor(subscription.status)}
                          variant={
                            subscription.status === "ACTIVE"
                              ? "filled"
                              : "outlined"
                          }
                          sx={{
                            fontWeight: 800,
                            minWidth: 90,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Open subscription details">
                          <IconButton
                            onClick={() => handleView(subscription.id)}
                            disabled={detailsLoading}
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
      {/* PREMIUM DETAILS */}
      {/* =================================================== */}

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
        <Box
          sx={{
            position: "relative",
            px: {
              xs: 2.5,
              md: 3.2,
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
            SUBSCRIPTION CONTROL
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            Subscription Details
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.4,
              color: "rgba(255,255,255,.74)",
            }}
          >
            Review tenant, plan, billing lifecycle and payment reference.
          </Typography>
        </Box>

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
          {selectedSubscription && (
            <Stack spacing={2.4}>
              {/* STATUS / ID */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                }}
              >
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
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={900}>
                      {selectedSubscription.libraryName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.4,
                      }}
                    >
                      Subscription #{selectedSubscription.id}
                    </Typography>
                  </Box>

                  <Chip
                    label={displayEnum(selectedSubscription.status)}
                    color={getStatusColor(selectedSubscription.status)}
                    sx={{
                      fontWeight: 850,
                    }}
                  />
                </Stack>
              </Paper>

              {/* LIBRARY / OWNER */}

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoTile
                    title="Library"
                    value={selectedSubscription.libraryName || "-"}
                    helper={
                      [
                        selectedSubscription.libraryCity,
                        selectedSubscription.libraryState,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Location unavailable"
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoTile
                    title="Library Owner"
                    value={selectedSubscription.ownerName || "-"}
                    helper={selectedSubscription.ownerEmail || "-"}
                  />
                </Grid>
              </Grid>

              {/* PLAN */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb: 1.6,
                  }}
                >
                  <WorkspacePremiumOutlined color="primary" />

                  <Typography fontWeight={900}>Platform Plan</Typography>
                </Stack>

                <Grid container spacing={1.3}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoTile
                      title="Plan"
                      value={selectedSubscription.platformPlanName || "-"}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoTile
                      title="Price"
                      value={formatMoney(
                        selectedSubscription.amount,
                        selectedSubscription.currency,
                      )}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <InfoTile
                      title="Billing Cycle"
                      value={displayEnum(selectedSubscription.billingCycle)}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* TIMELINE */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb: 1.6,
                  }}
                >
                  <TimelineOutlined color="primary" />

                  <Typography fontWeight={900}>
                    Subscription Timeline
                  </Typography>
                </Stack>

                <Grid container spacing={1.3}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <InfoTile
                      title="Start Date"
                      value={formatDate(selectedSubscription.startDate)}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <InfoTile
                      title="End Date"
                      value={formatDate(selectedSubscription.endDate)}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <InfoTile
                      title="Next Billing"
                      value={formatDate(selectedSubscription.nextBillingDate)}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <InfoTile
                      title="Auto Renewal"
                      value={
                        selectedSubscription.autoRenew ? "Enabled" : "Disabled"
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* PAYMENT */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: selectedSubscription.paymentTransactionId
                    ? alpha(theme.palette.success.main, 0.18)
                    : "divider",
                  bgcolor: selectedSubscription.paymentTransactionId
                    ? alpha(theme.palette.success.main, 0.025)
                    : "#FFFFFF",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb: 1.2,
                  }}
                >
                  <PaymentsOutlined color="primary" />

                  <Typography fontWeight={900}>Payment Reference</Typography>
                </Stack>

                {selectedSubscription.paymentTransactionId ? (
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Payment Transaction
                      </Typography>

                      <Typography fontWeight={850}>
                        #{selectedSubscription.paymentTransactionId}
                      </Typography>
                    </Box>

                    <Chip
                      label="Linked"
                      color="success"
                      variant="outlined"
                      sx={{
                        alignSelf: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        fontWeight: 750,
                      }}
                    />
                  </Stack>
                ) : (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 2.5,
                    }}
                  >
                    No payment transaction is currently associated with this
                    subscription.
                  </Alert>
                )}
              </Paper>

              {selectedSubscription.remarks && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  <strong>Remarks:</strong> {selectedSubscription.remarks}
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
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 750,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Subscriptions;
