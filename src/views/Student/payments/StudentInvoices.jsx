import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  Download,
  ReceiptLong,
  Refresh,
  RestartAlt,
} from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import invoiceApi from "../../../api/invoiceApi";
import studentPaymentApi from "../../../api/studentPaymentApi";

// ============================================================
// HELPERS
// ============================================================

const formatMoney = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount ?? 0));
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const rawValue = String(value).includes("T") ? value : `${value}T00:00:00`;

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeArrayResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

const getInvoiceId = (invoice) => {
  return invoice?.invoiceId ?? invoice?.id ?? null;
};

const getInvoicePaymentTransactionId = (invoice) => {
  return (
    invoice?.paymentTransactionId ??
    invoice?.transactionId ??
    invoice?.paymentId ??
    invoice?.paymentTransaction?.id ??
    null
  );
};

const getPaymentTransactionId = (payment) => {
  return (
    payment?.paymentTransactionId ??
    payment?.transactionId ??
    payment?.paymentId ??
    payment?.id ??
    null
  );
};

const isSuccessfulStudentPayment = (payment) => {
  if (payment?.status !== "SUCCESS") {
    return false;
  }

  /*
   * PLATFORM_SUBSCRIPTION represents:
   *
   * Library Owner
   *      ↓
   * LibraryHub
   *
   * It must not appear inside the student's
   * invoice recovery flow.
   */
  if (payment?.referenceType === "PLATFORM_SUBSCRIPTION") {
    return false;
  }

  return Boolean(getPaymentTransactionId(payment));
};

// ============================================================
// COMPONENT
// ============================================================

