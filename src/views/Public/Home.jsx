import {
    AccessTime,
    Apartment,
    ArrowForward,
    Chair,
    Groups,
    LocationOn,
    MenuBook,
    Search,
    Security,
    Wifi,
    AcUnit,
    LocalCafe,
    Lock,
    FavoriteBorder,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const featuredLibraries = [
    {
        id: 1,
        name: "GNC Central Library",
        location: "Koramangala, Bengaluru",
        distance: "0.8 km",
        rating: "4.8",
        reviews: "320 reviews",
        totalSeats: 1200,
        availableSeats: 934,
        image:
            "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
        amenities: [
            { label: "Wi-Fi", icon: Wifi },
            { label: "AC", icon: AcUnit },
            { label: "Reading Area", icon: MenuBook },
            { label: "Parking", icon: Apartment },
        ],
    },
    {
        id: 2,
        name: "Knowledge Point Library",
        location: "Indiranagar, Bengaluru",
        distance: "1.2 km",
        rating: "4.6",
        reviews: "210 reviews",
        totalSeats: 300,
        availableSeats: 120,
        image:
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
        amenities: [
            { label: "Wi-Fi", icon: Wifi },
            { label: "AC", icon: AcUnit },
            { label: "Cafe", icon: LocalCafe },
            { label: "Locker", icon: Lock },
        ],
    },
    {
        id: 3,
        name: "Study Space",
        location: "HSR Layout, Bengaluru",
        distance: "2.8 km",
        rating: "4.5",
        reviews: "172 reviews",
        totalSeats: 150,
        availableSeats: 56,
        image:
            "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        amenities: [
            { label: "Wi-Fi", icon: Wifi },
            { label: "AC", icon: AcUnit },
            { label: "Power Backup", icon: AccessTime },
            { label: "Quiet Zone", icon: Security },
        ],
    },
];

const features = [
    {
        icon: Apartment,
        title: "Multiple",
        subtitle: "Libraries",
    },
    {
        icon: Chair,
        title: "Real-time",
        subtitle: "Seat Availability",
    },
    {
        icon: MenuBook,
        title: "Flexible",
        subtitle: "Booking Plans",
    },
    {
        icon: Security,
        title: "Safe & Secure",
        subtitle: "Environment",
    },
    {
        icon: Groups,
        title: "For Students,",
        subtitle: "Professionals & Everyone",
    },
];

