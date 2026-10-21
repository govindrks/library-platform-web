import {
  AccessTimeRounded,
  AcUnitRounded,
  ApartmentRounded,
  ArrowForwardRounded,
  ChairRounded,
  CheckCircleRounded,
  LocalCafeRounded,
  LocalParkingRounded,
  LockRounded,
  MenuBookRounded,
  PowerRounded,
  SecurityRounded,
  StarRounded,
  VerifiedRounded,
  VisibilityRounded,
  WifiRounded,
} from "@mui/icons-material";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import getImageUrl from "../../../utility/imageUrl";

// ============================================================
// AMENITY ICONS
// ============================================================

const AMENITY_ICON_MAP = {
  WIFI: WifiRounded,
  WI_FI: WifiRounded,
  "WI-FI": WifiRounded,

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

  CCTV: SecurityRounded,

  WINDOW: VisibilityRounded,
};

// ============================================================
// HELPERS
// ============================================================

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

const getAmenityName = (amenity) => {
  if (typeof amenity === "string") {
    return amenity;
  }

  return amenity?.name || amenity?.amenityName || amenity?.label || "";
};

const normalizeAmenityKey = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replaceAll(" ", "_");
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

const getAmenityIcon = (amenity) => {
  const name = getAmenityName(amenity);

  return AMENITY_ICON_MAP[normalizeAmenityKey(name)] || CheckCircleRounded;
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

  if (profile?.imageUrl) {
    return getImageUrl(profile.imageUrl);
  }

  return "";
};

const getLibraryLocation = (library) => {
  return [library?.city, library?.state].filter(Boolean).join(", ");
};

// ============================================================
// TIME HELPERS
// ============================================================

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const value = String(time).substring(0, 5);

  const [hourString, minute] = value.split(":");

  const hour = Number(hourString);

  if (Number.isNaN(hour) || !minute) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

// ============================================================
// OPEN STATUS
// ============================================================

const getOpenStatus = (library) => {
  if (library?.open24Hours) {
    return {
      label: "Open 24 Hours",
      open: true,
    };
  }

  if (!library?.openingTime || !library?.closingTime) {
    return {
      label: "View Hours",
      open: null,
    };
  }

  /*
   * We intentionally do not infer "Open Now"
   * from browser clock here because operating
   * hours may eventually vary by day/timezone.
   *
   * We simply surface configured hours.
   */
  return {
    label: `${formatTime(library.openingTime)} – ${formatTime(
      library.closingTime,
    )}`,
    open: null,
  };
};

// ============================================================
// COMPONENT
// ============================================================

