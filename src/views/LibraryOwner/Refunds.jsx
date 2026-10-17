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
  InputAdornment,
  InputLabel,
  IconButton,
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

import SearchIcon from "@mui/icons-material/Search";
import ReplayIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import refundApi from "../../api/refundApi";
import ownerPaymentApi from "../../api/ownerPaymentApi";

// =============================================================
// HELPERS
// =============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

const getInitials = (name) => {
  const parts = String(name || "Member")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "M";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) =>
  `₹${safeNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

// =============================================================
// STATUS CHIP
// =============================================================

function RefundStatusChip({ status }) {
  const config = {
    PENDING: {
      label: "Pending",
      color: "warning",
    },

    PROCESSING: {
      label: "Processing",
      color: "warning",
    },

    SUCCESS: {
      label: "Successful",
      color: "success",
    },

    FAILED: {
      label: "Failed",
      color: "error",
    },

    CANCELLED: {
      label: "Cancelled",
      color: "default",
    },
  };

  const current = config[status] || {
    label: status || "-",

    color: "default",
  };

  return (
    <Chip
      size="small"
      variant="outlined"
      label={current.label}
      color={current.color}
    />
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({ title, value, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",

        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 0.5,
              }}
            >
              {value}
            </Typography>
          </Box>

          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// MAIN PAGE
// =============================================================

function Refunds() {
  // =========================================================
  // LIBRARY
  // =========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  // =========================================================
  // REFUND DATA
  // =========================================================

  const [refunds, setRefunds] = useState([]);

  const [summary, setSummary] = useState(null);

  // =========================================================
  // PAYMENT DATA
  // =========================================================

  const [payments, setPayments] = useState([]);

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [typeFilter, setTypeFilter] = useState("ALL");

  // =========================================================
  // CREATE REFUND
  // =========================================================

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const [refundAmount, setRefundAmount] = useState("");

  const [refundReason, setRefundReason] = useState("");

  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const [refundFormError, setRefundFormError] = useState("");

  // =========================================================
  // DETAILS DIALOG
  // =========================================================

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedRefund, setSelectedRefund] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  // =========================================================
  // LOAD LIBRARIES
  // =========================================================

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await libraryApi.getMyLibraries();

        const list = Array.isArray(data) ? data : [];

        setLibraries(list);

        if (list.length > 0) {
          const storedLibraryId = getStoredLibraryId();

          const storedLibrary =
            storedLibraryId != null
              ? list.find(
                  (library) => Number(library?.id) === Number(storedLibraryId),
                )
              : null;

          const selectedLibrary = storedLibrary || list[0];

          setSelectedLibraryId(String(selectedLibrary.id));

          storeLibraryId(selectedLibrary.id);
        }
      } catch (err) {
        console.error("Failed to load libraries:", err);

        setError(getErrorMessage(err, "Failed to load your libraries."));
      } finally {
        setLoading(false);
      }
    };

    loadLibraries();
  }, []);

  // =========================================================
  // LOAD REFUNDS + PAYMENTS
  // =========================================================

  const loadRefundData = async (libraryId) => {
    if (!libraryId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [refundList, refundSummary, paymentList] = await Promise.all([
        refundApi.getLibraryRefunds(libraryId),

        refundApi.getRefundSummary(libraryId),

        ownerPaymentApi.getLibraryPayments(libraryId),
      ]);

      setRefunds(Array.isArray(refundList) ? refundList : []);

      setSummary(refundSummary || null);

      setPayments(Array.isArray(paymentList) ? paymentList : []);
    } catch (err) {
      console.error("Failed to load refund data:", err);

      setError(getErrorMessage(err, "Failed to load refunds."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLibraryId) {
      loadRefundData(Number(selectedLibraryId));
    }
  }, [selectedLibraryId]);

  // =========================================================
  // SELECTED LIBRARY
  // =========================================================

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,

    [libraries, selectedLibraryId],
  );

  const matchedPaymentById = useMemo(
    () =>
      new Map(payments.map((payment) => [String(payment.paymentId), payment])),
    [payments],
  );

  const getRefundProfileImageUrl = (refund) =>
    refund?.profileImageUrl ||
    matchedPaymentById.get(String(refund?.paymentTransactionId ?? ""))
      ?.profileImageUrl ||
    "";

  const handleLibraryChange = (event) => {
    const nextLibraryId = String(event.target.value);

    setSelectedLibraryId(nextLibraryId);

    storeLibraryId(nextLibraryId);

    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSuccess("");
    setError("");

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: {
          libraryId: Number(nextLibraryId),
        },
      }),
    );
  };

  const handleRefresh = async () => {
    if (!selectedLibraryId) {
      return;
    }

    await loadRefundData(Number(selectedLibraryId));
  };

  // =========================================================
  // ELIGIBLE PAYMENTS
  // =========================================================

  const refundablePayments = useMemo(
    () =>
      payments.filter((payment) => {
        const status = payment.status;

        if (status !== "SUCCESS" && status !== "PARTIALLY_REFUNDED") {
          return false;
        }

        const amount = safeNumber(payment.amount);

        const refunded = safeNumber(payment.refundedAmount);

        const remaining = amount - refunded;

        return remaining > 0;
      }),

    [payments],
  );

  // =========================================================
  // SELECTED PAYMENT
  // =========================================================

  const selectedPayment = useMemo(
    () =>
      refundablePayments.find(
        (payment) => String(payment.paymentId) === String(selectedPaymentId),
      ) || null,

    [refundablePayments, selectedPaymentId],
  );

  const remainingRefundable = useMemo(() => {
    if (!selectedPayment) {
      return 0;
    }

    return Math.max(
      safeNumber(selectedPayment.amount) -
        safeNumber(selectedPayment.refundedAmount),

      0,
    );
  }, [selectedPayment]);

  // =========================================================
  // FILTER REFUNDS
  // =========================================================

  const filteredRefunds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return refunds.filter((refund) => {
      const matchesSearch =
        !query ||
        String(refund.refundId ?? "")
          .toLowerCase()
          .includes(query) ||
        String(refund.paymentTransactionId ?? "")
          .toLowerCase()
          .includes(query) ||
        String(refund.customerName ?? "")
          .toLowerCase()
          .includes(query) ||
        String(refund.customerEmail ?? "")
          .toLowerCase()
          .includes(query) ||
        String(refund.gatewayRefundId ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" || refund.status === statusFilter;

      const matchesType =
        typeFilter === "ALL" || refund.referenceType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [refunds, search, statusFilter, typeFilter]);

  // =========================================================
  // REFERENCE TYPES
  // =========================================================

  const referenceTypes = useMemo(
    () => [
      ...new Set(refunds.map((refund) => refund.referenceType).filter(Boolean)),
    ],

    [refunds],
  );

  // =========================================================
  // OPEN CREATE REFUND
  // =========================================================

  const handleOpenRefund = () => {
    setSelectedPaymentId("");

    setRefundAmount("");

    setRefundReason("");

    setRefundFormError("");

    setRefundDialogOpen(true);
  };

  // =========================================================
  // SELECT PAYMENT
  // =========================================================

  const handlePaymentSelection = (event) => {
    const paymentId = event.target.value;

    setSelectedPaymentId(paymentId);

    const payment = refundablePayments.find(
      (item) => String(item.paymentId) === String(paymentId),
    );

    if (payment) {
      const remaining = Math.max(
        safeNumber(payment.amount) - safeNumber(payment.refundedAmount),

        0,
      );

      setRefundAmount(String(remaining));
    } else {
      setRefundAmount("");
    }

    setRefundFormError("");
  };

  // =========================================================
  // CREATE REFUND
  // =========================================================

  const handleCreateRefund = async () => {
    if (!selectedPayment) {
      setRefundFormError("Please select a payment.");

      return;
    }

    const amount = Number(refundAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setRefundFormError("Refund amount must be greater than zero.");

      return;
    }

    if (amount > remainingRefundable) {
      setRefundFormError(
        `Refund amount cannot exceed ${formatMoney(remainingRefundable)}.`,
      );

      return;
    }

    if (!refundReason.trim()) {
      setRefundFormError("Refund reason is required.");

      return;
    }

    try {
      setRefundSubmitting(true);

      setRefundFormError("");

      setError("");
      setSuccess("");

      await refundApi.createRefund(Number(selectedLibraryId), {
        paymentTransactionId: Number(selectedPayment.paymentId),

        refundAmount: amount,

        reason: refundReason.trim(),
      });

      setRefundDialogOpen(false);

      setSuccess("Refund processed successfully.");

      await loadRefundData(Number(selectedLibraryId));
    } catch (err) {
      console.error("Refund failed:", err);

      setRefundFormError(
        getErrorMessage(err, "Refund could not be processed."),
      );
    } finally {
      setRefundSubmitting(false);
    }
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewRefund = async (refundId) => {
    try {
      setDetailsOpen(true);

      setDetailsLoading(true);

      setSelectedRefund(null);

      const data = await refundApi.getRefundById(
        Number(selectedLibraryId),
        refundId,
      );

      setSelectedRefund(data);
    } catch (err) {
      console.error("Failed to load refund details:", err);

      setError(getErrorMessage(err, "Failed to load refund details."));

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // PREMIUM DERIVED METRICS
  // =========================================================

  const totalRefunds = safeNumber(summary?.totalRefunds ?? refunds.length);

  const successfulRefunds = safeNumber(summary?.successfulRefunds);

  const processingRefunds = safeNumber(summary?.processingRefunds);

  const failedRefunds = safeNumber(summary?.failedRefunds);

  const totalRefundedAmount = safeNumber(summary?.totalRefundedAmount);

  const todayRefundedAmount = safeNumber(summary?.todayRefundedAmount);

  const monthlyRefundedAmount = safeNumber(summary?.monthlyRefundedAmount);

  const refundableBalance = refundablePayments.reduce(
    (total, payment) =>
      total +
      Math.max(
        safeNumber(payment.amount) - safeNumber(payment.refundedAmount),
        0,
      ),
    0,
  );

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    statusFilter !== "ALL" ? 1 : 0,
    typeFilter !== "ALL" ? 1 : 0,
  ].reduce((total, value) => total + value, 0);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
  };

  // =========================================================
  // LOADING FIRST SCREEN
  // =========================================================

  if (loading && libraries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 430,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={34} />

          <Typography variant="body2" color="text.secondary">
            Loading refund workspace...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* PREMIUM HEADER */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          px: { xs: 2.25, md: 3.5 },
          py: { xs: 2.5, md: 3 },
          border: "1px solid",
          borderColor: "rgba(79, 70, 229, 0.16)",
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(255,255,255,0.98) 48%, rgba(14,165,233,0.06) 100%)",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            bgcolor: "rgba(79, 70, 229, 0.05)",
            top: -105,
            right: -35,
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={2.5}
          sx={{ position: "relative" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 62,
                height: 62,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: "common.white",
                background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
                boxShadow: "0 12px 28px rgba(79, 70, 229, 0.24)",
                flexShrink: 0,
              }}
            >
              <ReplayIcon sx={{ fontSize: 30 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography variant="h5" fontWeight={850}>
                  Refunds
                </Typography>

                <Chip
                  size="small"
                  label="Refund intelligence"
                  icon={<TrendingDownIcon />}
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    bgcolor: "rgba(79,70,229,0.04)",
                    borderColor: "rgba(79,70,229,0.22)",
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.45, maxWidth: 720 }}
              >
                Review refund health, process eligible member payments and trace
                every refund from one workspace.
              </Typography>

              {selectedLibrary && (
                <Chip
                  size="small"
                  label={selectedLibrary.name}
                  sx={{
                    mt: 1.25,
                    fontWeight: 700,
                    bgcolor: "background.paper",
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems="stretch"
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 235 },
                bgcolor: "background.paper",
                borderRadius: 2.5,
              }}
            >
              <InputLabel>Working Library</InputLabel>

              <Select
                value={selectedLibraryId}
                label="Working Library"
                onChange={handleLibraryChange}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh refund data">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading || !selectedLibraryId}
                  sx={{
                    width: 42,
                    height: 42,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {loading ? <CircularProgress size={19} /> : <RefreshIcon />}
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<ReplayIcon />}
              endIcon={<ArrowForwardIcon />}
              onClick={handleOpenRefund}
              disabled={refundablePayments.length === 0}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                px: 2.25,
                fontWeight: 750,
                boxShadow: "0 10px 22px rgba(79,70,229,0.18)",
              }}
            >
              Create Refund
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {success}
        </Alert>
      )}

      {/* PRIMARY KPI CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <PremiumMetricCard
          title="Total Refunded"
          value={formatMoney(totalRefundedAmount)}
          subtitle={`${totalRefunds} refund records`}
          icon={<CurrencyRupeeIcon />}
          tone="primary"
        />

        <PremiumMetricCard
          title="Successful Refunds"
          value={successfulRefunds}
          subtitle="Completed successfully"
          icon={<CheckCircleIcon />}
          tone="success"
        />

        <PremiumMetricCard
          title="In Progress"
          value={processingRefunds}
          subtitle="Pending or processing"
          icon={<PendingActionsIcon />}
          tone="warning"
        />

        <PremiumMetricCard
          title="Refundable Balance"
          value={formatMoney(refundableBalance)}
          subtitle={`${refundablePayments.length} eligible payments`}
          icon={<AccountBalanceWalletIcon />}
          tone="info"
        />
      </Box>

      {/* SECONDARY INSIGHT BAR */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.12)",
          bgcolor: "rgba(248,250,252,0.8)",
        }}
      >
        <CardContent sx={{ py: 1.7 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, md: 4 }}
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: { xs: "none", md: "block" } }}
              />
            }
          >
            <InsightStat
              label="Today refunded"
              value={formatMoney(todayRefundedAmount)}
            />

            <InsightStat
              label="This month"
              value={formatMoney(monthlyRefundedAmount)}
            />

            <InsightStat label="Failed refunds" value={failedRefunds} />

            <InsightStat
              label="Visible records"
              value={`${filteredRefunds.length} of ${refunds.length}`}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* FILTER WORKSPACE */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 32px rgba(15, 23, 42, 0.04)",
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", lg: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search refund, member, payment or gateway refund..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: { lg: 170 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PROCESSING">Processing</MenuItem>
                <MenuItem value="SUCCESS">Successful</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { lg: 190 } }}>
              <InputLabel>Reference Type</InputLabel>
              <Select
                value={typeFilter}
                label="Reference Type"
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Types</MenuItem>

                {referenceTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {formatReferenceType(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant={activeFilterCount > 0 ? "outlined" : "text"}
              startIcon={<FilterAltOffIcon />}
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              sx={{
                minWidth: 135,
                borderRadius: 2.5,
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* REFUND DIRECTORY */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0 14px 42px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Box sx={{ px: 2.75, py: 2.15 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Refund activity
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {filteredRefunds.length} refund
                {filteredRefunds.length === 1 ? "" : "s"} match the current view
              </Typography>
            </Box>

            <Chip
              size="small"
              variant="outlined"
              icon={<ReceiptLongIcon />}
              label={`${refunds.length} total`}
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 300,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={30} />
              <Typography variant="body2" color="text.secondary">
                Refreshing refund activity...
              </Typography>
            </Stack>
          </Box>
        ) : filteredRefunds.length === 0 ? (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(79,70,229,0.08)",
                color: "primary.main",
                mb: 1.5,
              }}
            >
              <ReplayIcon sx={{ fontSize: 28 }} />
            </Box>

            <Typography variant="h6" fontWeight={800}>
              No refunds found
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, maxWidth: 420 }}
            >
              {activeFilterCount > 0
                ? "No refund transactions match your current filters. Clear the filters to see all activity."
                : "Refund transactions will appear here after a member payment is refunded."}
            </Typography>

            {activeFilterCount > 0 && (
              <Button sx={{ mt: 1.5 }} onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "rgba(248,250,252,0.9)",
                  }}
                >
                  <TableCell sx={{ fontWeight: 750 }}>Refund</TableCell>
                  <TableCell sx={{ fontWeight: 750 }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 750 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 750 }}>
                    Payment
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 750 }}>
                    Refund
                  </TableCell>
                  <TableCell sx={{ fontWeight: 750 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 750 }}>Processed</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 750 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRefunds.map((refund) => {
                  const profileImageUrl = getRefundProfileImageUrl(refund);

                  return (
                    <TableRow
                      key={refund.refundId}
                      hover
                      sx={{
                        "&:last-child td": {
                          borderBottom: 0,
                        },
                        "&:hover": {
                          bgcolor: "rgba(79,70,229,0.025)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={750}>
                          RF-{refund.refundId}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Payment #{refund.paymentTransactionId}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          <Avatar
                            src={profileImageUrl || undefined}
                            alt={refund.customerName || "Member"}
                            sx={{
                              width: 38,
                              height: 38,
                              fontSize: 13,
                              fontWeight: 800,
                              bgcolor: "rgba(79,70,229,0.1)",
                              color: "primary.main",
                              border: "2px solid rgba(79,70,229,0.12)",
                            }}
                          >
                            {!profileImageUrl
                              ? getInitials(refund.customerName)
                              : null}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {refund.customerName || "Member"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {refund.customerEmail || "-"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={formatReferenceType(refund.referenceType)}
                          sx={{ fontWeight: 650 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatMoney(refund.paymentAmount)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={800}>
                          {formatMoney(refund.refundAmount)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <RefundStatusChip status={refund.status} />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(
                            refund.processedAt || refund.createdAt,
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View refund details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewRefund(refund.refundId)}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* CREATE REFUND DIALOG */}
      <Dialog
        open={refundDialogOpen}
        onClose={() => {
          if (!refundSubmitting) {
            setRefundDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.25 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(79,70,229,0.1)",
                  color: "primary.main",
                }}
              >
                <ReplayIcon />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Create Refund
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Refund an eligible LibraryHub member payment.
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={() => setRefundDialogOpen(false)}
              disabled={refundSubmitting}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2.25}>
            {refundFormError && (
              <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                {refundFormError}
              </Alert>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Payment</InputLabel>
              <Select
                value={selectedPaymentId}
                label="Payment"
                onChange={handlePaymentSelection}
              >
                {refundablePayments.map((payment) => {
                  const remaining = Math.max(
                    safeNumber(payment.amount) -
                      safeNumber(payment.refundedAmount),
                    0,
                  );

                  return (
                    <MenuItem
                      key={payment.paymentId}
                      value={String(payment.paymentId)}
                    >
                      #{payment.paymentId} · {payment.customerName || "Member"}{" "}
                      · {formatMoney(remaining)} refundable
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {selectedPayment && (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "rgba(79,70,229,0.15)",
                  bgcolor: "rgba(79,70,229,0.035)",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        src={selectedPayment.profileImageUrl || undefined}
                        sx={{
                          width: 42,
                          height: 42,
                          fontWeight: 800,
                          bgcolor: "rgba(79,70,229,0.12)",
                          color: "primary.main",
                        }}
                      >
                        {!selectedPayment.profileImageUrl
                          ? getInitials(selectedPayment.customerName)
                          : null}
                      </Avatar>

                      <Box>
                        <Typography fontWeight={750}>
                          {selectedPayment.customerName || "Member"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Payment #{selectedPayment.paymentId}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <DetailRow
                      label="Original Amount"
                      value={formatMoney(selectedPayment.amount)}
                    />

                    <DetailRow
                      label="Already Refunded"
                      value={formatMoney(selectedPayment.refundedAmount)}
                    />

                    <DetailRow
                      label="Remaining Refundable"
                      value={formatMoney(remainingRefundable)}
                      strong
                    />
                  </Stack>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              label="Refund Amount"
              type="number"
              value={refundAmount}
              onChange={(event) => {
                setRefundAmount(event.target.value);
                setRefundFormError("");
              }}
              helperText={
                selectedPayment
                  ? `Maximum refundable: ${formatMoney(remainingRefundable)}`
                  : "Select a payment to see its refundable balance."
              }
              slotProps={{
                htmlInput: {
                  min: 0.01,
                  step: 0.01,
                  max: remainingRefundable || undefined,
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Refund Reason"
              placeholder="Enter the reason for this refund..."
              value={refundReason}
              onChange={(event) => {
                setRefundReason(event.target.value);
                setRefundFormError("");
              }}
            />

            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              The refund amount is validated against the remaining refundable
              balance before processing.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setRefundDialogOpen(false)}
            disabled={refundSubmitting}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              refundSubmitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ReplayIcon />
              )
            }
            disabled={
              refundSubmitting ||
              !selectedPayment ||
              !refundReason.trim() ||
              !Number.isFinite(Number(refundAmount)) ||
              Number(refundAmount) <= 0 ||
              Number(refundAmount) > remainingRefundable
            }
            onClick={handleCreateRefund}
            sx={{ borderRadius: 2.5, px: 2.25 }}
          >
            {refundSubmitting ? "Processing..." : "Process Refund"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS DIALOG */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.25 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(14,165,233,0.1)",
                  color: "info.main",
                }}
              >
                <ReceiptLongIcon />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Refund Details
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full refund and gateway traceability.
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2.5 }}>
          {detailsLoading ? (
            <Box
              sx={{
                py: 7,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : selectedRefund ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={getRefundProfileImageUrl(selectedRefund) || undefined}
                  alt={selectedRefund.customerName || "Member"}
                  sx={{
                    width: 52,
                    height: 52,
                    fontWeight: 800,
                    bgcolor: "rgba(79,70,229,0.1)",
                    color: "primary.main",
                  }}
                >
                  {!getRefundProfileImageUrl(selectedRefund)
                    ? getInitials(selectedRefund.customerName)
                    : null}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={800}>
                    {selectedRefund.customerName || "Member"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRefund.customerEmail || "-"}
                  </Typography>
                </Box>

                <RefundStatusChip
                  status={selectedRefund.refundStatus || selectedRefund.status}
                />
              </Stack>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1.25}>
                    <DetailRow
                      label="Refund ID"
                      value={`#${selectedRefund.refundId}`}
                    />
                    <DetailRow
                      label="Payment Transaction"
                      value={`#${selectedRefund.paymentTransactionId}`}
                    />
                    <DetailRow
                      label="Library"
                      value={
                        selectedRefund.libraryName ||
                        selectedLibrary?.name ||
                        "-"
                      }
                    />
                    <DetailRow
                      label="Reference Type"
                      value={formatReferenceType(selectedRefund.referenceType)}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "rgba(79,70,229,0.14)",
                  bgcolor: "rgba(79,70,229,0.025)",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={1.25}>
                    <DetailRow
                      label="Original Payment"
                      value={formatMoney(selectedRefund.originalPaymentAmount)}
                    />
                    <DetailRow
                      label="This Refund"
                      value={formatMoney(selectedRefund.refundAmount)}
                      strong
                    />
                    <DetailRow
                      label="Total Refunded"
                      value={formatMoney(selectedRefund.totalRefundedAmount)}
                    />
                    <DetailRow
                      label="Remaining Refundable"
                      value={formatMoney(
                        selectedRefund.remainingRefundableAmount,
                      )}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Stack spacing={1.25}>
                <DetailRow
                  label="Payment Status"
                  value={selectedRefund.paymentStatus || "-"}
                />
                <DetailRow
                  label="Gateway Payment ID"
                  value={selectedRefund.gatewayPaymentId || "-"}
                />
                <DetailRow
                  label="Gateway Refund ID"
                  value={selectedRefund.gatewayRefundId || "-"}
                />
                <DetailRow
                  label="Requested By"
                  value={selectedRefund.requestedByName || "-"}
                />
                <DetailRow
                  label="Processed At"
                  value={formatDateTime(selectedRefund.processedAt)}
                />
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "rgba(248,250,252,0.9)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  REFUND REASON
                </Typography>

                <Typography variant="body2" sx={{ mt: 0.6 }}>
                  {selectedRefund.reason || "-"}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDetailsOpen(false)}
            sx={{ borderRadius: 2.5 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// PREMIUM COMPONENTS
// =============================================================

function PremiumMetricCard({ title, value, subtitle, icon, tone = "primary" }) {
  const toneStyles = {
    primary: {
      bg: "rgba(79,70,229,0.08)",
      fg: "primary.main",
      border: "rgba(79,70,229,0.14)",
    },
    success: {
      bg: "rgba(34,197,94,0.09)",
      fg: "success.main",
      border: "rgba(34,197,94,0.16)",
    },
    warning: {
      bg: "rgba(245,158,11,0.10)",
      fg: "warning.main",
      border: "rgba(245,158,11,0.18)",
    },
    info: {
      bg: "rgba(14,165,233,0.09)",
      fg: "info.main",
      border: "rgba(14,165,233,0.16)",
    },
  };

  const style = toneStyles[tone] || toneStyles.primary;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: style.border,
        background:
          "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.92) 100%)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {title}
            </Typography>

            <Typography variant="h5" fontWeight={850} sx={{ mt: 0.45 }}>
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: style.bg,
              color: style.fg,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InsightStat({ label, value }) {
  return (
    <Box sx={{ minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography variant="body1" fontWeight={750} sx={{ mt: 0.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

function formatReferenceType(value) {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// =============================================================
// DETAIL ROW
// =============================================================

function DetailRow({ label, value, strong = false }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      alignItems="flex-start"
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={strong ? 800 : 650}
        textAlign="right"
        sx={{
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default Refunds;
