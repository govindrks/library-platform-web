import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
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
  Typography,
} from "@mui/material";

import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import libraryRevenueApi from "../../api/libraryRevenueApi";

// =============================================================
// HELPERS
// =============================================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) => {
  return `₹${safeNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

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

const formatTrendDate = (value, days) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (Number(days) <= 7) {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",
  });
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({ title, value, subtitle, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid #E2E8F0",

        borderRadius: 3,
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

            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// PAYMENT STATUS CHIP
// =============================================================

function PaymentStatusChip({ status }) {
  const config = {
    SUCCESS: {
      label: "Success",

      color: "success",
    },

    REFUND_PENDING: {
      label: "Refund Pending",

      color: "warning",
    },

    PARTIALLY_REFUNDED: {
      label: "Partially Refunded",

      color: "warning",
    },

    REFUNDED: {
      label: "Refunded",

      color: "info",
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
      color={current.color}
      label={current.label}
    />
  );
}

// =============================================================
// REVENUE TREND
// =============================================================

function RevenueTrend({ data, days }) {
  const maxRevenue = Math.max(
    ...data.map((item) => safeNumber(item.netRevenue)),
    1,
  );

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 230,

          display: "flex",

          justifyContent: "center",

          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No revenue data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 3,

        height: 230,

        display: "flex",

        alignItems: "flex-end",

        gap: 1,

        overflowX: "auto",

        pb: 1,
      }}
    >
      {data.map((item, index) => {
        const netRevenue = safeNumber(item.netRevenue);

        const height = Math.max(
          (netRevenue / maxRevenue) * 165,

          netRevenue > 0 ? 8 : 2,
        );

        const showLabel =
          Number(days) <= 14 || index % 5 === 0 || index === data.length - 1;

        return (
          <Box
            key={item.date}
            sx={{
              flex: Number(days) <= 14 ? 1 : "0 0 30px",

              minWidth: Number(days) <= 14 ? 28 : 30,

              height: "100%",

              display: "flex",

              flexDirection: "column",

              justifyContent: "flex-end",

              alignItems: "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{
                mb: 0.5,

                fontSize: 10,

                whiteSpace: "nowrap",
              }}
            >
              {netRevenue > 0 ? formatMoney(netRevenue) : ""}
            </Typography>

            <Box
              sx={{
                width: "70%",

                maxWidth: 34,

                minWidth: 10,

                height,

                bgcolor: "primary.main",

                opacity: netRevenue > 0 ? 1 : 0.15,

                borderRadius: "8px 8px 2px 2px",

                transition: "height 0.3s ease",
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 1,

                minHeight: 20,

                whiteSpace: "nowrap",
              }}
            >
              {showLabel ? formatTrendDate(item.date, days) : ""}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// =============================================================
// GENERIC BREAKDOWN
// =============================================================

function BreakdownList({ items, labelKey, emptyMessage, labelFormatter }) {
  if (!items || items.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 2,
        }}
      >
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{
        mt: 2,
      }}
    >
      {items.map((item) => {
        const percentage = safeNumber(item.percentage);

        return (
          <Box key={item[labelKey]}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {labelFormatter
                    ? labelFormatter(item[labelKey])
                    : item[labelKey]}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.transactionCount} transactions
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography variant="body2" fontWeight={700}>
                  {formatMoney(item.netRevenue)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                mt: 0.75,

                height: 8,

                bgcolor: "action.hover",

                borderRadius: 99,

                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(Math.max(percentage, 0), 100)}%`,

                  height: "100%",

                  bgcolor: "primary.main",

                  borderRadius: 99,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

// =============================================================
// MAIN PAGE
// =============================================================

