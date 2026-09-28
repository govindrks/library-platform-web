import {
    ArrowBack,
    CalendarMonth,
    CancelOutlined,
    Download,
    EventSeat,
    LocationOn,
    Payment,
    AccessTime,
    SwapHoriz,
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
import { useLocation, useNavigate, useParams } from "react-router-dom";

const BookingDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId } = useParams();

    /*
     * Temporary mock booking.
     * This will later be replaced with:
     *
     * bookingApi.getBookingById(bookingId)
     */
    const booking = location.state?.booking || {
        id: bookingId || "BK-20260928-001",
        library: "GNC Central Library",
        location: "Koramangala, Bengaluru",
        seat: "A12",
        date: "28 September 2026",
        time: "09:00 AM - 01:00 PM",
        amount: 100,
        status: "UPCOMING",
        paymentStatus: "PAID",
        bookingDate: "27 September 2026",
        bookingType: "Seat Booking",
    };

    const handleSeatChange = () => {
        navigate("/request-seat-change", {
            state: {
                booking,
            },
        });
    };

    const handleCancelBooking = () => {
        /*
         * API integration later:
         *
         * await bookingApi.cancelBooking(booking.id);
         */

        console.log("Cancel booking:", booking.id);
    };

    const handleDownloadInvoice = () => {
        /*
         * Invoice API will be integrated later.
         *
         * Example:
         * bookingApi.downloadInvoice(booking.id)
         */
        console.log("Download invoice:", booking.id);
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
                    onClick={() => navigate("/my-bookings")}
                    sx={{
                        textTransform: "none",
                        color: "text.primary",
                    }}
                >
                    My Bookings
                </Button>

                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Booking Details
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage your booking
                    </Typography>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                {/* Main Details */}
                <Grid item xs={12} md={8}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                        }}
                    >
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Booking heading */}
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                justifyContent="space-between"
                                spacing={2}
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
                                                fontSize: 18,
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

                                <BookingStatus
                                    status={booking.status}
                                />
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                mb={2}
                            >
                                Booking Information
                            </Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<EventSeat />}
                                        label="Seat"
                                        value={booking.seat}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<CalendarMonth />}
                                        label="Booking Date"
                                        value={booking.date}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<AccessTime />}
                                        label="Time"
                                        value={booking.time}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<CalendarMonth />}
                                        label="Booked On"
                                        value={booking.bookingDate}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        label="Booking Type"
                                        value={booking.bookingType}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DetailItem
                                        icon={<Payment />}
                                        label="Payment Status"
                                        value={booking.paymentStatus}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1.5}
                            >
                                {booking.status === "UPCOMING" && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            startIcon={<SwapHoriz />}
                                            onClick={handleSeatChange}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                            }}
                                        >
                                            Request Seat Change
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelOutlined />}
                                            onClick={handleCancelBooking}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                            }}
                                        >
                                            Cancel Booking
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Summary */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mb={3}
                            >
                                Payment Details
                            </Typography>

                            <Stack spacing={2}>
                                <SummaryRow
                                    label="Booking Amount"
                                    value={`₹${booking.amount}`}
                                />

                                <SummaryRow
                                    label="Platform Fee"
                                    value="₹0"
                                />

                                <Divider />

                                <SummaryRow
                                    label="Total Paid"
                                    value={`₹${booking.amount}`}
                                    strong
                                />
                            </Stack>

                            <Chip
                                label={booking.paymentStatus}
                                color={
                                    booking.paymentStatus === "PAID"
                                        ? "success"
                                        : "warning"
                                }
                                size="small"
                                sx={{
                                    mt: 3,
                                    fontWeight: 600,
                                }}
                            />

                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={handleDownloadInvoice}
                                sx={{
                                    mt: 2,
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Download Invoice
                            </Button>
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
            {icon && (
                <Box
                    sx={{
                        width: 42,
                        height: 42,
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

const SummaryRow = ({ label, value, strong = false }) => {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography
                variant="body2"
                color={strong ? "text.primary" : "text.secondary"}
                fontWeight={strong ? 700 : 400}
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

const BookingStatus = ({ status }) => {
    const config = {
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

    const current = config[status] || config.UPCOMING;

    return (
        <Chip
            label={current.label}
            color={current.color}
            size="small"
            sx={{ fontWeight: 600 }}
        />
    );
};

export default BookingDetails;