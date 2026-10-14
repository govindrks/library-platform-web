import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Rating,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  ArrowBack,
  ArrowForward,
  Call,
  ChevronLeft,
  ChevronRight,
  Close,
  Description,
  EventSeat,
  ImageOutlined,
  LocationOn,
  Map,
  Place,
  Star,
  Wifi,
  WorkspacePremium,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

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

const getAmenityName = (amenity) => {
  if (amenity == null) {
    return null;
  }

  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity.name || amenity.amenityName || amenity.label || null;
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 5);
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ icon, value, label }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Box
            sx={{
              display: "flex",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>

            <Typography color="text.secondary">{label}</Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// STUDENT LIBRARY DETAILS
// ============================================================

function StudentLibraryDetails() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const { libraryId } = useParams();

  const navigate = useNavigate();

  // ==========================================================
  // LIBRARY STATE
  // ==========================================================

  const [library, setLibrary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // IMAGE SLIDER STATE
  // ==========================================================

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  const [sliderPaused, setSliderPaused] = useState(false);

  // ==========================================================
  // RATING SUMMARY
  // ==========================================================

  const [ratingSummary, setRatingSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  // ==========================================================
  // CURRENT STUDENT REVIEW
  // ==========================================================

  const [existingReview, setExistingReview] = useState(null);

  const [loadingReview, setLoadingReview] = useState(false);

  const [studentRating, setStudentRating] = useState(0);

  const [reviewComment, setReviewComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewSuccess, setReviewSuccess] = useState("");

  const [reviewError, setReviewError] = useState("");

  // ==========================================================
  // LOAD LIBRARY
  // ==========================================================

  const loadLibrary = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const data = await studentLibraryApi.getById(libraryId);

      setLibrary(data || null);
    } catch (requestError) {
      console.error("Student library details failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load library details.",
      );
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  // ==========================================================
  // LOAD RATING SUMMARY
  // ==========================================================

  const loadRatingSummary = useCallback(async () => {
    if (!libraryId) {
      return;
    }

    try {
      const data = await studentLibraryApi.getRatingSummary(libraryId);

      setRatingSummary({
        averageRating: Number(data?.averageRating ?? 0),

        totalReviews: Number(data?.totalReviews ?? 0),
      });
    } catch (requestError) {
      console.error("Unable to load library rating summary:", requestError);

      setRatingSummary({
        averageRating: 0,
        totalReviews: 0,
      });
    }
  }, [libraryId]);

  // ==========================================================
  // LOAD CURRENT USER REVIEW
  // ==========================================================

  const loadMyReview = useCallback(async () => {
    if (!libraryId) {
      return;
    }

    try {
      setLoadingReview(true);

      const review = await studentLibraryApi.getMyReview(libraryId);

      if (!review) {
        setExistingReview(null);

        setStudentRating(0);

        setReviewComment("");

        return;
      }

      setExistingReview(review);

      setStudentRating(Number(review.rating ?? 0));

      setReviewComment(review.comment ?? "");
    } catch (requestError) {
      if (requestError?.response?.status === 404) {
        setExistingReview(null);

        setStudentRating(0);

        setReviewComment("");

        return;
      }

      console.error("Unable to load current student review:", requestError);
    } finally {
      setLoadingReview(false);
    }
  }, [libraryId]);

  // ==========================================================
  // INITIAL DATA LOAD
  // ==========================================================

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    loadRatingSummary();
  }, [loadRatingSummary]);

  useEffect(() => {
    loadMyReview();
  }, [loadMyReview]);

  // ==========================================================
  // AUTO CLEAR SUCCESS
  // ==========================================================

  useEffect(() => {
    if (!reviewSuccess) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setReviewSuccess("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [reviewSuccess]);

  // ==========================================================
  // AUTO CLEAR ERROR
  // ==========================================================

  useEffect(() => {
    if (!reviewError) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setReviewError("");
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [reviewError]);

  // ==========================================================
  // AMENITIES
  // ==========================================================

  const amenities = useMemo(() => {
    if (!Array.isArray(library?.amenities)) {
      return [];
    }

    return library.amenities.map(getAmenityName).filter(Boolean);
  }, [library]);

  // ==========================================================
  // GALLERY
  // ==========================================================

  const galleryImages = useMemo(() => {
    if (!library) {
      return [];
    }

    const images = Array.isArray(library.images) ? library.images : [];

    const normalized = images
      .map((image) => ({
        ...image,

        resolvedUrl: resolveImageUrl(image?.imageUrl),
      }))
      .filter((image) => image.resolvedUrl);

    const coverUrl = resolveImageUrl(library.coverImageUrl);

    if (
      coverUrl &&
      !normalized.some((image) => image.resolvedUrl === coverUrl)
    ) {
      normalized.unshift({
        id: "cover",

        imageUrl: library.coverImageUrl,

        resolvedUrl: coverUrl,

        imageType: "Cover",
      });
    }

    return normalized;
  }, [library]);

  // ==========================================================
  // KEEP IMAGE INDEX VALID
  // ==========================================================

  useEffect(() => {
    if (galleryImages.length === 0) {
      setSelectedImageIndex(0);

      return;
    }

    if (selectedImageIndex >= galleryImages.length) {
      setSelectedImageIndex(0);
    }
  }, [galleryImages.length, selectedImageIndex]);

  // ==========================================================
  // AUTOMATIC IMAGE SLIDER
  // ==========================================================

  useEffect(() => {
    if (galleryImages.length <= 1 || sliderPaused || imagePreviewOpen) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSelectedImageIndex(
        (previousIndex) => (previousIndex + 1) % galleryImages.length,
      );
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, [galleryImages.length, sliderPaused, imagePreviewOpen]);

  // ==========================================================
  // IMAGE SLIDER HANDLERS
  // ==========================================================

  const handlePreviousImage = () => {
    if (galleryImages.length === 0) {
      return;
    }

    setSelectedImageIndex((previousIndex) =>
      previousIndex === 0 ? galleryImages.length - 1 : previousIndex - 1,
    );
  };

  const handleNextImage = () => {
    if (galleryImages.length === 0) {
      return;
    }

    setSelectedImageIndex(
      (previousIndex) => (previousIndex + 1) % galleryImages.length,
    );
  };

  const handleOpenImagePreview = () => {
    if (galleryImages.length === 0) {
      return;
    }

    setSliderPaused(true);

    setImagePreviewOpen(true);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewOpen(false);

    setSliderPaused(false);
  };

  // ==========================================================
  // REVIEW SUBMIT / UPDATE
  // ==========================================================

  const handleSubmitReview = async () => {
    if (!studentRating) {
      setReviewError("Please select a rating.");

      return;
    }

    try {
      setSubmittingReview(true);

      setReviewError("");

      setReviewSuccess("");

      const wasExistingReview = Boolean(existingReview);

      const savedReview = await studentLibraryApi.submitReview(libraryId, {
        rating: studentRating,

        comment: reviewComment.trim(),
      });

      setExistingReview(
        savedReview ||
          existingReview || {
            rating: studentRating,

            comment: reviewComment.trim(),
          },
      );

      await Promise.all([loadLibrary(), loadRatingSummary(), loadMyReview()]);

      setReviewSuccess(
        wasExistingReview
          ? "Your review has been updated successfully."
          : "Your review has been submitted successfully.",
      );
    } catch (requestError) {
      console.error("Unable to submit library review:", requestError);

      setReviewError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to submit your review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{
          minHeight: 400,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">Loading library...</Typography>
      </Stack>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !library) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/student/libraries")}
          sx={{
            mb: 2,
            textTransform: "none",
          }}
        >
          Back to Libraries
        </Button>

        <Alert severity="error">{error || "Library not found."}</Alert>
      </Box>
    );
  }

  // ==========================================================
  // LIBRARY DATA
  // ==========================================================

  const totalSeats = Number(library.totalSeats ?? 0);

  const availableSeats = Number(library.availableSeats ?? 0);

  const occupiedSeats = Math.max(0, totalSeats - availableSeats);

  const occupancy =
    totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  // ==========================================================
  // RATING DATA
  // ==========================================================

  const averageRating = Number(ratingSummary.averageRating ?? 0);

  const reviewCount = Number(ratingSummary.totalReviews ?? 0);

  // ==========================================================
  // LOCATION DATA
  // ==========================================================

  const address = [library.address, library.city, library.state]
    .filter(Boolean)
    .join(", ");

  const latitude = library.latitude ?? library.lat ?? null;

  const longitude = library.longitude ?? library.lng ?? library.lon ?? null;

  const mapAvailable = latitude != null && longitude != null;

  // ==========================================================
  // SELECTED IMAGE
  // ==========================================================

  const selectedImage =
    galleryImages[selectedImageIndex] || galleryImages[0] || null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 4,
      }}
    >
      {/* ===================================================== */}
      {/* BACK */}
      {/* ===================================================== */}

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/libraries")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Back to Libraries
      </Button>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,

          overflow: "hidden",

          mb: 2.5,
        }}
      >
        <Grid container>
          {/* ================================================= */}
          {/* IMAGE SLIDER */}
          {/* ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <Box
              onMouseEnter={() => setSliderPaused(true)}
              onMouseLeave={() => {
                if (!imagePreviewOpen) {
                  setSliderPaused(false);
                }
              }}
              sx={{
                height: {
                  xs: 260,
                  md: 360,
                },

                bgcolor: "action.hover",

                position: "relative",

                overflow: "hidden",

                cursor: selectedImage ? "zoom-in" : "default",
              }}
            >
              {/* ============================================= */}
              {/* CURRENT IMAGE */}
              {/* ============================================= */}

              {selectedImage ? (
                <Box
                  key={selectedImage.resolvedUrl}
                  component="img"
                  src={selectedImage.resolvedUrl}
                  alt={library.name}
                  onClick={handleOpenImagePreview}
                  sx={{
                    width: "100%",

                    height: "100%",

                    objectFit: "cover",

                    display: "block",

                    animation: "libraryImageFade 0.45s ease",

                    transition: "transform 0.35s ease",

                    "&:hover": {
                      transform: "scale(1.015)",
                    },

                    "@keyframes libraryImageFade": {
                      from: {
                        opacity: 0.65,
                      },

                      to: {
                        opacity: 1,
                      },
                    },
                  }}
                />
              ) : (
                <Stack
                  sx={{
                    height: "100%",
                  }}
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                >
                  <ImageOutlined
                    sx={{
                      fontSize: 56,

                      color: "text.disabled",
                    }}
                  />

                  <Typography color="text.secondary">
                    No library image available
                  </Typography>
                </Stack>
              )}

              {/* ============================================= */}
              {/* PREVIOUS */}
              {/* ============================================= */}

              {galleryImages.length > 1 && (
                <IconButton
                  aria-label="Previous image"
                  onClick={(event) => {
                    event.stopPropagation();

                    handlePreviousImage();
                  }}
                  sx={{
                    position: "absolute",

                    left: 14,

                    top: "50%",

                    transform: "translateY(-50%)",

                    bgcolor: "rgba(255,255,255,0.92)",

                    color: "text.primary",

                    boxShadow: 2,

                    zIndex: 3,

                    "&:hover": {
                      bgcolor: "background.paper",
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              )}

              {/* ============================================= */}
              {/* NEXT */}
              {/* ============================================= */}

              {galleryImages.length > 1 && (
                <IconButton
                  aria-label="Next image"
                  onClick={(event) => {
                    event.stopPropagation();

                    handleNextImage();
                  }}
                  sx={{
                    position: "absolute",

                    right: 14,

                    top: "50%",

                    transform: "translateY(-50%)",

                    bgcolor: "rgba(255,255,255,0.92)",

                    color: "text.primary",

                    boxShadow: 2,

                    zIndex: 3,

                    "&:hover": {
                      bgcolor: "background.paper",
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              )}

              {/* ============================================= */}
              {/* DOT INDICATORS */}
              {/* ============================================= */}

              {galleryImages.length > 1 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    position: "absolute",

                    left: "50%",

                    bottom: 18,

                    transform: "translateX(-50%)",

                    zIndex: 3,
                  }}
                >
                  {galleryImages.map((image, index) => (
                    <Box
                      key={image.id || index}
                      onClick={(event) => {
                        event.stopPropagation();

                        setSelectedImageIndex(index);
                      }}
                      sx={{
                        width: selectedImageIndex === index ? 22 : 8,

                        height: 8,

                        borderRadius: 10,

                        bgcolor:
                          selectedImageIndex === index
                            ? "primary.main"
                            : "rgba(255,255,255,0.85)",

                        cursor: "pointer",

                        boxShadow: 1,

                        transition: "all 0.25s ease",
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* ============================================= */}
              {/* IMAGE COUNTER */}
              {/* ============================================= */}

              {galleryImages.length > 1 && (
                <Chip
                  size="small"
                  label={`${selectedImageIndex + 1} / ${galleryImages.length}`}
                  sx={{
                    position: "absolute",

                    right: 16,

                    bottom: 16,

                    bgcolor: "rgba(255,255,255,0.95)",

                    color: "text.primary",

                    fontWeight: 700,

                    boxShadow: 2,

                    zIndex: 3,

                    pointerEvents: "none",

                    "& .MuiChip-label": {
                      color: "text.primary",
                    },
                  }}
                />
              )}
            </Box>
          </Grid>

          {/* ================================================= */}
          {/* LIBRARY INFORMATION */}
          {/* ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 4,
                },

                height: "100%",
              }}
            >
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "2rem",

                    md: "2.7rem",
                  },
                }}
              >
                {library.name}
              </Typography>

              {/* ============================================= */}
              {/* RATING */}
              {/* ============================================= */}

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mt: 1.5,
                }}
              >
                <Star
                  sx={{
                    color: "warning.main",
                  }}
                />

                <Typography fontWeight={800}>
                  {averageRating.toFixed(1)}
                </Typography>

                <Typography color="text.secondary">
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </Typography>
              </Stack>

              {/* ============================================= */}
              {/* ADDRESS */}
              {/* ============================================= */}

              {address && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  sx={{
                    mt: 2,
                  }}
                >
                  <LocationOn color="primary" />

                  <Typography>{address}</Typography>
                </Stack>
              )}

              {/* ============================================= */}
              {/* HOURS */}
              {/* ============================================= */}

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 2,
                }}
              >
                <AccessTime color="primary" />

                <Typography>
                  {formatTime(library.openingTime)} -{" "}
                  {formatTime(library.closingTime)}
                </Typography>
              </Stack>

              {/* ============================================= */}
              {/* ACTIONS */}
              {/* ============================================= */}

              <Stack
                spacing={1.5}
                sx={{
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<WorkspacePremium />}
                  endIcon={<ArrowForward />}
                  onClick={() =>
                    navigate(`/student/libraries/${libraryId}/plans`, {
                      state: {
                        library,
                      },
                    })
                  }
                  sx={{
                    textTransform: "none",

                    fontWeight: 700,

                    borderRadius: 2,
                  }}
                >
                  View Membership Plans
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EventSeat />}
                  onClick={() =>
                    navigate(`/student/libraries/${libraryId}/book-seat`, {
                      state: {
                        library,
                      },
                    })
                  }
                  sx={{
                    textTransform: "none",

                    fontWeight: 700,

                    borderRadius: 2,
                  }}
                >
                  Check Seat Availability
                </Button>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      {/* ===================================================== */}
      {/* SEAT STATISTICS */}
      {/* ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                sx={{
                  fontSize: 42,
                }}
              />
            }
            value={totalSeats}
            label="Total Seats"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                color="success"
                sx={{
                  fontSize: 42,
                }}
              />
            }
            value={availableSeats}
            label="Available Seats"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                color="disabled"
                sx={{
                  fontSize: 42,
                }}
              />
            }
            value={`${occupancy}%`}
            label={`${occupiedSeats} Occupied`}
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* ABOUT + HOURS */}
      {/* ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              border: "1px solid",

              borderColor: "divider",

              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <Description color="primary" />

                <Typography variant="h6" fontWeight={800}>
                  About Library
                </Typography>
              </Stack>

              <Typography color="text.secondary" lineHeight={1.75}>
                {library.description ||
                  "No description has been provided for this library yet."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              border: "1px solid",

              borderColor: "divider",

              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <AccessTime color="primary" />

                <Typography variant="h6" fontWeight={800}>
                  Operating Hours
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 2.5,

                  borderRadius: 2,

                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  {formatTime(library.openingTime)} -{" "}
                  {formatTime(library.closingTime)}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Library operating hours
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* RATE LIBRARY */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,

          mb: 2.5,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
          }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Star
                  sx={{
                    color: "warning.main",
                  }}
                />

                <Typography variant="h6" fontWeight={800}>
                  Rate this Library
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                }}
              >
                Share your experience and help other students choose the right
                study space.
              </Typography>
            </Box>

            {/* =============================================== */}
            {/* CURRENT RATING */}
            {/* =============================================== */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              alignItems={{
                xs: "flex-start",

                sm: "center",
              }}
              spacing={1.5}
            >
              <Rating value={averageRating} precision={0.1} readOnly />

              <Typography fontWeight={800}>
                {averageRating.toFixed(1)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Based on {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </Typography>
            </Stack>

            <Divider />

            {/* =============================================== */}
            {/* USER RATING */}
            {/* =============================================== */}

            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Your Rating
                </Typography>

                {existingReview && (
                  <Chip
                    size="small"
                    label="Your existing review"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>

              {loadingReview ? (
                <CircularProgress size={24} />
              ) : (
                <Rating
                  value={studentRating}
                  onChange={(_event, value) => {
                    setStudentRating(value ?? 0);

                    setReviewError("");

                    setReviewSuccess("");
                  }}
                  size="large"
                />
              )}
            </Box>

            {/* =============================================== */}
            {/* COMMENT */}
            {/* =============================================== */}

            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              label="Your Review"
              placeholder="What did you like about this library? Share your experience..."
              value={reviewComment}
              onChange={(event) => {
                setReviewComment(event.target.value);

                setReviewError("");

                setReviewSuccess("");
              }}
              slotProps={{
                htmlInput: {
                  maxLength: 1000,
                },
              }}
              helperText={`${reviewComment.length}/1000`}
            />

            {reviewError && (
              <Alert severity="error" onClose={() => setReviewError("")}>
                {reviewError}
              </Alert>
            )}

            {reviewSuccess && (
              <Alert severity="success" onClose={() => setReviewSuccess("")}>
                {reviewSuccess}
              </Alert>
            )}

            <Box>
              <Button
                variant="contained"
                startIcon={
                  submittingReview ? (
                    <CircularProgress size={17} color="inherit" />
                  ) : (
                    <Star />
                  )
                }
                disabled={submittingReview || loadingReview || !studentRating}
                onClick={handleSubmitReview}
                sx={{
                  textTransform: "none",

                  borderRadius: 2,

                  fontWeight: 700,

                  px: 3,

                  minWidth: 170,
                }}
              >
                {submittingReview
                  ? "Saving..."
                  : existingReview
                    ? "Update Review"
                    : "Submit Review"}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* AMENITIES */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,

          mb: 2.5,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2,
            }}
          >
            <Wifi color="primary" />

            <Typography variant="h6" fontWeight={800}>
              Amenities
            </Typography>
          </Stack>

          {amenities.length === 0 ? (
            <Typography color="text.secondary">
              No amenities are currently listed.
            </Typography>
          ) : (
            <Grid container spacing={1.5}>
              {amenities.map((amenity, index) => (
                <Grid
                  key={`${amenity}-${index}`}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <Box
                    sx={{
                      border: "1px solid",

                      borderColor: "divider",

                      borderRadius: 2,

                      p: 1.5,

                      textAlign: "center",

                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography fontWeight={600}>{amenity}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* GALLERY THUMBNAILS */}
      {/* ===================================================== */}

      {galleryImages.length > 0 && (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,

            mb: 2.5,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mb: 2,
              }}
            >
              <ImageOutlined color="primary" />

              <Typography variant="h6" fontWeight={800}>
                Library Gallery
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {galleryImages.map((image, index) => (
                <Grid
                  key={image.id || `${image.resolvedUrl}-${index}`}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                >
                  <Box
                    onClick={() => {
                      setSelectedImageIndex(index);

                      setSliderPaused(true);

                      setImagePreviewOpen(true);
                    }}
                    sx={{
                      cursor: "zoom-in",

                      border: "2px solid",

                      borderColor:
                        selectedImageIndex === index
                          ? "primary.main"
                          : "transparent",

                      borderRadius: 2,

                      overflow: "hidden",

                      transition: "0.2s ease",

                      "&:hover": {
                        transform: "translateY(-2px)",

                        boxShadow: 2,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={image.resolvedUrl}
                      alt={image.imageType || library.name}
                      sx={{
                        width: "100%",

                        height: 170,

                        objectFit: "cover",

                        display: "block",
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ===================================================== */}
      {/* CONTACT & LOCATION */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2,
            }}
          >
            <Place color="primary" />

            <Typography variant="h6" fontWeight={800}>
              Contact & Location
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
            >
              <Box
                sx={{
                  p: 2.5,

                  height: "100%",

                  borderRadius: 2,

                  bgcolor: "action.hover",
                }}
              >
                {address && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="flex-start"
                    sx={{
                      mb: 2,
                    }}
                  >
                    <LocationOn color="primary" />

                    <Typography>{address}</Typography>
                  </Stack>
                )}

                {library.contactNumber && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Call color="primary" />

                    <Typography>{library.contactNumber}</Typography>
                  </Stack>
                )}

                {mapAvailable && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Map color="primary" />

                    <Typography variant="body2" color="text.secondary">
                      {latitude}, {longitude}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>

            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
            >
              {mapAvailable ? (
                <Box
                  component="iframe"
                  title={`${library.name} location`}
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  sx={{
                    border: 0,

                    width: "100%",

                    height: 280,

                    borderRadius: 2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 280,

                    borderRadius: 2,

                    bgcolor: "action.hover",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <Map
                      sx={{
                        fontSize: 42,

                        color: "text.disabled",
                      }}
                    />

                    <Typography color="text.secondary">
                      Map coordinates unavailable.
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* FULL SCREEN IMAGE PREVIEW */}
      {/* ===================================================== */}

      <Dialog
        open={imagePreviewOpen}
        onClose={handleCloseImagePreview}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "rgba(15, 15, 20, 0.98)",

              borderRadius: 3,

              overflow: "hidden",
            },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,

            position: "relative",

            minHeight: {
              xs: 420,

              md: 650,
            },

            display: "flex",

            alignItems: "center",

            justifyContent: "center",
          }}
        >
          {/* =============================================== */}
          {/* CLOSE */}
          {/* =============================================== */}

          <IconButton
            aria-label="Close image preview"
            onClick={handleCloseImagePreview}
            sx={{
              position: "absolute",

              top: 16,

              right: 16,

              zIndex: 10,

              bgcolor: "rgba(255,255,255,0.92)",

              color: "text.primary",

              boxShadow: 2,

              "&:hover": {
                bgcolor: "background.paper",
              },
            }}
          >
            <Close />
          </IconButton>

          {/* =============================================== */}
          {/* PREVIOUS */}
          {/* =============================================== */}

          {galleryImages.length > 1 && (
            <IconButton
              aria-label="Previous image"
              onClick={handlePreviousImage}
              sx={{
                position: "absolute",

                left: {
                  xs: 10,

                  md: 24,
                },

                top: "50%",

                transform: "translateY(-50%)",

                zIndex: 10,

                bgcolor: "rgba(255,255,255,0.92)",

                color: "text.primary",

                boxShadow: 2,

                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>
          )}

          {/* =============================================== */}
          {/* LARGE IMAGE */}
          {/* =============================================== */}

          {selectedImage && (
            <Box
              key={selectedImage.resolvedUrl}
              component="img"
              src={selectedImage.resolvedUrl}
              alt={library.name}
              sx={{
                width: "100%",

                height: {
                  xs: 420,

                  md: 650,
                },

                objectFit: "contain",

                userSelect: "none",

                animation: "previewImageFade 0.3s ease",

                "@keyframes previewImageFade": {
                  from: {
                    opacity: 0.6,
                  },

                  to: {
                    opacity: 1,
                  },
                },
              }}
            />
          )}

          {/* =============================================== */}
          {/* NEXT */}
          {/* =============================================== */}

          {galleryImages.length > 1 && (
            <IconButton
              aria-label="Next image"
              onClick={handleNextImage}
              sx={{
                position: "absolute",

                right: {
                  xs: 10,

                  md: 24,
                },

                top: "50%",

                transform: "translateY(-50%)",

                zIndex: 10,

                bgcolor: "rgba(255,255,255,0.92)",

                color: "text.primary",

                boxShadow: 2,

                "&:hover": {
                  bgcolor: "background.paper",
                },
              }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>
          )}

          {/* =============================================== */}
          {/* IMAGE COUNTER */}
          {/* =============================================== */}

          {galleryImages.length > 1 && (
            <Chip
              label={`${selectedImageIndex + 1} / ${galleryImages.length}`}
              sx={{
                position: "absolute",

                bottom: 20,

                left: "50%",

                transform: "translateX(-50%)",

                bgcolor: "rgba(255,255,255,0.92)",

                color: "text.primary",

                fontWeight: 700,

                zIndex: 10,

                "& .MuiChip-label": {
                  color: "text.primary",
                },
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default StudentLibraryDetails;
