import {
    AccessTime,
    CalendarMonth,
    EventSeat,
    Lock,
    Refresh,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

const slots = [
    {
        id: 1,
        name: "Morning Slot",
        startTime: "06:00",
        endTime: "10:00",
    },
    {
        id: 2,
        name: "Afternoon Slot",
        startTime: "10:00",
        endTime: "14:00",
    },
    {
        id: 3,
        name: "Evening Slot",
        startTime: "14:00",
        endTime: "18:00",
    },
    {
        id: 4,
        name: "Night Slot",
        startTime: "18:00",
        endTime: "23:00",
    },
];

const createSeats = () => {
    const rows = ["A", "B", "C", "D"];

    return rows.flatMap((row, rowIndex) =>
        Array.from({ length: 5 }, (_, index) => {
            const number = index + 1;

            let status = "AVAILABLE";

            if (
                (rowIndex === 0 && number === 3) ||
                (rowIndex === 1 && number === 2) ||
                (rowIndex === 2 && number === 5) ||
                (rowIndex === 3 && number === 1)
            ) {
                status = "BOOKED";
            }

            return {
                id: `${row}-${number}`,
                label: `${row}${number}`,
                row,
                number,
                status,
            };
        })
    );
};

function formatDate(date) {
    if (!date) return "";

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function SeatAvailability() {
    const today = new Date()
        .toISOString()
        .split("T")[0];

    const [selectedDate, setSelectedDate] =
        useState(today);

    const [selectedSlot, setSelectedSlot] =
        useState(1);

    const [seats, setSeats] = useState(
        createSeats
    );

    const [lastUpdated, setLastUpdated] =
        useState(new Date());

    const selectedSlotData = slots.find(
        (slot) => slot.id === selectedSlot
    );

    const availableSeats = useMemo(
        () =>
            seats.filter(
                (seat) =>
                    seat.status === "AVAILABLE"
            ).length,
        [seats]
    );

    const bookedSeats = useMemo(
        () =>
            seats.filter(
                (seat) =>
                    seat.status === "BOOKED"
            ).length,
        [seats]
    );

    const blockedSeats = useMemo(
        () =>
            seats.filter(
                (seat) =>
                    seat.status === "BLOCKED"
            ).length,
        [seats]
    );

    const totalSeats = seats.length;

    const occupancyPercentage =
        totalSeats > 0
            ? Math.round(
                  (bookedSeats / totalSeats) *
                      100
              )
            : 0;

    const handleRefresh = () => {
        setLastUpdated(new Date());
    };

    const handleSeatClick = (seatId) => {
        setSeats((previous) =>
            previous.map((seat) => {
                if (seat.id !== seatId) {
                    return seat;
                }

                if (seat.status === "BOOKED") {
                    return seat;
                }

                return {
                    ...seat,
                    status:
                        seat.status === "AVAILABLE"
                            ? "BLOCKED"
                            : "AVAILABLE",
                };
            })
        );
    };

    const getSeatStyles = (status) => {
        switch (status) {
            case "BOOKED":
                return {
                    bgcolor: "error.light",
                    borderColor: "error.main",
                    color: "error.dark",
                };

            case "BLOCKED":
                return {
                    bgcolor: "grey.200",
                    borderColor: "grey.500",
                    color: "grey.700",
                };

            default:
                return {
                    bgcolor: "success.light",
                    borderColor: "success.main",
                    color: "success.dark",
                };
        }
    };

    return (
        <Box>
            {/* Header */}
            <Stack
                direction={{
                    xs: "column",
                    md: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    md: "center",
                }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Seat Availability
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Monitor seat availability by
                        date and booking slot.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
            </Stack>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid
                        container
                        spacing={2}
                        alignItems="center"
                    >
                        <Grid
                            size={{
                                xs: 12,
                                md: 5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <CalendarMonth
                                    color="primary"
                                />

                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                >
                                    Select Date
                                </Typography>
                            </Stack>

                            <Box mt={1}>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={today}
                                    onChange={(event) =>
                                        setSelectedDate(
                                            event.target
                                                .value
                                        )
                                    }
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                        padding:
                                            "0 12px",
                                        border:
                                            "1px solid #E2E8F0",
                                        borderRadius:
                                            "8px",
                                        fontSize:
                                            "14px",
                                        fontFamily:
                                            "inherit",
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 5,
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <AccessTime
                                    color="primary"
                                />

                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                >
                                    Select Slot
                                </Typography>
                            </Stack>

                            <FormControl
                                fullWidth
                                size="small"
                                sx={{ mt: 1 }}
                            >
                                <InputLabel>
                                    Booking Slot
                                </InputLabel>

                                <Select
                                    value={
                                        selectedSlot
                                    }
                                    label="Booking Slot"
                                    onChange={(event) =>
                                        setSelectedSlot(
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    {slots.map(
                                        (slot) => (
                                            <MenuItem
                                                key={
                                                    slot.id
                                                }
                                                value={
                                                    slot.id
                                                }
                                            >
                                                {slot.name}{" "}
                                                (
                                                {
                                                    slot.startTime
                                                }{" "}
                                                -{" "}
                                                {
                                                    slot.endTime
                                                }
                                                )
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 1.5,
                                    bgcolor:
                                        "primary.light",
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Viewing
                                </Typography>

                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                >
                                    {formatDate(
                                        selectedDate
                                    )}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {selectedSlotData?.name}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Summary */}
            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Total Seats
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                mt={0.5}
                            >
                                {totalSeats}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Available
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="success.main"
                                mt={0.5}
                            >
                                {availableSeats}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Booked
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="error.main"
                                mt={0.5}
                            >
                                {bookedSeats}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Occupancy
                            </Typography>

                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="primary.main"
                                mt={0.5}
                            >
                                {occupancyPercentage}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Seat Layout */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                        mb={3}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Seat Availability Map
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                {selectedSlotData?.name}{" "}
                                ·{" "}
                                {
                                    selectedSlotData?.startTime
                                }{" "}
                                -{" "}
                                {
                                    selectedSlotData?.endTime
                                }
                            </Typography>
                        </Box>

                        <Chip
                            icon={<CalendarMonth />}
                            label={formatDate(
                                selectedDate
                            )}
                            variant="outlined"
                        />
                    </Stack>

                    {/* Entrance */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 8,
                                py: 1.5,
                                minWidth: 280,
                                textAlign: "center",
                                bgcolor:
                                    "grey.100",
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                                borderRadius:
                                    "0 0 12px 12px",
                            }}
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                            >
                                ENTRANCE
                            </Typography>
                        </Box>
                    </Box>

                    {/* Seats */}
                    <Stack
                        spacing={3}
                        sx={{
                            overflowX: "auto",
                            pb: 2,
                        }}
                    >
                        {[
                            "A",
                            "B",
                            "C",
                            "D",
                        ].map((row) => {
                            const rowSeats =
                                seats.filter(
                                    (seat) =>
                                        seat.row ===
                                        row
                                );

                            return (
                                <Stack
                                    key={row}
                                    direction="row"
                                    alignItems="center"
                                    spacing={3}
                                    sx={{
                                        minWidth:
                                            "max-content",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 55,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={700}
                                        >
                                            Row {row}
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                    >
                                        {rowSeats.map(
                                            (seat) => {
                                                const style =
                                                    getSeatStyles(
                                                        seat.status
                                                    );

                                                return (
                                                    <Box
                                                        key={
                                                            seat.id
                                                        }
                                                        onClick={() =>
                                                            handleSeatClick(
                                                                seat.id
                                                            )
                                                        }
                                                        sx={{
                                                            width: 60,
                                                            height: 60,
                                                            borderRadius: 2,
                                                            border: "2px solid",
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            cursor:
                                                                seat.status ===
                                                                "BOOKED"
                                                                    ? "not-allowed"
                                                                    : "pointer",
                                                            bgcolor:
                                                                style.bgcolor,
                                                            borderColor:
                                                                style.borderColor,
                                                            color:
                                                                style.color,
                                                            transition:
                                                                "all 0.2s ease",
                                                            "&:hover":
                                                                seat.status !==
                                                                "BOOKED"
                                                                    ? {
                                                                          transform:
                                                                              "translateY(-2px)",
                                                                          boxShadow:
                                                                              2,
                                                                      }
                                                                    : {},
                                                        }}
                                                    >
                                                        {seat.status ===
                                                        "BLOCKED" ? (
                                                            <Lock
                                                                sx={{
                                                                    fontSize: 17,
                                                                }}
                                                            />
                                                        ) : (
                                                            <EventSeat
                                                                sx={{
                                                                    fontSize: 17,
                                                                }}
                                                            />
                                                        )}

                                                        <Typography
                                                            variant="caption"
                                                            fontWeight={
                                                                700
                                                            }
                                                        >
                                                            {
                                                                seat.label
                                                            }
                                                        </Typography>
                                                    </Box>
                                                );
                                            }
                                        )}
                                    </Stack>
                                </Stack>
                            );
                        })}
                    </Stack>

                    {/* Reception */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            mt: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 7,
                                py: 1.5,
                                borderRadius: 2,
                                bgcolor:
                                    "grey.100",
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                            }}
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                            >
                                RECEPTION
                            </Typography>
                        </Box>
                    </Box>

                    {/* Legend */}
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        mt={4}
                        pt={3}
                        borderTop="1px solid"
                        borderColor="divider"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 1,
                                    bgcolor:
                                        "success.light",
                                    border:
                                        "2px solid",
                                    borderColor:
                                        "success.main",
                                }}
                            />

                            <Typography variant="body2">
                                Available
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 1,
                                    bgcolor:
                                        "error.light",
                                    border:
                                        "2px solid",
                                    borderColor:
                                        "error.main",
                                }}
                            />

                            <Typography variant="body2">
                                Booked
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 1,
                                    bgcolor:
                                        "grey.200",
                                    border:
                                        "2px solid",
                                    borderColor:
                                        "grey.500",
                                }}
                            />

                            <Typography variant="body2">
                                Blocked
                            </Typography>
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                ml: {
                                    xs: 0,
                                    sm: "auto",
                                },
                            }}
                        >
                            Click an available seat to
                            block/unblock it.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {/* Last Updated */}
            <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="right"
                mt={1.5}
            >
                Last updated:{" "}
                {lastUpdated.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                    }
                )}
            </Typography>

            {blockedSeats > 0 && (
                <Alert
                    severity="info"
                    sx={{ mt: 2 }}
                >
                    {blockedSeats} seat
                    {blockedSeats > 1 ? "s are" : " is"}{" "}
                    currently blocked for this slot.
                </Alert>
            )}
        </Box>
    );
}

export default SeatAvailability;