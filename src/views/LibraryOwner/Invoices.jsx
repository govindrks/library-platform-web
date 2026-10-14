import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PercentIcon from "@mui/icons-material/Percent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </Box>

          {icon}
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

  /*
   * Default Finance -> Invoices behavior:
   * show student/member invoices only.
   *
   * SubscriptionBilling can navigate here with:
   *
   * navigate("/owner/invoices", {
   *   state: { invoiceScope: "platform" }
   * })
   *
   * so platform invoices remain separated from tenant revenue.
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

    /*
     * Recovery for accounts containing old empty duplicate
     * DRAFT libraries: prefer the library with an ACTIVE
     * LibraryHub subscription.
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

    const payments = normalizeListResponse(response);

    return new Set(
      payments
        .filter((payment) =>
          MEMBER_PAYMENT_REFERENCE_TYPES.has(payment?.referenceType),
        )
        .map((payment) =>
          Number(payment?.paymentId ?? payment?.transactionId ?? payment?.id),
        )
        .filter(Number.isFinite),
    );
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

        const [invoiceResponse, allowedTransactionIds] = await Promise.all([
          invoiceApi.getLibraryInvoices(libraryId),

          invoiceScope === "platform"
            ? loadPlatformTransactionIds(libraryId)
            : loadMemberTransactionIds(libraryId),
        ]);

        const allInvoices = normalizeListResponse(invoiceResponse);

        /*
         * PaymentInvoiceResponse currently does not expose
         * PaymentReferenceType. Therefore scope the invoice list
         * using the known payment transaction IDs.
         *
         * member scope:
         *   MEMBERSHIP / BOOKING / RENEWAL / etc.
         *
         * platform scope:
         *   PLATFORM_SUBSCRIPTION only.
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
          /*
           * This library does not own the target invoice,
           * or one of the supporting scope lookups failed.
           *
           * Continue through the owner's remaining libraries.
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
      const matchesSearch =
        !query ||
        String(invoice?.invoiceNumber ?? "")
          .toLowerCase()
          .includes(query) ||
        String(invoice?.paymentTransactionId ?? "")
          .toLowerCase()
          .includes(query) ||
        String(invoice?.customerId ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

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

  // ==========================================================
  // SELECTED LIBRARY
  // ==========================================================

  const selectedLibrary =
    libraries.find(
      (library) => String(library.id) === String(selectedLibraryId),
    ) ?? null;

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
      {/* HEADER */}
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
        sx={{ mb: 3 }}
      >
        <Box>
          {invoiceScope === "platform" && (
            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ mb: 1 }}
              onClick={() => navigate("/owner/subscription-billing")}
            >
              Subscription & Billing
            </Button>
          )}

          <Typography variant="h5" fontWeight={700}>
            {invoiceScope === "platform"
              ? "LibraryHub Billing Invoices"
              : "Member Invoices"}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {invoiceScope === "platform"
              ? "View GST invoices for LibraryHub platform subscription payments."
              : "View GST invoices generated from student/member payments received by the library."}
          </Typography>

          {selectedLibrary && (
            <Typography variant="caption" color="text.secondary">
              Library: <strong>{selectedLibrary.name}</strong>
            </Typography>
          )}
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: 240,
          }}
        >
          <InputLabel>Library</InputLabel>

          <Select
            value={selectedLibraryId}
            label="Library"
            onChange={(event) => {
              const nextId = String(event.target.value);

              setSelectedLibraryId(nextId);

              storeLibraryId(nextId);

              setSearch("");
              setStatusFilter("ALL");
              setError("");

              window.dispatchEvent(
                new CustomEvent("owner-library-changed", {
                  detail: {
                    libraryId: Number(nextId),
                  },
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
          icon={<ReceiptLongIcon color="primary" />}
        />

        <SummaryCard
          title="Generated"
          value={generatedCount}
          icon={<CheckCircleIcon color="success" />}
        />

        <SummaryCard
          title="Taxable Amount"
          value={formatMoney(totalTaxableAmount)}
          icon={<CurrencyRupeeIcon color="info" />}
        />

        <SummaryCard
          title="Total Tax"
          value={formatMoney(totalTax)}
          icon={<PercentIcon color="warning" />}
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
              placeholder="Search invoice number, payment ID or customer ID..."
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
          border: "1px solid #E2E8F0",
          borderRadius: 3,
        }}
      >
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

                        transition: "all 0.25s ease",
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

                      <TableCell>#{invoice.customerId ?? "-"}</TableCell>

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
        <DialogTitle>Invoice Details</DialogTitle>

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
