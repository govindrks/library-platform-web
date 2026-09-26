import {
    ArrowBack,
    CalendarMonth,
    Chair,
    Login,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Container,
    Grid,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import SeatMap from "./components/SeatMap";
import libraries from "./data/libraryData";

function SeatAvailability() {
    const { libraryId } = useParams();
    const navigate = useNavigate();

    const isAuthenticated = useSelector(
        (state) => state.auth.isAuthenticated
    );

    const library = libraries.find(
        (item) => item.id === Number(libraryId)
    );

    const [date, setDate] = useState("Today");
    const [selectedSeat, setSelectedSeat] =
        useState(null);

    const seats = useMemo(() => {
        if (!library) {
            return [];
        }

        return Array.from(
            {
                length: Math.min(
                    library.totalSeats,
                    40
                ),
            },
            (_, index) => ({
                id: index + 1,
                number: `A${index + 1}`,
                status:
                    index % 6 === 0
                        ? "OCCUPIED"
                        : "AVAILABLE",
            })
        );
    }, [library]);

    if (!library) {
        return (
            <Container sx={{ py: 10 }}>
                <Typography
                    variant="h5"
                    sx={{ fontWeight: 800 }}
                >
                    Library not found
                </Typography>
            </Container>
        );
    }

    const handleBookSeat = () => {
        if (!selectedSeat) {
            return;
        }

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/libraries/${library.id}/seats`,
                    action: "BOOK_SEAT",
                    seatId: selectedSeat.id,
                    libraryId: library.id,
                },
            });

            return;
        }

        /*
         * Booking API will be connected here.
         */
        console.log(
            "Booking:",
            selectedSeat,
            library
        );
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F8FBFF",
            }}
        >
            <Container
                maxWidth="xl"
                sx={{ py: 4 }}
            >
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() =>
                        navigate(
                            `/libraries/${library.id}`
                        )
                    }
                    sx={{
                        color: "#526B91",
                        fontWeight: 600,
                    }}
                >
                    Back to Library
                </Button>

                {/* Header */}

                <Stack
                    direction={{
                        xs: "column",
                        md: "row",
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: "flex-start",
                        md: "flex-end",
                    }}
                    spacing={2}
                    sx={{ mt: 3, mb: 4 }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "2rem",
                                    md: "2.5rem",
                                },
                                fontWeight: 800,
                                color: "#11194B",
                            }}
                        >
                            Choose Your Seat
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            {library.name} •{" "}
                            {library.area},{" "}
                            {library.city}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            px: 2,
                            py: 1.2,
                            borderRadius: 2,
                            backgroundColor: "#E8F8EF",
                            color: "#008A3E",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: 14,
                            }}
                        >
                            {library.availableSeats} seats
                            available
                        </Typography>
                    </Box>
                </Stack>

                <Grid container spacing={3}>
                    {/* ================= SEAT MAP ================= */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 8,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: {
                                    xs: 2,
                                    md: 4,
                                },
                                border:
                                    "1px solid #E1E9F3",
                                borderRadius: 3,
                            }}
                        >
                            <Stack spacing={3}>
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
                                            sx={{
                                                fontSize: 20,
                                                fontWeight: 800,
                                                color: "#11194B",
                                            }}
                                        >
                                            Seat Map
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Select an
                                            available seat
                                            to continue.
                                        </Typography>
                                    </Box>

                                    <Select
                                        size="small"
                                        value={date}
                                        onChange={(event) =>
                                            setDate(
                                                event.target
                                                    .value
                                            )
                                        }
                                        sx={{
                                            minWidth: 145,
                                        }}
                                    >
                                        <MenuItem value="Today">
                                            Today
                                        </MenuItem>

                                        <MenuItem value="Tomorrow">
                                            Tomorrow
                                        </MenuItem>

                                        <MenuItem value="Day After">
                                            Day After
                                        </MenuItem>
                                    </Select>
                                </Stack>

                                {/* Legend */}

                                <Stack
                                    direction="row"
                                    spacing={3}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    <Stack
                                        direction="row"
                                        spacing={0.7}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    "#DCFCE7",
                                                border:
                                                    "1px solid #86EFAC",
                                            }}
                                        />

                                        <Typography
                                            variant="caption"
                                        >
                                            Available
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={0.7}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    "#FEE2E2",
                                                border:
                                                    "1px solid #FCA5A5",
                                            }}
                                        />

                                        <Typography
                                            variant="caption"
                                        >
                                            Occupied
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        spacing={0.7}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    "#E8F1FF",
                                                border:
                                                    "1px solid #7EB1FF",
                                            }}
                                        />

                                        <Typography
                                            variant="caption"
                                        >
                                            Selected
                                        </Typography>
                                    </Stack>
                                </Stack>

                                {/* Entrance */}

                                <Box
                                    sx={{
                                        py: 1.2,
                                        textAlign: "center",
                                        backgroundColor:
                                            "#F1F6FD",
                                        borderRadius: 2,
                                        color: "#526B91",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 800,
                                            letterSpacing:
                                                "0.08em",
                                        }}
                                    >
                                        ENTRANCE
                                    </Typography>
                                </Box>

                                {/* Seat map */}

                                <SeatMap
                                    seats={seats}
                                    selectedSeat={
                                        selectedSeat
                                    }
                                    onSelect={
                                        setSelectedSeat
                                    }
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* ================= SUMMARY ================= */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border:
                                    "1px solid #E1E9F3",
                                borderRadius: 3,
                                position: {
                                    md: "sticky",
                                },
                                top: {
                                    md: 95,
                                },
                            }}
                        >
                            <Stack spacing={2.5}>
                                <Typography
                                    sx={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: "#11194B",
                                    }}
                                >
                                    Booking Summary
                                </Typography>

                                <Divider />

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                >
                                    <CalendarMonth
                                        sx={{
                                            color: "#146EF5",
                                        }}
                                    />

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Date
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                            }}
                                        >
                                            {date}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                >
                                    <Chair
                                        sx={{
                                            color: "#146EF5",
                                        }}
                                    />

                                    <Box>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Selected Seat
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                            }}
                                        >
                                            {selectedSeat
                                                ? selectedSeat.number
                                                : "Select a seat"}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor:
                                            "#F1F6FD",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Library
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: "#11194B",
                                        }}
                                    >
                                        {library.name}
                                    </Typography>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={
                                        !selectedSeat
                                    }
                                    onClick={
                                        handleBookSeat
                                    }
                                    startIcon={
                                        !isAuthenticated ? (
                                            <Login />
                                        ) : (
                                            <Chair />
                                        )
                                    }
                                    sx={{
                                        minHeight: 50,
                                        fontWeight: 700,
                                    }}
                                >
                                    {isAuthenticated
                                        ? "Continue Booking"
                                        : "Sign In to Book"}
                                </Button>

                                {!isAuthenticated && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        textAlign="center"
                                    >
                                        You can explore
                                        available seats
                                        without signing in.
                                        Sign in is required
                                        only when you book.
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

export default SeatAvailability;