import {
  AccessTimeRounded,
  ApartmentRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  ChairRounded,
  CheckCircleRounded,
  GroupsRounded,
  LocationOnRounded,
  MenuBookRounded,
  RefreshRounded,
  SearchRounded,
  SecurityRounded,
  StarRounded,
  VerifiedRounded,
  WifiRounded,
  AcUnitRounded,
  LocalCafeRounded,
  LocalParkingRounded,
  PowerRounded,
  LockRounded,
  WorkspacePremiumRounded,
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

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import studentLibraryApi from "../../api/studentLibraryApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// CONSTANTS
// ============================================================

const ALL_CITIES = "ALL";

const MAX_FEATURED_LIBRARIES = 3;

// ============================================================
// PREMIUM FEATURE STRIP
// ============================================================

const platformFeatures = [
  {
    icon: ApartmentRounded,
    title: "Verified",
    subtitle: "Libraries",
  },

  {
    icon: ChairRounded,
    title: "Real-time",
    subtitle: "Seat Availability",
  },

  {
    icon: MenuBookRounded,
    title: "Flexible",
    subtitle: "Membership Plans",
  },

  {
    icon: SecurityRounded,
    title: "Secure",
    subtitle: "Booking Experience",
  },

  {
    icon: GroupsRounded,
    title: "Built for",
    subtitle: "Every Learner",
  },
];

// ============================================================
// AMENITY ICON MAP
// ============================================================

const AMENITY_ICONS = {
  WIFI: WifiRounded,
  "WI-FI": WifiRounded,
  WI_FI: WifiRounded,

  AC: AcUnitRounded,
  AIR_CONDITIONING: AcUnitRounded,

  PARKING: LocalParkingRounded,

  CAFE: LocalCafeRounded,
  CAFETERIA: LocalCafeRounded,

  LOCKER: LockRounded,
  LOCKERS: LockRounded,

  POWER_BACKUP: PowerRounded,

  READING_AREA: MenuBookRounded,
  READING_HALL: MenuBookRounded,

  QUIET_ZONE: SecurityRounded,
};

// ============================================================
// HELPERS
// ============================================================

function normalizeList(response) {
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
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message || data?.error || data?.detail || error?.message || fallback
  );
}

function formatNumber(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
}

function getAvailabilityPercentage(library) {
  const total = Number(library?.totalSeats ?? 0);

  const available = Number(library?.availableSeats ?? 0);

  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((available / total) * 100)));
}

function getAmenityName(amenity) {
  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity?.name || amenity?.amenityName || amenity?.label || "";
}

function formatAmenityName(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function resolveAmenityIcon(amenity) {
  const name = getAmenityName(amenity);

  const normalized = String(name).trim().toUpperCase().replaceAll(" ", "_");

  return AMENITY_ICONS[normalized] || CheckCircleRounded;
}

function getLibraryImage(library) {
  const directImage = library?.coverImageUrl || "";

  if (directImage) {
    return getImageUrl(directImage);
  }

  const images = Array.isArray(library?.images) ? library.images : [];

  const cover = images.find(
    (image) => image?.imageRole === "COVER" || image?.cover === true,
  );

  return cover?.imageUrl ? getImageUrl(cover.imageUrl) : "";
}

function getLibraryLocation(library) {
  return [library?.city, library?.state].filter(Boolean).join(", ");
}

function isLibraryOpen24Hours(library) {
  return Boolean(library?.open24Hours);
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
}

// ============================================================
// FEATURED LIBRARY SKELETON
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
        <Skeleton width="65%" height={32} />

        <Skeleton width="45%" height={22} />

        <Stack direction="row" spacing={1} mt={2}>
          <Skeleton width={80} height={30} />

          <Skeleton width={80} height={30} />
        </Stack>

        <Skeleton
          width="100%"
          height={50}
          sx={{
            mt: 2,
          }}
        />
      </CardContent>
    </Card>
  );
}

// ============================================================
// FEATURED LIBRARY CARD
// ============================================================

