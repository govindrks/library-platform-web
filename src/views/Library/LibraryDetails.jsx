import {
    AccessTime,
    ArrowBack,
    Email,
    EventSeat,
    LocationOn,
    Phone,
    Star,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    ImageList,
    ImageListItem,
    Link,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import getImageUrl from "../../utility/imageUrl";


const emptyLibrary = {
    id: null,
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    contactNumber: "",
    email: "",
    latitude: null,
    longitude: null,
    openingTime: "",
    closingTime: "",
    totalSeats: 0,
    availableSeats: 0,
    coverImageUrl: "",
    amenities: [],
    images: [],
};


const LibraryDetails = () => {

    const { libraryId } = useParams();

    const navigate = useNavigate();


    const [library, setLibrary] =
        useState(emptyLibrary);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================================================
    // LOAD LIBRARY DETAILS
    // =========================================================

    const loadLibraryDetails = async () => {

        if (!libraryId) {

            setError(
                "Library ID is missing."
            );

            setLoading(false);

            return;
        }

        try {

            setLoading(true);
            setError("");

            const data =
                await libraryApi.getLibraryDetails(
                    libraryId
                );

            setLibrary({
                ...emptyLibrary,
                ...(data || {}),
                amenities:
                    data?.amenities || [],
                images:
                    data?.images || [],
            });

        } catch (err) {

            console.error(
                "Failed to load library details:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load library details."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadLibraryDetails();

    }, [libraryId]);


    // =========================================================
    // LOADING STATE
    // =========================================================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Stack
                    alignItems="center"
                    spacing={2}
                >
                    <CircularProgress />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Loading library details...
                    </Typography>
                </Stack>
            </Box>
        );
    }


    // =========================================================
    // ERROR STATE
    // =========================================================

    if (error) {

        return (
            <Container
                maxWidth="lg"
                sx={{ py: 5 }}
            >

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>

                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </Button>

            </Container>
        );
    }


    // =========================================================
    // COVER IMAGE
    // =========================================================

    const coverImage =
        library.coverImageUrl
            ? getImageUrl(
                library.coverImageUrl
            )
            : null;


    // =========================================================
    // GALLERY IMAGES
    // =========================================================

    const galleryImages =
        Array.isArray(library.images)
            ? library.images
            : [];


    // =========================================================
    // AVAILABLE SEAT PERCENTAGE
    // =========================================================

    const totalSeats =
        Number(library.totalSeats) || 0;

    const availableSeats =
        Number(library.availableSeats) || 0;

    const occupancyPercentage =
        totalSeats > 0
            ? Math.round(
                ((totalSeats - availableSeats) /
                    totalSeats) *
                    100
            )
            : 0;


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box
            sx={{
                backgroundColor: "#f7f8fa",
                minHeight: "100vh",
                py: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            <Container maxWidth="lg">

                {/* =================================================
                    BREADCRUMBS
                ================================================= */}

                <Breadcrumbs
                    sx={{ mb: 3 }}
                >

                    <Link
                        component="button"
                        underline="hover"
                        color="inherit"
                        onClick={() =>
                            navigate("/libraries")
                        }
                    >
                        Libraries
                    </Link>

                    <Typography
                        color="text.primary"
                    >
                        {library.name}
                    </Typography>

                </Breadcrumbs>


                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <Button
                    variant="text"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2 }}
                >
                    Back
                </Button>


                {/* =================================================
                    HERO / COVER
                ================================================= */}

                <Card
                    sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                        mb: 3,
                    }}
                >

                    <Box
                        sx={{
                            position: "relative",
                            height: {
                                xs: 240,
                                sm: 320,
                                md: 420,
                            },
                            backgroundColor:
                                "#e9ecef",
                        }}
                    >

                        {coverImage ? (

                            <Box
                                component="img"
                                src={coverImage}
                                alt={library.name}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />

                        ) : (

                            <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >

                                <Typography
                                    color="text.secondary"
                                >
                                    No cover image available
                                </Typography>

                            </Box>
                        )}


                        {/* IMAGE OVERLAY */}

                        <Box
                            sx={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                bottom: 0,
                                p: {
                                    xs: 2,
                                    md: 4,
                                },
                                background:
                                    "linear-gradient(transparent, rgba(0,0,0,0.8))",
                            }}
                        >

                            <Typography
                                variant="h3"
                                sx={{
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: {
                                        xs: "1.8rem",
                                        md: "2.5rem",
                                    },
                                }}
                            >
                                {library.name}
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mt: 1 }}
                            >

                                <LocationOn
                                    sx={{
                                        color: "#fff",
                                        fontSize: 20,
                                    }}
                                />

                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#fff",
                                    }}
                                >
                                    {[
                                        library.city,
                                        library.state,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Typography>

                            </Stack>

                        </Box>

                    </Box>

                </Card>


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <Grid
                    container
                    spacing={3}
                >

                    {/* =================================================
                        LEFT COLUMN
                    ================================================= */}

                    <Grid
                        item
                        xs={12}
                        md={8}
                    >

                        {/* ABOUT */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mb={2}
                                >
                                    About the Library
                                </Typography>

                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        lineHeight: 1.8,
                                        whiteSpace:
                                            "pre-line",
                                    }}
                                >
                                    {library.description ||
                                        "No description available for this library."}
                                </Typography>

                            </CardContent>

                        </Card>


                        {/* =================================================
                            SEAT INFORMATION
                        ================================================= */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mb={3}
                                >
                                    Seat Availability
                                </Typography>


                                <Grid
                                    container
                                    spacing={2}
                                >

                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                height: "100%",
                                            }}
                                        >

                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="center"
                                            >

                                                <EventSeat />

                                                <Box>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Total Seats
                                                    </Typography>

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight={700}
                                                    >
                                                        {totalSeats}
                                                    </Typography>

                                                </Box>

                                            </Stack>

                                        </Paper>

                                    </Grid>


                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                height: "100%",
                                            }}
                                        >

                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="center"
                                            >

                                                <EventSeat />

                                                <Box>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Available Seats
                                                    </Typography>

                                                    <Typography
                                                        variant="h5"
                                                        fontWeight={700}
                                                        color={
                                                            availableSeats > 0
                                                                ? "success.main"
                                                                : "error.main"
                                                        }
                                                    >
                                                        {availableSeats}
                                                    </Typography>

                                                </Box>

                                            </Stack>

                                        </Paper>

                                    </Grid>


                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >

                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                height: "100%",
                                            }}
                                        >

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Occupancy
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {occupancyPercentage}%
                                            </Typography>

                                        </Paper>

                                    </Grid>

                                </Grid>

                            </CardContent>

                        </Card>


                        {/* =================================================
                            AMENITIES
                        ================================================= */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mb={2}
                                >
                                    Amenities
                                </Typography>


                                {library.amenities.length > 0 ? (

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                    >

                                        {library.amenities.map(
                                            (amenity, index) => (

                                                <Chip
                                                    key={`${amenity}-${index}`}
                                                    label={amenity}
                                                    variant="outlined"
                                                />

                                            )
                                        )}

                                    </Stack>

                                ) : (

                                    <Typography
                                        color="text.secondary"
                                    >
                                        No amenities listed.
                                    </Typography>

                                )}

                            </CardContent>

                        </Card>


                        {/* =================================================
                            GALLERY
                        ================================================= */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    mb={3}
                                >
                                    Library Gallery
                                </Typography>


                                {galleryImages.length > 0 ? (

                                    <ImageList
                                        cols={{
                                            xs: 1,
                                            sm: 2,
                                            md: 3,
                                        }}
                                        gap={12}
                                    >

                                        {galleryImages.map(
                                            (image) => (

                                                <ImageListItem
                                                    key={image.id}
                                                    sx={{
                                                        borderRadius: 2,
                                                        overflow:
                                                            "hidden",
                                                    }}
                                                >

                                                    <Box
                                                        component="img"
                                                        src={getImageUrl(
                                                            image.imageUrl
                                                        )}
                                                        alt={
                                                            image.imageType ||
                                                            library.name
                                                        }
                                                        loading="lazy"
                                                        sx={{
                                                            width: "100%",
                                                            height: 200,
                                                            objectFit:
                                                                "cover",
                                                            display:
                                                                "block",
                                                        }}
                                                    />

                                                </ImageListItem>

                                            )
                                        )}

                                    </ImageList>

                                ) : (

                                    <Box
                                        sx={{
                                            py: 5,
                                            textAlign:
                                                "center",
                                            border:
                                                "1px dashed",
                                            borderColor:
                                                "divider",
                                            borderRadius: 2,
                                        }}
                                    >

                                        <Typography
                                            color="text.secondary"
                                        >
                                            No gallery images available.
                                        </Typography>

                                    </Box>

                                )}

                            </CardContent>

                        </Card>

                    </Grid>


                    {/* =================================================
                        RIGHT COLUMN
                    ================================================= */}

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >

                        {/* =================================================
                            LIBRARY SUMMARY
                        ================================================= */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    mb={2}
                                >
                                    Library Information
                                </Typography>


                                <Stack spacing={2.5}>

                                    {/* LOCATION */}

                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                    >

                                        <LocationOn
                                            color="primary"
                                        />

                                        <Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Address
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                fontWeight={500}
                                            >
                                                {[
                                                    library.address,
                                                    library.city,
                                                    library.state,
                                                    library.pincode,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") ||
                                                    "Not available"}
                                            </Typography>

                                        </Box>

                                    </Stack>


                                    <Divider />


                                    {/* OPENING HOURS */}

                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                    >

                                        <AccessTime
                                            color="primary"
                                        />

                                        <Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Opening Hours
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                fontWeight={500}
                                            >
                                                {library.openingTime &&
                                                library.closingTime
                                                    ? `${library.openingTime} - ${library.closingTime}`
                                                    : "Not available"}
                                            </Typography>

                                        </Box>

                                    </Stack>


                                    <Divider />


                                    {/* PHONE */}

                                    {library.contactNumber && (

                                        <>
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                            >

                                                <Phone
                                                    color="primary"
                                                />

                                                <Box>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        Contact
                                                    </Typography>

                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={500}
                                                    >
                                                        {
                                                            library.contactNumber
                                                        }
                                                    </Typography>

                                                </Box>

                                            </Stack>

                                            <Divider />
                                        </>

                                    )}


                                    {/* EMAIL */}

                                    {library.email && (

                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                        >

                                            <Email
                                                color="primary"
                                            />

                                            <Box>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Email
                                                </Typography>

                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                    sx={{
                                                        wordBreak:
                                                            "break-word",
                                                    }}
                                                >
                                                    {library.email}
                                                </Typography>

                                            </Box>

                                        </Stack>

                                    )}

                                </Stack>

                            </CardContent>

                        </Card>


                        {/* =================================================
                            RATING / STATUS
                        ================================================= */}

                        <Card
                            sx={{
                                borderRadius: 3,
                                mb: 3,
                            }}
                        >

                            <CardContent
                                sx={{ p: 3 }}
                            >

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    mb={2}
                                >
                                    Library Status
                                </Typography>


                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >

                                    <Chip
                                        icon={<Star />}
                                        label="Library"
                                        color="primary"
                                        variant="outlined"
                                    />

                                </Stack>

                            </CardContent>

                        </Card>


                        {/* =================================================
                            LOCATION
                        ================================================= */}

                        {library.latitude !== null &&
                            library.longitude !== null && (

                                <Card
                                    sx={{
                                        borderRadius: 3,
                                    }}
                                >

                                    <CardContent
                                        sx={{ p: 3 }}
                                    >

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                            mb={2}
                                        >
                                            Location
                                        </Typography>


                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            mb={2}
                                        >
                                            Coordinates
                                        </Typography>


                                        <Typography
                                            variant="body2"
                                        >
                                            Latitude:{" "}
                                            {library.latitude}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                        >
                                            Longitude:{" "}
                                            {library.longitude}
                                        </Typography>

                                    </CardContent>

                                </Card>

                            )}

                    </Grid>

                </Grid>

            </Container>

        </Box>
    );
};


export default LibraryDetails;