import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CreditCard,
  EventSeat,
  LocalOfferOutlined,
  Lock,
  Schedule,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import paymentApi from "../../../api/paymentApi";

// ============================================================
// HELPERS
// ============================================================

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const formatEnum = (value, fallback = "-") => {
  if (!value) {
    return fallback;
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

// ============================================================
// COMPONENT
// ============================================================

function MembershipPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================================
  // NAVIGATION STATE
  // ==========================================================

  const booking = location.state?.booking ?? null;

  const library = location.state?.library ?? null;

  const selectedPlan = location.state?.selectedPlan ?? null;

  const selectedSeat = location.state?.selectedSeat ?? null;

  const selectedSlot = location.state?.selectedSlot ?? null;

  const paymentType = location.state?.paymentType ?? null;

  const pricingPreview = location.state?.pricingPreview ?? null;

  // ==========================================================
  // BOOKING
  // ==========================================================

  const bookingId =
    booking?.bookingId ?? booking?.id ?? location.state?.bookingId ?? null;

  const isBooking = Boolean(bookingId) || paymentType === "BOOKING";

  // ==========================================================
  // SERVER-VERIFIED BOOKING PRICE
  // ==========================================================
  //
  // Priority:
  //
  // 1. Amount returned by BookingService
  // 2. Server quote forwarded by BookingReview
  //
  // selectedPlan.price is intentionally NOT used anymore.
  // ==========================================================

  const originalAmount = Number(
    booking?.amount ??
      booking?.bookingAmount ??
      booking?.totalAmount ??
      booking?.payableAmount ??
      pricingPreview?.originalAmount ??
      0,
  );

  const seatType = pricingPreview?.seatType ?? selectedSeat?.seatType ?? null;

  const standardBasePrice = pricingPreview?.standardBasePrice ?? null;

  const memberBasePrice = pricingPreview?.memberBasePrice ?? null;

  const memberPricingApplied = Boolean(pricingPreview?.memberPricingApplied);

  const featurePrices = Array.isArray(pricingPreview?.featurePrices)
    ? pricingPreview.featurePrices
    : [];

  const featureTotal = Number(pricingPreview?.featureTotal ?? 0);

  // ==========================================================
  // PAYMENT STATE
  // ==========================================================

  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // COUPON STATE
  // ==========================================================

  const appliedCoupon =
    location.state?.coupon && location.state?.pricingPreview
      ? {
          couponId: location.state.coupon.couponId,

          code: location.state.coupon.code,

          originalAmount: location.state.pricingPreview.originalAmount,

          discountAmount: location.state.pricingPreview.discountAmount,

          finalAmount: location.state.pricingPreview.finalAmount,

          valid: true,
        }
      : null;

  // ==========================================================
  // CALCULATED DISPLAY AMOUNTS
  // ==========================================================

  const discountAmount = Number(appliedCoupon?.discountAmount ?? 0);

  const finalAmount = appliedCoupon
    ? Number(appliedCoupon?.finalAmount ?? originalAmount)
    : originalAmount;

  // ==========================================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================================

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
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

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });

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

    /*
     * IMPORTANT:
     *
     * This is the amount returned by the payment backend.
     * It is the amount that Razorpay receives.
     *
     * The frontend preview never controls this value.
     */
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

      if (!library?.id) {
        throw new Error("Library ID is missing.");
      }

      if (!bookingId) {
        throw new Error(
          "Booking ID is missing. Please restart the booking flow.",
        );
      }

      if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
        throw new Error(
          "Booking amount is missing. Please restart the booking flow.",
        );
      }

      /*
       * IMPORTANT:
       *
       * Do NOT send any trusted price from the browser.
       *
       * No:
       * amount
       * finalAmount
       * discountAmount
       * originalAmount
       *
       * The backend receives only the booking reference,
       * optional coupon and contextual IDs.
       */
      const payload = {
        referenceId: Number(bookingId),

        referenceType: "BOOKING",

        libraryId: Number(library.id),

        seatId: selectedSeat?.id ? Number(selectedSeat.id) : null,

        couponId: appliedCoupon?.couponId
          ? Number(appliedCoupon.couponId)
          : null,

        currency: "INR",

        description: selectedSeat?.seatNumber
          ? `Membership booking payment - Seat ${selectedSeat.seatNumber}`
          : "Library membership booking payment",
      };

      console.log("Creating student booking payment:", payload);

      const orderResponse = await paymentApi.createOrder(payload);

      const backendAmount = Number(orderResponse?.amount ?? 0);

      /*
       * Development consistency check only.
       *
       * Never block payment because of a preview mismatch.
       * Payment backend remains authoritative.
       */
      if (
        Number.isFinite(backendAmount) &&
        backendAmount > 0 &&
        Math.abs(backendAmount - finalAmount) > 0.01
      ) {
        console.warn(
          "Frontend payment preview differs from backend payment amount.",
          {
            frontendFinalAmount: finalAmount,

            backendAmount,

            couponId: appliedCoupon?.couponId ?? null,

            couponCode: appliedCoupon?.code ?? null,
          },
        );
      }

      const verification = await openRazorpayCheckout(orderResponse);

      navigate(`/student/bookings/${bookingId}`, {
        replace: true,

        state: {
          paymentSuccess: true,

          verification,

          couponApplied: Boolean(appliedCoupon),

          couponCode: appliedCoupon?.code ?? null,

          discountAmount: appliedCoupon?.discountAmount ?? null,

          paidAmount: backendAmount,
        },
      });
    } catch (requestError) {
      console.error("Student payment failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          requestError?.message ||
          "Unable to complete payment.",
      );
    } finally {
      setPaying(false);
    }
  };

  // ==========================================================
  // INVALID NAVIGATION STATE
  // ==========================================================

  if (!bookingId) {
    return (
      <Alert severity="warning">
        Booking information is missing. Please start the booking flow again.
      </Alert>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        maxWidth: 820,
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={800}>
        {isBooking ? "Booking Payment" : "Membership Payment"}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 3,
        }}
      >
        Review your booking amount and continue securely through Razorpay.
      </Typography>

      {(!Number.isFinite(originalAmount) || originalAmount <= 0) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          The server-verified booking amount is unavailable. Please return to
          the booking review page and create the booking again.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* =====================================================
          PAYMENT SUMMARY
          ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Payment Summary
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Library</Typography>

              <Typography fontWeight={600} textAlign="right">
                {library?.name || "-"}
              </Typography>
            </Stack>

            {selectedPlan && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">Plan</Typography>

                <Typography fontWeight={600}>
                  {selectedPlan.name || "-"}
                </Typography>
              </Stack>
            )}

            {selectedSeat && (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography color="text.secondary">Seat</Typography>

                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <EventSeat fontSize="small" />

                    <Typography fontWeight={600}>
                      {selectedSeat.seatNumber || "-"}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography color="text.secondary">Seat Category</Typography>

                  <Typography fontWeight={600}>
                    {formatEnum(seatType, "Normal")}
                  </Typography>
                </Stack>
              </>
            )}

            {selectedSlot && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">Slot</Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Schedule fontSize="small" />

                  <Typography fontWeight={600}>
                    {selectedSlot.name || "-"}
                  </Typography>
                </Stack>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">Booking ID</Typography>

              <Typography fontWeight={600}>#{bookingId}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* =====================================================
          PRICE DETAILS
          ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: appliedCoupon ? "primary.light" : "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700}>
              Price Details
            </Typography>

            {appliedCoupon && (
              <Chip
                icon={<LocalOfferOutlined />}
                label={appliedCoupon.code}
                color="success"
                variant="outlined"
                sx={{
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            {standardBasePrice != null && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">
                  {formatEnum(seatType, "Normal")} Seat Base Price
                </Typography>

                <Typography fontWeight={700}>
                  {formatMoney(standardBasePrice)}
                </Typography>
              </Stack>
            )}

            {memberPricingApplied && memberBasePrice != null && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="success.main">
                  Your Member Base Price
                </Typography>

                <Typography fontWeight={800} color="success.main">
                  {formatMoney(memberBasePrice)}
                </Typography>
              </Stack>
            )}

            {featurePrices.map((item) => (
              <Stack
                key={item.feature}
                direction="row"
                justifyContent="space-between"
                spacing={2}
              >
                <Typography color="text.secondary">
                  {formatEnum(item.feature)} Surcharge
                </Typography>

                <Typography fontWeight={700}>
                  + {formatMoney(item.additionalPrice)}
                </Typography>
              </Stack>
            ))}

            {featurePrices.length > 0 && (
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography color="text.secondary">
                  Feature Surcharges
                </Typography>

                <Typography fontWeight={700}>
                  + {formatMoney(featureTotal)}
                </Typography>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography color="text.secondary">
                Server-Verified Booking Amount
              </Typography>

              <Typography fontWeight={800}>
                {formatMoney(originalAmount)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography
                color={appliedCoupon ? "success.main" : "text.secondary"}
              >
                {appliedCoupon
                  ? `Discount (${appliedCoupon.code})`
                  : "Discount"}
              </Typography>

              <Typography
                fontWeight={700}
                color={appliedCoupon ? "success.main" : "text.secondary"}
              >
                - {formatMoney(discountAmount)}
              </Typography>
            </Stack>

            <Divider />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h6" fontWeight={800}>
                Final Amount
              </Typography>

              <Typography variant="h4" fontWeight={900} color="primary.main">
                {formatMoney(finalAmount)}
              </Typography>
            </Stack>
          </Stack>

          <Alert severity="info" icon={<Lock />} sx={{ mt: 3 }}>
            The booking amount shown here comes from the server-verified booking
            price. Any coupon selected on the booking review page is revalidated
            on the backend before the Razorpay order is created.
          </Alert>

          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={
              paying ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CreditCard />
              )
            }
            disabled={
              paying ||
              !Number.isFinite(finalAmount) ||
              Number(finalAmount) <= 0
            }
            onClick={handlePayment}
            sx={{
              mt: 3,
              minHeight: 50,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "1rem",
            }}
          >
            {paying ? "Opening Payment..." : `Pay ${formatMoney(finalAmount)}`}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MembershipPayment;
