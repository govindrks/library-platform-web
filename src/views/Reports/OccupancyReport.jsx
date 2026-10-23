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
  Assessment,
  CalendarMonth,
  Download,
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

const STATUS_COLORS = ["#16A34A", "#0284C7", "#DC2626"];

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

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================

// ITEM HELPERS

//

// These support both the old seat-utilization DTO names and the

// newer occupancy-aware fields we added to the backend.

// ============================================================

const getSeatId = (item) => item?.seatId ?? item?.id ?? null;

const getSeatNumber = (item) => item?.seatNumber ?? "-";

const getFloorName = (item) => {
  if (item?.floorName) {
    return item.floorName;
  }

  if (item?.floorNumber != null) {
    return `Floor ${item.floorNumber}`;
  }

  return "Unassigned";
};

const getOccupancyStatus = (item) => {
  if (item?.occupancyStatus) {
    return item.occupancyStatus;
  }

  const utilization = Number(item?.utilizationRate || 0);

  if (utilization > 0) {
    return "OCCUPIED";
  }

  const physicalStatus = item?.seatStatus || item?.status;

  if (
    physicalStatus === "RESERVED" ||
    physicalStatus === "MAINTENANCE" ||
    physicalStatus === "BOOKED"
  ) {
    return "BLOCKED";
  }

  return "AVAILABLE";
};

const getUtilizationRate = (item) => {
  if (item?.utilizationRate != null) {
    return Number(item.utilizationRate);
  }

  const occupied = Number(item?.occupiedUnits || 0);

  const capacity = Number(item?.capacityUnits || 0);

  if (capacity <= 0) {
    return 0;
  }

  return (occupied * 100) / capacity;
};

const getStatusColor = (status) => {
  switch (status) {
    case "OCCUPIED":
      return "error";

    case "AVAILABLE":
      return "success";

    case "BLOCKED":
      return "warning";

    default:
      return "default";
  }
};

// ============================================================

// COMPONENT

// ============================================================

