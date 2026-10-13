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
  Search,
  VisibilityOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Alert,
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

import { useCallback, useEffect, useState } from "react";

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
  if (amount === null || amount === undefined) {
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
      return "error";

    case "SUSPENDED":
      return "error";

    case "EXPIRED":
      return "default";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, icon }) {
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
              {label}
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

function Subscriptions() {
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

  const [error, setError] = useState("");

  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  // =========================================================
  // LOAD SUMMARY
  // =========================================================

  const loadSummary = useCallback(async () => {
    try {
      const response = await adminApi.getPlatformSubscriptionSummary();

      setSummary(response || {});
    } catch (requestError) {
      console.error("Subscription summary load failed:", requestError);
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

  // =========================================================
  // INITIAL SUMMARY
  // =========================================================

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // =========================================================
  // SUBSCRIPTION SEARCH
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubscriptions();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadSubscriptions]);

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleView = async (subscriptionId) => {
    try {
      setError("");

      const response = await adminApi.getPlatformSubscription(subscriptionId);

      setSelectedSubscription(response);

      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load subscription details.",
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
          Platform Subscriptions
        </Typography>

        <Typography color="text.secondary" mt={0.5}>
          Monitor LibraryHub subscriptions, renewals, expiry and payment state.
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
                SUMMARY
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
            label="Total"
            value={summary.total}
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
            value={summary.active}
            icon={<CheckCircleOutlineOutlined />}
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
            value={summary.expiringIn7Days}
            icon={<WarningAmberOutlined />}
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
            value={summary.pendingPayment}
            icon={<HourglassEmptyOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 4,
          }}
        >
          <StatCard
            label="Expired"
            value={summary.expired}
            icon={<CalendarMonthOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 4,
          }}
        >
          <StatCard
            label="Cancelled"
            value={summary.cancelled}
            icon={<CancelOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 4,
          }}
        >
          <StatCard
            label="Failed / Suspended"
            value={(summary.failed || 0) + (summary.suspended || 0)}
            icon={<ErrorOutlineOutlined />}
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
              placeholder="Search library, owner, email, plan or status..."
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

                <TableCell>Plan</TableCell>

                <TableCell>Amount</TableCell>

                <TableCell>Validity</TableCell>

                <TableCell>Auto Renew</TableCell>

                <TableCell>Status</TableCell>

                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <Typography fontWeight={600}>
                      No subscriptions found
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Try another search or status filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow hover key={subscription.id}>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {subscription.libraryName || "-"}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <LocationOnOutlined
                          sx={{
                            fontSize: 14,
                          }}
                          color="action"
                        />

                        <Typography variant="caption" color="text.secondary">
                          {[subscription.libraryCity, subscription.libraryState]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {subscription.ownerName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {subscription.ownerEmail || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {subscription.platformPlanName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {displayEnum(subscription.billingCycle)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {formatMoney(
                          subscription.amount,
                          subscription.currency,
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(subscription.startDate)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        to {formatDate(subscription.endDate)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<AutorenewOutlined />}
                        label={subscription.autoRenew ? "Enabled" : "Manual"}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={displayEnum(subscription.status)}
                        color={getStatusColor(subscription.status)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="View subscription">
                        <IconButton onClick={() => handleView(subscription.id)}>
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
                DETAILS
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
              <Typography variant="h6" fontWeight={800}>
                Subscription Details
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Platform subscription administration
              </Typography>
            </Box>

            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedSubscription && (
            <Stack spacing={3}>
              {/* STATUS */}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {selectedSubscription.libraryName}
                  </Typography>

                  <Typography color="text.secondary">
                    Subscription #{selectedSubscription.id}
                  </Typography>
                </Box>

                <Chip
                  label={displayEnum(selectedSubscription.status)}
                  color={getStatusColor(selectedSubscription.status)}
                />
              </Stack>

              <Divider />

              {/* LIBRARY + OWNER */}

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="caption" color="text.secondary">
                        Library
                      </Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {selectedSubscription.libraryName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {[
                          selectedSubscription.libraryCity,
                          selectedSubscription.libraryState,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </Typography>
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
                      <Typography variant="caption" color="text.secondary">
                        Library Owner
                      </Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {selectedSubscription.ownerName || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {selectedSubscription.ownerEmail || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* PLAN */}

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Platform Plan
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,

                        sm: 4,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Plan
                      </Typography>

                      <Typography fontWeight={700}>
                        {selectedSubscription.platformPlanName}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 4,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Price
                      </Typography>

                      <Typography fontWeight={700}>
                        {formatMoney(
                          selectedSubscription.amount,
                          selectedSubscription.currency,
                        )}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 4,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Billing Cycle
                      </Typography>

                      <Typography fontWeight={700}>
                        {displayEnum(selectedSubscription.billingCycle)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* DATES */}

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} mb={2}>
                    Subscription Timeline
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,

                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Start Date
                      </Typography>

                      <Typography>
                        {formatDate(selectedSubscription.startDate)}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,

                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        End Date
                      </Typography>

                      <Typography>
                        {formatDate(selectedSubscription.endDate)}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,

                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Next Billing
                      </Typography>

                      <Typography>
                        {formatDate(selectedSubscription.nextBillingDate)}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,

                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Auto Renewal
                      </Typography>

                      <Typography>
                        {selectedSubscription.autoRenew
                          ? "Enabled"
                          : "Disabled"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* PAYMENT */}

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} mb={2}>
                    Payment Reference
                  </Typography>

                  {selectedSubscription.paymentTransactionId ? (
                    <Typography>
                      Transaction #{selectedSubscription.paymentTransactionId}
                    </Typography>
                  ) : (
                    <Alert severity="info">
                      No payment transaction is currently associated with this
                      subscription.
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {selectedSubscription.remarks && (
                <Alert severity="info">
                  <strong>Remarks:</strong> {selectedSubscription.remarks}
                </Alert>
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

export default Subscriptions;
