import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

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

/* =========================================================
   HELPERS
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

function Payments() {
  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [payments, setPayments] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loadingPayments, setLoadingPayments] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [referenceTypeFilter, setReferenceTypeFilter] = useState("ALL");

  const [error, setError] = useState("");

  /* =======================================================
     LOAD LIBRARIES
  ======================================================= */

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
        setSummary(null);

        return;
      }

      setLibraryId((current) => {
        const stillExists =
          current &&
          list.some((library) => String(library.id) === String(current));

        if (stillExists) {
          return String(current);
        }

        return String(list[0].id);
      });
    } catch (err) {
      console.error("Failed to load libraries:", err);

      setError(getErrorMessage(err, "Unable to load your libraries."));

      setLibraries([]);
      setLibraryId("");
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  /* =======================================================
     LOAD PAYMENTS
  ======================================================= */

  const loadPayments = useCallback(async () => {
    if (!libraryId) {
      setPayments([]);
      setSummary(null);

      return;
    }

    try {
      setLoadingPayments(true);
      setError("");

      const [paymentResponse, summaryResponse] = await Promise.all([
        ownerPaymentApi.getLibraryPayments(libraryId),

        ownerPaymentApi.getLibraryPaymentSummary(libraryId),
      ]);

      setPayments(normalizeListResponse(paymentResponse));

      setSummary(summaryResponse ?? null);
    } catch (err) {
      console.error("Failed to load payments:", err);

      setPayments([]);
      setSummary(null);

      setError(getErrorMessage(err, "Unable to load payments."));
    } finally {
      setLoadingPayments(false);
    }
  }, [libraryId]);

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) {
      loadPayments();
    }
  }, [libraryId, loadPayments]);

  /* =======================================================
     FILTERED PAYMENTS
  ======================================================= */

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

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalRevenue = Number(summary?.totalRevenue ?? 0);

  const todayRevenue = Number(summary?.todayRevenue ?? 0);

  const monthlyRevenue = Number(summary?.monthlyRevenue ?? 0);

  const successfulPayments = Number(summary?.successfulPayments ?? 0);

  const pendingPayments = Number(summary?.pendingPayments ?? 0);

  const failedPayments = Number(summary?.failedPayments ?? 0);

  const refundedAmount = Number(summary?.refundedAmount ?? 0);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box>
      {/* ===================================================
          HEADER
      =================================================== */}

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
            View and manage library payment transactions.
          </Typography>
        </Box>

        <FormControl
          size="small"
          sx={{
            minWidth: 220,
          }}
        >
          <InputLabel>Library</InputLabel>

          <Select
            value={libraryId}
            label="Library"
            disabled={loadingLibraries}
            onChange={(event) => {
              setLibraryId(String(event.target.value));

              setSearch("");
              setStatusFilter("ALL");

              setReferenceTypeFilter("ALL");
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

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      {libraryId && (
        <Grid container spacing={2} mb={3}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
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

      {/* ===================================================
          STATUS CARDS
      =================================================== */}

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

      {/* ===================================================
          FILTERS
      =================================================== */}

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
                minWidth: 190,
              }}
            >
              <InputLabel>Reference Type</InputLabel>

              <Select
                value={referenceTypeFilter}
                label="Reference Type"
                onChange={(event) => setReferenceTypeFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Types</MenuItem>

                <MenuItem value="MEMBERSHIP">Membership</MenuItem>

                <MenuItem value="BOOKING">Booking</MenuItem>

                <MenuItem value="SUBSCRIPTION_RENEWAL">Renewal</MenuItem>

                <MenuItem value="SECURITY_DEPOSIT">Security Deposit</MenuItem>

                <MenuItem value="LATE_FEE">Late Fee</MenuItem>

                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          LOADING
      =================================================== */}

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
                Loading payments...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ===================================================
          TRANSACTIONS
      =================================================== */}

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
                      {payment.customerName || "Unknown Customer"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Payment #{payment.paymentId}
                      {payment.referenceType && ` · ${payment.referenceType}`}
                      {payment.referenceId && ` #${payment.referenceId}`}
                    </Typography>
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
                    No payment transactions found
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    No payments match the selected filters.
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
