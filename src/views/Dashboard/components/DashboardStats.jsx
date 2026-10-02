import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import {
    People,
    EventSeat,
    Payments,
    TrendingUp,
} from "@mui/icons-material";

function DashboardStats({ statistics }) {

    const stats = [
        {
            title: "Total Members",
            value: statistics?.totalMembers ?? 0,
            icon: People,
        },
        {
            title: "Seat Occupancy",
            value: `${Number(
                statistics?.occupancyPercentage ?? 0
            ).toFixed(1)}%`,
            icon: EventSeat,
        },
        {
            title: "Monthly Revenue",
            value: `₹${Number(
                statistics?.monthlyRevenue ?? 0
            ).toLocaleString("en-IN")}`,
            icon: Payments,
        },
        {
            title: "Active Bookings",
            value: statistics?.activeBookings ?? 0,
            icon: TrendingUp,
        },
    ];

    return (
        <Grid container spacing={3}>
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Grid
                        key={stat.title}
                        size={{ xs: 12, sm: 6, lg: 3 }}
                    >
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
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            {stat.title}
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                        >
                                            {stat.value}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: "primary.50",
                                            color: "primary.main",
                                        }}
                                    >
                                        <Icon />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}

export default DashboardStats;