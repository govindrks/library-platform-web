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
    AccountBalanceWallet,
    CalendarMonth,
    CreditCard,
    Payments,
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

/* ============================================================
   MOCK DATA
============================================================ */

const revenueData = [
    { date: "01 Sep", revenue: 7200 },
    { date: "03 Sep", revenue: 8400 },
    { date: "05 Sep", revenue: 7900 },
    { date: "07 Sep", revenue: 9600 },
    { date: "09 Sep", revenue: 10200 },
    { date: "11 Sep", revenue: 9100 },
    { date: "13 Sep", revenue: 11800 },
    { date: "15 Sep", revenue: 10900 },
    { date: "17 Sep", revenue: 12400 },
    { date: "19 Sep", revenue: 11600 },
    { date: "21 Sep", revenue: 13200 },
    { date: "23 Sep", revenue: 14500 },
    { date: "25 Sep", revenue: 13800 },
];

const planRevenue = [
    {
        plan: "Daily Pass",
        revenue: 18400,
        bookings: 230,
    },
    {
        plan: "Monthly Pass",
        revenue: 52600,
        bookings: 72,
    },
    {
        plan: "Quarterly Pass",
        revenue: 38400,
        bookings: 24,
    },
];

const paymentMethodData = [
    {
        method: "UPI",
        amount: 52400,
    },
    {
        method: "Card",
        amount: 31600,
    },
    {
        method: "Net Banking",
        amount: 18900,
    },
    {
        method: "Wallet",
        amount: 6500,
    },
];

const transactions = [
    {
        id: "PAY-1025",
        member: "Rahul Sharma",
        plan: "Monthly Pass",
        amount: 1800,
        method: "UPI",
        status: "SUCCESS",
        date: "25 Sep 2026",
    },
    {
        id: "PAY-1024",
        member: "Priya Singh",
        plan: "Daily Pass",
        amount: 80,
        method: "Card",
        status: "SUCCESS",
        date: "25 Sep 2026",
    },
    {
        id: "PAY-1023",
        member: "Amit Kumar",
        plan: "Monthly Pass",
        amount: 1800,
        method: "UPI",
        status: "SUCCESS",
        date: "24 Sep 2026",
    },
    {
        id: "PAY-1022",
        member: "Sneha Patel",
        plan: "Quarterly Pass",
        amount: 4800,
        method: "Card",
        status: "SUCCESS",
        date: "24 Sep 2026",
    },
    {
        id: "PAY-1021",
        member: "Vikas Gupta",
        plan: "Daily Pass",
        amount: 80,
        method: "UPI",
        status: "REFUNDED",
        date: "23 Sep 2026",
    },
];

/* ============================================================
   HELPERS
============================================================ */

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);

/* ============================================================
   COMPONENT
============================================================ */

function RevenueReport() {
    const [period, setPeriod] = useState("month");

    const totalRevenue = useMemo(
        () =>
            planRevenue.reduce(
                (total, item) => total + item.revenue,
                0
            ),
        []
    );

    const totalPaymentMethodRevenue = useMemo(
        () =>
            paymentMethodData.reduce(
                (total, item) => total + item.amount,
                0
            ),
        []
    );

    return (
        <Box>
            {/* ====================================================
                HEADER
            ===================================================== */}

            <ReportHeader
                title="Revenue"
                description="Track your library revenue and payment performance."
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
                        title="Total Revenue"
                        value={formatCurrency(totalRevenue)}
                        change="+12.8%"
                        icon={AccountBalanceWallet}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <ReportStatCard
                        title="Today's Revenue"
                        value={formatCurrency(8450)}
                        change="+8.4%"
                        icon={Payments}
                    />
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    lg={3}
                >
                    <ReportStatCard
                        title="Average Daily Revenue"
                        value={formatCurrency(9840)}
                        change="+6.2%"
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
                        title="Successful Payments"
                        value="326"
                        change="+15.3%"
                        icon={CreditCard}
                    />
                </Grid>
            </Grid>

            {/* ====================================================
                REVENUE TREND
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
                                Revenue Trend
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Revenue generated during the
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
                            <AreaChart
                                data={revenueData}
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
                                    tickFormatter={(value) =>
                                        `₹${value / 1000}k`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatCurrency(value)
                                    }
                                />

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
                </CardContent>
            </Card>

            {/* ====================================================
                REVENUE BREAKDOWN
            ===================================================== */}

            <Grid
                container
                spacing={2.5}
                mb={3}
            >
                {/* Membership Plans */}

                <Grid
                    item
                    xs={12}
                    lg={7}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Revenue by Membership Plan
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={3}
                            >
                                Revenue contribution from each
                                membership plan.
                            </Typography>

                            <Box
                                sx={{
                                    width: "100%",
                                    height: 280,
                                }}
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart
                                        data={planRevenue}
                                    >
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
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                `₹${value / 1000}k`
                                            }
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(value)
                                            }
                                        />

                                        <Bar
                                            dataKey="revenue"
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

                {/* Payment Methods */}

                <Grid
                    item
                    xs={12}
                    lg={5}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">
                                Revenue by Payment Method
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={3}
                            >
                                Breakdown of successful
                                payments.
                            </Typography>

                            <Stack spacing={2.5}>
                                {paymentMethodData.map(
                                    (item) => {
                                        const percentage =
                                            totalPaymentMethodRevenue >
                                            0
                                                ? (item.amount /
                                                      totalPaymentMethodRevenue) *
                                                  100
                                                : 0;

                                        return (
                                            <Box
                                                key={
                                                    item.method
                                                }
                                            >
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    mb={0.75}
                                                >
                                                    <Typography variant="body2">
                                                        {
                                                            item.method
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                    </Typography>
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        height: 7,
                                                        borderRadius: 5,
                                                        backgroundColor:
                                                            "grey.200",
                                                        overflow:
                                                            "hidden",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: `${percentage}%`,
                                                            height: "100%",
                                                            backgroundColor:
                                                                "primary.main",
                                                            borderRadius:
                                                                5,
                                                        }}
                                                    />
                                                </Box>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {percentage.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ====================================================
                RECENT TRANSACTIONS
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
                                Recent Transactions
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Latest payment activity.
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
                            View All Payments
                        </Typography>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Payment ID
                                    </TableCell>

                                    <TableCell>
                                        Member
                                    </TableCell>

                                    <TableCell>
                                        Plan
                                    </TableCell>

                                    <TableCell>
                                        Amount
                                    </TableCell>

                                    <TableCell>
                                        Method
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell>
                                        Date
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {transactions.map(
                                    (transaction) => (
                                        <TableRow
                                            key={
                                                transaction.id
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
                                                        transaction.id
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    transaction.member
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    transaction.plan
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Typography fontWeight={600}>
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    transaction.method
                                                }
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={
                                                        transaction.status
                                                    }
                                                    color={
                                                        transaction.status ===
                                                        "SUCCESS"
                                                            ? "success"
                                                            : "error"
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    transaction.date
                                                }
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

export default RevenueReport;