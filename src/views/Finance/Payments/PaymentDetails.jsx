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
    Typography,
} from "@mui/material";

import {
    ArrowBack,
    CheckCircle,
    CurrencyRupee,
    ErrorOutline,
    EventSeat,
    Person,
    ReceiptLong,
    Schedule,
} from "@mui/icons-material";

const paymentData = [
    {
        id: "PAY-1001",
        bookingId: "BK-1001",
        member: "Rahul Sharma",
        email: "rahul@example.com",
        phone: "+91 98765 43210",
        date: "25 Sep 2026",
        time: "10:32 AM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 850,
        status: "SUCCESS",
        transactionId: "pay_RZP10001",
        orderId: "order_RZP10001",
        description: "Monthly Membership",
        library: "GNC Central Library",
        seat: "A12",
        slot: "Morning Slot",
    },
    {
        id: "PAY-1002",
        bookingId: "BK-1002",
        member: "Priya Singh",
        email: "priya@example.com",
        phone: "+91 98765 43211",
        date: "25 Sep 2026",
        time: "11:15 AM",
        method: "Card",
        gateway: "Razorpay",
        amount: 500,
        status: "SUCCESS",
        transactionId: "pay_RZP10002",
        orderId: "order_RZP10002",
        description: "Seat Booking",
        library: "GNC Central Library",
        seat: "B08",
        slot: "Afternoon Slot",
    },
    {
        id: "PAY-1003",
        bookingId: "BK-1003",
        member: "Amit Kumar",
        email: "amit@example.com",
        phone: "+91 98765 43212",
        date: "25 Sep 2026",
        time: "12:45 PM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 1800,
        status: "PENDING",
        transactionId: "pay_RZP10003",
        orderId: "order_RZP10003",
        description: "Monthly Membership",
        library: "GNC Central Library",
        seat: "C05",
        slot: "Evening Slot",
    },
    {
        id: "PAY-1004",
        bookingId: "BK-1004",
        member: "Sneha Verma",
        email: "sneha@example.com",
        phone: "+91 98765 43213",
        date: "24 Sep 2026",
        time: "09:20 AM",
        method: "Net Banking",
        gateway: "Razorpay",
        amount: 800,
        status: "SUCCESS",
        transactionId: "pay_RZP10004",
        orderId: "order_RZP10004",
        description: "Seat Booking",
        library: "GNC Central Library",
        seat: "D04",
        slot: "Morning Slot",
    },
    {
        id: "PAY-1005",
        bookingId: "BK-1005",
        member: "Vikas Raj",
        email: "vikas@example.com",
        phone: "+91 98765 43214",
        date: "24 Sep 2026",
        time: "02:10 PM",
        method: "Card",
        gateway: "Razorpay",
        amount: 4800,
        status: "REFUNDED",
        transactionId: "pay_RZP10005",
        orderId: "order_RZP10005",
        description: "Quarterly Membership",
        library: "GNC Central Library",
        seat: "A04",
        slot: "Full Day",
    },
    {
        id: "PAY-1006",
        bookingId: "BK-1006",
        member: "Neha Gupta",
        email: "neha@example.com",
        phone: "+91 98765 43215",
        date: "23 Sep 2026",
        time: "04:30 PM",
        method: "UPI",
        gateway: "Razorpay",
        amount: 350,
        status: "FAILED",
        transactionId: "pay_RZP10006",
        orderId: "order_RZP10006",
        description: "Seat Booking",
        library: "GNC Central Library",
        seat: "B02",
        slot: "Evening Slot",
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

function PaymentDetails() {
    const navigate = useNavigate();
    const { paymentId } = useParams();

    const payment = useMemo(
        () =>
            paymentData.find(
                (item) => item.id === paymentId
            ),
        [paymentId]
    );

    if (!payment) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/owner/payments")}
                    sx={{ mb: 3 }}
                >
                    Back to Payments
                </Button>

                <Card>
                    <Box p={5} textAlign="center">
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                        >
                            Payment Not Found
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            The requested payment transaction could
                            not be found.
                        </Typography>
                    </Box>
                </Card>
            </Box>
        );
    }

    const statusConfig = getStatusConfig(payment.status);

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
                            navigate("/owner/payments")
                        }
                        sx={{ mb: 1 }}
                    >
                        Back to Payments
                    </Button>

                    <Typography variant="h4" fontWeight={700}>
                        Payment Details
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Transaction {payment.id}
                    </Typography>
                </Box>

                <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    variant="outlined"
                />
            </Stack>

            {/* Payment Summary */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryCard
                        title="Payment Amount"
                        value={`₹${payment.amount.toLocaleString()}`}
                        subtitle={payment.description}
                        icon={<CurrencyRupee />}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryCard
                        title="Payment Method"
                        value={payment.method}
                        subtitle={payment.gateway}
                        icon={<ReceiptLong />}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <SummaryCard
                        title="Payment Date"
                        value={payment.date}
                        subtitle={payment.time}
                        icon={<Schedule />}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {/* Transaction Information */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card>
                        <SectionHeader
                            title="Transaction Information"
                            icon={<ReceiptLong />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment ID"
                                        value={payment.id}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Transaction ID"
                                        value={payment.transactionId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Order ID"
                                        value={payment.orderId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Booking ID"
                                        value={payment.bookingId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Method"
                                        value={payment.method}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Gateway"
                                        value={payment.gateway}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Date"
                                        value={payment.date}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Time"
                                        value={payment.time}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <DetailItem
                                        label="Description"
                                        value={payment.description}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                {/* Member Information */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ height: "100%" }}>
                        <SectionHeader
                            title="Member Information"
                            icon={<Person />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2.5}>
                                <DetailItem
                                    label="Member Name"
                                    value={payment.member}
                                />

                                <DetailItem
                                    label="Email"
                                    value={payment.email}
                                />

                                <DetailItem
                                    label="Phone"
                                    value={payment.phone}
                                />
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
                                        value={payment.bookingId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Library"
                                        value={payment.library}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Seat"
                                        value={payment.seat}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Slot"
                                        value={payment.slot}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                {/* Amount Breakdown */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Amount Details"
                            icon={<CurrencyRupee />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2}>
                                <AmountRow
                                    label="Base Amount"
                                    value={payment.amount}
                                />

                                <AmountRow
                                    label="Tax"
                                    value={0}
                                />

                                <AmountRow
                                    label="Platform Fee"
                                    value={0}
                                />

                                <Divider />

                                <AmountRow
                                    label="Total Amount"
                                    value={payment.amount}
                                    strong
                                />
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Status */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Payment Status"
                            icon={<CheckCircle />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Current Status
                                    </Typography>

                                    <Chip
                                        icon={statusConfig.icon}
                                        label={statusConfig.label}
                                        color={statusConfig.color}
                                        size="small"
                                    />
                                </Box>

                                <DetailItem
                                    label="Processed Through"
                                    value={payment.gateway}
                                />

                                <DetailItem
                                    label="Transaction Reference"
                                    value={payment.transactionId}
                                />
                            </Stack>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
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
                ₹{value.toLocaleString()}
            </Typography>
        </Box>
    );
}

export default PaymentDetails;