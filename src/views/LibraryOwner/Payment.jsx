import {
    Alert,
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
} from "@mui/material";
import {
    ArrowBack,
    CheckCircle,
    CreditCard,
    LocalOffer,
    Payment as PaymentIcon,
    Security,
} from "@mui/icons-material";
import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CouponApply from "../LibraryOwner/components/CouponApply";

/**
 * Student Payment Page
 *
 * Current implementation:
 * - Supports normal membership pricing
 * - Supports member-specific/custom pricing
 * - Supports coupon application
 * - Calculates final payable amount
 * - Uses mock payment processing until Razorpay is integrated
 *
 * Future Razorpay flow:
 *
 * create order
 *      ↓
 * Razorpay Checkout
 *      ↓
 * payment response
 *      ↓
 * backend verification
 *      ↓
 * payment success
 *      ↓
 * consume coupon
 *      ↓
 * membership / booking confirmation
 */

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Expected navigation state:
     *
     * {
     *     paymentType: "MEMBERSHIP" | "BOOKING",
     *
     *     member: {
     *         id: "M001",
     *         name: "Ramesh Kumar"
     *     },
     *
     *     membership: {
     *         id: "PLAN-001",
     *         name: "Standard Membership",
     *         billingCycle: "MONTHLY",
     *         price: 699
     *     },
     *
     *     customPricing: {
     *         enabled: true,
     *         price: 500,
     *         effectiveFrom: "2026-10-01",
     *         effectiveUntil: "2026-12-31",
     *         reason: "Special member pricing"
     *     },
     *
     *     booking: {
     *         id: "BOOK-1001",
     *         libraryName: "GNC Central Library",
     *         date: "2026-10-01",
     *         slot: "Morning",
     *         seat: "A12",
     *         amount: 80
     *     }
     * }
     *
     * The page also contains fallback mock data so it can
     * be opened directly while frontend development is in progress.
     */

    const paymentState = location.state || {};

    const paymentType = paymentState.paymentType || "MEMBERSHIP";

    const member = paymentState.member || {
        id: "M001",
        name: "Ramesh Kumar",
    };

    const membership = paymentState.membership || {
        id: "PLAN-002",
        name: "Standard Membership",
        billingCycle: "MONTHLY",
        price: 699,
    };

    const customPricing = paymentState.customPricing || {
        enabled: true,
        price: 500,
        effectiveFrom: "2026-10-01",
        effectiveUntil: "2026-12-31",
        reason: "Special member pricing",
    };

    const booking = paymentState.booking || null;

    /**
     * CouponApply exposes consumeCoupon() through ref.
     *
     * Coupon is NOT consumed when it is applied.
     * It is consumed only after payment succeeds.
     */
    const couponRef = useRef(null);

    const [paymentStatus, setPaymentStatus] = useState("IDLE");
    const [paymentError, setPaymentError] = useState("");

    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    /**
     * Determine the original amount.
     *
     * Membership:
     *     membership.price
     *
     * Booking:
     *     booking.amount
     */
    const regularAmount = useMemo(() => {
        if (paymentType === "BOOKING") {
            return Number(booking?.amount || 0);
        }

        return Number(membership?.price || 0);
    }, [paymentType, booking, membership]);

    /**
     * Determine whether custom pricing is currently active.
     *
     * For production this calculation should ultimately come
     * from the backend. This frontend check is only for the
     * current UI/mock implementation.
     */
    const isCustomPricingActive = useMemo(() => {
        if (paymentType !== "MEMBERSHIP") {
            return false;
        }

        if (!customPricing?.enabled) {
            return false;
        }

        const today = new Date();

        const effectiveFrom = customPricing.effectiveFrom
            ? new Date(`${customPricing.effectiveFrom}T00:00:00`)
            : null;

        const effectiveUntil = customPricing.effectiveUntil
            ? new Date(`${customPricing.effectiveUntil}T23:59:59`)
            : null;

        if (effectiveFrom && today < effectiveFrom) {
            return false;
        }

        if (effectiveUntil && today > effectiveUntil) {
            return false;
        }

        return Number(customPricing.price) >= 0;
    }, [paymentType, customPricing]);

    /**
     * Effective membership price.
     *
     * Example:
     *
     * Plan price     = ₹699
     * Custom price   = ₹500
     *
     * Effective price = ₹500
     */
    const effectiveAmount = useMemo(() => {
        if (
            paymentType === "MEMBERSHIP" &&
            isCustomPricingActive
        ) {
            return Number(customPricing.price || 0);
        }

        return regularAmount;
    }, [
        paymentType,
        isCustomPricingActive,
        customPricing,
        regularAmount,
    ]);

    /**
     * Difference between regular plan price and custom price.
     */
    const memberPricingDiscount = useMemo(() => {
        if (
            paymentType !== "MEMBERSHIP" ||
            !isCustomPricingActive
        ) {
            return 0;
        }

        return Math.max(
            regularAmount - effectiveAmount,
            0
        );
    }, [
        paymentType,
        isCustomPricingActive,
        regularAmount,
        effectiveAmount,
    ]);

    /**
     * Coupon callback.
     */
    const handleCouponApplied = (couponData) => {
        setAppliedCoupon(couponData);

        setCouponDiscount(
            Number(couponData?.discountAmount || 0)
        );
    };

    /**
     * Coupon removal callback.
     */
    const handleCouponRemoved = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
    };

    /**
     * Calculate final payable amount.
     */
    const finalAmount = useMemo(() => {
        return Math.max(
            effectiveAmount - couponDiscount,
            0
        );
    }, [effectiveAmount, couponDiscount]);

    /**
     * Coupon callback after successful payment.
     */
    const handleCouponConsumed = (consumedCoupon) => {
        console.log(
            "Coupon successfully consumed:",
            consumedCoupon
        );
    };

    /**
     * Back navigation.
     */
    const handleBack = () => {
        if (paymentState.from) {
            navigate(paymentState.from);
            return;
        }

        navigate(-1);
    };

    /**
     * This is currently MOCK payment processing.
     *
     * Replace the inside of this function with:
     *
     * 1. Create backend payment order
     * 2. Open Razorpay
     * 3. Receive Razorpay response
     * 4. Send response to backend
     * 5. Verify payment
     * 6. After backend confirms SUCCESS,
     *    consume the coupon.
     */
    const handlePayment = async () => {
        if (finalAmount <= 0) {
            setPaymentError(
                "Invalid payment amount."
            );
            return;
        }

        setPaymentError("");
        setPaymentStatus("PROCESSING");

        try {
            /**
             * --------------------------------------------------
             * FUTURE RAZORPAY INTEGRATION
             * --------------------------------------------------
             *
             * const order = await paymentApi.createOrder({
             *     amount: finalAmount,
             *     bookingId: booking?.id,
             *     membershipId: membership?.id,
             * });
             *
             * const razorpayResponse =
             *     await openRazorpayCheckout(order);
             *
             * const verification =
             *     await paymentApi.verifyPayment({
             *         orderId: razorpayResponse.razorpay_order_id,
             *         paymentId: razorpayResponse.razorpay_payment_id,
             *         signature: razorpayResponse.razorpay_signature,
             *     });
             *
             * if (!verification.success) {
             *     throw new Error(
             *         "Payment verification failed."
             *     );
             * }
             */

            /**
             * Temporary mock delay.
             */
            await new Promise((resolve) =>
                setTimeout(resolve, 1200)
            );

            /**
             * IMPORTANT:
             *
             * Coupon is consumed ONLY AFTER payment success.
             */
            if (
                appliedCoupon &&
                couponRef.current?.hasAppliedCoupon()
            ) {
                await couponRef.current.consumeCoupon({
                    usedBy: member.id,
                    bookingId:
                        booking?.id ||
                        paymentState.bookingId ||
                        null,
                    paymentId: `MOCK-PAY-${Date.now()}`,
                });
            }

            setPaymentStatus("SUCCESS");

            /**
             * Future:
             *
             * Navigate to payment success page:
             *
             * navigate(
             *     `/payment/success/${paymentId}`,
             *     {
             *         state: {
             *             payment,
             *             booking,
             *             membership,
             *         },
             *     }
             * );
             */
        } catch (error) {
            console.error(
                "Payment failed:",
                error
            );

            /**
             * IMPORTANT:
             *
             * Coupon is NOT consumed here.
             *
             * Therefore:
             *
             * PAYMENT FAILED
             *       ↓
             * Coupon remains ACTIVE
             */
            setPaymentStatus("FAILED");

            setPaymentError(
                error?.message ||
                    "Payment could not be completed. Please try again."
            );
        }
    };

    /**
     * Payment success screen.
     */
    if (paymentStatus === "SUCCESS") {
        return (
            <Box
                sx={{
                    maxWidth: 720,
                    mx: "auto",
                    py: { xs: 3, md: 6 },
                }}
            >
                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #E2E8F0",
                        borderRadius: 3,
                        textAlign: "center",
                        overflow: "hidden",
                    }}
                >
                    <CardContent
                        sx={{
                            px: {
                                xs: 3,
                                md: 6,
                            },
                            py: {
                                xs: 5,
                                md: 7,
                            },
                        }}
                    >
                        <CheckCircle
                            sx={{
                                fontSize: 72,
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
                            color="text.secondary"
                            sx={{
                                mb: 4,
                            }}
                        >
                            Your payment of{" "}
                            <strong>
                                ₹
                                {finalAmount.toLocaleString(
                                    "en-IN"
                                )}
                            </strong>{" "}
                            has been successfully
                            processed.
                        </Typography>

                        {paymentType ===
                            "MEMBERSHIP" && (
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    textAlign:
                                        "left",
                                }}
                            >
                                Your{" "}
                                {
                                    membership.name
                                }{" "}
                                membership has
                                been renewed.
                            </Alert>
                        )}

                        {paymentType ===
                            "BOOKING" &&
                            booking && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        mb: 3,
                                        textAlign:
                                            "left",
                                    }}
                                >
                                    Your seat
                                    booking has
                                    been confirmed.
                                </Alert>
                            )}

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            justifyContent="center"
                        >
                            <Button
                                variant="contained"
                                onClick={() =>
                                    navigate(
                                        "/dashboard"
                                    )
                                }
                            >
                                Go to Dashboard
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() =>
                                    navigate(
                                        "/"
                                    )
                                }
                            >
                                Back to Home
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
                maxWidth: 1180,
                mx: "auto",
            }}
        >
            {/* Page header */}

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{
                    xs: "flex-start",
                    sm: "center",
                }}
                sx={{
                    mb: 3,
                }}
            >
                <Box>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{
                            mb: 1,
                            px: 0,
                        }}
                    >
                        Back
                    </Button>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Payment
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
                    >
                        Complete your payment
                        securely.
                    </Typography>
                </Box>

                <Chip
                    icon={<Security />}
                    label="Secure Payment"
                    variant="outlined"
                />
            </Stack>

            {paymentStatus === "FAILED" &&
                paymentError && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                        }}
                    >
                        {paymentError}
                    </Alert>
                )}

            <Grid
                container
                spacing={3}
            >
                {/* LEFT SIDE */}

                <Grid
                    size={{
                        xs: 12,
                        md: 7,
                    }}
                >
                    <Stack spacing={3}>
                        {/* Membership / Booking information */}

                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid #E2E8F0",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2.5,
                                        md: 3,
                                    },
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                        mb: 2.5,
                                    }}
                                >
                                    {paymentType ===
                                    "BOOKING"
                                        ? "Booking Details"
                                        : "Membership Details"}
                                </Typography>

                                {paymentType ===
                                "MEMBERSHIP" ? (
                                    <Stack spacing={2}>
                                        <DetailRow
                                            label="Member"
                                            value={
                                                member.name
                                            }
                                        />

                                        <DetailRow
                                            label="Membership"
                                            value={
                                                membership.name
                                            }
                                        />

                                        <DetailRow
                                            label="Billing Cycle"
                                            value={formatBillingCycle(
                                                membership.billingCycle
                                            )}
                                        />

                                        <DetailRow
                                            label="Regular Price"
                                            value={`₹${regularAmount.toLocaleString(
                                                "en-IN"
                                            )}`}
                                        />
                                    </Stack>
                                ) : (
                                    <Stack spacing={2}>
                                        <DetailRow
                                            label="Library"
                                            value={
                                                booking?.libraryName ||
                                                "Library"
                                            }
                                        />

                                        <DetailRow
                                            label="Date"
                                            value={
                                                booking?.date ||
                                                "-"
                                            }
                                        />

                                        <DetailRow
                                            label="Slot"
                                            value={
                                                booking?.slot ||
                                                "-"
                                            }
                                        />

                                        <DetailRow
                                            label="Seat"
                                            value={
                                                booking?.seat ||
                                                "-"
                                            }
                                        />
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>

                        {/* Member-specific pricing */}

                        {paymentType ===
                            "MEMBERSHIP" &&
                            isCustomPricingActive && (
                                <Card
                                    elevation={0}
                                    sx={{
                                        border:
                                            "1px solid #E2E8F0",
                                        borderRadius: 3,
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            p: {
                                                xs: 2.5,
                                                md: 3,
                                            },
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{
                                                mb: 2,
                                            }}
                                        >
                                            <CheckCircle />

                                            <Typography
                                                variant="h6"
                                                fontWeight={
                                                    700
                                                }
                                            >
                                                Special Member Pricing
                                            </Typography>
                                        </Stack>

                                        <Alert
                                            severity="success"
                                            sx={{
                                                mb: 2,
                                            }}
                                        >
                                            A special
                                            price has
                                            been assigned
                                            to your
                                            membership.
                                        </Alert>

                                        <Stack
                                            spacing={
                                                1.5
                                            }
                                        >
                                            <DetailRow
                                                label="Regular Price"
                                                value={`₹${regularAmount.toLocaleString(
                                                    "en-IN"
                                                )}`}
                                            />

                                            <DetailRow
                                                label="Your Price"
                                                value={`₹${effectiveAmount.toLocaleString(
                                                    "en-IN"
                                                )}`}
                                                highlight
                                            />

                                            <DetailRow
                                                label="You Save"
                                                value={`₹${memberPricingDiscount.toLocaleString(
                                                    "en-IN"
                                                )}`}
                                            />

                                            {customPricing.effectiveUntil && (
                                                <DetailRow
                                                    label="Valid Until"
                                                    value={formatDate(
                                                        customPricing.effectiveUntil
                                                    )}
                                                />
                                            )}
                                        </Stack>

                                        {customPricing.reason && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 2,
                                                }}
                                            >
                                                {
                                                    customPricing.reason
                                                }
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                        {/* Coupon */}

                        <Card
                            elevation={0}
                            sx={{
                                border:
                                    "1px solid #E2E8F0",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: {
                                        xs: 2.5,
                                        md: 3,
                                    },
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{
                                        mb: 2,
                                    }}
                                >
                                    <LocalOffer />

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        Have a Coupon?
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                    }}
                                >
                                    Apply your coupon
                                    code to get an
                                    additional
                                    discount.
                                </Typography>

                                <CouponApply
                                    ref={couponRef}
                                    amount={
                                        effectiveAmount
                                    }
                                    onCouponApplied={
                                        handleCouponApplied
                                    }
                                    onCouponRemoved={
                                        handleCouponRemoved
                                    }
                                    onCouponConsumed={
                                        handleCouponConsumed
                                    }
                                />
                            </CardContent>
                        </Card>

                        {/* Security information */}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                border:
                                    "1px solid #E2E8F0",
                                borderRadius: 2,
                                backgroundColor:
                                    "#F8FAFC",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="flex-start"
                            >
                                <Security
                                    fontSize="small"
                                />

                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        Secure payment
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Your payment
                                        information is
                                        securely
                                        processed by
                                        the payment
                                        gateway.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>

                {/* RIGHT SIDE */}

                <Grid
                    size={{
                        xs: 12,
                        md: 5,
                    }}
                >
                    <Card
                        elevation={0}
                        sx={{
                            border:
                                "1px solid #E2E8F0",
                            borderRadius: 3,
                            position: {
                                md: "sticky",
                            },
                            top: {
                                md: 88,
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                p: {
                                    xs: 2.5,
                                    md: 3,
                                },
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{
                                    mb: 3,
                                }}
                            >
                                Payment Summary
                            </Typography>

                            <Stack spacing={2}>
                                <SummaryRow
                                    label={
                                        paymentType ===
                                        "MEMBERSHIP"
                                            ? "Regular Price"
                                            : "Booking Amount"
                                    }
                                    value={`₹${regularAmount.toLocaleString(
                                        "en-IN"
                                    )}`}
                                />

                                {memberPricingDiscount >
                                    0 && (
                                    <SummaryRow
                                        label="Member-specific pricing"
                                        value={`-₹${memberPricingDiscount.toLocaleString(
                                            "en-IN"
                                        )}`}
                                        success
                                    />
                                )}

                                {couponDiscount >
                                    0 && (
                                    <SummaryRow
                                        label={
                                            appliedCoupon
                                                ?.code
                                                ? `Coupon (${appliedCoupon.code})`
                                                : "Coupon Discount"
                                        }
                                        value={`-₹${couponDiscount.toLocaleString(
                                            "en-IN"
                                        )}`}
                                        success
                                    />
                                )}

                                <Divider />

                                <SummaryRow
                                    label="Amount Payable"
                                    value={`₹${finalAmount.toLocaleString(
                                        "en-IN"
                                    )}`}
                                    total
                                />
                            </Stack>

                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                startIcon={
                                    paymentStatus ===
                                    "PROCESSING" ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : (
                                        <PaymentIcon />
                                    )
                                }
                                disabled={
                                    paymentStatus ===
                                    "PROCESSING"
                                }
                                onClick={
                                    handlePayment
                                }
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    fontWeight: 700,
                                }}
                            >
                                {paymentStatus ===
                                "PROCESSING"
                                    ? "Processing Payment..."
                                    : `Pay ₹${finalAmount.toLocale(
                                          "en-IN"
                                      )}`}
                            </Button>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: "block",
                                    textAlign:
                                        "center",
                                    mt: 2,
                                }}
                            >
                                You will be securely
                                redirected to the
                                payment gateway.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

/**
 * Small reusable detail row.
 */
function DetailRow({
    label,
    value,
    highlight = false,
}) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            spacing={2}
        >
            <Typography
                variant="body2"
                color="text.secondary"
            >
                {label}
            </Typography>

            <Typography
                variant="body2"
                fontWeight={highlight ? 700 : 600}
                sx={
                    highlight
                        ? {
                              fontSize:
                                  "1rem",
                          }
                        : undefined
                }
            >
                {value}
            </Typography>
        </Stack>
    );
}

/**
 * Payment summary row.
 */
function SummaryRow({
    label,
    value,
    success = false,
    total = false,
}) {
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
        >
            <Typography
                variant={total ? "body1" : "body2"}
                fontWeight={total ? 700 : 500}
                color={
                    total
                        ? "text.primary"
                        : "text.secondary"
                }
            >
                {label}
            </Typography>

            <Typography
                variant={total ? "h6" : "body2"}
                fontWeight={700}
                sx={
                    success
                        ? {}
                        : undefined
                }
            >
                {value}
            </Typography>
        </Stack>
    );
}

function formatBillingCycle(
    billingCycle
) {
    if (!billingCycle) {
        return "-";
    }

    switch (billingCycle) {
        case "MONTHLY":
            return "Monthly";

        case "QUARTERLY":
            return "Quarterly";

        case "YEARLY":
            return "Yearly";

        case "DAILY":
            return "Daily";

        default:
            return billingCycle;
    }
}

function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(
        `${date}T00:00:00`
    );

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

export default Payment;