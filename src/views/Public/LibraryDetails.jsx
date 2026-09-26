import {
    AccessTime,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    Chair,
    Email,
    LocationOn,
    Phone,
    Star,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Chip,
    Container,
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import libraries from "./data/libraryData";

const membershipPlans = [
    {
        id: 1,
        name: "Daily Pass",
        price: 80,
        period: "day",
        description: "Perfect for occasional study sessions.",
        features: [
            "Full-day seat access",
            "Wi-Fi",
            "AC",
        ],
    },
    {
        id: 2,
        name: "Monthly",
        price: 1800,
        period: "month",
        description: "Ideal for regular students and professionals.",
        features: [
            "Dedicated study access",
            "Wi-Fi",
            "AC",
            "Reading area",
        ],
        popular: true,
    },
    {
        id: 3,
        name: "Quarterly",
        price: 4800,
        period: "3 months",
        description: "Save more with a longer membership.",
        features: [
            "Priority booking",
            "Wi-Fi",
            "AC",
            "Locker access",
        ],
    },
];

function LibraryDetails() {
    const { libraryId } = useParams();
    const navigate = useNavigate();

    const library = libraries.find(
        (item) => item.id === Number(libraryId)
    );

    if (!library) {
        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#F8FBFF",
                }}
            >
                <Stack
                    spacing={2}
                    alignItems="center"
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 800 }}
                    >
                        Library not found
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={() =>
                            navigate("/libraries")
                        }
                    >
                        Back to Libraries
                    </Button>
                </Stack>
            </Box>
        );
    }

    const availabilityPercentage =
        Math.round(
            (library.availableSeats /
                library.totalSeats) *
                100
        );

    return (
        <Box
            sx={{
                backgroundColor: "#F8FBFF",
                minHeight: "100vh",
            }}
        >
            {/* =====================================================
                BACK BUTTON
            ====================================================== */}

            <Container
                maxWidth="xl"
                sx={{ pt: 3 }}
            >
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() =>
                        navigate("/libraries")
                    }
                    sx={{
                        color: "#526B91",
                        fontWeight: 600,
                    }}
                >
                    Back to Libraries
                </Button>
            </Container>

            {/* =====================================================
                HERO
            ====================================================== */}

            <Container
                maxWidth="xl"
                sx={{ py: 3 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                        border: "1px solid #E1E9F3",
                        backgroundColor: "#FFFFFF",
                    }}
                >
                    <Grid container>
                        {/* Image */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Box
                                sx={{
                                    height: {
                                        xs: 300,
                                        md: 430,
                                    },
                                    position: "relative",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={library.image}
                                    alt={library.name}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />

                                <Chip
                                    label={
                                        library.status ===
                                        "OPEN"
                                            ? "Open Now"
                                            : "Closed"
                                    }
                                    sx={{
                                        position:
                                            "absolute",
                                        top: 20,
                                        left: 20,
                                        backgroundColor:
                                            library.status ===
                                            "OPEN"
                                                ? "#D8F9E4"
                                                : "#FEE2E2",
                                        color:
                                            library.status ===
                                            "OPEN"
                                                ? "#008A3E"
                                                : "#B91C1C",
                                        fontWeight: 800,
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Information */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Stack
                                spacing={2.5}
                                sx={{
                                    p: {
                                        xs: 3,
                                        md: 5,
                                    },
                                    height: "100%",
                                    justifyContent:
                                        "center",
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: "#146EF5",
                                        fontSize: 14,
                                        fontWeight: 800,
                                        textTransform:
                                            "uppercase",
                                        letterSpacing:
                                            "0.08em",
                                    }}
                                >
                                    Study Space
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: {
                                            xs: "2rem",
                                            md: "2.8rem",
                                        },
                                        lineHeight: 1.1,
                                        fontWeight: 800,
                                        color: "#11194B",
                                        letterSpacing:
                                            "-0.03em",
                                    }}
                                >
                                    {library.name}
                                </Typography>

                                {/* Rating */}

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <Star
                                        sx={{
                                            color: "#F5B400",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                        }}
                                    >
                                        {library.rating}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        ({library.reviews} reviews)
                                    </Typography>
                                </Stack>

                                {/* Location */}

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="flex-start"
                                >
                                    <LocationOn
                                        sx={{
                                            color: "#146EF5",
                                            mt: 0.2,
                                        }}
                                    />

                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                            }}
                                        >
                                            {library.area},{" "}
                                            {library.city}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {
                                                library.address
                                            }
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* Opening time */}

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                >
                                    <AccessTime
                                        sx={{
                                            color: "#146EF5",
                                        }}
                                    />

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Open{" "}
                                        {library.openingTime}{" "}
                                        –{" "}
                                        {
                                            library.closingTime
                                        }
                                    </Typography>
                                </Stack>

                                <Divider />

                                {/* Seat availability */}

                                <Box>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-end"
                                    >
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Available
                                                seats
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="baseline"
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 34,
                                                        fontWeight: 800,
                                                        color: "#146EF5",
                                                    }}
                                                >
                                                    {
                                                        library.availableSeats
                                                    }
                                                </Typography>

                                                <Typography
                                                    color="text.secondary"
                                                >
                                                    /{" "}
                                                    {
                                                        library.totalSeats
                                                    }
                                                </Typography>
                                            </Stack>
                                        </Box>

                                        <Typography
                                            sx={{
                                                color: "#008A3E",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {availabilityPercentage}%
                                            available
                                        </Typography>
                                    </Stack>

                                    <Box
                                        sx={{
                                            mt: 1,
                                            height: 7,
                                            borderRadius: 10,
                                            backgroundColor:
                                                "#E8F0FA",
                                            overflow:
                                                "hidden",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${availabilityPercentage}%`,
                                                height: "100%",
                                                backgroundColor:
                                                    "#146EF5",
                                            }}
                                        />
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    endIcon={
                                        <ArrowForward />
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/libraries/${library.id}/seats`
                                        )
                                    }
                                    sx={{
                                        minHeight: 50,
                                        borderRadius: 1.5,
                                        backgroundColor:
                                            "#146EF5",
                                        fontWeight: 700,
                                        fontSize: 15,
                                    }}
                                >
                                    View Available Seats
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            {/* =====================================================
                ABOUT + CONTACT
            ====================================================== */}

            <Container
                maxWidth="xl"
                sx={{ py: 2 }}
            >
                <Grid container spacing={3}>
                    {/* About */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 8,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3.5,
                                border:
                                    "1px solid #E1E9F3",
                                borderRadius: 3,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 21,
                                    fontWeight: 800,
                                    color: "#11194B",
                                    mb: 1.5,
                                }}
                            >
                                About this library
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#64748B",
                                    lineHeight: 1.8,
                                }}
                            >
                                {library.description}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Contact */}

                    <Grid
                        size={{
                            xs: 12,
                            md: 4,
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3.5,
                                border:
                                    "1px solid #E1E9F3",
                                borderRadius: 3,
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: 21,
                                    fontWeight: 800,
                                    color: "#11194B",
                                    mb: 2,
                                }}
                            >
                                Contact
                            </Typography>

                            <Stack spacing={2}>
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                >
                                    <Phone
                                        sx={{
                                            color: "#146EF5",
                                        }}
                                    />

                                    <Typography>
                                        {library.phone}
                                    </Typography>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                >
                                    <Email
                                        sx={{
                                            color: "#146EF5",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            wordBreak:
                                                "break-word",
                                        }}
                                    >
                                        {library.email}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* =====================================================
                AMENITIES
            ====================================================== */}

            <Container
                maxWidth="xl"
                sx={{ py: 2 }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 3.5,
                        border:
                            "1px solid #E1E9F3",
                        borderRadius: 3,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 21,
                            fontWeight: 800,
                            color: "#11194B",
                            mb: 3,
                        }}
                    >
                        Amenities & Facilities
                    </Typography>

                    <Grid container spacing={2}>
                        {library.amenities.map(
                            (amenity) => (
                                <Grid
                                    key={amenity}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            border:
                                                "1px solid #E5EDF7",
                                            borderRadius: 2,
                                            backgroundColor:
                                                "#F8FBFF",
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <CheckCircle
                                                sx={{
                                                    color: "#16A34A",
                                                    fontSize: 20,
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#263B60",
                                                }}
                                            >
                                                {amenity}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Grid>
                            )
                        )}
                    </Grid>
                </Paper>
            </Container>

            {/* =====================================================
                MEMBERSHIP PLANS
            ====================================================== */}

            <Container
                maxWidth="xl"
                sx={{ py: 5 }}
            >
                <Stack
                    spacing={0.5}
                    sx={{ mb: 3 }}
                >
                    <Typography
                        sx={{
                            fontSize: 26,
                            fontWeight: 800,
                            color: "#11194B",
                        }}
                    >
                        Membership Plans
                    </Typography>

                    <Typography color="text.secondary">
                        Choose a plan that works for your
                        study routine.
                    </Typography>
                </Stack>

                <Grid container spacing={3}>
                    {membershipPlans.map((plan) => (
                        <Grid
                            key={plan.id}
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    height: "100%",
                                    p: 3,
                                    position:
                                        "relative",
                                    border:
                                        plan.popular
                                            ? "2px solid #146EF5"
                                            : "1px solid #E1E9F3",
                                    borderRadius: 3,
                                }}
                            >
                                {plan.popular && (
                                    <Chip
                                        label="Most Popular"
                                        size="small"
                                        sx={{
                                            position:
                                                "absolute",
                                            top: 16,
                                            right: 16,
                                            backgroundColor:
                                                "#E8F1FF",
                                            color: "#146EF5",
                                            fontWeight: 800,
                                        }}
                                    />
                                )}

                                <Typography
                                    sx={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: "#11194B",
                                    }}
                                >
                                    {plan.name}
                                </Typography>

                                <Stack
                                    direction="row"
                                    alignItems="baseline"
                                    spacing={0.5}
                                    sx={{
                                        mt: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: 34,
                                            fontWeight: 800,
                                            color: "#146EF5",
                                        }}
                                    >
                                        ₹{plan.price}
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        / {plan.period}
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mt: 1,
                                        minHeight: 42,
                                    }}
                                >
                                    {
                                        plan.description
                                    }
                                </Typography>

                                <Divider
                                    sx={{ my: 2.5 }}
                                />

                                <Stack spacing={1.3}>
                                    {plan.features.map(
                                        (feature) => (
                                            <Stack
                                                key={
                                                    feature
                                                }
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <CheckCircle
                                                    sx={{
                                                        color: "#16A34A",
                                                        fontSize: 19,
                                                    }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                >
                                                    {
                                                        feature
                                                    }
                                                </Typography>
                                            </Stack>
                                        )
                                    )}
                                </Stack>

                                <Button
                                    fullWidth
                                    variant={
                                        plan.popular
                                            ? "contained"
                                            : "outlined"
                                    }
                                    sx={{
                                        mt: 3,
                                        minHeight: 44,
                                        fontWeight: 700,
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/libraries/${library.id}/seats`
                                        )
                                    }
                                >
                                    Choose Plan
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

export default LibraryDetails;