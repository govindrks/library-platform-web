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
  CheckCircle,
  Download,
  HourglassEmpty,
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

const REFUND_STATUSES = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
];

const REFERENCE_TYPES = ["ALL", "BOOKING", "MEMBERSHIP"];

const STATUS_COLORS = ["#F59E0B", "#0284C7", "#16A34A", "#DC2626", "#64748B"];

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
    case "PROCESSING":
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
// COMPONENT
// ============================================================

function RefundReport() {
  // ========================================================
  // STATE
  // ========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [period, setPeriod] = useState("month");

  const [refundStatus, setRefundStatus] = useState("ALL");

  const [referenceType, setReferenceType] = useState("ALL");

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

      paymentTransactionId: null,

      refundStatus: refundStatus === "ALL" ? null : refundStatus,

      referenceType: referenceType === "ALL" ? null : referenceType,

      page: 0,

      size: 200,

      sortBy: "createdAt",

      sortDirection: "DESC",
    };
  }, [selectedLibraryId, dateRange, refundStatus, referenceType]);

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
  // LOAD REFUND REPORT
  // ========================================================

  const loadReport = useCallback(async () => {
    if (!reportPayload) {
      setReport(null);

      return;
    }

    try {
      setLoadingReport(true);

      setError("");

      const response = await reportApi.generateRefundReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load refund report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate refund report."),
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

  const totalRefunds = Number(summary.totalRefunds || 0);

  const successfulRefunds = Number(summary.successfulRefunds || 0);

  const pendingRefunds = Number(summary.pendingRefunds || 0);

  const processingRefunds = Number(summary.processingRefunds || 0);

  const failedRefunds = Number(summary.failedRefunds || 0);

  const cancelledRefunds = Number(summary.cancelledRefunds || 0);

  const totalRequestedAmount = Number(summary.totalRequestedRefundAmount || 0);

  const successfulRefundAmount = Number(summary.successfulRefundAmount || 0);

  const averageSuccessfulRefundAmount = Number(
    summary.averageSuccessfulRefundAmount || 0,
  );

  // ========================================================
  // STATUS DISTRIBUTION
  // ========================================================

  const statusData = useMemo(
    () =>
      [
        {
          name: "Pending",

          value: pendingRefunds,
        },
        {
          name: "Processing",

          value: processingRefunds,
        },
        {
          name: "Success",

          value: successfulRefunds,
        },
        {
          name: "Failed",

          value: failedRefunds,
        },
        {
          name: "Cancelled",

          value: cancelledRefunds,
        },
      ].filter((item) => item.value > 0),
    [
      pendingRefunds,
      processingRefunds,
      successfulRefunds,
      failedRefunds,
      cancelledRefunds,
    ],
  );

  // ========================================================
  // REFUNDS BY SOURCE
  // ========================================================

  const sourceData = useMemo(() => {
    const grouped = new Map();

    records.forEach((refund) => {
      const source = refund.referenceType || "UNKNOWN";

      const existing = grouped.get(source) || {
        source,
        refunds: 0,
        amount: 0,
      };

      existing.refunds += 1;

      existing.amount += Number(refund.refundAmount || 0);

      grouped.set(source, existing);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        source: formatEnum(item.source),

        refunds: item.refunds,

        amount: item.amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [records]);

  // ========================================================
  // RECENT REFUNDS
  // ========================================================

  const recentRefunds = useMemo(() => records.slice(0, 15), [records]);

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

      await reportApi.downloadRefundPdf(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Refund PDF:", requestError);

      setError(getErrorMessage(requestError, "Unable to export Refund PDF."));
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

      await reportApi.downloadRefundExcel(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Refund Excel:", requestError);

      setError(getErrorMessage(requestError, "Unable to export Refund Excel."));
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
        title="Refund Report"
        description="Track refund requests, processing states and successfully refunded amounts."
        action={
          <Stack
            direction={{
              xs: "column",
              md: "row",
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
                FILTERS
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
                minWidth: 180,
              }}
            >
              <InputLabel>Refund Status</InputLabel>

              <Select
                value={refundStatus}
                label="Refund Status"
                onChange={(event) => setRefundStatus(event.target.value)}
              >
                {REFUND_STATUSES.map((status) => (
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
              <InputLabel>Refund Source</InputLabel>

              <Select
                value={referenceType}
                label="Refund Source"
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

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
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
                title="Total Refund Requests"
                value={totalRefunds}
                icon={Replay}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Successful Refunds"
                value={successfulRefunds}
                icon={CheckCircle}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Refunded Amount"
                value={formatCurrency(successfulRefundAmount)}
                icon={AccountBalanceWallet}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="In Progress"
                value={pendingRefunds + processingRefunds}
                icon={HourglassEmpty}
              />
            </Grid>
          </Grid>

          {/* ======================================
                            STATUS + SOURCE
                        ====================================== */}

          <Grid container spacing={2.5} mb={3}>
            {/* REFUND STATUS */}

            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Refund Status</Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Distribution of refund requests by processing state.
                  </Typography>

                  {statusData.length === 0 ? (
                    <Box
                      sx={{
                        minHeight: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No refund status data available.
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
                                    STATUS_COLORS[index % STATUS_COLORS.length]
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
                            {totalRefunds}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Refunds
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
                                    STATUS_COLORS[index % STATUS_COLORS.length],
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

            {/* SOURCE BREAKDOWN */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Refunds by Source</Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Requested refund amounts grouped by booking or membership
                    source.
                  </Typography>

                  {sourceData.length === 0 ? (
                    <Box
                      sx={{
                        minHeight: 320,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No refund source data available.
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
                        <BarChart data={sourceData}>
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
                            REFUND PERFORMANCE
                        ====================================== */}

          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Refund Performance
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Operational refund values for the selected period.
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
                      Requested Amount
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(totalRequestedAmount)}
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
                      Successful Amount
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(successfulRefundAmount)}
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
                      Average Successful Refund
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(averageSuccessfulRefundAmount)}
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
                      Failed / Cancelled
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {failedRefunds + cancelledRefunds}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ======================================
                            REFUND TABLE
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
                  <Typography variant="h6">Refund Records</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Refund audit trail for the selected filters.
                  </Typography>
                </Box>

                <Chip
                  label={`${report.totalElements || 0} records`}
                  variant="outlined"
                  size="small"
                />
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Refund ID</TableCell>

                      <TableCell>Customer</TableCell>

                      <TableCell>Payment</TableCell>

                      <TableCell>Source</TableCell>

                      <TableCell>Amount</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Requested By</TableCell>

                      <TableCell>Created</TableCell>

                      <TableCell>Processed</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentRefunds.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No refund records found for the selected filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentRefunds.map((refund) => (
                        <TableRow key={refund.refundId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {refund.refundId != null
                                ? `#${refund.refundId}`
                                : "-"}
                            </Typography>

                            {refund.gatewayRefundId && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {refund.gatewayRefundId}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {refund.customerName || "-"}
                              </Typography>

                              {refund.customerEmail && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {refund.customerEmail}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {refund.paymentTransactionId != null
                                ? `#${refund.paymentTransactionId}`
                                : "-"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {formatCurrency(
                                refund.originalPaymentAmount,
                                refund.currency,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Chip
                                size="small"
                                variant="outlined"
                                label={formatEnum(refund.referenceType)}
                              />

                              {refund.referenceId != null && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  #{refund.referenceId}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {formatCurrency(
                                refund.refundAmount,
                                refund.currency,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={formatEnum(refund.refundStatus)}
                              color={getStatusColor(refund.refundStatus)}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {refund.requestedByName || "-"}
                              </Typography>

                              {refund.requestedByEmail && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {refund.requestedByEmail}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            {formatDateTime(refund.createdAt)}
                          </TableCell>

                          <TableCell>
                            {formatDateTime(refund.processedAt)}
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

export default RefundReport;
