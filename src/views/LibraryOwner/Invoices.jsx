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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
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
  alpha,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import VisibilityIcon from "@mui/icons-material/Visibility";

import DownloadIcon from "@mui/icons-material/Download";

import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import PercentIcon from "@mui/icons-material/Percent";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import RefreshIcon from "@mui/icons-material/Refresh";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { useLocation, useNavigate } from "react-router-dom";

import libraryApi from "../../api/libraryApi";

import invoiceApi from "../../api/invoiceApi";

import ownerPaymentApi from "../../api/ownerPaymentApi";

import platformSubscriptionApi from "../../api/platformSubscriptionApi";

// ============================================================

// CONSTANTS

// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const MEMBER_PAYMENT_REFERENCE_TYPES = new Set([
  "MEMBERSHIP",

  "BOOKING",

  "SUBSCRIPTION_RENEWAL",

  "SECURITY_DEPOSIT",

  "LATE_FEE",

  "OTHER",
]);

// ============================================================

// HELPERS

// ============================================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value, currency = "INR") => {
  const amount = safeNumber(value);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",

      currency: currency || "INR",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    })}`;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

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

// ============================================================

// STATUS CHIP

// ============================================================

function InvoiceStatusChip({ status }) {
  const config = {
    GENERATED: {
      label: "Generated",

      color: "success",
    },

    PAID: {
      label: "Paid",

      color: "success",
    },

    CANCELLED: {
      label: "Cancelled",

      color: "error",
    },

    VOID: {
      label: "Void",

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

// ============================================================

// SUMMARY CARD

// ============================================================

function SummaryCard({ title, value, icon, helper }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        background: (theme) =>
          `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.025)} 100%)`,
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: 0.3 }}
            >
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ mt: 0.55 }}>
              {value}
            </Typography>
            {helper && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {helper}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
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

// DETAIL ROW

// ============================================================

function DetailRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={strong ? 700 : 600}
        textAlign="right"
      >
        {value}
      </Typography>
    </Stack>
  );
}

// ============================================================

// MAIN PAGE

// ============================================================

function Invoices() {
  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================

  // NOTIFICATION DEEP LINK

  // ==========================================================

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  const isPlatformInvoiceNotification =
    fromNotification && notificationReferenceType === "PLATFORM_INVOICE";

  /**

   \* Default Finance -> Invoices behavior:

   \* show student/member invoices only.

   \*

   \* SubscriptionBilling can navigate here with:

   \*

   \* navigate("/owner/invoices", {

   \*   state: { invoiceScope: "platform" }

   \* })

   \*

   \* so platform invoices remain separated from tenant revenue.

   */

  const invoiceScope =
    isPlatformInvoiceNotification || location.state?.invoiceScope === "platform"
      ? "platform"
      : "member";

  // ==========================================================

  // LIBRARY

  // ==========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  // ==========================================================

  // INVOICES

  // ==========================================================

  const [invoices, setInvoices] = useState([]);

  const [memberPaymentMap, setMemberPaymentMap] = useState(() => new Map());

  // ==========================================================

  // PAGE STATE

  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState(null);

  // ==========================================================

  // FILTERS

  // ==========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  // ==========================================================

  // DETAILS

  // ==========================================================

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  // ==========================================================

  // DOWNLOAD

  // ==========================================================

  const [downloadingId, setDownloadingId] = useState(null);

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

    /**

     \* Recovery for accounts containing old empty duplicate

     \* DRAFT libraries: prefer the library with an ACTIVE

     \* LibraryHub subscription.

     */

    for (const library of libraryList) {
      try {
        const active = await platformSubscriptionApi.getActiveSubscription(
          library.id,
        );

        if (active) {
          return library;
        }
      } catch {
        // Continue.
      }
    }

    return libraryList[0];
  }, []);

  // ==========================================================

  // LOAD LIBRARIES

  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadLibraries = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await libraryApi.getMyLibraries();

        const list = normalizeListResponse(data);

        if (!mounted) {
          return;
        }

        setLibraries(list);

        if (list.length === 0) {
          setSelectedLibraryId("");

          setInvoices([]);

          return;
        }

        const selectedLibrary = await resolveInitialLibrary(list);

        if (!mounted) {
          return;
        }

        const id = String(selectedLibrary.id);

        setSelectedLibraryId(id);

        storeLibraryId(id);
      } catch (err) {
        console.error("Failed to load libraries:", err);

        if (mounted) {
          setError(getErrorMessage(err, "Failed to load libraries."));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadLibraries();

    return () => {
      mounted = false;
    };
  }, [resolveInitialLibrary]);

  // ==========================================================

  // LOAD MEMBER TRANSACTION IDS

  // ==========================================================

  const loadMemberTransactionIds = useCallback(async (libraryId) => {
    const response = await ownerPaymentApi.getLibraryPayments(libraryId);
    const payments = normalizeListResponse(response).filter((payment) =>
      MEMBER_PAYMENT_REFERENCE_TYPES.has(payment?.referenceType),
    );
    const paymentMap = new Map();
    payments.forEach((payment) => {
      const id = Number(
        payment?.paymentId ?? payment?.transactionId ?? payment?.id,
      );
      if (Number.isFinite(id)) paymentMap.set(id, payment);
    });
    setMemberPaymentMap(paymentMap);
    return new Set(paymentMap.keys());
  }, []);

  // ==========================================================

  // LOAD PLATFORM TRANSACTION IDS

  // ==========================================================

  const loadPlatformTransactionIds = useCallback(async (libraryId) => {
    const response =
      await platformSubscriptionApi.getLibrarySubscriptions(libraryId);

    const subscriptions = normalizeListResponse(response);

    return new Set(
      subscriptions

        .map((subscription) => Number(subscription?.paymentTransactionId))

        .filter(Number.isFinite),
    );
  }, []);

  // ==========================================================

  // LOAD INVOICES

  // ==========================================================

  const loadInvoices = useCallback(
    async (libraryId) => {
      if (!libraryId) {
        setInvoices([]);

        return;
      }

      try {
        setLoading(true);

        setError("");

        if (invoiceScope === "platform") setMemberPaymentMap(new Map());

        const [invoiceResponse, allowedTransactionIds] = await Promise.all([
          invoiceApi.getLibraryInvoices(libraryId),

          invoiceScope === "platform"
            ? loadPlatformTransactionIds(libraryId)
            : loadMemberTransactionIds(libraryId),
        ]);

        const allInvoices = normalizeListResponse(invoiceResponse);

        /**

         \* PaymentInvoiceResponse currently does not expose

         \* PaymentReferenceType. Therefore scope the invoice list

         \* using the known payment transaction IDs.

         \*

         \* member scope:

         \*   MEMBERSHIP / BOOKING / RENEWAL / etc.

         \*

         \* platform scope:

         \*   PLATFORM_SUBSCRIPTION only.

         */

        const scopedInvoices = allInvoices.filter((invoice) =>
          allowedTransactionIds.has(Number(invoice?.paymentTransactionId)),
        );

        setInvoices(scopedInvoices);
      } catch (err) {
        console.error("Failed to load invoices:", err);

        setInvoices([]);

        setError(getErrorMessage(err, "Failed to load invoices."));
      } finally {
        setLoading(false);
      }
    },

    [invoiceScope, loadMemberTransactionIds, loadPlatformTransactionIds],
  );

  useEffect(() => {
    if (selectedLibraryId) {
      loadInvoices(Number(selectedLibraryId));
    }
  }, [selectedLibraryId, loadInvoices]);

  // ==========================================================

  // RESOLVE PLATFORM INVOICE NOTIFICATION

  // ==========================================================

  useEffect(() => {
    if (
      !fromNotification ||
      notificationReferenceType !== "PLATFORM_INVOICE" ||
      !notificationReferenceId ||
      libraries.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const resolveNotificationTarget = async () => {
      const targetInvoiceId = Number(notificationReferenceId);

      if (!Number.isFinite(targetInvoiceId)) {
        if (!cancelled) {
          setError("Invalid platform invoice notification reference.");

          navigate(location.pathname, {
            replace: true,

            state: {
              invoiceScope: "platform",
            },
          });
        }

        return;
      }

      for (const library of libraries) {
        try {
          const [invoiceResponse, platformTransactionIds] = await Promise.all([
            invoiceApi.getLibraryInvoices(library.id),

            loadPlatformTransactionIds(library.id),
          ]);

          const candidateInvoices = normalizeListResponse(invoiceResponse);

          const matchingInvoice = candidateInvoices.find(
            (invoice) =>
              Number(invoice?.id ?? invoice?.invoiceId) === targetInvoiceId &&
              platformTransactionIds.has(Number(invoice?.paymentTransactionId)),
          );

          if (!matchingInvoice) {
            continue;
          }

          if (cancelled) {
            return;
          }

          const nextLibraryId = String(library.id);

          setSelectedLibraryId(nextLibraryId);

          storeLibraryId(nextLibraryId);

          setHighlightedInvoiceId(targetInvoiceId);

          setSuccess(
            `Platform invoice ${
              matchingInvoice.invoiceNumber || `#${targetInvoiceId}`
            } opened from notification.`,
          );

          navigate(location.pathname, {
            replace: true,

            state: {
              invoiceScope: "platform",
            },
          });

          return;
        } catch (notificationError) {
          /**

           \* This library does not own the target invoice,

           \* or one of the supporting scope lookups failed.

           \*

           \* Continue through the owner's remaining libraries.

           */

          console.debug(
            "Platform invoice notification lookup skipped library:",

            library?.id,

            notificationError,
          );
        }
      }

      if (!cancelled) {
        setError(
          `Platform invoice #${targetInvoiceId} could not be found in your libraries.`,
        );

        navigate(location.pathname, {
          replace: true,

          state: {
            invoiceScope: "platform",
          },
        });
      }
    };

    resolveNotificationTarget();

    return () => {
      cancelled = true;
    };
  }, [
    fromNotification,

    notificationReferenceId,

    notificationReferenceType,

    libraries,

    loadPlatformTransactionIds,

    location.pathname,

    navigate,
  ]);

  // ==========================================================

  // SCROLL TO HIGHLIGHTED INVOICE

  // ==========================================================

  useEffect(() => {
    if (!highlightedInvoiceId || loading) {
      return;
    }

    const targetExists = invoices.some(
      (invoice) =>
        Number(invoice?.id ?? invoice?.invoiceId) ===
        Number(highlightedInvoiceId),
    );

    if (!targetExists) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document

        .getElementById(`owner-invoice-${highlightedInvoiceId}`)

        ?.scrollIntoView({
          behavior: "smooth",

          block: "center",
        });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedInvoiceId, loading, invoices]);

  // ==========================================================

  // SUMMARY

  // ==========================================================

  const totalInvoiceAmount = useMemo(
    () =>
      invoices.reduce(
        (total, invoice) => total + safeNumber(invoice?.totalAmount),

        0,
      ),

    [invoices],
  );

  const totalTaxableAmount = useMemo(
    () =>
      invoices.reduce(
        (total, invoice) => total + safeNumber(invoice?.taxableAmount),

        0,
      ),

    [invoices],
  );

  const totalTax = Math.max(totalInvoiceAmount - totalTaxableAmount, 0);

  const generatedCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === "GENERATED").length,

    [invoices],
  );

  // ==========================================================

  // FILTER

  // ==========================================================

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const payment = memberPaymentMap.get(
        Number(invoice?.paymentTransactionId),
      );

      const matchesSearch =
        !query ||
        [
          invoice?.invoiceNumber,
          invoice?.paymentTransactionId,
          invoice?.customerId,
          payment?.customerName,
          payment?.customerEmail,
          payment?.receiptNumber,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter, memberPaymentMap]);

  // ==========================================================

  // VIEW DETAILS

  // ==========================================================

  const handleViewInvoice = async (invoiceId) => {
    try {
      setDetailsOpen(true);

      setDetailsLoading(true);

      setSelectedInvoice(null);

      const data = await invoiceApi.getInvoiceById(
        Number(selectedLibraryId),

        invoiceId,
      );

      setSelectedInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice:", err);

      setError(getErrorMessage(err, "Failed to load invoice details."));

      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================================

  // DOWNLOAD PDF

  // ==========================================================

  const handleDownloadInvoice = async (invoice) => {
    try {
      setDownloadingId(invoice.id);

      setError("");

      await invoiceApi.downloadInvoice(
        Number(selectedLibraryId),

        invoice.id,

        invoice.invoiceNumber,
      );
    } catch (err) {
      console.error("Failed to download invoice:", err);

      setError(getErrorMessage(err, "Failed to download invoice PDF."));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!selectedLibraryId) return;
    setSuccess("");
    await loadInvoices(Number(selectedLibraryId));
  }, [selectedLibraryId, loadInvoices]);

  // ==========================================================

  // ==========================================================

  // SELECTED LIBRARY

  // ==========================================================

  const selectedLibrary =
    libraries.find(
      (library) => String(library.id) === String(selectedLibraryId),
    ) ?? null;

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== "ALL";

  const getInvoicePayment = (invoice) =>
    memberPaymentMap.get(Number(invoice?.paymentTransactionId)) ?? null;

  const getInitials = (name) => {
    const parts = String(name || "Member")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return (
      parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "M"
    );
  };

  // ==========================================================

  // INITIAL LOADING

  // ==========================================================

  if (loading && libraries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================

  // RENDER

  // ==========================================================

  return (
    <Box>
      {/* PREMIUM HEADER */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          overflow: "hidden",
          borderRadius: 4,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.085)} 0%, ${theme.palette.background.paper} 52%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            right: -65,
            top: -95,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
            position: "relative",
            zIndex: 1,
            "&:last-child": { pb: { xs: 2.5, md: 3 } },
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  border: "1px solid",
                  borderColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.13),
                  flexShrink: 0,
                }}
              >
                <ReceiptLongIcon sx={{ fontSize: 30 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="h5" fontWeight={800}>
                    {invoiceScope === "platform"
                      ? "LibraryHub Billing Invoices"
                      : "Member Invoices"}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<AutoAwesomeIcon />}
                    label={
                      invoiceScope === "platform"
                        ? "Platform billing"
                        : "Invoice intelligence"
                    }
                    sx={{
                      fontWeight: 700,
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                    }}
                  />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {invoiceScope === "platform"
                    ? "Review LibraryHub plan invoices, GST breakup and downloadable billing records."
                    : "Review member invoices, tax breakup, customer context and downloadable PDFs from one workspace."}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.2 }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {selectedLibrary && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={selectedLibrary.name}
                    />
                  )}
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
                  />
                </Stack>
              </Box>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              alignItems={{ sm: "center" }}
            >
              {invoiceScope === "platform" && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/owner/subscription-billing")}
                  sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 700 }}
                >
                  Subscription & Billing
                </Button>
              )}
              <Tooltip title="Reload invoices">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={
                      loading ? <CircularProgress size={16} /> : <RefreshIcon />
                    }
                    onClick={handleRefresh}
                    disabled={!selectedLibraryId || loading}
                    sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Refresh
                  </Button>
                </span>
              </Tooltip>
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 230 },
                  bgcolor: "background.paper",
                  borderRadius: 2.5,
                }}
              >
                <InputLabel>Working Library</InputLabel>
                <Select
                  value={selectedLibraryId}
                  label="Working Library"
                  onChange={(event) => {
                    const nextId = String(event.target.value);
                    setSelectedLibraryId(nextId);
                    storeLibraryId(nextId);
                    setSearch("");
                    setStatusFilter("ALL");
                    setError("");
                    window.dispatchEvent(
                      new CustomEvent("owner-library-changed", {
                        detail: { libraryId: Number(nextId) },
                      }),
                    );
                  }}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {invoiceScope === "member" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          LibraryHub platform subscription invoices are intentionally excluded
          here. Open Subscription & Billing to view platform billing.
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* SUMMARY */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "repeat(2, 1fr)",

            lg: "repeat(4, 1fr)",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <SummaryCard
          title="Total Invoices"
          value={invoices.length}
          helper={
            invoiceScope === "platform"
              ? "Platform billing records"
              : "Member billing records"
          }
          icon={<ReceiptLongIcon />}
        />

        <SummaryCard
          title="Generated"
          value={generatedCount}
          helper="Ready for viewing or download"
          icon={<CheckCircleIcon />}
        />

        <SummaryCard
          title="Taxable Amount"
          value={formatMoney(totalTaxableAmount)}
          helper="Before GST"
          icon={<CurrencyRupeeIcon />}
        />

        <SummaryCard
          title="Total Tax"
          value={formatMoney(totalTax)}
          helper="CGST + SGST + IGST"
          icon={<PercentIcon />}
        />
      </Box>

      {/* FILTERS */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.25 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 1.75 }}
          >
            <Box>
              <Typography fontWeight={800}>Find an invoice</Typography>
              <Typography variant="caption" color="text.secondary">
                Search by invoice, payment, member, email or receipt.
              </Typography>
            </Box>
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
              >
                Clear filters
              </Button>
            )}
          </Stack>
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
              placeholder="Search invoice, payment, member, email or receipt..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>

                <MenuItem value="GENERATED">Generated</MenuItem>

                <MenuItem value="PAID">Paid</MenuItem>

                <MenuItem value="CANCELLED">Cancelled</MenuItem>

                <MenuItem value="VOID">Void</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Invoice directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredInvoices.length} invoice
                {filteredInvoices.length === 1 ? "" : "s"} match the current
                view
              </Typography>
            </Box>
            <Chip
              size="small"
              variant="outlined"
              icon={<DescriptionOutlinedIcon />}
              label={
                invoiceScope === "platform"
                  ? "Platform invoices"
                  : "Member invoices"
              }
            />
          </Stack>
        </Box>
        {loading ? (
          <Box
            sx={{
              minHeight: 280,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredInvoices.length === 0 ? (
          <Box
            sx={{
              minHeight: 280,

              display: "flex",

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              textAlign: "center",

              px: 2,
            }}
          >
            <ReceiptLongIcon
              sx={{
                fontSize: 48,

                color: "text.disabled",

                mb: 1.5,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No invoices found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {invoiceScope === "platform"
                ? "Platform subscription invoices for this library will appear here."
                : "Member payment invoices for this library will appear here."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>

                  <TableCell>Payment</TableCell>

                  <TableCell>Customer</TableCell>

                  <TableCell>Invoice Date</TableCell>

                  <TableCell align="right">Taxable</TableCell>

                  <TableCell align="right">Tax</TableCell>

                  <TableCell align="right">Total</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const invoiceTax =
                    safeNumber(invoice.cgst) +
                    safeNumber(invoice.sgst) +
                    safeNumber(invoice.igst);

                  return (
                    <TableRow
                      id={`owner-invoice-${invoice.id}`}
                      key={invoice.id}
                      hover
                      sx={{
                        backgroundColor:
                          String(invoice.id) === String(highlightedInvoiceId)
                            ? "rgba(79, 70, 229, 0.06)"
                            : "inherit",

                        outline:
                          String(invoice.id) === String(highlightedInvoiceId)
                            ? "2px solid"
                            : "none",

                        outlineColor: "primary.main",

                        outlineOffset: "-2px",

                        transition: "background-color 0.2s ease",

                        "&:hover": {
                          backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.025),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {invoice.invoiceNumber || `#${invoice.id}`}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          ID #{invoice.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        #{invoice.paymentTransactionId ?? "-"}
                      </TableCell>

                      <TableCell>
                        {(() => {
                          const payment = getInvoicePayment(invoice);
                          if (invoiceScope === "platform")
                            return (
                              <Stack
                                direction="row"
                                spacing={1.2}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: (theme) =>
                                      alpha(theme.palette.primary.main, 0.1),
                                    color: "primary.main",
                                  }}
                                >
                                  <AccountBalanceWalletIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={700}>
                                    LibraryHub
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Platform billing
                                  </Typography>
                                </Box>
                              </Stack>
                            );
                          return (
                            <Stack
                              direction="row"
                              spacing={1.2}
                              alignItems="center"
                            >
                              <Avatar
                                src={payment?.profileImageUrl || undefined}
                                alt={payment?.customerName || "Member"}
                                sx={{
                                  width: 38,
                                  height: 38,
                                  fontWeight: 800,
                                  bgcolor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.09),
                                  color: "primary.main",
                                  border: "1px solid",
                                  borderColor: (theme) =>
                                    alpha(theme.palette.primary.main, 0.14),
                                }}
                              >
                                {!payment?.profileImageUrl
                                  ? getInitials(payment?.customerName)
                                  : null}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {payment?.customerName ||
                                    `Member #${invoice.customerId ?? "-"}`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {payment?.customerEmail ||
                                    `Customer #${invoice.customerId ?? "-"}`}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })()}
                      </TableCell>

                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>

                      <TableCell align="right">
                        {formatMoney(invoice.taxableAmount, invoice.currency)}
                      </TableCell>

                      <TableCell align="right">
                        {formatMoney(invoiceTax, invoice.currency)}
                      </TableCell>

                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          {formatMoney(invoice.totalAmount, invoice.currency)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <InvoiceStatusChip status={invoice.status} />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            View
                          </Button>

                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={
                              downloadingId === invoice.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DownloadIcon />
                              )
                            }
                            disabled={downloadingId === invoice.id}
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            PDF
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* DETAILS DIALOG */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <ReceiptLongIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Invoice Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tax, payment and document information
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {detailsLoading ? (
            <Box
              sx={{
                py: 6,

                display: "flex",

                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : selectedInvoice ? (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {invoiceScope === "member" &&
                (() => {
                  const payment = getInvoicePayment(selectedInvoice);
                  return payment ? (
                    <Card
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 0.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.025),
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={payment.profileImageUrl || undefined}
                          alt={payment.customerName || "Member"}
                          sx={{ width: 46, height: 46, fontWeight: 800 }}
                        >
                          {!payment.profileImageUrl
                            ? getInitials(payment.customerName)
                            : null}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800}>
                            {payment.customerName || "Member"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {payment.customerEmail ||
                              `Customer #${selectedInvoice.customerId ?? "-"}`}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ) : null;
                })()}

              <DetailRow
                label="Invoice Number"
                value={selectedInvoice.invoiceNumber || "-"}
                strong
              />

              <DetailRow label="Invoice ID" value={`#${selectedInvoice.id}`} />

              <DetailRow
                label="Payment Transaction"
                value={`#${selectedInvoice.paymentTransactionId}`}
              />

              <DetailRow
                label="Library ID"
                value={`#${selectedInvoice.libraryId}`}
              />

              <DetailRow
                label="Customer ID"
                value={`#${selectedInvoice.customerId}`}
              />

              <DetailRow
                label="Invoice Date"
                value={formatDate(selectedInvoice.invoiceDate)}
              />

              <DetailRow
                label="Due Date"
                value={formatDate(selectedInvoice.dueDate)}
              />

              <DetailRow
                label="Taxable Amount"
                value={formatMoney(
                  selectedInvoice.taxableAmount,

                  selectedInvoice.currency,
                )}
              />

              <DetailRow
                label={`CGST (${
                  safeNumber(selectedInvoice.gstPercentage) / 2
                }%)`}
                value={formatMoney(
                  selectedInvoice.cgst,

                  selectedInvoice.currency,
                )}
              />

              <DetailRow
                label={`SGST (${
                  safeNumber(selectedInvoice.gstPercentage) / 2
                }%)`}
                value={formatMoney(
                  selectedInvoice.sgst,

                  selectedInvoice.currency,
                )}
              />

              <DetailRow
                label="IGST"
                value={formatMoney(
                  selectedInvoice.igst,

                  selectedInvoice.currency,
                )}
              />

              <DetailRow
                label="GST Percentage"
                value={`${safeNumber(selectedInvoice.gstPercentage)}%`}
              />

              <DetailRow
                label="Total Amount"
                value={formatMoney(
                  selectedInvoice.totalAmount,

                  selectedInvoice.currency,
                )}
                strong
              />

              <DetailRow
                label="Currency"
                value={selectedInvoice.currency || "-"}
              />

              <DetailRow label="Status" value={selectedInvoice.status || "-"} />

              <DetailRow
                label="PDF"
                value={selectedInvoice.pdfUrl ? "Generated" : "Not available"}
              />

              {selectedInvoice.notes && (
                <Box
                  sx={{
                    pt: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {selectedInvoice.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions>
          {selectedInvoice && (
            <Button
              variant="contained"
              startIcon={
                downloadingId === selectedInvoice.id ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <DownloadIcon />
                )
              }
              disabled={downloadingId === selectedInvoice.id}
              onClick={() => handleDownloadInvoice(selectedInvoice)}
            >
              Download PDF
            </Button>
          )}

          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Invoices;
