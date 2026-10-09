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
  CalendarMonth,
  Download,
  Groups,
  PictureAsPdf,
  Refresh,
  TrendingUp,
  WorkspacePremium,
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

const STATUS_COLORS = ["#16A34A", "#F59E0B", "#DC2626", "#0284C7", "#64748B"];

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
    case "ACTIVE":
      return "success";

    case "PENDING":
    case "PENDING_PAYMENT":
      return "warning";

    case "EXPIRED":
      return "info";

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
// RESPONSE HELPERS
//
// These tolerate the current Subscription Report naming while
// keeping the user-facing page called Membership Report.
// ============================================================

const getSubscriptionId = (item) => item?.subscriptionId ?? item?.id ?? null;

const getStudentName = (item) =>
  item?.studentName ?? item?.memberName ?? item?.userName ?? "-";

const getStudentEmail = (item) =>
  item?.studentEmail ?? item?.memberEmail ?? item?.userEmail ?? null;

const getPlanName = (item) =>
  item?.planName ?? item?.membershipPlanName ?? item?.membershipPlan ?? "-";

const getSeatNumber = (item) => item?.seatNumber ?? "-";

const getSubscriptionStatus = (item) =>
  item?.status ?? item?.subscriptionStatus ?? "-";

const getStartDate = (item) => item?.startDate ?? null;

const getEndDate = (item) => item?.endDate ?? null;

const getAmount = (item) =>
  Number(item?.amount ?? item?.price ?? item?.subscriptionAmount ?? 0);

const getCreatedAt = (item) => item?.createdAt ?? null;

// ============================================================
// COMPONENT
// ============================================================

