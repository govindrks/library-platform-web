import {
    ArrowBack,
    EventSeat,
    LocationOn,
    AccessTime,
    CalendarMonth,
    Payment,
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
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const bookingData = location.state || {};

    const {
        library,
        seat,
        date,
        slot,
        duration = 1,
        price = 100,
    } = bookingData;

    // Temporary fallback data for frontend development.
    // This will later come from the real seat/slot APIs.
    const selectedLibrary = library || {
        id: 1,
        name: "GNC Central Library",
        location: "Koramangala, Bengaluru",
    };

    const selectedSeat = seat || {
        id: "A12",
        number: "A12",
        type: "Standard",
    };

    const selectedDate = date || "28 September 2026";

    const selectedSlot = slot || {
        startTime: "09:00 AM",
        endTime: "01:00 PM",
    };

    const bookingPrice = Number(price) || 100;

    const handleConfirmBooking = () => {
        /*
         * API integration will be added here.
         *
         * Example:
         *
         * await bookingApi.createBooking({
         *     libraryId: selectedLibrary.id,
         *     seatId: selectedSeat.id,
         *     date: selectedDate,
         *     startTime: selectedSlot.startTime,
         *     endTime: selectedSlot.endTime,
         * });
         */

        navigate("/booking/success", {
            state: {
                library: selectedLibrary,
                seat: selectedSeat,
                date: selectedDate,
                slot: selectedSlot,
                price: bookingPrice,
            },
        });
    };

    const handleChangeSeat = () => {
        if (selectedLibrary?.id) {
            navigate(`/libraries/${selectedLibrary.id}/seats`);
        } else {
            navigate("/libraries");
        }
    };

    return (
        <Box>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                mb={3}
            >
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{
                        textTransform: "none",
                        color: "text.primary",
                    }}
                >
                    Back
                </Button>

                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Booking Summary
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Review your booking details before confirmation
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                {/* Booking Details */}
                <Grid item xs={12} md={8}>
                    <Card
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            boxShadow: "none",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            {/* Library */}
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="flex-start"
                                mb={3}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        backgroundColor: "primary.50",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <LocationOn color="primary" />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        {selectedLibrary.name}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {selectedLibrary.location ||
                                            selectedLibrary.address}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ mb: 3 }} />

                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                mb={2}
                            >
                                Booking Details
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<EventSeat />}
                                        label="Selected Seat"
                                        value={
                                            selectedSeat.number ||
                                            selectedSeat.name ||
                                            selectedSeat.id
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<CalendarMonth />}
                                        label="Date"
                                        value={selectedDate}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<AccessTime />}
                                        label="Time Slot"
                                        value={`${selectedSlot.startTime} - ${selectedSlot.endTime}`}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<AccessTime />}
                                        label="Duration"
                                        value={`${duration} hour${
                                            duration > 1 ? "s" : ""
                                        }`}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Seat Type
                                    </Typography>

                                    <Chip
                                        label={
                                            selectedSeat.type || "Standard"
                                        }
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>

                                <Button
                                    variant="outlined"
                                    onClick={handleChangeSeat}
                                    sx={{
                                        textTransform: "none",
                                        borderRadius: 2,
                                    }}
                                >
                                    Change Seat
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Summary */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            boxShadow: "none",
                            position: "sticky",
                            top: 90,
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mb={3}
                            >
                                Payment Summary
                            </Typography>

                            <Stack spacing={2}>
                                <SummaryRow
                                    label="Seat Booking"
                                    value={`₹${bookingPrice.toFixed(2)}`}
                                />

                                <SummaryRow
                                    label="Platform Fee"
                                    value="₹0.00"
                                />

                                <Divider />

                                <SummaryRow
                                    label="Total"
                                    value={`₹${bookingPrice.toFixed(2)}`}
                                    strong
                                />
                            </Stack>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<Payment />}
                                onClick={handleConfirmBooking}
                                sx={{
                                    mt: 3,
                                    py: 1.4,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Confirm Booking
                            </Button>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                textAlign="center"
                                display="block"
                                mt={2}
                            >
                                Payment will be processed securely.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

const DetailItem = ({ icon, label, value }) => {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": {
                        fontSize: 20,
                        color: "primary.main",
                    },
                }}
            >
                {icon}
            </Box>

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

const SummaryRow = ({ label, value, strong = false }) => {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography
                variant="body2"
                fontWeight={strong ? 700 : 400}
                color={strong ? "text.primary" : "text.secondary"}
            >
                {label}
            </Typography>

            <Typography
                variant={strong ? "h6" : "body2"}
                fontWeight={strong ? 700 : 600}
            >
                {value}
            </Typography>
        </Stack>
    );
};

export default BookingSummary;