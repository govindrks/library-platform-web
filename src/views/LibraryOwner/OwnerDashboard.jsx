import {
    AccessTime,
    ArrowForward,
    EventSeat,
    Groups,
    LibraryBooks,
    Payments,
    TrendingUp,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const stats = [
    {
        title: "Total Seats",
        value: "120",
        subtitle: "Configured seats",
        icon: <EventSeat />,
    },
    {
        title: "Available Seats",
        value: "84",
        subtitle: "70% available",
        icon: <LibraryBooks />,
    },
    {
        title: "Today's Bookings",
        value: "36",
        subtitle: "12 upcoming",
        icon: <Groups />,
    },
    {
        title: "Today's Revenue",
        value: "₹8,450",
        subtitle: "+12.5% from yesterday",
        icon: <Payments />,
    },
];

const recentBookings = [
    {
        id: "#BK1001",
        member: "Rahul Kumar",
        seat: "A-12",
        plan: "Monthly",
        time: "09:00 AM",
        status: "Confirmed",
    },
    {
        id: "#BK1002",
        member: "Amit Singh",
        seat: "B-04",
        plan: "Daily Pass",
        time: "10:30 AM",
        status: "Confirmed",
    },
    {
        id: "#BK1003",
        member: "Priya Sharma",
        seat: "C-08",
        plan: "Monthly",
        time: "12:00 PM",
        status: "Upcoming",
    },
    {
        id: "#BK1004",
        member: "Ankit Raj",
        seat: "A-18",
        plan: "Quarterly",
        time: "02:30 PM",
        status: "Confirmed",
    },
];

function StatCard({ title, value, subtitle, icon }) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                        >
                            {title}
                        </Typography>

                        <Typography variant="h4" fontWeight={700}>
                            {value}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={0.75}
                        >
                            {subtitle}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: 44,
                            height: 44,
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
            </CardContent>
        </Card>
    );
}

function OwnerDashboard() {
    const navigate = useNavigate();

    const occupiedSeats = 36;
    const totalSeats = 120;
    const occupancy = Math.round((occupiedSeats / totalSeats) * 100);

    return (
        <Box>
            {/* Page Header */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Welcome back 👋
                    </Typography>

                    <Typography color="text.secondary" mt={0.5}>
                        Manage your library and monitor today's activity.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/owner/library")}
                    >
                        Library Profile
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => navigate("/owner/seat-mapping")}
                    >
                        Manage Seats
                    </Button>
                </Stack>
            </Stack>

            {/* Library Summary */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                GNC Central Library
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Koramangala, Bengaluru
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <Chip
                                label="Open Now"
                                color="success"
                                size="small"
                            />

                            <Chip
                                label="Library Active"
                                variant="outlined"
                                size="small"
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Stats */}
            <Grid container spacing={2} mb={3}>
                {stats.map((stat) => (
                    <Grid
                        key={stat.title}
                        size={{ xs: 12, sm: 6, lg: 3 }}
                    >
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            {/* Analytics */}
            <Grid container spacing={2} mb={3}>
                {/* Occupancy */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={3}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={700}>
                                        Today's Occupancy
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Current seat utilization
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    color="primary"
                                >
                                    {occupancy}%
                                </Typography>
                            </Stack>

                            <Box mb={3}>
                                <LinearProgress
                                    variant="determinate"
                                    value={occupancy}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                    }}
                                />
                            </Box>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total
                                    </Typography>

                                    <Typography variant="h6" fontWeight={700}>
                                        120
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Occupied
                                    </Typography>

                                    <Typography variant="h6" fontWeight={700}>
                                        36
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Available
                                    </Typography>

                                    <Typography variant="h6" fontWeight={700}>
                                        84
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Peak Time
                                    </Typography>

                                    <Typography variant="h6" fontWeight={700}>
                                        6–9 PM
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} mb={2}>
                                Quick Actions
                            </Typography>

                            <Stack spacing={1.2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<EventSeat />}
                                    onClick={() =>
                                        navigate("/owner/seat-mapping")
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.2,
                                    }}
                                >
                                    Configure Seat Mapping
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<AccessTime />}
                                    onClick={() =>
                                        navigate("/owner/slots")
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.2,
                                    }}
                                >
                                    Manage Slots
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<Payments />}
                                    onClick={() =>
                                        navigate("/owner/payments")
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.2,
                                    }}
                                >
                                    View Payments
                                </Button>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<TrendingUp />}
                                    onClick={() =>
                                        navigate("/owner/reports")
                                    }
                                    sx={{
                                        justifyContent: "flex-start",
                                        py: 1.2,
                                    }}
                                >
                                    View Reports
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Bookings */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={700}>
                                Recent Bookings
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Latest reservations in your library
                            </Typography>
                        </Box>

                        <Button
                            endIcon={<ArrowForward />}
                            onClick={() =>
                                navigate("/owner/bookings")
                            }
                        >
                            View All
                        </Button>
                    </Box>

                    <Divider />

                    <Box sx={{ overflowX: "auto" }}>
                        <Box sx={{ minWidth: 800 }}>
                            {recentBookings.map((booking, index) => (
                                <Box key={booking.id}>
                                    <Box
                                        sx={{
                                            px: 2.5,
                                            py: 2,
                                            display: "grid",
                                            gridTemplateColumns:
                                                "1.2fr 1.5fr 1fr 1fr 1.2fr 1fr",
                                            alignItems: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            {booking.id}
                                        </Typography>

                                        <Box>
                                            <Typography variant="body2">
                                                {booking.member}
                                            </Typography>
                                        </Box>

                                        <Typography variant="body2">
                                            {booking.seat}
                                        </Typography>

                                        <Typography variant="body2">
                                            {booking.plan}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {booking.time}
                                        </Typography>

                                        <Chip
                                            label={booking.status}
                                            size="small"
                                            color={
                                                booking.status ===
                                                "Confirmed"
                                                    ? "success"
                                                    : "info"
                                            }
                                            variant="outlined"
                                        />
                                    </Box>

                                    {index < recentBookings.length - 1 && (
                                        <Divider />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default OwnerDashboard;