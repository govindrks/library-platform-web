import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CreditCard,
  EventSeat,
  Lock,
  Schedule,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import paymentApi from "../../../api/paymentApi";

// ============================================================
// HELPERS
// ============================================================

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
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

  // ==========================================================
  // BOOKING ID
  // ==========================================================
  //
  // Support all currently possible navigation shapes:
  //
  // booking.bookingId
  // booking.id
  // location.state.bookingId
  //
  // Payment must reference the persisted Booking ID.
  // ==========================================================

  const bookingId =
    booking?.bookingId ??
    booking?.id ??
    location.state?.bookingId ??
    null;

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
  // DISPLAY AMOUNT
  // ==========================================================
  //
  // The amount displayed by the frontend is informational.
  // The backend independently resolves the trusted payable
  // amount from Booking.amount.
  // ==========================================================

  const displayAmount = booking?.amount ?? selectedPlan?.price ?? 0;

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

    const keyId =
      orderResponse?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

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

      // ========================================================
      // LIBRARY
      // ========================================================

      if (!library?.id) {
        throw new Error("Library ID is missing.");
      }

      // ========================================================
      // BOOKING
      // ========================================================
      //
      // Membership purchase has already created a Booking with
      // status PENDING_PAYMENT. Payment therefore references the
      // persisted booking, never the membership plan ID.
      // ========================================================

      if (!bookingId) {
        throw new Error(
          "Booking ID is missing. Please restart the booking flow.",
        );
      }

      // ========================================================
      // CREATE PAYMENT REQUEST
      // ========================================================

      const payload = {
        referenceId: Number(bookingId),
        referenceType: "BOOKING",
        libraryId: Number(library.id),
        seatId: selectedSeat?.id ? Number(selectedSeat.id) : null,
        currency: "INR",
        description: selectedSeat?.seatNumber
          ? `Membership booking payment - Seat ${selectedSeat.seatNumber}`
          : "Library membership booking payment",
      };

      console.log("Creating student booking payment:", payload);

      // ========================================================
      // CREATE RAZORPAY ORDER
      // ========================================================

      const orderResponse = await paymentApi.createOrder(payload);

      // ========================================================
      // OPEN CHECKOUT + VERIFY PAYMENT
      // ========================================================

      const verification = await openRazorpayCheckout(orderResponse);

      // ========================================================
      // SUCCESS NAVIGATION
      // ========================================================

      navigate(`/student/bookings/${bookingId}`, {
        replace: true,
        state: {
          paymentSuccess: true,
          verification,
        },
      });
    } catch (requestError) {
      console.error("Student payment failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
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
        maxWidth: 760,
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
        }}
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
        Review your payment details and continue securely through Razorpay.
      </Typography>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
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
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Library</Typography>

              <Typography fontWeight={600}>
                {library?.name || "-"}
              </Typography>
            </Stack>

            {selectedPlan && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Plan</Typography>

                <Typography fontWeight={600}>
                  {selectedPlan.name || "-"}
                </Typography>
              </Stack>
            )}

            {selectedSeat && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Seat</Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <EventSeat fontSize="small" />

                  <Typography fontWeight={600}>
                    {selectedSeat.seatNumber || "-"}
                  </Typography>
                </Stack>
              </Stack>
            )}

            {selectedSlot && (
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Slot</Typography>

                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Schedule fontSize="small" />

                  <Typography fontWeight={600}>
                    {selectedSlot.name || "-"}
                  </Typography>
                </Stack>
              </Stack>
            )}

            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Booking ID</Typography>

              <Typography fontWeight={600}>#{bookingId}</Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Amount
            </Typography>

            <Typography variant="h5" fontWeight={800} color="primary.main">
              {formatMoney(displayAmount)}
            </Typography>
          </Stack>

          <Alert
            severity="info"
            icon={<Lock />}
            sx={{
              mt: 3,
            }}
          >
            The backend calculates the trusted payable amount from the saved
            booking before creating the payment order.
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
            disabled={paying || Number(displayAmount) <= 0}
            onClick={handlePayment}
            sx={{
              mt: 3,
            }}
          >
            {paying ? "Opening Payment..." : `Pay ${formatMoney(displayAmount)}`}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default MembershipPayment;
