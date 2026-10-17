import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";
import PaymentsIcon from "@mui/icons-material/Payments";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CancelIcon from "@mui/icons-material/Cancel";

import libraryApi from "../../api/libraryApi";
import ownerPaymentApi from "../../api/ownerPaymentApi";
import invoiceApi from "../../api/invoiceApi";
import platformSubscriptionApi from "../../api/platformSubscriptionApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const LIBRARY_REVENUE_REFERENCE_TYPES = new Set([
  "MEMBERSHIP",
  "BOOKING",
  "SUBSCRIPTION_RENEWAL",
  "SECURITY_DEPOSIT",
  "LATE_FEE",
  "OTHER",
]);

// LibraryHub SaaS billing belongs to Subscription & Billing,
// never to tenant/member revenue.
const PLATFORM_REFERENCE_TYPE = "PLATFORM_SUBSCRIPTION";

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function formatCurrency(value, currency = "INR") {
  const amount = Number(value) || 0;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status) {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "PENDING":
    case "CREATED":
      return "warning";
    case "FAILED":
    case "CANCELLED":
      return "error";
    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return "info";
    default:
      return "default";
  }
}

function getStatusLabel(status) {
  if (!status) return "Unknown";

  return String(status)
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getReferenceLabel(referenceType) {
  const labels = {
    MEMBERSHIP: "Membership",
    BOOKING: "Booking",
    SUBSCRIPTION_RENEWAL: "Membership Renewal",
    SECURITY_DEPOSIT: "Security Deposit",
    LATE_FEE: "Late Fee",
    OTHER: "Other",
  };

  return labels[referenceType] || referenceType || "Payment";
}

function getInitials(name) {
  if (!name) return "M";

  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "M"
  );
}

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!value) return null;

  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function storeLibraryId(libraryId) {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function isLibraryRevenuePayment(payment) {
  if (!payment) return false;
  if (payment.referenceType === PLATFORM_REFERENCE_TYPE) return false;

  return LIBRARY_REVENUE_REFERENCE_TYPES.has(payment.referenceType);
}

function isWithinRange(value, start, end) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  return date >= start && date <= end;
}

function buildSummaryFromPayments(payments) {
  const now = new Date();

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const successful = payments.filter((payment) => payment.status === "SUCCESS");

  return {
    totalRevenue: successful.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    ),

    todayRevenue: successful
      .filter((payment) =>
        isWithinRange(payment.createdAt, todayStart, todayEnd),
      )
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),

    monthlyRevenue: successful
      .filter((payment) =>
        isWithinRange(payment.createdAt, monthStart, monthEnd),
      )
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),

    successfulPayments: successful.length,

    pendingPayments: payments.filter(
      (payment) => payment.status === "PENDING" || payment.status === "CREATED",
    ).length,

    failedPayments: payments.filter(
      (payment) =>
        payment.status === "FAILED" || payment.status === "CANCELLED",
    ).length,

    refundedAmount: payments.reduce(
      (sum, payment) => sum + Number(payment.refundedAmount || 0),
      0,
    ),
  };
}

// ============================================================
// PREMIUM UI HELPERS
// ============================================================

