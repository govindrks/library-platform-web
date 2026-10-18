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
  alpha,
  useTheme,
} from "@mui/material";

import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";

import { useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import libraryRevenueApi from "../../api/libraryRevenueApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const safeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (value) =>
  `₹${safeNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value) => {
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
};

const formatTrendDate = (value, days) => {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  if (Number(days) <= 7) {
    return date.toLocaleDateString("en-IN", { weekday: "short" });
  }
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const formatEnum = (value) =>
  value ? String(value).replaceAll("_", " ") : "-";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

function SummaryCard({ title, value, subtitle, icon, tone = "primary" }) {
  const theme = useTheme();
  const toneMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };
  const color = toneMap[tone] || theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(color, 0.16),
        borderRadius: 3.5,
        background: `linear-gradient(145deg, ${alpha(color, 0.055)} 0%, ${theme.palette.background.paper} 62%)`,
        boxShadow: "0 12px 34px rgba(15,23,42,0.045)",
        transition: "transform .2s ease, box-shadow .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 40px rgba(15,23,42,0.075)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.45, fontWeight: 900, letterSpacing: "-0.035em" }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.25, lineHeight: 1.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.4,
              color,
              bgcolor: alpha(color, 0.1),
              border: "1px solid",
              borderColor: alpha(color, 0.13),
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

function PaymentStatusChip({ status }) {
  const config = {
    SUCCESS: { label: "Success", color: "success" },
    REFUND_PENDING: { label: "Refund Pending", color: "warning" },
    PARTIALLY_REFUNDED: { label: "Partially Refunded", color: "warning" },
    REFUNDED: { label: "Refunded", color: "info" },
  };
  const current = config[status] || { label: status || "-", color: "default" };
  return (
    <Chip
      size="small"
      variant="outlined"
      color={current.color}
      label={current.label}
      sx={{ fontWeight: 700 }}
    />
  );
}

function RevenueTrend({ data, days }) {
  const theme = useTheme();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ height: 270, display: "grid", placeItems: "center" }}>
        <Stack spacing={1} alignItems="center">
          <InsightsIcon sx={{ fontSize: 38, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No revenue data available.
          </Typography>
        </Stack>
      </Box>
    );
  }

  const maxMagnitude = Math.max(
    ...data.map((item) => Math.abs(safeNumber(item.netRevenue))),
    1,
  );

  return (
    <Box sx={{ mt: 2.5, overflowX: "auto", pb: 1 }}>
      <Box
        sx={{
          minWidth: Number(days) > 30 ? 880 : "100%",
          height: 290,
          display: "flex",
          gap: 1,
        }}
      >
        {data.map((item, index) => {
          const net = safeNumber(item.netRevenue);
          const positive = net >= 0;
          const height = Math.max((Math.abs(net) / maxMagnitude) * 105, net !== 0 ? 6 : 2);
          const showLabel =
            Number(days) <= 14 || index % 5 === 0 || index === data.length - 1;

          return (
            <Box
              key={item.date}
              title={`Gross: ${formatMoney(item.grossRevenue)} | Refunds: ${formatMoney(item.refundedAmount)} | Expenses: ${formatMoney(item.expenses)} | Net: ${formatMoney(item.netRevenue)}`}
              sx={{
                flex: Number(days) <= 14 ? 1 : "0 0 31px",
                minWidth: Number(days) <= 14 ? 30 : 31,
                height: "100%",
                display: "grid",
                gridTemplateRows: "24px 105px 1px 105px 28px",
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: 10, fontWeight: 750, whiteSpace: "nowrap" }}
              >
                {positive && net !== 0 ? formatMoney(net) : ""}
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                {positive && net !== 0 && (
                  <Box
                    sx={{
                      width: "68%",
                      maxWidth: 28,
                      height,
                      borderRadius: "7px 7px 2px 2px",
                      bgcolor: "success.main",
                      boxShadow: `0 6px 14px ${alpha(theme.palette.success.main, 0.18)}`,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ width: "100%", height: 1, bgcolor: "divider" }} />

              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                }}
              >
                {!positive && (
                  <Box
                    sx={{
                      width: "68%",
                      maxWidth: 28,
                      height,
                      borderRadius: "2px 2px 7px 7px",
                      bgcolor: "error.main",
                      boxShadow: `0 6px 14px ${alpha(theme.palette.error.main, 0.16)}`,
                    }}
                  />
                )}
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 10, whiteSpace: "nowrap" }}
              >
                {showLabel ? formatTrendDate(item.date, days) : ""}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function BreakdownList({ items, labelKey, emptyMessage, labelFormatter }) {
  if (!items || items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {items.map((item) => {
        const percentage = safeNumber(item.percentage);
        return (
          <Box key={item[labelKey]}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {labelFormatter ? labelFormatter(item[labelKey]) : item[labelKey]}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.transactionCount} transactions
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography variant="body2" fontWeight={800}>
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

function FinancialPerformance({ summary }) {
  const net = safeNumber(summary.netRevenue);
  const cells = [
    ["Gross Revenue", summary.grossRevenue, "text.primary", ""],
    ["Refunds", summary.refundedAmount, "warning.main", "-"],
    ["After Refunds", summary.revenueAfterRefunds, "text.primary", ""],
    ["Expenses", summary.totalExpenses, "error.main", "-"],
    ["Net Revenue", summary.netRevenue, net >= 0 ? "success.main" : "error.main", ""],
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3.5,
        mb: 3,
        boxShadow: "0 12px 34px rgba(15,23,42,0.04)",
      }}
    >
      <CardContent sx={{ p: 2.8 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
          mb={2.5}
        >
          <Box>
            <Typography variant="h6" fontWeight={850}>
              Financial Performance
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.35}>
              Revenue after refunds compared with library operating expenses.
            </Typography>
          </Box>

          <Chip
            size="small"
            label={net >= 0 ? "Operating Surplus" : "Operating Loss"}
            color={net >= 0 ? "success" : "error"}
            variant="outlined"
            sx={{ fontWeight: 750 }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {cells.map(([label, value, color, prefix], index) => (
            <Box
              key={label}
              sx={{ p: 1.8, borderRadius: 2.5, bgcolor: "action.hover" }}
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography
                variant={index === cells.length - 1 ? "h5" : "h6"}
                sx={{ mt: 0.35, fontWeight: 900, color, letterSpacing: "-0.02em" }}
              >
                {prefix}{formatMoney(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function Revenue() {
  const theme = useTheme();
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [revenueData, setRevenueData] = useState(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await libraryApi.getMyLibraries();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
            ? data.content
            : [];

        setLibraries(list);
        if (!list.length) return;

        const stored = Number(localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY));
        const storedExists =
          Number.isFinite(stored) && list.some((item) => Number(item.id) === stored);
        const nextId = storedExists ? stored : list[0].id;

        setSelectedLibraryId(String(nextId));
        localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(nextId));
      } catch (err) {
        console.error("Failed to load libraries:", err);
        setError(getErrorMessage(err, "Failed to load libraries."));
      } finally {
        setLoading(false);
      }
    };

    loadLibraries();
  }, []);

  useEffect(() => {
    const loadRevenue = async () => {
      if (!selectedLibraryId) return;
      try {
        setLoading(true);
        setError("");
        const data = await libraryRevenueApi.getRevenue(
          Number(selectedLibraryId),
          Number(period),
        );
        setRevenueData(data || null);
      } catch (err) {
        console.error("Failed to load revenue:", err);
        setRevenueData(null);
        setError(getErrorMessage(err, "Failed to load revenue data."));
      } finally {
        setLoading(false);
      }
    };

    loadRevenue();
  }, [selectedLibraryId, period]);

  const summary = revenueData?.summary || {};
  const trend = revenueData?.trend || [];
  const paymentMethods = revenueData?.paymentMethods || [];
  const revenueSources = revenueData?.revenueSources || [];
  const recentTransactions = revenueData?.recentTransactions || [];

  const refundAffectedPayments = useMemo(
    () =>
      safeNumber(summary.refundPendingPayments) +
      safeNumber(summary.partiallyRefundedPayments) +
      safeNumber(summary.refundedPayments),
    [summary],
  );

  const netRevenue = safeNumber(summary.netRevenue);
  const monthlyNetRevenue = safeNumber(summary.monthlyNetRevenue);

  if (loading && libraries.length === 0) {
    return (
      <Box sx={{ minHeight: 420, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          px: { xs: 2.4, md: 3 },
          py: { xs: 2.4, md: 2.8 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.13),
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(255,255,255,0.98) 55%, rgba(16,185,129,0.045) 100%)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.05)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.8} alignItems="center">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 12px 26px rgba(79,70,229,0.22)",
              }}
            >
              <InsightsIcon />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.035em" }}>
                Revenue
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.35}>
                Track revenue, refunds, expenses and operating performance for your library.
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
            <FormControl size="small" sx={{ minWidth: 220, bgcolor: "background.paper" }}>
              <InputLabel>Library</InputLabel>
              <Select
                value={selectedLibraryId}
                label="Library"
                onChange={(event) => {
                  const value = event.target.value;
                  setSelectedLibraryId(value);
                  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(value));
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

            <FormControl size="small" sx={{ minWidth: 165, bgcolor: "background.paper" }}>
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", xl: "repeat(5,1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard title="Gross Revenue" value={formatMoney(summary.grossRevenue)} subtitle="Before refunds and expenses" icon={<CurrencyRupeeIcon />} />
        <SummaryCard title="Refunded Amount" value={formatMoney(summary.refundedAmount)} subtitle={`${refundAffectedPayments} refund-affected payments`} icon={<ReplayIcon />} tone="warning" />
        <SummaryCard title="Revenue After Refunds" value={formatMoney(summary.revenueAfterRefunds)} subtitle="Before operating expenses" icon={<AccountBalanceWalletIcon />} tone="info" />
        <SummaryCard title="Total Expenses" value={formatMoney(summary.totalExpenses)} subtitle="Recorded operating expenses" icon={<TrendingDownIcon />} tone="error" />
        <SummaryCard title="Net Revenue" value={formatMoney(summary.netRevenue)} subtitle="After refunds and expenses" icon={netRevenue >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />} tone={netRevenue >= 0 ? "success" : "error"} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard title="Today's Net Revenue" value={formatMoney(summary.todayNetRevenue)} subtitle={`${formatMoney(summary.todayRevenue)} revenue • ${formatMoney(summary.todayExpenses)} expenses`} icon={<TodayIcon />} tone={safeNumber(summary.todayNetRevenue) >= 0 ? "success" : "error"} />
        <SummaryCard title="Monthly Expenses" value={formatMoney(summary.monthlyExpenses)} subtitle="Current calendar month" icon={<ReceiptLongIcon />} tone="error" />
        <SummaryCard title="Monthly Net Revenue" value={formatMoney(summary.monthlyNetRevenue)} subtitle={`${formatMoney(summary.monthlyRevenue)} revenue before expenses`} icon={monthlyNetRevenue >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />} tone={monthlyNetRevenue >= 0 ? "success" : "error"} />
        <SummaryCard title="Expense Ratio" value={`${safeNumber(summary.expenseRatio).toFixed(1)}%`} subtitle="Expenses ÷ revenue after refunds" icon={<PaymentsIcon />} tone="warning" />
      </Box>

      <FinancialPerformance summary={summary} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard title="Monthly Revenue" value={formatMoney(summary.monthlyRevenue)} subtitle="After refunds, before expenses" icon={<PaymentsIcon />} />
        <SummaryCard title="Average Daily Revenue" value={formatMoney(summary.averageDailyRevenue)} subtitle="Average across revenue days" icon={<TrendingUpIcon />} tone="info" />
        <SummaryCard title="Revenue Transactions" value={safeNumber(summary.totalRevenueTransactions)} subtitle="Booking + membership" icon={<PaymentsIcon />} />
        <SummaryCard title="Successful Payments" value={safeNumber(summary.successfulPayments)} subtitle="Currently successful" icon={<CheckCircleIcon />} tone="success" />
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3.5, mb: 3, boxShadow: "0 12px 34px rgba(15,23,42,.04)" }}>
        <CardContent sx={{ p: 2.8 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={850}>Operating Net Revenue Trend</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.25}>Daily revenue after refunds and operating expenses.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" variant="outlined" color="success" label="Positive net" />
              <Chip size="small" variant="outlined" color="error" label="Operating loss" />
              <Chip size="small" variant="outlined" label={`Last ${revenueData?.trendDays || period} days`} />
            </Stack>
          </Stack>
          {loading ? (
            <Box sx={{ height: 290, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
          ) : (
            <RevenueTrend data={trend} days={revenueData?.trendDays || period} />
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3.5 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>Revenue by Payment Method</Typography>
            <Typography variant="body2" color="text.secondary">Payment revenue after refunds, before operating expenses.</Typography>
            <BreakdownList items={paymentMethods} labelKey="paymentMethod" emptyMessage="No payment-method revenue data available." labelFormatter={(value) => formatEnum(value || "UNKNOWN")} />
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3.5 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800}>Revenue by Source</Typography>
            <Typography variant="body2" color="text.secondary">Booking and membership contribution before operating expenses.</Typography>
            <BreakdownList
              items={revenueSources}
              labelKey="referenceType"
              emptyMessage="No revenue-source data available."
              labelFormatter={(value) => {
                if (value === "MEMBERSHIP") return "Membership Revenue";
                if (value === "BOOKING") return "Booking Revenue";
                return formatEnum(value);
              }}
            />
          </CardContent>
        </Card>
      </Box>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3.5, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>Revenue Payment Status</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Status of revenue-bearing booking and membership payments.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(4,1fr)" }, gap: 2 }}>
            <SummaryCard title="Success" value={safeNumber(summary.successfulPayments)} icon={<CheckCircleIcon />} tone="success" />
            <SummaryCard title="Refund Pending" value={safeNumber(summary.refundPendingPayments)} icon={<ReplayIcon />} tone="warning" />
            <SummaryCard title="Partially Refunded" value={safeNumber(summary.partiallyRefundedPayments)} icon={<ReplayIcon />} tone="warning" />
            <SummaryCard title="Fully Refunded" value={safeNumber(summary.refundedPayments)} icon={<ReplayIcon />} tone="info" />
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3.5, overflow: "hidden", boxShadow: "0 12px 34px rgba(15,23,42,.04)" }}>
        <CardContent sx={{ pb: 1.5 }}>
          <Typography variant="h6" fontWeight={800}>Recent Revenue Transactions</Typography>
          <Typography variant="body2" color="text.secondary">Latest booking and membership payments contributing to library revenue.</Typography>
        </CardContent>

        {loading ? (
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}><CircularProgress /></Box>
        ) : recentTransactions.length === 0 ? (
          <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" fontWeight={700}>No revenue transactions found</Typography>
            <Typography variant="body2" color="text.secondary">Revenue will appear after successful booking or membership payments.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>Payment</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Revenue Source</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Gross</TableCell>
                  <TableCell align="right">Refunded</TableCell>
                  <TableCell align="right">Payment Net</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.paymentId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>#{transaction.paymentId}</Typography>
                      <Typography variant="caption" color="text.secondary">{transaction.receiptNumber || "-"}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={650}>{transaction.customerName || "-"}</Typography>
                      <Typography variant="caption" color="text.secondary">{transaction.customerEmail || ""}</Typography>
                    </TableCell>
                    <TableCell>{transaction.referenceType === "MEMBERSHIP" ? "Membership" : transaction.referenceType === "BOOKING" ? "Booking" : formatEnum(transaction.referenceType)}</TableCell>
                    <TableCell>{formatEnum(transaction.paymentMethod)}</TableCell>
                    <TableCell align="right">{formatMoney(transaction.amount)}</TableCell>
                    <TableCell align="right">{formatMoney(transaction.refundedAmount)}</TableCell>
                    <TableCell align="right"><Typography fontWeight={800}>{formatMoney(transaction.netAmount)}</Typography></TableCell>
                    <TableCell><PaymentStatusChip status={transaction.status} /></TableCell>
                    <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
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
