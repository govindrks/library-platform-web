import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import {
    CheckCircle,
    CurrencyRupee,
    ErrorOutline,
    Payments,
    Search,
    Schedule,
    ReceiptLong,
} from "@mui/icons-material";

const paymentData = [
    {
        id: "PAY-1001",
        bookingId: "BK-1001",
        member: "Rahul Sharma",
        email: "rahul@example.com",
        date: "25 Sep 2026",
        time: "10:32 AM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 850,
        status: "SUCCESS",
        transactionId: "pay_RZP10001",
        description: "Monthly Membership",
    },
    {
        id: "PAY-1002",
        bookingId: "BK-1002",
        member: "Priya Singh",
        email: "priya@example.com",
        date: "25 Sep 2026",
        time: "11:15 AM",
        method: "Card",
        gateway: "Razorpay",
        amount: 500,
        status: "SUCCESS",
        transactionId: "pay_RZP10002",
        description: "Seat Booking",
    },
    {
        id: "PAY-1003",
        bookingId: "BK-1003",
        member: "Amit Kumar",
        email: "amit@example.com",
        date: "25 Sep 2026",
        time: "12:45 PM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 1800,
        status: "PENDING",
        transactionId: "pay_RZP10003",
        description: "Monthly Membership",
    },
    {
        id: "PAY-1004",
        bookingId: "BK-1004",
        member: "Sneha Verma",
        email: "sneha@example.com",
        date: "24 Sep 2026",
        time: "09:20 AM",
        method: "Net Banking",
        gateway: "Razorpay",
        amount: 800,
        status: "SUCCESS",
        transactionId: "pay_RZP10004",
        description: "Seat Booking",
    },
    {
        id: "PAY-1005",
        bookingId: "BK-1005",
        member: "Vikas Raj",
        email: "vikas@example.com",
        date: "24 Sep 2026",
        time: "02:10 PM",
        method: "Card",
        gateway: "Razorpay",
        amount: 4800,
        status: "REFUNDED",
        transactionId: "pay_RZP10005",
        description: "Quarterly Membership",
    },
    {
        id: "PAY-1006",
        bookingId: "BK-1006",
        member: "Neha Gupta",
        email: "neha@example.com",
        date: "23 Sep 2026",
        time: "04:30 PM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 350,
        status: "FAILED",
        transactionId: "pay_RZP10006",
        description: "Seat Booking",
    },
    {
        id: "PAY-1007",
        bookingId: "BK-1007",
        member: "Arjun Singh",
        email: "arjun@example.com",
        date: "23 Sep 2026",
        time: "06:15 PM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 1800,
        status: "SUCCESS",
        transactionId: "pay_RZP10007",
        description: "Monthly Membership",
    },
];

const getStatusConfig = (status) => {
    switch (status) {
        case "SUCCESS":
            return {
                label: "Success",
                color: "success",
                icon: <CheckCircle fontSize="small" />,
            };

        case "PENDING":
            return {
                label: "Pending",
                color: "warning",
                icon: <Schedule fontSize="small" />,
            };

        case "FAILED":
            return {
                label: "Failed",
                color: "error",
                icon: <ErrorOutline fontSize="small" />,
            };

        case "REFUNDED":
            return {
                label: "Refunded",
                color: "info",
                icon: <ReceiptLong fontSize="small" />,
            };

        default:
            return {
                label: status,
                color: "default",
            };
    }
};