function Revenue() {
  // =========================================================
  // LIBRARIES
  // =========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  // =========================================================
  // REVENUE
  // =========================================================

  const [revenueData, setRevenueData] = useState(null);

  const [period, setPeriod] = useState("30");

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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
          setSelectedLibraryId(String(list[0].id));
        }
      } catch (err) {
        console.error("Failed to load libraries:", err);

        setError(getErrorMessage(err, "Failed to load libraries."));
      } finally {
        setLoading(false);
      }
    };

    loadLibraries();
  }, []);

  // =========================================================
  // LOAD REVENUE
  // =========================================================

  const loadRevenueData = async (libraryId, days) => {
    if (!libraryId) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const data = await libraryRevenueApi.getRevenue(libraryId, days);

      setRevenueData(data || null);
    } catch (err) {
      console.error("Failed to load revenue:", err);

      setRevenueData(null);

      setError(getErrorMessage(err, "Failed to load revenue data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLibraryId) {
      loadRevenueData(Number(selectedLibraryId), Number(period));
    }
  }, [selectedLibraryId, period]);

  // =========================================================
  // BACKEND DATA
  // =========================================================

  const summary = revenueData?.summary || {};

  const trend = revenueData?.trend || [];

  const paymentMethods = revenueData?.paymentMethods || [];

  const revenueSources = revenueData?.revenueSources || [];

  const recentTransactions = revenueData?.recentTransactions || [];

  // =========================================================
  // EXTRA SUMMARY
  // =========================================================

  const refundAffectedPayments = useMemo(() => {
    return (
      safeNumber(summary.refundPendingPayments) +
      safeNumber(summary.partiallyRefundedPayments) +
      safeNumber(summary.refundedPayments)
    );
  }, [summary]);

  // =========================================================
  // INITIAL LOADING
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* =================================================
                HEADER
            ================================================= */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",

          md: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Revenue
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Track booking and membership revenue for your library.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={1.5}
        >
          {/* LIBRARY */}

          <FormControl
            size="small"
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={selectedLibraryId}
              label="Library"
              onChange={(event) => {
                setSelectedLibraryId(event.target.value);

                setError("");
              }}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* PERIOD */}

          <FormControl
            size="small"
            sx={{
              minWidth: 160,
            }}
          >
            <InputLabel>Trend Period</InputLabel>

            <Select
              value={period}
              label="Trend Period"
              onChange={(event) => setPeriod(event.target.value)}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>

              <MenuItem value="14">Last 14 Days</MenuItem>

              <MenuItem value="30">Last 30 Days</MenuItem>

              <MenuItem value="90">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* =================================================
                ERROR
            ================================================= */}

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

      {/* =================================================
                PRIMARY KPI
            ================================================= */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "repeat(2, 1fr)",

            xl: "repeat(4, 1fr)",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <SummaryCard
          title="Gross Revenue"
          value={formatMoney(summary.grossRevenue)}
          subtitle="Before refunds"
          icon={<CurrencyRupeeIcon color="primary" />}
        />

        <SummaryCard
          title="Refunded Amount"
          value={formatMoney(summary.refundedAmount)}
          subtitle={`${refundAffectedPayments} refund-affected payments`}
          icon={<ReplayIcon color="warning" />}
        />

        <SummaryCard
          title="Net Revenue"
          value={formatMoney(summary.netRevenue)}
          subtitle="After refunds"
          icon={<AccountBalanceWalletIcon color="success" />}
        />

        <SummaryCard
          title="Today's Revenue"
          value={formatMoney(summary.todayRevenue)}
          subtitle="Net revenue today"
          icon={<TodayIcon color="info" />}
        />
      </Box>

      {/* =================================================
                SECONDARY KPI
            ================================================= */}

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
          title="Monthly Revenue"
          value={formatMoney(summary.monthlyRevenue)}
          subtitle="Current calendar month"
          icon={<PaymentsIcon color="primary" />}
        />

        <SummaryCard
          title="Average Daily Revenue"
          value={formatMoney(summary.averageDailyRevenue)}
          subtitle="Average across revenue days"
          icon={<TrendingUpIcon color="info" />}
        />

        <SummaryCard
          title="Revenue Transactions"
          value={safeNumber(summary.totalRevenueTransactions)}
          subtitle="Booking + membership"
          icon={<PaymentsIcon color="primary" />}
        />

        <SummaryCard
          title="Successful Payments"
          value={safeNumber(summary.successfulPayments)}
          subtitle="Currently successful"
          icon={<CheckCircleIcon color="success" />}
        />
      </Box>

      {/* =================================================
                REVENUE TREND
            ================================================= */}

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

              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",

              sm: "center",
            }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Revenue Trend
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Net booking and membership revenue over the selected period.
              </Typography>
            </Box>

            <Chip
              variant="outlined"
              label={`Last ${revenueData?.trendDays || period} days`}
            />
          </Stack>

          {loading ? (
            <Box
              sx={{
                height: 230,

                display: "flex",

                justifyContent: "center",

                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <RevenueTrend
              data={trend}
              days={revenueData?.trendDays || period}
            />
          )}
        </CardContent>
      </Card>

      {/* =================================================
                BREAKDOWNS
            ================================================= */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            lg: "1fr 1fr",
          },

          gap: 2,

          mb: 3,
        }}
      >
        {/* PAYMENT METHOD */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              Revenue by Payment Method
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Net revenue grouped by payment method.
            </Typography>

            <BreakdownList
              items={paymentMethods}
              labelKey="paymentMethod"
              emptyMessage="No payment-method revenue data available."
              labelFormatter={(value) =>
                String(value || "UNKNOWN").replaceAll("_", " ")
              }
            />
          </CardContent>
        </Card>

        {/* REVENUE SOURCE */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              Revenue by Source
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Booking and membership contribution to net revenue.
            </Typography>

            <BreakdownList
              items={revenueSources}
              labelKey="referenceType"
              emptyMessage="No revenue-source data available."
              labelFormatter={(value) => {
                if (value === "MEMBERSHIP") {
                  return "Membership Revenue";
                }

                if (value === "BOOKING") {
                  return "Booking Revenue";
                }

                return String(value || "-").replaceAll("_", " ");
              }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* =================================================
                PAYMENT STATUS
            ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Revenue Payment Status
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
            }}
          >
            Status of revenue-bearing booking and membership payments.
          </Typography>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                sm: "repeat(2, 1fr)",

                lg: "repeat(4, 1fr)",
              },

              gap: 2,
            }}
          >
            <SummaryCard
              title="Success"
              value={safeNumber(summary.successfulPayments)}
              icon={<CheckCircleIcon color="success" />}
            />

            <SummaryCard
              title="Refund Pending"
              value={safeNumber(summary.refundPendingPayments)}
              icon={<ReplayIcon color="warning" />}
            />

            <SummaryCard
              title="Partially Refunded"
              value={safeNumber(summary.partiallyRefundedPayments)}
              icon={<ReplayIcon color="warning" />}
            />

            <SummaryCard
              title="Fully Refunded"
              value={safeNumber(summary.refundedPayments)}
              icon={<ReplayIcon color="info" />}
            />
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
                RECENT TRANSACTIONS
            ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Recent Revenue Transactions
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Latest booking and membership payments contributing to library
            revenue.
          </Typography>
        </CardContent>

        {loading ? (
          <Box
            sx={{
              minHeight: 220,

              display: "flex",

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : recentTransactions.length === 0 ? (
          <Box
            sx={{
              py: 8,

              px: 2,

              textAlign: "center",
            }}
          >
            <AccountBalanceWalletIcon
              sx={{
                fontSize: 48,

                color: "text.disabled",

                mb: 1,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No revenue transactions found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Revenue will appear after successful booking or membership
              payments.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Payment</TableCell>

                  <TableCell>Member</TableCell>

                  <TableCell>Revenue Source</TableCell>

                  <TableCell>Method</TableCell>

                  <TableCell align="right">Gross</TableCell>

                  <TableCell align="right">Refunded</TableCell>

                  <TableCell align="right">Net</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.paymentId} hover>
                    {/* PAYMENT */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        #{transaction.paymentId}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {transaction.receiptNumber || "-"}
                      </Typography>
                    </TableCell>

                    {/* MEMBER */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {transaction.customerName || "-"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {transaction.customerEmail || ""}
                      </Typography>
                    </TableCell>

                    {/* SOURCE */}

                    <TableCell>
                      {transaction.referenceType === "MEMBERSHIP"
                        ? "Membership"
                        : transaction.referenceType === "BOOKING"
                          ? "Booking"
                          : transaction.referenceType?.replaceAll("_", " ") ||
                            "-"}
                    </TableCell>

                    {/* METHOD */}

                    <TableCell>
                      {transaction.paymentMethod?.replaceAll("_", " ") || "-"}
                    </TableCell>

                    {/* GROSS */}

                    <TableCell align="right">
                      {formatMoney(transaction.amount)}
                    </TableCell>

                    {/* REFUND */}

                    <TableCell align="right">
                      {formatMoney(transaction.refundedAmount)}
                    </TableCell>

                    {/* NET */}

                    <TableCell align="right">
                      <Typography fontWeight={700}>
                        {formatMoney(transaction.netAmount)}
                      </Typography>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <PaymentStatusChip status={transaction.status} />
                    </TableCell>

                    {/* DATE */}

                    <TableCell>
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}

export default Revenue;
