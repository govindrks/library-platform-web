import {
  AccountBalanceWalletOutlined,
  Close,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  ReplayOutlined,
  Search,
  TrendingUpOutlined,
  VisibilityOutlined,
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
// STATUS
// ============================================================
//
// These are statuses confirmed by your current
// PaymentTransactionServiceImpl.
//

const STATUS_OPTIONS = ["PENDING", "CREATED", "SUCCESS", "FAILED", "REFUNDED"];

// ============================================================
// REFERENCE TYPES
// ============================================================

const REFERENCE_TYPES = [
  "PLATFORM_SUBSCRIPTION",
  "MEMBERSHIP",
  "BOOKING",
  "SUBSCRIPTION_RENEWAL",
  "SECURITY_DEPOSIT",
  "LATE_FEE",
  "OTHER",
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

const formatMoney = (amount, currency = "INR") => {
  if (amount === null || amount === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: currency || "INR",

    maximumFractionDigits: 2,
  }).format(Number(amount));
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "PENDING":
    case "CREATED":
      return "warning";

    case "FAILED":
      return "error";

    case "REFUNDED":
      return "info";

    default:
      return "default";
  }
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, subtitle, icon }) {
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
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={0.5}>
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
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

function Payments() {
  const [payments, setPayments] = useState([]);

  const [summary, setSummary] = useState({
    totalTransactions: 0,

    successfulTransactions: 0,

    pendingTransactions: 0,

    createdTransactions: 0,

    failedTransactions: 0,

    refundedTransactions: 0,

    grossSuccessfulAmount: 0,

    platformSubscriptionRevenue: 0,

    refundedAmount: 0,

    averageSuccessfulTransaction: 0,
  });

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [referenceTypeFilter, setReferenceTypeFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  // =========================================================
  // SUMMARY
  // =========================================================

  const loadSummary = useCallback(async () => {
    try {
      const response = await adminApi.getPaymentSummary();

      setSummary(response || {});
    } catch (requestError) {
      console.error("Payment summary failed:", requestError);
    }
  }, []);

  // =========================================================
  // PAYMENTS
  // =========================================================

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getPayments({
        search,

        status: statusFilter,

        referenceType: referenceTypeFilter,
      });

      setPayments(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Admin payments load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load payment transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, referenceTypeFilter]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadPayments]);

  // =========================================================
  // DETAILS
  // =========================================================

  const handleView = async (paymentId) => {
    try {
      setError("");

      const response = await adminApi.getPayment(paymentId);

      setSelectedPayment(response);

      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to load payment details.",
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
      {/* HEADER */}

      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Payments
        </Typography>

        <Typography color="text.secondary" mt={0.5}>
          Monitor payment transactions, gateway status, platform subscription
          revenue and refunds.
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

      {/* SUMMARY */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 4,
          }}
        >
          <StatCard
            label="Platform Revenue"
            value={formatMoney(summary.platformSubscriptionRevenue)}
            subtitle="Platform plans & renewals"
            icon={<TrendingUpOutlined />}
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
            label="Gross Successful"
            value={formatMoney(summary.grossSuccessfulAmount)}
            subtitle="All successful transactions"
            icon={<AccountBalanceWalletOutlined />}
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
            label="Total Transactions"
            value={summary.totalTransactions || 0}
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
            label="Successful"
            value={summary.successfulTransactions || 0}
            icon={<ReceiptLongOutlined />}
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
            label="Pending / Created"
            value={
              (summary.pendingTransactions || 0) +
              (summary.createdTransactions || 0)
            }
            icon={<HourglassEmptyOutlined />}
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
            label="Failed"
            value={summary.failedTransactions || 0}
            icon={<ErrorOutlineOutlined />}
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
            label="Refunded"
            value={formatMoney(summary.refundedAmount)}
            subtitle={`${summary.refundedTransactions || 0} transactions`}
            icon={<ReplayOutlined />}
          />
        </Grid>
      </Grid>

      {/* FILTERS */}

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

              lg: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search transaction, gateway ID, library, customer..."
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
                minWidth: 190,
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

            <FormControl
              size="small"
              sx={{
                minWidth: 230,
              }}
            >
              <InputLabel>Payment Type</InputLabel>

              <Select
                label="Payment Type"
                value={referenceTypeFilter}
                onChange={(event) => setReferenceTypeFilter(event.target.value)}
              >
                <MenuItem value="">All Payment Types</MenuItem>

                {REFERENCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {displayEnum(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>

                <TableCell>Library / Customer</TableCell>

                <TableCell>Type</TableCell>

                <TableCell>Gateway</TableCell>

                <TableCell>Amount</TableCell>

                <TableCell>Status</TableCell>

                <TableCell>Created</TableCell>

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
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 6,
                    }}
                  >
                    <Typography fontWeight={700}>
                      No payment transactions found
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Try changing your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow hover key={payment.id}>
                    <TableCell>
                      <Typography fontWeight={700}>#{payment.id}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        {payment.gatewayOrderId || payment.receiptNumber || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.libraryName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {payment.customerName || payment.customerEmail || "-"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={displayEnum(payment.referenceType)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {displayEnum(payment.paymentGateway)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {displayEnum(payment.paymentMethod)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700}>
                        {formatMoney(payment.amount, payment.currency)}
                      </Typography>

                      {payment.couponDiscountAmount > 0 && (
                        <Typography variant="caption" color="success.main">
                          Discount{" "}
                          {formatMoney(
                            payment.couponDiscountAmount,
                            payment.currency,
                          )}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(payment.status)}
                        label={displayEnum(payment.status)}
                      />
                    </TableCell>

                    <TableCell>{formatDateTime(payment.createdAt)}</TableCell>

                    <TableCell align="right">
                      <Tooltip title="View payment">
                        <IconButton onClick={() => handleView(payment.id)}>
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

      {/* DETAILS DIALOG */}

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
                Payment Details
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Transaction #{selectedPayment?.id}
              </Typography>
            </Box>

            <IconButton onClick={() => setDetailsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedPayment && (
            <Stack spacing={3}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h4" fontWeight={900}>
                    {formatMoney(
                      selectedPayment.amount,
                      selectedPayment.currency,
                    )}
                  </Typography>

                  <Typography color="text.secondary">
                    {displayEnum(selectedPayment.referenceType)}
                  </Typography>
                </Box>

                <Chip
                  label={displayEnum(selectedPayment.status)}
                  color={getStatusColor(selectedPayment.status)}
                />
              </Stack>

              <Divider />

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

                      <Typography fontWeight={700}>
                        {selectedPayment.libraryName || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {[
                          selectedPayment.libraryCity,
                          selectedPayment.libraryState,
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
                        Customer
                      </Typography>

                      <Typography fontWeight={700}>
                        {selectedPayment.customerName || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {selectedPayment.customerEmail || "-"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} mb={2}>
                    Gateway Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gateway
                      </Typography>

                      <Typography>
                        {displayEnum(selectedPayment.paymentGateway)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Payment Method
                      </Typography>

                      <Typography>
                        {displayEnum(selectedPayment.paymentMethod)}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gateway Order ID
                      </Typography>

                      <Typography
                        sx={{
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedPayment.gatewayOrderId || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gateway Payment ID
                      </Typography>

                      <Typography
                        sx={{
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedPayment.gatewayPaymentId || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gateway Transaction ID
                      </Typography>

                      <Typography
                        sx={{
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedPayment.gatewayTransactionId || "-"}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Receipt
                      </Typography>

                      <Typography>
                        {selectedPayment.receiptNumber || "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography fontWeight={700} mb={2}>
                    Business Reference
                  </Typography>

                  <Typography>
                    Type:{" "}
                    <strong>
                      {displayEnum(selectedPayment.referenceType)}
                    </strong>
                  </Typography>

                  <Typography mt={1}>
                    Reference ID:{" "}
                    <strong>{selectedPayment.referenceId ?? "-"}</strong>
                  </Typography>

                  <Typography mt={1}>
                    Created:{" "}
                    <strong>{formatDateTime(selectedPayment.createdAt)}</strong>
                  </Typography>
                </CardContent>
              </Card>

              {selectedPayment.refunded && (
                <Alert severity="info">
                  Refunded amount:{" "}
                  <strong>
                    {formatMoney(
                      selectedPayment.refundedAmount,
                      selectedPayment.currency,
                    )}
                  </strong>
                </Alert>
              )}

              {selectedPayment.failureReason && (
                <Alert severity="error">
                  <strong>Failure reason:</strong>{" "}
                  {selectedPayment.failureReason}
                </Alert>
              )}

              {selectedPayment.notes && (
                <Alert severity="info">
                  <strong>Notes:</strong> {selectedPayment.notes}
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

export default Payments;