function MembershipReport() {
  // ========================================================
  // STATE
  // ========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [period, setPeriod] = useState("month");

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

      studentId: null,

      page: 0,

      size: 200,

      sortBy: "createdAt",

      sortDirection: "DESC",
    };
  }, [selectedLibraryId, dateRange]);

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

      const response = await reportApi.generateMembershipReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load membership report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate membership report."),
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
  // SUMMARY FALLBACKS
  // ========================================================

  const totalSubscriptions = Number(
    summary.totalSubscriptions ??
      summary.totalRecords ??
      report?.totalElements ??
      records.length ??
      0,
  );

  const activeSubscriptions = Number(
    summary.activeSubscriptions ??
      records.filter((item) => getSubscriptionStatus(item) === "ACTIVE").length,
  );

  const expiredSubscriptions = Number(
    summary.expiredSubscriptions ??
      records.filter((item) => getSubscriptionStatus(item) === "EXPIRED")
        .length,
  );

  const cancelledSubscriptions = Number(
    summary.cancelledSubscriptions ??
      records.filter((item) => getSubscriptionStatus(item) === "CANCELLED")
        .length,
  );

  const uniqueMembers = Number(
    summary.uniqueStudents ??
      summary.uniqueMembers ??
      new Set(
        records
          .map(
            (item) =>
              item.studentId ??
              item.memberId ??
              item.userId ??
              getStudentEmail(item),
          )
          .filter(Boolean),
      ).size,
  );

  const totalAmount = Number(
    summary.totalRevenue ??
      summary.totalAmount ??
      records.reduce((total, item) => total + getAmount(item), 0),
  );

  // ========================================================
  // STATUS DATA
  // ========================================================

  const statusData = useMemo(() => {
    const grouped = new Map();

    records.forEach((item) => {
      const status = getSubscriptionStatus(item);

      grouped.set(status, (grouped.get(status) || 0) + 1);
    });

    if (grouped.size === 0 && totalSubscriptions > 0) {
      return [
        {
          name: "Active",
          value: activeSubscriptions,
        },
        {
          name: "Expired",
          value: expiredSubscriptions,
        },
        {
          name: "Cancelled",
          value: cancelledSubscriptions,
        },
      ].filter((item) => item.value > 0);
    }

    return Array.from(grouped.entries()).map(([status, value]) => ({
      name: formatEnum(status),

      value,
    }));
  }, [
    records,
    totalSubscriptions,
    activeSubscriptions,
    expiredSubscriptions,
    cancelledSubscriptions,
  ]);

  // ========================================================
  // PLAN DISTRIBUTION
  // ========================================================

  const planData = useMemo(() => {
    const grouped = new Map();

    records.forEach((item) => {
      const plan = getPlanName(item);

      const existing = grouped.get(plan) || {
        plan,
        subscriptions: 0,
        amount: 0,
      };

      existing.subscriptions += 1;

      existing.amount += getAmount(item);

      grouped.set(plan, existing);
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.subscriptions - a.subscriptions,
    );
  }, [records]);

  // ========================================================
  // RECENT SUBSCRIPTIONS
  // ========================================================

  const recentSubscriptions = useMemo(() => records.slice(0, 15), [records]);

  // ========================================================
  // LIBRARY / PERIOD LABEL
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

      await reportApi.downloadMembershipPdf(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Membership PDF:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Membership PDF."),
      );
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

      await reportApi.downloadMembershipExcel(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Membership Excel:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Membership Excel."),
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
        title="Membership Report"
        description="Analyze library memberships, member subscriptions and plan performance."
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
                minWidth: 190,
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
                CONTEXT
            ================================================== */}

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
                title="Total Memberships"
                value={totalSubscriptions}
                icon={WorkspacePremium}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Active Memberships"
                value={activeSubscriptions}
                icon={TrendingUp}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Unique Members"
                value={uniqueMembers}
                icon={Groups}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Membership Value"
                value={formatCurrency(totalAmount)}
                icon={WorkspacePremium}
              />
            </Grid>
          </Grid>

          {/* ======================================
                            STATUS + PLAN
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
                  <Typography variant="h6">Membership Status</Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Subscription status distribution for the selected period.
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
                        No membership status data available.
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
                            {totalSubscriptions}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Memberships
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

            {/* PLAN DISTRIBUTION */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Memberships by Plan</Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Subscription count grouped by membership plan.
                  </Typography>

                  {planData.length === 0 ? (
                    <Box
                      sx={{
                        minHeight: 320,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No membership plan data available.
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
                        <BarChart data={planData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="plan"
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip />

                          <Bar
                            dataKey="subscriptions"
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
                            MEMBERSHIP TABLE
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
                  <Typography variant="h6">Membership Records</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Membership subscriptions included in the selected report.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  variant="outlined"
                  label={`${report.totalElements ?? records.length} records`}
                />
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Subscription</TableCell>

                      <TableCell>Member</TableCell>

                      <TableCell>Plan</TableCell>

                      <TableCell>Seat</TableCell>

                      <TableCell>Start Date</TableCell>

                      <TableCell>End Date</TableCell>

                      <TableCell>Amount</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentSubscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No membership records found for the selected period.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentSubscriptions.map((item, index) => {
                        const status = getSubscriptionStatus(item);

                        return (
                          <TableRow
                            key={getSubscriptionId(item) ?? index}
                            hover
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {getSubscriptionId(item) != null
                                  ? `#${getSubscriptionId(item)}`
                                  : "-"}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {getStudentName(item)}
                                </Typography>

                                {getStudentEmail(item) && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {getStudentEmail(item)}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={getPlanName(item)}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>{getSeatNumber(item)}</TableCell>

                            <TableCell>
                              {formatDate(getStartDate(item))}
                            </TableCell>

                            <TableCell>
                              {formatDate(getEndDate(item))}
                            </TableCell>

                            <TableCell>
                              <Typography fontWeight={600}>
                                {formatCurrency(
                                  getAmount(item),
                                  item.currency || "INR",
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
                              {formatDateTime(getCreatedAt(item))}
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

export default MembershipReport;
