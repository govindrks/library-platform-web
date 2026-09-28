import {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";

import {
    CheckCircle,
    Close,
    LocalOffer,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import couponStore from "../../../utility/couponStore";

const currency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const CouponApply = forwardRef(
    (
        {
            amount = 0,
            onCouponApplied,
            onCouponRemoved,
            onCouponConsumed,
        },
        ref
    ) => {
        const [couponCode, setCouponCode] = useState("");

        const [appliedCoupon, setAppliedCoupon] =
            useState(null);

        const [discountAmount, setDiscountAmount] =
            useState(0);

        const [error, setError] = useState("");
        const [success, setSuccess] = useState("");

        const [loading, setLoading] = useState(false);

        /*
         * Final payable amount
         */
        const payableAmount = useMemo(() => {
            return Math.max(
                0,
                Number(amount || 0) -
                    Number(discountAmount || 0)
            );
        }, [amount, discountAmount]);

        /*
         * Apply coupon
         */
        const handleApplyCoupon = () => {
            setError("");
            setSuccess("");

            const normalizedCode = couponCode
                .trim()
                .toUpperCase();

            if (!normalizedCode) {
                setError(
                    "Please enter a coupon code."
                );
                return;
            }

            if (Number(amount) <= 0) {
                setError(
                    "Coupon cannot be applied to an invalid payment amount."
                );
                return;
            }

            setLoading(true);

            /*
             * Simulate API/network validation for now.
             * Later this will call couponApi.validateCoupon().
             */
            setTimeout(() => {
                try {
                    const validation =
                        couponStore.validateCoupon({
                            code: normalizedCode,
                            amount: Number(amount),
                        });

                    if (!validation.valid) {
                        setError(validation.message);
                        setLoading(false);
                        return;
                    }

                    const discount =
                        couponStore.calculateDiscount(
                            validation.coupon,
                            Number(amount)
                        );

                    if (discount <= 0) {
                        setError(
                            "This coupon does not provide a valid discount."
                        );
                        setLoading(false);
                        return;
                    }

                    setAppliedCoupon(
                        validation.coupon
                    );

                    setDiscountAmount(discount);

                    setSuccess(
                        `${validation.coupon.code} applied successfully.`
                    );

                    onCouponApplied?.({
                        coupon: validation.coupon,
                        discountAmount: discount,
                        originalAmount:
                            Number(amount),
                        payableAmount:
                            Number(amount) -
                            discount,
                    });
                } catch (applyError) {
                    console.error(
                        "Coupon apply failed:",
                        applyError
                    );

                    setError(
                        applyError?.message ||
                            "Unable to apply coupon."
                    );
                } finally {
                    setLoading(false);
                }
            }, 500);
        };

        /*
         * Remove applied coupon
         */
        const handleRemoveCoupon = () => {
            setAppliedCoupon(null);
            setDiscountAmount(0);

            setCouponCode("");
            setError("");
            setSuccess("");

            onCouponRemoved?.();
        };

        /*
         * Consume coupon.
         *
         * IMPORTANT:
         * This function is NOT called when the user
         * clicks Apply.
         *
         * The parent payment component should call
         * couponRef.current.consumeCoupon() ONLY
         * after successful payment.
         */
        const consumeCoupon = ({
            usedBy = "Current Student",
            bookingId = null,
            paymentId = null,
        } = {}) => {
            if (!appliedCoupon) {
                return null;
            }

            try {
                const consumedCoupon =
                    couponStore.consumeCoupon({
                        couponId:
                            appliedCoupon.id,
                        usedBy,
                        bookingId,
                        paymentId,
                        discountAmount,
                    });

                setAppliedCoupon(
                    consumedCoupon
                );

                onCouponConsumed?.({
                    coupon: consumedCoupon,
                    discountAmount,
                    originalAmount:
                        Number(amount),
                    payableAmount,
                });

                return consumedCoupon;
            } catch (consumeError) {
                console.error(
                    "Coupon consumption failed:",
                    consumeError
                );

                setError(
                    consumeError?.message ||
                        "Unable to consume coupon."
                );

                return null;
            }
        };

        /*
         * Expose functions to parent payment page.
         */
        useImperativeHandle(
            ref,
            () => ({
                consumeCoupon,

                getCouponData: () => ({
                    coupon: appliedCoupon,
                    discountAmount,
                    originalAmount:
                        Number(amount),
                    payableAmount,
                }),

                hasAppliedCoupon: () =>
                    Boolean(appliedCoupon),
            }),
            [
                appliedCoupon,
                discountAmount,
                amount,
                payableAmount,
            ]
        );

        return (
            <Box>
                <Stack spacing={2}>
                    {/* Header */}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <LocalOffer
                            fontSize="small"
                            color="primary"
                        />

                        <Typography
                            variant="subtitle1"
                            fontWeight={700}
                        >
                            Have a coupon?
                        </Typography>
                    </Stack>

                    {/* =================================================
                        COUPON INPUT
                    ================================================== */}
                    {!appliedCoupon ? (
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={1.5}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                label="Coupon Code"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                disabled={loading}
                                onChange={(event) => {
                                    setCouponCode(
                                        event.target.value.toUpperCase()
                                    );

                                    setError("");
                                    setSuccess("");
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key ===
                                        "Enter"
                                    ) {
                                        handleApplyCoupon();
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalOffer fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                variant="outlined"
                                onClick={
                                    handleApplyCoupon
                                }
                                disabled={
                                    loading ||
                                    !couponCode.trim()
                                }
                                sx={{
                                    minWidth: 110,
                                    textTransform:
                                        "none",
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={20}
                                    />
                                ) : (
                                    "Apply"
                                )}
                            </Button>
                        </Stack>
                    ) : (
                        /* =================================================
                           APPLIED COUPON
                        ================================================== */
                        <Box
                            sx={{
                                border: "1px solid",
                                borderColor:
                                    "success.light",
                                borderRadius: 2,
                                p: 2,
                                backgroundColor:
                                    "success.50",
                            }}
                        >
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={2}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1.5}
                                    alignItems="center"
                                >
                                    <CheckCircle
                                        color="success"
                                    />

                                    <Box>
                                        <Typography
                                            fontWeight={700}
                                        >
                                            {
                                                appliedCoupon.code
                                            }
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Coupon applied
                                            successfully
                                        </Typography>
                                    </Box>
                                </Stack>

                                <IconButton
                                    size="small"
                                    onClick={
                                        handleRemoveCoupon
                                    }
                                    aria-label="Remove coupon"
                                >
                                    <Close />
                                </IconButton>
                            </Stack>
                        </Box>
                    )}

                    {/* Error */}
                    {error && (
                        <Alert
                            severity="error"
                            onClose={() =>
                                setError("")
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Success */}
                    {success && !error && (
                        <Alert severity="success">
                            {success}
                        </Alert>
                    )}

                    {/* =================================================
                        PAYMENT DISCOUNT SUMMARY
                    ================================================== */}
                    {appliedCoupon && (
                        <Stack spacing={1.25}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Original Amount
                                </Typography>

                                <Typography fontWeight={600}>
                                    {currency(amount)}
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                >
                                    Coupon Discount
                                </Typography>

                                <Typography
                                    fontWeight={700}
                                    color="success.main"
                                >
                                    -{" "}
                                    {currency(
                                        discountAmount
                                    )}
                                </Typography>
                            </Stack>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{
                                    pt: 1.25,
                                    borderTop:
                                        "1px solid",
                                    borderColor:
                                        "divider",
                                }}
                            >
                                <Typography fontWeight={700}>
                                    Payable Amount
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {currency(
                                        payableAmount
                                    )}
                                </Typography>
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </Box>
        );
    }
);

CouponApply.displayName = "CouponApply";

export default CouponApply;