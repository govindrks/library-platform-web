import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  AccountBalanceWallet,
  CalendarMonth,
  CreditCard,
  Download,
  Payments,
  PictureAsPdf,
  Refresh,
  TrendingUp,
} from "@mui/icons-material";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ReportHeader from "../../components/reports/ReportHeader";

import ReportFilter from "../../components/reports/ReportFilter";

import ReportStatCard from "../../components/reports/ReportStatCard";

import libraryApi from "../../api/libraryApi";

import reportApi from "../../api/reportApi";

// ============================================================

// DATE HELPERS

// ============================================================

const formatBackendDate = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPeriodRange = (period) => {
  const today = new Date();

  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  switch (period) {
    case "today":
      break;

    case "week": {
      const day = from.getDay();

      const difference = day === 0 ? 6 : day - 1;

      from.setDate(from.getDate() - difference);

      break;
    }

    case "quarter": {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;

      from.setMonth(quarterStartMonth, 1);

      break;
    }

    case "year":
      from.setMonth(0, 1);

      break;

    case "month":

    default:
      from.setDate(1);

      break;
  }

  return {
    fromDate: formatBackendDate(from),

    toDate: formatBackendDate(to),
  };
};

// ============================================================

// FORMATTERS

// ============================================================

const formatCurrency = (value, currency = "INR") => {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",

      currency: currency || "INR",

      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
};

const formatShortDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",
  }).format(date);
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  }).format(date);
};

const formatEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()

    .split("_")

    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))

    .join(" ");
};

const getStatusColor = (status) => {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "REFUND_PENDING":
      return "warning";

    case "PARTIALLY_REFUNDED":
      return "warning";

    case "REFUNDED":
      return "info";

    case "PENDING":

    case "CREATED":
      return "warning";

    case "FAILED":

    case "CANCELLED":
      return "error";

    default:
      return "default";
  }
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================

// REVENUE HELPERS

// ============================================================

const getReferenceType = (transaction) => {
  return transaction?.referenceType || transaction?.paymentFor || "-";
};

const getTransactionStatus = (transaction) => {
  return transaction?.paymentStatus || transaction?.status || "-";
};

const getTransactionNetAmount = (transaction) => {
  if (transaction?.netAmount != null) {
    return Number(transaction.netAmount);
  }

  const amount = Number(transaction?.amount || 0);

  const refunded = Number(transaction?.refundedAmount || 0);

  return Math.max(amount - refunded, 0);
};

// ============================================================

// COMPONENT

// ============================================================

