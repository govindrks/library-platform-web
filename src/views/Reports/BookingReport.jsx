import React, { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
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
    EventAvailable,
    EventSeat,
    Groups,
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

/* ============================================================
   MOCK DATA
============================================================ */

const bookingTrendData = [
    { date: "01 Sep", bookings: 24 },
    { date: "03 Sep", bookings: 31 },
    { date: "05 Sep", bookings: 28 },
    { date: "07 Sep", bookings: 36 },
    { date: "09 Sep", bookings: 42 },
    { date: "11 Sep", bookings: 38 },
    { date: "13 Sep", bookings: 47 },
    { date: "15 Sep", bookings: 44 },
    { date: "17 Sep", bookings: 52 },
    { date: "19 Sep", bookings: 48 },
    { date: "21 Sep", bookings: 57 },
    { date: "23 Sep", bookings: 61 },
    { date: "25 Sep", bookings: 54 },
];

const bookingStatusData = [
    {
        name: "Completed",
        value: 326,
    },
    {
        name: "Confirmed",
        value: 48,
    },
    {
        name: "Pending",
        value: 12,
    },
    {
        name: "Cancelled",
        value: 18,
    },
];

const slotBookingData = [
    {
        slot: "Morning",
        bookings: 86,
    },
    {
        slot: "Afternoon",
        bookings: 64,
    },
    {
        slot: "Evening",
        bookings: 118,
    },
    {
        slot: "Night",
        bookings: 72,
    },
];

const recentBookings = [
    {
        id: "BK-1025",
        member: "Rahul Sharma",
        seat: "A12",
        slot: "Evening",
        date: "25 Sep 2026",
        amount: 80,
        status: "CONFIRMED",
    },
    {
        id: "BK-1024",
        member: "Priya Singh",
        seat: "B08",
        slot: "Morning",
        date: "25 Sep 2026",
        amount: 80,
        status: "COMPLETED",
    },
    {
        id: "BK-1023",
        member: "Amit Kumar",
        seat: "C14",
        slot: "Evening",
        date: "24 Sep 2026",
        amount: 80,
        status: "COMPLETED",
    },
    {
        id: "BK-1022",
        member: "Sneha Patel",
        seat: "A04",
        slot: "Afternoon",
        date: "24 Sep 2026",
        amount: 80,
        status: "CANCELLED",
    },
    {
        id: "BK-1021",
        member: "Vikas Gupta",
        seat: "D09",
        slot: "Night",
        date: "23 Sep 2026",
        amount: 80,
        status: "COMPLETED",
    },
];

/* ============================================================
   COMPONENT
============================================================ */

function BookingReport() {
    const [period, setPeriod] = useState("month");

    const totalBookings = useMemo(
        () =>
            bookingStatusData.reduce(
                (total, item) => total + item.value,
                0
            ),
        []
    );

    const completedBookings =
        bookingStatusData.find(
            (item) => item.name === "Completed"
        )?.value || 0;

    const cancelledBookings =
        bookingStatusData.find(
            (item) => item.name === "Cancelled"
        )?.value || 0;

    const completionRate =
        totalBookings > 0
            ? (
                  (completedBookings /
                      totalBookings) *
                  100
              ).toFixed(1)
            : "0.0";

    return (
        <Box>
            {/* ====================================================
                HEADER
            ===================================================== */}

            <ReportHeader
                title="Booking Reports"
                description="Track bookings, booking trends and seat reservations."
                action={
                    <ReportFilter
                        value={period}
                        onChange={setPeriod}
                    />
                }
            />

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
                    <ReportStatCard
                        title="Total Bookings"
                        value={totalBookings}
                        change="+14.6%"
                        icon={EventAvailable}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <ReportStatCard
                        title="Completed Bookings"
                        value={completedBookings}
                        change="+11.8%"
                        icon={TrendingUp}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <ReportStatCard
                        title="Active Members"
                        value="284"
                        change="+8.2%"
                        icon={Groups}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <ReportStatCard
                        title="Cancelled Bookings"
                        value={cancelledBookings}
                        change="-4.5%"
                        icon={EventSeat}
                        positive={true}
                    />
                </Grid>
            </Grid>

            {/* ====================================================
                BOOKING TREND
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
                                Booking Trend
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Number of bookings during the
                                selected period.
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
                            <BarChart
                                data={bookingTrendData}
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
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <Tooltip />

                                <Bar
                                    dataKey="bookings"
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

            {/* ====================================================
                BOOKING BREAKDOWN
            ===================================================== */}

            <Grid
                container
                spacing={2.5}
                mb={3}
            >
                {/* Booking Status */}

                <Grid
                    item
                    xs={12}
                    lg={5}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Booking Status
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={2}
                            >
                                Current booking status
                                distribution.
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 280,
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
                                                bookingStatusData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={100}
                                            paddingAngle={3}
                                        >
                                            {bookingStatusData.map(
                                                (
                                                    item,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={
                                                            item.name
                                                        }
                                                        fill={
                                                            [
                                                                "#16A34A",
                                                                "#0284C7",
                                                                "#F59E0B",
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
                                        {totalBookings}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total
                                    </Typography>
                                </Box>
                            </Box>

                            <Stack spacing={1.5}>
                                {bookingStatusData.map(
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
                                                                "#F59E0B",
                                                                "#DC2626",
                                                            ][
                                                                index
                                                            ],
                                                    }}
                                                />

                                                <Typography variant="body2">
                                                    {
                                                        item.name
                                                    }
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

                {/* Slot Performance */}

                <Grid
                    item
                    xs={12}
                    lg={7}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Bookings by Slot
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={2}
                            >
                                Booking distribution across
                                library time slots.
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 360,
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={
                                            slotBookingData
                                        }
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
                                            width={80}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="bookings"
                                            fill="#4F46E5"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ====================================================
                BOOKING PERFORMANCE
            ===================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        mb={0.5}
                    >
                        Booking Performance
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={3}
                    >
                        Overall booking performance for the
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
                                    Completion Rate
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    {completionRate}%
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
                                    Average Bookings / Day
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    48
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
                                    Average Booking Value
                                </Typography>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mt={0.5}
                                >
                                    ₹336
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* ====================================================
                RECENT BOOKINGS
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
                                Recent Bookings
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Latest seat booking activity.
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
                            View All Bookings
                        </Typography>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Booking ID
                                    </TableCell>

                                    <TableCell>
                                        Member
                                    </TableCell>

                                    <TableCell>
                                        Seat
                                    </TableCell>

                                    <TableCell>
                                        Slot
                                    </TableCell>

                                    <TableCell>
                                        Date
                                    </TableCell>

                                    <TableCell>
                                        Amount
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {recentBookings.map(
                                    (booking) => (
                                        <TableRow
                                            key={
                                                booking.id
                                            }
                                            hover
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        600
                                                    }
                                                >
                                                    {
                                                        booking.id
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    booking.member
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={
                                                        booking.seat
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    booking.slot
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    booking.date
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    ₹
                                                    {
                                                        booking.amount
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        booking.status
                                                    }
                                                    color={
                                                        booking.status ===
                                                        "COMPLETED"
                                                            ? "success"
                                                            : booking.status ===
                                                              "CONFIRMED"
                                                            ? "info"
                                                            : booking.status ===
                                                              "CANCELLED"
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

export default BookingReport;