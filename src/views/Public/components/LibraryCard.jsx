import {
    AccessTime,
    AcUnit,
    Apartment,
    ArrowForward,
    Chair,
    Favorite,
    FavoriteBorder,
    LocalCafe,
    LocationOn,
    Lock,
    MenuBook,
    Power,
    Security,
    Wifi,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Chip,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const amenityIcons = {
    "Wi-Fi": Wifi,
    AC: AcUnit,
    "Reading Area": MenuBook,
    Parking: Apartment,
    Cafe: LocalCafe,
    Locker: Lock,
    "Power Backup": Power,
    "Quiet Zone": Security,
    CCTV: Security,
};

function LibraryCard({ library }) {
    const navigate = useNavigate();

    const [favorite, setFavorite] = useState(false);

    const availabilityPercentage =
        (library.availableSeats / library.totalSeats) * 100;

    return (
        <Box
            sx={{
                border: "1px solid #E1E9F3",
                borderRadius: 2.5,
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                transition: "all 0.2s ease",

                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                        "0 15px 35px rgba(15, 60, 110, 0.10)",
                },
            }}
        >
            {/* ================= IMAGE ================= */}

            <Box
                sx={{
                    position: "relative",
                    height: 205,
                    overflow: "hidden",
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
                        transition: "transform 0.3s ease",

                        "&:hover": {
                            transform: "scale(1.03)",
                        },
                    }}
                />

                <Chip
                    label={
                        library.status === "OPEN"
                            ? "Open Now"
                            : "Closed"
                    }
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 14,
                        left: 14,

                        backgroundColor:
                            library.status === "OPEN"
                                ? "#D8F9E4"
                                : "#FEE2E2",

                        color:
                            library.status === "OPEN"
                                ? "#008A3E"
                                : "#B91C1C",

                        fontWeight: 700,
                    }}
                />

                <IconButton
                    onClick={() =>
                        setFavorite((value) => !value)
                    }
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,

                        width: 40,
                        height: 40,

                        color: "#FFFFFF",

                        backgroundColor:
                            "rgba(0,0,0,0.45)",

                        "&:hover": {
                            backgroundColor:
                                "rgba(0,0,0,0.65)",
                        },
                    }}
                >
                    {favorite ? (
                        <Favorite
                            sx={{ color: "#FF4D67" }}
                        />
                    ) : (
                        <FavoriteBorder />
                    )}
                </IconButton>
            </Box>

            {/* ================= CONTENT ================= */}

            <Box sx={{ p: 2 }}>
                {/* Name + Rating */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                >
                    <Typography
                        sx={{
                            fontWeight: 800,
                            color: "#11194B",
                            fontSize: 18,
                            lineHeight: 1.3,
                        }}
                    >
                        {library.name}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={0.4}
                        alignItems="center"
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <Typography
                            sx={{
                                color: "#F5B400",
                                fontSize: 18,
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
                            {library.rating}
                        </Typography>

                        <Typography
                            sx={{
                                color: "#64748B",
                                fontSize: 12,
                            }}
                        >
                            ({library.reviews})
                        </Typography>
                    </Stack>
                </Stack>

                {/* Location */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{ mt: 1 }}
                >
                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                    >
                        <LocationOn
                            sx={{
                                color: "#54719A",
                                fontSize: 18,
                            }}
                        />

                        <Typography
                            sx={{
                                color: "#54719A",
                                fontSize: 14,
                            }}
                        >
                            {library.area},{" "}
                            {library.city}
                        </Typography>
                    </Stack>

                    <Typography
                        sx={{
                            color: "#54719A",
                            fontSize: 14,
                        }}
                    >
                        {library.distance}
                    </Typography>
                </Stack>

                {/* Amenities */}

                <Stack
                    direction="row"
                    spacing={0.8}
                    sx={{
                        mt: 2,
                        overflow: "hidden",
                    }}
                >
                    {library.amenities.map(
                        (amenity) => {
                            const Icon =
                                amenityIcons[
                                    amenity
                                ] || AccessTime;

                            return (
                                <Box
                                    key={amenity}
                                    sx={{
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        gap: 0.5,
                                        px: 1,
                                        py: 0.65,
                                        borderRadius: 1.5,
                                        backgroundColor:
                                            "#F1F6FD",
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
                                            fontSize: 11.5,
                                            color: "#31568B",
                                        }}
                                    >
                                        {amenity}
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
                    sx={{ mt: 2.2 }}
                >
                    <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                    >
                        <Chair
                            sx={{
                                color: "#146EF5",
                                fontSize: 23,
                            }}
                        />

                        <Typography
                            sx={{
                                color: "#526B91",
                                fontSize: 14,
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    color: "#111827",
                                    fontWeight: 800,
                                }}
                            >
                                {library.availableSeats}
                            </Box>{" "}
                            / {library.totalSeats} seats
                            available
                        </Typography>
                    </Stack>

                    <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        onClick={() =>
                            navigate(
                                `/libraries/${library.id}`
                            )
                        }
                        sx={{
                            color: "#146EF5",
                            borderColor: "#7EB1FF",
                            borderRadius: 1.5,
                            fontWeight: 700,
                            px: 1.5,
                            whiteSpace: "nowrap",

                            "&:hover": {
                                borderColor:
                                    "#146EF5",
                                backgroundColor:
                                    "#F1F7FF",
                            },
                        }}
                    >
                        View Details
                    </Button>
                </Stack>

                {/* Availability */}

                <Box
                    sx={{
                        height: 4,
                        mt: 1.5,
                        borderRadius: 5,
                        overflow: "hidden",
                        backgroundColor: "#EAF1FA",
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
        </Box>
    );
}

export default LibraryCard;