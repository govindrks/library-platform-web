import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import memberPricingApi from "../../../api/memberPricingApi";
import couponApi from "../../../api/couponApi";
import paymentApi from "../../../api/paymentApi";

const MembershipPayment = ({
  memberId,
  libraryId,
  membershipPlan,
  selectedSeat,
  onSuccess,
}) => {

  const [pricing, setPricing] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);

  const [loadingPrice, setLoadingPrice] = useState(true);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadEffectivePrice();
  }, [memberId, membershipPlan?.id]);

  const loadEffectivePrice = async () => {

    if (!memberId || !membershipPlan?.id) {
      return;
    }

    try {
      setLoadingPrice(true);
      setError("");

      const response =
        await memberPricingApi.getEffectivePrice(
          memberId,
          membershipPlan.id
        );

      setPricing(response);

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Unable to load membership pricing."
      );
    } finally {
      setLoadingPrice(false);
    }
  };

  const regularPrice =
    Number(
      pricing?.regularPrice ??
      membershipPlan?.price ??
      0
    );

  const memberPrice =
    Number(
      pricing?.effectivePrice ??
      regularPrice
    );

  const couponDiscount =
    Number(
      coupon?.discountAmount ?? 0
    );

  const finalAmount = useMemo(() => {

    return Math.max(
      0,
      memberPrice - couponDiscount
    );

  }, [memberPrice, couponDiscount]);

  const applyCoupon = async () => {

    if (!couponCode.trim()) {
      return;
    }

    try {

      setApplyingCoupon(true);
      setError("");

      const response =
        await couponApi.validateCoupon({
          libraryId,
          code: couponCode.trim(),
          amount: memberPrice,
        });

      setCoupon(response);

    } catch (err) {

      setCoupon(null);

      setError(
        err?.response?.data?.message ||
        "Unable to apply coupon."
      );

    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
  };

  const handlePayment = async () => {

    try {

      if (!selectedSeat?.id) {
        setError("Please select a seat.");
        return;
      }

      setCreatingOrder(true);
      setError("");

      /*
       * IMPORTANT:
       * Do NOT send finalAmount as the trusted amount.
       *
       * Backend recalculates:
       * regular price
       * → member-specific price
       * → coupon
       * → final amount
       */

      const orderResponse =
        await paymentApi.createOrder({

          referenceId: membershipPlan.id,

          referenceType: "MEMBERSHIP",

          libraryId,

          customerId: memberId,

          customerName: undefined,

          email: undefined,

          mobile: undefined,

          amount: finalAmount,

          currency: "INR",

          description:
            `${membershipPlan.name} Membership`,

          couponId:
            coupon?.couponId ?? null,

          seatId:
            selectedSeat.id,

        });

      openRazorpayCheckout(orderResponse);

    } catch (err) {

      setError(
        err?.response?.data?.message ||
        "Unable to create payment order."
      );

      setCreatingOrder(false);
    }
  };

  const openRazorpayCheckout = (orderResponse) => {

    if (!window.Razorpay) {
      setError("Razorpay checkout is not available.");
      setCreatingOrder(false);
      return;
    }

    const options = {

      key: orderResponse.keyId,

      amount:
        Number(orderResponse.amount) * 100,

      currency:
        orderResponse.currency || "INR",

      name:
        "LibraryHub",

      description:
        `${membershipPlan.name} Membership`,

      order_id:
        orderResponse.orderId,

      handler: async (response) => {

        try {

          const verificationResponse =
            await paymentApi.verifyPayment({

              transactionId:
                orderResponse.transactionId,

              razorpayOrderId:
                response.razorpay_order_id,

              razorpayPaymentId:
                response.razorpay_payment_id,

              razorpaySignature:
                response.razorpay_signature,

            });

          onSuccess?.(verificationResponse);

        } catch (err) {

          setError(
            err?.response?.data?.message ||
            "Payment verification failed."
          );

        } finally {

          setCreatingOrder(false);

        }
      },

      modal: {
        ondismiss: () => {
          setCreatingOrder(false);
        },
      },

      theme: {
        color: "#1976d2",
      },
    };

    const razorpay =
      new window.Razorpay(options);

    razorpay.open();
  };

  if (loadingPrice) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        py={6}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={720} mx="auto" p={3}>

      <Typography
        variant="h5"
        fontWeight={700}
        mb={3}
      >
        Payment Summary
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>

          <Stack spacing={2}>

            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                {membershipPlan.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {membershipPlan.durationDays} days
              </Typography>
            </Box>

            <Divider />

            <PriceRow
              label="Regular Amount"
              value={regularPrice}
            />

            {memberPrice !== regularPrice && (
              <PriceRow
                label="Member Price"
                value={-(
                  regularPrice - memberPrice
                )}
                success
              />
            )}

            <PriceRow
              label="Base Amount"
              value={memberPrice}
              bold
            />

            <Divider />

            <Box>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                mb={1}
              >
                <LocalOfferOutlinedIcon />

                <Typography
                  fontWeight={600}
                >
                  Apply Coupon
                  {" "}
                  <Typography
                    component="span"
                    color="text.secondary"
                  >
                    (Optional)
                  </Typography>
                </Typography>

              </Stack>

              {!coupon ? (

                <Stack
                  direction="row"
                  spacing={1}
                >

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(
                        e.target.value
                      )
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={applyCoupon}
                    disabled={
                      applyingCoupon ||
                      !couponCode.trim()
                    }
                  >
                    {applyingCoupon
                      ? "Applying..."
                      : "Apply"}
                  </Button>

                </Stack>

              ) : (

                <Alert
                  severity="success"
                  action={
                    <IconButton
                      size="small"
                      onClick={removeCoupon}
                    >
                      <CloseIcon />
                    </IconButton>
                  }
                >
                  <strong>
                    {coupon.code}
                  </strong>
                  {" "}
                  applied. You saved ₹
                  {coupon.discountAmount}
                </Alert>

              )}

            </Box>

            <Divider />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Final Amount
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
              >
                ₹{finalAmount.toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              startIcon={
                <LockOutlinedIcon />
              }
              onClick={handlePayment}
              disabled={
                creatingOrder ||
                !selectedSeat?.id
              }
              sx={{
                py: 1.5,
                mt: 1,
              }}
            >
              {creatingOrder
                ? "Preparing Payment..."
                : `Proceed to Pay ₹${finalAmount}`}
            </Button>

          </Stack>

        </CardContent>
      </Card>

    </Box>
  );
};

const PriceRow = ({
  label,
  value,
  success = false,
  bold = false,
}) => (

  <Box
    display="flex"
    justifyContent="space-between"
  >

    <Typography
      fontWeight={bold ? 600 : 400}
      color="text.secondary"
    >
      {label}
    </Typography>

    <Typography
      fontWeight={bold ? 700 : 500}
      color={
        success
          ? "success.main"
          : "text.primary"
      }
    >
      {value < 0 ? "-₹" : "₹"}
      {Math.abs(value).toFixed(2)}
    </Typography>

  </Box>
);

export default MembershipPayment;