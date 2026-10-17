import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import {
  AccessTimeRounded,
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  CheckCircleOutlineRounded,
  EventSeatRounded,
  LocalOfferRounded,
  LockRounded,
  LocationOnRounded,
  PaymentsRounded,
  ScheduleRounded,
  VerifiedRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import studentBookingApi from "../../../api/studentBookingApi";

import studentCouponApi from "../../../api/studentCouponApi";
import seatPriceQuoteApi from "../../../api/seatPriceQuoteApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const formatTime = (value) => {
  if (!value) return "-";

  return String(value).slice(0, 5);
};

const formatEnum = (value, fallback = "-") => {
  if (!value) return fallback;

  return String(value)
    .replaceAll("\_", " ")

    .toLowerCase()

    .replace(/\b\w/g, (character) => character.toUpperCase());
};

function getSeatTypeBasePrice(plan, seatType) {
  const resolvedType = seatType || "NORMAL";

  const configured = Array.isArray(plan?.seatPrices)
    ? plan.seatPrices.find(
        (item) => item?.seatType === resolvedType && item?.active !== false,
      )
    : null;

  if (configured?.price != null) {
    return Number(configured.price);
  }

  if (resolvedType === "NORMAL" && plan?.price != null) {
    return Number(plan.price);
  }

  return null;
}

function calculateStandardSeatPrice(plan, seat) {
  const basePrice = getSeatTypeBasePrice(plan, seat?.seatType);

  const seatFeatures = Array.isArray(seat?.features) ? seat.features : [];

  const planFeaturePrices = Array.isArray(plan?.featurePrices)
    ? plan.featurePrices
    : [];

  const featurePrices = seatFeatures

    .map((feature) => {
      const configured = planFeaturePrices.find(
        (item) => item?.seatFeature === feature && item?.active !== false,
      );

      return {
        feature,

        additionalPrice:
          configured?.additionalPrice != null
            ? Number(configured.additionalPrice)
            : 0,
      };
    })

    .filter(
      (item) =>
        Number.isFinite(item.additionalPrice) && item.additionalPrice > 0,
    );

  if (basePrice == null) {
    return {
      basePrice: null,

      featurePrices,

      featureTotal: 0,

      total: null,
    };
  }

  const featureTotal = featurePrices.reduce(
    (sum, item) => sum + Number(item.additionalPrice || 0),

    0,
  );

  return {
    basePrice,

    featurePrices,

    featureTotal,

    total: basePrice + featureTotal,
  };
}

const cardSx = {
  border: "1px solid",

  borderColor: "divider",

  borderRadius: 4,

  overflow: "hidden",

  boxShadow: "0 14px 38px rgba(15, 23, 42, 0.06)",

  transition:
    "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",

  "&:hover": {
    transform: "translateY(-1px)",

    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.085)",
  },
};

function SummaryRow({ label, value, valueColor, valueWeight = 700, icon }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      alignItems="center"
      sx={{ minHeight: 34 }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        {icon ? (
          <Box
            sx={{
              width: 30,

              height: 30,

              borderRadius: 2,

              display: "grid",

              placeItems: "center",

              bgcolor: "action.hover",

              color: "text.secondary",

              flexShrink: 0,

              "& svg": {
                fontSize: 17,
              },
            }}
          >
            {icon}
          </Box>
        ) : null}

        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        fontWeight={valueWeight}
        textAlign="right"
        color={valueColor || "text.primary"}
        sx={{
          wordBreak: "break-word",
        }}
      >
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
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
      spacing={1.5}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{
            width: 42,

            height: 42,

            borderRadius: 2.5,

            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),

            color: "primary.main",
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography variant="subtitle1" fontWeight={800}>
            {title}
          </Typography>

          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      {action || null}
    </Stack>
  );
}

