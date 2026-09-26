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
    Description,
    Download,
    Search,
    Schedule,
} from "@mui/icons-material";

const invoiceData = [
    {
        id: "INV-1001",
        paymentId: "PAY-1001",
        bookingId: "BK-1001",
        member: "Rahul Sharma",
        email: "rahul@example.com",
        invoiceDate: "25 Sep 2026",
        dueDate: "25 Sep 2026",
        amount: 850,
        tax: 0,
        totalAmount: 850,
        type: "Membership",
        paymentMethod: "UPI",
        status: "PAID",
    },
    {
        id: "INV-1002",
        paymentId: "PAY-1002",
        bookingId: "BK-1002",
        member: "Priya Singh",
        email: "priya@example.com",
        invoiceDate: "25 Sep 2026",
        dueDate: "25 Sep 2026",
        amount: 500,
        tax: 0,
        totalAmount: 500,
        type: "Seat Booking",
        paymentMethod: "Card",
        status: "PAID",
    },
    {
        id: "INV-1003",
        paymentId: "PAY-1003",
        bookingId: "BK-1003",
        member: "Amit Kumar",
        email: "amit@example.com",
        invoiceDate: "25 Sep 2026",
        dueDate: "25 Sep 2026",
        amount: 1800,
        tax: 0,
        totalAmount: 1800,
        type: "Membership",
        paymentMethod: "UPI",
        status: "PENDING",
    },
    {
        id: "INV-1004",
        paymentId: "PAY-1004",
        bookingId: "BK-1004",
        member: "Sneha Verma",
        email: "sneha@example.com",
        invoiceDate: "24 Sep 2026",
        dueDate: "24 Sep 2026",
        amount: 800,
        tax: 0,
        totalAmount: 800,
        type: "Seat Booking",
        paymentMethod: "Net Banking",
        status: "PAID",
    },
    {
        id: "INV-1005",
        paymentId: "PAY-1005",
        bookingId: "BK-1005",
        member: "Vikas Raj",
        email: "vikas@example.com",
        invoiceDate: "24 Sep 2026",
        dueDate: "24 Sep 2026",
        amount: 4800,
        tax: 0,
        totalAmount: 4800,
        type: "Membership",
        paymentMethod: "Card",
        status: "REFUNDED",
    },
    {
        id: "INV-1006",
        paymentId: "PAY-1006",
        bookingId: "BK-1006",
        member: "Neha Gupta",
        email: "neha@example.com",
        invoiceDate: "23 Sep 2026",
        dueDate: "23 Sep 2026",
        amount: 350,
        tax: 0,
        totalAmount: 350,
        type: "Seat Booking",
        paymentMethod: "UPI",
        status: "FAILED",
    },
    {
        id: "INV-1007",
        paymentId: "PAY-1007",
        bookingId: "BK-1007",
        member: "Arjun Singh",
        email: "arjun@example.com",
        invoiceDate: "23 Sep 2026",
        dueDate: "23 Sep 2026",
        amount: 1800,
        tax: 0,
        totalAmount: 1800,
        type: "Membership",
        paymentMethod: "UPI",
        status: "PAID",
    },
];

const getStatusConfig = (status) => {
    switch (status) {
        case "PAID":
            return {
                label: "Paid",
                color: "success",
                icon: <CheckCircle fontSize="small" />,
            };

        case "PENDING":
            return {
                label: "Pending",
                color: "warning",
                icon: <Schedule fontSize="small" />,
            };

        case "REFUNDED":
            return {
                label: "Refunded",
                color: "info",
                icon: <Description fontSize="small" />,
            };

        case "FAILED":
            return {
                label: "Failed",
                color: "error",
                icon: <Description fontSize="small" />,
            };

        default:
            return {
                label: status,
                color: "default",
            };
    }
};

