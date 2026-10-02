import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

function RecentPayments({ payments = [] }) {

    const formatAmount = (amount) => {
        return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "SUCCESS":
            case "COMPLETED":
            case "PAID":
                return "success";

            case "PENDING":
                return "warning";

            case "FAILED":
                return "error";

            case "REFUNDED":
            case "PARTIALLY_REFUNDED":
                return "info";

            default:
                return "default";
        }
    };

    const getStatusLabel = (status) => {
        if (!status) {
            return "-";
        }

        switch (status) {
            case "PARTIALLY_REFUNDED":
                return "Partially Refunded";

            case "SUCCESS":
                return "Successful";

            case "COMPLETED":
                return "Completed";

            default:
                return status
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                    );
        }
    };

    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >
                    <Typography
                        variant="h6"
                        fontWeight={600}
                    >
                        Recent Payments
                    </Typography>
                </Stack>

                {payments.length === 0 ? (
                    <Box
                        sx={{
                            py: 5,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No recent payments
                        </Typography>
                    </Box>
                ) : (
                    <Stack divider={<Divider />}>
                        {payments.map((payment, index) => (
                            <Stack
                                key={
                                    payment.id ??
                                    `${payment.studentName}-${index}`
                                }
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                                sx={{
                                    py: 1.75,
                                }}
                            >
                                {/* Student + Payment Info */}
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                    sx={{
                                        minWidth: 0,
                                        flex: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor:
                                                "primary.50",
                                            color:
                                                "primary.main",
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {(
                                            payment.studentName ||
                                            "U"
                                        )
                                            .charAt(0)
                                            .toUpperCase()}
                                    </Box>

                                    <Box
                                        sx={{
                                            minWidth: 0,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            noWrap
                                        >
                                            {payment.studentName ||
                                                "Unknown"}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                        >
                                            {payment.paymentFor ||
                                                "Payment"}
                                            {payment.paymentMethod
                                                ? ` • ${payment.paymentMethod}`
                                                : ""}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Amount + Status */}
                                <Stack
                                    alignItems="flex-end"
                                    spacing={0.5}
                                    sx={{
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={700}
                                    >
                                        {formatAmount(
                                            payment.amount
                                        )}
                                    </Typography>

                                    <Chip
                                        label={getStatusLabel(
                                            payment.paymentStatus
                                        )}
                                        color={getStatusColor(
                                            payment.paymentStatus
                                        )}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

export default RecentPayments;