function OccupancyReport() {
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

      slotId: null,

      page: 0,

      size: 200,
    };
  }, [selectedLibraryId, dateRange]);

  // ========================================================

  // LOAD LIBRARIES

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

  // LOAD OCCUPANCY REPORT

  // ========================================================

  const loadReport = useCallback(async () => {
    if (!reportPayload) {
      setReport(null);

      return;
    }

    try {
      setLoadingReport(true);

      setError("");

      const response = await reportApi.generateOccupancyReport(reportPayload);

      setReport(response);
    } catch (requestError) {
      console.error("Failed to load occupancy report:", requestError);

      setReport(null);

      setError(
        getErrorMessage(requestError, "Unable to generate occupancy report."),
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

  const totalSeats = Number(summary.totalSeats || 0);

  const occupiedSeats = Number(summary.occupiedSeats || 0);

  const availableSeats = Number(summary.availableSeats || 0);

  const blockedSeats = Number(
    summary.blockedSeats ?? summary.reservedSeats ?? 0,
  );

  const totalBookings = Number(summary.totalBookings || 0);

  const totalOccupiedUnits = Number(summary.totalOccupiedUnits || 0);

  const totalCapacityUnits = Number(summary.totalCapacityUnits || 0);

  // ========================================================

  // UTILIZATION

  // ========================================================

  const occupancyPercentage = useMemo(() => {
    if (totalCapacityUnits > 0) {
      return (totalOccupiedUnits * 100) / totalCapacityUnits;
    }

    if (summary.utilizationRate != null) {
      return Number(summary.utilizationRate);
    }

    if (totalSeats > 0) {
      return (occupiedSeats * 100) / totalSeats;
    }

    return 0;
  }, [
    totalCapacityUnits,

    totalOccupiedUnits,

    summary.utilizationRate,

    totalSeats,

    occupiedSeats,
  ]);

  // ========================================================

  // STATUS BREAKDOWN

  // ========================================================

  const seatStatusData = useMemo(
    () => [
      {
        name: "Occupied",

        value: occupiedSeats,
      },

      {
        name: "Available",

        value: availableSeats,
      },

      {
        name: "Blocked",

        value: blockedSeats,
      },
    ],

    [occupiedSeats, availableSeats, blockedSeats],
  );

  // ========================================================

  // FLOOR UTILIZATION

  // ========================================================

  const floorUtilizationData = useMemo(() => {
    const floors = new Map();

    records.forEach((item) => {
      const floor = getFloorName(item);

      const existing = floors.get(floor) || {
        floor,

        seats: 0,

        occupiedUnits: 0,

        capacityUnits: 0,

        utilizationTotal: 0,
      };

      existing.seats += 1;

      existing.occupiedUnits += Number(item.occupiedUnits || 0);

      existing.capacityUnits += Number(item.capacityUnits || 0);

      existing.utilizationTotal += getUtilizationRate(item);

      floors.set(floor, existing);
    });

    return Array.from(floors.values())

      .map((floor) => {
        let utilization = 0;

        if (floor.capacityUnits > 0) {
          utilization = (floor.occupiedUnits * 100) / floor.capacityUnits;
        } else if (floor.seats > 0) {
          utilization = floor.utilizationTotal / floor.seats;
        }

        return {
          floor: floor.floor,

          utilization: Number(utilization.toFixed(1)),

          seats: floor.seats,
        };
      })

      .sort((a, b) => b.utilization - a.utilization);
  }, [records]);

  // ========================================================

  // TOP UTILIZED SEATS

  // ========================================================

  const topUtilizedSeats = useMemo(
    () =>
      [...records]

        .sort((a, b) => getUtilizationRate(b) - getUtilizationRate(a))

        .slice(0, 10),

    [records],
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

  const periodLabel = useMemo(
    () => `${formatDate(dateRange.fromDate)} - ${formatDate(dateRange.toDate)}`,

    [dateRange],
  );

  // ========================================================

  // PDF EXPORT

  // ========================================================

  const handlePdfExport = async () => {
    if (!reportPayload) {
      return;
    }

    try {
      setExportingPdf(true);

      setError("");

      await reportApi.downloadOccupancyPdf(reportPayload);
    } catch (requestError) {
      console.error("Unable to export occupancy PDF:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Occupancy PDF."),
      );
    } finally {
      setExportingPdf(false);
    }
  };

  // ========================================================

  // EXCEL EXPORT

  // ========================================================

  const handleExcelExport = async () => {
    if (!reportPayload) {
      return;
    }

    try {
      setExportingExcel(true);

      setError("");

      await reportApi.downloadOccupancyExcel(reportPayload);
    } catch (requestError) {
      console.error("Unable to export occupancy Excel:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to export Occupancy Excel."),
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
      <ReportHeader
        title="Occupancy Report"
        description="Analyze historical seat utilization and occupancy performance."
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

        {report?.slotName && (
          <Chip label={`Slot: ${report.slotName}`} variant="outlined" />
        )}

        <Chip icon={<CalendarMonth />} label={periodLabel} variant="outlined" />
      </Stack>

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
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Occupancy Rate"
                value={`${occupancyPercentage.toFixed(1)}%`}
                icon={Assessment}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Total Seats"
                value={totalSeats}
                icon={EventSeat}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Total Bookings"
                value={totalBookings}
                icon={Groups}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <ReportStatCard
                title="Blocked Seats"
                value={blockedSeats}
                icon={EventSeat}
                positive={false}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} mb={3}>
            {/* Floor Utilization */}

            <Grid item xs={12} lg={7}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Utilization by Floor</Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Seat utilization grouped by floor for the selected period.
                  </Typography>

                  {floorUtilizationData.length === 0 ? (
                    <Box
                      sx={{
                        height: 300,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        No floor utilization data available.
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
                        <BarChart data={floorUtilizationData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="floor"
                            tickLine={false}
                            axisLine={false}
                          />

                          <YAxis
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            tickLine={false}
                            axisLine={false}
                          />

                          <Tooltip
                            formatter={(value) =>
                              `${Number(value).toFixed(1)}%`
                            }
                          />

                          <Bar
                            dataKey="utilization"
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

            {/* Seat Status */}

            <Grid item xs={12} lg={5}>
              <Card
                sx={{
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6">Seat Status</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Seat distribution for this report.
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",

                      height: 250,

                      position: "relative",
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={seatStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {seatStatusData.map((item, index) => (
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
                        {totalSeats}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Total Seats
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={1.5}>
                    {seatStatusData.map((item, index) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        justifyContent="space-between"
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
          </Grid>

          <Card
            sx={{
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" mb={0.5}>
                Occupancy Performance
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Capacity and utilization statistics across the selected period.
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
                      Occupied Units
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {totalOccupiedUnits}
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
                      Capacity Units
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {totalCapacityUnits}
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
                      Average Study Hours
                    </Typography>

                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {Number(summary.averageStudyHours || 0).toFixed(1)}
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
                  <Typography variant="h6">Seat Utilization</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Highest utilized seats in the selected reporting period.
                  </Typography>
                </Box>

                <Chip
                  label={`${report.totalElements ?? records.length} seats`}
                  variant="outlined"
                  size="small"
                />
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Seat</TableCell>

                      <TableCell>Floor</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Bookings</TableCell>

                      <TableCell>Members</TableCell>

                      <TableCell>Occupied Units</TableCell>

                      <TableCell>Capacity Units</TableCell>

                      <TableCell>Utilization</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {topUtilizedSeats.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 5,
                          }}
                        >
                          <Typography color="text.secondary">
                            No seat utilization records found for the selected
                            period.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      topUtilizedSeats.map((item, index) => {
                        const status = getOccupancyStatus(item);

                        const utilization = getUtilizationRate(item);

                        return (
                          <TableRow
                            key={
                              getSeatId(item) ??
                              `${getSeatNumber(item)}-${index}`
                            }
                            hover
                          >
                            <TableCell>
                              <Chip
                                size="small"
                                label={getSeatNumber(item)}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>{getFloorName(item)}</TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={formatEnum(status)}
                                color={getStatusColor(status)}
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              {Number(item.bookingCount || 0)}
                            </TableCell>

                            <TableCell>
                              {Number(item.distinctMembers || 0)}
                            </TableCell>

                            <TableCell>
                              {Number(item.occupiedUnits || 0)}
                            </TableCell>

                            <TableCell>
                              {Number(item.capacityUnits || 0)}
                            </TableCell>

                            <TableCell>
                              <Typography
                                fontWeight={600}
                                color={
                                  utilization >= 80
                                    ? "error.main"
                                    : utilization >= 60
                                      ? "warning.main"
                                      : "success.main"
                                }
                              >
                                {utilization.toFixed(1)}%
                              </Typography>
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

export default OccupancyReport;
