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
  EventAvailable,
  EventSeat,
  Groups,
  PictureAsPdf,
  Refresh,
  TrendingUp,
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

const STATUS_COLORS = ["#16A34A", "#F59E0B", "#0284C7", "#DC2626"];

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

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
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

const formatShortDate = (value) => {
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
  }).format(date);
};

const getStatusLabel = (status) => {
  switch (status) {
    case "ACTIVE":
      return "Active";

    case "PENDING_PAYMENT":
      return "Pending Payment";

    case "EXPIRED":
      return "Expired";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

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
// COMPONENT
// ============================================================

function BookingReport() {
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
  // SELECTED PERIOD
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

      seatId: null,

      slotId: null,

      bookingStatus: null,

      page: 0,

      /*
       * Load enough records for the charts and
       * recent-booking table while summary values
       * remain calculated across the whole result.
       */
      size: 200,

      sortBy: "bookingDate",

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
  // LOAD BOOKING REPORT
  // ========================================================

  const loadReport = useCallback(async () => {
    if (!reportPayload) {
      setReport(null);

      return;
    }

    try {
      setLoadingReport(true);

      setError("");

      const response = await reportApi.generateBookingReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load booking report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate booking report."),
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
  // RAW BACKEND DATA
  // ========================================================

  const summary = report?.summary || {};

  const records = Array.isArray(report?.records) ? report.records : [];

  // ========================================================
  // SUMMARY VALUES
  // ========================================================

  const totalBookings = Number(summary.totalBookings || 0);

  const activeBookings = Number(summary.activeBookings || 0);

  const pendingBookings = Number(summary.pendingPaymentBookings || 0);

  const expiredBookings = Number(summary.expiredBookings || 0);

  const cancelledBookings = Number(summary.cancelledBookings || 0);

  const uniqueMembers = Number(summary.uniqueMembers || 0);

  const averageBookingAmount = Number(summary.averageBookingAmount || 0);

  // ========================================================
  // BOOKING STATUS CHART
  // ========================================================

  const bookingStatusData = useMemo(
    () => [
      {
        name: "Active",

        value: activeBookings,
      },
      {
        name: "Pending Payment",

        value: pendingBookings,
      },
      {
        name: "Expired",

        value: expiredBookings,
      },
      {
        name: "Cancelled",

        value: cancelledBookings,
      },
    ],
    [activeBookings, pendingBookings, expiredBookings, cancelledBookings],
  );

  // ========================================================
  // BOOKING TREND
  // Derived from returned booking records.
  // ========================================================

  const bookingTrendData = useMemo(() => {
    const grouped = new Map();

    records.forEach((booking) => {
      const date = booking.bookingDate;

      if (!date) {
        return;
      }

      grouped.set(date, (grouped.get(date) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, bookings]) => ({
        date: formatShortDate(date),

        bookings,
      }));
  }, [records]);

  // ========================================================
  // SLOT BREAKDOWN
  // ========================================================

  const slotBookingData = useMemo(() => {
    const grouped = new Map();

    records.forEach((booking) => {
      const slot = booking.slotName || "No Slot";

      grouped.set(slot, (grouped.get(slot) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([slot, bookings]) => ({
        slot,
        bookings,
      }))
      .sort((a, b) => b.bookings - a.bookings);
  }, [records]);

  // ========================================================
  // PERFORMANCE
  // ========================================================

  const fulfilledBookings = activeBookings + expiredBookings;

  const fulfilmentRate =
    totalBookings > 0
      ? ((fulfilledBookings / totalBookings) * 100).toFixed(1)
      : "0.0";

  const dayCount = useMemo(() => {
    const start = new Date(`${dateRange.fromDate}T00:00:00`);

    const end = new Date(`${dateRange.toDate}T00:00:00`);

    const difference = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(difference + 1, 1);
  }, [dateRange]);

  const averageBookingsPerDay =
    totalBookings > 0 ? (totalBookings / dayCount).toFixed(1) : "0.0";

  // ========================================================
  // RECENT BOOKINGS
  // ========================================================

  const recentBookings = useMemo(() => records.slice(0, 10), [records]);

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

      await reportApi.downloadBookingPdf(reportPayload);
    } catch (requestError) {
      console.error("Failed to export booking PDF:", requestError);

      setError(getErrorMessage(requestError, "Unable to export Booking PDF."));
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

      await reportApi.downloadBookingExcel(reportPayload);
    } catch (requestError) {
      console.error("Failed to export Booking Excel:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Booking Excel."),
      );
    } finally {
      setExportingExcel(false);
    }
  };

  // ========================================================
  // LOADING LIBRARIES
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
      {/* ==================================================
                HEADER
            ================================================== */}

      <ReportHeader
        title="Booking Reports"
        description="Track bookings, booking trends and seat reservations."
        action={
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.5}
          >
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
                REPORT CONTEXT
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
                REPORT LOADING
            ================================================== */}

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
          {/* ==========================================
                        SUMMARY CARDS
                    ========================================== */}

          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Total Bookings"
                value={totalBookings}
                icon={EventAvailable}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Active Bookings"
                value={activeBookings}
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
                title="Cancelled Bookings"
                value={cancelledBookings}
                icon={EventSeat}
                positive={false}
              />
            </Grid>
          </Grid>

          {/* ==========================================
                        BOOKING TREND
                    ========================================== */}

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
                  <Typography variant="h6">Booking Trend</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Number of bookings during the selected period.
                  </Typography>
                </Box>

                <Chip
                  icon={<CalendarMonth />}
                  label={periodLabel}
                  variant="outlined"
                  size="small"
                />
              </Stack>

              {bookingTrendData.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 250,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No booking activity found for this period.
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
                    <BarChart data={bookingTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />

                      <XAxis dataKey="date" tickLine={false} axisLine={false} />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="bookings"
                        fill="#4F46E5"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ==========================================
                        BOOKING BREAKDOWN
                    ========================================== */}

          <Grid container spacing={2.5} mb={3}>
            {/* Booking Status */}

            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Booking Status</Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Booking status distribution for the selected period.
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      height: 280,
                      position: "relative",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={100}
                          paddingAngle={3}
                        >
                          {bookingStatusData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={STATUS_COLORS[index % STATUS_COLORS.length]}
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
                        {totalBookings}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={1.5}>
                    {bookingStatusData.map((item, index) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor:
                                STATUS_COLORS[index % STATUS_COLORS.length],
                            }}
                          />

                          <Typography variant="body2">{item.name}</Typography>
                        </Stack>

                        <Typography variant="body2" fontWeight={600}>
                          {item.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Booking by Slot */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Bookings by Slot</Typography>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Booking distribution across library time slots.
                  </Typography>

                  {slotBookingData.length === 0 ? (
                    <Box
                      sx={{
                        height: 360,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No slot booking data available.
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: 360,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={slotBookingData}
                          layout="vertical"
                          margin={{
                            left: 20,
                            right: 20,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                          />

                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            type="category"
                            dataKey="slot"
                            tickLine={false}
                            axisLine={false}
                            width={100}
                          />

                          <Tooltip />

                          <Bar
                            dataKey="bookings"
                            fill="#4F46E5"
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ==========================================
                        BOOKING PERFORMANCE
                    ========================================== */}

          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Booking Performance
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Overall booking performance for the selected period.
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
                      Fulfilment Rate
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {fulfilmentRate}%
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
                      Average Bookings / Day
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {averageBookingsPerDay}
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
                      Average Booking Value
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {formatCurrency(averageBookingAmount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* ==========================================
                        RECENT BOOKINGS
                    ========================================== */}

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
                mb={2}
              >
                <Box>
                  <Typography variant="h6">Recent Bookings</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Latest booking activity from the selected report period.
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
                      <TableCell>Booking ID</TableCell>

                      <TableCell>Member</TableCell>

                      <TableCell>Seat</TableCell>

                      <TableCell>Floor</TableCell>

                      <TableCell>Slot</TableCell>

                      <TableCell>Date</TableCell>

                      <TableCell>Amount</TableCell>

                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {recentBookings.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No booking records found for the selected period.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentBookings.map((booking) => (
                        <TableRow key={booking.bookingId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {`#${booking.bookingId}`}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {booking.studentName || "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {booking.studentEmail || ""}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={booking.seatNumber || "-"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            {booking.floorName ||
                              (booking.floorNumber != null
                                ? `Floor ${booking.floorNumber}`
                                : "-")}
                          </TableCell>

                          <TableCell>{booking.slotName || "-"}</TableCell>

                          <TableCell>
                            {formatDate(booking.bookingDate)}
                          </TableCell>

                          <TableCell>
                            <Typography fontWeight={600}>
                              {formatCurrency(booking.amount)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={getStatusLabel(booking.bookingStatus)}
                              color={getStatusColor(booking.bookingStatus)}
                              variant="outlined"
                            />
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

export default BookingReport;
