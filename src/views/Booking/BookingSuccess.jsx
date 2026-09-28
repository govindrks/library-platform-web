import {
    CheckCircle,
    EventSeat,
    CalendarMonth,
    AccessTime,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const booking = location.state || {};

    const bookingId = booking.bookingId || "BK-20260928-001";

    return (
        <Box
            sx={{
                minHeight: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 560,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    <Stack alignItems="center" textAlign="center">
                        <CheckCircle
                            sx={{
                                fontSize: 72,
                                color: "success.main",
                                mb: 2,
                            }}
                        />

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            gutterBottom
                        >
                            Booking Confirmed
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ maxWidth: 420 }}
                        >
                            Your study seat has been successfully booked.
                            You can view the booking details from My Bookings.
                        </Typography>

                        <Box
                            sx={{
                                width: "100%",
                                mt: 4,
                                p: 2.5,
                                borderRadius: 2,
                                backgroundColor: "action.hover",
                                textAlign: "left",
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Booking ID
                            </Typography>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mb={2}
                            >
                                {bookingId}
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={1.5}>
                                <Typography variant="body2">
                                    <strong>Library:</strong>{" "}
                                    {booking.library?.name ||
                                        "GNC Central Library"}
                                </Typography>

                                <Typography variant="body2">
                                    <strong>Seat:</strong>{" "}
                                    {booking.seat?.number ||
                                        booking.seat?.id ||
                                        "A12"}
                                </Typography>

                                <Typography variant="body2">
                                    <strong>Date:</strong>{" "}
                                    {booking.date ||
                                        "28 September 2026"}
                                </Typography>

                                <Typography variant="body2">
                                    <strong>Time:</strong>{" "}
                                    {booking.slot
                                        ? `${booking.slot.startTime} - ${booking.slot.endTime}`
                                        : "09:00 AM - 01:00 PM"}
                                </Typography>
                            </Stack>
                        </Box>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            width="100%"
                            mt={4}
                        >
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => navigate("/my-bookings")}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                View My Bookings
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate("/libraries")}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Explore Libraries
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default BookingSuccess;