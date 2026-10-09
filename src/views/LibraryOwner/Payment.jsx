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
    LocalOffer,
    Payment as PaymentIcon,
    Security,
} from "@mui/icons-material";

import {
    useMemo,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import CouponApply from "../LibraryOwner/components/CouponApply";

import paymentApi from "../../api/paymentApi";


// =============================================================
// RAZORPAY SCRIPT
// =============================================================

const RAZORPAY_SCRIPT_URL =
    "https://checkout.razorpay.com/v1/checkout.js";


/**
 * Dynamically loads Razorpay Checkout.
 *
 * The script is loaded only once.
 */
const loadRazorpayScript = () =>
    new Promise((resolve) => {

        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript =
            document.querySelector(
                `script[src="${RAZORPAY_SCRIPT_URL}"]`
            );

        if (existingScript) {

            existingScript.addEventListener(
                "load",
                () => resolve(true)
            );

            existingScript.addEventListener(
                "error",
                () => resolve(false)
            );

            return;
        }

        const script =
            document.createElement(
                "script"
            );

        script.src =
            RAZORPAY_SCRIPT_URL;

        script.async = true;

        script.onload = () =>
            resolve(true);

        script.onerror = () =>
            resolve(false);

        document.body.appendChild(
            script
        );
    });


// =============================================================
// HELPERS
// =============================================================

const getErrorMessage = (
    error,
    fallback =
        "Payment could not be completed. Please try again."
) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;


/**
 * Converts an ID into a valid positive number.
 *
 * Invalid mock IDs such as:
 *
 * PLAN-001
 * BOOK-1001
 *
 * return null and therefore cannot accidentally reach
 * the real payment backend.
 */
const normalizeId = (value) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const number =
        Number(value);

    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {
        return null;
    }

    return number;
};


// =============================================================
// PAYMENT PAGE
// =============================================================

