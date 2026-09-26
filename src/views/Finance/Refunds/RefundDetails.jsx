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
    Refresh,
    Schedule,
} from "@mui/icons-material";

const refundData = [
    {
        id: "REF-1001",
        paymentId: "PAY-1005",
        bookingId: "BK-1005",
        member: "Vikas Raj",
        email: "vikas@example.com",
        phone: "+91 98765 43214",

        requestDate: "24 Sep 2026",
        requestTime: "02:25 PM",

        processedDate: "24 Sep 2026",
        processedTime: "03:10 PM",

        amount: 4800,
        reason: "Membership cancellation",

        method: "Card",
        gateway: "Razorpay",

        status: "COMPLETED",

        refundTransactionId: "rfnd_RZP10001",
        paymentTransactionId: "pay_RZP10005",
        orderId: "order_RZP10005",

        library: "GNC Central Library",
        seat: "A04",
        slot: "Full Day",
    },
    {
        id: "REF-1002",
        paymentId: "PAY-1010",
        bookingId: "BK-1010",
        member: "Rohit Kumar",
        email: "rohit@example.com",
        phone: "+91 98765 43215",

        requestDate: "25 Sep 2026",
        requestTime: "10:20 AM",

        processedDate: "-",
        processedTime: "-",

        amount: 850,
        reason: "Booking cancelled",

        method: "UPI",
        gateway: "Razorpay",

        status: "PENDING",

        refundTransactionId: "-",
        paymentTransactionId: "pay_RZP10010",
        orderId: "order_RZP10010",

        library: "GNC Central Library",
        seat: "B08",
        slot: "Morning Slot",
    },
    {
        id: "REF-1003",
        paymentId: "PAY-1012",
        bookingId: "BK-1012",
        member: "Anjali Singh",
        email: "anjali@example.com",
        phone: "+91 98765 43216",

        requestDate: "23 Sep 2026",
        requestTime: "01:40 PM",

        processedDate: "23 Sep 2026",
        processedTime: "02:05 PM",

        amount: 500,
        reason: "Duplicate booking",

        method: "UPI",
        gateway: "Razorpay",

        status: "COMPLETED",

        refundTransactionId: "rfnd_RZP10003",
        paymentTransactionId: "pay_RZP10012",
        orderId: "order_RZP10012",

        library: "GNC Central Library",
        seat: "C05",
        slot: "Afternoon Slot",
    },
    {
        id: "REF-1004",
        paymentId: "PAY-1015",
        bookingId: "BK-1015",
        member: "Manish Gupta",
        email: "manish@example.com",
        phone: "+91 98765 43217",

        requestDate: "22 Sep 2026",
        requestTime: "11:15 AM",

        processedDate: "-",
        processedTime: "-",

        amount: 1800,
        reason: "Member requested cancellation",

        method: "Card",
        gateway: "Razorpay",

        status: "PROCESSING",

        refundTransactionId: "-",
        paymentTransactionId: "pay_RZP10015",
        orderId: "order_RZP10015",

        library: "GNC Central Library",
        seat: "D02",
        slot: "Evening Slot",
    },
    {
        id: "REF-1005",
        paymentId: "PAY-1018",
        bookingId: "BK-1018",
        member: "Pooja Verma",
        email: "pooja@example.com",
        phone: "+91 98765 43218",

        requestDate: "21 Sep 2026",
        requestTime: "04:10 PM",

        processedDate: "21 Sep 2026",
        processedTime: "04:45 PM",

        amount: 350,
        reason: "Payment issue",

        method: "UPI",
        gateway: "Razorpay",

        status: "FAILED",

        refundTransactionId: "-",
        paymentTransactionId: "pay_RZP10018",
        orderId: "order_RZP10018",

        library: "GNC Central Library",
        seat: "B02",
        slot: "Evening Slot",
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

function RefundDetails() {
    const navigate = useNavigate();
    const { refundId } = useParams();

    const refund = useMemo(
        () =>
            refundData.find(
                (item) => item.id === refundId
            ),
        [refundId]
    );

    if (!refund) {
        return (
            <Box>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/owner/refunds")}
                    sx={{ mb: 3 }}
                >
                    Back to Refunds
                </Button>

                <Card>
                    <Box p={5} textAlign="center">
                        <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                        >
                            Refund Not Found
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            The requested refund transaction could not
                            be found.
                        </Typography>
                    </Box>
                </Card>
            </Box>
        );
    }

    const statusConfig = getStatusConfig(refund.status);

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
                        onClick={() => navigate("/owner/refunds")}
                        sx={{ mb: 1 }}
                    >
                        Back to Refunds
                    </Button>

                    <Typography variant="h4" fontWeight={700}>
                        Refund Details
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Refund {refund.id}
                    </Typography>
                </Box>

                <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    color={statusConfig.color}
                    variant="outlined"
                />
            </Stack>

            {/* Summary */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Refund Amount"
                        value={`₹${refund.amount.toLocaleString()}`}
                        subtitle="Amount being refunded"
                        icon={<CurrencyRupee />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Refund Status"
                        value={statusConfig.label}
                        subtitle="Current refund status"
                        icon={<Refresh />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Payment Method"
                        value={refund.method}
                        subtitle={refund.gateway}
                        icon={<ReceiptLong />}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SummaryCard
                        title="Request Date"
                        value={refund.requestDate}
                        subtitle={refund.requestTime}
                        icon={<Schedule />}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {/* Refund Information */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card>
                        <SectionHeader
                            title="Refund Information"
                            icon={<Refresh />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Refund ID"
                                        value={refund.id}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Refund Status"
                                        value={statusConfig.label}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment ID"
                                        value={refund.paymentId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Booking ID"
                                        value={refund.bookingId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Refund Amount"
                                        value={`₹${refund.amount.toLocaleString()}`}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Method"
                                        value={refund.method}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Payment Gateway"
                                        value={refund.gateway}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Request Date"
                                        value={`${refund.requestDate} ${refund.requestTime}`}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <DetailItem
                                        label="Processed Date"
                                        value={
                                            refund.processedDate === "-"
                                                ? "-"
                                                : `${refund.processedDate} ${refund.processedTime}`
                                        }
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <DetailItem
                                        label="Refund Reason"
                                        value={refund.reason}
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
                                    value={refund.member}
                                />

                                <DetailItem
                                    label="Email"
                                    value={refund.email}
                                />

                                <DetailItem
                                    label="Phone"
                                    value={refund.phone}
                                />
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Original Payment */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <SectionHeader
                            title="Original Payment"
                            icon={<ReceiptLong />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Payment ID"
                                        value={refund.paymentId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Transaction ID"
                                        value={refund.paymentTransactionId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Order ID"
                                        value={refund.orderId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Payment Method"
                                        value={refund.method}
                                    />
                                </Grid>
                            </Grid>
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
                                        value={refund.bookingId}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Library"
                                        value={refund.library}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Seat"
                                        value={refund.seat}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <DetailItem
                                        label="Slot"
                                        value={refund.slot}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Card>
                </Grid>

                {/* Refund Transaction */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Refund Transaction"
                            icon={<CurrencyRupee />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2.5}>
                                <DetailItem
                                    label="Refund Transaction ID"
                                    value={refund.refundTransactionId}
                                />

                                <DetailItem
                                    label="Refund Amount"
                                    value={`₹${refund.amount.toLocaleString()}`}
                                />

                                <DetailItem
                                    label="Gateway"
                                    value={refund.gateway}
                                />
                            </Stack>
                        </Box>
                    </Card>
                </Grid>

                {/* Refund Status */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <SectionHeader
                            title="Refund Status"
                            icon={<CheckCircle />}
                        />

                        <Divider />

                        <Box p={2.5}>
                            <Stack spacing={2.5}>
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
                                    label="Request Date"
                                    value={`${refund.requestDate} ${refund.requestTime}`}
                                />

                                <DetailItem
                                    label="Processed Date"
                                    value={
                                        refund.processedDate === "-"
                                            ? "-"
                                            : `${refund.processedDate} ${refund.processedTime}`
                                    }
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
                            variant="h6"
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

export default RefundDetails;