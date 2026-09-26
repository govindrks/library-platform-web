import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    CheckCircle,
    Download,
    EventSeat,
    Person,
    Print,
    ReceiptLong,
    Schedule,
} from "@mui/icons-material";

const invoiceData = [
    {
        id: "INV-1001",
        paymentId: "PAY-1001",
        bookingId: "BK-1001",

        invoiceDate: "25 Sep 2026",
        invoiceTime: "10:32 AM",
        dueDate: "25 Sep 2026",

        status: "PAID",

        member: {
            name: "Rahul Sharma",
            email: "rahul@example.com",
            phone: "+91 98765 43210",
            address: "Koramangala, Bengaluru",
        },

        library: {
            name: "GNC Central Library",
            address: "80 Feet Road, Koramangala",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560034",
            phone: "+91 98765 43200",
            email: "contact@gnccentrallibrary.com",
        },

        booking: {
            seat: "A12",
            slot: "Morning Slot",
            date: "25 Sep 2026",
            startTime: "06:00 AM",
            endTime: "10:00 AM",
        },

        payment: {
            method: "UPI",
            gateway: "Razorpay",
            transactionId: "pay_RZP10001",
            orderId: "order_RZP10001",
        },

        items: [
            {
                description: "Monthly Membership",
                quantity: 1,
                rate: 850,
                amount: 850,
            },
        ],

        subtotal: 850,
        tax: 0,
        discount: 0,
        total: 850,
    },

    {
        id: "INV-1002",
        paymentId: "PAY-1002",
        bookingId: "BK-1002",

        invoiceDate: "25 Sep 2026",
        invoiceTime: "11:15 AM",
        dueDate: "25 Sep 2026",

        status: "PAID",

        member: {
            name: "Priya Singh",
            email: "priya@example.com",
            phone: "+91 98765 43211",
            address: "Indiranagar, Bengaluru",
        },

        library: {
            name: "GNC Central Library",
            address: "80 Feet Road, Koramangala",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560034",
            phone: "+91 98765 43200",
            email: "contact@gnccentrallibrary.com",
        },

        booking: {
            seat: "B08",
            slot: "Afternoon Slot",
            date: "25 Sep 2026",
            startTime: "10:00 AM",
            endTime: "02:00 PM",
        },

        payment: {
            method: "Card",
            gateway: "Razorpay",
            transactionId: "pay_RZP10002",
            orderId: "order_RZP10002",
        },

        items: [
            {
                description: "Seat Booking",
                quantity: 1,
                rate: 500,
                amount: 500,
            },
        ],

        subtotal: 500,
        tax: 0,
        discount: 0,
        total: 500,
    },

    {
        id: "INV-1003",
        paymentId: "PAY-1003",
        bookingId: "BK-1003",

        invoiceDate: "25 Sep 2026",
        invoiceTime: "12:45 PM",
        dueDate: "25 Sep 2026",

        status: "PENDING",

        member: {
            name: "Amit Kumar",
            email: "amit@example.com",
            phone: "+91 98765 43212",
            address: "HSR Layout, Bengaluru",
        },

        library: {
            name: "GNC Central Library",
            address: "80 Feet Road, Koramangala",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560034",
            phone: "+91 98765 43200",
            email: "contact@gnccentrallibrary.com",
        },

        booking: {
            seat: "C05",
            slot: "Evening Slot",
            date: "25 Sep 2026",
            startTime: "02:00 PM",
            endTime: "06:00 PM",
        },

        payment: {
            method: "UPI",
            gateway: "Razorpay",
            transactionId: "pay_RZP10003",
            orderId: "order_RZP10003",
        },

        items: [
            {
                description: "Monthly Membership",
                quantity: 1,
                rate: 1800,
                amount: 1800,
            },
        ],

        subtotal: 1800,
        tax: 0,
        discount: 0,
        total: 1800,
    },

    {
        id: "INV-1005",
        paymentId: "PAY-1005",
        bookingId: "BK-1005",

        invoiceDate: "24 Sep 2026",
        invoiceTime: "02:10 PM",
        dueDate: "24 Sep 2026",

        status: "REFUNDED",

        member: {
            name: "Vikas Raj",
            email: "vikas@example.com",
            phone: "+91 98765 43214",
            address: "Whitefield, Bengaluru",
        },

        library: {
            name: "GNC Central Library",
            address: "80 Feet Road, Koramangala",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560034",
            phone: "+91 98765 43200",
            email: "contact@gnccentrallibrary.com",
        },

        booking: {
            seat: "A04",
            slot: "Full Day",
            date: "24 Sep 2026",
            startTime: "06:00 AM",
            endTime: "11:00 PM",
        },

        payment: {
            method: "Card",
            gateway: "Razorpay",
            transactionId: "pay_RZP10005",
            orderId: "order_RZP10005",
        },

        items: [
            {
                description: "Quarterly Membership",
                quantity: 1,
                rate: 4800,
                amount: 4800,
            },
        ],

        subtotal: 4800,
        tax: 0,
        discount: 0,
        total: 4800,
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
                icon: <ReceiptLong fontSize="small" />,
            };

        case "FAILED":
            return {
                label: "Failed",
                color: "error",
                icon: <ReceiptLong fontSize="small" />,
            };

        default:
            return {
                label: status,
                color: "default",
            };
    }
};