function LibraryCard({ library, onOpen }) {
  const theme = useTheme();

  const imageUrl = getLibraryImage(library);

  const availability = getAvailabilityPercentage(library);

  const amenities = [
    ...(Array.isArray(library?.amenities) ? library.amenities : []),

    ...(Array.isArray(library?.customAmenities) ? library.customAmenities : []),
  ].slice(0, 4);

  const rating = Number(library?.averageRating ?? 0);

  const reviewCount = Number(library?.reviewCount ?? 0);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        display: "flex",

        flexDirection: "column",

        borderRadius: 4,

        overflow: "hidden",

        border: "1px solid",

        borderColor: alpha(theme.palette.divider, 0.9),

        bgcolor: "background.paper",

        boxShadow: "0 12px 35px rgba(15,23,42,0.055)",

        transition:
          "transform .25s ease, box-shadow .25s ease, border-color .25s ease",

        "&:hover": {
          transform: "translateY(-6px)",

          borderColor: alpha(theme.palette.primary.main, 0.3),

          boxShadow: "0 24px 55px rgba(15,23,42,0.12)",
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

          bgcolor: alpha(theme.palette.primary.main, 0.06),
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
                    ${alpha(theme.palette.secondary.main, 0.08)}
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
              "linear-gradient(180deg, rgba(15,23,42,0.03) 40%, rgba(15,23,42,0.52) 100%)",
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

            bgcolor: "rgba(255,255,255,.95)",

            color: "primary.main",

            fontWeight: 800,

            backdropFilter: "blur(12px)",
          }}
        />

        {availability > 0 && (
          <Chip
            label={`${availability}% available`}
            size="small"
            sx={{
              position: "absolute",

              bottom: 14,

              left: 14,

              bgcolor: "rgba(15,23,42,.72)",

              color: "#fff",

              fontWeight: 700,

              backdropFilter: "blur(12px)",
            }}
          />
        )}
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

            <Stack direction="row" spacing={0.6} alignItems="center" mt={0.8}>
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
          <Typography variant="caption" color="text.secondary" mt={0.5}>
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
            spacing={0.8}
            flexWrap="wrap"
            useFlexGap
            mt={2}
          >
            {amenities.map((amenity, index) => {
              const Icon = resolveAmenityIcon(amenity);

              const name = getAmenityName(amenity);

              return (
                <Chip
                  key={amenity?.id || `${name}-${index}`}
                  icon={<Icon />}
                  label={formatAmenityName(name)}
                  size="small"
                  variant="outlined"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.025),

                    borderColor: alpha(theme.palette.primary.main, 0.12),

                    "& .MuiChip-icon": {
                      fontSize: 16,

                      color: "primary.main",
                    },
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
        {/* SEATS */}
        {/* ==================================================== */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              sx={{
                width: 38,

                height: 38,

                bgcolor: alpha(theme.palette.success.main, 0.09),

                color: "success.main",
              }}
            >
              <ChairRounded fontSize="small" />
            </Avatar>

            <Box>
              <Typography fontWeight={850} lineHeight={1.15}>
                {formatNumber(library?.availableSeats)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                available of {formatNumber(library?.totalSeats)}
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            endIcon={<ArrowForwardRounded />}
            onClick={() => onOpen(library)}
            sx={{
              minWidth: 130,

              borderRadius: 2.25,

              fontWeight: 750,
            }}
          >
            View
          </Button>
        </Stack>

        {/* ==================================================== */}
        {/* AVAILABILITY BAR */}
        {/* ==================================================== */}

        <Box
          sx={{
            mt: 2,

            height: 6,

            borderRadius: 999,

            bgcolor: alpha(theme.palette.primary.main, 0.08),

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

              transition: "width .4s ease",
            }}
          />
        </Box>

        {/* ==================================================== */}
        {/* HOURS */}
        {/* ==================================================== */}

        {(isLibraryOpen24Hours(library) || library?.openingTime) && (
          <Stack direction="row" spacing={0.7} alignItems="center" mt={1.5}>
            <AccessTimeRounded
              sx={{
                fontSize: 16,

                color: "text.secondary",
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {isLibraryOpen24Hours(library)
                ? "Open 24 Hours"
                : `${formatTime(library.openingTime)} - ${formatTime(
                    library.closingTime,
                  )}`}
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// HOME
// ============================================================

function Home() {
  const theme = useTheme();

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] = useState("");

  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);

  const [libraries, setLibraries] = useState([]);

  const [featuredLibraries, setFeaturedLibraries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD PUBLIC LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async ({ refresh = false } = {}) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Public endpoint:
       *
       * GET /api/libraries
       *
       * Backend already filters out
       * non-public libraries.
       */
      const response = await studentLibraryApi.getAll();

      const list = normalizeList(response);

      setLibraries(list);

      // ====================================================
      // FEATURED SORT
      // ====================================================
      //
      // Priority:
      //
      // 1. Higher rating
      // 2. Higher review count
      // 3. Higher current availability
      //
      // ====================================================

      const ranked = [...list]
        .sort((first, second) => {
          const ratingDifference =
            Number(second?.averageRating ?? 0) -
            Number(first?.averageRating ?? 0);

          if (ratingDifference !== 0) {
            return ratingDifference;
          }

          const reviewDifference =
            Number(second?.reviewCount ?? 0) - Number(first?.reviewCount ?? 0);

          if (reviewDifference !== 0) {
            return reviewDifference;
          }

          return (
            getAvailabilityPercentage(second) - getAvailabilityPercentage(first)
          );
        })
        .slice(0, MAX_FEATURED_LIBRARIES);

      // ====================================================
      // ENRICH FEATURED LIBRARIES
      // ====================================================
      //
      // Discovery response intentionally stays compact.
      //
      // For the three premium cards we fetch public details
      // so we can display:
      //
      // - state
      // - amenities
      // - custom amenities
      // - opening hours
      // - public media
      //
      // ====================================================

      const enriched = await Promise.all(
        ranked.map(async (library) => {
          try {
            const details = await studentLibraryApi.getById(library.id);

            return {
              ...library,
              ...details,

              /*
               * Preserve discovery statistics because
               * the details DTO may not contain ratings.
               */
              averageRating:
                library.averageRating ?? details?.averageRating ?? 0,

              reviewCount: library.reviewCount ?? details?.reviewCount ?? 0,

              availableSeats:
                details?.availableSeats ?? library.availableSeats ?? 0,

              totalSeats: details?.totalSeats ?? library.totalSeats ?? 0,
            };
          } catch (requestError) {
            /*
             * One failed detail request should not make
             * the whole Home page fail.
             */
            console.warn(
              `Unable to enrich library ${library.id}:`,
              requestError,
            );

            return library;
          }
        }),
      );

      setFeaturedLibraries(enriched);
    } catch (requestError) {
      console.error("Unable to load public libraries:", requestError);

      setLibraries([]);

      setFeaturedLibraries([]);

      setError(
        getErrorMessage(requestError, "Unable to load libraries right now."),
      );
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  // ==========================================================
  // CITIES
  // ==========================================================

  const cities = useMemo(() => {
    return [
      ...new Set(
        libraries
          .map((library) => String(library?.city || "").trim())
          .filter(Boolean),
      ),
    ].sort((first, second) => first.localeCompare(second));
  }, [libraries]);

  // ==========================================================
  // PLATFORM SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const totalLibraries = libraries.length;

    const totalSeats = libraries.reduce(
      (total, library) => total + Number(library?.totalSeats ?? 0),
      0,
    );

    const availableSeats = libraries.reduce(
      (total, library) => total + Number(library?.availableSeats ?? 0),
      0,
    );

    return {
      totalLibraries,
      totalSeats,
      availableSeats,
    };
  }, [libraries]);

  // ==========================================================
  // HERO BACKGROUND
  // ==========================================================

  const heroImage = useMemo(() => {
    const first = featuredLibraries[0];

    return first ? getLibraryImage(first) : "";
  }, [featuredLibraries]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = () => {
    const params = new URLSearchParams();

    const query = search.trim();

    if (query) {
      params.set("search", query);
    }

    if (selectedCity && selectedCity !== ALL_CITIES) {
      params.set("city", selectedCity);
    }

    const queryString = params.toString();

    navigate(queryString ? `/libraries?${queryString}` : "/libraries");
  };

  // ==========================================================
  // OPEN LIBRARY
  // ==========================================================

  const handleOpenLibrary = (library) => {
    if (!library?.id) {
      return;
    }

    navigate(`/libraries/${library.id}`);
  };

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
      {/* HERO */}
      {/* ====================================================== */}

      <Box
        sx={{
          position: "relative",

          overflow: "hidden",

          minHeight: {
            xs: 610,
            md: 580,
          },

          display: "flex",

          alignItems: "center",

          background: heroImage
            ? `linear-gradient(
                    90deg,
                    rgba(8,15,31,.96) 0%,
                    rgba(8,15,31,.89) 38%,
                    rgba(8,15,31,.55) 68%,
                    rgba(8,15,31,.32) 100%
                 ),
                 url("${heroImage}")`
            : `linear-gradient(
                    135deg,
                    #07152E 0%,
                    #102F62 52%,
                    #146EF5 140%
                 )`,

          backgroundSize: "cover",

          backgroundPosition: "center",
        }}
      >
        {/* Decorative glow */}

        <Box
          sx={{
            position: "absolute",

            width: 500,
            height: 500,

            borderRadius: "50%",

            right: -180,
            top: -210,

            bgcolor: "rgba(46,144,250,.16)",

            filter: "blur(5px)",
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            position: "relative",

            zIndex: 2,

            py: {
              xs: 7,
              md: 8,
            },
          }}
        >
          <Grid container spacing={5} alignItems="center">
            <Grid
              size={{
                xs: 12,
                md: 8,
                lg: 7,
              }}
            >
              <Chip
                icon={<AutoAwesomeRounded />}
                label="Find. Choose. Study."
                sx={{
                  mb: 2.5,

                  bgcolor: "rgba(255,255,255,.1)",

                  color: "#fff",

                  border: "1px solid rgba(255,255,255,.16)",

                  backdropFilter: "blur(12px)",

                  fontWeight: 700,

                  "& .MuiChip-icon": {
                    color: "#75B8FF",
                  },
                }}
              />

              <Typography
                sx={{
                  color: "#fff",

                  fontWeight: 900,

                  fontSize: {
                    xs: "2.8rem",
                    sm: "3.6rem",
                    md: "4.4rem",
                  },

                  lineHeight: 0.98,

                  letterSpacing: "-0.055em",

                  maxWidth: 830,
                }}
              >
                Find your perfect
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,

                  fontWeight: 900,

                  fontSize: {
                    xs: "2.8rem",
                    sm: "3.6rem",
                    md: "4.4rem",
                  },

                  lineHeight: 0.98,

                  letterSpacing: "-0.055em",

                  background: "linear-gradient(90deg,#63B3FF,#9AD7FF)",

                  WebkitBackgroundClip: "text",

                  WebkitTextFillColor: "transparent",
                }}
              >
                study space.
              </Typography>

              <Typography
                sx={{
                  mt: 2.5,

                  color: "rgba(255,255,255,.78)",

                  fontSize: {
                    xs: "1rem",
                    md: "1.16rem",
                  },

                  lineHeight: 1.75,

                  maxWidth: 690,
                }}
              >
                Discover verified libraries, compare membership plans and see
                real-time seat availability before you book.
              </Typography>

              {/* ============================================== */}
              {/* SEARCH */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  mt: 4,

                  width: "100%",

                  maxWidth: 950,

                  p: 1,

                  borderRadius: 3.5,

                  bgcolor: "rgba(255,255,255,.98)",

                  boxShadow: "0 25px 65px rgba(0,0,0,.26)",
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
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search by library name..."
                    variant="outlined"
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

                        "& fieldset": {
                          border: "none",
                        },
                      },
                    }}
                  />

                  <Select
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                    displayEmpty
                    startAdornment={
                      <LocationOnRounded
                        sx={{
                          mr: 0.7,

                          color: "text.secondary",
                        }}
                      />
                    }
                    sx={{
                      minWidth: {
                        xs: "100%",
                        md: 200,
                      },

                      minHeight: 54,

                      borderRadius: 2.5,

                      "& fieldset": {
                        border: "none",
                      },
                    }}
                  >
                    <MenuItem value={ALL_CITIES}>All Cities</MenuItem>

                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<SearchRounded />}
                    onClick={handleSearch}
                    sx={{
                      minWidth: {
                        xs: "100%",
                        md: 190,
                      },

                      minHeight: 54,

                      borderRadius: 2.5,

                      fontWeight: 800,

                      boxShadow: "none",
                    }}
                  >
                    Search Libraries
                  </Button>
                </Stack>
              </Paper>

              {/* ============================================== */}
              {/* LIVE SUMMARY */}
              {/* ============================================== */}

              <Stack
                direction="row"
                spacing={{
                  xs: 2,
                  sm: 4,
                }}
                flexWrap="wrap"
                useFlexGap
                mt={3}
              >
                <Box>
                  <Typography color="#fff" fontWeight={850} fontSize={21}>
                    {loading ? "—" : formatNumber(summary.totalLibraries)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    Public Libraries
                  </Typography>
                </Box>

                <Box>
                  <Typography color="#fff" fontWeight={850} fontSize={21}>
                    {loading ? "—" : formatNumber(summary.totalSeats)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    Total Seats
                  </Typography>
                </Box>

                <Box>
                  <Typography color="#fff" fontWeight={850} fontSize={21}>
                    {loading ? "—" : formatNumber(summary.availableSeats)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    Available Now
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ====================================================== */}
      {/* FEATURE STRIP */}
      {/* ====================================================== */}

      <Box
        sx={{
          bgcolor: "background.paper",

          borderBottom: "1px solid",

          borderColor: "divider",

          boxShadow: "0 10px 30px rgba(15,23,42,.025)",
        }}
      >
        <Container maxWidth="xl">
          <Grid container>
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Grid
                  key={`${feature.title}-${feature.subtitle}`}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 2.4,
                  }}
                  sx={{
                    borderRight:
                      index !== platformFeatures.length - 1
                        ? {
                            md: "1px solid",
                          }
                        : "none",

                    borderColor: {
                      md: "divider",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.4}
                    alignItems="center"
                    justifyContent={{
                      xs: "flex-start",
                      md: "center",
                    }}
                    sx={{
                      py: 2.6,

                      px: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 46,

                        height: 46,

                        bgcolor: alpha(theme.palette.primary.main, 0.08),

                        color: "primary.main",
                      }}
                    >
                      <Icon fontSize="small" />
                    </Avatar>

                    <Box>
                      <Typography fontSize={14} fontWeight={800}>
                        {feature.title}
                      </Typography>

                      <Typography
                        fontSize={13}
                        color="text.secondary"
                        fontWeight={600}
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

      {/* ====================================================== */}
      {/* FEATURED LIBRARIES */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 5,
            md: 7,
          },
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "flex-end",
          }}
          spacing={2}
          mb={3.5}
        >
          <Box>
            <Chip
              icon={<WorkspacePremiumRounded />}
              label="Top Study Spaces"
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                mb: 1.4,

                fontWeight: 700,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,

                letterSpacing: "-0.045em",

                fontSize: {
                  xs: "2rem",
                  md: "2.6rem",
                },
              }}
            >
              Featured Libraries
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.8,

                maxWidth: 650,

                lineHeight: 1.7,
              }}
            >
              Explore highly rated publicly available libraries and check their
              current seat availability.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={
                refreshing ? <CircularProgress size={16} /> : <RefreshRounded />
              }
              disabled={refreshing}
              onClick={() =>
                loadLibraries({
                  refresh: true,
                })
              }
              sx={{
                borderRadius: 2.5,

                fontWeight: 700,
              }}
            >
              Refresh
            </Button>

            <Button
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate("/libraries")}
              sx={{
                fontWeight: 750,
              }}
            >
              View All
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="error"
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
            {[1, 2, 3].map((item) => (
              <Grid
                key={item}
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <LibraryCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : featuredLibraries.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 8,

              px: 3,

              borderRadius: 4,

              textAlign: "center",

              border: "1px solid",

              borderColor: "divider",
            }}
          >
            <ApartmentRounded
              sx={{
                fontSize: 58,

                color: "text.disabled",
              }}
            />

            <Typography variant="h5" fontWeight={800} mt={1.5}>
              No Public Libraries Yet
            </Typography>

            <Typography color="text.secondary" mt={0.7}>
              Publicly available libraries will appear here once owners publish
              them.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/libraries")}
              sx={{
                mt: 2.5,

                borderRadius: 2.5,

                fontWeight: 750,

                boxShadow: "none",
              }}
            >
              Browse Libraries
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {featuredLibraries.map((library) => (
              <Grid
                key={library.id}
                size={{
                  xs: 12,
                  md: 4,
                }}
                sx={{
                  display: "flex",
                }}
              >
                <LibraryCard library={library} onOpen={handleOpenLibrary} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* ====================================================== */}
      {/* HOW IT WORKS */}
      {/* ====================================================== */}

      <Box
        sx={{
          bgcolor: "background.paper",

          py: {
            xs: 6,
            md: 8,
          },
        }}
      >
        <Container maxWidth="xl">
          <Box textAlign="center" maxWidth={720} mx="auto" mb={5}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,

                letterSpacing: "-0.045em",

                fontSize: {
                  xs: "2rem",
                  md: "2.5rem",
                },
              }}
            >
              Booking a study seat is simple
            </Typography>

            <Typography color="text.secondary" mt={1} lineHeight={1.7}>
              Browse publicly first. Sign in only when you are ready to complete
              your booking.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {[
              {
                number: "01",
                icon: SearchRounded,
                title: "Discover a Library",
                description:
                  "Search by library name or city and compare available study spaces.",
              },

              {
                number: "02",
                icon: WorkspacePremiumRounded,
                title: "Choose a Plan",
                description:
                  "Review the library's active membership plans and seat-type pricing.",
              },

              {
                number: "03",
                icon: ChairRounded,
                title: "Choose Your Seat",
                description:
                  "Select floor, slot, date and an available seat from the live seat map.",
              },

              {
                number: "04",
                icon: CheckCircleRounded,
                title: "Book Securely",
                description:
                  "Sign in when you are ready and complete the protected booking and payment flow.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <Grid
                  key={item.number}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 3,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      height: "100%",

                      p: 3,

                      borderRadius: 4,

                      border: "1px solid",

                      borderColor: "divider",

                      position: "relative",

                      overflow: "hidden",

                      transition: "all .2s ease",

                      "&:hover": {
                        transform: "translateY(-4px)",

                        boxShadow: "0 18px 40px rgba(15,23,42,.08)",

                        borderColor: alpha(theme.palette.primary.main, 0.25),
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        position: "absolute",

                        right: 18,

                        top: 12,

                        fontSize: 48,

                        fontWeight: 900,

                        color: alpha(theme.palette.primary.main, 0.055),
                      }}
                    >
                      {item.number}
                    </Typography>

                    <Avatar
                      sx={{
                        width: 52,

                        height: 52,

                        bgcolor: alpha(theme.palette.primary.main, 0.09),

                        color: "primary.main",

                        mb: 2,
                      }}
                    >
                      <Icon />
                    </Avatar>

                    <Typography variant="h6" fontWeight={850}>
                      {item.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 1,

                        lineHeight: 1.7,
                      }}
                    >
                      {item.description}
                    </Typography>

                    {index < 3 && (
                      <ArrowForwardRounded
                        sx={{
                          mt: 2,

                          color: "primary.main",
                        }}
                      />
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ====================================================== */}
      {/* BOTTOM CTA */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 5,
            md: 7,
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: "relative",

            overflow: "hidden",

            p: {
              xs: 3.5,
              md: 5,
            },

            borderRadius: 5,

            color: "#fff",

            background:
              "linear-gradient(135deg,#071A37 0%,#0B3D82 55%,#146EF5 130%)",

            boxShadow: "0 28px 70px rgba(10,55,125,.18)",
          }}
        >
          <Box
            sx={{
              position: "absolute",

              width: 300,

              height: 300,

              borderRadius: "50%",

              bgcolor: "rgba(255,255,255,.055)",

              right: -90,

              top: -130,
            }}
          />

          <Grid
            container
            spacing={3}
            alignItems="center"
            sx={{
              position: "relative",

              zIndex: 1,
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 8,
              }}
            >
              <Chip
                label="LibraryHub"
                sx={{
                  mb: 1.5,

                  bgcolor: "rgba(255,255,255,.12)",

                  color: "#fff",

                  fontWeight: 750,
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,

                  letterSpacing: "-0.045em",

                  fontSize: {
                    xs: "2rem",
                    md: "2.7rem",
                  },
                }}
              >
                A better study space starts here.
              </Typography>

              <Typography
                sx={{
                  mt: 1.3,

                  color: "rgba(255,255,255,.72)",

                  maxWidth: 650,

                  lineHeight: 1.7,
                }}
              >
                Explore libraries, membership plans, available slots and
                seats—all before creating a booking.
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                  md: "column",
                }}
                spacing={1.3}
                alignItems={{
                  md: "stretch",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRounded />}
                  onClick={() => navigate("/libraries")}
                  sx={{
                    minHeight: 52,

                    borderRadius: 2.5,

                    bgcolor: "#fff",

                    color: "#0B4FA7",

                    fontWeight: 850,

                    boxShadow: "none",

                    "&:hover": {
                      bgcolor: "#F4F8FF",
                    },
                  }}
                >
                  Explore Libraries
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;
