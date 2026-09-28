import {
    CalendarMonth,
    EventSeat,
    LocationOn,
    AccessTime,
    Visibility,
    SwapHoriz,
    CancelOutlined,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockBookings = [
    {
        id: "BK-20260928-001",
        library: "GNC Central Library",
        location: "Koramangala, Bengaluru",
        seat: "A12",
        date: "28 September 2026",
        time: "09:00 AM - 01:00 PM",
        amount: 100,
        status: "UPCOMING",
    },
    {
        id: "BK-20260929-002",
        library: "Knowledge Point Library",
        location: "Indiranagar, Bengaluru",
        seat: "B08",
        date: "29 September 2026",
        time: "02:00 PM - 06:00 PM",
        amount: 120,
        status: "UPCOMING",
    },
    {
        id: "BK-20260925-003",
        library: "Study Space",
        location: "HSR Layout, Bengaluru",
        seat: "C15",
        date: "25 September 2026",
        time: "08:00 AM - 12:00 PM",
        amount: 100,
        status: "COMPLETED",
    },
    {
        id: "BK-20260920-004",
        library: "Readers Point",
        location: "Whitefield, Bengaluru",
        seat: "D04",
        date: "20 September 2026",
        time: "10:00 AM - 02:00 PM",
        amount: 150,
        status: "CANCELLED",
    },
];

const tabs = [
    {
        label: "All",
        value: "ALL",
    },
    {
        label: "Upcoming",
        value: "UPCOMING",
    },
    {
        label: "Active",
        value: "ACTIVE",
    },
    {
        label: "Completed",
        value: "COMPLETED",
    },
    {
        label: "Cancelled",
        value: "CANCELLED",
    },
];

const MyBookings = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("ALL");

    const filteredBookings = useMemo(() => {
        if (selectedTab === "ALL") {
            return mockBookings;
        }

        return mockBookings.filter(
            (booking) => booking.status === selectedTab
        );
    }, [selectedTab]);

    const handleViewDetails = (booking) => {
        navigate(`/booking/${booking.id}`, {
            state: {
                booking,
            },
        });
    };

    const handleSeatChange = (booking) => {
        navigate("/request-seat-change", {
            state: {
                booking,
            },
        });
    };

    const handleCancel = (booking) => {
        console.log("Cancel booking:", booking.id);

        /*
         * API integration will be added later.
         *
         * await bookingApi.cancelBooking(booking.id);
         */
    };

    return (
        <Box>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h5" fontWeight={700}>
                    My Bookings
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    Manage your library seat bookings
                </Typography>
            </Box>

            {/* Tabs */}
            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                }}
            >
                <Tabs
                    value={selectedTab}
                    onChange={(_, value) => setSelectedTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={tab.label}
                            value={tab.value}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                minHeight: 58,
                            }}
                        />
                    ))}
                </Tabs>
            </Card>

            {/* Booking List */}
            {filteredBookings.length === 0 ? (
                <EmptyState />
            ) : (
                <Stack spacing={2}>
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onViewDetails={handleViewDetails}
                            onSeatChange={handleSeatChange}
                            onCancel={handleCancel}
                        />
                    ))}
                </Stack>
            )}
        </Box>
    );
};

const BookingCard = ({
    booking,
    onViewDetails,
    onSeatChange,
    onCancel,
}) => {
    return (
        <Card
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                >
                    {/* Main information */}
                    <Box flex={1}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb={1.5}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {booking.library}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignItems="center"
                                    mt={0.5}
                                >
                                    <LocationOn
                                        sx={{
                                            fontSize: 17,
                                            color: "text.secondary",
                                        }}
                                    />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {booking.location}
                                    </Typography>
                                </Stack>
                            </Box>

                            <BookingStatus status={booking.status} />
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <BookingInfo
                                    icon={<EventSeat />}
                                    label="Seat"
                                    value={booking.seat}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <BookingInfo
                                    icon={<CalendarMonth />}
                                    label="Date"
                                    value={booking.date}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <BookingInfo
                                    icon={<AccessTime />}
                                    label="Time"
                                    value={booking.time}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <BookingInfo
                                    label="Amount"
                                    value={`₹${booking.amount}`}
                                />
                            </Grid>
                        </Grid>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={2}
                        >
                            Booking ID: {booking.id}
                        </Typography>
                    </Box>

                    {/* Actions */}
                    <Stack
                        direction={{
                            xs: "row",
                            md: "column",
                        }}
                        spacing={1}
                        justifyContent="center"
                        minWidth={{
                            xs: "100%",
                            md: 150,
                        }}
                    >
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => onViewDetails(booking)}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                            }}
                        >
                            View Details
                        </Button>

                        {booking.status === "UPCOMING" && (
                            <>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<SwapHoriz />}
                                    onClick={() => onSeatChange(booking)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    Change Seat
                                </Button>

                                <Button
                                    fullWidth
                                    color="error"
                                    variant="outlined"
                                    startIcon={<CancelOutlined />}
                                    onClick={() => onCancel(booking)}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

const BookingInfo = ({ icon, label, value }) => {
    return (
        <Stack direction="row" spacing={1.2} alignItems="center">
            {icon && (
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        backgroundColor: "action.hover",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& svg": {
                            fontSize: 19,
                            color: "primary.main",
                        },
                    }}
                >
                    {icon}
                </Box>
            )}

            <Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {label}
                </Typography>

                <Typography
                    variant="body2"
                    fontWeight={600}
                >
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
};

const BookingStatus = ({ status }) => {
    const statusConfig = {
        UPCOMING: {
            label: "Upcoming",
            color: "info",
        },
        ACTIVE: {
            label: "Active",
            color: "success",
        },
        COMPLETED: {
            label: "Completed",
            color: "default",
        },
        CANCELLED: {
            label: "Cancelled",
            color: "error",
        },
    };

    const config =
        statusConfig[status] || statusConfig.UPCOMING;

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{
                fontWeight: 600,
            }}
        />
    );
};

const EmptyState = () => {
    return (
        <Card
            sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
            }}
        >
            <CardContent
                sx={{
                    py: 7,
                    textAlign: "center",
                }}
            >
                <EventSeat
                    sx={{
                        fontSize: 52,
                        color: "text.disabled",
                        mb: 2,
                    }}
                />

                <Typography variant="h6" fontWeight={700}>
                    No bookings found
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    You don't have any bookings in this category.
                </Typography>
            </CardContent>
        </Card>
    );
};

export default MyBookings;