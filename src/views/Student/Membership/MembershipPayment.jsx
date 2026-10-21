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
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  ArrowBackRounded,
  CheckCircleRounded,
  CreditCardRounded,
  EventSeatRounded,
  LockRounded,
  ScheduleRounded,
  VerifiedRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import { useMemo, useState } from "react";

import paymentApi from "../../../api/paymentApi";
import qrCampaignApi from "../../../api/qrCampaignApi";

// ============================================================

// HELPERS

// ============================================================

const roundMoney = (value) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    minimumFractionDigits: 0,

    maximumFractionDigits: 2,
  }).format(roundMoney(value));
};

const formatEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")

    .toLowerCase()

    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const raw = String(value).slice(0, 5);

  const [hourText, minute] = raw.split(":");

  const hour = Number(hourText);

  if (Number.isNaN(hour) || !minute) {
    return raw;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

const getSeatId = (seat) => {
  return seat?.seatId ?? seat?.id ?? null;
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message || data?.error || data?.detail || error?.message || fallback
  );
};

// ============================================================

// SUMMARY ROW

// ============================================================

function SummaryRow({ label, value, strong = false, valueColor }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={2}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={strong ? 700 : 400}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={strong ? 850 : 700}
        color={valueColor || "text.primary"}
        textAlign="right"
      >
        {value || "-"}
      </Typography>
    </Stack>
  );
}

// ============================================================

// COMPONENT

// ============================================================

