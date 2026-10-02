import {
    ArrowBack,
    CalendarMonth,
    Chair,
    Login,
    Refresh,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import libraryApi from "../../api/libraryApi.js";



import seatApi from "../../api/seatApi.js";



import bookingApi from "../../api/bookingApi.js";



import SeatMap from "./components/SeatMap.jsx";

// ============================================================
// SEAT STATUS COLORS
// ============================================================

const SEAT_STATUS_COLORS = {
    AVAILABLE: "#2E7D32",          // 🟢
    BOOKED: "#D32F2F",             // 🔴
    RESERVED: "#1976D2",           // 🔵
    RESERVED_FOR_GIRLS: "#E91E63", // 🩷
    MAINTENANCE: "#212121",        // ⚫
};


// ============================================================
// SEAT STATUS LABELS
// ============================================================

const SEAT_STATUS_LABELS = {
    AVAILABLE: "Available",
    BOOKED: "Booked",
    RESERVED: "Reserved",
    RESERVED_FOR_GIRLS: "Reserved for Girls",
    MAINTENANCE: "Maintenance",
};


// ============================================================
// DEFAULT DATE
// ============================================================

const getToday = () => {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// ============================================================
// FORMAT DATE FOR DISPLAY
// ============================================================

const formatDisplayDate = (
    dateString
) => {

    if (!dateString) {
        return "";
    }

    const [
        year,
        month,
        day,
    ] = dateString.split("-");

    if (
        !year ||
        !month ||
        !day
    ) {
        return dateString;
    }

    return `${day}-${month}-${year}`;
};


// ============================================================
// COMPONENT
// ============================================================

function SeatAvailability() {

    const navigate = useNavigate();

    const {
        libraryId,
    } = useParams();


    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const auth =
        useSelector(
            (state) =>
                state.auth
        );

    const isAuthenticated =
        Boolean(
            auth?.isAuthenticated
        );

    const currentUser =
        auth?.user || null;


    // ========================================================
    // STATE
    // ========================================================

    const [
        library,
        setLibrary,
    ] = useState(null);

    const [
        seats,
        setSeats,
    ] = useState([]);

    const [
        selectedSeat,
        setSelectedSeat,
    ] = useState(null);

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(
        getToday()
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        bookingLoading,
        setBookingLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");


    // ========================================================
    // LOAD LIBRARY DETAILS
    // ========================================================

    const loadLibrary =
        useCallback(
            async () => {

                if (!libraryId) {

                    throw new Error(
                        "Library ID is missing."
                    );
                }

                const response =
                    await libraryApi
                        .getLibraryDetails(
                            libraryId
                        );

                setLibrary(
                    response
                );

                return response;
            },
            [
                libraryId,
            ]
        );


    // ========================================================
    // LOAD DATE-SPECIFIC SEAT AVAILABILITY
    // ========================================================

    const loadSeatAvailability =
        useCallback(
            async (
                showLoader = true
            ) => {

                if (!libraryId) {
                    return;
                }

                if (!selectedDate) {
                    return;
                }


                try {

                    if (showLoader) {

                        setLoading(
                            true
                        );

                    } else {

                        setRefreshing(
                            true
                        );
                    }

                    setError("");


                    // ------------------------------------------------
                    // DATE-SPECIFIC AVAILABILITY
                    //
                    // GET
                    // /api/libraries/{libraryId}/seat-availability
                    // ?date=YYYY-MM-DD
                    // ------------------------------------------------

                    const response =
                        await seatApi
                            .getSeatAvailability(
                                libraryId,
                                selectedDate
                            );


                    setSeats(
                        Array.isArray(
                            response
                        )
                            ? response
                            : []
                    );


                    // Selected seat may have become unavailable
                    // after changing date or refreshing.
                    setSelectedSeat(
                        (currentSeat) => {

                            if (!currentSeat) {
                                return null;
                            }

                            const updatedSeat =
                                (
                                    Array.isArray(
                                        response
                                    )
                                        ? response
                                        : []
                                ).find(
                                    (seat) =>
                                        seat.id ===
                                        currentSeat.id
                                );


                            if (
                                !updatedSeat ||
                                String(
                                    updatedSeat.status ||
                                    ""
                                ).toUpperCase() !==
                                    "AVAILABLE"
                            ) {
                                return null;
                            }

                            return updatedSeat;
                        }
                    );

                } catch (err) {

                    console.error(
                        "Failed to load seat availability:",
                        err
                    );

                    setSeats([]);

                    setSelectedSeat(
                        null
                    );

                    setError(
                        err?.response?.data?.message ||
                        err?.response?.data ||
                        "Failed to load seat availability."
                    );

                } finally {

                    if (showLoader) {

                        setLoading(
                            false
                        );

                    } else {

                        setRefreshing(
                            false
                        );
                    }
                }

            },
            [
                libraryId,
                selectedDate,
            ]
        );


    // ========================================================
    // INITIAL PAGE LOAD
    // ========================================================

    useEffect(() => {

        let mounted = true;


        const loadPage =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError("");


                    await loadLibrary();


                    if (!mounted) {
                        return;
                    }


                    await loadSeatAvailability(
                        true
                    );

                } catch (err) {

                    if (!mounted) {
                        return;
                    }

                    console.error(
                        "Failed to load seat availability page:",
                        err
                    );

                    setError(
                        err?.response?.data?.message ||
                        err?.response?.data ||
                        "Failed to load library information."
                    );

                } finally {

                    if (
                        mounted
                    ) {

                        setLoading(
                            false
                        );
                    }
                }
            };


        loadPage();


        return () => {

            mounted = false;
        };

    }, [
        libraryId,
        loadLibrary,
    ]);


    // ========================================================
    // LOAD SEATS WHEN DATE CHANGES
    // ========================================================

    useEffect(() => {

        if (!libraryId) {
            return;
        }

        loadSeatAvailability(
            false
        );

    }, [
        libraryId,
        selectedDate,
        loadSeatAvailability,
    ]);


    // ========================================================
    // DATE CHANGE
    // ========================================================

    const handleDateChange =
        (
            event
        ) => {

            const newDate =
                event.target.value;

            setSelectedDate(
                newDate
            );

            setSelectedSeat(
                null
            );

            setSuccess("");

            setError("");
        };


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh =
        async () => {

            try {

                setSuccess("");

                setError("");

                await Promise.all([
                    loadLibrary(),
                    loadSeatAvailability(
                        false
                    ),
                ]);

            } catch (err) {

                console.error(
                    "Refresh failed:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    "Failed to refresh seat availability."
                );
            }
        };


    // ========================================================
    // SELECT SEAT
    // ========================================================

    const handleSeatSelect =
        (
            seat
        ) => {

            if (!seat) {
                return;
            }


            const status =
                String(
                    seat.status || ""
                ).toUpperCase();


            // Only AVAILABLE seats
            // can be selected.

            if (
                status !==
                "AVAILABLE"
            ) {

                setSelectedSeat(
                    null
                );

                return;
            }


            setSelectedSeat(
                seat
            );

            setSuccess("");

            setError("");
        };


    // ========================================================
    // BOOK SELECTED SEAT
    // ========================================================

    const handleBookSeat =
        async () => {

            if (!selectedSeat) {

                setError(
                    "Please select an available seat."
                );

                return;
            }


            const seatStatus =
                String(
                    selectedSeat.status ||
                    ""
                ).toUpperCase();


            if (
                seatStatus !==
                "AVAILABLE"
            ) {

                setError(
                    "This seat is no longer available."
                );

                setSelectedSeat(
                    null
                );

                await loadSeatAvailability(
                    false
                );

                return;
            }


            // ------------------------------------------------
            // USER MUST BE LOGGED IN
            // ------------------------------------------------

            if (!isAuthenticated) {

                navigate(
                    "/login",
                    {
                        state: {
                            from:
                                `/libraries/${libraryId}/seats`,

                            action:
                                "BOOK_SEAT",

                            seatId:
                                selectedSeat.id,

                            libraryId:
                                libraryId,

                            date:
                                selectedDate,
                        },
                    }
                );

                return;
            }


            try {

                setBookingLoading(
                    true
                );

                setError("");

                setSuccess("");


                // ------------------------------------------------
                // BOOKING AMOUNT
                //
                // If your backend later supplies a seat price,
                // it can be used here.
                // ------------------------------------------------

                const amount =
                    Number(
                        selectedSeat.amount ??
                        selectedSeat.price ??
                        0
                    );


                const payload = {

                    seatId:
                        selectedSeat.id,

                    startDate:
                        selectedDate,

                    endDate:
                        selectedDate,

                    amount:
                        Number.isFinite(
                            amount
                        )
                            ? amount
                            : 0,
                };


                // ------------------------------------------------
                // CREATE BOOKING
                // ------------------------------------------------

                const response =
                    await bookingApi
                        .createBooking(
                            payload
                        );


                const bookingStatus =
                    String(
                        response?.status ||
                        response?.bookingStatus ||
                        "PENDING_PAYMENT"
                    ).toUpperCase();


                // ------------------------------------------------
                // BOOKING MESSAGE
                // ------------------------------------------------

                if (
                    bookingStatus ===
                    "ACTIVE"
                ) {

                    setSuccess(
                        "Seat booked successfully."
                    );

                } else {

                    setSuccess(
                        "Booking created successfully. Complete the payment to confirm your seat."
                    );
                }


                // ------------------------------------------------
                // Clear selection
                // ------------------------------------------------

                setSelectedSeat(
                    null
                );


                // ------------------------------------------------
                // IMPORTANT:
                //
                // Do NOT manually change the seat to BOOKED.
                //
                // Backend remains the source of truth.
                // ------------------------------------------------

                await loadSeatAvailability(
                    false
                );

            } catch (err) {

                console.error(
                    "Seat booking failed:",
                    err
                );


                const status =
                    err?.response?.status;


                if (
                    status === 401
                ) {

                    navigate(
                        "/login",
                        {
                            state: {
                                from:
                                    `/libraries/${libraryId}/seats`,

                                action:
                                    "BOOK_SEAT",

                                seatId:
                                    selectedSeat.id,

                                libraryId:
                                    libraryId,

                                date:
                                    selectedDate,
                            },
                        }
                    );

                    return;
                }


                setError(
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    "Unable to book this seat. Please try again."
                );


                // Another user may have booked the
                // seat after it was selected.

                await loadSeatAvailability(
                    false
                );

            } finally {

                setBookingLoading(
                    false
                );
            }
        };


    // ========================================================
    // BACK
    // ========================================================

    const handleBack =
        () => {

            navigate(-1);
        };


    // ========================================================
    // STATUS COUNTS
    // ========================================================

    const statusCounts =
        useMemo(
            () => {

                const counts = {

                    AVAILABLE: 0,

                    BOOKED: 0,

                    RESERVED: 0,

                    RESERVED_FOR_GIRLS: 0,

                    MAINTENANCE: 0,
                };


                seats.forEach(
                    (
                        seat
                    ) => {

                        const status =
                            String(
                                seat?.status ||
                                ""
                            ).toUpperCase();


                        if (
                            Object.prototype
                                .hasOwnProperty
                                .call(
                                    counts,
                                    status
                                )
                        ) {

                            counts[
                                status
                            ] += 1;
                        }
                    }
                );


                return counts;

            },
            [
                seats,
            ]
        );


    // ========================================================
    // STATUS LEGEND
    // ========================================================

    const statusLegend = [
        "AVAILABLE",
        "BOOKED",
        "RESERVED",
        "RESERVED_FOR_GIRLS",
        "MAINTENANCE",
    ].map(
        (status) => ({

            status,

            color:
                SEAT_STATUS_COLORS[
                    status
                ],

            label:
                SEAT_STATUS_LABELS[
                    status
                ],
        })
    );


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight:
                        "70vh",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",
                }}
            >

                <Stack
                    spacing={2}
                    alignItems="center"
                >

                    <CircularProgress />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Loading seat availability...
                    </Typography>

                </Stack>

            </Box>
        );
    }


    // ========================================================
    // UI
    // ========================================================

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 2.5,
            }}
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    sm: "center",
                }}
                spacing={2}
                sx={{
                    mb: 3,
                }}
            >

                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >

                    <Button
                        variant="outlined"
                        startIcon={
                            <ArrowBack />
                        }
                        onClick={
                            handleBack
                        }
                        sx={{
                            minWidth: 96,
                        }}
                    >
                        Back
                    </Button>


                    <Box>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            Seat Availability
                        </Typography>


                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {
                                library?.name ||
                                "Library"
                            }
                        </Typography>

                    </Box>

                </Stack>


                <Button
                    variant="outlined"
                    startIcon={
                        refreshing
                            ? (
                                <CircularProgress
                                    size={18}
                                />
                            )
                            : (
                                <Refresh />
                            )
                    }
                    onClick={
                        handleRefresh
                    }
                    disabled={
                        refreshing
                    }
                >
                    Refresh
                </Button>

            </Stack>


            {/* ==================================================
                ALERTS
            ================================================== */}

            {error && (

                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                    }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}


            {success && (

                <Alert
                    severity="success"
                    sx={{
                        mb: 3,
                    }}
                    onClose={() =>
                        setSuccess("")
                    }
                >
                    {success}
                </Alert>
            )}


            {/* ==================================================
                TOP INFORMATION
            ================================================== */}

            <Grid
                container
                spacing={2}
                sx={{
                    mb: 3,
                }}
            >

                {/* DATE */}

                <Grid
                    item
                    xs={12}
                    md={4}
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                            borderRadius: 2,
                            height: "100%",
                        }}
                    >

                        <Stack
                            spacing={1.5}
                        >

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >

                                <CalendarMonth
                                    sx={{
                                        fontSize: 22,
                                    }}
                                />

                                <Typography
                                    fontWeight={600}
                                >
                                    Select Date
                                </Typography>

                            </Stack>


                            <Box
                                component="input"
                                type="date"
                                value={
                                    selectedDate
                                }
                                min={
                                    getToday()
                                }
                                onChange={
                                    handleDateChange
                                }
                                sx={{
                                    width:
                                        "100%",

                                    boxSizing:
                                        "border-box",

                                    padding:
                                        "11px 12px",

                                    borderRadius:
                                        "8px",

                                    border:
                                        "1px solid #ccc",

                                    fontSize:
                                        "16px",

                                    fontFamily:
                                        "inherit",

                                    backgroundColor:
                                        "#fff",

                                    "&:focus":
                                        {
                                            outline:
                                                "none",

                                            borderColor:
                                                "#1976d2",
                                        },
                                }}
                            />


                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Showing availability for{" "}
                                {formatDisplayDate(
                                    selectedDate
                                )}
                            </Typography>

                        </Stack>

                    </Paper>

                </Grid>


                {/* LIBRARY */}

                <Grid
                    item
                    xs={12}
                    md={4}
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                            borderRadius: 2,
                            height: "100%",
                        }}
                    >

                        <Stack
                            spacing={0.75}
                        >

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Library
                            </Typography>


                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {
                                    library?.name ||
                                    "—"
                                }
                            </Typography>


                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {
                                    library?.city ||
                                    ""
                                }

                                {library?.state
                                    ? `, ${library.state}`
                                    : ""}
                            </Typography>

                        </Stack>

                    </Paper>

                </Grid>


                {/* SEAT SUMMARY */}

                <Grid
                    item
                    xs={12}
                    md={4}
                >

                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            border:
                                "1px solid",
                            borderColor:
                                "divider",
                            borderRadius: 2,
                            height: "100%",
                        }}
                    >

                        <Stack
                            spacing={0.75}
                        >

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Seat Summary
                            </Typography>


                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {
                                    seats.length
                                } Seats
                            </Typography>


                            <Typography
                                variant="body2"
                                sx={{
                                    color:
                                        SEAT_STATUS_COLORS
                                            .AVAILABLE,

                                    fontWeight:
                                        600,
                                }}
                            >
                                {
                                    statusCounts
                                        .AVAILABLE
                                }{" "}
                                available
                            </Typography>

                        </Stack>

                    </Paper>

                </Grid>

            </Grid>


            {/* ==================================================
                STATUS LEGEND
            ================================================== */}

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border:
                        "1px solid",
                    borderColor:
                        "divider",
                    borderRadius: 2,
                }}
            >

                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                        mb: 1.5,
                    }}
                >
                    Seat Status
                </Typography>


                <Box
                    sx={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        flexWrap:
                            "wrap",

                        columnGap:
                            3,

                        rowGap:
                            1.5,
                    }}
                >

                    {statusLegend.map(
                        (
                            item
                        ) => (

                            <Box
                                key={
                                    item.status
                                }
                                sx={{
                                    display:
                                        "inline-flex",

                                    alignItems:
                                        "center",

                                    gap:
                                        0.8,

                                    whiteSpace:
                                        "nowrap",
                                }}
                            >

                                {/* STATUS DOT */}

                                <Box
                                    sx={{
                                        width:
                                            18,

                                        height:
                                            18,

                                        minWidth:
                                            18,

                                        borderRadius:
                                            "50%",

                                        backgroundColor:
                                            item.color,

                                        border:
                                            item.status ===
                                            "AVAILABLE"
                                                ? "1px solid rgba(0,0,0,0.15)"
                                                : "none",
                                    }}
                                />


                                {/* LABEL */}

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            500,
                                    }}
                                >
                                    {
                                        item.label
                                    }
                                </Typography>


                                {/* COUNT */}

                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight:
                                            600,

                                        color:
                                            "text.secondary",
                                    }}
                                >
                                    (
                                    {
                                        statusCounts[
                                            item.status
                                        ] || 0
                                    }
                                    )
                                </Typography>

                            </Box>

                        )
                    )}

                </Box>

            </Paper>


            {/* ==================================================
                SEAT MAP
            ================================================== */}

            <Paper
                elevation={0}
                sx={{
                    p: {
                        xs: 1.5,
                        sm: 2,
                        md: 3,
                    },

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 2,

                    mb: 3,
                }}
            >

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        mb: 2,
                    }}
                >

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <Chair />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Seat Map
                        </Typography>

                    </Stack>


                    {refreshing && (

                        <CircularProgress
                            size={22}
                        />

                    )}

                </Stack>


                <Divider
                    sx={{
                        mb: 3,
                    }}
                />


                {seats.length === 0 ? (

                    <Box
                        sx={{
                            py: 8,
                            textAlign:
                                "center",
                        }}
                    >

                        <Chair
                            sx={{
                                fontSize: 48,
                                color:
                                    "text.disabled",

                                mb: 1,
                            }}
                        />


                        <Typography
                            variant="h6"
                            color="text.secondary"
                        >
                            No seats found
                        </Typography>


                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            There are no seats configured
                            for this library.
                        </Typography>

                    </Box>

                ) : (

                    <SeatMap
                        seats={
                            seats
                        }

                        selectedSeat={
                            selectedSeat
                        }

                        onSeatSelect={
                            handleSeatSelect
                        }

                        statusColors={
                            SEAT_STATUS_COLORS
                        }
                    />

                )}

            </Paper>


            {/* ==================================================
                BOOKING PANEL
            ================================================== */}

            <Paper
                elevation={0}
                sx={{
                    p: 3,

                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius: 2,
                }}
            >

                {!selectedSeat ? (

                    <Stack
                        spacing={1}
                        alignItems="center"
                        sx={{
                            py: 2,
                            textAlign:
                                "center",
                        }}
                    >

                        <Chair
                            sx={{
                                fontSize: 40,
                                color:
                                    "text.disabled",
                            }}
                        />


                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            Select an available seat
                        </Typography>


                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Choose a green seat from the
                            seat map to continue.
                        </Typography>

                    </Stack>

                ) : (

                    <Grid
                        container
                        spacing={3}
                        alignItems="center"
                    >

                        <Grid
                            item
                            xs={12}
                            md={8}
                        >

                            <Stack
                                spacing={1}
                            >

                                <Typography
                                    variant="overline"
                                    color="text.secondary"
                                >
                                    Selected Seat
                                </Typography>


                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    Seat{" "}
                                    {
                                        selectedSeat.seatNumber
                                    }
                                </Typography>


                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Floor:{" "}
                                    {
                                        selectedSeat.floorNumber ??
                                        "—"
                                    }
                                </Typography>


                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Seat Type:{" "}
                                    {
                                        selectedSeat.seatType ??
                                        "—"
                                    }
                                </Typography>


                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Date:{" "}
                                    {
                                        formatDisplayDate(
                                            selectedDate
                                        )
                                    }
                                </Typography>

                            </Stack>

                        </Grid>


                        <Grid
                            item
                            xs={12}
                            md={4}
                        >

                            <Stack
                                spacing={1.5}
                                alignItems={{
                                    xs:
                                        "stretch",

                                    md:
                                        "flex-end",
                                }}
                            >

                                {!isAuthenticated && (

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Please login to book
                                        this seat.
                                    </Typography>

                                )}


                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={
                                        isAuthenticated
                                            ? (
                                                <Chair />
                                            )
                                            : (
                                                <Login />
                                            )
                                    }
                                    onClick={
                                        handleBookSeat
                                    }
                                    disabled={
                                        bookingLoading ||
                                        String(
                                            selectedSeat.status ||
                                            ""
                                        ).toUpperCase() !==
                                            "AVAILABLE"
                                    }
                                    sx={{
                                        maxWidth: {
                                            md:
                                                260,
                                        },
                                    }}
                                >

                                    {bookingLoading
                                        ? (
                                            <CircularProgress
                                                size={22}
                                                color="inherit"
                                            />
                                        )
                                        : isAuthenticated
                                            ? "Book Seat"
                                            : "Login to Book"}

                                </Button>

                            </Stack>

                        </Grid>

                    </Grid>

                )}

            </Paper>

        </Container>
    );
}


export default SeatAvailability;