function SummaryCard({ icon, label, value, helper, tone = "primary" }) {
  const theme = useTheme();
  const palette = theme.palette[tone] || theme.palette.primary;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3.2,
        borderColor: alpha(palette.main, 0.14),
        background: `linear-gradient(145deg, #fff 0%, ${alpha(
          palette.main,
          0.035,
        )} 100%)`,
        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.7} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.4,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(palette.main, 0.09),
              color: palette.main,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {label}
            </Typography>

            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.15 }}>
              {value}
            </Typography>

            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatusMetric({ icon, label, value, tone }) {
  const theme = useTheme();
  const palette = theme.palette[tone] || theme.palette.primary;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        height: "100%",
        borderColor: alpha(palette.main, 0.13),
        bgcolor: alpha(palette.main, 0.025),
      }}
    >
      <Stack direction="row" spacing={1.4} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(palette.main, 0.09),
            color: palette.main,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={900}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Payments() {
  const theme = useTheme();

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");
  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [referenceTypeFilter, setReferenceTypeFilter] = useState("ALL");

  const [error, setError] = useState("");

  const [downloadingInvoicePaymentId, setDownloadingInvoicePaymentId] =
    useState(null);

  // ==========================================================
  // RESOLVE OWNER LIBRARY
  // ==========================================================

  const resolveInitialLibrary = useCallback(async (libraryList) => {
    const storedLibraryId = getStoredLibraryId();

    if (storedLibraryId !== null) {
      const storedLibrary = libraryList.find(
        (library) => Number(library?.id) === storedLibraryId,
      );

      if (storedLibrary) {
        return storedLibrary;
      }
    }

    // Prefer the configured/active tenant when duplicate drafts exist.
    for (const library of libraryList) {
      try {
        const subscription =
          await platformSubscriptionApi.getActiveSubscription(library.id);

        if (subscription) {
          return library;
        }
      } catch {
        // No active platform subscription for this library.
      }
    }

    return libraryList[0];
  }, []);

  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);
      setError("");

      const response = await libraryApi.getMyLibraries();
      const list = normalizeListResponse(response);

      setLibraries(list);

      if (list.length === 0) {
        setLibraryId("");
        setPayments([]);
        return;
      }

      const selectedLibrary = await resolveInitialLibrary(list);
      const selectedId = String(selectedLibrary.id);

      setLibraryId(selectedId);
      storeLibraryId(selectedId);
    } catch (err) {
      console.error("Failed to load libraries:", err);
      setError(getErrorMessage(err, "Unable to load your libraries."));
      setLibraries([]);
      setLibraryId("");
      setPayments([]);
    } finally {
      setLoadingLibraries(false);
    }
  }, [resolveInitialLibrary]);

  // ==========================================================
  // LOAD MEMBER / LIBRARY PAYMENTS
  // ==========================================================

  const loadPayments = useCallback(async () => {
    if (!libraryId) {
      setPayments([]);
      return;
    }

    try {
      setLoadingPayments(true);
      setError("");

      const response = await ownerPaymentApi.getLibraryPayments(libraryId);
      const allPayments = normalizeListResponse(response);

      // Frontend safety boundary: never mix LibraryHub SaaS charges
      // with tenant/member revenue.
      const libraryPayments = allPayments.filter(isLibraryRevenuePayment);

      setPayments(libraryPayments);
    } catch (err) {
      console.error("Failed to load payments:", err);
      setPayments([]);
      setError(getErrorMessage(err, "Unable to load member payments."));
    } finally {
      setLoadingPayments(false);
    }
  }, [libraryId]);

  // ==========================================================
  // MEMBER PAYMENT INVOICE PDF
  // ==========================================================

  const handleDownloadMemberInvoice = async (payment) => {
    if (!libraryId) {
      setError("Library is not selected.");
      return;
    }

    const paymentTransactionId = Number(
      payment?.paymentId ?? payment?.transactionId ?? payment?.id,
    );

    if (!Number.isFinite(paymentTransactionId)) {
      setError("Payment transaction ID is unavailable.");
      return;
    }

    if (payment?.status !== "SUCCESS") {
      setError("Invoice PDF is available only for a successful payment.");
      return;
    }

    try {
      setDownloadingInvoicePaymentId(paymentTransactionId);
      setError("");

      const invoice = await invoiceApi.generateInvoice(paymentTransactionId);

      if (!invoice?.id) {
        throw new Error(
          `Invoice ID was not returned for payment #${paymentTransactionId}.`,
        );
      }

      await invoiceApi.downloadInvoice(
        Number(libraryId),
        invoice.id,
        invoice.invoiceNumber,
      );
    } catch (requestError) {
      console.error("Failed to download member invoice:", requestError);
      setError(
        getErrorMessage(
          requestError,
          "Unable to download the member invoice PDF.",
        ),
      );
    } finally {
      setDownloadingInvoicePaymentId(null);
    }
  };

  // ==========================================================
  // EFFECTS
  // ==========================================================

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) {
      loadPayments();
    } else {
      setPayments([]);
    }
  }, [libraryId, loadPayments]);

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const summary = useMemo(() => buildSummaryFromPayments(payments), [payments]);

  const totalRevenue = Number(summary.totalRevenue || 0);
  const todayRevenue = Number(summary.todayRevenue || 0);
  const monthlyRevenue = Number(summary.monthlyRevenue || 0);
  const successfulPayments = Number(summary.successfulPayments || 0);
  const pendingPayments = Number(summary.pendingPayments || 0);
  const failedPayments = Number(summary.failedPayments || 0);
  const refundedAmount = Number(summary.refundedAmount || 0);

  const averageSuccessfulPayment =
    successfulPayments > 0 ? totalRevenue / successfulPayments : 0;

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        [
          payment.paymentId,
          payment.customerName,
          payment.customerEmail,
          payment.referenceId,
          payment.referenceType,
          payment.gatewayOrderId,
          payment.gatewayPaymentId,
          payment.receiptNumber,
          payment.paymentMethod,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      const matchesReference =
        referenceTypeFilter === "ALL" ||
        payment.referenceType === referenceTypeFilter;

      return matchesSearch && matchesStatus && matchesReference;
    });
  }, [payments, search, statusFilter, referenceTypeFilter]);

  const selectedLibrary =
    libraries.find((library) => String(library.id) === String(libraryId)) ??
    null;

  const activeFilters = [
    Boolean(search.trim()),
    statusFilter !== "ALL",
    referenceTypeFilter !== "ALL",
  ].filter(Boolean).length;

  const handleLibraryChange = (event) => {
    const nextLibraryId = String(event.target.value);

    setLibraryId(nextLibraryId);
    storeLibraryId(nextLibraryId);

    setSearch("");
    setStatusFilter("ALL");
    setReferenceTypeFilter("ALL");
    setError("");

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: {
          libraryId: Number(nextLibraryId),
        },
      }),
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setReferenceTypeFilter("ALL");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box sx={{ pb: 4 }}>
      {/* ===================================================== */}
      {/* PREMIUM HEADER */}
      {/* ===================================================== */}

      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, md: 3.2 },
          mb: 3,
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(118deg, ${alpha(
            theme.palette.primary.main,
            0.08,
          )} 0%, #fff 50%, ${alpha(theme.palette.info.main, 0.045)} 100%)`,
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            right: -45,
            top: -80,
            bgcolor: alpha(theme.palette.primary.main, 0.055),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2.5}
          position="relative"
          zIndex={1}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "common.white",
                boxShadow: `0 10px 28px ${alpha(
                  theme.palette.primary.main,
                  0.24,
                )}`,
                flexShrink: 0,
              }}
            >
              <PaymentsIcon sx={{ fontSize: 29 }} />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -0.6 }}
              >
                Payments
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.4}>
                Track member revenue, transaction health, refunds and invoices
                from one finance workspace.
              </Typography>

              {selectedLibrary && (
                <Chip
                  size="small"
                  label={selectedLibrary.name}
                  sx={{
                    mt: 1.3,
                    fontWeight: 750,
                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: { sm: 230 } }}>
              <InputLabel>Library</InputLabel>
              <Select
                value={libraryId}
                label="Library"
                disabled={loadingLibraries || libraries.length === 0}
                onChange={handleLibraryChange}
                sx={{ borderRadius: 2.2, bgcolor: "background.paper" }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={
                loadingPayments ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshOutlinedIcon />
                )
              }
              onClick={loadPayments}
              disabled={!libraryId || loadingPayments}
              sx={{ borderRadius: 2.2, px: 2, fontWeight: 800 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          No library is available for this owner account.
        </Alert>
      )}

      {/* ===================================================== */}
      {/* REVENUE KPIs */}
      {/* ===================================================== */}

      {libraryId && (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                icon={<AccountBalanceWalletOutlinedIcon />}
                label="Total Revenue"
                value={formatCurrency(totalRevenue)}
                helper={`${successfulPayments} successful payment${
                  successfulPayments === 1 ? "" : "s"
                }`}
                tone="primary"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                icon={<TodayOutlinedIcon />}
                label="Today Revenue"
                value={formatCurrency(todayRevenue)}
                helper="Successful payments today"
                tone="success"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                icon={<CalendarMonthOutlinedIcon />}
                label="Monthly Revenue"
                value={formatCurrency(monthlyRevenue)}
                helper="Current calendar month"
                tone="info"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                icon={<ReplayIcon />}
                label="Refunded Amount"
                value={formatCurrency(refundedAmount)}
                helper="Total refunded value"
                tone="error"
              />
            </Grid>
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3.2,
              boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
            }}
          >
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatusMetric
                  icon={<CheckCircleIcon fontSize="small" />}
                  label="Successful"
                  value={successfulPayments}
                  tone="success"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatusMetric
                  icon={<PendingActionsIcon fontSize="small" />}
                  label="Pending"
                  value={pendingPayments}
                  tone="warning"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatusMetric
                  icon={<CancelIcon fontSize="small" />}
                  label="Failed / Cancelled"
                  value={failedPayments}
                  tone="error"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatusMetric
                  icon={<TrendingUpOutlinedIcon fontSize="small" />}
                  label="Avg. Successful Payment"
                  value={formatCurrency(averageSuccessfulPayment)}
                  tone="primary"
                />
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {/* ===================================================== */}
      {/* FILTERS */}
      {/* ===================================================== */}

      <Paper
        variant="outlined"
        sx={{
          p: 2.2,
          mb: 2.5,
          borderRadius: 3.2,
          boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search member, receipt, reference or transaction..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { lg: 330 },
              "& .MuiOutlinedInput-root": { borderRadius: 2.2 },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 175 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{ borderRadius: 2.2 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="SUCCESS">Success</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="CREATED">Created</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="REFUNDED">Refunded</MenuItem>
              <MenuItem value="PARTIALLY_REFUNDED">Partial Refund</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 205 }}>
            <InputLabel>Payment For</InputLabel>
            <Select
              value={referenceTypeFilter}
              label="Payment For"
              onChange={(event) => setReferenceTypeFilter(event.target.value)}
              sx={{ borderRadius: 2.2 }}
            >
              <MenuItem value="ALL">All Member Payments</MenuItem>
              <MenuItem value="MEMBERSHIP">Membership</MenuItem>
              <MenuItem value="BOOKING">Booking</MenuItem>
              <MenuItem value="SUBSCRIPTION_RENEWAL">
                Membership Renewal
              </MenuItem>
              <MenuItem value="SECURITY_DEPOSIT">Security Deposit</MenuItem>
              <MenuItem value="LATE_FEE">Late Fee</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant={activeFilters > 0 ? "contained" : "outlined"}
            startIcon={<FilterListOutlinedIcon />}
            onClick={handleClearFilters}
            disabled={activeFilters === 0}
            sx={{
              borderRadius: 2.2,
              whiteSpace: "nowrap",
              fontWeight: 800,
            }}
          >
            Clear {activeFilters > 0 ? `(${activeFilters})` : ""}
          </Button>
        </Stack>
      </Paper>

      {/* ===================================================== */}
      {/* PAYMENT ACTIVITY */}
      {/* ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,
          overflow: "hidden",
          boxShadow: "0 12px 34px rgba(15,23,42,0.045)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2.1,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.018),
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Payment activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredPayments.length} transaction
                {filteredPayments.length === 1 ? "" : "s"} · tenant revenue only
              </Typography>
            </Box>

            <Chip
              size="small"
              label={selectedLibrary?.name || "No library selected"}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 750 }}
            />
          </Stack>
        </Box>

        {loadingLibraries || loadingPayments ? (
          <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading member payments...
              </Typography>
            </Stack>
          </Box>
        ) : !libraryId ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={800}>
              Select a library
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Choose a library to view member payment activity.
            </Typography>
          </Box>
        ) : filteredPayments.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", px: 2 }}>
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.07),
                color: "primary.main",
              }}
            >
              <ReceiptLongOutlinedIcon />
            </Box>

            <Typography variant="h6" fontWeight={850}>
              No member payment transactions found
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {activeFilters > 0
                ? "No transactions match the selected filters."
                : "Platform subscription payments are shown separately under Subscription & Billing."}
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider flexItem />}>
            {filteredPayments.map((payment) => {
              const paymentId = Number(
                payment.paymentId ?? payment.transactionId ?? payment.id,
              );

              const isDownloading = downloadingInvoicePaymentId === paymentId;

              return (
                <Box
                  key={payment.paymentId ?? payment.transactionId ?? payment.id}
                  sx={{
                    px: { xs: 2, md: 2.6 },
                    py: 2.25,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.018),
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={2.3}
                    alignItems={{ xs: "stretch", lg: "center" }}
                  >
                    {/* MEMBER */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ minWidth: { lg: 265 } }}
                    >
                      <Avatar
                        src={payment.profileImageUrl || undefined}
                        alt={payment.customerName || "Member"}
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 850,
                          border: "2px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.13),
                        }}
                      >
                        {!payment.profileImageUrl
                          ? getInitials(payment.customerName)
                          : null}
                      </Avatar>

                      <Box minWidth={0}>
                        <Typography variant="body2" fontWeight={850} noWrap>
                          {payment.customerName || "Member"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {payment.customerEmail || "No email"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight={750}
                        >
                          Payment #
                          {payment.paymentId ?? payment.transactionId ?? "-"}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* PAYMENT FOR */}
                    <Box sx={{ minWidth: { lg: 170 } }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Payment For
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        mt={0.45}
                      >
                        <Chip
                          size="small"
                          label={getReferenceLabel(payment.referenceType)}
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 750 }}
                        />
                        {payment.referenceId != null && (
                          <Typography variant="caption" color="text.secondary">
                            #{payment.referenceId}
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    {/* AMOUNT */}
                    <Box sx={{ minWidth: { lg: 135 } }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{ lineHeight: 1.35 }}
                      >
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                      {Number(payment.refundedAmount || 0) > 0 && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={700}
                        >
                          Refunded{" "}
                          {formatCurrency(
                            payment.refundedAmount,
                            payment.currency,
                          )}
                        </Typography>
                      )}
                    </Box>

                    {/* METHOD */}
                    <Box sx={{ minWidth: { lg: 125 } }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Method
                      </Typography>
                      <Typography variant="body2" fontWeight={750}>
                        {payment.paymentMethod || "-"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.paymentGateway || "Gateway not provided"}
                      </Typography>
                    </Box>

                    {/* DATE */}
                    <Box sx={{ minWidth: { lg: 160 } }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Date
                      </Typography>
                      <Typography variant="body2" fontWeight={750}>
                        {formatDateTime(payment.createdAt)}
                      </Typography>
                      {payment.receiptNumber && (
                        <Typography variant="caption" color="text.secondary">
                          Receipt {payment.receiptNumber}
                        </Typography>
                      )}
                    </Box>

                    {/* STATUS / ACTION */}
                    <Stack
                      direction={{ xs: "row", lg: "column" }}
                      justifyContent={{ xs: "space-between", lg: "center" }}
                      alignItems={{ xs: "center", lg: "flex-end" }}
                      spacing={1}
                      sx={{ ml: { lg: "auto" }, minWidth: { lg: 160 } }}
                    >
                      <Chip
                        label={getStatusLabel(payment.status)}
                        color={getStatusColor(payment.status)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 800 }}
                      />

                      {payment.status === "SUCCESS" && (
                        <Tooltip title="Download payment invoice">
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={
                                isDownloading ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <DownloadOutlinedIcon fontSize="small" />
                                )
                              }
                              disabled={isDownloading}
                              onClick={() =>
                                handleDownloadMemberInvoice(payment)
                              }
                              sx={{
                                borderRadius: 2,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {isDownloading ? "Downloading..." : "Invoice"}
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {(payment.gatewayPaymentId || payment.gatewayOrderId) && (
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 1.7,
                        px: 1.6,
                        py: 1.15,
                        borderRadius: 2.2,
                        bgcolor: alpha(theme.palette.text.primary, 0.015),
                      }}
                    >
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={{ xs: 0.6, md: 3 }}
                      >
                        {payment.gatewayPaymentId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Gateway Payment:</strong>{" "}
                            {payment.gatewayPaymentId}
                          </Typography>
                        )}

                        {payment.gatewayOrderId && (
                          <Typography variant="caption" color="text.secondary">
                            <strong>Gateway Order:</strong>{" "}
                            {payment.gatewayOrderId}
                          </Typography>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Card>
    </Box>
  );
}

export default Payments;