function StudentInvoices() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // NOTIFICATION STATE
  // ==========================================================

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [recovering, setRecovering] = useState(false);

  const [downloadingId, setDownloadingId] = useState(null);

  const [regeneratingId, setRegeneratingId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [highlightedInvoiceId, setHighlightedInvoiceId] = useState(null);

  // ==========================================================
  // FETCH INVOICES
  // ==========================================================

  const fetchInvoices = useCallback(async () => {
    const response = await invoiceApi.getMyInvoices();

    return normalizeArrayResponse(response);
  }, []);

  // ==========================================================
  // RECOVER HISTORICAL INVOICES
  // ==========================================================

  /*
   * Older successful payments may not have generated invoices
   * because the automation flow was introduced later.
   *
   * Recovery flow:
   *
   * student successful payments
   *        ↓
   * compare against existing invoices
   *        ↓
   * generateMissingInvoice(...)
   *        ↓
   * backend generateIfAbsent(...)
   *
   * The backend is responsible for preventing duplicate invoices.
   */
  const recoverHistoricalInvoices = useCallback(async (currentInvoices) => {
    const paymentResponse = await studentPaymentApi.getMyPayments();

    const payments = normalizeArrayResponse(paymentResponse);

    const successfulPayments = payments.filter(isSuccessfulStudentPayment);

    if (successfulPayments.length === 0) {
      return {
        generatedCount: 0,
        failedCount: 0,
      };
    }

    // ======================================================
    // EXISTING PAYMENT TRANSACTION IDS
    // ======================================================

    const existingPaymentIds = new Set(
      currentInvoices
        .map(getInvoicePaymentTransactionId)
        .filter(Boolean)
        .map(String),
    );

    // ======================================================
    // FIND MISSING INVOICE PAYMENTS
    // ======================================================

    const candidatePayments = successfulPayments.filter((payment) => {
      const transactionId = getPaymentTransactionId(payment);

      if (!transactionId) {
        return false;
      }

      /*
       * Some older invoice DTOs may not expose
       * paymentTransactionId.
       *
       * Calling the recovery API is still safe because
       * backend generateIfAbsent(...) is idempotent.
       */
      if (existingPaymentIds.size === 0) {
        return true;
      }

      return !existingPaymentIds.has(String(transactionId));
    });

    if (candidatePayments.length === 0) {
      return {
        generatedCount: 0,
        failedCount: 0,
      };
    }

    // ======================================================
    // GENERATE MISSING INVOICES
    // ======================================================

    const results = await Promise.allSettled(
      candidatePayments.map((payment) =>
        invoiceApi.generateMissingInvoice(getPaymentTransactionId(payment)),
      ),
    );

    const generatedCount = results.filter(
      (result) => result.status === "fulfilled",
    ).length;

    const failedCount = results.length - generatedCount;

    // ======================================================
    // DEBUG FAILED RECOVERY
    // ======================================================

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(
          "Unable to recover invoice for payment:",
          getPaymentTransactionId(candidatePayments[index]),
          result.reason,
        );
      }
    });

    return {
      generatedCount,
      failedCount,
    };
  }, []);

  // ==========================================================
  // LOAD INVOICES
  // ==========================================================

  const loadInvoices = useCallback(
    async ({ recoverMissing = true, showRecoveryMessage = false } = {}) => {
      try {
        setLoading(true);

        setError("");

        let currentInvoices = await fetchInvoices();

        setInvoices(currentInvoices);

        // ====================================================
        // HISTORICAL RECOVERY
        // ====================================================

        if (recoverMissing) {
          setRecovering(true);

          try {
            const { generatedCount } =
              await recoverHistoricalInvoices(currentInvoices);

            if (generatedCount > 0) {
              currentInvoices = await fetchInvoices();

              setInvoices(currentInvoices);

              if (showRecoveryMessage) {
                setSuccess(
                  generatedCount === 1
                    ? "1 missing invoice was recovered successfully."
                    : `${generatedCount} missing invoices were recovered successfully.`,
                );
              }
            }
          } catch (recoveryError) {
            /*
             * Recovery is secondary.
             *
             * Existing invoices should remain usable even if
             * one historical transaction cannot be recovered.
             */
            console.warn("Historical invoice recovery failed:", recoveryError);
          } finally {
            setRecovering(false);
          }
        }
      } catch (requestError) {
        console.error("Failed to load student invoices:", requestError);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load invoices.",
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchInvoices, recoverHistoricalInvoices],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadInvoices({
      recoverMissing: true,
      showRecoveryMessage: false,
    });
  }, [loadInvoices]);

  // ==========================================================
  // NOTIFICATION DEEP LINK
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * Do not use a permanent notificationHandled state.
   *
   * location.state acts as the one-time notification trigger.
   * After handling it we clear router state with replace.
   *
   * This allows another notification to be opened while the
   * component remains mounted.
   */
  useEffect(() => {
    if (loading || !fromNotification) {
      return;
    }

    // ========================================================
    // INVALID REFERENCE TYPE
    // ========================================================

    if (notificationReferenceType !== "INVOICE") {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    // ========================================================
    // MISSING REFERENCE
    // ========================================================

    if (!notificationReferenceId) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    // ========================================================
    // FIND INVOICE
    // ========================================================

    const matchingInvoice = invoices.find(
      (invoice) =>
        Number(getInvoiceId(invoice)) === Number(notificationReferenceId),
    );

    if (!matchingInvoice) {
      setError(`Invoice #${notificationReferenceId} could not be found.`);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    // ========================================================
    // HIGHLIGHT
    // ========================================================

    const targetInvoiceId = getInvoiceId(matchingInvoice);

    setHighlightedInvoiceId(targetInvoiceId);

    setSuccess(
      `Invoice ${
        matchingInvoice.invoiceNumber || `#${targetInvoiceId}`
      } opened from notification.`,
    );

    // ========================================================
    // CLEAR ROUTER STATE
    // ========================================================

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    invoices,
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

    const timeoutId = window.setTimeout(() => {
      document
        .getElementById(`student-invoice-${highlightedInvoiceId}`)
        ?.scrollIntoView({
          behavior: "smooth",

          block: "center",
        });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedInvoiceId, loading, invoices]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    setSuccess("");

    await loadInvoices({
      recoverMissing: true,
      showRecoveryMessage: true,
    });
  };

  // ==========================================================
  // DOWNLOAD EXISTING PDF
  // ==========================================================

  const handleDownload = async (invoice) => {
    const invoiceId = getInvoiceId(invoice);

    try {
      setDownloadingId(invoiceId);

      setError("");

      await invoiceApi.downloadGlobalInvoice(invoiceId, invoice.invoiceNumber);
    } catch (requestError) {
      console.error("Failed to download invoice:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to download invoice.",
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // ==========================================================
  // REGENERATE PDF
  // ==========================================================

  /*
   * This calls:
   *
   * POST
   * /api/payment/invoices/{invoiceId}/regenerate-pdf
   *
   * Backend behavior:
   *
   * existing PaymentInvoice
   *      ↓
   * latest PdfInvoiceGeneratorImpl
   *      ↓
   * replace/update stored PDF
   *
   * No new invoice row is created.
   * No new invoice number is created.
   */
  const handleRegeneratePdf = async (invoice) => {
    const invoiceId = getInvoiceId(invoice);

    if (!invoiceId) {
      setError("Invoice ID is required.");

      return;
    }

    try {
      setRegeneratingId(invoiceId);

      setError("");

      setSuccess("");

      await invoiceApi.regeneratePdf(invoiceId, invoice.invoiceNumber);

      setSuccess(
        `Invoice ${
          invoice.invoiceNumber || `#${invoiceId}`
        } PDF regenerated successfully.`,
      );

      /*
       * Reload metadata after regeneration.
       */
      const refreshedInvoices = await fetchInvoices();

      setInvoices(refreshedInvoices);

      setHighlightedInvoiceId(invoiceId);
    } catch (requestError) {
      console.error("Failed to regenerate invoice PDF:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to regenerate invoice PDF.",
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

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
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Invoices
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            View and download invoices for your successful payments.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={recovering ? <CircularProgress size={18} /> : <Refresh />}
          disabled={loading || recovering}
          onClick={handleRefresh}
        >
          {recovering ? "Checking..." : "Refresh"}
        </Button>
      </Stack>

      {/* ===================================================== */}
      {/* SUCCESS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* RECOVERY INFO */}
      {/* ===================================================== */}

      {recovering && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
          }}
        >
          Checking successful payments for any missing invoices...
        </Alert>
      )}

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* LOADING */}
      {/* ===================================================== */}

      {loading ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            py: 8,
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">Loading invoices...</Typography>
        </Stack>
      ) : // ====================================================
      // EMPTY
      // ====================================================

      invoices.length === 0 ? (
        <Alert severity="info">No invoices are available yet.</Alert>
      ) : (
        // ==================================================
        // INVOICE LIST
        // ==================================================

        <Stack spacing={2}>
          {invoices.map((invoice) => {
            const invoiceId = getInvoiceId(invoice);

            const highlighted =
              String(invoiceId) === String(highlightedInvoiceId);

            const downloading = downloadingId === invoiceId;

            const regenerating = regeneratingId === invoiceId;

            return (
              <Card
                id={`student-invoice-${invoiceId}`}
                key={invoiceId}
                elevation={0}
                sx={{
                  border: highlighted ? "2px solid" : "1px solid",

                  borderColor: highlighted ? "primary.main" : "divider",

                  backgroundColor: highlighted
                    ? "rgba(79, 70, 229, 0.04)"
                    : "background.paper",

                  boxShadow: highlighted ? 3 : 0,

                  borderRadius: 3,

                  transition: "all 0.25s ease",
                }}
              >
                <CardContent>
                  {/* ================================= */}
                  {/* TOP */}
                  {/* ================================= */}

                  <Stack
                    direction={{
                      xs: "column",
                      md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    {/* =============================== */}
                    {/* INVOICE TITLE */}
                    {/* =============================== */}

                    <Stack direction="row" spacing={1.5}>
                      <ReceiptLong color="primary" />

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {invoice.invoiceNumber || `Invoice #${invoiceId}`}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Invoice date: {formatDate(invoice.invoiceDate)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* =============================== */}
                    {/* ACTIONS */}
                    {/* =============================== */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={1}
                      alignItems={{
                        xs: "stretch",
                        sm: "center",
                      }}
                    >
                      <Chip
                        size="small"
                        label={invoice.status || "GENERATED"}
                        color="success"
                        variant="outlined"
                      />

                      {/* ============================= */}
                      {/* REGENERATE */}
                      {/* ============================= */}

                      <Button
                        variant="outlined"
                        startIcon={
                          regenerating ? (
                            <CircularProgress size={18} />
                          ) : (
                            <RestartAlt />
                          )
                        }
                        disabled={regenerating || downloading}
                        onClick={() => handleRegeneratePdf(invoice)}
                      >
                        {regenerating ? "Regenerating..." : "Regenerate PDF"}
                      </Button>

                      {/* ============================= */}
                      {/* DOWNLOAD */}
                      {/* ============================= */}

                      <Button
                        variant="contained"
                        startIcon={
                          downloading ? (
                            <CircularProgress size={18} />
                          ) : (
                            <Download />
                          )
                        }
                        disabled={downloading || regenerating}
                        onClick={() => handleDownload(invoice)}
                      >
                        {downloading ? "Downloading..." : "Download PDF"}
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider
                    sx={{
                      my: 2,
                    }}
                  />

                  {/* ================================= */}
                  {/* INVOICE DETAILS */}
                  {/* ================================= */}

                  <Grid container spacing={2}>
                    {/* =============================== */}
                    {/* TAXABLE AMOUNT */}
                    {/* =============================== */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Taxable Amount
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatMoney(invoice.taxableAmount, invoice.currency)}
                      </Typography>
                    </Grid>

                    {/* =============================== */}
                    {/* GST */}
                    {/* =============================== */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        GST
                      </Typography>

                      <Typography fontWeight={600}>
                        {invoice.gstPercentage ?? 0}%
                      </Typography>
                    </Grid>

                    {/* =============================== */}
                    {/* TOTAL */}
                    {/* =============================== */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>

                      <Typography fontWeight={800} color="primary.main">
                        {formatMoney(invoice.totalAmount, invoice.currency)}
                      </Typography>
                    </Grid>

                    {/* =============================== */}
                    {/* PAID ON */}
                    {/* =============================== */}

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Paid On
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatDate(invoice.paymentDate)}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* ================================= */}
                  {/* PAYMENT TRANSACTION */}
                  {/* ================================= */}

                  {getInvoicePaymentTransactionId(invoice) && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 2,
                      }}
                    >
                      Payment Transaction: #
                      {getInvoicePaymentTransactionId(invoice)}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default StudentInvoices;
