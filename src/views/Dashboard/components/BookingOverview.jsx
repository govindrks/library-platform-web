import {
    CalendarMonth,
    CheckCircle,
    Schedule,
    Cancel,
} from "@mui/icons-material";

import {
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

const bookingStats = [
    {
        label: "Today's Bookings",
        value: 84,
        icon: CalendarMonth,
    },
    {
        label: "Confirmed",
        value: 68,
        icon: CheckCircle,
    },
    {
        label: "Pending",
        value: 11,
        icon: Schedule,
    },
    {
        label: "Cancelled",
        value: 5,
        icon: Cancel,
    },
];

function BookingOverview() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">
                    Booking Overview
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, mb: 3 }}
                >
                    Today's booking activity
                </Typography>

                <Grid container spacing={2}>
                    {bookingStats.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Grid
                                key={item.label}
                                size={{
                                    xs: 6,
                                    sm: 3,
                                }}
                            >
                                <Stack
                                    alignItems="center"
                                    spacing={1}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor:
                                            "background.default",
                                    }}
                                >
                                    <Icon
                                        fontSize="small"
                                        color="primary"
                                    />

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {item.value}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        textAlign="center"
                                    >
                                        {item.label}
                                    </Typography>
                                </Stack>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default BookingOverview;