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
    AccountBalanceWallet,
    ArrowDownward,
    ArrowUpward,
    CalendarMonth,
    CreditCard,
    Payments,
    TrendingUp,
} from "@mui/icons-material";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Bar,
    BarChart,
} from "recharts";

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

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);

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

                        <Typography variant="h4" fontWeight={700}>
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

    return (
        <Box>
            {/* Header */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Revenue
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Track your library revenue and payment performance.
                    </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Period</InputLabel>

                    <Select
                        value={period}
                        label="Period"
                        onChange={(event) =>
                            setPeriod(event.target.value)
                        }
                    >
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="quarter">
                            This Quarter
                        </MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {/* Stats */}
            <Grid container spacing={2.5} mb={3}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(totalRevenue)}
                        change="+12.8%"
                        icon={AccountBalanceWallet}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Today's Revenue"
                        value={formatCurrency(8450)}
                        change="+8.4%"
                        icon={Payments}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Average Daily Revenue"
                        value={formatCurrency(9840)}
                        change="+6.2%"
                        icon={TrendingUp}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Successful Payments"
                        value="326"
                        change="+15.3%"
                        icon={CreditCard}
                    />
                </Grid>
            </Grid>

            {/* Revenue Chart */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
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
                                Revenue generated during the selected period.
                            </Typography>
                        </Box>

                        <Chip
                            icon={<CalendarMonth />}
                            label="September 2026"
                            variant="outlined"
                            size="small"
                        />
                    </Stack>

                    <Box sx={{ width: "100%", height: 340 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
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

            {/* Revenue breakdown */}
            <Grid container spacing={2.5} mb={3}>
                <Grid item xs={12} lg={7}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" mb={0.5}>
                                Revenue by Membership Plan
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={3}
                            >
                                Revenue contribution from each membership
                                plan.
                            </Typography>

                            <Box sx={{ width: "100%", height: 280 }}>
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <BarChart data={planRevenue}>
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
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} lg={5}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" mb={0.5}>
                                Revenue by Payment Method
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={3}
                            >
                                Breakdown of successful payments.
                            </Typography>

                            <Stack spacing={2.5}>
                                {paymentMethodData.map((item) => {
                                    const percentage =
                                        (item.amount /
                                            paymentMethodData.reduce(
                                                (sum, data) =>
                                                    sum + data.amount,
                                                0
                                            )) *
                                        100;

                                    return (
                                        <Box key={item.method}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                mb={0.75}
                                            >
                                                <Typography variant="body2">
                                                    {item.method}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
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
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${percentage}%`,
                                                        height: "100%",
                                                        backgroundColor:
                                                            "primary.main",
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
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Transactions */}
            <Card>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
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
                            sx={{ cursor: "pointer" }}
                        >
                            View All Payments
                        </Typography>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Payment ID</TableCell>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Plan</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow
                                        key={transaction.id}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {transaction.id}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {transaction.member}
                                        </TableCell>

                                        <TableCell>
                                            {transaction.plan}
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                {formatCurrency(
                                                    transaction.amount
                                                )}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            {transaction.method}
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
                                            {transaction.date}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
}

export default RevenueReport;