function PaymentList() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [method, setMethod] = useState("ALL");

    const summary = useMemo(() => {
        const successful = paymentData.filter(
            (payment) => payment.status === "SUCCESS"
        );

        const pending = paymentData.filter(
            (payment) => payment.status === "PENDING"
        );

        const refunded = paymentData.filter(
            (payment) => payment.status === "REFUNDED"
        );

        return {
            transactions: paymentData.length,

            revenue: successful.reduce(
                (total, payment) => total + payment.amount,
                0
            ),

            pending: pending.reduce(
                (total, payment) => total + payment.amount,
                0
            ),

            refunded: refunded.reduce(
                (total, payment) => total + payment.amount,
                0
            ),
        };
    }, []);

    const filteredPayments = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return paymentData.filter((payment) => {
            const matchesSearch =
                !searchText ||
                payment.id.toLowerCase().includes(searchText) ||
                payment.bookingId.toLowerCase().includes(searchText) ||
                payment.member.toLowerCase().includes(searchText) ||
                payment.transactionId.toLowerCase().includes(searchText);

            const matchesStatus =
                status === "ALL" || payment.status === status;

            const matchesMethod =
                method === "ALL" || payment.method === method;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesMethod
            );
        });
    }, [search, status, method]);

    const clearFilters = () => {
        setSearch("");
        setStatus("ALL");
        setMethod("ALL");
    };

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
                        Payments
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage all payment transactions.
                    </Typography>
                </Box>
            </Stack>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Total Transactions"
                        value={summary.transactions}
                        subtitle="All transactions"
                        icon={<Payments />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Successful Revenue"
                        value={`₹${summary.revenue.toLocaleString()}`}
                        subtitle="Successfully collected"
                        icon={<CurrencyRupee />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Pending Amount"
                        value={`₹${summary.pending.toLocaleString()}`}
                        subtitle="Awaiting confirmation"
                        icon={<Schedule />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Refunded Amount"
                        value={`₹${summary.refunded.toLocaleString()}`}
                        subtitle="Refunded transactions"
                        icon={<ReceiptLong />}
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 2 }}>
                <Box p={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <TextField
                                fullWidth
                                placeholder="Search payment, booking, member..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                            <Select
                                fullWidth
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                            >
                                <MenuItem value="ALL">
                                    All Status
                                </MenuItem>
                                <MenuItem value="SUCCESS">
                                    Success
                                </MenuItem>
                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>
                                <MenuItem value="FAILED">
                                    Failed
                                </MenuItem>
                                <MenuItem value="REFUNDED">
                                    Refunded
                                </MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                            <Select
                                fullWidth
                                value={method}
                                onChange={(event) =>
                                    setMethod(event.target.value)
                                }
                            >
                                <MenuItem value="ALL">
                                    All Methods
                                </MenuItem>
                                <MenuItem value="UPI">
                                    UPI
                                </MenuItem>
                                <MenuItem value="Card">
                                    Card
                                </MenuItem>
                                <MenuItem value="Net Banking">
                                    Net Banking
                                </MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, md: 2 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={clearFilters}
                                sx={{ height: 40 }}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* Payment Table */}
            <Card>
                <Box
                    px={2}
                    py={1.5}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box>
                        <Typography fontWeight={600}>
                            Payment Transactions
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {filteredPayments.length} transactions
                        </Typography>
                    </Box>
                </Box>

                <Divider />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Payment
                                </TableCell>

                                <TableCell>
                                    Member
                                </TableCell>

                                <TableCell>
                                    Date
                                </TableCell>

                                <TableCell>
                                    Method
                                </TableCell>

                                <TableCell>
                                    Amount
                                </TableCell>

                                <TableCell>
                                    Status
                                </TableCell>

                                <TableCell align="right">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredPayments.map((payment) => {
                                const statusConfig =
                                    getStatusConfig(payment.status);

                                return (
                                    <TableRow
                                        key={payment.id}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {payment.id}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {payment.bookingId}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {payment.member}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {payment.email}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {payment.date}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {payment.time}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {payment.method}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {payment.gateway}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                ₹
                                                {payment.amount.toLocaleString()}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={statusConfig.label}
                                                color={statusConfig.color}
                                                icon={statusConfig.icon}
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() =>
                                                    navigate(
                                                        `/owner/payments/${payment.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredPayments.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                        >
                                            No payment transactions found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}) {
    return (
        <Card>
            <Box p={2.5}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            mt={1}
                        >
                            {value}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {subtitle}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "primary.light",
                            color: "primary.main",
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </Box>
        </Card>
    );
}

export default PaymentList;