function BookingReview() {
  const { libraryId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const library = location.state?.library || null;

  const selectedPlan = location.state?.selectedPlan || null;

  const selectedSeat = location.state?.selectedSeat || null;

  const selectedSlot = location.state?.selectedSlot || null;

  const selectedFloor = location.state?.selectedFloor || null;

  const startDate = location.state?.startDate || null;

  const endDate = location.state?.endDate || null;

  const selectedSeatId = selectedSeat?.id ?? selectedSeat?.seatId ?? null;

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [couponCode, setCouponCode] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [couponLoading, setCouponLoading] = useState(false);

  const [couponError, setCouponError] = useState("");

  const [couponSuccess, setCouponSuccess] = useState("");

  const [priceQuote, setPriceQuote] = useState(null);

  const [quoteLoading, setQuoteLoading] = useState(true);

  const [quoteError, setQuoteError] = useState("");

  const standardPricing = useMemo(
    () => calculateStandardSeatPrice(selectedPlan, selectedSeat),

    [selectedPlan, selectedSeat],
  );

  useEffect(() => {
    let active = true;

    const loadPriceQuote = async () => {
      const resolvedLibraryId = Number(library?.id ?? libraryId);

      const membershipPlanId = Number(selectedPlan?.id);

      const seatId = Number(selectedSeatId);

      if (
        !Number.isFinite(resolvedLibraryId) ||
        resolvedLibraryId <= 0 ||
        !Number.isFinite(membershipPlanId) ||
        membershipPlanId <= 0 ||
        !Number.isFinite(seatId) ||
        seatId <= 0
      ) {
        if (active) {
          setPriceQuote(null);

          setQuoteError("");

          setQuoteLoading(false);
        }

        return;
      }

      try {
        setQuoteLoading(true);

        setQuoteError("");

        setPriceQuote(null);

        const response = await seatPriceQuoteApi.getSeatQuote({
          libraryId: resolvedLibraryId,

          membershipPlanId,

          seatId,
        });

        if (!active) {
          return;
        }

        setPriceQuote(response || null);
      } catch (requestError) {
        console.error(
          "Unable to load authoritative seat price quote:",
          requestError,
        );

        if (!active) {
          return;
        }

        setPriceQuote(null);

        setQuoteError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.response?.data?.detail ||
            requestError?.message ||
            "Unable to calculate the selected seat price.",
        );
      } finally {
        if (active) {
          setQuoteLoading(false);
        }
      }
    };

    loadPriceQuote();

    return () => {
      active = false;
    };
  }, [library?.id, libraryId, selectedPlan?.id, selectedSeatId]);

  const originalAmount = Number(priceQuote?.effectivePrice ?? 0);

  const discountAmount = Number(appliedCoupon?.discountAmount ?? 0);

  const finalAmount = appliedCoupon
    ? Number(appliedCoupon?.finalAmount ?? originalAmount)
    : originalAmount;

  const floorName =
    selectedFloor?.name ||
    selectedSeat?.floorName ||
    (selectedSeat?.floorNumber != null
      ? `Floor ${selectedSeat.floorNumber}`
      : selectedFloor?.floorNumber != null
        ? `Floor ${selectedFloor.floorNumber}`
        : "-");

  const physicalPosition =
    selectedSeat?.rowLabel && selectedSeat?.columnNumber != null
      ? `Row ${selectedSeat.rowLabel} • Position ${selectedSeat.columnNumber}`
      : selectedSeat?.rowLabel
        ? `Row ${selectedSeat.rowLabel}`
        : selectedSeat?.columnNumber != null
          ? `Position ${selectedSeat.columnNumber}`
          : "-";

  const slotTime = `${formatTime(selectedSlot?.startTime)} - ${formatTime(
    selectedSlot?.endTime,
  )}`;

  const valid = Boolean(
    (library?.id || libraryId) &&
    selectedPlan?.id &&
    selectedSeatId &&
    selectedSlot?.id &&
    startDate &&
    endDate,
  );

  const quoteReady = Boolean(
    priceQuote &&
    Number.isFinite(Number(priceQuote.effectivePrice)) &&
    Number(priceQuote.effectivePrice) > 0,
  );

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    setCouponError("");

    setCouponSuccess("");

    if (!normalizedCode) {
      setCouponError("Please enter a coupon code.");

      return;
    }

    const resolvedLibraryId = Number(library?.id ?? libraryId);

    if (!Number.isFinite(resolvedLibraryId) || resolvedLibraryId <= 0) {
      setCouponError("Library information is missing.");

      return;
    }

    if (quoteLoading) {
      setCouponError("Seat pricing is still being calculated.");

      return;
    }

    if (quoteError || !quoteReady) {
      setCouponError(
        quoteError ||
          "Unable to calculate the selected seat price. Please try again.",
      );

      return;
    }

    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      setCouponError("Invalid selected-seat amount.");

      return;
    }

    try {
      setCouponLoading(true);

      const response = await studentCouponApi.validateCoupon({
        libraryId: resolvedLibraryId,

        code: normalizedCode,

        amount: originalAmount,
      });

      if (!response?.valid) {
        setAppliedCoupon(null);

        setCouponError(response?.message || "Coupon is not valid.");

        return;
      }

      setAppliedCoupon(response);

      setCouponCode(response?.code || normalizedCode);

      setCouponSuccess(response?.message || "Coupon applied successfully.");
    } catch (requestError) {
      console.error("Coupon validation failed:", requestError);

      setAppliedCoupon(null);

      setCouponSuccess("");

      setCouponError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          requestError?.message ||
          "Unable to apply this coupon.",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);

    setCouponCode("");

    setCouponError("");

    setCouponSuccess("");
  };

  const handleCreateBooking = async () => {
    if (!valid) {
      setError("Booking information is incomplete.");

      return;
    }

    if (quoteLoading) {
      setError("Seat pricing is still being calculated.");

      return;
    }

    if (quoteError || !quoteReady) {
      setError(
        quoteError ||
          "Unable to calculate the selected seat price. Please try again.",
      );

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      const payload = {
        seatId: Number(selectedSeatId),

        slotId: Number(selectedSlot.id),

        membershipPlanId: Number(selectedPlan.id),

        startDate,

        endDate,
      };

      const booking = await studentBookingApi.createBooking(payload);

      const bookingId = booking?.bookingId ?? booking?.id ?? null;

      if (!bookingId) {
        throw new Error("Booking was created but booking ID was not returned.");
      }

      // Prefer the amount returned by the backend booking response

      // when the DTO exposes it. Otherwise keep the UI preview.

      const backendAmountCandidate =
        booking?.amount ??
        booking?.bookingAmount ??
        booking?.totalAmount ??
        booking?.payableAmount ??
        null;

      const trustedBookingAmount =
        backendAmountCandidate != null &&
        Number.isFinite(Number(backendAmountCandidate))
          ? Number(backendAmountCandidate)
          : originalAmount;

      navigate("/student/membership/payment", {
        state: {
          paymentType: "BOOKING",

          booking,

          bookingId,

          library,

          selectedPlan,

          selectedSeat: {
            ...selectedSeat,

            id: selectedSeatId,
          },

          selectedSlot,

          selectedFloor,

          startDate,

          endDate,

          coupon: appliedCoupon
            ? {
                couponId: appliedCoupon.couponId,

                code: appliedCoupon.code,
              }
            : null,

          pricingPreview: {
            seatType: priceQuote?.seatType ?? selectedSeat?.seatType,

            standardBasePrice: priceQuote?.standardBasePrice ?? null,

            memberBasePrice: priceQuote?.memberBasePrice ?? null,

            memberPricingApplied: Boolean(priceQuote?.memberPricingApplied),

            featurePrices: Array.isArray(priceQuote?.featurePrices)
              ? priceQuote.featurePrices
              : [],

            featureTotal: Number(priceQuote?.featureSurcharge ?? 0),

            originalAmount: trustedBookingAmount,

            discountAmount,

            finalAmount: appliedCoupon ? finalAmount : trustedBookingAmount,
          },
        },
      });
    } catch (requestError) {
      console.error("Booking creation failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to create booking.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!valid) {
    return (
      <Box
        sx={{
          maxWidth: 760,

          mx: "auto",

          py: 4,
        }}
      >
        <Card elevation={0} sx={cardSx}>
          <CardContent
            sx={{
              p: {
                xs: 3,

                sm: 4,
              },
            }}
          >
            <Stack spacing={2.5} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 52,

                  height: 52,

                  bgcolor: "warning.light",

                  color: "warning.dark",
                }}
              >
                <EventSeatRounded />
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Booking details are incomplete
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  Please select your membership plan and seat again. Premium
                  seats also require an active Premium price for the selected
                  plan.
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/student/libraries/${libraryId}/plans`)
                }
                endIcon={<ArrowForwardRounded />}
              >
                Start Again
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 980,

        mx: "auto",

        pb: 5,
      }}
    >
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() =>
          navigate(`/student/libraries/${libraryId}/book-seat`, {
            state: {
              library,

              selectedPlan,
            },
          })
        }
        sx={{
          mb: 2,

          px: 0.5,

          color: "text.secondary",

          textTransform: "none",

          fontWeight: 700,
        }}
      >
        Change seat
      </Button>

      <Box
        sx={{
          position: "relative",

          overflow: "hidden",

          borderRadius: 5,

          p: {
            xs: 2.75,

            sm: 4,
          },

          mb: 3,

          border: "1px solid",

          borderColor: (theme) => alpha(theme.palette.primary.main, 0.16),

          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,

              0.095,
            )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 58%, ${alpha(
              theme.palette.secondary.main,

              0.07,
            )} 100%)`,
        }}
      >
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
          spacing={3}
        >
          <Box>
            <Chip
              icon={<VerifiedRounded />}
              label="Secure booking review"
              size="small"
              sx={{
                mb: 1.5,

                fontWeight: 800,
              }}
            />

            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: "2rem",

                  sm: "2.45rem",
                },
              }}
            >
              Review your booking
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1.25,

                maxWidth: 610,
              }}
            >
              Review your seat type, features, timing and pricing before
              continuing to secure payment.
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: {
                xs: "100%",

                md: 245,
              },

              p: 2.25,

              borderRadius: 3.5,

              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.78),

              border: "1px solid",

              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              SERVER-VERIFIED PRICE
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              color="primary.main"
              sx={{ mt: 0.4 }}
            >
              {quoteLoading
                ? "Calculating..."
                : quoteReady
                  ? formatMoney(finalAmount)
                  : "Unavailable"}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",

                mt: 1,
              }}
            >
              Backend-calculated member and seat price before coupon.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {quoteLoading ? (
        <Alert
          severity="info"
          icon={<CircularProgress size={18} />}
          sx={{ mb: 3, borderRadius: 3 }}
        >
          Calculating your server-verified seat price...
        </Alert>
      ) : null}

      {quoteError ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {quoteError}
        </Alert>
      ) : null}

      {error ? (
        <Alert
          severity="error"
          sx={{
            mb: 3,

            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      ) : null}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        spacing={2.5}
        sx={{ mb: 2.5 }}
      >
        <Card
          elevation={0}
          sx={{
            ...cardSx,

            flex: 1,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,

                sm: 3,
              },
            }}
          >
            <SectionHeader
              icon={<WorkspacePremiumRounded />}
              title="Membership"
              subtitle="Your selected plan"
              action={
                <Chip
                  label="Selected"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              }
            />

            <Divider sx={{ my: 2.5 }} />

            <Stack spacing={1.6}>
              <SummaryRow
                label="Library"
                value={library?.name}
                icon={<LocationOnRounded />}
              />

              <SummaryRow
                label="Plan"
                value={selectedPlan?.name}
                icon={<WorkspacePremiumRounded />}
              />

              <SummaryRow
                label="Seat category"
                value={formatEnum(selectedSeat?.seatType, "Normal")}
                icon={<EventSeatRounded />}
              />

              <SummaryRow
                label={
                  priceQuote?.memberPricingApplied
                    ? "Your member base price"
                    : "Base price"
                }
                value={
                  quoteReady ? formatMoney(priceQuote?.memberBasePrice) : "-"
                }
                valueColor="primary.main"
                icon={<PaymentsRounded />}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            ...cardSx,

            flex: 1,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,

                sm: 3,
              },
            }}
          >
            <SectionHeader
              icon={<EventSeatRounded />}
              title="Your seat"
              subtitle="Physical seat selected for this booking"
              action={
                <Chip
                  label={formatEnum(selectedSeat?.seatType, "Normal")}
                  size="small"
                />
              }
            />

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="h5" fontWeight={900}>
              {selectedSeat?.seatNumber || "-"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {physicalPosition}
            </Typography>

            <Stack spacing={1.4} sx={{ mt: 2.5 }}>
              <SummaryRow
                label="Floor"
                value={floorName}
                icon={<LocationOnRounded />}
              />

              <SummaryRow
                label="Start date"
                value={startDate}
                icon={<CalendarMonthRounded />}
              />

              <SummaryRow
                label="End date"
                value={endDate}
                icon={<CalendarMonthRounded />}
              />
            </Stack>

            {Array.isArray(selectedSeat?.features) &&
              selectedSeat.features.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 2 }}
                >
                  {selectedSeat.features.map((feature) => (
                    <Chip
                      key={feature}
                      size="small"
                      variant="outlined"
                      label={formatEnum(feature)}
                    />
                  ))}
                </Stack>
              )}

            {Array.isArray(selectedSeat?.restrictions) &&
              selectedSeat.restrictions.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 1 }}
                >
                  {selectedSeat.restrictions.map((restriction) => (
                    <Chip
                      key={restriction}
                      size="small"
                      color="warning"
                      variant="outlined"
                      label={formatEnum(restriction)}
                    />
                  ))}
                </Stack>
              )}
          </CardContent>
        </Card>
      </Stack>

      <Card
        elevation={0}
        sx={{
          ...cardSx,

          mb: 2.5,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,

              sm: 3,
            },
          }}
        >
          <SectionHeader
            icon={<ScheduleRounded />}
            title="Booking slot"
            subtitle="Your selected study window"
            action={
              <Chip
                icon={<AccessTimeRounded />}
                label={slotTime}
                size="small"
                variant="outlined"
              />
            }
          />

          <Divider sx={{ my: 2.5 }} />

          <Stack
            direction={{
              xs: "column",

              sm: "row",
            }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Typography variant="h6" fontWeight={800}>
              {selectedSlot?.name || "-"}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {startDate === endDate ? startDate : `${startDate} → ${endDate}`}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          ...cardSx,

          mb: 2.5,

          borderColor: appliedCoupon
            ? (theme) => alpha(theme.palette.success.main, 0.38)
            : "divider",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,

              sm: 3,
            },
          }}
        >
          <SectionHeader
            icon={<LocalOfferRounded />}
            title="Have a coupon?"
            subtitle="Apply a valid promotional code"
          />

          <Divider sx={{ my: 2.5 }} />

          <Stack
            direction={{
              xs: "column",

              sm: "row",
            }}
            spacing={1.5}
          >
            <TextField
              fullWidth
              label="Coupon code"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value);

                if (appliedCoupon) {
                  setAppliedCoupon(null);
                }

                setCouponError("");

                setCouponSuccess("");
              }}
              disabled={couponLoading}
            />

            {appliedCoupon ? (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveCoupon}
              >
                Remove
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={handleApplyCoupon}
                disabled={couponLoading || quoteLoading || !quoteReady}
                startIcon={
                  couponLoading ? <CircularProgress size={17} /> : null
                }
              >
                Apply code
              </Button>
            )}
          </Stack>

          {couponError ? (
            <Alert
              severity="error"
              sx={{
                mt: 2,

                borderRadius: 2.5,
              }}
            >
              {couponError}
            </Alert>
          ) : null}

          {couponSuccess ? (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineRounded />}
              sx={{
                mt: 2,

                borderRadius: 2.5,
              }}
            >
              {couponSuccess}
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          ...cardSx,

          borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),

          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
              theme.palette.primary.main,

              0.04,
            )} 100%)`,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.75,

              sm: 3.5,
            },
          }}
        >
          <SectionHeader
            icon={<PaymentsRounded />}
            title="Payment summary"
            subtitle="Selected-seat pricing before secure checkout"
            action={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <LockRounded
                  sx={{
                    fontSize: 16,

                    color: "success.main",
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  Server-verified booking
                </Typography>
              </Stack>
            }
          />

          <Divider sx={{ my: 2.75 }} />

          <Stack spacing={1.65}>
            <SummaryRow
              label={`${formatEnum(
                selectedSeat?.seatType,

                "Normal",
              )} seat base price`}
              value={
                quoteReady ? formatMoney(priceQuote?.standardBasePrice) : "-"
              }
            />

            {priceQuote?.memberPricingApplied ? (
              <SummaryRow
                label="Your member base price"
                value={formatMoney(priceQuote?.memberBasePrice)}
                valueColor="success.main"
                valueWeight={800}
              />
            ) : null}

            {(Array.isArray(priceQuote?.featurePrices)
              ? priceQuote.featurePrices
              : []
            ).map((item) => (
              <SummaryRow
                key={item.feature}
                label={`${formatEnum(item.feature)} surcharge`}
                value={`+ ${formatMoney(item.additionalPrice)}`}
              />
            ))}

            {Array.isArray(priceQuote?.featurePrices) &&
              priceQuote.featurePrices.length > 0 && (
                <SummaryRow
                  label="Server-verified seat amount"
                  value={formatMoney(originalAmount)}
                  valueWeight={800}
                />
              )}

            {appliedCoupon ? (
              <SummaryRow
                label={`Coupon discount (${appliedCoupon.code})`}
                value={`- ${formatMoney(discountAmount)}`}
                valueColor="success.main"
                valueWeight={800}
              />
            ) : null}

            <Divider sx={{ my: 0.5 }} />

            <Stack
              direction={{
                xs: "column",

                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",

                sm: "flex-end",
              }}
              spacing={2.5}
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={700}
                >
                  FINAL PAYABLE PREVIEW
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight={900}
                  color="primary.main"
                  sx={{
                    mt: 0.35,

                    fontSize: {
                      xs: "2.15rem",

                      sm: "2.65rem",
                    },
                  }}
                >
                  {formatMoney(finalAmount)}
                </Typography>

                {appliedCoupon ? (
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={800}
                    sx={{ mt: 0.5 }}
                  >
                    You save {formatMoney(discountAmount)}
                  </Typography>
                ) : null}
              </Box>

              <Button
                size="large"
                variant="contained"
                disabled={
                  submitting || couponLoading || quoteLoading || !quoteReady
                }
                endIcon={!submitting ? <ArrowForwardRounded /> : null}
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
                onClick={handleCreateBooking}
                sx={{
                  minHeight: 54,

                  px: 3.2,

                  borderRadius: 3,

                  textTransform: "none",

                  fontWeight: 900,
                }}
              >
                {submitting
                  ? "Creating booking..."
                  : "Continue to secure payment"}
              </Button>
            </Stack>

            <Alert
              severity="info"
              sx={{
                mt: 1,

                borderRadius: 2.5,
              }}
            >
              This amount comes from the backend pricing service. Booking
              creation validates the selected seat and recalculates pricing
              again before continuing to payment.
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BookingReview;
