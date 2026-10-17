import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  ArrowForward,
  EventSeat,
  ImageOutlined,
  LibraryBooks,
  LocationOn,
  Search,
  Star,
} from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import studentLibraryApi from "../../../api/studentLibraryApi";

// ============================================================
// HELPERS
// ============================================================

const resolveImageUrl = (url) => {
  if (!url) {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

// ============================================================
// OPERATING HOURS HELPERS
// ============================================================

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const getOperatingHours = (library) => {
  if (library?.open24Hours === true) {
    return {
      label: "Open 24 Hours",

      configured: true,

      open24Hours: true,
    };
  }

  if (library?.openingTime && library?.closingTime) {
    return {
      label: `${formatTime(library.openingTime)} - ${formatTime(
        library.closingTime,
      )}`,

      configured: true,

      open24Hours: false,
    };
  }

  return {
    label: "Hours not configured",

    configured: false,

    open24Hours: false,
  };
};

// ============================================================
// COMPONENT
// ============================================================

function BrowseLibraries() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [libraries, setLibraries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const data = await studentLibraryApi.getAll();

      setLibraries(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Student library discovery failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load libraries.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = async (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      await loadLibraries();

      return;
    }

    try {
      setLoading(true);

      setError("");

      const data = await studentLibraryApi.searchByName(value);

      setLibraries(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Library search failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to search libraries.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SEARCH INPUT CHANGE
  // ==========================================================

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);

    if (value === "") {
      loadLibraries();
    }
  };

  // ==========================================================
  // VIEW LIBRARY
  // ==========================================================

  const handleViewLibrary = (libraryId) => {
    if (!libraryId) {
      return;
    }

    navigate(`/student/libraries/${libraryId}`);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1480,

        mx: "auto",

        pb: 5,
      }}
    >
      {/* ===================================================== */}
      {/* HERO / SEARCH */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3.5,

          borderRadius: 4,

          border: "1px solid",

          borderColor: "rgba(79, 70, 229, 0.12)",

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,1) 48%, rgba(99,102,241,0.05) 100%)",

          overflow: "hidden",

          position: "relative",

          "&::before": {
            content: '""',

            position: "absolute",

            width: 220,

            height: 220,

            borderRadius: "50%",

            right: -90,

            top: -120,

            background: "rgba(79,70,229,0.08)",
          },

          "&::after": {
            content: '""',

            position: "absolute",

            width: 120,

            height: 120,

            borderRadius: "50%",

            left: "42%",

            bottom: -85,

            background: "rgba(99,102,241,0.045)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: {
              xs: 2.5,

              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,

                md: 3.5,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",

              lg: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",

              lg: "center",
            }}
            spacing={3}
          >
            {/* ============================================= */}
            {/* TITLE */}
            {/* ============================================= */}

            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,

                  height: 58,

                  minWidth: 58,

                  borderRadius: 3,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  boxShadow: "0 10px 28px rgba(79,70,229,0.24)",
                }}
              >
                <LibraryBooks
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    lineHeight: 1.15,

                    letterSpacing: "-0.02em",
                  }}
                >
                  Browse Libraries
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    maxWidth: 620,
                  }}
                >
                  Discover study spaces, compare availability and find the right
                  library for your routine.
                </Typography>
              </Box>
            </Stack>

            {/* ============================================= */}
            {/* SEARCH */}
            {/* ============================================= */}

            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                width: {
                  xs: "100%",

                  lg: 460,
                },

                flexShrink: 0,
              }}
            >
              <TextField
                fullWidth
                value={search}
                onChange={handleSearchChange}
                placeholder="Search library by name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          sx={{
                            color: "primary.main",
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 52,

                    borderRadius: 3,

                    bgcolor: "background.paper",

                    boxShadow: "0 6px 22px rgba(15,23,42,0.05)",

                    transition: "box-shadow 0.2s ease",

                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    },

                    "&.Mui-focused": {
                      boxShadow: "0 8px 28px rgba(79,70,229,0.12)",
                    },
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* RESULTS HEADER */}
      {/* ===================================================== */}

      {!loading && (
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
          spacing={1}
          sx={{
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Available Libraries
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              {search.trim()
                ? `Search results for "${search.trim()}"`
                : "Explore active libraries available on LibraryHub."}
            </Typography>
          </Box>

          <Chip
            icon={<LibraryBooks />}
            label={`${libraries.length} ${
              libraries.length === 1 ? "Library" : "Libraries"
            }`}
            variant="outlined"
            color="primary"
            sx={{
              fontWeight: 700,

              borderRadius: 2,
            }}
          />
        </Stack>
      )}

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,

            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* LOADING */}
      {/* ===================================================== */}

      {loading ? (
        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm: "repeat(2, minmax(0, 1fr))",

              xl: "repeat(3, minmax(0, 1fr))",
            },

            gap: 3,
          }}
        >
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Card
              key={index}
              elevation={0}
              sx={{
                width: "100%",

                border: "1px solid",

                borderColor: "divider",

                borderRadius: 4,

                overflow: "hidden",
              }}
            >
              <Skeleton variant="rectangular" height={235} />

              <CardContent
                sx={{
                  p: 2.5,
                }}
              >
                <Skeleton width="55%" height={34} />

                <Skeleton width="36%" height={23} />

                <Skeleton
                  width="50%"
                  height={24}
                  sx={{
                    mt: 1,
                  }}
                />

                <Skeleton
                  height={64}
                  sx={{
                    mt: 1.4,

                    borderRadius: 2,
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Skeleton width={110} height={32} />

                  <Skeleton width={85} height={32} />
                </Stack>

                <Skeleton
                  height={55}
                  sx={{
                    mt: 2.5,

                    borderRadius: 2,
                  }}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : libraries.length === 0 ? (
        /* ================================================= */
        /* EMPTY STATE                                       */
        /* ================================================= */

        <Card
          elevation={0}
          sx={{
            border: "1px dashed",

            borderColor: "divider",

            borderRadius: 4,

            minHeight: 340,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background:
              "linear-gradient(145deg, rgba(248,250,252,0.8), rgba(255,255,255,1))",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",

              py: 6,

              px: 3,
            }}
          >
            <Box
              sx={{
                width: 72,

                height: 72,

                mx: "auto",

                mb: 2,

                borderRadius: "50%",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "rgba(79,70,229,0.08)",

                color: "primary.main",
              }}
            >
              <Search
                sx={{
                  fontSize: 36,
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight={800}>
              No libraries found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.75,

                mb: 2.5,

                maxWidth: 420,
              }}
            >
              We couldn't find a library matching your current search. Try
              another library name.
            </Typography>

            {search && (
              <Button
                variant="contained"
                onClick={() => {
                  setSearch("");

                  loadLibraries();
                }}
                sx={{
                  textTransform: "none",

                  borderRadius: 2.5,

                  fontWeight: 700,

                  px: 2.5,
                }}
              >
                Show All Libraries
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ================================================= */
        /* LIBRARY CARDS                                     */
        /* ================================================= */

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",

              sm: "repeat(2, minmax(0, 1fr))",

              xl: "repeat(3, minmax(0, 1fr))",
            },

            gap: 3,

            alignItems: "stretch",
          }}
        >
          {libraries.map((library) => {
            const coverImage = resolveImageUrl(library.coverImageUrl);

            const totalSeats = Number(library.totalSeats ?? 0);

            const availableSeats = Number(library.availableSeats ?? 0);

            const averageRating = Number(library.averageRating ?? 0);

            const reviewCount = Number(library.reviewCount ?? 0);

            const operatingHours = getOperatingHours(library);

            const occupancy =
              totalSeats > 0
                ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
                : 0;

            return (
              <Card
                key={library.id}
                elevation={0}
                onClick={() => handleViewLibrary(library.id)}
                sx={{
                  width: "100%",

                  maxWidth: 470,

                  height: "100%",

                  minWidth: 0,

                  display: "flex",

                  flexDirection: "column",

                  border: "1px solid",

                  borderColor: "divider",

                  borderRadius: 4,

                  overflow: "hidden",

                  bgcolor: "background.paper",

                  cursor: "pointer",

                  transition:
                    "transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease",

                  "&:hover": {
                    transform: "translateY(-6px)",

                    boxShadow: "0 16px 38px rgba(15,23,42,0.10)",

                    borderColor: "primary.light",
                  },
                }}
              >
                {/* ======================================= */}
                {/* IMAGE */}
                {/* ======================================= */}

                <Box
                  sx={{
                    position: "relative",

                    height: {
                      xs: 220,

                      sm: 225,

                      lg: 235,
                    },

                    bgcolor: "action.hover",

                    overflow: "hidden",
                  }}
                >
                  {coverImage ? (
                    <Box
                      component="img"
                      src={coverImage}
                      alt={library.name || "Library"}
                      sx={{
                        width: "100%",

                        height: "100%",

                        objectFit: "cover",

                        display: "block",

                        transition: "transform 0.45s ease",

                        ".MuiCard-root:hover &": {
                          transform: "scale(1.055)",
                        },
                      }}
                    />
                  ) : (
                    <Stack
                      sx={{
                        height: "100%",

                        background:
                          "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(148,163,184,0.08))",
                      }}
                      alignItems="center"
                      justifyContent="center"
                      spacing={1}
                    >
                      <ImageOutlined
                        sx={{
                          fontSize: 52,

                          color: "text.disabled",
                        }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        No cover image
                      </Typography>
                    </Stack>
                  )}

                  {/* IMAGE GRADIENT */}

                  <Box
                    sx={{
                      position: "absolute",

                      inset: 0,

                      pointerEvents: "none",

                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.02) 45%, rgba(0,0,0,0.26) 100%)",
                    }}
                  />

                  {/* AVAILABILITY */}

                  <Chip
                    size="small"
                    icon={<EventSeat />}
                    label={
                      availableSeats > 0
                        ? `${availableSeats} seats available`
                        : "Currently full"
                    }
                    sx={{
                      position: "absolute",

                      top: 14,

                      right: 14,

                      minHeight: 32,

                      px: 0.5,

                      borderRadius: 2.5,

                      fontWeight: 800,

                      bgcolor: availableSeats > 0 ? "success.main" : "grey.700",

                      color: "common.white",

                      boxShadow: "0 5px 16px rgba(0,0,0,0.18)",

                      "& .MuiChip-label": {
                        px: 1,

                        color: "common.white",
                      },

                      "& .MuiChip-icon": {
                        color: "common.white",

                        ml: 0.75,
                      },
                    }}
                  />

                  {/* OCCUPANCY */}

                  {totalSeats > 0 && (
                    <Chip
                      size="small"
                      label={`${occupancy}% occupied`}
                      sx={{
                        position: "absolute",

                        left: 14,

                        bottom: 14,

                        bgcolor: "rgba(15,23,42,0.78)",

                        color: "common.white",

                        backdropFilter: "blur(8px)",

                        fontWeight: 700,

                        "& .MuiChip-label": {
                          color: "common.white",
                        },
                      }}
                    />
                  )}
                </Box>

                {/* ======================================= */}
                {/* CONTENT */}
                {/* ======================================= */}

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
                    spacing={1.6}
                    sx={{
                      height: "100%",
                    }}
                  >
                    {/* ================================= */}
                    {/* NAME */}
                    {/* ================================= */}

                    <Box>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        noWrap
                        title={library.name}
                        sx={{
                          fontSize: "1.18rem",

                          letterSpacing: "-0.01em",
                        }}
                      >
                        {library.name || "Unnamed Library"}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        sx={{
                          mt: 0.75,
                        }}
                      >
                        <LocationOn
                          fontSize="small"
                          sx={{
                            color: "primary.main",
                          }}
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {[library.city, library.state]
                            .filter(Boolean)
                            .join(", ") || "Location unavailable"}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* ================================= */}
                    {/* RATING */}
                    {/* ================================= */}

                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Box
                        sx={{
                          width: 30,

                          height: 30,

                          borderRadius: 1.5,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          bgcolor: "rgba(245,158,11,0.10)",
                        }}
                      >
                        <Star
                          fontSize="small"
                          sx={{
                            color: "warning.main",
                          }}
                        />
                      </Box>

                      <Typography variant="body2" fontWeight={800}>
                        {averageRating.toFixed(1)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {reviewCount === 0
                          ? "No reviews yet"
                          : `(${reviewCount} ${
                              reviewCount === 1 ? "review" : "reviews"
                            })`}
                      </Typography>
                    </Stack>

                    {/* ================================= */}
                    {/* OPERATING HOURS */}
                    {/* ================================= */}

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        px: 1.25,

                        py: 1.1,

                        borderRadius: 2.3,

                        bgcolor: operatingHours.configured
                          ? operatingHours.open24Hours
                            ? "rgba(34,197,94,0.07)"
                            : "rgba(79,70,229,0.055)"
                          : "action.hover",

                        border: "1px solid",

                        borderColor: operatingHours.configured
                          ? operatingHours.open24Hours
                            ? "rgba(34,197,94,0.16)"
                            : "rgba(79,70,229,0.12)"
                          : "divider",
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,

                          height: 32,

                          flexShrink: 0,

                          borderRadius: 1.6,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          bgcolor: operatingHours.configured
                            ? operatingHours.open24Hours
                              ? "rgba(34,197,94,0.11)"
                              : "rgba(79,70,229,0.10)"
                            : "action.hover",

                          color: operatingHours.configured
                            ? operatingHours.open24Hours
                              ? "success.main"
                              : "primary.main"
                            : "text.disabled",
                        }}
                      >
                        <AccessTime
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,

                          flex: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",

                            lineHeight: 1.2,

                            fontWeight: 600,
                          }}
                        >
                          Operating Hours
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={800}
                          noWrap
                          sx={{
                            mt: 0.25,

                            color: operatingHours.open24Hours
                              ? "success.dark"
                              : "text.primary",
                          }}
                        >
                          {operatingHours.label}
                        </Typography>
                      </Box>

                      {operatingHours.open24Hours && (
                        <Chip
                          size="small"
                          label="24/7"
                          color="success"
                          sx={{
                            height: 24,

                            fontWeight: 800,

                            "& .MuiChip-label": {
                              px: 0.9,
                            },
                          }}
                        />
                      )}
                    </Stack>

                    {/* ================================= */}
                    {/* SEAT INFORMATION */}
                    {/* ================================= */}

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        size="small"
                        icon={<EventSeat />}
                        label={`${availableSeats} Available`}
                        sx={{
                          fontWeight: 700,

                          bgcolor:
                            availableSeats > 0
                              ? "rgba(34,197,94,0.09)"
                              : "action.hover",

                          color:
                            availableSeats > 0
                              ? "success.dark"
                              : "text.secondary",

                          "& .MuiChip-icon": {
                            color: "inherit",
                          },
                        }}
                      />

                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${totalSeats} Total`}
                        sx={{
                          fontWeight: 700,

                          bgcolor: "background.paper",
                        }}
                      />
                    </Stack>

                    {/* ================================= */}
                    {/* SPACER */}
                    {/* ================================= */}

                    <Box
                      sx={{
                        flex: 1,
                      }}
                    />

                    {/* ================================= */}
                    {/* ACTION */}
                    {/* ================================= */}

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={(event) => {
                        event.stopPropagation();

                        handleViewLibrary(library.id);
                      }}
                      sx={{
                        minHeight: 48,

                        mt: 0.5,

                        textTransform: "none",

                        borderRadius: 2.5,

                        fontWeight: 800,

                        boxShadow: "0 7px 18px rgba(79,70,229,0.20)",

                        transition: "all 0.2s ease",

                        "&:hover": {
                          transform: "translateY(-1px)",

                          boxShadow: "0 9px 22px rgba(79,70,229,0.26)",
                        },
                      }}
                    >
                      View Library
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default BrowseLibraries;
