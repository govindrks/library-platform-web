import {
  ApartmentRounded,
  ArrowForwardRounded,
  ChairRounded,
  CheckCircleRounded,
  FilterAltOffRounded,
  FilterListRounded,
  LocationOnRounded,
  RefreshRounded,
  SearchRounded,
  StarRounded,
  VerifiedRounded,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import studentLibraryApi from "../../api/studentLibraryApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// CONSTANTS
// ============================================================

const ALL_CITIES = "All";

const AVAILABILITY_FILTERS = {
  ALL: "All",
  AVAILABLE: "Available",
  HIGH: "High Availability",
};

const SEARCH_DEBOUNCE_MS = 400;

// ============================================================
// HELPERS
// ============================================================

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    error?.message ||
    fallback
  );
};

const formatNumber = (value) => {
  const number = Number(value ?? 0);

  return Number.isFinite(number) ? number.toLocaleString("en-IN") : "0";
};

const getAvailabilityPercentage = (library) => {
  const total = Number(library?.totalSeats ?? 0);

  const available = Number(library?.availableSeats ?? 0);

  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((available / total) * 100)));
};

const getLibraryImage = (library) => {
  if (library?.coverImageUrl) {
    return getImageUrl(library.coverImageUrl);
  }

  const images = Array.isArray(library?.images) ? library.images : [];

  const cover = images.find(
    (image) => image?.imageRole === "COVER" || image?.cover === true,
  );

  if (cover?.imageUrl) {
    return getImageUrl(cover.imageUrl);
  }

  const profile = images.find(
    (image) => image?.imageRole === "PROFILE" || image?.profile === true,
  );

  return profile?.imageUrl ? getImageUrl(profile.imageUrl) : "";
};

const getLibraryLocation = (library) => {
  return [library?.city, library?.state].filter(Boolean).join(", ");
};

const getAmenityName = (amenity) => {
  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity?.name || amenity?.amenityName || amenity?.label || "";
};

const formatAmenityName = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

// ============================================================
// CARD SKELETON
// ============================================================

function LibraryCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Skeleton variant="rectangular" height={220} />

      <CardContent>
        <Skeleton width="70%" height={32} />

        <Skeleton width="45%" height={22} />

        <Stack direction="row" spacing={1} mt={2}>
          <Skeleton width={70} height={28} />

          <Skeleton width={70} height={28} />

          <Skeleton width={70} height={28} />
        </Stack>

        <Skeleton
          height={60}
          sx={{
            mt: 2,
          }}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// PREMIUM LIBRARY CARD
// ============================================================