function Payment() {

    const navigate =
        useNavigate();

    const location =
        useLocation();


    // =========================================================
    // NAVIGATION STATE
    // =========================================================

    const paymentState =
        location.state || {};


    /**
     * Supported:
     *
     * MEMBERSHIP
     * BOOKING
     */
    const paymentType =
        paymentState.paymentType ||
        "MEMBERSHIP";


    // =========================================================
    // DISPLAY DATA
    // =========================================================
    //
    // Fallback values remain only so the page layout does not
    // crash when opened directly during development.
    //
    // They are NOT allowed to create a real payment because
    // handlePayment validates all IDs before calling backend.
    // =========================================================

    const member =
        paymentState.member || {
            id: null,
            name: "Member",
            email: "",
            phone: "",
        };


    const membership =
        paymentState.membership || {
            id: null,
            libraryId: null,
            name: "Membership",
            billingCycle: "MONTHLY",
            price: 0,
        };


    const customPricing =
        paymentState.customPricing || {
            enabled: false,
            price: 0,
            effectiveFrom: null,
            effectiveUntil: null,
            reason: "",
        };


    const booking =
        paymentState.booking || null;


    // =========================================================
    // PAYMENT STATE
    // =========================================================

    const [
        paymentStatus,
        setPaymentStatus,
    ] = useState("IDLE");


    const [
        paymentError,
        setPaymentError,
    ] = useState("");


    /**
     * Backend-authoritative paid amount.
     *
     * The frontend calculated amount is only for display before
     * payment. Razorpay order amount returned by backend is the
     * authoritative amount.
     */
    const [
        paidAmount,
        setPaidAmount,
    ] = useState(null);


    const [
        paymentTransactionId,
        setPaymentTransactionId,
    ] = useState(null);


    // =========================================================
    // COUPON STATE
    // =========================================================

    const [
        couponDiscount,
        setCouponDiscount,
    ] = useState(0);


    const [
        appliedCoupon,
        setAppliedCoupon,
    ] = useState(null);


    // =========================================================
    // REGULAR AMOUNT
    // =========================================================

    const regularAmount =
        useMemo(() => {

            if (
                paymentType ===
                "BOOKING"
            ) {

                return Number(
                    booking?.amount || 0
                );
            }

            return Number(
                membership?.price || 0
            );

        }, [
            paymentType,
            booking,
            membership,
        ]);


    // =========================================================
    // CUSTOM MEMBER PRICING
    // =========================================================

    const isCustomPricingActive =
        useMemo(() => {

            if (
                paymentType !==
                "MEMBERSHIP"
            ) {
                return false;
            }

            if (
                !customPricing?.enabled
            ) {
                return false;
            }


            const today =
                new Date();


            const effectiveFrom =
                customPricing.effectiveFrom

                    ? new Date(
                        `${customPricing.effectiveFrom}T00:00:00`
                    )

                    : null;


            const effectiveUntil =
                customPricing.effectiveUntil

                    ? new Date(
                        `${customPricing.effectiveUntil}T23:59:59`
                    )

                    : null;


            if (
                effectiveFrom &&
                today < effectiveFrom
            ) {
                return false;
            }


            if (
                effectiveUntil &&
                today > effectiveUntil
            ) {
                return false;
            }


            return (
                Number(
                    customPricing.price
                ) >= 0
            );

        }, [
            paymentType,
            customPricing,
        ]);


    // =========================================================
    // EFFECTIVE MEMBER PRICE
    // =========================================================

    const effectiveAmount =
        useMemo(() => {

            if (
                paymentType ===
                    "MEMBERSHIP" &&
                isCustomPricingActive
            ) {

                return Number(
                    customPricing.price ||
                    0
                );
            }

            return regularAmount;

        }, [
            paymentType,
            isCustomPricingActive,
            customPricing,
            regularAmount,
        ]);


    // =========================================================
    // MEMBER PRICE DISCOUNT
    // =========================================================

    const memberPricingDiscount =
        useMemo(() => {

            if (
                paymentType !==
                    "MEMBERSHIP" ||
                !isCustomPricingActive
            ) {
                return 0;
            }

            return Math.max(
                regularAmount -
                effectiveAmount,
                0
            );

        }, [
            paymentType,
            isCustomPricingActive,
            regularAmount,
            effectiveAmount,
        ]);


    // =========================================================
    // COUPON
    // =========================================================

    const handleCouponApplied = (
        couponData
    ) => {

        setAppliedCoupon(
            couponData
        );

        setCouponDiscount(
            Number(
                couponData
                    ?.discountAmount ||
                0
            )
        );
    };


    const handleCouponRemoved =
        () => {

            setAppliedCoupon(
                null
            );

            setCouponDiscount(
                0
            );
        };


    // =========================================================
    // UI PAYABLE AMOUNT
    // =========================================================
    //
    // IMPORTANT:
    //
    // This amount is for frontend display only.
    //
    // RazorpayServiceImpl calculates the authoritative amount
    // again using:
    //
    // MembershipPlan
    // MemberPricing
    // Coupon
    // Booking
    //
    // =========================================================

    const finalAmount =
        useMemo(() => {

            return Math.max(
                effectiveAmount -
                couponDiscount,
                0
            );

        }, [
            effectiveAmount,
            couponDiscount,
        ]);


    // =========================================================
    // BACK
    // =========================================================

    const handleBack = () => {

        if (paymentState.from) {

            navigate(
                paymentState.from
            );

            return;
        }

        navigate(-1);
    };


    // =========================================================
    // REAL RAZORPAY PAYMENT
    // =========================================================

    const handlePayment =
        async () => {

            // -------------------------------------------------
            // Basic amount validation
            // -------------------------------------------------

            if (finalAmount <= 0) {

                setPaymentError(
                    "Invalid payment amount."
                );

                return;
            }


            setPaymentError("");

            setPaymentStatus(
                "PROCESSING"
            );


            try {

                // =============================================
                // RESOLVE LIBRARY ID
                // =============================================

                const libraryId =
                    normalizeId(

                        paymentState
                            ?.libraryId ??

                        paymentState
                            ?.library
                            ?.id ??

                        booking
                            ?.libraryId ??

                        membership
                            ?.libraryId
                    );


                if (!libraryId) {

                    throw new Error(
                        "Library information is missing. Please return and select the library again."
                    );
                }


                // =============================================
                // RESOLVE BUSINESS REFERENCE
                // =============================================

                const referenceId =
                    normalizeId(

                        paymentType ===
                            "BOOKING"

                            ? (
                                booking?.id ??
                                booking?.bookingId ??
                                paymentState
                                    ?.bookingId
                            )

                            : (
                                membership?.id ??
                                membership
                                    ?.membershipPlanId ??
                                paymentState
                                    ?.membershipId ??
                                paymentState
                                    ?.membershipPlanId
                            )
                    );


                if (!referenceId) {

                    throw new Error(

                        paymentType ===
                            "BOOKING"

                            ? "Booking information is missing. Please create the booking again."

                            : "Membership plan information is missing. Please select the membership plan again."
                    );
                }


                // =============================================
                // MEMBERSHIP SEAT
                // =============================================

                const seatId =
                    normalizeId(

                        paymentState
                            ?.seatId ??

                        paymentState
                            ?.selectedSeat
                            ?.id ??

                        paymentState
                            ?.selectedSeat
                            ?.seatId ??

                        membership
                            ?.seatId ??

                        booking
                            ?.seatId
                    );


                if (
                    paymentType ===
                        "MEMBERSHIP" &&
                    !seatId
                ) {

                    throw new Error(
                        "Selected seat information is missing. Please select a seat before payment."
                    );
                }


                // =============================================
                // COUPON ID
                // =============================================

                const couponId =
                    normalizeId(

                        appliedCoupon
                            ?.couponId ??

                        appliedCoupon
                            ?.id
                    );


                // =============================================
                // LOAD RAZORPAY SCRIPT
                // =============================================

                const razorpayLoaded =
                    await loadRazorpayScript();


                if (!razorpayLoaded) {

                    throw new Error(
                        "Unable to load Razorpay Checkout. Please check your internet connection and try again."
                    );
                }


                // =============================================
                // CREATE BACKEND PAYMENT ORDER
                // =============================================

                const createPayload = {

                    referenceId,

                    referenceType:
                        paymentType ===
                            "BOOKING"

                            ? "BOOKING"

                            : "MEMBERSHIP",

                    libraryId,

                    seatId:
                        paymentType ===
                            "MEMBERSHIP"

                            ? seatId

                            : null,

                    couponId:
                        couponId ||
                        null,

                    /**
                     * The backend does not trust this as the
                     * authoritative amount.
                     */
                    amount:
                        Number(
                            finalAmount
                        ),

                    currency:
                        "INR",

                    description:
                        paymentType ===
                            "BOOKING"

                            ? (
                                booking?.seat

                                    ? `Seat booking payment - ${booking.seat}`

                                    : "Seat booking payment"
                            )

                            : (
                                membership?.name

                                    ? `Membership payment - ${membership.name}`

                                    : "Membership payment"
                            ),
                };


                const order =
                    await paymentApi
                        .createPayment(
                            createPayload
                        );


                // =============================================
                // VALIDATE BACKEND RESPONSE
                // =============================================

                if (
                    !order
                        ?.transactionId
                ) {

                    throw new Error(
                        "Payment transaction could not be created."
                    );
                }


                if (
                    !order
                        ?.gatewayOrderId
                ) {

                    throw new Error(
                        "Razorpay order could not be created."
                    );
                }


                if (!order?.keyId) {

                    throw new Error(
                        "Razorpay checkout key is missing."
                    );
                }


                if (
                    order?.gatewayName &&
                    order.gatewayName !==
                        "RAZORPAY"
                ) {

                    throw new Error(
                        `Unsupported payment gateway: ${order.gatewayName}`
                    );
                }


                const backendAmount =
                    Number(
                        order.amount
                    );


                if (
                    !Number.isFinite(
                        backendAmount
                    ) ||
                    backendAmount <= 0
                ) {

                    throw new Error(
                        "Backend returned an invalid payment amount."
                    );
                }


                setPaymentTransactionId(
                    order.transactionId
                );


                // =============================================
                // RAZORPAY CHECKOUT OPTIONS
                // =============================================

                const options = {

                    key:
                        order.keyId,


                    /**
                     * Razorpay Checkout uses paise.
                     *
                     * ₹100
                     * ↓
                     * 10000
                     */
                    amount:
                        Math.round(
                            backendAmount *
                            100
                        ),


                    currency:
                        order.currency ||
                        "INR",


                    name:
                        "LibraryHub",


                    description:
                        createPayload
                            .description,


                    order_id:
                        order
                            .gatewayOrderId,


                    // =========================================
                    // SUCCESS CALLBACK
                    // =========================================

                    handler:
                        async (
                            razorpayResponse
                        ) => {

                            try {

                                setPaymentStatus(
                                    "VERIFYING"
                                );


                                // ---------------------------------
                                // Razorpay response validation
                                // ---------------------------------

                                if (
                                    !razorpayResponse
                                        ?.razorpay_order_id ||
                                    !razorpayResponse
                                        ?.razorpay_payment_id ||
                                    !razorpayResponse
                                        ?.razorpay_signature
                                ) {

                                    throw new Error(
                                        "Incomplete payment response received from Razorpay."
                                    );
                                }


                                // ---------------------------------
                                // Backend verification
                                // ---------------------------------

                                const verification =
                                    await paymentApi
                                        .verifyPayment({
                                            transactionId:
                                                order.transactionId,

                                            gatewayOrderId:
                                                razorpayResponse
                                                    .razorpay_order_id,

                                            gatewayPaymentId:
                                                razorpayResponse
                                                    .razorpay_payment_id,

                                            gatewaySignature:
                                                razorpayResponse
                                                    .razorpay_signature,
                                        });


                                // ---------------------------------
                                // Verify final backend status
                                // ---------------------------------

                                if (
                                    verification
                                        ?.status !==
                                    "SUCCESS"
                                ) {

                                    throw new Error(
                                        verification
                                            ?.message ||
                                        "Payment verification failed."
                                    );
                                }


                                /**
                                 * IMPORTANT
                                 * =================================
                                 *
                                 * Do NOT consume coupon here.
                                 *
                                 * Backend:
                                 *
                                 * RazorpayServiceImpl
                                 *      ↓
                                 * markSuccess()
                                 *      ↓
                                 * PaymentCompletionProcessor
                                 *      ↓
                                 * booking confirmation
                                 * membership activation
                                 * coupon consumption
                                 *
                                 * Therefore frontend must not
                                 * duplicate that business logic.
                                 */


                                setPaidAmount(
                                    backendAmount
                                );


                                setPaymentTransactionId(
                                    verification
                                        ?.transactionId ??
                                    order
                                        .transactionId
                                );


                                setPaymentError(
                                    ""
                                );


                                setPaymentStatus(
                                    "SUCCESS"
                                );

                            } catch (
                                verificationError
                            ) {

                                console.error(
                                    "Payment verification failed:",
                                    verificationError
                                );


                                setPaymentStatus(
                                    "FAILED"
                                );


                                setPaymentError(
                                    getErrorMessage(
                                        verificationError,
                                        "Payment may have been completed, but verification failed. Please do not pay again immediately."
                                    )
                                );
                            }
                        },


                    // =========================================
                    // PREFILL
                    // =========================================

                    prefill: {
                        name:
                            member
                                ?.name ||
                            "",

                        email:
                            member
                                ?.email ||
                            "",

                        contact:
                            member
                                ?.phone ||
                            "",
                    },


                    // =========================================
                    // NOTES
                    // =========================================

                    notes: {
                        transactionId:
                            String(
                                order
                                    .transactionId
                            ),

                        referenceType:
                            createPayload
                                .referenceType,

                        referenceId:
                            String(
                                referenceId
                            ),

                        libraryId:
                            String(
                                libraryId
                            ),
                    },


                    // =========================================
                    // CHECKOUT MODAL
                    // =========================================

                    modal: {

                        ondismiss:
                            () => {

                                setPaymentStatus(
                                    "IDLE"
                                );

                                setPaymentError(
                                    "Payment was cancelled."
                                );
                            },
                    },


                    retry: {
                        enabled: true,
                    },
                };


                // =============================================
                // OPEN RAZORPAY
                // =============================================

                const razorpay =
                    new window.Razorpay(
                        options
                    );


                // =============================================
                // PAYMENT FAILURE EVENT
                // =============================================

                razorpay.on(
                    "payment.failed",
                    (response) => {

                        console.error(
                            "Razorpay payment failed:",
                            response?.error
                        );


                        setPaymentStatus(
                            "FAILED"
                        );


                        setPaymentError(
                            response
                                ?.error
                                ?.description ||

                            response
                                ?.error
                                ?.reason ||

                            "Payment failed. Please try again."
                        );
                    }
                );


                razorpay.open();

            } catch (error) {

                console.error(
                    "Payment failed:",
                    error
                );


                setPaymentStatus(
                    "FAILED"
                );


                setPaymentError(
                    getErrorMessage(
                        error
                    )
                );
            }
        };


    // =========================================================
    // SUCCESS SCREEN
    // =========================================================

    if (
        paymentStatus ===
        "SUCCESS"
    ) {

        const successfulAmount =
            paidAmount ??
            finalAmount;


        return (

            <Box
                sx={{
                    maxWidth: 720,
                    mx: "auto",
                    py: {
                        xs: 3,
                        md: 6,
                    },
                }}
            >

                <Card
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #E2E8F0",

                        borderRadius: 3,

                        textAlign:
                            "center",

                        overflow:
                            "hidden",
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
                            color="success"
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
                                mb: 2,
                            }}
                        >

                            Your payment of{" "}

                            <strong>

                                ₹
                                {Number(
                                    successfulAmount
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits:
                                            2,

                                        maximumFractionDigits:
                                            2,
                                    }
                                )}

                            </strong>{" "}

                            has been successfully
                            processed.

                        </Typography>


                        {paymentTransactionId && (

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    mb: 4,
                                }}
                            >

                                Transaction ID:{" "}

                                <strong>
                                    {
                                        paymentTransactionId
                                    }
                                </strong>

                            </Typography>
                        )}


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

                                <strong>
                                    {
                                        membership.name
                                    }
                                </strong>{" "}

                                membership payment
                                has been completed
                                successfully.

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

                                Your seat booking
                                has been confirmed
                                successfully.

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
                                    navigate("/")
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


    // =========================================================
    // MAIN PAYMENT SCREEN
    // =========================================================

    return (

        <Box
            sx={{
                maxWidth: 1180,
                mx: "auto",
            }}
        >

            {/* =================================================
                PAGE HEADER
            ================================================= */}

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
                        startIcon={
                            <ArrowBack />
                        }

                        onClick={
                            handleBack
                        }

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
                    icon={
                        <Security />
                    }

                    label="Secure Payment"

                    variant="outlined"
                />

            </Stack>


            {/* =================================================
                PAYMENT ERROR
            ================================================= */}

            {paymentError && (

                <Alert
                    severity={
                        paymentStatus ===
                        "FAILED"

                            ? "error"

                            : "warning"
                    }

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

                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <Grid
                    size={{
                        xs: 12,
                        md: 7,
                    }}
                >

                    <Stack
                        spacing={3}
                    >

                        {/* =========================================
                            MEMBERSHIP / BOOKING DETAILS
                        ========================================= */}

                        <Card
                            elevation={0}

                            sx={{
                                border:
                                    "1px solid #E2E8F0",

                                borderRadius:
                                    3,
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

                                    fontWeight={
                                        700
                                    }

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

                                    <Stack
                                        spacing={2}
                                    >

                                        <DetailRow
                                            label="Member"

                                            value={
                                                member.name ||
                                                "-"
                                            }
                                        />


                                        <DetailRow
                                            label="Membership"

                                            value={
                                                membership.name ||
                                                "-"
                                            }
                                        />


                                        <DetailRow
                                            label="Billing Cycle"

                                            value={
                                                formatBillingCycle(
                                                    membership.billingCycle
                                                )
                                            }
                                        />


                                        <DetailRow
                                            label="Regular Price"

                                            value={`₹${regularAmount.toLocaleString(
                                                "en-IN"
                                            )}`}
                                        />

                                    </Stack>

                                ) : (

                                    <Stack
                                        spacing={2}
                                    >

                                        <DetailRow
                                            label="Library"

                                            value={
                                                booking
                                                    ?.libraryName ||
                                                "Library"
                                            }
                                        />


                                        <DetailRow
                                            label="Date"

                                            value={
                                                booking
                                                    ?.date ||
                                                booking
                                                    ?.startDate ||
                                                "-"
                                            }
                                        />


                                        <DetailRow
                                            label="Slot"

                                            value={
                                                booking
                                                    ?.slot ||
                                                booking
                                                    ?.slotName ||
                                                "-"
                                            }
                                        />


                                        <DetailRow
                                            label="Seat"

                                            value={
                                                booking
                                                    ?.seat ||
                                                booking
                                                    ?.seatNumber ||
                                                "-"
                                            }
                                        />

                                    </Stack>
                                )}

                            </CardContent>

                        </Card>


                        {/* =========================================
                            MEMBER-SPECIFIC PRICING
                        ========================================= */}

                        {paymentType ===
                            "MEMBERSHIP" &&
                            isCustomPricingActive && (

                            <Card
                                elevation={0}

                                sx={{
                                    border:
                                        "1px solid #E2E8F0",

                                    borderRadius:
                                        3,
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

                                        <CheckCircle
                                            color="success"
                                        />


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

                                        A special price
                                        has been assigned
                                        to your membership.

                                    </Alert>


                                    <Stack
                                        spacing={1.5}
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


                                        {customPricing
                                            .effectiveUntil && (

                                            <DetailRow
                                                label="Valid Until"

                                                value={
                                                    formatDate(
                                                        customPricing
                                                            .effectiveUntil
                                                    )
                                                }
                                            />
                                        )}

                                    </Stack>


                                    {customPricing
                                        .reason && (

                                        <Typography
                                            variant="body2"

                                            color="text.secondary"

                                            sx={{
                                                mt: 2,
                                            }}
                                        >

                                            {
                                                customPricing
                                                    .reason
                                            }

                                        </Typography>
                                    )}

                                </CardContent>

                            </Card>
                        )}


                        {/* =========================================
                            COUPON
                        ========================================= */}

                        <Card
                            elevation={0}

                            sx={{
                                border:
                                    "1px solid #E2E8F0",

                                borderRadius:
                                    3,
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

                                        fontWeight={
                                            700
                                        }
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
                                    additional discount.

                                </Typography>


                                <CouponApply
                                    amount={
                                        effectiveAmount
                                    }

                                    onCouponApplied={
                                        handleCouponApplied
                                    }

                                    onCouponRemoved={
                                        handleCouponRemoved
                                    }
                                />

                            </CardContent>

                        </Card>


                        {/* =========================================
                            SECURITY
                        ========================================= */}

                        <Paper
                            elevation={0}

                            sx={{
                                p: 2,

                                border:
                                    "1px solid #E2E8F0",

                                borderRadius:
                                    2,

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

                                        fontWeight={
                                            600
                                        }
                                    >

                                        Secure payment

                                    </Typography>


                                    <Typography
                                        variant="caption"

                                        color="text.secondary"
                                    >

                                        Your payment
                                        information is
                                        securely processed
                                        by Razorpay.

                                    </Typography>

                                </Box>

                            </Stack>

                        </Paper>

                    </Stack>

                </Grid>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

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

                            borderRadius:
                                3,

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

                                fontWeight={
                                    700
                                }

                                sx={{
                                    mb: 3,
                                }}
                            >

                                Payment Summary

                            </Typography>


                            <Stack
                                spacing={2}
                            >

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
                                        "PROCESSING" ||
                                    paymentStatus ===
                                        "VERIFYING"

                                        ? (
                                            <CircularProgress
                                                size={20}
                                                color="inherit"
                                            />
                                        )

                                        : (
                                            <PaymentIcon />
                                        )
                                }

                                disabled={
                                    paymentStatus ===
                                        "PROCESSING" ||
                                    paymentStatus ===
                                        "VERIFYING"
                                }

                                onClick={
                                    handlePayment
                                }

                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    fontWeight:
                                        700,
                                }}
                            >

                                {paymentStatus ===
                                    "PROCESSING"

                                    ? "Opening Payment..."

                                    : paymentStatus ===
                                        "VERIFYING"

                                        ? "Verifying Payment..."

                                        : `Pay ₹${finalAmount.toLocaleString(
                                            "en-IN"
                                        )}`}

                            </Button>


                            <Typography
                                variant="caption"

                                color="text.secondary"

                                sx={{
                                    display:
                                        "block",

                                    textAlign:
                                        "center",

                                    mt: 2,
                                }}
                            >

                                Payment will be
                                securely processed
                                through Razorpay.

                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );
}


// =============================================================
// DETAIL ROW
// =============================================================

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

                fontWeight={
                    highlight
                        ? 700
                        : 600
                }

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


// =============================================================
// SUMMARY ROW
// =============================================================

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
                variant={
                    total
                        ? "body1"
                        : "body2"
                }

                fontWeight={
                    total
                        ? 700
                        : 500
                }

                color={
                    total
                        ? "text.primary"
                        : "text.secondary"
                }
            >

                {label}

            </Typography>


            <Typography
                variant={
                    total
                        ? "h6"
                        : "body2"
                }

                fontWeight={700}

                color={
                    success
                        ? "success.main"
                        : "text.primary"
                }
            >

                {value}

            </Typography>

        </Stack>
    );
}


// =============================================================
// BILLING CYCLE
// =============================================================

function formatBillingCycle(
    billingCycle
) {

    if (!billingCycle) {
        return "-";
    }


    switch (
        billingCycle
    ) {

        case "MONTHLY":
            return "Monthly";

        case "QUARTERLY":
            return "Quarterly";

        case "HALF_YEARLY":
            return "Half Yearly";

        case "YEARLY":
        case "ANNUAL":
            return "Yearly";

        case "DAILY":
            return "Daily";

        default:

            return String(
                billingCycle
            )
                .replaceAll(
                    "_",
                    " "
                )
                .toLowerCase()
                .replace(
                    /\b\w/g,
                    (character) =>
                        character
                            .toUpperCase()
                );
    }
}


// =============================================================
// DATE FORMATTER
// =============================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parsedDate =
        new Date(
            `${date}T00:00:00`
        );


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return date;
    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {
                day:
                    "2-digit",

                month:
                    "short",

                year:
                    "numeric",
            }
        );
}


export default Payment;