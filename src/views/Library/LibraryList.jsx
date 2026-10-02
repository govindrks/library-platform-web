import {
    ArrowForward,
    EventSeat,
    LocationOn,
    Search,
    Star,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Checkbox,
    CircularProgress,
    Container,
    Divider,
    FormControlLabel,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import getImageUrl from "../../utility/imageUrl";


const LibraryList = () => {

    const navigate = useNavigate();


    // =========================================================
    // LIBRARY DATA
    // =========================================================

    const [libraries, setLibraries] =
        useState([]);


    // =========================================================
    // LOADING / ERROR
    // =========================================================

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // FILTER STATE
    // =========================================================

    const [searchTerm, setSearchTerm] =
        useState("");

    const [city, setCity] =
        useState("");

    const [amenity, setAmenity] =
        useState("");

    const [availableSeatsOnly, setAvailableSeatsOnly] =
        useState(false);


    // =========================================================
    // FILTER OPTIONS
    // =========================================================

    const [cities, setCities] =
        useState([]);


    // =========================================================
    // SEARCHING STATE
    // =========================================================

    const [searching, setSearching] =
        useState(false);


    // =========================================================
    // LOAD ALL LIBRARIES
    // =========================================================

    const loadAllLibraries = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await libraryApi.getAllLibraries();

            const result =
                Array.isArray(data)
                    ? data
                    : [];

            setLibraries(result);

            /*
             * Build city options from the real
             * library data.
             *
             * We do this here because the current
             * backend does not expose a separate
             * public city-list endpoint.
             */
            const uniqueCities =
                [
                    ...new Set(
                        result
                            .map(
                                (library) =>
                                    library?.city
                            )
                            .filter(Boolean)
                    ),
                ].sort(
                    (a, b) =>
                        a.localeCompare(b)
                );

            setCities(uniqueCities);

        } catch (err) {

            console.error(
                "Failed to load libraries:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load libraries."
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadAllLibraries();

    }, []);


    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    const applyFilters = async () => {

        const trimmedSearch =
            searchTerm.trim();

        const trimmedCity =
            city.trim();

        const trimmedAmenity =
            amenity.trim();


        /*
         * Nothing selected.
         *
         * Return to the complete library list.
         */
        if (
            !trimmedSearch &&
            !trimmedCity &&
            !trimmedAmenity &&
            !availableSeatsOnly
        ) {

            await loadAllLibraries();

            return;
        }


        try {

            setSearching(true);
            setError("");


            // =================================================
            // SEARCH BY NAME
            // =================================================

            if (trimmedSearch) {

                let results =
                    await libraryApi.searchByName(
                        trimmedSearch
                    );

                /*
                 * The backend name search handles
                 * the name condition.
                 *
                 * Additional filters are applied
                 * locally to those results because
                 * there is no combined name + city
                 * endpoint.
                 */

                if (trimmedCity) {

                    results =
                        results.filter(
                            (library) =>
                                library?.city
                                    ?.toLowerCase()
                                    ===
                                trimmedCity
                                    .toLowerCase()
                        );
                }


                if (trimmedAmenity) {

                    /*
                     * The current search-by-name endpoint
                     * does not return amenity information.
                     *
                     * Therefore use the dedicated
                     * amenity endpoint when amenity is
                     * selected instead.
                     */
                    results =
                        await libraryApi
                            .searchByAmenity(
                                trimmedAmenity
                            );

                    if (trimmedSearch) {

                        results =
                            results.filter(
                                (library) =>
                                    library?.name
                                        ?.toLowerCase()
                                        .includes(
                                            trimmedSearch
                                                .toLowerCase()
                                        )
                            );
                    }

                    if (trimmedCity) {

                        results =
                            results.filter(
                                (library) =>
                                    library?.city
                                        ?.toLowerCase()
                                        ===
                                    trimmedCity
                                        .toLowerCase()
                            );
                    }
                }


                /*
                 * Available-seat filter.
                 *
                 * The discovery response already
                 * contains availableSeats, so we can
                 * filter these results locally.
                 */
                if (availableSeatsOnly) {

                    results =
                        results.filter(
                            (library) =>
                                Number(
                                    library?.availableSeats
                                ) > 0
                        );
                }


                setLibraries(
                    Array.isArray(results)
                        ? results
                        : []
                );

                return;
            }


            // =================================================
            // CITY + AMENITY
            // =================================================

            if (
                trimmedCity &&
                trimmedAmenity
            ) {

                let results =
                    await libraryApi
                        .searchByAmenity(
                            trimmedAmenity
                        );


                results =
                    results.filter(
                        (library) =>
                            library?.city
                                ?.toLowerCase()
                                ===
                            trimmedCity
                                .toLowerCase()
                    );


                if (availableSeatsOnly) {

                    results =
                        results.filter(
                            (library) =>
                                Number(
                                    library?.availableSeats
                                ) > 0
                        );
                }


                setLibraries(
                    Array.isArray(results)
                        ? results
                        : []
                );

                return;
            }


            // =================================================
            // CITY ONLY
            // =================================================

            if (trimmedCity) {

                let results =
                    await libraryApi.searchByCity(
                        trimmedCity
                    );


                if (availableSeatsOnly) {

                    results =
                        results.filter(
                            (library) =>
                                Number(
                                    library?.availableSeats
                                ) > 0
                        );
                }


                setLibraries(
                    Array.isArray(results)
                        ? results
                        : []
                );

                return;
            }


            // =================================================
            // AMENITY ONLY
            // =================================================

            if (trimmedAmenity) {

                let results =
                    await libraryApi
                        .searchByAmenity(
                            trimmedAmenity
                        );


                if (availableSeatsOnly) {

                    results =
                        results.filter(
                            (library) =>
                                Number(
                                    library?.availableSeats
                                ) > 0
                        );
                }


                setLibraries(
                    Array.isArray(results)
                        ? results
                        : []
                );

                return;
            }


            // =================================================
            // AVAILABLE SEATS ONLY
            // =================================================

            if (availableSeatsOnly) {

                const results =
                    await libraryApi.filterLibraries({
                        availableSeats: true,
                    });


                setLibraries(
                    Array.isArray(results)
                        ? results
                        : []
                );
            }

        } catch (err) {

            console.error(
                "Failed to search/filter libraries:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to search libraries."
            );

        } finally {

            setSearching(false);
        }
    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = async () => {

        setSearchTerm("");
        setCity("");
        setAmenity("");
        setAvailableSeatsOnly(false);

        await loadAllLibraries();
    };


    // =========================================================
    // VIEW LIBRARY
    // =========================================================

    const handleViewLibrary = (
        libraryId
    ) => {

        if (!libraryId) {
            return;
        }

        navigate(
            `/libraries/${libraryId}`
        );
    };


    // =========================================================
    // SEARCH SUMMARY
    // =========================================================

    const hasActiveFilters =
        Boolean(
            searchTerm.trim() ||
            city.trim() ||
            amenity.trim() ||
            availableSeatsOnly
        );


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F8FBFF",
                py: {
                    xs: 3,
                    md: 5,
                },
            }}
        >

            <Container maxWidth="xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <Box sx={{ mb: 4 }}>

                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: "#11194B",
                            fontSize: {
                                xs: "2rem",
                                md: "2.5rem",
                            },
                        }}
                    >
                        Find Your Library
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Discover libraries, explore
                        amenities, and find available
                        study spaces.
                    </Typography>

                </Box>


                {/* =================================================
                    SEARCH / FILTER BAR
                ================================================= */}

                <Card
                    sx={{
                        borderRadius: 3,
                        mb: 4,
                    }}
                >

                    <CardContent sx={{ p: 3 }}>

                        <Stack
                            direction={{
                                xs: "column",
                                md: "row",
                            }}
                            spacing={2}
                        >

                            {/* SEARCH */}

                            <TextField
                                fullWidth
                                label="Library name"
                                placeholder="Search by library name"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment
                                            position="start"
                                        >
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                            />


                            {/* CITY */}

                            <TextField
                                select
                                fullWidth
                                label="City"
                                value={city}
                                onChange={(event) =>
                                    setCity(
                                        event.target.value
                                    )
                                }
                                SelectProps={{
                                    native: true,
                                }}
                            >

                                <option value="">
                                    All cities
                                </option>

                                {cities.map(
                                    (cityName) => (
                                        <option
                                            key={
                                                cityName
                                            }
                                            value={
                                                cityName
                                            }
                                        >
                                            {cityName}
                                        </option>
                                    )
                                )}

                            </TextField>


                            {/* AMENITY */}

                            <TextField
                                fullWidth
                                label="Amenity"
                                placeholder="e.g. WiFi, AC"
                                value={amenity}
                                onChange={(event) =>
                                    setAmenity(
                                        event.target.value
                                    )
                                }
                            />

                        </Stack>


                        {/* SECOND FILTER ROW */}

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
                            sx={{ mt: 2 }}
                        >

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            availableSeatsOnly
                                        }
                                        onChange={(event) =>
                                            setAvailableSeatsOnly(
                                                event.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Show only libraries with available seats"
                            />


                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1.5}
                            >

                                <Button
                                    variant="contained"
                                    startIcon={
                                        searching ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <Search />
                                        )
                                    }
                                    onClick={
                                        applyFilters
                                    }
                                    disabled={
                                        searching
                                    }
                                >
                                    {searching
                                        ? "Searching..."
                                        : "Search"}
                                </Button>


                                {hasActiveFilters && (

                                    <Button
                                        variant="outlined"
                                        onClick={
                                            clearFilters
                                        }
                                        disabled={
                                            searching
                                        }
                                    >
                                        Clear Filters
                                    </Button>

                                )}

                            </Stack>

                        </Stack>

                    </CardContent>

                </Card>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        onClose={() =>
                            setError("")
                        }
                    >
                        {error}
                    </Alert>

                )}


                {/* =================================================
                    RESULTS HEADER
                ================================================= */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {libraries.length}{" "}
                        {libraries.length === 1
                            ? "Library"
                            : "Libraries"}
                    </Typography>

                    {hasActiveFilters && (

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Filtered results
                        </Typography>

                    )}

                </Stack>


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {!loading &&
                    libraries.length === 0 && (

                        <Card
                            sx={{
                                borderRadius: 3,
                            }}
                        >

                            <CardContent
                                sx={{
                                    py: 8,
                                    textAlign: "center",
                                }}
                            >

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    No libraries found
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    Try changing your
                                    search or filters.
                                </Typography>

                                <Button
                                    variant="outlined"
                                    sx={{ mt: 3 }}
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear Filters
                                </Button>

                            </CardContent>

                        </Card>

                    )}


                {/* =================================================
                    LIBRARY GRID
                ================================================= */}

                {libraries.length > 0 && (

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                lg: "repeat(3, 1fr)",
                            },
                            gap: 3,
                        }}
                    >

                        {libraries.map(
                            (library) => {

                                const imageUrl =
                                    library.coverImageUrl
                                        ? getImageUrl(
                                            library.coverImageUrl
                                        )
                                        : null;


                                const availableSeats =
                                    Number(
                                        library.availableSeats
                                    ) || 0;


                                const totalSeats =
                                    Number(
                                        library.totalSeats
                                    ) || 0;


                                return (

                                    <Card
                                        key={
                                            library.id
                                        }
                                        sx={{
                                            borderRadius: 3,
                                            overflow:
                                                "hidden",
                                            height:
                                                "100%",
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            transition:
                                                "transform 0.2s ease, box-shadow 0.2s ease",
                                            "&:hover": {
                                                transform:
                                                    "translateY(-4px)",
                                                boxShadow:
                                                    6,
                                            },
                                        }}
                                    >

                                        {/* =============================================
                                            COVER IMAGE
                                        ============================================== */}

                                        {imageUrl ? (

                                            <CardMedia
                                                component="img"
                                                height="210"
                                                image={
                                                    imageUrl
                                                }
                                                alt={
                                                    library.name ||
                                                    "Library"
                                                }
                                                sx={{
                                                    objectFit:
                                                        "cover",
                                                }}
                                            />

                                        ) : (

                                            <Box
                                                sx={{
                                                    height: 210,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    backgroundColor:
                                                        "#E9EEF5",
                                                }}
                                            >

                                                <Typography
                                                    color="text.secondary"
                                                >
                                                    No cover image
                                                </Typography>

                                            </Box>

                                        )}


                                        {/* =============================================
                                            CONTENT
                                        ============================================== */}

                                        <CardContent
                                            sx={{
                                                p: 2.5,
                                                flex: 1,
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                            }}
                                        >

                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    color:
                                                        "#11194B",
                                                }}
                                            >
                                                {
                                                    library.name
                                                }
                                            </Typography>


                                            {/* CITY */}

                                            <Stack
                                                direction="row"
                                                spacing={0.7}
                                                alignItems="center"
                                                sx={{ mt: 1 }}
                                            >

                                                <LocationOn
                                                    sx={{
                                                        fontSize: 18,
                                                        color:
                                                            "text.secondary",
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        library.city ||
                                                        "Location unavailable"
                                                    }
                                                </Typography>

                                            </Stack>


                                            {/* RATING */}

                                            <Stack
                                                direction="row"
                                                spacing={0.7}
                                                alignItems="center"
                                                sx={{ mt: 1.5 }}
                                            >

                                                <Star
                                                    sx={{
                                                        fontSize: 19,
                                                        color:
                                                            "#F59E0B",
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                >
                                                    {library.averageRating !=
                                                    null
                                                        ? Number(
                                                            library.averageRating
                                                        ).toFixed(1)
                                                        : "0.0"}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    (
                                                    {
                                                        library.reviewCount ??
                                                        0
                                                    }{" "}
                                                    reviews)
                                                </Typography>

                                            </Stack>


                                            <Divider
                                                sx={{
                                                    my: 2,
                                                }}
                                            />


                                            {/* SEATS */}

                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Available seats
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    fontWeight={700}
                                                    color={
                                                        availableSeats >
                                                        0
                                                            ? "success.main"
                                                            : "error.main"
                                                    }
                                                >
                                                    {
                                                        availableSeats
                                                    }
                                                    {" / "}
                                                    {
                                                        totalSeats
                                                    }
                                                </Typography>

                                            </Stack>


                                            {/* SPACER */}

                                            <Box
                                                sx={{
                                                    flex: 1,
                                                }}
                                            />


                                            {/* DETAILS */}

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                endIcon={
                                                    <ArrowForward />
                                                }
                                                sx={{
                                                    mt: 3,
                                                    borderRadius: 2,
                                                }}
                                                onClick={() =>
                                                    handleViewLibrary(
                                                        library.id
                                                    )
                                                }
                                            >
                                                View Library
                                            </Button>

                                        </CardContent>

                                    </Card>
                                );
                            }
                        )}

                    </Box>

                )}

            </Container>

        </Box>
    );
};


export default LibraryList;