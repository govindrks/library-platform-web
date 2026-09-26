import {
    ArrowForward,
    CheckCircle,
} from "@mui/icons-material";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

const payments = [
    {
        name: "Rahul Kumar",
        plan: "Monthly Plan",
        amount: "₹1,500",
        time: "10 minutes ago",
    },
    {
        name: "Priya Singh",
        plan: "Quarterly Plan",
        amount: "₹4,000",
        time: "35 minutes ago",
    },
    {
        name: "Amit Kumar",
        plan: "Monthly Plan",
        amount: "₹1,500",
        time: "1 hour ago",
    },
    {
        name: "Neha Sharma",
        plan: "Annual Plan",
        amount: "₹12,000",
        time: "2 hours ago",
    },
];

function RecentPayments() {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography variant="h6">
                            Recent Payments
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Latest successful payments
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        endIcon={<ArrowForward />}
                    >
                        View All
                    </Button>
                </Stack>

                <Stack divider={<Divider />} spacing={0}>
                    {payments.map((payment) => (
                        <Stack
                            key={`${payment.name}-${payment.time}`}
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ py: 1.5 }}
                        >
                            <Avatar
                                sx={{
                                    width: 38,
                                    height: 38,
                                    backgroundColor:
                                        "primary.light",
                                    color: "primary.main",
                                    fontSize: 14,
                                    fontWeight: 600,
                                }}
                            >
                                {payment.name
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")}
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    {payment.name}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {payment.plan} •{" "}
                                    {payment.time}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: "right" }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    {payment.amount}
                                </Typography>

                                <CheckCircle
                                    sx={{
                                        fontSize: 15,
                                        color: "success.main",
                                    }}
                                />
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default RecentPayments;