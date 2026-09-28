import React, { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { useNavigate, useLocation } from "react-router-dom";

const mockBooking = {
    id: 501,
    libraryId: 1,
    libraryName: "GNC Central Library",
    bookingDate: "2026-09-28",
    slot: "Morning",
    startTime: "06:00 AM",
    endTime: "10:00 AM",
    currentSeatId: 12,
    currentSeatNumber: "A3",
};

const mockSeats = [
    { id: 1, number: "A1", status: "AVAILABLE" },
    { id: 2, number: "A2", status: "AVAILABLE" },
    { id: 12, number: "A3", status: "CURRENT" },
    { id: 4, number: "A4", status: "AVAILABLE" },
    { id: 5, number: "A5", status: "OCCUPIED" },

    { id: 6, number: "B1", status: "AVAILABLE" },
    { id: 7, number: "B2", status: "AVAILABLE" },
    { id: 8, number: "B3", status: "OCCUPIED" },
    { id: 9, number: "B4", status: "AVAILABLE" },
    { id: 10, number: "B5", status: "AVAILABLE" },

    { id: 11, number: "C1", status: "AVAILABLE" },
    { id: 13, number: "C2", status: "OCCUPIED" },
    { id: 14, number: "C3", status: "AVAILABLE" },
    { id: 15, number: "C4", status: "AVAILABLE" },
    { id: 16, number: "C5", status: "OCCUPIED" },

    { id: 17, number: "D1", status: "AVAILABLE" },
    { id: 18, number: "D2", status: "AVAILABLE" },
    { id: 19, number: "D3", status: "OCCUPIED" },
    { id: 20, number: "D4", status: "AVAILABLE" },
    { id: 21, number: "D5", status: "AVAILABLE" },
];

function RequestSeatChange() {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const booking = location.state?.booking || mockBooking;

    const availableSeats = useMemo(
        () =>
            mockSeats.filter(
                (seat) =>
                    seat.status === "AVAILABLE"
            ),
        []
    );

    const handleSeatSelect = (seat) => {
        setSelectedSeat(seat);
        setError("");
    };

    const handleSubmit = () => {
        if (!selectedSeat) {
            setError("Please select a new seat.");
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a reason for the seat change.");
            return;
        }

        if (reason.trim().length < 5) {
            setError(
                "Please provide a little more detail about your request."
            );
            return;
        }

        const payload = {
            bookingId: booking.id,
            requestedSeatId: selectedSeat.id,
            reason: reason.trim(),
        };

        console.log("Seat change request payload:", payload);

        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Box>
                <Card>
                    <CardContent>
                        <Stack
                            spacing={3}
                            alignItems="center"
                            textAlign="center"
                            py={5}
                        >
                            <CheckCircleIcon
                                sx={{
                                    fontSize: 64,
                                    color: "success.main",
                                }}
                            />

                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    Request Submitted
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={1}
                                >
                                    Your seat change request has
                                    been submitted successfully.
                                </Typography>
                            </Box>

                            <Chip
                                label="Pending Owner Review"
                                color="warning"
                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={2}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            "/my-seat-change-requests"
                                        )
                                    }
                                >
                                    View My Requests
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                >
                                    Back to Dashboard
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        minWidth: "auto",
                        px: 1,
                    }}
                >
                    Back
                </Button>
            </Stack>

            <Box mb={3}>
                <Typography
                    variant="h4"
                    fontWeight={700}
                >
                    Request Seat Change
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    Select another available seat for your
                    booking and submit a change request.
                </Typography>
            </Box>

            {/* Booking information */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Booking Details
                        </Typography>

                        <Divider />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Library
                                </Typography>

                                <Typography
                                    fontWeight={600}
                                    mt={0.5}
                                >
                                    {booking.libraryName}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Booking Date
                                </Typography>

                                <Typography
                                    fontWeight={600}
                                    mt={0.5}
                                >
                                    {booking.bookingDate}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Slot
                                </Typography>

                                <Typography
                                    fontWeight={600}
                                    mt={0.5}
                                >
                                    {booking.slot}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Current Seat
                                </Typography>

                                <Chip
                                    icon={<EventSeatIcon />}
                                    label={
                                        booking.currentSeatNumber
                                    }
                                    color="primary"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>
                        </Grid>

                        <Alert severity="info">
                            Your current seat will remain unchanged
                            until the library owner reviews and
                            approves this request.
                        </Alert>
                    </Stack>
                </CardContent>
            </Card>

            {/* Seat selection */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={3}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Select New Seat
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Only seats available for this
                                booking are selectable.
                            </Typography>
                        </Box>

                        {/* Legend */}
                        <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 1,
                                        backgroundColor:
                                            "success.light",
                                        border:
                                            "1px solid",
                                        borderColor:
                                            "success.main",
                                    }}
                                />

                                <Typography variant="caption">
                                    Available
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 1,
                                        backgroundColor:
                                            "primary.main",
                                    }}
                                />

                                <Typography variant="caption">
                                    Selected
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 1,
                                        backgroundColor:
                                            "action.disabledBackground",
                                    }}
                                />

                                <Typography variant="caption">
                                    Occupied
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={0.75}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 1,
                                        backgroundColor:
                                            "warning.light",
                                        border:
                                            "1px solid",
                                        borderColor:
                                            "warning.main",
                                    }}
                                />

                                <Typography variant="caption">
                                    Current
                                </Typography>
                            </Stack>
                        </Stack>

                        {/* Seat grid */}
                        <Box
                            sx={{
                                overflowX: "auto",
                                py: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(5, minmax(64px, 80px))",
                                    gap: 1.5,
                                    width: "fit-content",
                                    mx: "auto",
                                }}
                            >
                                {mockSeats.map((seat) => {
                                    const isSelected =
                                        selectedSeat?.id ===
                                        seat.id;

                                    const isCurrent =
                                        seat.status ===
                                        "CURRENT";

                                    const isOccupied =
                                        seat.status ===
                                        "OCCUPIED";

                                    return (
                                        <Button
                                            key={seat.id}
                                            disabled={
                                                isOccupied ||
                                                isCurrent
                                            }
                                            onClick={() =>
                                                handleSeatSelect(
                                                    seat
                                                )
                                            }
                                            variant={
                                                isSelected
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                            sx={{
                                                minWidth: 64,
                                                height: 58,
                                                borderRadius: 2,
                                                fontWeight: 700,
                                                position:
                                                    "relative",
                                                ...(isCurrent && {
                                                    backgroundColor:
                                                        "warning.light",
                                                    borderColor:
                                                        "warning.main",
                                                    color:
                                                        "warning.dark",
                                                }),
                                                ...(isOccupied && {
                                                    backgroundColor:
                                                        "action.disabledBackground",
                                                    borderColor:
                                                        "divider",
                                                    color:
                                                        "text.disabled",
                                                }),
                                            }}
                                        >
                                            <EventSeatIcon
                                                sx={{
                                                    fontSize: 18,
                                                    mr: 0.5,
                                                }}
                                            />

                                            {seat.number}
                                        </Button>
                                    );
                                })}
                            </Box>
                        </Box>

                        {selectedSeat && (
                            <Alert severity="success">
                                New seat selected:{" "}
                                <strong>
                                    {selectedSeat.number}
                                </strong>
                            </Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Reason */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Reason for Change
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Tell the library owner why you
                                need to change your seat.
                            </Typography>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            maxRows={6}
                            label="Reason"
                            placeholder="Enter your reason for requesting a seat change..."
                            value={reason}
                            onChange={(event) => {
                                setReason(
                                    event.target.value
                                );
                                setError("");
                            }}
                            inputProps={{
                                maxLength: 500,
                            }}
                            helperText={`${reason.length}/500`}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Error */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            {/* Actions */}
            <Stack
                direction={{
                    xs: "column-reverse",
                    sm: "row",
                }}
                justifyContent="flex-end"
                spacing={2}
            >
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!selectedSeat || !reason.trim()}
                >
                    Submit Request
                </Button>
            </Stack>
        </Box>
    );
}

export default RequestSeatChange;