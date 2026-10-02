import {
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Box,
} from "@mui/material";

import {
    CalendarMonth,
    CheckCircle,
    Schedule,
    Cancel,
} from "@mui/icons-material";

function BookingOverview({ statistics }) {
    const bookingStats = [
        {
            label: "Today's Bookings",
            value: statistics?.todayBookings ?? 0,
            icon: CalendarMonth,
        },
        {
            label: "Confirmed",
            value: statistics?.todayConfirmedBookings ?? 0,
            icon: CheckCircle,
        },
        {
            label: "Pending",
            value: statistics?.todayPendingBookings ?? 0,
            icon: Schedule,
        },
        {
            label: "Cancelled",
            value: statistics?.todayCancelledBookings ?? 0,
            icon: Cancel,
        },
    ];

    return (
        <Card
            sx={{
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                >
                    Booking Overview
                </Typography>

                <Grid container spacing={2}>
                    {bookingStats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <Grid
                                key={stat.label}
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: "background.default",
                                        height: "100%",
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 2,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor:
                                                    "primary.50",
                                                color:
                                                    "primary.main",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {stat.label}
                                            </Typography>

                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                {stat.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default BookingOverview;