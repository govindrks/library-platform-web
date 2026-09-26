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
    Refresh,
    Schedule,
    Search,
} from "@mui/icons-material";

const refundData = [
    {
        id: "REF-1001",
        paymentId: "PAY-1005",
        bookingId: "BK-1005",
        member: "Vikas Raj",
        email: "vikas@example.com",
        requestDate: "24 Sep 2026",
        processedDate: "24 Sep 2026",
        amount: 4800,
        reason: "Membership cancellation",
        method: "Card",
        status: "COMPLETED",
        refundTransactionId: "rfnd_RZP10001",
    },
    {
        id: "REF-1002",
        paymentId: "PAY-1010",
        bookingId: "BK-1010",
        member: "Rohit Kumar",
        email: "rohit@example.com",
        requestDate: "25 Sep 2026",
        processedDate: "-",
        amount: 850,
        reason: "Booking cancelled",
        method: "UPI",
        status: "PENDING",
        refundTransactionId: "-",
    },
    {
        id: "REF-1003",
        paymentId: "PAY-1012",
        bookingId: "BK-1012",
        member: "Anjali Singh",
        email: "anjali@example.com",
        requestDate: "23 Sep 2026",
        processedDate: "23 Sep 2026",
        amount: 500,
        reason: "Duplicate booking",
        method: "UPI",
        status: "COMPLETED",
        refundTransactionId: "rfnd_RZP10003",
    },
    {
        id: "REF-1004",
        paymentId: "PAY-1015",
        bookingId: "BK-1015",
        member: "Manish Gupta",
        email: "manish@example.com",
        requestDate: "22 Sep 2026",
        processedDate: "-",
        amount: 1800,
        reason: "Member requested cancellation",
        method: "Card",
        status: "PROCESSING",
        refundTransactionId: "-",
    },
    {
        id: "REF-1005",
        paymentId: "PAY-1018",
        bookingId: "BK-1018",
        member: "Pooja Verma",
        email: "pooja@example.com",
        requestDate: "21 Sep 2026",
        processedDate: "21 Sep 2026",
        amount: 350,
        reason: "Payment issue",
        method: "UPI",
        status: "FAILED",
        refundTransactionId: "-",
    },
    {
        id: "REF-1006",
        paymentId: "PAY-1020",
        bookingId: "BK-1020",
        member: "Sandeep Raj",
        email: "sandeep@example.com",
        requestDate: "20 Sep 2026",
        processedDate: "20 Sep 2026",
        amount: 800,
        reason: "Booking cancellation",
        method: "Net Banking",
        status: "COMPLETED",
        refundTransactionId: "rfnd_RZP10006",
    },
];

const getStatusConfig = (status) => {
    switch (status) {
        case "COMPLETED":
            return {
                label: "Completed",
                color: "success",
                icon: <CheckCircle fontSize="small" />,
            };

        case "PENDING":
            return {
                label: "Pending",
                color: "warning",
                icon: <Schedule fontSize="small" />,
            };

        case "PROCESSING":
            return {
                label: "Processing",
                color: "info",
                icon: <Refresh fontSize="small" />,
            };

        case "FAILED":
            return {
                label: "Failed",
                color: "error",
                icon: <ErrorOutline fontSize="small" />,
            };

        default:
            return {
                label: status,
                color: "default",
            };
    }
};

function RefundList() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    const summary = useMemo(() => {
        const completed = refundData.filter(
            (refund) => refund.status === "COMPLETED"
        );

        const pending = refundData.filter(
            (refund) =>
                refund.status === "PENDING" ||
                refund.status === "PROCESSING"
        );

        const failed = refundData.filter(
            (refund) => refund.status === "FAILED"
        );

        return {
            total: refundData.length,

            refundedAmount: completed.reduce(
                (total, refund) => total + refund.amount,
                0
            ),

            pendingAmount: pending.reduce(
                (total, refund) => total + refund.amount,
                0
            ),

            failedAmount: failed.reduce(
                (total, refund) => total + refund.amount,
                0
            ),
        };
    }, []);

    const filteredRefunds = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return refundData.filter((refund) => {
            const matchesSearch =
                !searchText ||
                refund.id.toLowerCase().includes(searchText) ||
                refund.paymentId.toLowerCase().includes(searchText) ||
                refund.bookingId.toLowerCase().includes(searchText) ||
                refund.member.toLowerCase().includes(searchText);

            const matchesStatus =
                status === "ALL" ||
                refund.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [search, status]);

    const clearFilters = () => {
        setSearch("");
        setStatus("ALL");
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
                        Refunds
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage refund transactions and requests.
                    </Typography>
                </Box>
            </Stack>

            {/* Summary */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Total Refunds"
                        value={summary.total}
                        subtitle="All refund requests"
                        icon={<Refresh />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Refunded Amount"
                        value={`₹${summary.refundedAmount.toLocaleString()}`}
                        subtitle="Successfully refunded"
                        icon={<CurrencyRupee />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Pending Amount"
                        value={`₹${summary.pendingAmount.toLocaleString()}`}
                        subtitle="Pending / processing"
                        icon={<Schedule />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Failed Amount"
                        value={`₹${summary.failedAmount.toLocaleString()}`}
                        subtitle="Failed refunds"
                        icon={<ErrorOutline />}
                    />
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 2 }}>
                <Box p={2}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                placeholder="Search refund, payment, booking or member..."
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

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

                                <MenuItem value="COMPLETED">
                                    Completed
                                </MenuItem>

                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>

                                <MenuItem value="PROCESSING">
                                    Processing
                                </MenuItem>

                                <MenuItem value="FAILED">
                                    Failed
                                </MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={clearFilters}
                                sx={{ height: 40 }}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* Refund Table */}
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
                            Refund Transactions
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {filteredRefunds.length} refunds found
                        </Typography>
                    </Box>
                </Box>

                <Divider />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Refund
                                </TableCell>

                                <TableCell>
                                    Member
                                </TableCell>

                                <TableCell>
                                    Request Date
                                </TableCell>

                                <TableCell>
                                    Reason
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
                            {filteredRefunds.map((refund) => {
                                const statusConfig =
                                    getStatusConfig(refund.status);

                                return (
                                    <TableRow
                                        key={refund.id}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {refund.id}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {refund.paymentId}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                            >
                                                {refund.bookingId}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {refund.member}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {refund.email}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {refund.requestDate}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Processed:{" "}
                                                {refund.processedDate}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ maxWidth: 220 }}
                                            >
                                                {refund.reason}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                ₹
                                                {refund.amount.toLocaleString()}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {refund.method}
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
                                                        `/owner/refunds/${refund.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredRefunds.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography color="text.secondary">
                                            No refund transactions found.
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

export default RefundList;