function LibraryCard({ library, onViewDetails, onViewSeats }) {
  const theme = useTheme();

  const navigate = useNavigate();

  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const imageUrl = getLibraryImage(library);

  const availability = getAvailabilityPercentage(library);

  const rating = Number(library?.averageRating ?? 0);

  const reviewCount = Number(library?.reviewCount ?? 0);

  const totalSeats = Number(library?.totalSeats ?? 0);

  const availableSeats = Number(library?.availableSeats ?? 0);

  const amenities = [
    ...(Array.isArray(library?.amenities) ? library.amenities : []),

    ...(Array.isArray(library?.customAmenities) ? library.customAmenities : []),
  ].slice(0, 4);

  const extraAmenities = Math.max(
    0,
    (Array.isArray(library?.amenities) ? library.amenities.length : 0) +
      (Array.isArray(library?.customAmenities)
        ? library.customAmenities.length
        : 0) -
      amenities.length,
  );

  const openStatus = getOpenStatus(library);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleDetails = () => {
    if (!library?.id) {
      return;
    }

    if (onViewDetails) {
      onViewDetails(library);

      return;
    }

    navigate(`/libraries/${library.id}`);
  };

  const handleSeats = () => {
    if (!library?.id) {
      return;
    }

    if (onViewSeats) {
      onViewSeats(library);

      return;
    }

    navigate(`/libraries/${library.id}/seats`);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",

        height: "100%",

        display: "flex",

        flexDirection: "column",

        borderRadius: 4,

        overflow: "hidden",

        bgcolor: "background.paper",

        border: "1px solid",

        borderColor: alpha(theme.palette.divider, 0.86),

        boxShadow: "0 10px 34px rgba(15,23,42,0.055)",

        transition:
          "transform .25s ease, box-shadow .25s ease, border-color .25s ease",

        "&:hover": {
          transform: "translateY(-6px)",

          borderColor: alpha(theme.palette.primary.main, 0.27),

          boxShadow: "0 25px 58px rgba(15,23,42,0.12)",
        },
      }}
    >
      {/* ==================================================== */}
      {/* IMAGE */}
      {/* ==================================================== */}

      <Box
        onClick={handleDetails}
        sx={{
          position: "relative",

          height: 220,

          overflow: "hidden",

          cursor: "pointer",

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

              display: "block",

              objectFit: "cover",

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
                  ${alpha(theme.palette.primary.main, 0.15)},
                  ${alpha(theme.palette.secondary.main, 0.07)}
                )`,
            }}
          >
            <ApartmentRounded
              sx={{
                fontSize: 64,

                color: alpha(theme.palette.primary.main, 0.5),
              }}
            />
          </Box>
        )}

        {/* dark image gradient */}

        <Box
          sx={{
            position: "absolute",

            inset: 0,

            pointerEvents: "none",

            background:
              "linear-gradient(180deg, rgba(15,23,42,.01) 35%, rgba(15,23,42,.66) 100%)",
          }}
        />

        {/* Verified */}

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

            "& .MuiChip-icon": {
              color: "primary.main",
            },
          }}
        />

        {/* Availability */}

        <Chip
          label={
            availableSeats > 0
              ? `${availability}% available`
              : "No seats available"
          }
          size="small"
          sx={{
            position: "absolute",

            bottom: 14,

            left: 14,

            bgcolor:
              availableSeats <= 0
                ? "rgba(185,28,28,.9)"
                : availability >= 50
                  ? "rgba(21,128,61,.9)"
                  : availability >= 20
                    ? "rgba(180,83,9,.9)"
                    : "rgba(185,28,28,.9)",

            color: "#fff",

            fontWeight: 750,

            backdropFilter: "blur(12px)",
          }}
        />

        {/* Hours */}

        <Tooltip title="Library operating hours">
          <Chip
            icon={<AccessTimeRounded />}
            label={openStatus.label}
            size="small"
            sx={{
              position: "absolute",

              right: 14,

              bottom: 14,

              maxWidth: 190,

              bgcolor: "rgba(15,23,42,.74)",

              color: "#fff",

              fontWeight: 700,

              backdropFilter: "blur(12px)",

              "& .MuiChip-icon": {
                color: "#fff",
              },
            }}
          />
        </Tooltip>
      </Box>

      {/* ==================================================== */}
      {/* CONTENT */}
      {/* ==================================================== */}

      <CardContent
        sx={{
          p: 2.5,

          display: "flex",

          flexDirection: "column",

          flexGrow: 1,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        {/* ================================================== */}
        {/* NAME + RATING */}
        {/* ================================================== */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box minWidth={0}>
            <Typography
              onClick={handleDetails}
              variant="h6"
              sx={{
                fontWeight: 850,

                lineHeight: 1.25,

                letterSpacing: "-0.025em",

                cursor: "pointer",

                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {library?.name || "Library"}
            </Typography>

            <Stack
              direction="row"
              spacing={0.55}
              alignItems="center"
              sx={{
                mt: 0.8,
              }}
            >
              <LocationOnRounded
                sx={{
                  color: "text.secondary",

                  fontSize: 17,
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
              spacing={0.45}
              alignItems="center"
              sx={{
                flexShrink: 0,

                px: 1,

                py: 0.45,

                borderRadius: 1.5,

                bgcolor: alpha("#F59E0B", 0.08),
              }}
            >
              <StarRounded
                sx={{
                  color: "#F59E0B",

                  fontSize: 19,
                }}
              />

              <Typography variant="body2" fontWeight={850}>
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
              display: "block",

              mt: 0.6,
            }}
          >
            {formatNumber(reviewCount)} verified review
            {reviewCount === 1 ? "" : "s"}
          </Typography>
        )}

        {/* ================================================== */}
        {/* AMENITIES */}
        {/* ================================================== */}

        {amenities.length > 0 && (
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            sx={{
              mt: 2,
            }}
          >
            {amenities.map((amenity, index) => {
              const amenityName = getAmenityName(amenity);

              const Icon = getAmenityIcon(amenity);

              return (
                <Chip
                  key={amenity?.id || `${amenityName}-${index}`}
                  icon={<Icon />}
                  label={formatAmenityName(amenityName)}
                  size="small"
                  variant="outlined"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.025),

                    borderColor: alpha(theme.palette.primary.main, 0.12),

                    color: "text.secondary",

                    "& .MuiChip-icon": {
                      fontSize: 15,

                      color: "primary.main",
                    },
                  }}
                />
              );
            })}

            {extraAmenities > 0 && (
              <Chip
                size="small"
                label={`+${extraAmenities}`}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.075),

                  color: "primary.main",

                  fontWeight: 800,
                }}
              />
            )}
          </Stack>
        )}

        <Divider
          sx={{
            my: 2.1,
          }}
        />

        {/* ================================================== */}
        {/* SEAT SUMMARY */}
        {/* ================================================== */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
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
              <Typography fontWeight={850} lineHeight={1.15}>
                {formatNumber(availableSeats)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                available of {formatNumber(totalSeats)} seats
              </Typography>
            </Box>
          </Stack>

          {availableSeats > 0 && (
            <CheckCircleRounded
              sx={{
                color: "success.main",

                fontSize: 22,
              }}
            />
          )}
        </Stack>

        {/* ================================================== */}
        {/* AVAILABILITY BAR */}
        {/* ================================================== */}

        <Box
          sx={{
            mt: 1.7,

            height: 6,

            overflow: "hidden",

            borderRadius: 999,

            bgcolor: alpha(theme.palette.primary.main, 0.08),
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

              transition: "width .35s ease",
            }}
          />
        </Box>

        {/* ================================================== */}
        {/* BUTTONS */}
        {/* ================================================== */}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            pt: 2.5,

            mt: "auto",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDetails}
            sx={{
              minHeight: 45,

              borderRadius: 2.25,

              fontWeight: 750,
            }}
          >
            Details
          </Button>

          <Button
            fullWidth
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            onClick={handleSeats}
            sx={{
              minHeight: 45,

              borderRadius: 2.25,

              fontWeight: 800,

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

export default LibraryCard;