function RevenueReport() {
  const { libraryId: routeLibraryId } = useParams();

  const isAdminReport =
    routeLibraryId !== undefined &&
    routeLibraryId !== null &&
    routeLibraryId !== "";

  // ========================================================

  // STATE

  // ========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState(() =>
    isAdminReport ? String(routeLibraryId) : "",
  );

  const [period, setPeriod] = useState("month");

  const [report, setReport] = useState(null);

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingReport, setLoadingReport] = useState(false);

  const [exportingPdf, setExportingPdf] = useState(false);

  const [exportingExcel, setExportingExcel] = useState(false);

  const [error, setError] = useState("");

  // ========================================================

  // DATE RANGE

  // ========================================================

  const dateRange = useMemo(() => getPeriodRange(period), [period]);

  // ========================================================

  // REQUEST

  // ========================================================

  const reportPayload = useMemo(() => {
    if (!selectedLibraryId) {
      return null;
    }

    return {
      libraryId: Number(selectedLibraryId),

      fromDate: dateRange.fromDate,

      toDate: dateRange.toDate,

      studentId: null,

      paymentStatus: null,

      paymentMethod: null,

      referenceType: null,

      page: 0,

      size: 200,

      sortBy: "transactionDate",

      sortDirection: "DESC",
    };
  }, [selectedLibraryId, dateRange]);

  // ========================================================

  // LOAD OWNER LIBRARIES

  // ========================================================

  useEffect(() => {
    if (isAdminReport) {
      setLibraries([]);
      setSelectedLibraryId(String(routeLibraryId));
      setLoadingLibraries(false);
      setError("");
      return undefined;
    }

    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        setError("");

        const response = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const data = Array.isArray(response)
          ? response
          : response?.content || [];

        setLibraries(data);

        if (data.length > 0) {
          setSelectedLibraryId(String(data[0].id));
        } else {
          setSelectedLibraryId("");

          setReport(null);

          setError("No library is associated with your account.");
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Failed to load owner libraries:", requestError);

        setError(
          getErrorMessage(requestError, "Unable to load your libraries."),
        );
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, [isAdminReport, routeLibraryId]);

  // ========================================================

  // LOAD REVENUE REPORT

  // ========================================================

  const loadReport = useCallback(async () => {
    if (!reportPayload) {
      setReport(null);

      return;
    }

    try {
      setLoadingReport(true);

      setError("");

      const response = await reportApi.generateRevenueReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load revenue report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate revenue report."),
      );
    } finally {
      setLoadingReport(false);
    }
  }, [reportPayload]);

  useEffect(() => {
    if (!loadingLibraries && reportPayload) {
      loadReport();
    }
  }, [loadingLibraries, reportPayload, loadReport]);

  // ========================================================

  // BACKEND DATA

  // ========================================================

  const summary = report?.summary || {};

  const transactions = Array.isArray(report?.records) ? report.records : [];

  // ========================================================

  // SUMMARY

  // ========================================================

  /*

 *   * New RevenueReportSummary:*

 *   **

 *   * grossRevenue*

 *   * refundedAmount*

 *   * netRevenue*

 *   * totalRevenue (compatibility alias)*

 *   * successfulPayments*

 *   * refundPendingPayments*

 *   * partiallyRefundedPayments*

 *   * refundedPayments*

 *   */

  const grossRevenue = Number(
    summary.grossRevenue ?? summary.totalRevenue ?? 0,
  );

  const refundedAmount = Number(summary.refundedAmount || 0);

  const netRevenue = Number(
    summary.netRevenue ??
      summary.totalRevenue ??
      Math.max(grossRevenue - refundedAmount, 0),
  );

  const successfulPayments = Number(summary.successfulPayments || 0);

  const totalTransactions = Number(
    summary.totalTransactions || report?.totalElements || 0,
  );

  const averageTransactionValue = Number(summary.averageTransactionValue || 0);

  // ========================================================

  // REVENUE TREND

  // ========================================================

  const revenueData = useMemo(() => {
    const grouped = new Map();

    transactions.forEach((transaction) => {
      if (!transaction.transactionDate) {
        return;
      }

      const date = String(transaction.transactionDate).slice(0, 10);

      const current = grouped.get(date) || 0;

      grouped.set(date, current + getTransactionNetAmount(transaction));
    });

    return Array.from(grouped.entries())

      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))

      .map(([date, revenue]) => ({
        date: formatShortDate(`${date}T00:00:00`),

        revenue: Number(revenue.toFixed(2)),
      }));
  }, [transactions]);

  // ========================================================

  // REVENUE BY BUSINESS SOURCE

  // ========================================================

  const sourceRevenue = useMemo(() => {
    const grouped = new Map();

    transactions.forEach((transaction) => {
      const source = getReferenceType(transaction);

      grouped.set(
        source,

        (grouped.get(source) || 0) + getTransactionNetAmount(transaction),
      );
    });

    return Array.from(grouped.entries())

      .map(([source, revenue]) => ({
        source: formatEnum(source),

        revenue: Number(revenue.toFixed(2)),
      }))

      .sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  // ========================================================

  // PAYMENT METHOD BREAKDOWN

  // ========================================================

  const paymentMethodData = useMemo(() => {
    const grouped = new Map();

    transactions.forEach((transaction) => {
      const method = transaction.paymentMethod || "UNKNOWN";

      grouped.set(
        method,

        (grouped.get(method) || 0) + getTransactionNetAmount(transaction),
      );
    });

    return Array.from(grouped.entries())

      .map(([method, amount]) => ({
        method: formatEnum(method),

        amount: Number(amount.toFixed(2)),
      }))

      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalPaymentMethodRevenue = useMemo(
    () =>
      paymentMethodData.reduce(
        (total, item) => total + Number(item.amount || 0),

        0,
      ),

    [paymentMethodData],
  );

  // ========================================================

  // RECENT TRANSACTIONS

  // ========================================================

  const recentTransactions = useMemo(
    () => transactions.slice(0, 10),

    [transactions],
  );

  // ========================================================

  // SELECTED LIBRARY

  // ========================================================

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,

    [libraries, selectedLibraryId],
  );

  // ========================================================

  // PERIOD LABEL

  // ========================================================

  const periodLabel = useMemo(
    () => `${formatDate(dateRange.fromDate)} - ${formatDate(dateRange.toDate)}`,

    [dateRange],
  );

  // ========================================================

  // EXPORT PDF

  // ========================================================

  const handlePdfExport = async () => {
    if (!reportPayload) {
      return;
    }

    try {
      setExportingPdf(true);

      setError("");

      await reportApi.downloadRevenuePdf(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Revenue PDF:", requestError);

      setError(getErrorMessage(requestError, "Unable to export Revenue PDF."));
    } finally {
      setExportingPdf(false);
    }
  };

  // ========================================================

  // EXPORT EXCEL

  // ========================================================

  const handleExcelExport = async () => {
    if (!reportPayload) {
      return;
    }

    try {
      setExportingExcel(true);

      setError("");

      await reportApi.downloadRevenueExcel(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Revenue Excel:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Revenue Excel."),
      );
    } finally {
      setExportingExcel(false);
    }
  };

  // ========================================================

  // INITIAL LOADING

  // ========================================================

  if (loadingLibraries) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        minHeight={320}
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading your libraries...
        </Typography>
      </Stack>
    );
  }

  // ========================================================

  // UI

  // ========================================================

  return (
    <Box>
      <ReportHeader
        title="Revenue"
        description="Track your library revenue and payment performance."
        action={
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            spacing={1.5}
          >
            {isAdminReport ? (
              <Chip
                label={`Library #${selectedLibraryId} · Admin scope`}
                color="primary"
                variant="outlined"
                sx={{
                  minHeight: 40,
                  fontWeight: 700,
                }}
              />
            ) : (
              <FormControl
                size="small"
                sx={{
                  minWidth: 200,
                }}
              >
                <InputLabel>Library</InputLabel>

                <Select
                  value={selectedLibraryId}
                  label="Library"
                  onChange={(event) => setSelectedLibraryId(event.target.value)}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <ReportFilter value={period} onChange={setPeriod} />

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadReport}
              disabled={loadingReport || !selectedLibraryId}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              startIcon={
                exportingPdf ? <CircularProgress size={16} /> : <PictureAsPdf />
              }
              onClick={handlePdfExport}
              disabled={exportingPdf || loadingReport || !reportPayload}
            >
              PDF
            </Button>

            <Button
              variant="contained"
              startIcon={
                exportingExcel ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Download />
                )
              }
              onClick={handleExcelExport}
              disabled={exportingExcel || loadingReport || !reportPayload}
            >
              Excel
            </Button>
          </Stack>
        }
      />

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

      <Stack
        direction={{
          xs: "column",

          sm: "row",
        }}
        spacing={1}
        mb={3}
      >
        {selectedLibrary && (
          <Chip label={selectedLibrary.name} variant="outlined" />
        )}

        <Chip icon={<CalendarMonth />} label={periodLabel} variant="outlined" />
      </Stack>

      {loadingReport && (
        <Box
          sx={{
            display: "flex",

            justifyContent: "center",

            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loadingReport && report && (
        <>
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Gross Revenue"
                value={formatCurrency(grossRevenue)}
                icon={AccountBalanceWallet}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Net Revenue"
                value={formatCurrency(netRevenue)}
                icon={Payments}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Refunded Amount"
                value={formatCurrency(refundedAmount)}
                positive={false}
                icon={TrendingUp}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Successful Payments"
                value={successfulPayments}
                icon={CreditCard}
              />
            </Grid>
          </Grid>

          <Card
            sx={{
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
                  xs: "flex-start",

                  sm: "center",
                }}
                spacing={1}
                mb={3}
              >
                <Box>
                  <Typography variant="h6">Revenue Trend</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Net revenue generated during the selected period.
                  </Typography>
                </Box>

                <Chip
                  icon={<CalendarMonth />}
                  label={periodLabel}
                  variant="outlined"
                  size="small"
                />
              </Stack>

              {revenueData.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 300,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No revenue activity found for this period.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",

                    height: 340,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="date" tickLine={false} axisLine={false} />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                          `₹${(Number(value) / 1000).toFixed(0)}k`
                        }
                      />

                      <Tooltip formatter={(value) => formatCurrency(value)} />

                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4F46E5"
                        fill="#EEF2FF"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2.5} mb={3}>
            {/* Revenue Source */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Revenue by Source</Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Net revenue contribution from bookings and memberships.
                  </Typography>

                  {sourceRevenue.length === 0 ? (
                    <Box
                      sx={{
                        height: 280,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No revenue source data available.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",

                        height: 280,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sourceRevenue}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="source"
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              `₹${(Number(value) / 1000).toFixed(0)}k`
                            }
                          />

                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />

                          <Bar
                            dataKey="revenue"
                            fill="#4F46E5"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Methods */}

            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    Revenue by Payment Method
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Net collected amount grouped by payment method.
                  </Typography>

                  {paymentMethodData.length === 0 ? (
                    <Box
                      sx={{
                        height: 240,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No payment method data available.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2.5}>
                      {paymentMethodData.map((item) => {
                        const percentage =
                          totalPaymentMethodRevenue > 0
                            ? (item.amount / totalPaymentMethodRevenue) * 100
                            : 0;

                        return (
                          <Box key={item.method}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={2}
                              mb={0.75}
                            >
                              <Typography variant="body2">
                                {item.method}
                              </Typography>

                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(item.amount)}
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                height: 7,

                                borderRadius: 5,

                                backgroundColor: "grey.200",

                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${Math.min(percentage, 100)}%`,

                                  height: "100%",

                                  backgroundColor: "primary.main",

                                  borderRadius: 5,
                                }}
                              />
                            </Box>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Revenue Performance
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Financial performance for the selected reporting period.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,

                      border: "1px solid",

                      borderColor: "divider",

                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {totalTransactions}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,

                      border: "1px solid",

                      borderColor: "divider",

                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Average Transaction Value
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(averageTransactionValue)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      p: 2,

                      border: "1px solid",

                      borderColor: "divider",

                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Refund Rate
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {grossRevenue > 0
                        ? ((refundedAmount / grossRevenue) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
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
                mb={2}
              >
                <Box>
                  <Typography variant="h6">Revenue Transactions</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Latest financial transactions included in this report.
                  </Typography>
                </Box>

                <Chip
                  label={`${report.totalElements || 0} records`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>

                      <TableCell>Member</TableCell>

                      <TableCell>Source</TableCell>

                      <TableCell>Method</TableCell>

                      <TableCell>Gross</TableCell>

                      <TableCell>Refunded</TableCell>

                      <TableCell>Net</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No revenue transactions found for the selected
                            period.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((transaction) => {
                        const status = getTransactionStatus(transaction);

                        const currency = transaction.currency || "INR";

                        return (
                          <TableRow key={transaction.paymentId} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {transaction.paymentId != null
                                  ? `#${transaction.paymentId}`
                                  : "-"}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {transaction.studentName || "-"}
                                </Typography>

                                {transaction.studentEmail && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {transaction.studentEmail}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={formatEnum(
                                  getReferenceType(transaction),
                                )}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {formatEnum(transaction.paymentMethod)}
                            </TableCell>

                            <TableCell>
                              <Typography fontWeight={600}>
                                {formatCurrency(transaction.amount, currency)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              {formatCurrency(
                                transaction.refundedAmount,

                                currency,
                              )}
                            </TableCell>

                            <TableCell>
                              <Typography fontWeight={600}>
                                {formatCurrency(
                                  getTransactionNetAmount(transaction),

                                  currency,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={formatEnum(status)}
                                color={getStatusColor(status)}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {formatDateTime(transaction.transactionDate)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default RevenueReport;
