import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import {
  CheckCircleRounded,
  Close,
  LocalOfferRounded,
  LockOutlined,
  SavingsOutlined,
  VerifiedOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import studentCouponApi from "../../../api/studentCouponApi";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.detail ||
  error?.message ||
  fallback;

const normalizeCouponCode = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

const CouponApply = forwardRef(
  (
    {
      amount = 0,
      libraryId = null,
      disabled = false,
      initialCoupon = null,
      onCouponApplied,
      onCouponRemoved,
      onCouponConsumed,
    },
    ref,
  ) => {
    const [couponCode, setCouponCode] = useState(
      initialCoupon?.code ? String(initialCoupon.code).toUpperCase() : "",
    );

    const [appliedCoupon, setAppliedCoupon] = useState(
      initialCoupon?.valid === false ? null : initialCoupon,
    );

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const originalAmount = Number(amount ?? 0);

    const discountAmount = Number(appliedCoupon?.discountAmount ?? 0);

    const payableAmount = useMemo(() => {
      if (appliedCoupon?.finalAmount != null) {
        return Math.max(Number(appliedCoupon.finalAmount), 0);
      }

      return Math.max(originalAmount - discountAmount, 0);
    }, [appliedCoupon, discountAmount, originalAmount]);

    const savingPercentage = useMemo(() => {
      if (originalAmount <= 0 || discountAmount <= 0) {
        return 0;
      }

      return Math.min(Math.round((discountAmount / originalAmount) * 100), 100);
    }, [discountAmount, originalAmount]);

    const hasAppliedCoupon = Boolean(appliedCoupon?.couponId);

    useEffect(() => {
      if (!hasAppliedCoupon) {
        return;
      }

      const validatedOriginal = Number(
        appliedCoupon?.originalAmount ?? originalAmount,
      );

      if (
        Number.isFinite(validatedOriginal) &&
        Number.isFinite(originalAmount) &&
        Math.abs(validatedOriginal - originalAmount) > 0.01
      ) {
        setAppliedCoupon(null);
        setCouponCode("");
        setSuccess("");
        setError("The booking amount changed. Please apply the coupon again.");
        onCouponRemoved?.();
      }
    }, [
      amount,
      appliedCoupon,
      hasAppliedCoupon,
      onCouponRemoved,
      originalAmount,
    ]);

    const handleApplyCoupon = async () => {
      const normalizedCode = normalizeCouponCode(couponCode);

      setError("");
      setSuccess("");

      if (!normalizedCode) {
        setError("Please enter a coupon code.");
        return;
      }

      if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
        setError("Coupon cannot be applied to an invalid payment amount.");
        return;
      }

      const resolvedLibraryId = Number(libraryId);

      if (!Number.isFinite(resolvedLibraryId)) {
        setError(
          "Library information is missing. Pass libraryId to CouponApply before validating a coupon.",
        );
        return;
      }

      try {
        setLoading(true);

        const response = await studentCouponApi.validateCoupon({
          libraryId: resolvedLibraryId,
          code: normalizedCode,
          amount: originalAmount,
        });

        if (!response?.valid || !response?.couponId) {
          setAppliedCoupon(null);
          setError(response?.message || "This coupon is not valid.");
          return;
        }

        const normalizedResponse = {
          ...response,
          code: response?.code || normalizedCode,
          originalAmount: Number(response?.originalAmount ?? originalAmount),
          discountAmount: Number(response?.discountAmount ?? 0),
          finalAmount: Number(
            response?.finalAmount ??
              Math.max(
                originalAmount - Number(response?.discountAmount ?? 0),
                0,
              ),
          ),
          valid: true,
        };

        setAppliedCoupon(normalizedResponse);
        setCouponCode(normalizedResponse.code);
        setSuccess(
          response?.message ||
            `${normalizedResponse.code} applied successfully.`,
        );
        setDetailsOpen(true);

        onCouponApplied?.({
          coupon: normalizedResponse,
          couponId: Number(normalizedResponse.couponId),
          couponCode: normalizedResponse.code,
          discountAmount: normalizedResponse.discountAmount,
          originalAmount: normalizedResponse.originalAmount,
          payableAmount: normalizedResponse.finalAmount,
        });
      } catch (requestError) {
        console.error("Coupon validation failed:", requestError);

        setAppliedCoupon(null);
        setSuccess("");
        setError(
          getErrorMessage(
            requestError,
            "Unable to validate this coupon right now.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setCouponCode("");
      setError("");
      setSuccess("");
      setDetailsOpen(false);
      onCouponRemoved?.();
    };

    useImperativeHandle(
      ref,
      () => ({
        /*
         * Recent LibraryHub flow:
         * coupon consumption is performed by the backend after a successful
         * payment using PaymentTransaction.couponId. This method remains only
         * for backward compatibility with older parent components.
         */
        consumeCoupon: (context = {}) => {
          if (!appliedCoupon) {
            return null;
          }

          const snapshot = {
            coupon: appliedCoupon,
            couponId: Number(appliedCoupon.couponId),
            couponCode: appliedCoupon.code,
            discountAmount,
            originalAmount,
            payableAmount,
            ...context,
          };

          onCouponConsumed?.(snapshot);
          return snapshot;
        },

        getCouponData: () => ({
          coupon: appliedCoupon,
          couponId: appliedCoupon?.couponId ?? null,
          couponCode: appliedCoupon?.code ?? null,
          discountAmount,
          originalAmount,
          payableAmount,
        }),

        hasAppliedCoupon: () => hasAppliedCoupon,

        removeCoupon: handleRemoveCoupon,
      }),
      [
        appliedCoupon,
        discountAmount,
        hasAppliedCoupon,
        onCouponConsumed,
        originalAmount,
        payableAmount,
      ],
    );

    const canApply =
      !disabled &&
      !loading &&
      Boolean(couponCode.trim()) &&
      Number.isFinite(originalAmount) &&
      originalAmount > 0;

    return (
      <Box
        sx={{
          border: "1px solid",
          borderColor: hasAppliedCoupon
            ? "success.light"
            : "rgba(79,70,229,0.14)",
          borderRadius: 3.5,
          overflow: "hidden",
          background: hasAppliedCoupon
            ? "linear-gradient(145deg, rgba(34,197,94,0.055), rgba(255,255,255,0.98))"
            : "linear-gradient(145deg, rgba(79,70,229,0.045), rgba(255,255,255,0.98))",
          transition: "all 0.25s ease",
          boxShadow: hasAppliedCoupon
            ? "0 12px 30px rgba(34,197,94,0.08)"
            : "0 8px 24px rgba(15,23,42,0.04)",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: hasAppliedCoupon
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(79,70,229,0.10)",
                    color: hasAppliedCoupon ? "success.main" : "primary.main",
                  }}
                >
                  <LocalOfferRounded />
                </Box>

                <Box>
                  <Typography fontWeight={800}>
                    {hasAppliedCoupon ? "Coupon applied" : "Have a coupon?"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {hasAppliedCoupon
                      ? "Your discount is locked into this payment preview."
                      : "Enter a valid code to preview your discounted payable amount."}
                  </Typography>
                </Box>
              </Stack>

              {hasAppliedCoupon && (
                <Chip
                  size="small"
                  icon={<VerifiedOutlined />}
                  label="Validated"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>

            {!hasAppliedCoupon ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                alignItems={{ xs: "stretch", sm: "flex-start" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Coupon Code"
                  placeholder="WELCOME10"
                  value={couponCode}
                  disabled={disabled || loading}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    setError("");
                    setSuccess("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();

                      if (canApply) {
                        handleApplyCoupon();
                      }
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferRounded fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                    htmlInput: {
                      maxLength: 50,
                      style: {
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 700,
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.4,
                      bgcolor: "background.paper",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleApplyCoupon}
                  disabled={!canApply}
                  startIcon={
                    loading ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <SavingsOutlined />
                    )
                  }
                  sx={{
                    minWidth: { xs: "100%", sm: 128 },
                    minHeight: 40,
                    borderRadius: 2.4,
                    textTransform: "none",
                    fontWeight: 800,
                  }}
                >
                  {loading ? "Checking..." : "Apply Code"}
                </Button>
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "success.light",
                  bgcolor: "rgba(255,255,255,0.72)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1.5}
                >
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(34,197,94,0.12)",
                        color: "success.main",
                      }}
                    >
                      <CheckCircleRounded />
                    </Box>

                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Typography
                          fontWeight={900}
                          sx={{ letterSpacing: "0.06em" }}
                        >
                          {appliedCoupon.code}
                        </Typography>

                        {savingPercentage > 0 && (
                          <Chip
                            size="small"
                            label={`Save ${savingPercentage}%`}
                            color="success"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        You save {formatMoney(discountAmount)} on this payment.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button
                      size="small"
                      onClick={() => setDetailsOpen((current) => !current)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {detailsOpen ? "Hide details" : "View details"}
                    </Button>

                    <Tooltip title="Remove coupon">
                      <IconButton
                        size="small"
                        onClick={handleRemoveCoupon}
                        aria-label="Remove coupon"
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Box>
            )}

            <Collapse in={Boolean(error)} unmountOnExit>
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ borderRadius: 2.5 }}
              >
                {error}
              </Alert>
            </Collapse>

            <Collapse in={Boolean(success) && !Boolean(error)} unmountOnExit>
              <Alert
                severity="success"
                onClose={() => setSuccess("")}
                sx={{ borderRadius: 2.5 }}
              >
                {success}
              </Alert>
            </Collapse>

            {hasAppliedCoupon && (
              <Collapse in={detailsOpen}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "rgba(15,23,42,0.025)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1.35}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        Original amount
                      </Typography>

                      <Typography fontWeight={700}>
                        {formatMoney(originalAmount)}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="success.main">
                        Coupon discount
                      </Typography>

                      <Typography fontWeight={800} color="success.main">
                        - {formatMoney(discountAmount)}
                      </Typography>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={savingPercentage}
                      color="success"
                      sx={{
                        height: 6,
                        borderRadius: 999,
                        bgcolor: "rgba(34,197,94,0.09)",
                      }}
                    />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography fontWeight={800}>Final payable</Typography>

                      <Typography
                        variant="h6"
                        fontWeight={900}
                        color="primary.main"
                      >
                        {formatMoney(payableAmount)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Collapse>
            )}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ color: "text.secondary" }}
            >
              <LockOutlined sx={{ fontSize: 16 }} />

              <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
                Coupon eligibility and discount are validated by LibraryHub. The
                payment backend recalculates the final amount before the
                Razorpay order is created.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    );
  },
);

CouponApply.displayName = "CouponApply";

export default CouponApply;
