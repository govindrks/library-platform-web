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
  Payments,
  ReceiptLong,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import studentPaymentApi from "../../../api/studentPaymentApi";

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
      return "warning";

    case "FAILED":
      return "error";

    case "REFUNDED":
      return "info";

    default:
      return "default";
  }
};

function SummaryCard({ title, value, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h6" fontWeight={800}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StudentPayments() {
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await studentPaymentApi.getMyPayments();

      setPayments(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Failed to load student payments:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load payments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const successfulPayments = useMemo(
    () => payments.filter((payment) => payment.status === "SUCCESS"),
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={800}>
        Payments
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 3,
        }}
      >
        View your membership and booking payment history.
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Total Payments"
            value={payments.length}
            icon={<Payments />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Successful"
            value={successfulPayments.length}
            icon={<ReceiptLong />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <SummaryCard
            title="Total Paid"
            value={formatMoney(totalPaid)}
            icon={<AccountBalanceWallet />}
          />
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

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
        <Alert severity="info">You have no payment transactions yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {payments.map((payment) => (
            <Card
              key={payment.paymentId}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Transaction #{payment.paymentId}
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

                  <Stack
                    alignItems={{
                      xs: "flex-start",
                      sm: "flex-end",
                    }}
                    spacing={0.75}
                  >
                    <Typography variant="h6" fontWeight={800}>
                      {formatMoney(payment.amount, payment.currency)}
                    </Typography>

                    <Chip
                      size="small"
                      color={statusColor(payment.status)}
                      label={formatText(payment.status)}
                    />
                  </Stack>
                </Stack>

                <Divider
                  sx={{
                    my: 2,
                  }}
                />

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Payment For
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatText(payment.referenceType)}
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
                      Gateway
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatText(payment.paymentGateway)}
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
                      Payment Method
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatText(payment.paymentMethod)}
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
                      Date
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatDate(payment.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>

                {payment.receiptNumber && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 2,
                    }}
                  >
                    Receipt: {payment.receiptNumber}
                  </Typography>
                )}

                {payment.refunded && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 2,
                    }}
                  >
                    Refunded amount:{" "}
                    {formatMoney(payment.refundedAmount, payment.currency)}
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default StudentPayments;
