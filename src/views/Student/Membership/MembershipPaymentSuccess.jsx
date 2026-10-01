import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";

const MembershipPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Expected navigation state:
   *
   * navigate("/member/membership/payment-success", {
   *   state: {
   *     paymentId,
   *     transactionId,
   *     gatewayOrderId,
   *     membershipPlanId,
   *     planName,
   *     seatId,
   *     seatNumber,
   *     regularAmount,
   *     memberPrice,
   *     couponCode,
   *     couponDiscountAmount,
   *     finalAmount,
   *     currency: "INR",
   *     startDate,
   *     endDate,
   *   },
   * });
   */

  const payment = location.state || {};

  const {
    paymentId,
    transactionId,
    gatewayOrderId,
    membershipPlanId,
    planName,
    seatId,
    seatNumber,
    regularAmount,
    memberPrice,
    couponCode,
    couponDiscountAmount,
    finalAmount,
    currency = "INR",
    startDate,
    endDate,
  } = payment;

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined || amount === "") {
      return "₹0.00";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewMembership = () => {
    navigate("/member/membership");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleBackToDashboard = () => {
    navigate("/member/dashboard");
  };

  const hasDiscount =
    Number(memberPrice || 0) < Number(regularAmount || 0);

  const hasCoupon =
    couponCode &&
    Number(couponDiscountAmount || 0) > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        py: { xs: 4, md: 7 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
        }}
      >
        {/* Success Header */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",
              py: { xs: 4, md: 5 },
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 82,
                color: "success.main",
                mb: 2,
              }}
            />

            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
            >
              Payment Successful
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Your membership payment has been successfully
              completed and your membership is now active.
            </Typography>

            <Chip
              label="Payment Completed"
              color="success"
              sx={{
                mt: 2,
                fontWeight: 600,
              }}
            />
          </CardContent>
        </Card>

        {/* Membership Summary */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              mb={3}
            >
              <WorkspacePremiumIcon color="primary" />

              <Typography variant="h6" fontWeight={700}>
                Membership Details
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Membership Plan"
                  value={planName || `Plan #${membershipPlanId || "—"}`}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Seat"
                  value={
                    seatNumber
                      ? seatNumber
                      : seatId
                        ? `Seat #${seatId}`
                        : "—"
                  }
                  icon={<EventSeatIcon fontSize="small" />}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Membership Start"
                  value={formatDate(startDate)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DetailItem
                  label="Membership End"
                  value={formatDate(endDate)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              mb={3}
            >
              <ReceiptLongIcon color="primary" />

              <Typography variant="h6" fontWeight={700}>
                Payment Summary
              </Typography>
            </Stack>

            <Stack spacing={2}>
              {/* Regular Price */}
              <PriceRow
                label="Regular Plan Price"
                value={formatAmount(regularAmount)}
              />

              {/* Member Specific Price */}
              {hasDiscount && (
                <PriceRow
                  label="Member-Specific Price"
                  value={formatAmount(memberPrice)}
                />
              )}

              {/* Coupon */}
              {hasCoupon && (
                <PriceRow
                  label={
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <span>Coupon Discount</span>

                      <Chip
                        label={couponCode}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Stack>
                  }
                  value={`-${formatAmount(couponDiscountAmount)}`}
                  valueColor="success.main"
                />
              )}

              <Divider />

              {/* Final Amount */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Amount Paid
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="primary.main"
                >
                  {formatAmount(finalAmount)}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography
              variant="h6"
              fontWeight={700}
              mb={3}
            >
              Transaction Details
            </Typography>

            <Stack spacing={2}>
              <TransactionRow
                label="Payment ID"
                value={paymentId}
              />

              <TransactionRow
                label="Transaction ID"
                value={transactionId}
              />

              <TransactionRow
                label="Razorpay Order ID"
                value={gatewayOrderId}
              />

              <TransactionRow
                label="Payment Status"
                value={
                  <Chip
                    label="SUCCESS"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Important Message */}
        <Box
          sx={{
            backgroundColor: "success.50",
            border: "1px solid",
            borderColor: "success.200",
            borderRadius: 2,
            p: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="body2"
            color="success.dark"
          >
            Your payment has been recorded successfully. Your
            membership and seat allocation are now active.
          </Typography>
        </Box>

        {/* Actions */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<WorkspacePremiumIcon />}
            onClick={handleViewMembership}
            sx={{
              minWidth: 220,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            View Membership
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToDashboard}
            sx={{
              minWidth: 220,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="text"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Home
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

/**
 * Reusable detail item
 */
const DetailItem = ({ label, value, icon }) => {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mb={0.5}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        spacing={0.75}
      >
        {icon && icon}

        <Typography
          variant="body1"
          fontWeight={600}
        >
          {value || "—"}
        </Typography>
      </Stack>
    </Box>
  );
};

/**
 * Payment amount row
 */
const PriceRow = ({
  label,
  value,
  valueColor = "text.primary",
}) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Typography
        variant="body1"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={600}
        color={valueColor}
      >
        {value}
      </Typography>
    </Stack>
  );
};

/**
 * Transaction detail row
 */
const TransactionRow = ({ label, value }) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      spacing={1}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          wordBreak: "break-all",
          textAlign: { sm: "right" },
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
};

export default MembershipPaymentSuccess;