import React, { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
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
    AccessTime,
    ArrowDownward,
    ArrowUpward,
    CalendarMonth,
    EventSeat,
    Groups,
    TrendingUp,
} from "@mui/icons-material";

import {
    Area,
    AreaChart,
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

/* ============================================================
   MOCK DATA
============================================================ */

const occupancyTrendData = [
    { date: "01 Sep", occupancy: 58 },
    { date: "03 Sep", occupancy: 62 },
    { date: "05 Sep", occupancy: 64 },
    { date: "07 Sep", occupancy: 69 },
    { date: "09 Sep", occupancy: 66 },
    { date: "11 Sep", occupancy: 72 },
    { date: "13 Sep", occupancy: 75 },
    { date: "15 Sep", occupancy: 71 },
    { date: "17 Sep", occupancy: 78 },
    { date: "19 Sep", occupancy: 74 },
    { date: "21 Sep", occupancy: 82 },
    { date: "23 Sep", occupancy: 86 },
    { date: "25 Sep", occupancy: 79 },
];

const slotOccupancyData = [
    {
        slot: "Morning",
        occupancy: 62,
    },
    {
        slot: "Afternoon",
        occupancy: 54,
    },
    {
        slot: "Evening",
        occupancy: 88,
    },
    {
        slot: "Night",
        occupancy: 71,
    },
];

const seatStatusData = [
    {
        name: "Occupied",
        value: 84,
    },
    {
        name: "Available",
        value: 30,
    },
    {
        name: "Blocked",
        value: 6,
    },
];

const peakHoursData = [
    {
        time: "06 AM",
        occupancy: 35,
    },
    {
        time: "08 AM",
        occupancy: 52,
    },
    {
        time: "10 AM",
        occupancy: 61,
    },
    {
        time: "12 PM",
        occupancy: 48,
    },
    {
        time: "02 PM",
        occupancy: 55,
    },
    {
        time: "04 PM",
        occupancy: 69,
    },
    {
        time: "06 PM",
        occupancy: 88,
    },
    {
        time: "08 PM",
        occupancy: 82,
    },
    {
        time: "10 PM",
        occupancy: 63,
    },
];

const highOccupancyPeriods = [
    {
        date: "25 Sep 2026",
        slot: "Evening",
        occupancy: 92,
        occupied: 110,
        total: 120,
    },
    {
        date: "24 Sep 2026",
        slot: "Evening",
        occupancy: 89,
        occupied: 107,
        total: 120,
    },
    {
        date: "23 Sep 2026",
        slot: "Evening",
        occupancy: 88,
        occupied: 106,
        total: 120,
    },
    {
        date: "22 Sep 2026",
        slot: "Morning",
        occupancy: 84,
        occupied: 101,
        total: 120,
    },
    {
        date: "21 Sep 2026",
        slot: "Evening",
        occupancy: 82,
        occupied: 98,
        total: 120,
    },
];

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    positive = true,
}) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                        >
                            {value}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            mt={1}
                        >
                            {positive ? (
                                <ArrowUpward
                                    sx={{
                                        fontSize: 16,
                                        color: "success.main",
                                    }}
                                />
                            ) : (
                                <ArrowDownward
                                    sx={{
                                        fontSize: 16,
                                        color: "error.main",
                                    }}
                                />
                            )}

                            <Typography
                                variant="caption"
                                color={
                                    positive
                                        ? "success.main"
                                        : "error.main"
                                }
                                fontWeight={600}
                            >
                                {change}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                vs previous period
                            </Typography>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "primary.light",
                            color: "primary.main",
                        }}
                    >
                        <Icon />
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

/* ============================================================
   OCCUPANCY REPORT
============================================================ */

