import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  Replay,
} from "@mui/icons-material";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
// CONSTANTS
// ============================================================

const PAYMENT_STATUSES = [
  "ALL",
  "PENDING",
  "CREATED",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "REFUND_PENDING",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

const PAYMENT_METHODS = ["ALL", "UPI", "CARD", "NET_BANKING", "WALLET"];

const REFERENCE_TYPES = ["ALL", "BOOKING", "MEMBERSHIP"];

const STATUS_CHART_COLORS = [
  "#16A34A",
  "#F59E0B",
  "#0284C7",
  "#DC2626",
  "#64748B",
  "#7C3AED",
  "#C026D3",
  "#0F766E",
];

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
      const quarterStart = Math.floor(today.getMonth() / 3) * 3;

      from.setMonth(quarterStart, 1);

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

    case "PENDING":
    case "CREATED":
    case "REFUND_PENDING":
      return "warning";

    case "PARTIALLY_REFUNDED":
      return "secondary";

    case "REFUNDED":
      return "info";

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
// COMPONENT
// ============================================================

function PaymentReport() {
  // ========================================================
  // STATE
  // ========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [period, setPeriod] = useState("month");

  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const [paymentMethod, setPaymentMethod] = useState("ALL");

  const [referenceType, setReferenceType] = useState("ALL");

  const [report, setReport] = useState(null);

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingReport, setLoadingReport] = useState(false);

  const [exportingPdf, setExportingPdf] = useState(false);

  const [exportingExcel, setExportingExcel] = useState(false);

  const [error, setError] = useState("");

  // ========================================================
  // PERIOD
  // ========================================================

  const dateRange = useMemo(() => getPeriodRange(period), [period]);

  // ========================================================
  // REQUEST PAYLOAD
  // ========================================================

  const reportPayload = useMemo(() => {
    if (!selectedLibraryId) {
      return null;
    }

    return {
      libraryId: Number(selectedLibraryId),

      fromDate: dateRange.fromDate,

      toDate: dateRange.toDate,

      customerId: null,

      referenceType: referenceType === "ALL" ? null : referenceType,

      paymentStatus: paymentStatus === "ALL" ? null : paymentStatus,

      paymentMethod: paymentMethod === "ALL" ? null : paymentMethod,

      paymentGateway: null,

      page: 0,

      size: 200,

      sortBy: "transactionDate",

      sortDirection: "DESC",
    };
  }, [
    selectedLibraryId,
    dateRange,
    paymentStatus,
    paymentMethod,
    referenceType,
  ]);

  // ========================================================
  // LOAD OWNER LIBRARIES
  // ========================================================

  useEffect(() => {
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
  }, []);

  // ========================================================
  // LOAD REPORT
  // ========================================================

  const loadReport = useCallback(async () => {
    if (!reportPayload) {
      setReport(null);

      return;
    }

    try {
      setLoadingReport(true);

      setError("");

      const response = await reportApi.generatePaymentReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load payment report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate payment report."),
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

  const records = Array.isArray(report?.records) ? report.records : [];

  // ========================================================
  // SUMMARY VALUES
  // ========================================================

  const totalTransactions = Number(summary.totalTransactions || 0);

  const successfulPayments = Number(summary.successfulPayments || 0);

  const failedPayments = Number(summary.failedPayments || 0);

  const refundedAmount = Number(summary.refundedAmount || 0);

  const capturedAmount = Number(summary.capturedAmount || 0);

  const netCollectedAmount = Number(summary.netCollectedAmount || 0);

  const pendingAmount = Number(summary.pendingAmount || 0);

  const averageTransactionAmount = Number(
    summary.averageTransactionAmount || 0,
  );

  // ========================================================
  // STATUS DATA
  // ========================================================

  const statusData = useMemo(
    () =>
      [
        {
          name: "Pending",

          value: Number(summary.pendingPayments || 0),
        },
        {
          name: "Created",

          value: Number(summary.createdPayments || 0),
        },
        {
          name: "Success",

          value: successfulPayments,
        },
        {
          name: "Failed",

          value: failedPayments,
        },
        {
          name: "Cancelled",

          value: Number(summary.cancelledPayments || 0),
        },
        {
          name: "Refund Pending",

          value: Number(summary.refundPendingPayments || 0),
        },
        {
          name: "Partially Refunded",

          value: Number(summary.partiallyRefundedPayments || 0),
        },
        {
          name: "Refunded",

          value: Number(summary.refundedPayments || 0),
        },
      ].filter((item) => item.value > 0),
    [summary, successfulPayments, failedPayments],
  );

  // ========================================================
  // PAYMENT METHOD DATA
  // ========================================================

  const paymentMethodData = useMemo(() => {
    const grouped = new Map();

    records.forEach((transaction) => {
      const method = transaction.paymentMethod || "UNKNOWN";

      const current = grouped.get(method) || {
        method,
        transactions: 0,
        amount: 0,
      };

      current.transactions += 1;

      current.amount += Number(transaction.amount || 0);

      grouped.set(method, current);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,

        label: formatEnum(item.method),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [records]);

  // ========================================================
  // REFERENCE SOURCE DATA
  // ========================================================

  const referenceData = useMemo(() => {
    const grouped = new Map();

    records.forEach((transaction) => {
      const type = transaction.referenceType || "UNKNOWN";

      const existing = grouped.get(type) || {
        type,
        count: 0,
      };

      existing.count += 1;

      grouped.set(type, existing);
    });

    return Array.from(grouped.values()).map((item) => ({
      name: formatEnum(item.type),

      transactions: item.count,
    }));
  }, [records]);

  // ========================================================
  // RECENT TRANSACTIONS
  // ========================================================

  const recentTransactions = useMemo(() => records.slice(0, 15), [records]);

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

      await reportApi.downloadPaymentPdf(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Payment PDF:", requestError);

      setError(getErrorMessage(requestError, "Unable to export Payment PDF."));
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

      await reportApi.downloadPaymentExcel(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Payment Excel:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Payment Excel."),
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
        minHeight={320}
        alignItems="center"
        justifyContent="center"
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
      {/* ==================================================
                HEADER
            ================================================== */}

      <ReportHeader
        title="Payment Report"
        description="Analyze the complete payment transaction ledger for your library."
        action={
          <Stack
            direction={{
              xs: "column",
              xl: "row",
            }}
            spacing={1}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
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

            <ReportFilter value={period} onChange={setPeriod} />

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadReport}
              disabled={loadingReport || !reportPayload}
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

      {/* ==================================================
                ERROR
            ================================================== */}

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

      {/* ==================================================
                ADVANCED FILTERS
            ================================================== */}

      <Card
        sx={{
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
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: 190,
              }}
            >
              <InputLabel>Payment Status</InputLabel>

              <Select
                value={paymentStatus}
                label="Payment Status"
                onChange={(event) => setPaymentStatus(event.target.value)}
              >
                {PAYMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === "ALL" ? "All Statuses" : formatEnum(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Payment Method</InputLabel>

              <Select
                value={paymentMethod}
                label="Payment Method"
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method === "ALL" ? "All Methods" : formatEnum(method)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Payment For</InputLabel>

              <Select
                value={referenceType}
                label="Payment For"
                onChange={(event) => setReferenceType(event.target.value)}
              >
                {REFERENCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === "ALL" ? "All Sources" : formatEnum(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                flexGrow: 1,
              }}
            />

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {selectedLibrary && (
                <Chip label={selectedLibrary.name} variant="outlined" />
              )}

              <Chip
                icon={<CalendarMonth />}
                label={periodLabel}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ==================================================
                LOADING
            ================================================== */}

      {loadingReport && (
        <Box
          sx={{
            py: 8,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loadingReport && report && (
        <>
          {/* ======================================
                            SUMMARY CARDS
                        ====================================== */}

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Total Transactions"
                value={totalTransactions}
                icon={Payments}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Captured Amount"
                value={formatCurrency(capturedAmount)}
                icon={AccountBalanceWallet}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Net Collected"
                value={formatCurrency(netCollectedAmount)}
                icon={CreditCard}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Refunded Amount"
                value={formatCurrency(refundedAmount)}
                icon={Replay}
                positive={false}
              />
            </Grid>
          </Grid>

          {/* ======================================
                            PAYMENT STATUS + METHOD
                        ====================================== */}

          <Grid container spacing={2.5} mb={3}>
            {/* STATUS */}

            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Payment Status</Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Distribution of payment transactions by state.
                  </Typography>

                  {statusData.length === 0 ? (
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No payment status data available.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box
                        sx={{
                          height: 250,
                          position: "relative",
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={95}
                              paddingAngle={3}
                            >
                              {statusData.map((item, index) => (
                                <Cell
                                  key={item.name}
                                  fill={
                                    STATUS_CHART_COLORS[
                                      index % STATUS_CHART_COLORS.length
                                    ]
                                  }
                                />
                              ))}
                            </Pie>

                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>

                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="h5" fontWeight={700}>
                            {totalTransactions}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Transactions
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={1}>
                        {statusData.map((item, index) => (
                          <Stack
                            key={item.name}
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    STATUS_CHART_COLORS[
                                      index % STATUS_CHART_COLORS.length
                                    ],
                                }}
                              />

                              <Typography variant="body2">
                                {item.name}
                              </Typography>
                            </Stack>

                            <Typography variant="body2" fontWeight={600}>
                              {item.value}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* METHODS */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">
                    Transactions by Payment Method
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Total transaction value grouped by payment method.
                  </Typography>

                  {paymentMethodData.length === 0 ? (
                    <Box
                      sx={{
                        height: 320,
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
                    <Box
                      sx={{
                        width: "100%",
                        height: 320,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={paymentMethodData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="label"
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
                            dataKey="amount"
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
          </Grid>

          {/* ======================================
                            PAYMENT PERFORMANCE
                        ====================================== */}

          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Payment Performance
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Operational payment statistics for the selected period.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Successful Payments
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {successfulPayments}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Failed Payments
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {failedPayments}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Pending Amount
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(pendingAmount)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Average Transaction
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(averageTransactionAmount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ======================================
                            PAYMENT SOURCES
                        ====================================== */}

          {referenceData.length > 0 && (
            <Card
              sx={{
                mb: 3,
              }}
            >
              <CardContent>
                <Typography variant="h6">Payments by Source</Typography>

                <Typography variant="body2" color="text.secondary" mb={3}>
                  Transactions generated from bookings and memberships.
                </Typography>

                <Box
                  sx={{
                    width: "100%",
                    height: 280,
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={referenceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="name" tickLine={false} axisLine={false} />

                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="transactions"
                        fill="#4F46E5"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* ======================================
                            TRANSACTION TABLE
                        ====================================== */}

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
                  <Typography variant="h6">Payment Transactions</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Payment ledger for the selected report filters.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  variant="outlined"
                  label={`${report.totalElements || 0} records`}
                />
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payment ID</TableCell>

                      <TableCell>Customer</TableCell>

                      <TableCell>Payment For</TableCell>

                      <TableCell>Method</TableCell>

                      <TableCell>Gateway</TableCell>

                      <TableCell>Amount</TableCell>

                      <TableCell>Refund</TableCell>

                      <TableCell>Net</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No payment transactions found for the selected
                            filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((transaction) => (
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
                                {transaction.customerName || "-"}
                              </Typography>

                              {transaction.customerEmail && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {transaction.customerEmail}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Chip
                                label={formatEnum(transaction.referenceType)}
                                size="small"
                                variant="outlined"
                              />

                              {transaction.referenceId != null && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  #{transaction.referenceId}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            {formatEnum(transaction.paymentMethod)}
                          </TableCell>

                          <TableCell>
                            {formatEnum(transaction.paymentGateway)}
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {formatCurrency(
                                transaction.amount,
                                transaction.currency,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {formatCurrency(
                              transaction.refundedAmount,
                              transaction.currency,
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {formatCurrency(
                                transaction.netAmount,
                                transaction.currency,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={formatEnum(transaction.paymentStatus)}
                              color={getStatusColor(transaction.paymentStatus)}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            {formatDateTime(transaction.transactionDate)}
                          </TableCell>
                        </TableRow>
                      ))
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

export default PaymentReport;