function Home() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("Bengaluru");

    const handleSearch = () => {
        navigate(
            `/libraries?search=${encodeURIComponent(
                search.trim()
            )}&city=${encodeURIComponent(location)}`
        );
    };

    return (
        <Box sx={{ backgroundColor: "#F8FBFF" }}>
            {/* ================= HERO ================= */}

            <Box
                sx={{
                    position: "relative",
                    minHeight: {
                        xs: 560,
                        md: 510,
                    },
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",

                    backgroundImage: `
                        linear-gradient(
                            90deg,
                            rgba(4, 12, 20, 0.88) 0%,
                            rgba(4, 12, 20, 0.68) 32%,
                            rgba(4, 12, 20, 0.25) 65%,
                            rgba(4, 12, 20, 0.10) 100%
                        ),
                        url("https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=2200&q=90")
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <Container
                    maxWidth="xl"
                    sx={{
                        position: "relative",
                        zIndex: 2,
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 700,
                            pt: {
                                xs: 7,
                                md: 2,
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#FFFFFF",
                                fontWeight: 800,
                                fontSize: {
                                    xs: "2.8rem",
                                    sm: "3.5rem",
                                    md: "4.1rem",
                                },
                                lineHeight: 1.02,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            Find Your Perfect
                        </Typography>

                        <Typography
                            sx={{
                                color: "#3EA7FF",
                                fontWeight: 800,
                                fontSize: {
                                    xs: "2.8rem",
                                    sm: "3.5rem",
                                    md: "4.1rem",
                                },
                                lineHeight: 1.02,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            Study Space
                        </Typography>

                        <Typography
                            sx={{
                                color: "#FFFFFF",
                                fontSize: {
                                    xs: "1rem",
                                    md: "1.3rem",
                                },
                                mt: 2,
                                mb: 3,
                                fontWeight: 400,
                            }}
                        >
                            Search libraries by name, city or location
                        </Typography>

                        {/* Search Box */}
                        <Box
                            sx={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: 2.5,
                                p: 1,
                                boxShadow:
                                    "0 15px 40px rgba(0,0,0,0.25)",
                                width: "100%",
                                maxWidth: 1100,
                            }}
                        >
                            <Stack
                                direction={{
                                    xs: "column",
                                    md: "row",
                                }}
                                spacing={1}
                            >
                                <TextField
                                    fullWidth
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === "Enter"
                                        ) {
                                            handleSearch();
                                        }
                                    }}
                                    placeholder="Search libraries by name, city or location..."
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search
                                                    sx={{
                                                        color: "#146EF5",
                                                        fontSize: 28,
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        px: 1.5,
                                        py: 1,
                                    }}
                                />

                                <Select
                                    value={location}
                                    onChange={(event) =>
                                        setLocation(
                                            event.target.value
                                        )
                                    }
                                    variant="standard"
                                    disableUnderline
                                    startAdornment={
                                        <LocationOn
                                            sx={{
                                                color: "#49658E",
                                                mr: 0.5,
                                            }}
                                        />
                                    }
                                    sx={{
                                        minWidth: {
                                            xs: "100%",
                                            md: 170,
                                        },
                                        px: 1,
                                    }}
                                >
                                    <MenuItem value="Bengaluru">
                                        Bengaluru
                                    </MenuItem>

                                    <MenuItem value="Delhi">
                                        Delhi
                                    </MenuItem>

                                    <MenuItem value="Patna">
                                        Patna
                                    </MenuItem>

                                    <MenuItem value="Gurugram">
                                        Gurugram
                                    </MenuItem>
                                </Select>

                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Search />}
                                    onClick={handleSearch}
                                    sx={{
                                        minWidth: 195,
                                        minHeight: 52,
                                        borderRadius: 1.5,
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        backgroundColor: "#146EF5",
                                        "&:hover": {
                                            backgroundColor:
                                                "#075BD3",
                                        },
                                    }}
                                >
                                    Search Libraries
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ================= FEATURES ================= */}

            <Box
                sx={{
                    backgroundColor: "#FFFFFF",
                    borderBottom: "1px solid #E5EDF7",
                }}
            >
                <Container maxWidth="xl">
                    <Grid
                        container
                        sx={{
                            py: 3,
                        }}
                    >
                        {features.map((feature, index) => {
                            const Icon = feature.icon;

                            return (
                                <Grid
                                    key={feature.title}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 2.4,
                                    }}
                                    sx={{
                                        borderRight:
                                            index !==
                                            features.length - 1
                                                ? {
                                                      md: "1px solid #E5EDF7",
                                                  }
                                                : "none",
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="center"
                                        spacing={1.5}
                                        sx={{
                                            py: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 58,
                                                height: 58,
                                                borderRadius: "50%",
                                                backgroundColor:
                                                    "#EAF3FF",
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon
                                                sx={{
                                                    color: "#146EF5",
                                                    fontSize: 30,
                                                }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: "#172554",
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: "#172554",
                                                }}
                                            >
                                                {feature.subtitle}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* ================= FEATURED LIBRARIES ================= */}

            <Container
                maxWidth="xl"
                sx={{
                    py: 5,
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5EDF7",
                        borderRadius: 3,
                        p: {
                            xs: 2,
                            sm: 3,
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            mb: 3,
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#11194B",
                                fontSize: {
                                    xs: "1.7rem",
                                    md: "2rem",
                                },
                                fontWeight: 800,
                            }}
                        >
                            Featured Libraries
                        </Typography>

                        <Button
                            endIcon={<ArrowForward />}
                            onClick={() =>
                                navigate("/libraries")
                            }
                            sx={{
                                fontWeight: 700,
                                color: "#146EF5",
                            }}
                        >
                            View All Libraries
                        </Button>
                    </Stack>

                    <Grid container spacing={3}>
                        {featuredLibraries.map((library) => {
                            const availability =
                                Math.round(
                                    (library.availableSeats /
                                        library.totalSeats) *
                                        100
                                );

                            return (
                                <Grid
                                    key={library.id}
                                    size={{
                                        xs: 12,
                                        md: 4,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            border: "1px solid #E4EBF5",
                                            borderRadius: 2.5,
                                            overflow: "hidden",
                                            backgroundColor:
                                                "#FFFFFF",
                                            transition:
                                                "all 0.2s ease",
                                            "&:hover": {
                                                transform:
                                                    "translateY(-3px)",
                                                boxShadow:
                                                    "0 12px 30px rgba(22,70,130,0.10)",
                                            },
                                        }}
                                    >
                                        {/* Image */}
                                        <Box
                                            sx={{
                                                position:
                                                    "relative",
                                                height: 165,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={
                                                    library.image
                                                }
                                                alt={
                                                    library.name
                                                }
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit:
                                                        "cover",
                                                    display:
                                                        "block",
                                                }}
                                            />

                                            <Chip
                                                label="Open Now"
                                                size="small"
                                                sx={{
                                                    position:
                                                        "absolute",
                                                    top: 12,
                                                    left: 14,
                                                    backgroundColor:
                                                        "#D9FBE5",
                                                    color: "#008A3E",
                                                    fontWeight: 700,
                                                    fontSize: 13,
                                                }}
                                            />

                                            <IconButton
                                                sx={{
                                                    position:
                                                        "absolute",
                                                    top: 8,
                                                    right: 10,
                                                    width: 38,
                                                    height: 38,
                                                    backgroundColor:
                                                        "rgba(0,0,0,0.48)",
                                                    color: "#FFFFFF",
                                                    "&:hover":
                                                        {
                                                            backgroundColor:
                                                                "rgba(0,0,0,0.65)",
                                                        },
                                                }}
                                            >
                                                <FavoriteBorder />
                                            </IconButton>
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ p: 1.5 }}>
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: "#10194B",
                                                        fontSize: 17,
                                                    }}
                                                >
                                                    {
                                                        library.name
                                                    }
                                                </Typography>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.4}
                                                    alignItems="center"
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: "#F7B500",
                                                            fontSize: 19,
                                                        }}
                                                    >
                                                        ★
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontWeight: 700,
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {
                                                            library.rating
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            color: "#56709A",
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        (
                                                        {
                                                            library.reviews
                                                        }
                                                        )
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            {/* Location */}
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                sx={{
                                                    mt: 1,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    alignItems="center"
                                                >
                                                    <LocationOn
                                                        sx={{
                                                            color: "#52709D",
                                                            fontSize: 18,
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            color: "#52709D",
                                                            fontSize: 14,
                                                        }}
                                                    >
                                                        {
                                                            library.location
                                                        }
                                                    </Typography>
                                                </Stack>

                                                <Typography
                                                    sx={{
                                                        color: "#52709D",
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {
                                                        library.distance
                                                    }
                                                </Typography>
                                            </Stack>

                                            {/* Amenities */}
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{
                                                    mt: 2,
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                {library.amenities.map(
                                                    (
                                                        amenity
                                                    ) => {
                                                        const Icon =
                                                            amenity.icon;

                                                        return (
                                                            <Box
                                                                key={
                                                                    amenity.label
                                                                }
                                                                sx={{
                                                                    px: 1,
                                                                    py: 0.7,
                                                                    backgroundColor:
                                                                        "#F1F6FD",
                                                                    borderRadius:
                                                                        1.5,
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 0.5,
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                }}
                                                            >
                                                                <Icon
                                                                    sx={{
                                                                        fontSize: 15,
                                                                        color: "#31568B",
                                                                    }}
                                                                />

                                                                <Typography
                                                                    sx={{
                                                                        fontSize: 12,
                                                                        color: "#31568B",
                                                                    }}
                                                                >
                                                                    {
                                                                        amenity.label
                                                                    }
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    }
                                                )}
                                            </Stack>

                                            {/* Seats */}
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                sx={{
                                                    mt: 2,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <Chair
                                                        sx={{
                                                            color: "#146EF5",
                                                        }}
                                                    />

                                                    <Typography
                                                        sx={{
                                                            fontSize: 14,
                                                            color: "#526B91",
                                                        }}
                                                    >
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                color: "#111827",
                                                                fontWeight: 800,
                                                            }}
                                                        >
                                                            {
                                                                library.availableSeats
                                                            }
                                                        </Box>{" "}
                                                        /{" "}
                                                        {
                                                            library.totalSeats
                                                        }{" "}
                                                        seats
                                                        available
                                                    </Typography>
                                                </Stack>

                                                <Button
                                                    variant="outlined"
                                                    endIcon={
                                                        <ArrowForward />
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/libraries/${library.id}`
                                                        )
                                                    }
                                                    sx={{
                                                        borderColor:
                                                            "#78AFFF",
                                                        color: "#146EF5",
                                                        fontWeight: 700,
                                                        borderRadius:
                                                            1.5,
                                                        whiteSpace:
                                                            "nowrap",
                                                    }}
                                                >
                                                    View Details
                                                </Button>
                                            </Stack>

                                            {/* Availability bar */}
                                            <Box
                                                sx={{
                                                    mt: 1.5,
                                                    height: 4,
                                                    borderRadius: 5,
                                                    backgroundColor:
                                                        "#EAF1FA",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${availability}%`,
                                                        height: "100%",
                                                        backgroundColor:
                                                            "#146EF5",
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}

export default Home;