import {
    ArrowBack,
    CalendarMonth,
    CheckCircle,
    EventSeat,
    Person,
    Schedule,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const members = [
    {
        id: "M001",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "9876543210",
    },
    {
        id: "M002",
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543211",
    },
    {
        id: "M003",
        name: "Amit Singh",
        email: "amit@example.com",
        phone: "9876543212",
    },
    {
        id: "M004",
        name: "Neha Verma",
        email: "neha@example.com",
        phone: "9876543213",
    },
];

const slots = [
    {
        id: "MORNING",
        name: "Morning Slot",
        startTime: "06:00",
        endTime: "10:00",
        displayTime: "06:00 AM - 10:00 AM",
        price: 80,
    },
    {
        id: "AFTERNOON",
        name: "Afternoon Slot",
        startTime: "10:00",
        endTime: "14:00",
        displayTime: "10:00 AM - 02:00 PM",
        price: 80,
    },
    {
        id: "EVENING",
        name: "Evening Slot",
        startTime: "14:00",
        endTime: "18:00",
        displayTime: "02:00 PM - 06:00 PM",
        price: 80,
    },
    {
        id: "NIGHT",
        name: "Night Slot",
        startTime: "18:00",
        endTime: "23:00",
        displayTime: "06:00 PM - 11:00 PM",
        price: 100,
    },
];

const seats = [
    { id: "A1", number: "A1", type: "STANDARD" },
    { id: "A2", number: "A2", type: "STANDARD" },
    { id: "A3", number: "A3", type: "STANDARD" },
    { id: "A4", number: "A4", type: "STANDARD" },
    { id: "A5", number: "A5", type: "STANDARD" },
    { id: "A6", number: "A6", type: "STANDARD" },

    { id: "B1", number: "B1", type: "STANDARD" },
    { id: "B2", number: "B2", type: "STANDARD" },
    { id: "B3", number: "B3", type: "STANDARD" },
    { id: "B4", number: "B4", type: "STANDARD" },
    { id: "B5", number: "B5", type: "STANDARD" },
    { id: "B6", number: "B6", type: "STANDARD" },

    { id: "C1", number: "C1", type: "STANDARD" },
    { id: "C2", number: "C2", type: "STANDARD" },
    { id: "C3", number: "C3", type: "STANDARD" },
    { id: "C4", number: "C4", type: "STANDARD" },
    { id: "C5", number: "C5", type: "STANDARD" },
    { id: "C6", number: "C6", type: "STANDARD" },

    { id: "D1", number: "D1", type: "STANDARD" },
    { id: "D2", number: "D2", type: "STANDARD" },
    { id: "D3", number: "D3", type: "STANDARD" },
    { id: "D4", number: "D4", type: "STANDARD" },
    { id: "D5", number: "D5", type: "STANDARD" },
    { id: "D6", number: "D6", type: "STANDARD" },
];

const unavailableSeats = ["A2", "B4", "C3", "D5"];

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const CreateBooking = () => {
    const navigate = useNavigate();

    const [memberId, setMemberId] = useState("");
    const [bookingDate, setBookingDate] = useState(getToday());
    const [slotId, setSlotId] = useState("");
    const [seatId, setSeatId] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const selectedMember = useMemo(
        () => members.find((member) => member.id === memberId),
        [memberId]
    );

    const selectedSlot = useMemo(
        () => slots.find((slot) => slot.id === slotId),
        [slotId]
    );

    const selectedSeat = useMemo(
        () => seats.find((seat) => seat.id === seatId),
        [seatId]
    );

    const handleSlotChange = (event) => {
        setSlotId(event.target.value);
        setSeatId("");
        setError("");
    };

    const handleCreateBooking = () => {
        setError("");

        if (!memberId) {
            setError("Please select a member.");
            return;
        }

        if (!bookingDate) {
            setError("Please select a booking date.");
            return;
        }

        if (!slotId) {
            setError("Please select a time slot.");
            return;
        }

        if (!seatId) {
            setError("Please select an available seat.");
            return;
        }

        const bookingPayload = {
            memberId,
            date: bookingDate,
            slotId,
            seatId,
        };

        /*
         * Backend integration will replace this section.
         *
         * Example:
         *
         * const response =
         *     await bookingApi.createBooking(bookingPayload);
         *
         * navigate(`/booking/${response.id}`, {
         *     state: {
         *         booking: response,
         *     },
         * });
         */

        console.log("Create booking payload:", bookingPayload);

        setSuccess(true);
    };

    const handleReset = () => {
        setMemberId("");
        setBookingDate(getToday());
        setSlotId("");
        setSeatId("");
        setError("");
        setSuccess(false);
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
                    onClick={() => navigate("/owner/bookings")}
                    sx={{
                        textTransform: "none",
                        color: "text.primary",
                    }}
                >
                    Bookings
                </Button>

                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Create Booking
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Create a seat reservation for a library member.
                    </Typography>
                </Box>
            </Stack>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    icon={<CheckCircle />}
                    sx={{ mb: 3 }}
                    action={
                        <Stack direction="row" spacing={1}>
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() =>
                                    navigate("/owner/bookings")
                                }
                            >
                                View Bookings
                            </Button>

                            <Button
                                color="inherit"
                                size="small"
                                onClick={handleReset}
                            >
                                Create Another
                            </Button>
                        </Stack>
                    }
                >
                    Booking created successfully.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Booking Form */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        {/* Member */}
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle
                                    icon={<Person />}
                                    title="Member"
                                    subtitle="Select the member for this booking."
                                />

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{ mt: 3 }}
                                >
                                    <InputLabel>
                                        Select Member
                                    </InputLabel>

                                    <Select
                                        value={memberId}
                                        label="Select Member"
                                        onChange={(event) => {
                                            setMemberId(
                                                event.target.value
                                            );
                                            setError("");
                                        }}
                                    >
                                        <MenuItem value="">
                                            Select Member
                                        </MenuItem>

                                        {members.map((member) => (
                                            <MenuItem
                                                key={member.id}
                                                value={member.id}
                                            >
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                    >
                                                        {member.name}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {member.email} ·{" "}
                                                        {member.phone}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {selectedMember && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: "action.hover",
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            {selectedMember.name}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {selectedMember.email} ·{" "}
                                            {selectedMember.phone}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Date and Slot */}
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle
                                    icon={<CalendarMonth />}
                                    title="Booking Schedule"
                                    subtitle="Select the booking date and time slot."
                                />

                                <Grid
                                    container
                                    spacing={2}
                                    mt={0.5}
                                >
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="date"
                                            label="Booking Date"
                                            value={bookingDate}
                                            onChange={(event) => {
                                                setBookingDate(
                                                    event.target.value
                                                );
                                                setSeatId("");
                                                setError("");
                                            }}
                                            slotProps={{
                                                inputLabel: {
                                                    shrink: true,
                                                },
                                            }}
                                            inputProps={{
                                                min: getToday(),
                                            }}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl
                                            fullWidth
                                            size="small"
                                        >
                                            <InputLabel>
                                                Time Slot
                                            </InputLabel>

                                            <Select
                                                value={slotId}
                                                label="Time Slot"
                                                onChange={
                                                    handleSlotChange
                                                }
                                            >
                                                <MenuItem value="">
                                                    Select Time Slot
                                                </MenuItem>

                                                {slots.map((slot) => (
                                                    <MenuItem
                                                        key={slot.id}
                                                        value={slot.id}
                                                    >
                                                        {slot.name} ·{" "}
                                                        {
                                                            slot.displayTime
                                                        }{" "}
                                                        · ₹{slot.price}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Seats */}
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <SectionTitle
                                    icon={<EventSeat />}
                                    title="Select Seat"
                                    subtitle={
                                        selectedSlot
                                            ? `Available seats for ${selectedSlot.name}`
                                            : "Select a time slot to view available seats."
                                    }
                                />

                                {!selectedSlot ? (
                                    <Box
                                        sx={{
                                            py: 5,
                                            textAlign: "center",
                                        }}
                                    >
                                        <Schedule
                                            sx={{
                                                fontSize: 44,
                                                color: "text.disabled",
                                            }}
                                        />

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            mt={1}
                                        >
                                            Select a time slot first.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(6, minmax(55px, 1fr))",
                                                gap: 1.5,
                                                mt: 3,
                                            }}
                                        >
                                            {seats.map((seat) => {
                                                const unavailable =
                                                    unavailableSeats.includes(
                                                        seat.id
                                                    );

                                                const selected =
                                                    seatId === seat.id;

                                                return (
                                                    <Button
                                                        key={seat.id}
                                                        disabled={
                                                            unavailable
                                                        }
                                                        onClick={() => {
                                                            setSeatId(
                                                                seat.id
                                                            );
                                                            setError("");
                                                        }}
                                                        variant={
                                                            selected
                                                                ? "contained"
                                                                : "outlined"
                                                        }
                                                        sx={{
                                                            minWidth: 0,
                                                            minHeight: 52,
                                                            borderRadius: 2,
                                                            textTransform:
                                                                "none",
                                                        }}
                                                    >
                                                        <Stack
                                                            spacing={0}
                                                            alignItems="center"
                                                        >
                                                            <EventSeat
                                                                sx={{
                                                                    fontSize: 18,
                                                                }}
                                                            />

                                                            <Typography
                                                                variant="caption"
                                                                fontWeight={
                                                                    700
                                                                }
                                                            >
                                                                {
                                                                    seat.number
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    </Button>
                                                );
                                            })}
                                        </Box>

                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            mt={3}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <Legend
                                                label="Available"
                                                variant="outlined"
                                            />

                                            <Legend
                                                label="Selected"
                                                variant="contained"
                                            />

                                            <Legend
                                                label="Unavailable"
                                                disabled
                                            />
                                        </Stack>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>

                {/* Summary */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card
                        sx={{
                            position: {
                                md: "sticky",
                            },
                            top: {
                                md: 90,
                            },
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Booking Summary
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Review the selected booking details.
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={2.5}>
                                <SummaryItem
                                    label="Member"
                                    value={
                                        selectedMember?.name ||
                                        "Not selected"
                                    }
                                />

                                <SummaryItem
                                    label="Date"
                                    value={
                                        bookingDate
                                            ? formatDisplayDate(
                                                  bookingDate
                                              )
                                            : "Not selected"
                                    }
                                />

                                <SummaryItem
                                    label="Time Slot"
                                    value={
                                        selectedSlot?.displayTime ||
                                        "Not selected"
                                    }
                                />

                                <SummaryItem
                                    label="Seat"
                                    value={
                                        selectedSeat?.number ||
                                        "Not selected"
                                    }
                                />

                                <Divider />

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Booking Amount
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        ₹
                                        {selectedSlot?.price || 0}
                                    </Typography>
                                </Stack>
                            </Stack>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<CheckCircle />}
                                onClick={handleCreateBooking}
                                disabled={success}
                                sx={{
                                    mt: 3,
                                    py: 1.4,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Create Booking
                            </Button>

                            <Button
                                fullWidth
                                variant="text"
                                onClick={() =>
                                    navigate("/owner/bookings")
                                }
                                sx={{
                                    mt: 1,
                                    textTransform: "none",
                                }}
                            >
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

const SectionTitle = ({ icon, title, subtitle }) => {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
                sx={{
                    width: 42,
                    height: 42,
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

            <Box>
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {subtitle}
                </Typography>
            </Box>
        </Stack>
    );
};

const SummaryItem = ({ label, value }) => {
    return (
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
                mt={0.25}
            >
                {value}
            </Typography>
        </Box>
    );
};

const Legend = ({ label, variant, disabled }) => {
    return (
        <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
        >
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: disabled
                        ? "divider"
                        : variant === "contained"
                        ? "primary.main"
                        : "primary.light",
                    bgcolor: disabled
                        ? "action.disabledBackground"
                        : variant === "contained"
                        ? "primary.main"
                        : "transparent",
                }}
            />

            <Typography
                variant="caption"
                color="text.secondary"
            >
                {label}
            </Typography>
        </Stack>
    );
};

const formatDisplayDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

export default CreateBooking;