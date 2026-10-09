import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ReplayIcon from "@mui/icons-material/Replay";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import libraryApi from "../../api/libraryApi";
import refundApi from "../../api/refundApi";
import ownerPaymentApi from "../../api/ownerPaymentApi";


// =============================================================
// HELPERS
// =============================================================

const safeNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
};


const formatMoney = (value) =>
    `₹${safeNumber(value).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;


const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


const getErrorMessage = (
    error,
    fallback
) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;


// =============================================================
// STATUS CHIP
// =============================================================

function RefundStatusChip({
    status,
}) {

    const config = {
        PENDING: {
            label: "Pending",
            color: "warning",
        },

        PROCESSING: {
            label: "Processing",
            color: "warning",
        },

        SUCCESS: {
            label: "Successful",
            color: "success",
        },

        FAILED: {
            label: "Failed",
            color: "error",
        },

        CANCELLED: {
            label: "Cancelled",
            color: "default",
        },
    };


    const current =
        config[status] || {
            label:
                status || "-",

            color:
                "default",
        };


    return (
        <Chip
            size="small"
            variant="outlined"
            label={
                current.label
            }
            color={
                current.color
            }
        />
    );
}


// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
    title,
    value,
    icon,
}) {

    return (
        <Card
            elevation={0}
            sx={{
                border:
                    "1px solid #E2E8F0",

                borderRadius:
                    3,
            }}
        >
            <CardContent>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >

                    <Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{
                                mt: 0.5,
                            }}
                        >
                            {value}
                        </Typography>

                    </Box>

                    {icon}

                </Stack>

            </CardContent>
        </Card>
    );
}


// =============================================================
// MAIN PAGE
// =============================================================

function Refunds() {

    // =========================================================
    // LIBRARY
    // =========================================================

    const [
        libraries,
        setLibraries,
    ] = useState([]);


    const [
        selectedLibraryId,
        setSelectedLibraryId,
    ] = useState("");


    // =========================================================
    // REFUND DATA
    // =========================================================

    const [
        refunds,
        setRefunds,
    ] = useState([]);


    const [
        summary,
        setSummary,
    ] = useState(null);


    // =========================================================
    // PAYMENT DATA
    // =========================================================

    const [
        payments,
        setPayments,
    ] = useState([]);


    // =========================================================
    // PAGE STATE
    // =========================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState("");


    const [
        success,
        setSuccess,
    ] = useState("");


    // =========================================================
    // FILTERS
    // =========================================================

    const [
        search,
        setSearch,
    ] = useState("");


    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");


    const [
        typeFilter,
        setTypeFilter,
    ] = useState("ALL");


    // =========================================================
    // CREATE REFUND
    // =========================================================

    const [
        refundDialogOpen,
        setRefundDialogOpen,
    ] = useState(false);


    const [
        selectedPaymentId,
        setSelectedPaymentId,
    ] = useState("");


    const [
        refundAmount,
        setRefundAmount,
    ] = useState("");


    const [
        refundReason,
        setRefundReason,
    ] = useState("");


    const [
        refundSubmitting,
        setRefundSubmitting,
    ] = useState(false);


    const [
        refundFormError,
        setRefundFormError,
    ] = useState("");


    // =========================================================
    // DETAILS DIALOG
    // =========================================================

    const [
        detailsOpen,
        setDetailsOpen,
    ] = useState(false);


    const [
        selectedRefund,
        setSelectedRefund,
    ] = useState(null);


    const [
        detailsLoading,
        setDetailsLoading,
    ] = useState(false);


    // =========================================================
    // LOAD LIBRARIES
    // =========================================================

    useEffect(() => {

        const loadLibraries =
            async () => {

                try {

                    setLoading(true);
                    setError("");


                    const data =
                        await libraryApi
                            .getMyLibraries();


                    const list =
                        Array.isArray(data)
                            ? data
                            : [];


                    setLibraries(
                        list
                    );


                    if (
                        list.length > 0
                    ) {

                        setSelectedLibraryId(
                            String(
                                list[0].id
                            )
                        );
                    }

                } catch (err) {

                    console.error(
                        "Failed to load libraries:",
                        err
                    );


                    setError(
                        getErrorMessage(
                            err,
                            "Failed to load your libraries."
                        )
                    );

                } finally {

                    setLoading(false);
                }
            };


        loadLibraries();

    }, []);


    // =========================================================
    // LOAD REFUNDS + PAYMENTS
    // =========================================================

    const loadRefundData =
        async (libraryId) => {

            if (!libraryId) {
                return;
            }


            try {

                setLoading(true);
                setError("");


                const [
                    refundList,
                    refundSummary,
                    paymentList,
                ] =
                    await Promise.all([
                        refundApi
                            .getLibraryRefunds(
                                libraryId
                            ),

                        refundApi
                            .getRefundSummary(
                                libraryId
                            ),

                        ownerPaymentApi
                            .getLibraryPayments(
                                libraryId
                            ),
                    ]);


                setRefunds(
                    Array.isArray(
                        refundList
                    )
                        ? refundList
                        : []
                );


                setSummary(
                    refundSummary || null
                );


                setPayments(
                    Array.isArray(
                        paymentList
                    )
                        ? paymentList
                        : []
                );

            } catch (err) {

                console.error(
                    "Failed to load refund data:",
                    err
                );


                setError(
                    getErrorMessage(
                        err,
                        "Failed to load refunds."
                    )
                );

            } finally {

                setLoading(false);
            }
        };


    useEffect(() => {

        if (
            selectedLibraryId
        ) {

            loadRefundData(
                Number(
                    selectedLibraryId
                )
            );
        }

    }, [
        selectedLibraryId,
    ]);


    // =========================================================
    // SELECTED LIBRARY
    // =========================================================

    const selectedLibrary =
        useMemo(
            () =>
                libraries.find(
                    (library) =>
                        String(
                            library.id
                        ) ===
                        String(
                            selectedLibraryId
                        )
                ) || null,

            [
                libraries,
                selectedLibraryId,
            ]
        );


    // =========================================================
    // ELIGIBLE PAYMENTS
    // =========================================================

    const refundablePayments =
        useMemo(
            () =>
                payments.filter(
                    (payment) => {

                        const status =
                            payment.status;


                        if (
                            status !==
                                "SUCCESS" &&
                            status !==
                                "PARTIALLY_REFUNDED"
                        ) {
                            return false;
                        }


                        const amount =
                            safeNumber(
                                payment.amount
                            );


                        const refunded =
                            safeNumber(
                                payment
                                    .refundedAmount
                            );


                        const remaining =
                            amount -
                            refunded;


                        return (
                            remaining >
                            0
                        );
                    }
                ),

            [payments]
        );


    // =========================================================
    // SELECTED PAYMENT
    // =========================================================

    const selectedPayment =
        useMemo(
            () =>
                refundablePayments.find(
                    (payment) =>
                        String(
                            payment.paymentId
                        ) ===
                        String(
                            selectedPaymentId
                        )
                ) || null,

            [
                refundablePayments,
                selectedPaymentId,
            ]
        );


    const remainingRefundable =
        useMemo(
            () => {

                if (
                    !selectedPayment
                ) {
                    return 0;
                }


                return Math.max(
                    safeNumber(
                        selectedPayment
                            .amount
                    ) -
                    safeNumber(
                        selectedPayment
                            .refundedAmount
                    ),

                    0
                );
            },

            [selectedPayment]
        );


    // =========================================================
    // FILTER REFUNDS
    // =========================================================

    const filteredRefunds =
        useMemo(
            () => {

                const query =
                    search
                        .trim()
                        .toLowerCase();


                return refunds.filter(
                    (refund) => {

                        const matchesSearch =
                            !query ||

                            String(
                                refund.refundId ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            String(
                                refund
                                    .paymentTransactionId ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            String(
                                refund
                                    .customerName ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            String(
                                refund
                                    .customerEmail ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                ) ||

                            String(
                                refund
                                    .gatewayRefundId ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    query
                                );


                        const matchesStatus =
                            statusFilter ===
                                "ALL" ||
                            refund.status ===
                                statusFilter;


                        const matchesType =
                            typeFilter ===
                                "ALL" ||
                            refund
                                .referenceType ===
                                typeFilter;


                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesType
                        );
                    }
                );
            },

            [
                refunds,
                search,
                statusFilter,
                typeFilter,
            ]
        );


    // =========================================================
    // REFERENCE TYPES
    // =========================================================

    const referenceTypes =
        useMemo(
            () =>
                [
                    ...new Set(
                        refunds
                            .map(
                                (refund) =>
                                    refund.referenceType
                            )
                            .filter(
                                Boolean
                            )
                    ),
                ],

            [refunds]
        );


    // =========================================================
    // OPEN CREATE REFUND
    // =========================================================

    const handleOpenRefund =
        () => {

            setSelectedPaymentId(
                ""
            );

            setRefundAmount(
                ""
            );

            setRefundReason(
                ""
            );

            setRefundFormError(
                ""
            );

            setRefundDialogOpen(
                true
            );
        };


    // =========================================================
    // SELECT PAYMENT
    // =========================================================

    const handlePaymentSelection =
        (event) => {

            const paymentId =
                event.target.value;


            setSelectedPaymentId(
                paymentId
            );


            const payment =
                refundablePayments.find(
                    (item) =>
                        String(
                            item.paymentId
                        ) ===
                        String(
                            paymentId
                        )
                );


            if (payment) {

                const remaining =
                    Math.max(
                        safeNumber(
                            payment.amount
                        ) -
                        safeNumber(
                            payment
                                .refundedAmount
                        ),

                        0
                    );


                setRefundAmount(
                    String(
                        remaining
                    )
                );

            } else {

                setRefundAmount(
                    ""
                );
            }


            setRefundFormError(
                ""
            );
        };


    // =========================================================
    // CREATE REFUND
    // =========================================================

    const handleCreateRefund =
        async () => {

            if (
                !selectedPayment
            ) {

                setRefundFormError(
                    "Please select a payment."
                );

                return;
            }


            const amount =
                Number(
                    refundAmount
                );


            if (
                !Number.isFinite(
                    amount
                ) ||
                amount <= 0
            ) {

                setRefundFormError(
                    "Refund amount must be greater than zero."
                );

                return;
            }


            if (
                amount >
                remainingRefundable
            ) {

                setRefundFormError(
                    `Refund amount cannot exceed ${formatMoney(
                        remainingRefundable
                    )}.`
                );

                return;
            }


            if (
                !refundReason.trim()
            ) {

                setRefundFormError(
                    "Refund reason is required."
                );

                return;
            }


            try {

                setRefundSubmitting(
                    true
                );

                setRefundFormError(
                    ""
                );

                setError("");
                setSuccess("");


                await refundApi
                    .createRefund(
                        Number(
                            selectedLibraryId
                        ),
                        {
                            paymentTransactionId:
                                Number(
                                    selectedPayment
                                        .paymentId
                                ),

                            refundAmount:
                                amount,

                            reason:
                                refundReason
                                    .trim(),
                        }
                    );


                setRefundDialogOpen(
                    false
                );


                setSuccess(
                    "Refund processed successfully."
                );


                await loadRefundData(
                    Number(
                        selectedLibraryId
                    )
                );

            } catch (err) {

                console.error(
                    "Refund failed:",
                    err
                );


                setRefundFormError(
                    getErrorMessage(
                        err,
                        "Refund could not be processed."
                    )
                );

            } finally {

                setRefundSubmitting(
                    false
                );
            }
        };


    // =========================================================
    // VIEW DETAILS
    // =========================================================

    const handleViewRefund =
        async (refundId) => {

            try {

                setDetailsOpen(
                    true
                );

                setDetailsLoading(
                    true
                );

                setSelectedRefund(
                    null
                );


                const data =
                    await refundApi
                        .getRefundById(
                            Number(
                                selectedLibraryId
                            ),
                            refundId
                        );


                setSelectedRefund(
                    data
                );

            } catch (err) {

                console.error(
                    "Failed to load refund details:",
                    err
                );


                setError(
                    getErrorMessage(
                        err,
                        "Failed to load refund details."
                    )
                );


                setDetailsOpen(
                    false
                );

            } finally {

                setDetailsLoading(
                    false
                );
            }
        };


    // =========================================================
    // LOADING FIRST SCREEN
    // =========================================================

    if (
        loading &&
        libraries.length ===
            0
    ) {

        return (
            <Box
                sx={{
                    minHeight: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                        "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <Box>

            {/* =================================================
                HEADER
            ================================================= */}

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
                spacing={2}
                sx={{
                    mb: 3,
                }}
            >

                <Box>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        Refunds
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        View and manage payment refunds.
                    </Typography>

                </Box>


                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={2}
                    width={{
                        xs: "100%",
                        md: "auto",
                    }}
                >

                    <FormControl
                        size="small"
                        sx={{
                            minWidth: 240,
                        }}
                    >

                        <InputLabel>
                            Library
                        </InputLabel>

                        <Select
                            value={
                                selectedLibraryId
                            }
                            label="Library"
                            onChange={(
                                event
                            ) => {

                                setSelectedLibraryId(
                                    event
                                        .target
                                        .value
                                );

                                setSuccess(
                                    ""
                                );

                                setError(
                                    ""
                                );
                            }}
                        >

                            {libraries.map(
                                (
                                    library
                                ) => (

                                    <MenuItem
                                        key={
                                            library.id
                                        }
                                        value={
                                            String(
                                                library.id
                                            )
                                        }
                                    >
                                        {
                                            library.name
                                        }
                                    </MenuItem>
                                )
                            )}

                        </Select>

                    </FormControl>


                    <Button
                        variant="contained"
                        startIcon={
                            <ReplayIcon />
                        }
                        onClick={
                            handleOpenRefund
                        }
                        disabled={
                            refundablePayments
                                .length ===
                            0
                        }
                    >
                        Create Refund
                    </Button>

                </Stack>

            </Stack>


            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                    }}
                >
                    {error}
                </Alert>
            )}


            {success && (
                <Alert
                    severity="success"
                    sx={{
                        mb: 3,
                    }}
                >
                    {success}
                </Alert>
            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs:
                            "1fr",

                        sm:
                            "repeat(2, 1fr)",

                        lg:
                            "repeat(3, 1fr)",
                    },

                    gap: 2,

                    mb: 2,
                }}
            >

                <SummaryCard
                    title="Total Refunded"
                    value={
                        formatMoney(
                            summary
                                ?.totalRefundedAmount
                        )
                    }
                    icon={
                        <CurrencyRupeeIcon
                            color="primary"
                        />
                    }
                />


                <SummaryCard
                    title="Today Refunded"
                    value={
                        formatMoney(
                            summary
                                ?.todayRefundedAmount
                        )
                    }
                    icon={
                        <ReplayIcon
                            color="info"
                        />
                    }
                />


                <SummaryCard
                    title="Monthly Refunded"
                    value={
                        formatMoney(
                            summary
                                ?.monthlyRefundedAmount
                        )
                    }
                    icon={
                        <ReceiptLongIcon
                            color="secondary"
                        />
                    }
                />

            </Box>


            <Box
                sx={{
                    display: "grid",

                    gridTemplateColumns: {
                        xs:
                            "1fr",

                        sm:
                            "repeat(3, 1fr)",
                    },

                    gap: 2,

                    mb: 3,
                }}
            >

                <SummaryCard
                    title="Successful"
                    value={
                        summary
                            ?.successfulRefunds ??
                        0
                    }
                    icon={
                        <CheckCircleIcon
                            color="success"
                        />
                    }
                />


                <SummaryCard
                    title="Processing"
                    value={
                        summary
                            ?.processingRefunds ??
                        0
                    }
                    icon={
                        <PendingActionsIcon
                            color="warning"
                        />
                    }
                />


                <SummaryCard
                    title="Failed"
                    value={
                        summary
                            ?.failedRefunds ??
                        0
                    }
                    icon={
                        <CancelIcon
                            color="error"
                        />
                    }
                />

            </Box>


            {/* =================================================
                FILTERS
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid #E2E8F0",

                    borderRadius:
                        3,

                    mb: 3,
                }}
            >

                <CardContent>

                    <Stack
                        direction={{
                            xs: "column",
                            lg: "row",
                        }}
                        spacing={2}
                    >

                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search refund, member, payment or gateway refund..."
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            InputProps={{
                                startAdornment:
                                    (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                            }}
                        />


                        <FormControl
                            size="small"
                            sx={{
                                minWidth:
                                    180,
                            }}
                        >

                            <InputLabel>
                                Status
                            </InputLabel>

                            <Select
                                value={
                                    statusFilter
                                }
                                label="Status"
                                onChange={(
                                    event
                                ) =>
                                    setStatusFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >

                                <MenuItem value="ALL">
                                    All Status
                                </MenuItem>

                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>

                                <MenuItem value="PROCESSING">
                                    Processing
                                </MenuItem>

                                <MenuItem value="SUCCESS">
                                    Successful
                                </MenuItem>

                                <MenuItem value="FAILED">
                                    Failed
                                </MenuItem>

                                <MenuItem value="CANCELLED">
                                    Cancelled
                                </MenuItem>

                            </Select>

                        </FormControl>


                        <FormControl
                            size="small"
                            sx={{
                                minWidth:
                                    190,
                            }}
                        >

                            <InputLabel>
                                Reference Type
                            </InputLabel>

                            <Select
                                value={
                                    typeFilter
                                }
                                label="Reference Type"
                                onChange={(
                                    event
                                ) =>
                                    setTypeFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >

                                <MenuItem value="ALL">
                                    All Types
                                </MenuItem>

                                {referenceTypes.map(
                                    (
                                        type
                                    ) => (

                                    <MenuItem
                                        key={
                                            type
                                        }
                                        value={
                                            type
                                        }
                                    >
                                        {
                                            type
                                        }
                                    </MenuItem>
                                ))}

                            </Select>

                        </FormControl>

                    </Stack>

                </CardContent>

            </Card>


            {/* =================================================
                REFUND TABLE
            ================================================= */}

            <Card
                elevation={0}
                sx={{
                    border:
                        "1px solid #E2E8F0",

                    borderRadius:
                        3,
                }}
            >

                {loading ? (

                    <Box
                        sx={{
                            minHeight:
                                260,

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",
                        }}
                    >
                        <CircularProgress />
                    </Box>

                ) : filteredRefunds.length ===
                    0 ? (

                    <Box
                        sx={{
                            minHeight:
                                260,

                            display:
                                "flex",

                            flexDirection:
                                "column",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            textAlign:
                                "center",

                            px: 2,
                        }}
                    >

                        <ReplayIcon
                            sx={{
                                fontSize:
                                    46,

                                color:
                                    "text.disabled",

                                mb: 1.5,
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            No refunds found
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No refund transactions match the selected filters.
                        </Typography>

                    </Box>

                ) : (

                    <TableContainer>

                        <Table>

                            <TableHead>

                                <TableRow>

                                    <TableCell>
                                        Refund
                                    </TableCell>

                                    <TableCell>
                                        Member
                                    </TableCell>

                                    <TableCell>
                                        Type
                                    </TableCell>

                                    <TableCell align="right">
                                        Payment
                                    </TableCell>

                                    <TableCell align="right">
                                        Refund
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell>
                                        Processed
                                    </TableCell>

                                    <TableCell align="right">
                                        Action
                                    </TableCell>

                                </TableRow>

                            </TableHead>


                            <TableBody>

                                {filteredRefunds.map(
                                    (
                                        refund
                                    ) => (

                                    <TableRow
                                        key={
                                            refund.refundId
                                        }
                                        hover
                                    >

                                        <TableCell>

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                #
                                                {
                                                    refund.refundId
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Payment #
                                                {
                                                    refund.paymentTransactionId
                                                }
                                            </Typography>

                                        </TableCell>


                                        <TableCell>

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {
                                                    refund.customerName ||
                                                    "-"
                                                }
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    refund.customerEmail ||
                                                    "-"
                                                }
                                            </Typography>

                                        </TableCell>


                                        <TableCell>

                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                label={
                                                    refund.referenceType ||
                                                    "-"
                                                }
                                            />

                                        </TableCell>


                                        <TableCell align="right">

                                            {
                                                formatMoney(
                                                    refund.paymentAmount
                                                )
                                            }

                                        </TableCell>


                                        <TableCell align="right">

                                            <Typography
                                                fontWeight={700}
                                            >
                                                {
                                                    formatMoney(
                                                        refund.refundAmount
                                                    )
                                                }
                                            </Typography>

                                        </TableCell>


                                        <TableCell>

                                            <RefundStatusChip
                                                status={
                                                    refund.status
                                                }
                                            />

                                        </TableCell>


                                        <TableCell>

                                            {
                                                formatDateTime(
                                                    refund.processedAt ||
                                                    refund.createdAt
                                                )
                                            }

                                        </TableCell>


                                        <TableCell align="right">

                                            <Button
                                                size="small"
                                                startIcon={
                                                    <VisibilityIcon />
                                                }
                                                onClick={() =>
                                                    handleViewRefund(
                                                        refund.refundId
                                                    )
                                                }
                                            >
                                                View
                                            </Button>

                                        </TableCell>

                                    </TableRow>
                                ))}

                            </TableBody>

                        </Table>

                    </TableContainer>
                )}

            </Card>


            {/* =================================================
                CREATE REFUND DIALOG
            ================================================= */}

            <Dialog
                open={
                    refundDialogOpen
                }
                onClose={() => {

                    if (
                        !refundSubmitting
                    ) {
                        setRefundDialogOpen(
                            false
                        );
                    }
                }}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Create Refund
                </DialogTitle>


                <DialogContent>

                    <Stack
                        spacing={2.5}
                        sx={{
                            mt: 1,
                        }}
                    >

                        {refundFormError && (

                            <Alert severity="error">
                                {
                                    refundFormError
                                }
                            </Alert>
                        )}


                        <FormControl
                            fullWidth
                            size="small"
                        >

                            <InputLabel>
                                Payment
                            </InputLabel>

                            <Select
                                value={
                                    selectedPaymentId
                                }
                                label="Payment"
                                onChange={
                                    handlePaymentSelection
                                }
                            >

                                {refundablePayments.map(
                                    (
                                        payment
                                    ) => {

                                    const remaining =
                                        Math.max(
                                            safeNumber(
                                                payment.amount
                                            ) -
                                            safeNumber(
                                                payment.refundedAmount
                                            ),
                                            0
                                        );


                                    return (
                                        <MenuItem
                                            key={
                                                payment.paymentId
                                            }
                                            value={
                                                String(
                                                    payment.paymentId
                                                )
                                            }
                                        >
                                            #
                                            {
                                                payment.paymentId
                                            }
                                            {" - "}
                                            {
                                                payment.customerName ||
                                                "Member"
                                            }
                                            {" - "}
                                            {
                                                formatMoney(
                                                    remaining
                                                )
                                            }
                                            {" refundable"}
                                        </MenuItem>
                                    );
                                })}

                            </Select>

                        </FormControl>


                        {selectedPayment && (

                            <Card
                                elevation={0}
                                sx={{
                                    border:
                                        "1px solid #E2E8F0",

                                    bgcolor:
                                        "#F8FAFC",
                                }}
                            >

                                <CardContent>

                                    <Stack spacing={1}>

                                        <DetailRow
                                            label="Member"
                                            value={
                                                selectedPayment
                                                    .customerName ||
                                                "-"
                                            }
                                        />

                                        <DetailRow
                                            label="Original Amount"
                                            value={
                                                formatMoney(
                                                    selectedPayment
                                                        .amount
                                                )
                                            }
                                        />

                                        <DetailRow
                                            label="Already Refunded"
                                            value={
                                                formatMoney(
                                                    selectedPayment
                                                        .refundedAmount
                                                )
                                            }
                                        />

                                        <Divider />

                                        <DetailRow
                                            label="Remaining Refundable"
                                            value={
                                                formatMoney(
                                                    remainingRefundable
                                                )
                                            }
                                            strong
                                        />

                                    </Stack>

                                </CardContent>

                            </Card>
                        )}


                        <TextField
                            fullWidth
                            label="Refund Amount"
                            type="number"
                            value={
                                refundAmount
                            }
                            onChange={(
                                event
                            ) => {

                                setRefundAmount(
                                    event
                                        .target
                                        .value
                                );

                                setRefundFormError(
                                    ""
                                );
                            }}
                            slotProps={{
                                htmlInput: {
                                    min:
                                        0.01,

                                    step:
                                        0.01,

                                    max:
                                        remainingRefundable ||
                                        undefined,
                                },
                            }}
                        />


                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Refund Reason"
                            placeholder="Enter the reason for this refund..."
                            value={
                                refundReason
                            }
                            onChange={(
                                event
                            ) => {

                                setRefundReason(
                                    event
                                        .target
                                        .value
                                );

                                setRefundFormError(
                                    ""
                                );
                            }}
                        />

                    </Stack>

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setRefundDialogOpen(
                                false
                            )
                        }
                        disabled={
                            refundSubmitting
                        }
                    >
                        Cancel
                    </Button>


                    <Button
                        variant="contained"
                        startIcon={
                            refundSubmitting
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : (
                                    <ReplayIcon />
                                )
                        }
                        disabled={
                            refundSubmitting
                        }
                        onClick={
                            handleCreateRefund
                        }
                    >

                        {refundSubmitting
                            ? "Processing..."
                            : "Process Refund"}

                    </Button>

                </DialogActions>

            </Dialog>


            {/* =================================================
                DETAILS DIALOG
            ================================================= */}

            <Dialog
                open={
                    detailsOpen
                }
                onClose={() =>
                    setDetailsOpen(
                        false
                    )
                }
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Refund Details
                </DialogTitle>


                <DialogContent>

                    {detailsLoading ? (

                        <Box
                            sx={{
                                py: 6,
                                display:
                                    "flex",

                                justifyContent:
                                    "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>

                    ) : selectedRefund ? (

                        <Stack
                            spacing={1.5}
                            sx={{
                                mt: 1,
                            }}
                        >

                            <DetailRow
                                label="Refund ID"
                                value={`#${selectedRefund.refundId}`}
                            />

                            <DetailRow
                                label="Payment Transaction"
                                value={`#${selectedRefund.paymentTransactionId}`}
                            />

                            <DetailRow
                                label="Library"
                                value={
                                    selectedRefund.libraryName ||
                                    selectedLibrary?.name ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Member"
                                value={
                                    selectedRefund.customerName ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Email"
                                value={
                                    selectedRefund.customerEmail ||
                                    "-"
                                }
                            />

                            <Divider />

                            <DetailRow
                                label="Original Payment"
                                value={
                                    formatMoney(
                                        selectedRefund
                                            .originalPaymentAmount
                                    )
                                }
                            />

                            <DetailRow
                                label="This Refund"
                                value={
                                    formatMoney(
                                        selectedRefund
                                            .refundAmount
                                    )
                                }
                                strong
                            />

                            <DetailRow
                                label="Total Refunded"
                                value={
                                    formatMoney(
                                        selectedRefund
                                            .totalRefundedAmount
                                    )
                                }
                            />

                            <DetailRow
                                label="Remaining Refundable"
                                value={
                                    formatMoney(
                                        selectedRefund
                                            .remainingRefundableAmount
                                    )
                                }
                            />

                            <Divider />

                            <DetailRow
                                label="Refund Status"
                                value={
                                    selectedRefund.refundStatus ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Payment Status"
                                value={
                                    selectedRefund.paymentStatus ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Reference Type"
                                value={
                                    selectedRefund.referenceType ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Gateway Payment ID"
                                value={
                                    selectedRefund.gatewayPaymentId ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Gateway Refund ID"
                                value={
                                    selectedRefund.gatewayRefundId ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Requested By"
                                value={
                                    selectedRefund.requestedByName ||
                                    "-"
                                }
                            />

                            <DetailRow
                                label="Processed At"
                                value={
                                    formatDateTime(
                                        selectedRefund.processedAt
                                    )
                                }
                            />

                            <Box
                                sx={{
                                    mt: 1,
                                }}
                            >

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Refund Reason
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 0.5,
                                    }}
                                >
                                    {
                                        selectedRefund.reason ||
                                        "-"
                                    }
                                </Typography>

                            </Box>

                        </Stack>

                    ) : null}

                </DialogContent>


                <DialogActions>

                    <Button
                        onClick={() =>
                            setDetailsOpen(
                                false
                            )
                        }
                    >
                        Close
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}


// =============================================================
// DETAIL ROW
// =============================================================

function DetailRow({
    label,
    value,
    strong = false,
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
                    strong
                        ? 700
                        : 600
                }
                textAlign="right"
            >
                {value}
            </Typography>

        </Stack>
    );
}


export default Refunds;