function InvoiceList() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [type, setType] = useState("ALL");

    const summary = useMemo(() => {
        const paid = invoiceData.filter(
            (invoice) => invoice.status === "PAID"
        );

        const pending = invoiceData.filter(
            (invoice) => invoice.status === "PENDING"
        );

        const refunded = invoiceData.filter(
            (invoice) => invoice.status === "REFUNDED"
        );

        return {
            total: invoiceData.length,

            paidAmount: paid.reduce(
                (total, invoice) => total + invoice.totalAmount,
                0
            ),

            pendingAmount: pending.reduce(
                (total, invoice) => total + invoice.totalAmount,
                0
            ),

            refundedAmount: refunded.reduce(
                (total, invoice) => total + invoice.totalAmount,
                0
            ),
        };
    }, []);

    const filteredInvoices = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return invoiceData.filter((invoice) => {
            const matchesSearch =
                !searchText ||
                invoice.id.toLowerCase().includes(searchText) ||
                invoice.paymentId.toLowerCase().includes(searchText) ||
                invoice.bookingId.toLowerCase().includes(searchText) ||
                invoice.member.toLowerCase().includes(searchText);

            const matchesStatus =
                status === "ALL" ||
                invoice.status === status;

            const matchesType =
                type === "ALL" ||
                invoice.type === type;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [search, status, type]);

    const clearFilters = () => {
        setSearch("");
        setStatus("ALL");
        setType("ALL");
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
                        Invoices
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage invoices generated for
                        library transactions.
                    </Typography>
                </Box>
            </Stack>

            {/* Summary */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Total Invoices"
                        value={summary.total}
                        subtitle="All generated invoices"
                        icon={<Description />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Paid Amount"
                        value={`₹${summary.paidAmount.toLocaleString()}`}
                        subtitle="Successfully collected"
                        icon={<CurrencyRupee />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Pending Amount"
                        value={`₹${summary.pendingAmount.toLocaleString()}`}
                        subtitle="Awaiting payment"
                        icon={<Schedule />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Refunded Amount"
                        value={`₹${summary.refundedAmount.toLocaleString()}`}
                        subtitle="Refunded invoices"
                        icon={<Description />}
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
                                placeholder="Search invoice, payment, booking or member..."
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

                                <MenuItem value="PAID">
                                    Paid
                                </MenuItem>

                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>

                                <MenuItem value="REFUNDED">
                                    Refunded
                                </MenuItem>

                                <MenuItem value="FAILED">
                                    Failed
                                </MenuItem>
                            </Select>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                            <Select
                                fullWidth
                                value={type}
                                onChange={(event) =>
                                    setType(event.target.value)
                                }
                            >
                                <MenuItem value="ALL">
                                    All Types
                                </MenuItem>

                                <MenuItem value="Membership">
                                    Membership
                                </MenuItem>

                                <MenuItem value="Seat Booking">
                                    Seat Booking
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

            {/* Invoice Table */}
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
                            Invoice Records
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {filteredInvoices.length} invoices found
                        </Typography>
                    </Box>
                </Box>

                <Divider />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Invoice
                                </TableCell>

                                <TableCell>
                                    Member
                                </TableCell>

                                <TableCell>
                                    Date
                                </TableCell>

                                <TableCell>
                                    Type
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
                            {filteredInvoices.map((invoice) => {
                                const statusConfig =
                                    getStatusConfig(invoice.status);

                                return (
                                    <TableRow
                                        key={invoice.id}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {invoice.id}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {invoice.paymentId}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {invoice.member}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {invoice.email}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {invoice.invoiceDate}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Due: {invoice.dueDate}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2">
                                                {invoice.type}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {invoice.paymentMethod}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography fontWeight={600}>
                                                ₹
                                                {invoice.totalAmount.toLocaleString()}
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
                                            <Stack
                                                direction="row"
                                                justifyContent="flex-end"
                                                spacing={1}
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        navigate(
                                                            `/owner/invoices/${invoice.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={
                                                        <Download />
                                                    }
                                                >
                                                    PDF
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {filteredInvoices.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        align="center"
                                        sx={{ py: 6 }}
                                    >
                                        <Typography
                                            color="text.secondary"
                                        >
                                            No invoices found.
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

export default InvoiceList;