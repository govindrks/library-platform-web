import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PaymentsIcon from "@mui/icons-material/Payments";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReplayIcon from "@mui/icons-material/Replay";
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

// Explicitly excluded from Owner -> Payments.
// This is Library Owner -> LibraryHub SaaS billing.
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

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

function storeLibraryId(libraryId) {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function isLibraryRevenuePayment(payment) {
  if (!payment) {
    return false;
  }

  if (payment.referenceType === PLATFORM_REFERENCE_TYPE) {
    return false;
  }

  return LIBRARY_REVENUE_REFERENCE_TYPES.has(payment.referenceType);
}

function isWithinRange(value, start, end) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

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
// COMPONENT
// ============================================================

function Payments() {
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

    /*
     * Recovery for accounts that already contain duplicate
     * empty DRAFT libraries.
     *
     * Prefer a library with an ACTIVE LibraryHub subscription
     * because that is normally the configured tenant.
     */
    for (const library of libraryList) {
      try {
        const subscription =
          await platformSubscriptionApi.getActiveSubscription(library.id);

        if (subscription) {
          return library;
        }
      } catch {
        // No ACTIVE platform subscription for this library.
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

      /*
       * FRONTEND SAFETY BOUNDARY
       *
       * The backend should also exclude PLATFORM_SUBSCRIPTION
       * inside OwnerPaymentServiceImpl.
       *
       * We still filter here so this page can never present
       * LibraryHub SaaS charges as tenant revenue.
       */
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
  //
  // Successful member payments:
  // 1. Look for an existing invoice for the payment transaction.
  // 2. If no invoice exists, generate it through the backend.
  // 3. Download the tenant-scoped PDF.
  //
  // PDF generation itself is performed by PdfInvoiceGeneratorImpl.
  // ==========================================================

  const handleDownloadMemberInvoice = async (payment) => {
  if (!libraryId) {
    setError("Library is not selected.");
    return;
  }

  const paymentTransactionId =
    Number(
      payment?.paymentId ??
        payment?.transactionId ??
        payment?.id,
    );

  if (!Number.isFinite(paymentTransactionId)) {
    setError(
      "Payment transaction ID is unavailable.",
    );
    return;
  }

  if (payment?.status !== "SUCCESS") {
    setError(
      "Invoice PDF is available only for a successful payment.",
    );
    return;
  }

  try {
    setDownloadingInvoicePaymentId(
      paymentTransactionId,
    );

    setError("");

    const invoice =
      await invoiceApi.generateInvoice(
        paymentTransactionId,
      );

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
    console.error(
      "Failed to download member invoice:",
      requestError,
    );

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
    }
  }, [libraryId, loadPayments]);

  // ==========================================================
  // DERIVED SUMMARY
  // ==========================================================

  /*
   * Deliberately calculated from already-filtered member/library
   * payments so platform subscription charges can never inflate
   * library revenue cards.
   */
  const summary = useMemo(() => buildSummaryFromPayments(payments), [payments]);

  const totalRevenue = Number(summary.totalRevenue || 0);

  const todayRevenue = Number(summary.todayRevenue || 0);

  const monthlyRevenue = Number(summary.monthlyRevenue || 0);

  const successfulPayments = Number(summary.successfulPayments || 0);

  const pendingPayments = Number(summary.pendingPayments || 0);

  const failedPayments = Number(summary.failedPayments || 0);

  const refundedAmount = Number(summary.refundedAmount || 0);

  // ==========================================================
  // FILTERED PAYMENTS
  // ==========================================================

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Payments
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            View payments received from members for memberships, bookings and
            other library services.
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: 240,
          }}
        >
          <InputLabel>Library</InputLabel>

          <Select
            value={libraryId}
            label="Library"
            disabled={loadingLibraries || libraries.length === 0}
            onChange={(event) => {
              const nextLibraryId = String(event.target.value);

              setLibraryId(nextLibraryId);

              storeLibraryId(nextLibraryId);

              setSearch("");
              setStatusFilter("ALL");
              setReferenceTypeFilter("ALL");

              window.dispatchEvent(
                new CustomEvent("owner-library-changed", {
                  detail: {
                    libraryId: Number(nextLibraryId),
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

      {selectedLibrary && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing member revenue for <strong>{selectedLibrary.name}</strong>.
          LibraryHub platform subscription charges are shown separately under
          Subscription & Billing.
        </Typography>
      )}

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* SUMMARY */}
      {libraryId && (
        <Grid container spacing={2} mb={3}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(totalRevenue)}
                    </Typography>
                  </Box>

                  <PaymentsIcon />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Today Revenue
                </Typography>

                <Typography variant="h5" fontWeight={700} mt={0.5}>
                  {formatCurrency(todayRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>

                <Typography variant="h5" fontWeight={700} mt={0.5}>
                  {formatCurrency(monthlyRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Refunded Amount
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="error.main"
                  mt={0.5}
                >
                  {formatCurrency(refundedAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* STATUS */}
      {libraryId && (
        <Grid container spacing={2} mb={3}>
          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircleIcon color="success" />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Successful
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {successfulPayments}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <PendingActionsIcon color="warning" />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {pendingPayments}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CancelIcon color="error" />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Failed
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {failedPayments}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* FILTERS */}
      <Card sx={{ mb: 3 }}>
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
              placeholder="Search member, receipt, reference or transaction..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
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

                <MenuItem value="SUCCESS">Success</MenuItem>

                <MenuItem value="PENDING">Pending</MenuItem>

                <MenuItem value="CREATED">Created</MenuItem>

                <MenuItem value="FAILED">Failed</MenuItem>

                <MenuItem value="CANCELLED">Cancelled</MenuItem>

                <MenuItem value="REFUNDED">Refunded</MenuItem>

                <MenuItem value="PARTIALLY_REFUNDED">Partial Refund</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
              }}
            >
              <InputLabel>Payment For</InputLabel>

              <Select
                value={referenceTypeFilter}
                label="Payment For"
                onChange={(event) => setReferenceTypeFilter(event.target.value)}
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
          </Stack>
        </CardContent>
      </Card>

      {/* LOADING */}
      {(loadingLibraries || loadingPayments) && (
        <Card>
          <CardContent>
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{
                minHeight: 220,
              }}
            >
              <CircularProgress />

              <Typography variant="body2" color="text.secondary">
                Loading member payments...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* TRANSACTIONS */}
      {!loadingLibraries && !loadingPayments && libraryId && (
        <Stack spacing={2}>
          {filteredPayments.map((payment) => (
            <Card key={payment.paymentId}>
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography fontWeight={700}>
                      {payment.customerName || "Member"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Payment #{payment.paymentId}
                      {payment.referenceType && ` · ${payment.referenceType}`}
                      {payment.referenceId && ` #${payment.referenceId}`}
                    </Typography>

                    {payment.customerEmail && (
                      <Typography variant="caption" color="text.secondary">
                        {payment.customerEmail}
                      </Typography>
                    )}
                  </Box>

                  <Chip
                    label={payment.status || "UNKNOWN"}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </Stack>

                <Grid container spacing={2} mt={0.5}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Amount
                    </Typography>

                    <Typography fontWeight={700}>
                      {formatCurrency(payment.amount, payment.currency)}
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
                      Method
                    </Typography>

                    <Typography>{payment.paymentMethod || "-"}</Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Gateway
                    </Typography>

                    <Typography>{payment.paymentGateway || "-"}</Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Date
                    </Typography>

                    <Typography>{formatDateTime(payment.createdAt)}</Typography>
                  </Grid>
                </Grid>

                {payment.status === "SUCCESS" && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={
                        downloadingInvoicePaymentId ===
                        Number(
                          payment.paymentId ??
                            payment.transactionId ??
                            payment.id,
                        )
                      }
                      onClick={() => handleDownloadMemberInvoice(payment)}
                    >
                      {downloadingInvoicePaymentId ===
                      Number(
                        payment.paymentId ??
                          payment.transactionId ??
                          payment.id,
                      )
                        ? "Downloading Invoice..."
                        : "Download Invoice PDF"}
                    </Button>
                  </Box>
                )}

                {(payment.receiptNumber || payment.gatewayPaymentId) && (
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={3}
                    mt={2}
                  >
                    {payment.receiptNumber && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Receipt
                        </Typography>

                        <Typography variant="body2">
                          {payment.receiptNumber}
                        </Typography>
                      </Box>
                    )}

                    {payment.gatewayPaymentId && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gateway Payment ID
                        </Typography>

                        <Typography variant="body2">
                          {payment.gatewayPaymentId}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}

                {Number(payment.refundedAmount || 0) > 0 && (
                  <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                    <ReplayIcon fontSize="small" />

                    <Typography variant="body2" color="text.secondary">
                      Refunded{" "}
                      {formatCurrency(payment.refundedAmount, payment.currency)}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredPayments.length === 0 && (
            <Card>
              <CardContent>
                <Box
                  sx={{
                    py: 6,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>
                    No member payment transactions found
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Platform subscription payments are shown under Subscription
                    & Billing.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default Payments;
