import {
  AccessTime,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  EmailOutlined,
  EventSeat,
  ImageOutlined,
  LocationOn,
  PhoneOutlined,
  PublicOutlined,
  Refresh,
  Schedule,
  WorkspacePremium,
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
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import membershipPlanApi from "../../api/membershipPlanApi";

import getImageUrl from "../../utility/imageUrl";

// ============================================================
// IMAGE ROLES
// ============================================================

const IMAGE_ROLES = {
  PROFILE: "PROFILE",
  COVER: "COVER",
  GALLERY: "GALLERY",
};

// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message || responseData?.error || error?.message || fallback
  );
};

// ============================================================
// IMAGE ROLE
// ============================================================

const resolveImageRole = (image) => {
  if (image?.imageRole) {
    return image.imageRole;
  }

  if (image?.profile) {
    return IMAGE_ROLES.PROFILE;
  }

  if (image?.cover) {
    return IMAGE_ROLES.COVER;
  }

  return IMAGE_ROLES.GALLERY;
};

// ============================================================
// FORMAT ENUM
// ============================================================

const formatEnum = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

// ============================================================
// FORMAT TIME
// ============================================================

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const value = String(time).substring(0, 5);

  const [hourValue, minuteValue] = value.split(":");

  const hour = Number(hourValue);

  if (Number.isNaN(hour) || !minuteValue) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minuteValue} ${suffix}`;
};

// ============================================================
// CURRENCY
// ============================================================

const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// ============================================================
// ADDRESS
// ============================================================

const getAddressLine = (library) => {
  return [library?.address, library?.city, library?.state, library?.pincode]
    .filter(Boolean)
    .join(", ");
};

// ============================================================
// AMENITY LABEL
// ============================================================

const getAmenityLabel = (amenity) => {
  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity?.name || amenity?.label || amenity?.amenityName || "-";
};

// ============================================================
// PLAN PRICE
// ============================================================

const getPlanStartingPrice = (plan) => {
  const prices = [];

  const defaultPrice = Number(plan?.price);

  if (Number.isFinite(defaultPrice) && defaultPrice > 0) {
    prices.push(defaultPrice);
  }

  if (Array.isArray(plan?.seatPrices)) {
    plan.seatPrices
      .filter((item) => item?.active !== false)
      .forEach((item) => {
        const price = Number(item?.price);

        if (Number.isFinite(price) && price > 0) {
          prices.push(price);
        }
      });
  }

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
};

// ============================================================
// LOADING PAGE
// ============================================================

function LoadingPage() {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#F8FAFD",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />

        <Typography color="text.secondary" fontWeight={600}>
          Loading library...
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================================
// UNAVAILABLE PAGE
// ============================================================

function LibraryUnavailable({ onBrowse, onHome }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "76vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#F8FAFD",
        px: 2,
        py: 7,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 720,

          p: {
            xs: 3,
            sm: 5,
          },

          textAlign: "center",

          borderRadius: 5,

          border: "1px solid",

          borderColor: alpha(theme.palette.divider, 0.85),

          boxShadow: "0 24px 70px rgba(15,23,42,0.08)",
        }}
      >
        <Box
          sx={{
            width: 78,
            height: 78,

            borderRadius: "50%",

            mx: "auto",
            mb: 2.5,

            display: "grid",
            placeItems: "center",

            bgcolor: alpha(theme.palette.warning.main, 0.1),

            color: "warning.main",
          }}
        >
          <Schedule
            sx={{
              fontSize: 38,
            }}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 850,

            letterSpacing: "-0.04em",
          }}
        >
          Library Currently Unavailable
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1.5,

            maxWidth: 540,

            mx: "auto",

            lineHeight: 1.75,
          }}
        >
          This library profile is not currently available to visitors. It may be
          unpublished, temporarily inactive, or being updated by the library
          owner.
        </Typography>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          justifyContent="center"
          mt={4}
        >
          <Button
            variant="contained"
            onClick={onBrowse}
            sx={{
              minHeight: 46,

              borderRadius: 2.5,

              px: 3,

              fontWeight: 750,

              boxShadow: "none",
            }}
          >
            Browse Libraries
          </Button>

          <Button
            variant="outlined"
            onClick={onHome}
            sx={{
              minHeight: 46,

              borderRadius: 2.5,

              px: 3,

              fontWeight: 750,
            }}
          >
            Back to Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

// ============================================================
// INFO TILE
// ============================================================

function InfoTile({ icon, label, value }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100%",

        p: 2.25,

        borderRadius: 3,

        border: "1px solid",

        borderColor: alpha(theme.palette.divider, 0.85),

        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,

            display: "grid",

            placeItems: "center",

            flexShrink: 0,

            borderRadius: 2.25,

            bgcolor: alpha(theme.palette.primary.main, 0.08),

            color: "primary.main",
          }}
        >
          {icon}
        </Box>

        <Box minWidth={0}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {label}
          </Typography>

          <Typography
            variant="body1"
            fontWeight={750}
            sx={{
              mt: 0.15,

              wordBreak: "break-word",
            }}
          >
            {value || "-"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ============================================================
// MEMBERSHIP PLAN CARD
// ============================================================

function MembershipPlanCard({ plan, onSelect }) {
  const theme = useTheme();

  const startingPrice = getPlanStartingPrice(plan);

  const seatPrices = Array.isArray(plan?.seatPrices)
    ? plan.seatPrices.filter((item) => item?.active !== false)
    : [];

  const featurePrices = Array.isArray(plan?.featurePrices)
    ? plan.featurePrices.filter((item) => item?.active !== false)
    : [];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        borderRadius: 4,

        border: "1px solid",

        borderColor: alpha(theme.palette.primary.main, 0.14),

        boxShadow: "0 14px 38px rgba(15,23,42,0.045)",

        transition: "transform .2s ease, box-shadow .2s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          boxShadow: "0 20px 48px rgba(15,23,42,0.085)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,

          height: "100%",

          display: "flex",

          flexDirection: "column",

          "&:last-child": {
            pb: 3,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box
            sx={{
              width: 46,
              height: 46,

              display: "grid",
              placeItems: "center",

              borderRadius: 2.5,

              bgcolor: alpha(theme.palette.primary.main, 0.09),

              color: "primary.main",
            }}
          >
            <WorkspacePremium />
          </Box>

          {plan?.planType && (
            <Chip
              size="small"
              label={formatEnum(plan.planType)}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 700,
              }}
            />
          )}
        </Stack>

        <Typography
          variant="h5"
          sx={{
            mt: 2,

            fontWeight: 850,

            letterSpacing: "-0.025em",
          }}
        >
          {plan?.name || "Membership Plan"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,

            lineHeight: 1.65,

            minHeight: 44,
          }}
        >
          {plan?.description || "Library membership plan."}
        </Typography>

        {/* ============================================== */}
        {/* PRICE */}
        {/* ============================================== */}

        <Box
          sx={{
            mt: 2.5,
          }}
        >
          {startingPrice != null ? (
            <>
              <Stack direction="row" spacing={0.7} alignItems="baseline">
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 850,

                    color: "primary.main",

                    letterSpacing: "-0.04em",
                  }}
                >
                  {formatCurrency(startingPrice)}
                </Typography>

                {seatPrices.length > 1 && (
                  <Typography variant="body2" color="text.secondary">
                    onwards
                  </Typography>
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary">
                {plan?.durationDays
                  ? `for ${plan.durationDays} day${
                      Number(plan.durationDays) === 1 ? "" : "s"
                    }`
                  : "Membership price"}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" fontWeight={800}>
                Contact Library
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Pricing available from the library
              </Typography>
            </>
          )}
        </Box>

        <Divider
          sx={{
            my: 2.5,
          }}
        />

        {/* ============================================== */}
        {/* SEAT TYPE PRICING */}
        {/* ============================================== */}

        {seatPrices.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={800} mb={1.25}>
              Seat Type Pricing
            </Typography>

            <Stack spacing={1}>
              {seatPrices.map((price) => (
                <Stack
                  key={price.id || price.seatType}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    {formatEnum(price.seatType)}
                  </Typography>

                  <Typography variant="body2" fontWeight={750}>
                    {formatCurrency(price.price)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* ============================================== */}
        {/* FEATURE SURCHARGES */}
        {/* ============================================== */}

        {featurePrices.length > 0 && (
          <Box
            sx={{
              mt: seatPrices.length > 0 ? 2 : 0,
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} mb={1.25}>
              Optional Seat Features
            </Typography>

            <Stack spacing={1}>
              {featurePrices.map((feature) => (
                <Stack
                  key={feature.id || feature.seatFeature}
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    {formatEnum(feature.seatFeature)}
                  </Typography>

                  <Typography variant="body2" fontWeight={750}>
                    +{formatCurrency(feature.additionalPrice)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {/* ============================================== */}
        {/* REFUND POLICY */}
        {/* ============================================== */}

        {(plan?.fullRefundDays != null ||
          plan?.partialRefundDays != null ||
          plan?.partialRefundPercentage != null) && (
          <Box
            sx={{
              mt: 2.5,

              p: 1.75,

              borderRadius: 2.5,

              bgcolor: alpha(theme.palette.info.main, 0.045),

              border: "1px solid",

              borderColor: alpha(theme.palette.info.main, 0.12),
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              REFUND POLICY
            </Typography>

            {plan?.fullRefundDays != null && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                }}
              >
                Full refund within <strong>{plan.fullRefundDays} day(s)</strong>
                .
              </Typography>
            )}

            {plan?.partialRefundDays != null &&
              plan?.partialRefundPercentage != null && (
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.35,
                  }}
                >
                  {plan.partialRefundPercentage}% refund within{" "}
                  {plan.partialRefundDays} day(s).
                </Typography>
              )}
          </Box>
        )}

        <Box
          sx={{
            mt: "auto",

            pt: 3,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => onSelect(plan)}
            sx={{
              minHeight: 48,

              borderRadius: 2.5,

              fontWeight: 800,

              boxShadow: "none",
            }}
          >
            Choose Plan
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

// ============================================================
// LIBRARY DETAILS
// ============================================================

function LibraryDetails() {
  const theme = useTheme();

  const navigate = useNavigate();

  const { libraryId } = useParams();

  // ==========================================================
  // STATE
  // ==========================================================

  const [library, setLibrary] = useState(null);

  const [membershipPlans, setMembershipPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingPlans, setLoadingPlans] = useState(false);

  const [unavailable, setUnavailable] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD PUBLIC LIBRARY
  // ==========================================================

  const loadLibrary = useCallback(
    async ({ showLoading = true } = {}) => {
      if (!libraryId) {
        setUnavailable(true);

        return null;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        setUnavailable(false);

        const response = await libraryApi.getLibraryDetails(libraryId);

        setLibrary(response || null);

        if (!response) {
          setUnavailable(true);
        }

        return response;
      } catch (requestError) {
        console.error("Unable to load public library:", requestError);

        const status = requestError?.response?.status;

        if (status === 404) {
          setLibrary(null);

          setMembershipPlans([]);

          setUnavailable(true);

          return null;
        }

        setError(getErrorMessage(requestError, "Unable to load this library."));

        return null;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [libraryId],
  );

  // ==========================================================
  // LOAD ACTIVE MEMBERSHIP PLANS
  // ==========================================================

  const loadMembershipPlans = useCallback(async () => {
    if (!libraryId) {
      setMembershipPlans([]);

      return;
    }

    try {
      setLoadingPlans(true);

      const response = await membershipPlanApi.getActivePlans(libraryId);

      setMembershipPlans(
        Array.isArray(response)
          ? response.filter((plan) => plan?.active !== false)
          : [],
      );
    } catch (requestError) {
      console.error("Unable to load membership plans:", requestError);

      /*
       * Membership plans are supplementary
       * public information.
       *
       * Failure to load them must not make
       * the complete library profile fail.
       */
      setMembershipPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [libraryId]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      try {
        setLoading(true);

        setError("");

        const loadedLibrary = await loadLibrary({
          showLoading: false,
        });

        if (!active || !loadedLibrary) {
          return;
        }

        await loadMembershipPlans();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [libraryId, loadLibrary, loadMembershipPlans]);

  // ==========================================================
  // IMAGES
  // ==========================================================

  const images = useMemo(
    () => (Array.isArray(library?.images) ? library.images : []),
    [library],
  );

  const profileImage = useMemo(
    () =>
      images.find((image) => resolveImageRole(image) === IMAGE_ROLES.PROFILE) ||
      null,
    [images],
  );

  const coverImage = useMemo(
    () =>
      images.find((image) => resolveImageRole(image) === IMAGE_ROLES.COVER) ||
      null,
    [images],
  );

  const galleryImages = useMemo(
    () =>
      images.filter(
        (image) =>
          resolveImageRole(image) === IMAGE_ROLES.GALLERY &&
          image?.imageType !== "LOGO" &&
          image?.publicVisible !== false,
      ),
    [images],
  );

  const profileImageUrl =
    profileImage?.imageUrl || library?.profileImageUrl || "";

  const coverImageUrl = coverImage?.imageUrl || library?.coverImageUrl || "";

  // ==========================================================
  // AMENITIES
  // ==========================================================

  const standardAmenities = useMemo(
    () => (Array.isArray(library?.amenities) ? library.amenities : []),
    [library],
  );

  const customAmenities = useMemo(
    () =>
      Array.isArray(library?.customAmenities) ? library.customAmenities : [],
    [library],
  );

  // ==========================================================
  // SEAT AVAILABILITY
  // ==========================================================

  const totalSeats = Number(library?.totalSeats ?? 0);

  const availableSeats = Number(library?.availableSeats ?? 0);

  const availabilityPercentage =
    totalSeats > 0
      ? Math.min(
          100,
          Math.max(0, Math.round((availableSeats / totalSeats) * 100)),
        )
      : 0;

  // ==========================================================
  // OPERATING HOURS
  // ==========================================================

  const operatingHours = library?.open24Hours
    ? "Open 24 Hours"
    : library?.openingTime && library?.closingTime
      ? `${formatTime(library.openingTime)} – ${formatTime(
          library.closingTime,
        )}`
      : "Hours not configured";

  // ==========================================================
  // VIEW SEATS
  // ==========================================================

  const handleViewSeats = () => {
    navigate(`/libraries/${libraryId}/seats`);
  };

  // ==========================================================
  // CHOOSE MEMBERSHIP PLAN
  // ==========================================================

  const handleChooseMembershipPlan = (plan) => {
    if (!plan?.id) {
      return;
    }

    navigate(`/libraries/${libraryId}/seats`, {
      state: {
        action: "SELECT_SEAT_FOR_PLAN",

        libraryId: Number(libraryId),

        membershipPlanId: plan.id,

        membershipPlanName: plan.name,

        membershipPlanDurationDays: plan.durationDays,

        membershipPlanType: plan.planType,
      },
    });
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      setError("");

      const loadedLibrary = await loadLibrary({
        showLoading: false,
      });

      if (loadedLibrary) {
        await loadMembershipPlans();
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <LoadingPage />;
  }

  // ==========================================================
  // UNAVAILABLE
  // ==========================================================

  if (unavailable) {
    return (
      <LibraryUnavailable
        onBrowse={() => navigate("/libraries")}
        onHome={() => navigate("/")}
      />
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !library) {
    return (
      <Box
        sx={{
          minHeight: "70vh",

          display: "grid",

          placeItems: "center",

          bgcolor: "#F8FAFD",

          px: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",

            maxWidth: 650,

            p: 4,

            borderRadius: 4,

            border: "1px solid",

            borderColor: "divider",
          }}
        >
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Alert
              severity="error"
              sx={{
                width: "100%",
              }}
            >
              {error}
            </Alert>

            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (!library) {
    return null;
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        bgcolor: "#F8FAFD",

        pb: 8,
      }}
    >
      {/* ====================================================== */}
      {/* NAVIGATION */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          pt: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/libraries")}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },

              justifyContent: "flex-start",

              color: "text.secondary",

              fontWeight: 700,
            }}
          >
            Back to Libraries
          </Button>

          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <Refresh />
            }
            disabled={refreshing}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2.5,

              fontWeight: 700,
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Container>

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            overflow: "hidden",

            borderRadius: 5,

            border: "1px solid",

            borderColor: alpha(theme.palette.divider, 0.8),

            boxShadow: "0 25px 70px rgba(15,23,42,0.08)",
          }}
        >
          <Box
            sx={{
              position: "relative",

              height: {
                xs: 290,
                sm: 360,
                md: 430,
              },

              bgcolor: alpha(theme.palette.primary.main, 0.08),

              backgroundImage: coverImageUrl
                ? `url(${getImageUrl(coverImageUrl)})`
                : `linear-gradient(
                      135deg,
                      ${alpha(theme.palette.primary.main, 0.19)},
                      ${alpha(theme.palette.secondary.main, 0.08)}
                    )`,

              backgroundSize: "cover",

              backgroundPosition: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",

                inset: 0,

                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.04) 10%, rgba(15,23,42,0.82) 100%)",
              }}
            />

            {!coverImageUrl && (
              <Stack
                sx={{
                  position: "absolute",

                  inset: 0,
                }}
                alignItems="center"
                justifyContent="center"
                spacing={1.5}
              >
                <ImageOutlined
                  sx={{
                    fontSize: 64,

                    color: "text.disabled",
                  }}
                />

                <Typography color="text.secondary" fontWeight={600}>
                  Library cover image
                </Typography>
              </Stack>
            )}

            <Chip
              icon={<PublicOutlined />}
              label="Public Library"
              size="small"
              sx={{
                position: "absolute",

                top: 20,

                right: 20,

                bgcolor: "rgba(255,255,255,.94)",

                color: "primary.main",

                fontWeight: 800,

                backdropFilter: "blur(12px)",
              }}
            />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
              alignItems={{
                xs: "flex-start",
                sm: "flex-end",
              }}
              sx={{
                position: "absolute",

                left: {
                  xs: 20,
                  md: 30,
                },

                right: {
                  xs: 20,
                  md: 30,
                },

                bottom: {
                  xs: 20,
                  md: 28,
                },
              }}
            >
              <Avatar
                src={profileImageUrl ? getImageUrl(profileImageUrl) : undefined}
                sx={{
                  width: {
                    xs: 78,
                    md: 104,
                  },

                  height: {
                    xs: 78,
                    md: 104,
                  },

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  fontSize: {
                    xs: 28,
                    md: 38,
                  },

                  fontWeight: 850,

                  border: "4px solid rgba(255,255,255,.96)",

                  boxShadow: "0 12px 34px rgba(0,0,0,.28)",
                }}
              >
                {library.name?.charAt(0)?.toUpperCase() || "L"}
              </Avatar>

              <Box
                sx={{
                  flex: 1,

                  minWidth: 0,

                  color: "#fff",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 850,

                    letterSpacing: "-0.045em",

                    fontSize: {
                      xs: "2rem",
                      md: "2.7rem",
                    },

                    textShadow: "0 3px 14px rgba(0,0,0,.3)",
                  }}
                >
                  {library.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  sx={{
                    mt: 0.9,

                    opacity: 0.95,
                  }}
                >
                  <LocationOn
                    sx={{
                      fontSize: 19,
                    }}
                  />

                  <Typography variant="body2" fontWeight={550}>
                    {[library.city, library.state].filter(Boolean).join(", ") ||
                      "Location not configured"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* ================================================== */}
          {/* SUMMARY */}
          {/* ================================================== */}

          <CardContent
            sx={{
              p: {
                xs: 2.25,
                md: 3,
              },
            }}
          >
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <InfoTile
                  icon={<EventSeat />}
                  label="Total Seats"
                  value={totalSeats}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <InfoTile
                  icon={<CheckCircle />}
                  label="Available Seats"
                  value={availableSeats}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <InfoTile
                  icon={<AccessTime />}
                  label="Opening Hours"
                  value={operatingHours}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                }}
              >
                <InfoTile
                  icon={<WorkspacePremium />}
                  label="Active Plans"
                  value={membershipPlans.length}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* ====================================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================================== */}

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Stack spacing={3}>
              {/* ============================================== */}
              {/* ABOUT */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.5,
                    md: 3.5,
                  },

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Typography variant="h5" fontWeight={850}>
                  About this Library
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1.5,

                    lineHeight: 1.85,

                    whiteSpace: "pre-line",
                  }}
                >
                  {library.description ||
                    "No description has been added for this library yet."}
                </Typography>
              </Paper>

              {/* ============================================== */}
              {/* AVAILABILITY */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.5,
                    md: 3.5,
                  },

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
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
                  gap={2}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={850}>
                      Seat Availability
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.6,
                      }}
                    >
                      Browse seats before signing in.
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleViewSeats}
                    sx={{
                      borderRadius: 2.5,

                      minHeight: 46,

                      px: 2.75,

                      fontWeight: 750,

                      boxShadow: "none",
                    }}
                  >
                    View Seats
                  </Button>
                </Stack>

                <Divider
                  sx={{
                    my: 2.5,
                  }}
                />

                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography
                    sx={{
                      fontSize: 38,

                      fontWeight: 850,

                      color: "primary.main",

                      letterSpacing: "-0.04em",
                    }}
                  >
                    {availableSeats}
                  </Typography>

                  <Typography color="text.secondary">
                    of {totalSeats} seats currently available
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    mt: 1.5,

                    height: 8,

                    borderRadius: 999,

                    bgcolor: alpha(theme.palette.primary.main, 0.08),

                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${availabilityPercentage}%`,

                      height: "100%",

                      bgcolor: "primary.main",
                    }}
                  />
                </Box>
              </Paper>

              {/* ============================================== */}
              {/* AMENITIES */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.5,
                    md: 3.5,
                  },

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Typography variant="h5" fontWeight={850}>
                  Amenities & Facilities
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    mb: 2.5,
                  }}
                >
                  Facilities available at this library.
                </Typography>

                {standardAmenities.length === 0 &&
                customAmenities.length === 0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 2.5,
                    }}
                  >
                    No amenities have been listed yet.
                  </Alert>
                ) : (
                  <Grid container spacing={1.5}>
                    {standardAmenities.map((amenity, index) => (
                      <Grid
                        key={
                          amenity?.id || `${getAmenityLabel(amenity)}-${index}`
                        }
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.75,

                            height: "100%",

                            borderRadius: 2.5,

                            border: "1px solid",

                            borderColor: alpha(
                              theme.palette.success.main,
                              0.14,
                            ),

                            bgcolor: alpha(theme.palette.success.main, 0.04),
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <CheckCircle
                              sx={{
                                color: "success.main",

                                fontSize: 20,
                              }}
                            />

                            <Typography fontWeight={650}>
                              {getAmenityLabel(amenity)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}

                    {customAmenities.map((amenity) => (
                      <Grid
                        key={amenity.id || amenity.name}
                        size={{
                          xs: 12,
                          sm: 6,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.75,

                            height: "100%",

                            borderRadius: 2.5,

                            border: "1px solid",

                            borderColor: alpha(
                              theme.palette.primary.main,
                              0.14,
                            ),

                            bgcolor: alpha(theme.palette.primary.main, 0.035),
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                          >
                            <CheckCircle
                              sx={{
                                color: "primary.main",

                                fontSize: 20,

                                mt: 0.2,
                              }}
                            />

                            <Box>
                              <Typography fontWeight={700}>
                                {amenity.name}
                              </Typography>

                              {amenity.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {amenity.description}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>

              {/* ============================================== */}
              {/* GALLERY */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.5,
                    md: 3.5,
                  },

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  mb={2.5}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={850}>
                      Library Gallery
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Public photos from this library.
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={`${galleryImages.length} photos`}
                    variant="outlined"
                  />
                </Stack>

                {galleryImages.length === 0 ? (
                  <Box
                    sx={{
                      py: 5,

                      textAlign: "center",

                      borderRadius: 3,

                      bgcolor: "background.default",
                    }}
                  >
                    <ImageOutlined
                      sx={{
                        fontSize: 44,

                        color: "text.disabled",
                      }}
                    />

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 1,
                      }}
                    >
                      No public gallery photos are available.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {galleryImages.map((image) => (
                      <Grid
                        key={image.id || image.imageUrl}
                        size={{
                          xs: 12,
                          sm: 6,
                          lg: 4,
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(image.imageUrl)}
                          alt={image.imageType || library.name}
                          sx={{
                            width: "100%",

                            height: 220,

                            display: "block",

                            objectFit: "cover",

                            borderRadius: 3,

                            border: "1px solid",

                            borderColor: "divider",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Stack>
          </Grid>

          {/* ================================================== */}
          {/* SIDEBAR */}
          {/* ================================================== */}

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Stack
              spacing={3}
              sx={{
                position: {
                  md: "sticky",
                },

                top: {
                  md: 96,
                },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 3,

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: alpha(theme.palette.primary.main, 0.17),
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,

                    display: "grid",

                    placeItems: "center",

                    borderRadius: 2.75,

                    bgcolor: alpha(theme.palette.primary.main, 0.1),

                    color: "primary.main",

                    mb: 2,
                  }}
                >
                  <EventSeat />
                </Box>

                <Typography variant="h5" fontWeight={850}>
                  Find Your Seat
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1,

                    lineHeight: 1.7,
                  }}
                >
                  Browse available seats without signing in. Login is required
                  only when you proceed with booking.
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={handleViewSeats}
                  sx={{
                    mt: 2.5,

                    minHeight: 50,

                    borderRadius: 2.5,

                    fontWeight: 800,

                    boxShadow: "none",
                  }}
                >
                  View Available Seats
                </Button>
              </Paper>

              {/* ============================================== */}
              {/* CONTACT */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: 3,

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" fontWeight={850}>
                  Contact & Location
                </Typography>

                <Stack spacing={2.25} mt={2.5}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <LocationOn
                      sx={{
                        color: "primary.main",

                        mt: 0.2,
                      }}
                    />

                    <Box>
                      <Typography fontWeight={700}>Address</Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.3,

                          lineHeight: 1.6,
                        }}
                      >
                        {getAddressLine(library) || "Address not available"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PhoneOutlined
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Box>
                      <Typography fontWeight={700}>Phone</Typography>

                      <Typography variant="body2" color="text.secondary">
                        {library.contactNumber ||
                          library.phone ||
                          "Not available"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EmailOutlined
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Box minWidth={0}>
                      <Typography fontWeight={700}>Email</Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          wordBreak: "break-word",
                        }}
                      >
                        {library.email || "Not available"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTime
                      sx={{
                        color: "primary.main",
                      }}
                    />

                    <Box>
                      <Typography fontWeight={700}>Hours</Typography>

                      <Typography variant="body2" color="text.secondary">
                        {operatingHours}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* ==================================================== */}
        {/* MEMBERSHIP PLANS */}
        {/* ==================================================== */}

        <Box
          sx={{
            mt: 5,
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
            mb={3}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,

                  letterSpacing: "-0.04em",
                }}
              >
                Membership Plans
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.7,
                }}
              >
                Choose an active membership plan from this library, then select
                your preferred seat.
              </Typography>
            </Box>

            {membershipPlans.length > 0 && (
              <Chip
                icon={<WorkspacePremium />}
                label={`${membershipPlans.length} active plan${
                  membershipPlans.length === 1 ? "" : "s"
                }`}
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>

          {loadingPlans ? (
            <Paper
              elevation={0}
              sx={{
                py: 6,

                display: "grid",

                placeItems: "center",

                borderRadius: 4,

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              <Stack spacing={1.5} alignItems="center">
                <CircularProgress size={30} />

                <Typography color="text.secondary">
                  Loading membership plans...
                </Typography>
              </Stack>
            </Paper>
          ) : membershipPlans.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },

                borderRadius: 4,

                border: "1px solid",

                borderColor: "divider",

                textAlign: "center",
              }}
            >
              <WorkspacePremium
                sx={{
                  fontSize: 46,

                  color: "text.disabled",
                }}
              />

              <Typography variant="h6" fontWeight={750} mt={1}>
                No Active Membership Plans
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                This library has not published any active membership plans yet.
              </Typography>

              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={handleViewSeats}
                sx={{
                  mt: 2.5,

                  borderRadius: 2.5,

                  fontWeight: 700,
                }}
              >
                View Seat Availability
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2.5} alignItems="stretch">
              {membershipPlans.map((plan) => (
                <Grid
                  key={plan.id}
                  size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                  }}
                  sx={{
                    display: "flex",
                  }}
                >
                  <MembershipPlanCard
                    plan={plan}
                    onSelect={handleChooseMembershipPlan}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default LibraryDetails;