function OccupancyReport() {
    const [period, setPeriod] = useState("month");

    const totalSeats = 120;
    const occupiedSeats = 84;
    const availableSeats = 30;
    const blockedSeats = 6;

    const currentOccupancy = useMemo(
        () => ((occupiedSeats / totalSeats) * 100).toFixed(1),
        []
    );

    const averageOccupancy = useMemo(() => {
        const total = occupancyTrendData.reduce(
            (sum, item) => sum + item.occupancy,
            0
        );

        return (total / occupancyTrendData.length).toFixed(1);
    }, []);

    return (
        <Box>
            {/* ====================================================
                HEADER
            ===================================================== */}

            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    md: "center",
                }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Occupancy Report
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Monitor seat utilization and library
                        occupancy performance.
                    </Typography>
                </Box>

                <FormControl
                    size="small"
                    sx={{ minWidth: 160 }}
                >
                    <InputLabel>Period</InputLabel>

                    <Select
                        value={period}
                        label="Period"
                        onChange={(event) =>
                            setPeriod(event.target.value)
                        }
                    >
                        <MenuItem value="today">
                            Today
                        </MenuItem>

                        <MenuItem value="week">
                            This Week
                        </MenuItem>

                        <MenuItem value="month">
                            This Month
                        </MenuItem>

                        <MenuItem value="quarter">
                            This Quarter
                        </MenuItem>

                        <MenuItem value="year">
                            This Year
                        </MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* ====================================================
                SUMMARY CARDS
            ===================================================== */}

            <Grid
                container
                spacing={2.5}
                mb={3}
            >
                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <StatCard
                        title="Current Occupancy"
                        value={`${currentOccupancy}%`}
                        change="+8.4%"
                        icon={EventSeat}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <StatCard
                        title="Average Occupancy"
                        value={`${averageOccupancy}%`}
                        change="+6.7%"
                        icon={TrendingUp}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <StatCard
                        title="Occupied Seats"
                        value={occupiedSeats}
                        change="+12.5%"
                        icon={Groups}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <StatCard
                        title="Available Seats"
                        value={availableSeats}
                        change="-5.8%"
                        icon={EventSeat}
                        positive={false}
                    />
                </Grid>
            </Grid>

            {/* ====================================================
                OCCUPANCY TREND
            ===================================================== */}

            <Card sx={{ mb: 3 }}>
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
                        mb={3}
                    >
                        <Box>
                            <Typography variant="h6">
                                Occupancy Trend
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Daily seat utilization during
                                the selected period.
                            </Typography>
                        </Box>

                        <Chip
                            icon={<CalendarMonth />}
                            label="September 2026"
                            variant="outlined"
                            size="small"
                        />
                    </Stack>

                    <Box
                        sx={{
                            width: "100%",
                            height: 340,
                        }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <AreaChart
                                data={occupancyTrendData}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) =>
                                        `${value}%`
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        `${value}%`
                                    }
                                />

                                <Area
                                    type="monotone"
                                    dataKey="occupancy"
                                    stroke="#4F46E5"
                                    fill="#EEF2FF"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* ====================================================
                SLOT OCCUPANCY + SEAT STATUS
            ===================================================== */}

            <Grid
                container
                spacing={2.5}
                mb={3}
            >
                {/* Slot Occupancy */}

                <Grid
                    item
                    xs={12}
                    lg={7}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Occupancy by Time Slot
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={3}
                            >
                                Average seat utilization across
                                library time slots.
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 320,
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={
                                            slotOccupancyData
                                        }
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="slot"
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <YAxis
                                            domain={[0, 100]}
                                            tickFormatter={(value) =>
                                                `${value}%`
                                            }
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                `${value}%`
                                            }
                                        />

                                        <Bar
                                            dataKey="occupancy"
                                            fill="#4F46E5"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Seat Status */}

                <Grid
                    item
                    xs={12}
                    lg={5}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Current Seat Status
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Current distribution of library
                                seats.
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 250,
                                    position: "relative",
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <PieChart>
                                        <Pie
                                            data={
                                                seatStatusData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={95}
                                            paddingAngle={3}
                                        >
                                            {seatStatusData.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            [
                                                                "#16A34A",
                                                                "#0284C7",
                                                                "#DC2626",
                                                            ][
                                                                index
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                <Box
                                    sx={{
                                        position:
                                            "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform:
                                            "translate(-50%, -50%)",
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {totalSeats}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total Seats
                                    </Typography>
                                </Box>
                            </Box>

                            <Stack spacing={1.5}>
                                {seatStatusData.map(
                                    (item, index) => (
                                        <Stack
                                            key={item.name}
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
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
                                                        borderRadius:
                                                            "50%",
                                                        backgroundColor:
                                                            [
                                                                "#16A34A",
                                                                "#0284C7",
                                                                "#DC2626",
                                                            ][
                                                                index
                                                            ],
                                                    }}
                                                />

                                                <Typography variant="body2">
                                                    {item.name}
                                                </Typography>
                                            </Stack>

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {item.value}
                                            </Typography>
                                        </Stack>
                                    )
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ====================================================
                PEAK HOURS
            ===================================================== */}

            <Card sx={{ mb: 3 }}>
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
                        mb={3}
                    >
                        <Box>
                            <Typography variant="h6">
                                Peak Occupancy Hours
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Identify the busiest hours of
                                the day.
                            </Typography>
                        </Box>

                        <Chip
                            icon={<AccessTime />}
                            label="Peak: 6 PM"
                            color="warning"
                            variant="outlined"
                            size="small"
                        />
                    </Stack>

                    <Box
                        sx={{
                            width: "100%",
                            height: 320,
                        }}
                    >
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <BarChart
                                data={peakHoursData}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) =>
                                        `${value}%`
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        `${value}%`
                                    }
                                />

                                <Bar
                                    dataKey="occupancy"
                                    fill="#F59E0B"
                                    radius={[
                                        6,
                                        6,
                                        0,
                                        0,
                                    ]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* ====================================================
                OCCUPANCY PERFORMANCE
            ===================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        mb={0.5}
                    >
                        Occupancy Performance
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={3}
                    >
                        Key seat utilization metrics for the
                        selected period.
                    </Typography>

                    <Grid
                        container
                        spacing={3}
                    >
                        <Grid
                            item
                            xs={12}
                            sm={4}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    border: "1px solid",
                                    borderColor:
                                        "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Current Occupancy
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    {currentOccupancy}%
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={4}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    border: "1px solid",
                                    borderColor:
                                        "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Average Occupancy
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    {averageOccupancy}%
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            sm={4}
                        >
                            <Box
                                sx={{
                                    p: 2,
                                    border: "1px solid",
                                    borderColor:
                                        "divider",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Peak Occupancy
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    92%
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* ====================================================
                HIGH OCCUPANCY PERIODS
            ===================================================== */}

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
                            <Typography variant="h6">
                                Highest Occupancy Periods
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Periods with the highest seat
                                utilization.
                            </Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            color="primary.main"
                            fontWeight={600}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            View Seat Map
                        </Typography>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Date
                                    </TableCell>

                                    <TableCell>
                                        Slot
                                    </TableCell>

                                    <TableCell>
                                        Occupied Seats
                                    </TableCell>

                                    <TableCell>
                                        Total Seats
                                    </TableCell>

                                    <TableCell>
                                        Occupancy
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {highOccupancyPeriods.map(
                                    (item) => (
                                        <TableRow
                                            key={`${item.date}-${item.slot}`}
                                            hover
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                >
                                                    {
                                                        item.date
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.slot
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.occupied
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    item.total
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography
                                                    fontWeight={600}
                                                    color={
                                                        item.occupancy >=
                                                        85
                                                            ? "error.main"
                                                            : "warning.main"
                                                    }
                                                >
                                                    {
                                                        item.occupancy
                                                    }
                                                    %
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        item.occupancy >=
                                                        85
                                                            ? "High"
                                                            : "Normal"
                                                    }
                                                    color={
                                                        item.occupancy >=
                                                        85
                                                            ? "error"
                                                            : "warning"
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default OccupancyReport;