function MembershipPayment() {
  const theme = useTheme();

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================

  // NAVIGATION STATE

  // ==========================================================

  const booking = location.state?.booking ?? null;

  const library = location.state?.library ?? null;

  const selectedPlan = location.state?.selectedPlan ?? null;

  const selectedFloor = location.state?.selectedFloor ?? null;

  const selectedSeat = location.state?.selectedSeat ?? null;

  const selectedSlot = location.state?.selectedSlot ?? null;

  const seatPriceQuote = location.state?.seatPriceQuote ?? null;

  const paymentType = location.state?.paymentType ?? null;

  // ==========================================================
  // QR ATTRIBUTION
  // ==========================================================
  //
  // SeatAvailability passes these values in navigation state.
  // URL fallback keeps attribution available if this route is
  // opened with qr/qrs query parameters.
  //
  // ==========================================================

  const qrAttribution = useMemo(
    () => qrCampaignApi.getQrAttributionFromUrl(location.search),
    [location.search],
  );

  const qrCampaignCode =
    location.state?.qrCampaignCode ??
    location.state?.qr ??
    qrAttribution.campaignCode ??
    null;

  const qrScanToken =
    location.state?.qrScanToken ??
    location.state?.qrs ??
    qrAttribution.scanToken ??
    null;

  const startDate = location.state?.startDate ?? booking?.startDate ?? null;

  const endDate = location.state?.endDate ?? booking?.endDate ?? null;

  // ==========================================================

  // BOOKING ID

  // ==========================================================

  const bookingId =
    booking?.bookingId ?? booking?.id ?? location.state?.bookingId ?? null;

  // ==========================================================

  // PAYMENT FLOW

  // ==========================================================

  const isBooking = Boolean(bookingId) || paymentType === "BOOKING";

  // ==========================================================

  // LOCAL STATE

  // ==========================================================

  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================

  // TRUSTED DISPLAY AMOUNT

  // ==========================================================

  //

  // IMPORTANT:

  //

  // Do NOT use:

  //

  // selectedPlan.price

  //

  // because that is the legacy/default NORMAL seat price.

  //

  // Example:

  //

  // NORMAL  = ₹699

  // PREMIUM = ₹799

  //

  // A Premium booking must never display ₹699 merely because

  // selectedPlan.price is ₹699.

  //

  // Display priority:

  //

  // 1. persisted Booking amount

  // 2. authenticated SeatPriceQuote.effectivePrice

  //

  // The payment backend independently calculates the trusted

  // payable amount again when creating the payment order.

  //

  // ==========================================================

  const bookingAmount = useMemo(() => {
    const candidates = [
      booking?.amount,

      booking?.finalAmount,

      booking?.payableAmount,
    ];

    for (const candidate of candidates) {
      if (candidate == null) {
        continue;
      }

      const amount = Number(candidate);

      if (Number.isFinite(amount) && amount > 0) {
        return roundMoney(amount);
      }
    }

    return null;
  }, [booking]);

  const verifiedQuoteAmount = useMemo(() => {
    const amount = Number(seatPriceQuote?.effectivePrice);

    if (!Number.isFinite(amount) || amount <= 0) {
      return null;
    }

    return roundMoney(amount);
  }, [seatPriceQuote]);

  const displayAmount = bookingAmount ?? verifiedQuoteAmount ?? null;

  // ==========================================================

  // PRICE BREAKDOWN

  // ==========================================================

  const standardBasePrice = useMemo(() => {
    const amount = Number(seatPriceQuote?.standardBasePrice);

    return Number.isFinite(amount) ? roundMoney(amount) : null;
  }, [seatPriceQuote]);

  const memberBasePrice = useMemo(() => {
    const amount = Number(seatPriceQuote?.memberBasePrice);

    return Number.isFinite(amount) ? roundMoney(amount) : null;
  }, [seatPriceQuote]);

  const memberPricingApplied = Boolean(seatPriceQuote?.memberPricingApplied);

  const effectiveBasePrice =
    memberPricingApplied && memberBasePrice != null
      ? memberBasePrice
      : standardBasePrice;

  const featureSurcharge = useMemo(() => {
    const amount = Number(seatPriceQuote?.featureSurcharge);

    return Number.isFinite(amount) ? roundMoney(amount) : 0;
  }, [seatPriceQuote]);

  const featurePrices = Array.isArray(seatPriceQuote?.featurePrices)
    ? seatPriceQuote.featurePrices
    : [];

  // ==========================================================

  // LOAD RAZORPAY SCRIPT

  // ==========================================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);

        return;
      }

      const existingScript = document.querySelector(
        'script[src="https\://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), {
          once: true,
        });

        existingScript.addEventListener("error", () => resolve(false), {
          once: true,
        });

        return;
      }

      const script = document.createElement("script");

      script.src = "https\://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // ==========================================================

  // OPEN RAZORPAY CHECKOUT

  // ==========================================================

  const openRazorpayCheckout = async (orderResponse) => {
    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      throw new Error("Unable to load Razorpay checkout.");
    }

    const transactionId = orderResponse?.transactionId;

    const gatewayOrderId = orderResponse?.gatewayOrderId;

    const keyId = orderResponse?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

    const amount = Number(orderResponse?.amount ?? 0);

    const currency = orderResponse?.currency || "INR";

    if (!transactionId) {
      throw new Error("Payment transaction ID was not returned.");
    }

    if (!gatewayOrderId) {
      throw new Error("Gateway order ID was not returned.");
    }

    if (!keyId) {
      throw new Error("Razorpay key ID is not configured.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid payment amount.");
    }

    return new Promise((resolve, reject) => {
      let settled = false;

      const options = {
        key: keyId,

        amount: Math.round(amount * 100),

        currency,

        name: "LibraryHub",

        description: selectedSeat?.seatNumber
          ? `Membership booking payment - Seat ${selectedSeat.seatNumber}`
          : "Library membership booking payment",

        order_id: gatewayOrderId,

        handler: async (razorpayResponse) => {
          try {
            const verification = await paymentApi.verifyPayment({
              transactionId,

              gatewayOrderId: razorpayResponse.razorpay_order_id,

              gatewayPaymentId: razorpayResponse.razorpay_payment_id,

              gatewaySignature: razorpayResponse.razorpay_signature,

              // ==============================================
              // QR ATTRIBUTION METADATA
              // ==============================================
              // The backend records bookingCompleted only after
              // Razorpay verification and booking completion.

              scanToken: qrScanToken || null,
            });

            if (verification?.status !== "SUCCESS") {
              throw new Error(
                verification?.message || "Payment verification failed.",
              );
            }

            settled = true;

            resolve(verification);
          } catch (verificationError) {
            settled = true;

            reject(verificationError);
          }
        },

        modal: {
          ondismiss: () => {
            if (settled) {
              return;
            }

            settled = true;

            const cancellationError = new Error(
              "Payment was cancelled before completion.",
            );

            cancellationError.code = "PAYMENT_CANCELLED";

            reject(cancellationError);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        if (settled) {
          return;
        }

        settled = true;

        const paymentError = new Error(
          response?.error?.description || "Razorpay payment failed.",
        );

        paymentError.code = "PAYMENT_FAILED";

        reject(paymentError);
      });

      razorpay.open();
    });
  };

  // ==========================================================

  // HANDLE PAYMENT

  // ==========================================================

  const handlePayment = async () => {
    try {
      setPaying(true);

      setError("");

      // ======================================================

      // LIBRARY

      // ======================================================

      if (!library?.id) {
        throw new Error("Library ID is missing.");
      }

      // ======================================================

      // BOOKING

      // ======================================================

      if (!bookingId) {
        throw new Error(
          "Booking ID is missing. Please restart the booking flow.",
        );
      }

      // ======================================================

      // DISPLAY AMOUNT

      // ======================================================

      //

      // This check is only for frontend UX.

      //

      // Backend remains authoritative.

      //

      // ======================================================

      if (displayAmount == null) {
        throw new Error(
          "Booking amount is unavailable. Please restart the booking flow.",
        );
      }

      // ======================================================

      // CREATE PAYMENT REQUEST

      // ======================================================

      const payload = {
        referenceId: Number(bookingId),

        referenceType: "BOOKING",

        libraryId: Number(library.id),

        seatId: getSeatId(selectedSeat)
          ? Number(getSeatId(selectedSeat))
          : null,

        currency: "INR",

        description: selectedSeat?.seatNumber
          ? `Membership booking payment - Seat ${selectedSeat.seatNumber}`
          : "Library membership booking payment",
      };

      console.log("Creating student booking payment:", payload);

      // ======================================================

      // CREATE RAZORPAY ORDER

      // ======================================================

      const orderResponse = await paymentApi.createOrder(payload);

      // ======================================================

      // OPTIONAL SAFETY CHECK

      // ======================================================

      //

      // The amount returned by createOrder is the backend

      // payment authority.

      //

      // We do NOT block payment merely because frontend state

      // differs, but we can warn in development.

      //

      // ======================================================

      const orderAmount = Number(orderResponse?.amount);

      if (
        Number.isFinite(orderAmount) &&
        displayAmount != null &&
        Math.abs(orderAmount - displayAmount) > 0.01
      ) {
        console.warn(
          "Frontend payment display differs from backend payment order amount.",

          {
            displayedAmount: displayAmount,

            backendAmount: orderAmount,

            bookingId,
          },
        );
      }

      // ======================================================

      // OPEN CHECKOUT + VERIFY PAYMENT

      // ======================================================

      const verification = await openRazorpayCheckout(orderResponse);

      //
      // At this point Razorpay verification has returned SUCCESS.
      // The backend payment processor is authoritative for payment
      // completion; attribution is recorded only after verification.
      //
      // ======================================================

      // ======================================================

      // SUCCESS NAVIGATION

      // ======================================================

      navigate(`/student/bookings/${bookingId}`, {
        replace: true,

        state: {
          paymentSuccess: true,

          verification,

          // ================================================
          // QR ATTRIBUTION
          // ================================================

          qrCampaignCode,
          qrScanToken,
          qr: qrCampaignCode,
          qrs: qrScanToken,
        },
      });
    } catch (requestError) {
      console.error("Student payment failed:", requestError);

      if (requestError?.code === "PAYMENT_CANCELLED") {
        setError(
          "Payment was cancelled. Your booking is still pending payment.",
        );

        return;
      }

      setError(getErrorMessage(requestError, "Unable to complete payment."));
    } finally {
      setPaying(false);
    }
  };

  // ==========================================================

  // INVALID NAVIGATION STATE

  // ==========================================================

  if (!bookingId) {
    return (
      <Box
        sx={{
          maxWidth: 760,

          mx: "auto",

          p: {
            xs: 2,

            md: 3,
          },
        }}
      >
        <Alert
          severity="warning"
          sx={{
            borderRadius: 3,
          }}
        >
          Booking information is missing. Please restart the seat booking flow.
        </Alert>

        <Button
          sx={{
            mt: 2,
          }}
          variant="contained"
          onClick={() => navigate("/libraries")}
        >
          Browse Libraries
        </Button>
      </Box>
    );
  }

  // ==========================================================

  // UI

  // ==========================================================

  return (
    <Box
      sx={{
        maxWidth: 1100,

        mx: "auto",

        p: {
          xs: 2,

          md: 3,
        },
      }}
    >
      {/* ====================================================== */}

      {/* BACK */}

      {/* ====================================================== */}

      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2.5,

          borderRadius: 2.5,
        }}
      >
        Back
      </Button>

      {/* ====================================================== */}

      {/* HEADER */}

      {/* ====================================================== */}

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
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                letterSpacing: "-0.04em",
              }}
            >
              {isBooking ? "Complete Payment" : "Membership Payment"}
            </Typography>

            <VerifiedRounded color="primary" />
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.6,
            }}
          >
            Review your booking and continue securely through Razorpay.
          </Typography>
        </Box>

        <Chip
          icon={<LockRounded />}
          label="Secure Payment"
          color="success"
          variant="outlined"
          sx={{
            fontWeight: 750,
          }}
        />
      </Stack>

      {/* ====================================================== */}

      {/* ERROR */}

      {/* ====================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,

            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ====================================================== */}

      {/* GRID */}

      {/* ====================================================== */}

      <Grid container spacing={3} alignItems="flex-start">
        {/* ==================================================== */}

        {/* LEFT - BOOKING SUMMARY */}

        {/* ==================================================== */}

        <Grid
          size={{
            xs: 12,

            md: 7,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",

              borderColor: "divider",

              borderRadius: 4,

              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2.5,

                background:
                  "linear-gradient(135deg,#071A37 0%,#0B4A9F 65%,#146EF5 140%)",

                color: "#fff",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.72)",

                      fontWeight: 800,
                    }}
                  >
                    BOOKING SUMMARY
                  </Typography>

                  <Typography variant="h5" fontWeight={900} mt={0.4}>
                    {library?.name || "Library Booking"}
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: "rgba(255,255,255,.12)",

                    color: "#fff",
                  }}
                >
                  <EventSeatRounded />
                </Avatar>
              </Stack>
            </Box>

            <CardContent
              sx={{
                p: {
                  xs: 2,

                  sm: 3,
                },

                "&:last-child": {
                  pb: {
                    xs: 2,

                    sm: 3,
                  },
                },
              }}
            >
              <Stack spacing={1.5}>
                <SummaryRow label="Booking ID" value={`#${bookingId}`} />

                <Divider />

                <SummaryRow label="Library" value={library?.name} />

                <SummaryRow
                  label="Membership Plan"
                  value={selectedPlan?.name}
                />

                {selectedFloor && (
                  <SummaryRow
                    label="Floor"
                    value={
                      selectedFloor?.name ||
                      `Floor ${selectedFloor?.floorNumber ?? ""}`
                    }
                  />
                )}

                {selectedSeat && (
                  <SummaryRow
                    label="Seat"
                    value={`${selectedSeat?.seatNumber || "-"} · ${formatEnum(
                      selectedSeat?.seatType,
                    )}`}
                  />
                )}

                {selectedSlot && (
                  <SummaryRow
                    label="Slot"
                    value={`${selectedSlot?.name || "Slot"}${
                      selectedSlot?.startTime && selectedSlot?.endTime
                        ? ` · ${formatTime(
                            selectedSlot.startTime,
                          )} – ${formatTime(selectedSlot.endTime)}`
                        : ""
                    }`}
                  />
                )}

                <SummaryRow
                  label="Start Date"
                  value={formatDisplayDate(startDate)}
                />

                <SummaryRow
                  label="End Date"
                  value={formatDisplayDate(endDate)}
                />
              </Stack>

              {/* ================================================= */}

              {/* VERIFIED PRICING BREAKDOWN */}

              {/* ================================================= */}

              {seatPriceQuote && (
                <>
                  <Divider
                    sx={{
                      my: 2.5,
                    }}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={1.5}
                  >
                    <VerifiedRounded
                      color="success"
                      sx={{
                        fontSize: 20,
                      }}
                    />

                    <Typography fontWeight={850}>
                      Verified Seat Pricing
                    </Typography>
                  </Stack>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,

                      borderRadius: 3,

                      bgcolor: alpha(theme.palette.success.main, 0.035),

                      border: "1px solid",

                      borderColor: alpha(theme.palette.success.main, 0.14),
                    }}
                  >
                    <Stack spacing={1.1}>
                      <SummaryRow
                        label="Standard Base Price"
                        value={
                          standardBasePrice != null
                            ? formatMoney(standardBasePrice)
                            : "-"
                        }
                      />

                      {memberPricingApplied && memberBasePrice != null && (
                        <SummaryRow
                          label="Your Member Base Price"
                          value={formatMoney(memberBasePrice)}
                          valueColor="success.main"
                        />
                      )}

                      <SummaryRow
                        label="Effective Base"
                        value={
                          effectiveBasePrice != null
                            ? formatMoney(effectiveBasePrice)
                            : "-"
                        }
                      />

                      {featurePrices.map((featurePrice, index) => {
                        const amount = Number(featurePrice?.additionalPrice);

                        return (
                          <SummaryRow
                            key={`${featurePrice?.feature}-${index}`}
                            label={formatEnum(featurePrice?.feature)}
                            value={
                              Number.isFinite(amount)
                                ? `+${formatMoney(amount)}`
                                : "-"
                            }
                          />
                        );
                      })}

                      <SummaryRow
                        label="Feature Surcharge"
                        value={
                          featureSurcharge > 0
                            ? `+${formatMoney(featureSurcharge)}`
                            : formatMoney(0)
                        }
                      />

                      <Divider />

                      <SummaryRow
                        label="Verified Total"
                        value={
                          verifiedQuoteAmount != null
                            ? formatMoney(verifiedQuoteAmount)
                            : "-"
                        }
                        valueColor="primary.main"
                        strong
                      />
                    </Stack>
                  </Paper>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ==================================================== */}

        {/* RIGHT - PAYMENT */}

        {/* ==================================================== */}

        <Grid
          size={{
            xs: 12,

            md: 5,
          }}
        >
          <Box
            sx={{
              position: {
                md: "sticky",
              },

              top: {
                md: 96,
              },
            }}
          >
            <Card
              elevation={0}
              sx={{
                border: "1px solid",

                borderColor: alpha(theme.palette.primary.main, 0.22),

                borderRadius: 4,

                boxShadow: "0 18px 50px rgba(15,23,42,.08)",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.3,

                    sm: 3,
                  },

                  "&:last-child": {
                    pb: {
                      xs: 2.3,

                      sm: 3,
                    },
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={800}
                    >
                      AMOUNT PAYABLE
                    </Typography>

                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color="primary.main"
                      sx={{
                        mt: 0.4,

                        letterSpacing: "-0.04em",
                      }}
                    >
                      {displayAmount != null ? formatMoney(displayAmount) : "—"}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.09),

                      color: "primary.main",

                      width: 50,

                      height: 50,
                    }}
                  >
                    <CreditCardRounded />
                  </Avatar>
                </Stack>

                {bookingAmount != null && (
                  <Chip
                    icon={<CheckCircleRounded />}
                    label="Amount saved with booking"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{
                      mt: 1.4,

                      fontWeight: 700,
                    }}
                  />
                )}

                {bookingAmount == null && verifiedQuoteAmount != null && (
                  <Chip
                    icon={<VerifiedRounded />}
                    label="Verified seat quote"
                    color="success"
                    size="small"
                    variant="outlined"
                    sx={{
                      mt: 1.4,

                      fontWeight: 700,
                    }}
                  />
                )}

                <Divider
                  sx={{
                    my: 2.5,
                  }}
                />

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EventSeatRounded color="action" fontSize="small" />

                    <Typography variant="body2" color="text.secondary">
                      {selectedSeat
                        ? `Seat ${selectedSeat?.seatNumber || "-"}`
                        : "Seat booking"}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <WorkspacePremiumRounded color="action" fontSize="small" />

                    <Typography variant="body2" color="text.secondary">
                      {selectedPlan?.name || "Membership plan"}
                    </Typography>
                  </Stack>

                  {selectedSlot && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ScheduleRounded color="action" fontSize="small" />

                      <Typography variant="body2" color="text.secondary">
                        {selectedSlot?.name || "Booking slot"}
                      </Typography>
                    </Stack>
                  )}
                </Stack>

                <Alert
                  severity="info"
                  icon={<LockRounded />}
                  sx={{
                    mt: 2.5,

                    borderRadius: 2.5,
                  }}
                >
                  The backend recalculates the trusted payable amount from the
                  saved booking before creating the payment order. The browser
                  cannot change the amount charged.
                </Alert>

                {displayAmount == null && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 2,

                      borderRadius: 2.5,
                    }}
                  >
                    The booking amount is unavailable. Restart the booking flow
                    before payment.
                  </Alert>
                )}

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  startIcon={
                    paying ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <CreditCardRounded />
                    )
                  }
                  disabled={
                    paying || displayAmount == null || displayAmount <= 0
                  }
                  onClick={handlePayment}
                  sx={{
                    mt: 3,

                    minHeight: 54,

                    borderRadius: 2.7,

                    fontWeight: 850,

                    boxShadow:
                      displayAmount != null && !paying
                        ? `0 12px 28px ${alpha(
                            theme.palette.primary.main,

                            0.22,
                          )}`
                        : "none",
                  }}
                >
                  {paying
                    ? "Opening Secure Payment..."
                    : displayAmount != null
                      ? `Pay ${formatMoney(displayAmount)}`
                      : "Payment Unavailable"}
                </Button>

                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={0.6}
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <LockRounded
                    sx={{
                      fontSize: 14,

                      color: "success.main",
                    }}
                  />

                  <Typography variant="caption" color="text.secondary">
                    Secured by Razorpay
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MembershipPayment;
