import {
    EventSeat,
    People,
    Payments,
    TrendingUp,
} from "@mui/icons-material";

import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

const stats = [
    {
        title: "Total Members",
        value: "1,248",
        change: "+8.2%",
        description: "vs last month",
        icon: People,
    },
    {
        title: "Seat Occupancy",
        value: "78.4%",
        change: "+4.6%",
        description: "vs last month",
        icon: EventSeat,
    },
    {
        title: "Monthly Revenue",
        value: "₹24,850",
        change: "+12.5%",
        description: "vs last month",
        icon: Payments,
    },
    {
        title: "Active Bookings",
        value: "342",
        change: "+6.8%",
        description: "vs last month",
        icon: TrendingUp,
    },
];

function DashboardStats() {
    return (
        <Grid container spacing={3}>
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Grid
                        key={stat.title}
                        size={{
                            xs: 12,
                            sm: 6,
                            lg: 3,
                        }}
                    >
                        <Card sx={{ height: "100%" }}>
                            <CardContent>
                                <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    justifyContent="space-between"
                                >
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {stat.title}
                                        </Typography>

                                        <Typography
                                            variant="h4"
                                            sx={{
                                                mt: 1,
                                                fontWeight: 700,
                                            }}
                                        >
                                            {stat.value}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="success.main"
                                            sx={{
                                                display: "block",
                                                mt: 1,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {stat.change}{" "}
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {stat.description}
                                            </Box>
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            backgroundColor:
                                                "primary.light",
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
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