import {
  Alert,
  Box,
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
  AccountBalanceWallet,
  CheckCircleOutlineOutlined,
  CreditCard,
  Payments,
  ReceiptLong,
  Schedule,
  SyncProblem,
  Wallet,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

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

const formatText = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const statusColor = (status) => {
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
};

const getStatusAccent = (status) => {
  switch (status) {
    case "SUCCESS":
      return {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.07), rgba(255,255,255,1) 52%)",

        borderColor: "rgba(34,197,94,0.22)",

        iconBackground: "rgba(34,197,94,0.10)",

        iconColor: "success.main",

        barColor: "success.main",
      };

    case "PENDING":
    case "CREATED":
      return {
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(255,255,255,1) 52%)",

        borderColor: "rgba(245,158,11,0.24)",

        iconBackground: "rgba(245,158,11,0.10)",

        iconColor: "warning.main",

        barColor: "warning.main",
      };

    case "FAILED":
    case "CANCELLED":
      return {
        background:
          "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(255,255,255,1) 52%)",

        borderColor: "rgba(239,68,68,0.18)",

        iconBackground: "rgba(239,68,68,0.08)",

        iconColor: "error.main",

        barColor: "error.main",
      };

    case "REFUNDED":
    case "PARTIALLY_REFUNDED":
      return {
        background:
          "linear-gradient(135deg, rgba(14,165,233,0.07), rgba(255,255,255,1) 52%)",

        borderColor: "rgba(14,165,233,0.20)",

        iconBackground: "rgba(14,165,233,0.09)",

        iconColor: "info.main",

        barColor: "info.main",
      };

    default:
      return {
        background:
          "linear-gradient(135deg, rgba(79,70,229,0.06), rgba(255,255,255,1) 52%)",

        borderColor: "divider",

        iconBackground: "rgba(79,70,229,0.08)",

        iconColor: "primary.main",

        barColor: "primary.main",
      };
  }
};

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ title, value, description, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid",
        borderColor: "divider",

        borderRadius: 3,

        background:
          "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.92) 100%)",

        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          borderColor: "primary.light",

          boxShadow: "0 10px 28px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack direction="row" spacing={1.7} alignItems="center">
          <Box
            sx={{
              width: 50,
              height: 50,

              minWidth: 50,

              borderRadius: 2.5,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              background:
                "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.05))",

              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mt: 0.15,
              }}
            >
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          mt: 0.3,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function StudentPayments() {
  // ==========================================================
  // ROUTER / NOTIFICATION STATE
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [payments, setPayments] = useState([]);

  const [highlightedPaymentId, setHighlightedPaymentId] = useState(null);

  const [notificationHandled, setNotificationHandled] = useState(false);

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD PAYMENTS
  // ==========================================================

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await studentPaymentApi.getMyPayments();

      setPayments(
        Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
            ? response.content
            : [],
      );
    } catch (requestError) {
      console.error("Failed to load student payments:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load payments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // ==========================================================
  // RESOLVE PAYMENT NOTIFICATION TARGET
  // ==========================================================

  useEffect(() => {
    if (notificationHandled || loading) {
      return;
    }

    if (!fromNotification) {
      setNotificationHandled(true);

      return;
    }

    if (notificationReferenceType !== "PAYMENT") {
      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    if (!notificationReferenceId) {
      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    const matchingPayment = payments.find(
      (payment) =>
        Number(payment?.paymentId ?? payment?.transactionId ?? payment?.id) ===
        Number(notificationReferenceId),
    );

    if (!matchingPayment) {
      setError(
        `Payment transaction #${notificationReferenceId} could not be found.`,
      );

      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    const targetPaymentId =
      matchingPayment.paymentId ??
      matchingPayment.transactionId ??
      matchingPayment.id;

    setHighlightedPaymentId(targetPaymentId);

    setSuccess(
      `Payment transaction #${targetPaymentId} opened from notification.`,
    );

    setNotificationHandled(true);

    navigate(location.pathname, {
      replace: true,

      state: null,
    });
  }, [
    notificationHandled,
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    payments,
    location.pathname,
    navigate,
  ]);

  // ==========================================================
  // SCROLL TO HIGHLIGHTED PAYMENT
  // ==========================================================

  useEffect(() => {
    if (!highlightedPaymentId || loading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document
        .getElementById(`student-payment-${highlightedPaymentId}`)
        ?.scrollIntoView({
          behavior: "smooth",

          block: "center",
        });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedPaymentId, loading, payments]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const successfulPayments = useMemo(
    () => payments.filter((payment) => payment.status === "SUCCESS"),
    [payments],
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "PENDING" || payment.status === "CREATED",
      ),
    [payments],
  );

  const totalPaid = useMemo(
    () =>
      successfulPayments.reduce(
        (sum, payment) => sum + Number(payment.amount ?? 0),
        0,
      ),
    [successfulPayments],
  );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* ===================================================== */}
      {/* HERO HEADER */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 4,

          overflow: "hidden",

          border: "1px solid",

          borderColor: "rgba(79,70,229,0.12)",

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,1) 53%, rgba(99,102,241,0.05) 100%)",

          position: "relative",

          "&::before": {
            content: '""',

            position: "absolute",

            width: 220,

            height: 220,

            top: -120,

            right: -80,

            borderRadius: "50%",

            background: "rgba(79,70,229,0.07)",
          },
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3.3,
            },

            position: "relative",

            zIndex: 1,

            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.3,
              },
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,

                height: 58,

                minWidth: 58,

                borderRadius: 3,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "primary.main",

                color: "primary.contrastText",

                boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
              }}
            >
              <Wallet
                sx={{
                  fontSize: 30,
                }}
              />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: "-0.02em",
                }}
              >
                Payments
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.45,
                }}
              >
                Track your membership and booking transactions in one place.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3.5,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SummaryCard
            title="Total Payments"
            value={payments.length}
            description="All transactions"
            icon={<Payments />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SummaryCard
            title="Successful"
            value={successfulPayments.length}
            description="Completed payments"
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
          <SummaryCard
            title="Pending"
            value={pendingPayments.length}
            description="Awaiting completion"
            icon={<Schedule />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SummaryCard
            title="Total Paid"
            value={formatMoney(totalPaid)}
            description="Successful transactions"
            icon={<AccountBalanceWallet />}
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* NOTIFICATION SUCCESS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,

            borderRadius: 2.5,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
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

            borderRadius: 2.5,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* SECTION HEADER */}
      {/* ===================================================== */}

      {!loading && payments.length > 0 && (
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
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Transaction History
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              Your latest payment activity and transaction details.
            </Typography>
          </Box>

          <Chip
            icon={<ReceiptLong />}
            label={`${payments.length} ${
              payments.length === 1 ? "Transaction" : "Transactions"
            }`}
            variant="outlined"
            color="primary"
            sx={{
              fontWeight: 700,
            }}
          />
        </Stack>
      )}

      {/* ===================================================== */}
      {/* CONTENT */}
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

          <Typography color="text.secondary">Loading payments...</Typography>
        </Stack>
      ) : payments.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px dashed",

            borderColor: "divider",

            borderRadius: 4,

            minHeight: 320,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background:
              "linear-gradient(145deg, rgba(248,250,252,0.9), rgba(255,255,255,1))",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",

              py: 6,
            }}
          >
            <Box
              sx={{
                width: 72,

                height: 72,

                mx: "auto",

                mb: 2,

                borderRadius: "50%",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "rgba(79,70,229,0.08)",

                color: "primary.main",
              }}
            >
              <CreditCard
                sx={{
                  fontSize: 36,
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight={800}>
              No payments yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.75,

                maxWidth: 420,
              }}
            >
              Your booking and membership payments will appear here after you
              make your first transaction.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {payments.map((payment) => {
            const paymentId =
              payment.paymentId ?? payment.transactionId ?? payment.id;

            const highlighted =
              String(paymentId) === String(highlightedPaymentId);

            const accent = getStatusAccent(payment.status);

            return (
              <Card
                id={`student-payment-${paymentId}`}
                key={paymentId}
                elevation={0}
                sx={{
                  position: "relative",

                  overflow: "hidden",

                  border: highlighted ? "2px solid" : "1px solid",

                  borderColor: highlighted
                    ? "primary.main"
                    : accent.borderColor,

                  background: highlighted
                    ? "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 58%)"
                    : accent.background,

                  boxShadow: highlighted
                    ? "0 14px 36px rgba(79,70,229,0.14)"
                    : "0 4px 18px rgba(15,23,42,0.035)",

                  borderRadius: 4,

                  transition: "all 0.24s ease",

                  "&:hover": {
                    transform: "translateY(-3px)",

                    boxShadow: "0 14px 34px rgba(15,23,42,0.09)",

                    borderColor: highlighted ? "primary.main" : "primary.light",
                  },

                  "&::before": {
                    content: '""',

                    position: "absolute",

                    top: 0,
                    left: 0,

                    height: "100%",

                    width: 4,

                    bgcolor: accent.barColor,
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 2.4,

                      md: 2.8,
                    },

                    "&:last-child": {
                      pb: {
                        xs: 2.4,

                        md: 2.8,
                      },
                    },
                  }}
                >
                  {/* ======================================= */}
                  {/* TOP */}
                  {/* ======================================= */}

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
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 48,

                          height: 48,

                          borderRadius: 2.5,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          bgcolor: accent.iconBackground,

                          color: accent.iconColor,
                        }}
                      >
                        <CreditCard />
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={700}
                        >
                          TRANSACTION #{paymentId}
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{
                            mt: 0.25,
                          }}
                        >
                          {payment.libraryName || "Library Payment"}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack
                      alignItems={{
                        xs: "flex-start",

                        sm: "flex-end",
                      }}
                      spacing={0.7}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {formatMoney(payment.amount, payment.currency)}
                      </Typography>

                      <Chip
                        size="small"
                        color={statusColor(payment.status)}
                        label={formatText(payment.status)}
                        sx={{
                          fontWeight: 700,

                          minWidth: 88,
                        }}
                      />
                    </Stack>
                  </Stack>

                  <Divider
                    sx={{
                      my: 2.4,
                    }}
                  />

                  {/* ======================================= */}
                  {/* DETAILS */}
                  {/* ======================================= */}

                  <Grid container spacing={2.5}>
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <DetailItem
                        label="Payment For"
                        value={formatText(payment.referenceType)}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <DetailItem
                        label="Gateway"
                        value={formatText(payment.paymentGateway)}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <DetailItem
                        label="Payment Method"
                        value={formatText(payment.paymentMethod)}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                      }}
                    >
                      <DetailItem
                        label="Date"
                        value={formatDate(payment.createdAt)}
                      />
                    </Grid>
                  </Grid>

                  {/* ======================================= */}
                  {/* RECEIPT */}
                  {/* ======================================= */}

                  {payment.receiptNumber && (
                    <Box
                      sx={{
                        mt: 2.3,

                        p: 1.6,

                        borderRadius: 2.5,

                        bgcolor: "rgba(79,70,229,0.045)",

                        border: "1px solid",

                        borderColor: "rgba(79,70,229,0.08)",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ReceiptLong fontSize="small" color="primary" />

                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                          >
                            Receipt Number
                          </Typography>

                          <Typography variant="body2" fontWeight={700}>
                            {payment.receiptNumber}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}

                  {/* ======================================= */}
                  {/* REFUND */}
                  {/* ======================================= */}

                  {payment.refunded && (
                    <Alert
                      severity="info"
                      icon={<SyncProblem />}
                      sx={{
                        mt: 2.3,

                        borderRadius: 2.5,
                      }}
                    >
                      Refunded amount:{" "}
                      <strong>
                        {formatMoney(payment.refundedAmount, payment.currency)}
                      </strong>
                    </Alert>
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

export default StudentPayments;