function PublicLibraryCard({ library, onOpen, onViewSeats }) {
  const theme = useTheme();

  const imageUrl = getLibraryImage(library);

  const availability = getAvailabilityPercentage(library);

  const rating = Number(library?.averageRating ?? 0);

  const reviewCount = Number(library?.reviewCount ?? 0);

  const amenities = [
    ...(Array.isArray(library?.amenities) ? library.amenities : []),

    ...(Array.isArray(library?.customAmenities) ? library.customAmenities : []),
  ].slice(0, 4);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        display: "flex",

        flexDirection: "column",

        overflow: "hidden",

        borderRadius: 4,

        border: "1px solid",

        borderColor: alpha(theme.palette.divider, 0.85),

        bgcolor: "background.paper",

        boxShadow: "0 12px 35px rgba(15,23,42,.055)",

        transition:
          "transform .25s ease, box-shadow .25s ease, border-color .25s ease",

        "&:hover": {
          transform: "translateY(-5px)",

          borderColor: alpha(theme.palette.primary.main, 0.28),

          boxShadow: "0 24px 58px rgba(15,23,42,.11)",
        },
      }}
    >
      {/* ====================================================== */}
      {/* IMAGE */}
      {/* ====================================================== */}

      <Box
        sx={{
          position: "relative",

          height: 220,

          overflow: "hidden",

          bgcolor: alpha(theme.palette.primary.main, 0.055),
        }}
      >
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={library?.name || "Library"}
            sx={{
              width: "100%",

              height: "100%",

              objectFit: "cover",

              display: "block",

              transition: "transform .45s ease",

              ".MuiCard-root:hover &": {
                transform: "scale(1.045)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",

              display: "grid",

              placeItems: "center",

              background: `linear-gradient(
                  135deg,
                  ${alpha(theme.palette.primary.main, 0.14)},
                  ${alpha(theme.palette.secondary.main, 0.07)}
                )`,
            }}
          >
            <ApartmentRounded
              sx={{
                fontSize: 64,

                color: alpha(theme.palette.primary.main, 0.55),
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",

            inset: 0,

            background:
              "linear-gradient(180deg, rgba(15,23,42,.01) 35%, rgba(15,23,42,.6) 100%)",
          }}
        />

        <Chip
          icon={<VerifiedRounded />}
          label="Public Library"
          size="small"
          sx={{
            position: "absolute",

            top: 14,

            left: 14,

            bgcolor: "rgba(255,255,255,.94)",

            color: "primary.main",

            fontWeight: 800,

            backdropFilter: "blur(12px)",
          }}
        />

        <Chip
          label={`${availability}% available`}
          size="small"
          sx={{
            position: "absolute",

            bottom: 14,

            left: 14,

            bgcolor:
              availability >= 50
                ? "rgba(22,101,52,.9)"
                : availability >= 20
                  ? "rgba(180,83,9,.9)"
                  : "rgba(185,28,28,.9)",

            color: "#fff",

            fontWeight: 750,

            backdropFilter: "blur(10px)",
          }}
        />
      </Box>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <CardContent
        sx={{
          p: 2.6,

          display: "flex",

          flexDirection: "column",

          flexGrow: 1,

          "&:last-child": {
            pb: 2.6,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box minWidth={0}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 850,

                letterSpacing: "-0.025em",

                lineHeight: 1.25,
              }}
            >
              {library?.name || "Library"}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.6} mt={0.8}>
              <LocationOnRounded
                sx={{
                  fontSize: 17,

                  color: "text.secondary",
                }}
              />

              <Typography variant="body2" color="text.secondary" noWrap>
                {getLibraryLocation(library) ||
                  library?.city ||
                  "Location not configured"}
              </Typography>
            </Stack>
          </Box>

          {rating > 0 && (
            <Stack
              direction="row"
              spacing={0.4}
              alignItems="center"
              sx={{
                flexShrink: 0,
              }}
            >
              <StarRounded
                sx={{
                  color: "#F59E0B",

                  fontSize: 20,
                }}
              />

              <Typography fontWeight={800} fontSize={14}>
                {rating.toFixed(1)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {reviewCount > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.4,
            }}
          >
            {formatNumber(reviewCount)} review
            {reviewCount === 1 ? "" : "s"}
          </Typography>
        )}

        {/* ==================================================== */}
        {/* AMENITIES */}
        {/* ==================================================== */}

        {amenities.length > 0 && (
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            mt={2}
          >
            {amenities.map((amenity, index) => {
              const name = getAmenityName(amenity);

              return (
                <Chip
                  key={amenity?.id || `${name}-${index}`}
                  size="small"
                  label={formatAmenityName(name)}
                  variant="outlined"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.025),

                    borderColor: alpha(theme.palette.primary.main, 0.12),

                    fontSize: 12,
                  }}
                />
              );
            })}
          </Stack>
        )}

        <Divider
          sx={{
            my: 2.2,
          }}
        />

        {/* ==================================================== */}
        {/* SEAT SUMMARY */}
        {/* ==================================================== */}

        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              width: 42,

              height: 42,

              bgcolor: alpha(theme.palette.success.main, 0.09),

              color: "success.main",
            }}
          >
            <ChairRounded fontSize="small" />
          </Avatar>

          <Box>
            <Typography fontWeight={850} lineHeight={1.1}>
              {formatNumber(library?.availableSeats)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              available out of {formatNumber(library?.totalSeats)} seats
            </Typography>
          </Box>
        </Stack>

        {/* ==================================================== */}
        {/* AVAILABILITY BAR */}
        {/* ==================================================== */}

        <Box
          sx={{
            mt: 1.7,

            height: 6,

            borderRadius: 999,

            bgcolor: alpha(theme.palette.primary.main, 0.07),

            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${availability}%`,

              height: "100%",

              borderRadius: 999,

              bgcolor:
                availability >= 50
                  ? "success.main"
                  : availability >= 20
                    ? "warning.main"
                    : "error.main",
            }}
          />
        </Box>

        {/* ==================================================== */}
        {/* ACTIONS */}
        {/* ==================================================== */}

        <Stack direction="row" spacing={1} mt="auto" pt={2.5}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onOpen(library)}
            sx={{
              minHeight: 44,

              borderRadius: 2.25,

              fontWeight: 750,
            }}
          >
            View Details
          </Button>

          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            onClick={() => onViewSeats(library)}
            sx={{
              minHeight: 44,

              borderRadius: 2.25,

              fontWeight: 750,

              boxShadow: "none",
            }}
          >
            View Seats
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// LIBRARY LIST
// ============================================================

function LibraryList() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================================
  // URL INITIAL VALUES
  // ==========================================================

  const initialSearch = searchParams.get("search") || "";

  const initialCity = searchParams.get("city") || ALL_CITIES;

  const initialAvailability =
    searchParams.get("availability") || AVAILABILITY_FILTERS.ALL;

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState(initialSearch);

  const [city, setCity] = useState(initialCity);

  const [availability, setAvailability] = useState(initialAvailability);

  const [masterLibraries, setMasterLibraries] = useState([]);

  const [libraries, setLibraries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  // ==========================================================
  // URL → STATE
  // ==========================================================

  useEffect(() => {
    setSearch(searchParams.get("search") || "");

    setCity(searchParams.get("city") || ALL_CITIES);

    setAvailability(
      searchParams.get("availability") || AVAILABILITY_FILTERS.ALL,
    );
  }, [searchParams]);

  // ==========================================================
  // UPDATE URL
  // ==========================================================

  const updateUrl = useCallback(
    ({
      nextSearch = search,
      nextCity = city,
      nextAvailability = availability,
    } = {}) => {
      const params = new URLSearchParams();

      const cleanSearch = String(nextSearch || "").trim();

      if (cleanSearch) {
        params.set("search", cleanSearch);
      }

      if (nextCity && nextCity !== ALL_CITIES) {
        params.set("city", nextCity);
      }

      if (nextAvailability && nextAvailability !== AVAILABILITY_FILTERS.ALL) {
        params.set("availability", nextAvailability);
      }

      setSearchParams(params, {
        replace: true,
      });
    },
    [search, city, availability, setSearchParams],
  );

  // ==========================================================
  // LOAD MASTER PUBLIC LIST
  // ==========================================================

  const loadMasterLibraries = useCallback(async () => {
    try {
      const response = await studentLibraryApi.getAll();

      const list = normalizeList(response);

      setMasterLibraries(list);

      return list;
    } catch (requestError) {
      console.error("Unable to load public libraries:", requestError);

      throw requestError;
    }
  }, []);

  // ==========================================================
  // CITIES
  // ==========================================================

  const cities = useMemo(() => {
    return [
      ALL_CITIES,

      ...[
        ...new Set(
          masterLibraries
            .map((library) => String(library?.city || "").trim())
            .filter(Boolean),
        ),
      ].sort((first, second) => first.localeCompare(second)),
    ];
  }, [masterLibraries]);

  // ==========================================================
  // ENRICH LIBRARIES
  // ==========================================================

  const enrichLibraries = useCallback(async (list) => {
    /*
     * Discovery response intentionally remains compact.
     *
     * Public details are loaded only for the current result
     * cards so they can show:
     *
     * - state
     * - amenities
     * - custom amenities
     * - public media
     *
     * A failed detail request does not remove the discovery
     * result.
     */

    return Promise.all(
      list.map(async (library) => {
        try {
          const details = await studentLibraryApi.getById(library.id);

          return {
            ...library,

            ...details,

            averageRating:
              library?.averageRating ?? details?.averageRating ?? 0,

            reviewCount: library?.reviewCount ?? details?.reviewCount ?? 0,

            availableSeats:
              details?.availableSeats ?? library?.availableSeats ?? 0,

            totalSeats: details?.totalSeats ?? library?.totalSeats ?? 0,
          };
        } catch (requestError) {
          console.warn(
            `Unable to load public details for library ${library?.id}:`,
            requestError,
          );

          return library;
        }
      }),
    );
  }, []);

  // ==========================================================
  // DISCOVERY QUERY
  // ==========================================================

  const loadLibraries = useCallback(
    async ({ showRefresh = false } = {}) => {
      const currentRequestId = ++requestIdRef.current;

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const cleanSearch = search.trim();

        let response;

        // ====================================================
        // NAME SEARCH
        // ====================================================

        if (cleanSearch) {
          response = await studentLibraryApi.searchByName(cleanSearch);
        }

        // ====================================================
        // CITY SEARCH
        // ====================================================
        else if (city !== ALL_CITIES) {
          response = await studentLibraryApi.searchByCity(city);
        }

        // ====================================================
        // AVAILABLE SEATS FILTER
        // ====================================================
        else if (availability === AVAILABILITY_FILTERS.AVAILABLE) {
          response = await studentLibraryApi.filter({
            availableSeats: true,
          });
        }

        // ====================================================
        // ALL PUBLIC LIBRARIES
        // ====================================================
        else {
          response = await studentLibraryApi.getAll();
        }

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        let list = normalizeList(response);

        // ====================================================
        // COMBINE FILTERS
        // ====================================================
        //
        // Backend currently provides individual name/city
        // searches and a filter endpoint.
        //
        // When users combine name + city or use the custom
        // "High Availability" threshold, final intersection
        // is safely performed on the public response here.
        //
        // ====================================================

        if (city !== ALL_CITIES) {
          list = list.filter(
            (library) =>
              String(library?.city || "").toLowerCase() === city.toLowerCase(),
          );
        }

        if (availability === AVAILABILITY_FILTERS.AVAILABLE) {
          list = list.filter(
            (library) => Number(library?.availableSeats ?? 0) > 0,
          );
        }

        if (availability === AVAILABILITY_FILTERS.HIGH) {
          list = list.filter(
            (library) => getAvailabilityPercentage(library) >= 50,
          );
        }

        const enriched = await enrichLibraries(list);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        setLibraries(enriched);
      } catch (requestError) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.error("Public library discovery failed:", requestError);

        setLibraries([]);

        setError(
          getErrorMessage(requestError, "Unable to load libraries right now."),
        );
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);

          setRefreshing(false);
        }
      }
    },
    [search, city, availability, enrichLibraries],
  );

  // ==========================================================
  // INITIAL MASTER LIST
  // ==========================================================

  useEffect(() => {
    loadMasterLibraries().catch((requestError) => {
      setError(
        getErrorMessage(requestError, "Unable to load library discovery data."),
      );
    });
  }, [loadMasterLibraries]);

  // ==========================================================
  // SEARCH / FILTER DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadLibraries();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [search, city, availability, loadLibraries]);

  // ==========================================================
  // KEEP URL UPDATED
  // ==========================================================

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateUrl();
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [search, city, availability, updateUrl]);

  // ==========================================================
  // FILTER STATE
  // ==========================================================

  const filtersActive =
    Boolean(search.trim()) ||
    city !== ALL_CITIES ||
    availability !== AVAILABILITY_FILTERS.ALL;

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearch("");

    setCity(ALL_CITIES);

    setAvailability(AVAILABILITY_FILTERS.ALL);

    setSearchParams(
      {},
      {
        replace: true,
      },
    );
  };

  // ==========================================================
  // ACTIONS
  // ==========================================================

  const handleOpenLibrary = (library) => {
    if (!library?.id) {
      return;
    }

    navigate(`/libraries/${library.id}`);
  };

  const handleViewSeats = (library) => {
    if (!library?.id) {
      return;
    }

    navigate(`/libraries/${library.id}/seats`);
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const resultSummary = useMemo(() => {
    const totalSeats = libraries.reduce(
      (sum, library) => sum + Number(library?.totalSeats ?? 0),
      0,
    );

    const availableSeats = libraries.reduce(
      (sum, library) => sum + Number(library?.availableSeats ?? 0),
      0,
    );

    return {
      totalSeats,
      availableSeats,
    };
  }, [libraries]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        bgcolor: "#F7F9FC",
      }}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Box
        sx={{
          position: "relative",

          overflow: "hidden",

          borderBottom: "1px solid",

          borderColor: "divider",

          background: `linear-gradient(
              135deg,
              ${theme.palette.background.paper} 0%,
              ${alpha(theme.palette.primary.main, 0.045)} 100%
            )`,
        }}
      >
        <Box
          sx={{
            position: "absolute",

            width: 400,

            height: 400,

            borderRadius: "50%",

            right: -150,

            top: -220,

            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",

            zIndex: 1,

            py: {
              xs: 4,
              md: 5,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            justifyContent="space-between"
            spacing={3}
            alignItems={{
              xs: "stretch",
              lg: "flex-end",
            }}
          >
            <Box maxWidth={600}>
              <Chip
                icon={<VerifiedRounded />}
                label="Public Library Directory"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  mb: 1.5,

                  fontWeight: 700,
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,

                  letterSpacing: "-0.05em",

                  fontSize: {
                    xs: "2rem",
                    md: "2.8rem",
                  },
                }}
              >
                Find Your Library
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,

                  lineHeight: 1.7,

                  maxWidth: 580,
                }}
              >
                Discover publicly available libraries, compare seat availability
                and find a study space that fits your needs.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {filtersActive && (
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOffRounded />}
                  onClick={clearFilters}
                  sx={{
                    borderRadius: 2.5,

                    fontWeight: 700,
                  }}
                >
                  Clear
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={
                  refreshing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshRounded />
                  )
                }
                disabled={refreshing}
                onClick={() =>
                  loadLibraries({
                    showRefresh: true,
                  })
                }
                sx={{
                  borderRadius: 2.5,

                  fontWeight: 700,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* ================================================== */}
          {/* FILTER BAR */}
          {/* ================================================== */}

          <Paper
            elevation={0}
            sx={{
              mt: 4,

              p: 1.2,

              borderRadius: 3.5,

              border: "1px solid",

              borderColor: alpha(theme.palette.divider, 0.9),

              bgcolor: "rgba(255,255,255,.93)",

              boxShadow: "0 18px 45px rgba(15,23,42,.055)",
            }}
          >
            <Grid container spacing={1} alignItems="center">
              {/* SEARCH */}

              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >
                <TextField
                  fullWidth
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search library name..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded color="primary" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: 54,

                      borderRadius: 2.5,
                    },
                  }}
                />
              </Grid>

              {/* CITY */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <Select
                  fullWidth
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  startAdornment={
                    <LocationOnRounded
                      sx={{
                        mr: 0.7,

                        color: "text.secondary",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 54,

                    borderRadius: 2.5,
                  }}
                >
                  {cities.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item === ALL_CITIES ? "All Cities" : item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* AVAILABILITY */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Select
                  fullWidth
                  value={availability}
                  onChange={(event) => setAvailability(event.target.value)}
                  startAdornment={
                    <FilterListRounded
                      sx={{
                        mr: 0.7,

                        color: "text.secondary",
                      }}
                    />
                  }
                  sx={{
                    minHeight: 54,

                    borderRadius: 2.5,
                  }}
                >
                  <MenuItem value={AVAILABILITY_FILTERS.ALL}>
                    All Libraries
                  </MenuItem>

                  <MenuItem value={AVAILABILITY_FILTERS.AVAILABLE}>
                    Seats Available
                  </MenuItem>

                  <MenuItem value={AVAILABILITY_FILTERS.HIGH}>
                    High Availability (50%+)
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* ====================================================== */}
      {/* RESULTS */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 4,
            md: 5,
          },
        }}
      >
        {/* ==================================================== */}
        {/* RESULTS HEADER */}
        {/* ==================================================== */}

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
              variant="h5"
              sx={{
                fontWeight: 850,

                letterSpacing: "-0.025em",
              }}
            >
              {loading
                ? "Finding libraries..."
                : `${libraries.length} ${
                    libraries.length === 1 ? "Library" : "Libraries"
                  } Found`}
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Only publicly available libraries are shown.
            </Typography>
          </Box>

          {!loading && libraries.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<ApartmentRounded />}
                label={`${libraries.length} libraries`}
                variant="outlined"
              />

              <Chip
                icon={<ChairRounded />}
                label={`${formatNumber(
                  resultSummary.availableSeats,
                )} seats available`}
                color="success"
                variant="outlined"
              />

              <Chip
                label={`${formatNumber(resultSummary.totalSeats)} total seats`}
                variant="outlined"
              />
            </Stack>
          )}
        </Stack>

        {/* ==================================================== */}
        {/* ACTIVE FILTERS */}
        {/* ==================================================== */}

        {filtersActive && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
            {search.trim() && (
              <Chip
                label={`Search: ${search.trim()}`}
                onDelete={() => setSearch("")}
                color="primary"
                variant="outlined"
              />
            )}

            {city !== ALL_CITIES && (
              <Chip
                label={`City: ${city}`}
                onDelete={() => setCity(ALL_CITIES)}
                variant="outlined"
              />
            )}

            {availability !== AVAILABILITY_FILTERS.ALL && (
              <Chip
                label={availability}
                onDelete={() => setAvailability(AVAILABILITY_FILTERS.ALL)}
                variant="outlined"
              />
            )}
          </Stack>
        )}

        {/* ==================================================== */}
        {/* ERROR */}
        {/* ==================================================== */}

        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  loadLibraries({
                    showRefresh: true,
                  })
                }
              >
                Retry
              </Button>
            }
            sx={{
              mb: 3,

              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* ==================================================== */}
        {/* LOADING */}
        {/* ==================================================== */}

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid
                key={item}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <LibraryCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : libraries.length > 0 ? (
          /* ================================================== */
          /* RESULTS */
          /* ================================================== */

          <Grid container spacing={3} alignItems="stretch">
            {libraries.map((library) => (
              <Grid
                key={library.id}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
                sx={{
                  display: "flex",
                }}
              >
                <PublicLibraryCard
                  library={library}
                  onOpen={handleOpenLibrary}
                  onViewSeats={handleViewSeats}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          /* ================================================== */
          /* EMPTY STATE */
          /* ================================================== */

          <Paper
            elevation={0}
            sx={{
              py: {
                xs: 7,
                md: 10,
              },

              px: 3,

              textAlign: "center",

              borderRadius: 4,

              border: "1px solid",

              borderColor: "divider",

              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: 78,

                height: 78,

                borderRadius: "50%",

                display: "grid",

                placeItems: "center",

                mx: "auto",

                bgcolor: alpha(theme.palette.primary.main, 0.07),

                color: "primary.main",
              }}
            >
              <SearchRounded
                sx={{
                  fontSize: 38,
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight={850} mt={2}>
              No Libraries Found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.8,

                maxWidth: 500,

                mx: "auto",

                lineHeight: 1.7,
              }}
            >
              We couldn't find a public library matching the current search and
              filter combination.
            </Typography>

            <Button
              variant="contained"
              startIcon={<FilterAltOffRounded />}
              onClick={clearFilters}
              sx={{
                mt: 3,

                minHeight: 46,

                borderRadius: 2.5,

                px: 3,

                fontWeight: 750,

                boxShadow: "none",
              }}
            >
              Reset Filters
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default LibraryList;
