import {
    FilterList,
    LocationOn,
    Search,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Container,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import LibraryCard from "./components/LibraryCard";
import libraries from "./data/libraryData";

function LibraryList() {
    const [searchParams] = useSearchParams();

    const initialSearch =
        searchParams.get("search") || "";

    const initialCity =
        searchParams.get("city") || "All";

    const [search, setSearch] =
        useState(initialSearch);

    const [city, setCity] =
        useState(initialCity);

    const [availability, setAvailability] =
        useState("All");

    const cities = [
        "All",
        ...new Set(
            libraries.map(
                (library) => library.city
            )
        ),
    ];

    const filteredLibraries = useMemo(() => {
        return libraries.filter((library) => {
            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                library.name
                    .toLowerCase()
                    .includes(searchValue) ||
                library.city
                    .toLowerCase()
                    .includes(searchValue) ||
                library.area
                    .toLowerCase()
                    .includes(searchValue);

            const matchesCity =
                city === "All" ||
                library.city === city;

            const matchesAvailability =
                availability === "All" ||
                (availability === "Available" &&
                    library.availableSeats > 0) ||
                (availability ===
                    "High Availability" &&
                    library.availableSeats /
                        library.totalSeats >
                        0.5);

            return (
                matchesSearch &&
                matchesCity &&
                matchesAvailability
            );
        });
    }, [search, city, availability]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F8FBFF",
            }}
        >
            {/* ================= HEADER ================= */}

            <Box
                sx={{
                    backgroundColor: "#FFFFFF",
                    borderBottom:
                        "1px solid #E5EDF7",
                    py: 5,
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={1}>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: "2rem",
                                    md: "2.6rem",
                                },
                                fontWeight: 800,
                                color: "#11194B",
                                letterSpacing:
                                    "-0.03em",
                            }}
                        >
                            Find Your Library
                        </Typography>

                        <Typography
                            sx={{
                                color: "#64748B",
                                fontSize: 16,
                            }}
                        >
                            Discover libraries, compare
                            facilities and find your
                            perfect study space.
                        </Typography>
                    </Stack>

                    {/* Search */}

                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={1.5}
                        sx={{ mt: 4 }}
                    >
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search library, area or city..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search
                                            sx={{
                                                color: "#146EF5",
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Select
                            value={city}
                            onChange={(event) =>
                                setCity(
                                    event.target.value
                                )
                            }
                            sx={{
                                minWidth: 180,
                                backgroundColor:
                                    "#FFFFFF",
                            }}
                            startAdornment={
                                <LocationOn
                                    sx={{
                                        ml: 1,
                                        mr: 0.5,
                                        color: "#64748B",
                                    }}
                                />
                            }
                        >
                            {cities.map(
                                (item) => (
                                    <MenuItem
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </MenuItem>
                                )
                            )}
                        </Select>

                        <Select
                            value={availability}
                            onChange={(event) =>
                                setAvailability(
                                    event.target.value
                                )
                            }
                            sx={{
                                minWidth: 190,
                                backgroundColor:
                                    "#FFFFFF",
                            }}
                            startAdornment={
                                <FilterList
                                    sx={{
                                        ml: 1,
                                        mr: 0.5,
                                        color: "#64748B",
                                    }}
                                />
                            }
                        >
                            <MenuItem value="All">
                                All Libraries
                            </MenuItem>

                            <MenuItem value="Available">
                                Seats Available
                            </MenuItem>

                            <MenuItem value="High Availability">
                                High Availability
                            </MenuItem>
                        </Select>
                    </Stack>
                </Container>
            </Box>

            {/* ================= RESULTS ================= */}

            <Container
                maxWidth="xl"
                sx={{ py: 5 }}
            >
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
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 800,
                                color: "#11194B",
                                fontSize: 20,
                            }}
                        >
                            {filteredLibraries.length}{" "}
                            Libraries Found
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Showing libraries based on
                            your search criteria.
                        </Typography>
                    </Box>

                    {(search ||
                        city !== "All" ||
                        availability !==
                            "All") && (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSearch("");
                                setCity("All");
                                setAvailability(
                                    "All"
                                );
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Stack>

                {filteredLibraries.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredLibraries.map(
                            (library) => (
                                <Grid
                                    key={library.id}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        lg: 4,
                                    }}
                                >
                                    <LibraryCard
                                        library={
                                            library
                                        }
                                    />
                                </Grid>
                            )
                        )}
                    </Grid>
                ) : (
                    <Box
                        sx={{
                            py: 12,
                            textAlign: "center",
                            backgroundColor:
                                "#FFFFFF",
                            border:
                                "1px solid #E1E9F3",
                            borderRadius: 3,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: "#11194B",
                            }}
                        >
                            No libraries found
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Try a different library,
                            area or city.
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={() => {
                                setSearch("");
                                setCity("All");
                                setAvailability(
                                    "All"
                                );
                            }}
                        >
                            Reset Search
                        </Button>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default LibraryList;