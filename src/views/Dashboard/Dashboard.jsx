import {
    Alert,
    Box,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import {
    CalendarMonth,
} from "@mui/icons-material";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    useSelector,
} from "react-redux";

import PageHeader from "../Common/Components/PageHeader";

import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RevenueChart from "./components/RevenueChart";
import OccupancyCard from "./components/OccupancyCard";
import BookingOverview from "./components/BookingOverview";
import RecentBookings from "./components/RecentBookings";
import RecentPayments from "./components/RecentPayments";
import RecentActivity from "./components/RecentActivity";

import libraryApi from "../../api/libraryApi";
import dashboardApi from "../../api/dashboardApi";


// ============================================================
// HELPERS
// ============================================================

const getGreeting = () => {

    const hour =
        new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
};


const formatToday = () => {

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            weekday: "short",
        }
    ).format(
        new Date()
    );
};


// ============================================================
// COMPONENT
// ============================================================

function Dashboard() {

    // ========================================================
    // AUTHENTICATED USER
    // ========================================================

    const user = useSelector(
        (state) =>
            state.auth?.user
    );


    const userName =
        user?.fullName?.trim() ||
        "User";


    // ========================================================
    // STATE
    // ========================================================

    const [
        library,
        setLibrary,
    ] = useState(null);


    const [
        dashboardData,
        setDashboardData,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    // ========================================================
    // DERIVED DATA
    // ========================================================

    const statistics =
        dashboardData
            ?.overview
            ?.statistics ||
        null;


    const activity =
        dashboardData
            ?.activity ||
        null;


    const analytics =
        dashboardData
            ?.analytics ||
        null;


    const actions =
        dashboardData
            ?.actions ||
        null;


    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    const loadDashboard = async () => {
    try {
        setLoading(true);
        setError("");

        const libraries = await libraryApi.getMyLibraries();

        if (!Array.isArray(libraries) || libraries.length === 0) {
            setLibrary(null);
            setDashboardData(null);
            setError("No library is associated with your account.");
            return;
        }

        const selectedLibrary = libraries[0];

        if (!selectedLibrary?.id) {
            setLibrary(null);
            setDashboardData(null);
            setError("Library ID was not returned by the server.");
            return;
        }

        setLibrary(selectedLibrary);

        const data = await dashboardApi.getDashboard(
            selectedLibrary.id
        );

        setDashboardData(data);

    } catch (err) {

        const status = err?.response?.status;

        if (status === 401) {
            setError(
                "Your session has expired. Please log in again."
            );
            return;
        }

        if (status === 403) {
            setError(
                "You are not authorized to access your library dashboard."
            );
            return;
        }

        setError(
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard."
        );

    } finally {
        setLoading(false);
    }
};


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // ========================================================
    // GREETING
    // ========================================================

    const greeting =
        useMemo(
            () =>
                getGreeting(),
            []
        );


    const today =
        useMemo(
            () =>
                formatToday(),
            []
        );


    // ========================================================
    // LOADING STATE
    // ========================================================

    if (loading) {

        return (
            <Stack
                spacing={3}
                sx={{
                    width: "100%",
                }}
            >

                <PageHeader
                    title="Owner Dashboard"
                />


                <Box
                    sx={{
                        minHeight: 300,

                        display:
                            "flex",

                        alignItems:
                            "center",

                        justifyContent:
                            "center",
                    }}
                >

                    <CircularProgress />

                </Box>

            </Stack>
        );
    }


    // ========================================================
    // DASHBOARD
    // ========================================================

    return (
        <Stack
            spacing={2}
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >

            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <PageHeader
                title="Owner Dashboard"
            />


            {/* =================================================
                GREETING CARD
            ================================================= */}

            <Box
                sx={{
                    width: "100%",

                    display:
                        "flex",

                    alignItems: {
                        xs: "flex-start",
                        md: "center",
                    },

                    justifyContent:
                        "space-between",

                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },

                    gap: 2,

                    px: {
                        xs: 2,
                        sm: 2.5,
                        md: 3,
                    },

                    py: {
                        xs: 2,
                        md: 2.25,
                    },

                    borderRadius: 2,

                    border:
                        "1px solid",

                    borderColor:
                        "#BBDEFB",

                    background:
                        "linear-gradient(90deg, #EEF8FF 0%, #F7FBFF 100%)",
                }}
            >

                {/* Greeting */}

                <Box
                    sx={{
                        minWidth: 0,
                    }}
                >

                    <Typography
                        sx={{
                            fontSize: {
                                xs: 24,
                                sm: 28,
                                md: 30,
                            },

                            lineHeight:
                                1.2,

                            fontWeight:
                                800,

                            color:
                                "#111B63",
                        }}
                    >
                        {greeting},{" "}
                        {userName} 👋
                    </Typography>


                    <Typography
                        sx={{
                            mt: 0.5,

                            fontSize: {
                                xs: 14,
                                md: 16,
                            },

                            color:
                                "#173B82",
                        }}
                    >
                        Here's what's happening
                        {library?.name
                            ? ` at ${library.name}`
                            : " in your library"}{" "}
                        today.
                    </Typography>

                </Box>


                {/* Date */}

                <Box
                    sx={{
                        display:
                            "flex",

                        alignItems:
                            "center",

                        gap: 1.5,

                        minWidth: {
                            xs: "100%",
                            md: 185,
                        },

                        px: 2,

                        py: 1.25,

                        borderRadius: 2,

                        backgroundColor:
                            "rgba(255,255,255,0.85)",

                        border:
                            "1px solid",

                        borderColor:
                            "#C5DCF8",
                    }}
                >

                    <CalendarMonth
                        sx={{
                            color:
                                "#183B78",
                        }}
                    />

                    <Box>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Today
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight:
                                    700,

                                color:
                                    "#173B82",
                            }}
                        >
                            {today}
                        </Typography>

                    </Box>

                </Box>

            </Box>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <Alert
                    severity="error"
                    action={
                        <Box
                            component="button"
                            onClick={
                                loadDashboard
                            }
                            sx={{
                                border: 0,
                                background:
                                    "transparent",
                                cursor:
                                    "pointer",
                                fontWeight:
                                    600,
                            }}
                        >
                            Retry
                        </Box>
                    }
                >
                    {error}
                </Alert>
            )}


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            {!error && (
                <QuickActions
                    actions={
                        actions?.quickActions
                    }
                />
            )}


            {/* =================================================
                DASHBOARD STATISTICS
            ================================================= */}

            {!error && (
                <DashboardStats
                    statistics={
                        statistics
                    }
                />
            )}


            {/* =================================================
                REVENUE + OCCUPANCY
            ================================================= */}

            {!error && (
                <Grid
                    container
                    spacing={2}
                >

                    <Grid
                        size={{
                            xs: 12,
                            lg: 8,
                        }}
                    >

                        <RevenueChart
                            analytics={
                                analytics
                            }
                        />

                    </Grid>


                    <Grid
                        size={{
                            xs: 12,
                            lg: 4,
                        }}
                    >

                        <OccupancyCard
                            statistics={
                                statistics
                            }
                        />

                    </Grid>

                </Grid>
            )}


            {/* =================================================
                BOOKING OVERVIEW
            ================================================= */}

            {!error && (
                <BookingOverview
                    statistics={
                        statistics
                    }
                />
            )}


            {/* =================================================
                RECENT BOOKINGS
            ================================================= */}

            {!error && (
                <RecentBookings
                    bookings={
                        activity?.recentBookings
                    }
                />
            )}


            {/* =================================================
                PAYMENTS + ACTIVITY
            ================================================= */}

            {!error && (
                <Grid
                    container
                    spacing={2}
                >

                    <Grid
                        size={{
                            xs: 12,
                            lg: 7,
                        }}
                    >

                        <RecentPayments
                            payments={
                                activity?.recentPayments
                            }
                        />

                    </Grid>


                    <Grid
                        size={{
                            xs: 12,
                            lg: 5,
                        }}
                    >

                        <RecentActivity
                            activities={
                                activity?.recentActivities
                            }
                        />

                    </Grid>

                </Grid>
            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <Box
                sx={{
                    pb: 2,
                    pt: 1,
                }}
            >

                <Typography
                    variant="caption"
                    color="text.disabled"
                >
                    LibraryHub Management Platform
                </Typography>

            </Box>

        </Stack>
    );
}


export default Dashboard;