function InvoiceDetails() {
    const navigate = useNavigate();
    const { invoiceId } = useParams();

    const invoice = useMemo(
        () =>
            invoiceData.find(
                (item) => item.id === invoiceId
            ),
        [invoiceId]
    );

    if (!invoice) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/owner/invoices")}
                    sx={{ mb: 3 }}
                >
                    Back to Invoices
                </Button>

                <Card>
                    <Box p={5} textAlign="center">
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                        >
                            Invoice Not Found
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            The requested invoice could not be found.
                        </Typography>
                    </Box>
                </Card>
            </Box>
        );
    }

    const statusConfig = getStatusConfig(invoice.status);

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
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() =>
                            navigate("/owner/invoices")
                        }
                        sx={{ mb: 1 }}
                    >
                        Back to Invoices
                    </Button>

                    <Typography variant="h4" fontWeight={700}>
                        Invoice Details
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Invoice {invoice.id}
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        variant="outlined"
                    />

                    <Button
                        variant="outlined"
                        startIcon={<Print />}
                    >
                        Print
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Download />}
                    >
                        Download PDF
                    </Button>
                </Stack>
            </Stack>

            {/* Invoice Header */}
            <Card sx={{ mb: 2 }}>
                <Box p={{ xs: 2, md: 3 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                color="primary"
                            >
                                LibraryHub
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Library Management Platform
                            </Typography>
                        </Grid>

                        <Grid
                            size={{ xs: 12, md: 6 }}
                            textAlign={{ xs: "left", md: "right" }}
                        >
                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                INVOICE
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                {invoice.id}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Invoice Date: {invoice.invoiceDate}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Due Date: {invoice.dueDate}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            <Grid container spacing={2}>
                {/* Library Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: "100%" }}>
                        <SectionHeader
                            title="Bill From"
                            icon={<ReceiptLong />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={1}>
                                <Typography fontWeight={600}>
                                    {invoice.library.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.library.address}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.library.city},{" "}
                                    {invoice.library.state} -{" "}
                                    {invoice.library.pincode}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.library.phone}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.library.email}
                                </Typography>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Member Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: "100%" }}>
                        <SectionHeader
                            title="Bill To"
                            icon={<Person />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={1}>
                                <Typography fontWeight={600}>
                                    {invoice.member.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.member.email}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.member.phone}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {invoice.member.address}
                                </Typography>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Booking Information */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <SectionHeader
                            title="Booking Information"
                            icon={<EventSeat />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Booking ID"
                                        value={invoice.bookingId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Seat"
                                        value={invoice.booking.seat}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Slot"
                                        value={invoice.booking.slot}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Booking Date"
                                        value={invoice.booking.date}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Start Time"
                                        value={invoice.booking.startTime}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="End Time"
                                        value={invoice.booking.endTime}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                {/* Invoice Items */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <SectionHeader
                            title="Invoice Items"
                            icon={<ReceiptLong />}
                        />

                        <Divider />

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Description
                                    </TableCell>

                                    <TableCell align="center">
                                        Quantity
                                    </TableCell>

                                    <TableCell align="right">
                                        Rate
                                    </TableCell>

                                    <TableCell align="right">
                                        Amount
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {invoice.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {item.description}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            {item.quantity}
                                        </TableCell>

                                        <TableCell align="right">
                                            ₹
                                            {item.rate.toLocaleString()}
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography fontWeight={600}>
                                                ₹
                                                {item.amount.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </Grid>

                {/* Amount Summary */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Amount Summary"
                            icon={<ReceiptLong />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2}>
                                <AmountRow
                                    label="Subtotal"
                                    value={invoice.subtotal}
                                />

                                <AmountRow
                                    label="Tax"
                                    value={invoice.tax}
                                />

                                <AmountRow
                                    label="Discount"
                                    value={invoice.discount}
                                    prefix="-"
                                />

                                <Divider />

                                <AmountRow
                                    label="Total Amount"
                                    value={invoice.total}
                                    strong
                                />
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Payment Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Payment Information"
                            icon={<CheckCircle />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2}>
                                <DetailItem
                                    label="Payment ID"
                                    value={invoice.paymentId}
                                />

                                <DetailItem
                                    label="Payment Method"
                                    value={invoice.payment.method}
                                />

                                <DetailItem
                                    label="Gateway"
                                    value={invoice.payment.gateway}
                                />

                                <DetailItem
                                    label="Transaction ID"
                                    value={
                                        invoice.payment.transactionId
                                    }
                                />

                                <DetailItem
                                    label="Order ID"
                                    value={invoice.payment.orderId}
                                />

                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Payment Status
                                    </Typography>

                                    <Chip
                                        icon={statusConfig.icon}
                                        label={statusConfig.label}
                                        color={statusConfig.color}
                                        size="small"
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Footer */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <Box p={2.5}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center"
                            >
                                This is a system-generated invoice.
                                Please retain this document for your
                                records.
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

function SectionHeader({ title, icon }) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            px={2.5}
            py={2}
        >
            <Box
                sx={{
                    display: "flex",
                    color: "primary.main",
                }}
            >
                {icon}
            </Box>

            <Typography fontWeight={600}>
                {title}
            </Typography>
        </Stack>
    );
}

function DetailItem({ label, value }) {
    return (
        <Box>
            <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={0.5}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                    wordBreak: "break-word",
                }}
            >
                {value || "-"}
            </Typography>
        </Box>
    );
}

function AmountRow({
    label,
    value,
    strong = false,
    prefix = "",
}) {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography
                variant="body2"
                fontWeight={strong ? 700 : 400}
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                fontWeight={strong ? 700 : 500}
            >
                {prefix}₹{value.toLocaleString()}
            </Typography>
        </Box>
    );
}

export default InvoiceDetails;