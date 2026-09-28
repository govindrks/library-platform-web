import React, { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

import {
    ArrowForward,
    CalendarMonth,
    CheckCircle,
    Download,
    Groups,
    History,
    Payment,
    TrendingUp,
    WorkspacePremium,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import platformPlans from "../../utility/platformPlans";


const currentPlanId = "GROWTH";

const currentMembers = 78;

const billingDate = "15 October 2026";

const paymentMethod = "Razorpay •••• 4242";


const billingHistory = [
    {
        id: "INV-2026-09",
        date: "15 September 2026",
        description: "Growth Plan",
        amount: 1499,
        status: "PAID",
    },
    {
        id: "INV-2026-08",
        date: "15 August 2026",
        description: "Growth Plan",
        amount: 1499,
        status: "PAID",
    },
    {
        id: "INV-2026-07",
        date: "15 July 2026",
        description: "Growth Plan",
        amount: 1499,
        status: "PAID",
    },
    {
        id: "INV-2026-06",
        date: "15 June 2026",
        description: "Growth Plan",
        amount: 1499,
        status: "PAID",
    },
];


function SubscriptionBilling() {
    const navigate = useNavigate();

    const [showAllInvoices, setShowAllInvoices] =
        useState(false);

    const currentPlan = useMemo(
        () =>
            platformPlans.find(
                (plan) =>
                    plan.id === currentPlanId
            ),
        []
    );

    const usagePercentage = currentPlan?.maxMembers
        ? Math.min(
              (currentMembers /
                  currentPlan.maxMembers) *
                  100,
              100
          )
        : 0;

    const remainingMembers = currentPlan?.maxMembers
        ? Math.max(
              currentPlan.maxMembers -
                  currentMembers,
              0
          )
        : null;

    const displayedInvoices = showAllInvoices
        ? billingHistory
        : billingHistory.slice(0, 3);


    return (
        <Box>
            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

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
                mb={4}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={800}
                    >
                        Subscription & Billing
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Manage your LibraryHub subscription,
                        billing and member capacity.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<History />}
                    onClick={() =>
                        setShowAllInvoices(
                            (previous) => !previous
                        )
                    }
                >
                    Billing History
                </Button>
            </Stack>


            {/* =====================================================
                SUBSCRIPTION STATUS
            ====================================================== */}

            <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{ mb: 3 }}
            >
                Your LibraryHub subscription is active.
                Your next billing date is{" "}
                <strong>{billingDate}</strong>.
            </Alert>


            {/* =====================================================
                CURRENT PLAN + USAGE
            ====================================================== */}

            <Grid
                container
                spacing={3}
                mb={3}
            >

                {/* Current Plan */}

                <Grid
                    item
                    xs={12}
                    md={7}
                >
                    <Card
                        sx={{
                            height: "100%",
                            border: "1px solid",
                            borderColor:
                                "primary.main",
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>

                            <Stack spacing={3}>

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
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                backgroundColor:
                                                    "primary.light",
                                                color:
                                                    "primary.main",
                                            }}
                                        >
                                            <WorkspacePremium />
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Current
                                                LibraryHub Plan
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={800}
                                            >
                                                {
                                                    currentPlan?.name
                                                }
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Chip
                                        label="ACTIVE"
                                        color="success"
                                        size="small"
                                    />
                                </Stack>

                                <Divider />

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Member Capacity
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            1–
                                            {currentPlan?.maxMembers?.toLocaleString(
                                                "en-IN"
                                            )}
                                        </Typography>
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Monthly Price
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                            color="primary.main"
                                        >
                                            ₹
                                            {currentPlan?.price?.toLocaleString(
                                                "en-IN"
                                            )}
                                        </Typography>
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Next Billing
                                        </Typography>

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            {billingDate}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Stack
                                    direction={{
                                        xs: "column",
                                        sm: "row",
                                    }}
                                    spacing={2}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={
                                            <TrendingUp />
                                        }
                                        endIcon={
                                            <ArrowForward />
                                        }
                                        onClick={() =>
                                            navigate(
                                                "/platform-plans"
                                            )
                                        }
                                    >
                                        Upgrade Plan
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate(
                                                "/platform-plans"
                                            )
                                        }
                                    >
                                        Compare Plans
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>


                {/* Member Usage */}

                <Grid
                    item
                    xs={12}
                    md={5}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent sx={{ p: 3 }}>

                            <Stack spacing={2.5}>

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <Groups color="primary" />

                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            Member Usage
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        fontWeight={700}
                                        color="primary.main"
                                    >
                                        {currentMembers}/
                                        {
                                            currentPlan?.maxMembers
                                        }
                                    </Typography>
                                </Stack>

                                <Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            usagePercentage
                                        }
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                        }}
                                    />

                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        mt={1}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {Math.round(
                                                usagePercentage
                                            )}
                                            % used
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            {
                                                remainingMembers
                                            }{" "}
                                            seats remaining
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Alert
                                    severity={
                                        usagePercentage >=
                                        90
                                            ? "warning"
                                            : "info"
                                    }
                                >
                                    {usagePercentage >=
                                    90
                                        ? "Your library is close to the member capacity limit. Consider upgrading your plan."
                                        : `You can add ${remainingMembers} more active members on your current plan.`}
                                </Alert>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* =====================================================
                QUICK BILLING INFORMATION
            ====================================================== */}

            <Grid
                container
                spacing={3}
                mb={3}
            >

                <Grid
                    item
                    xs={12}
                    sm={4}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        backgroundColor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <Payment />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Monthly Billing
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        ₹
                                        {currentPlan?.price?.toLocaleString(
                                            "en-IN"
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>


                <Grid
                    item
                    xs={12}
                    sm={4}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        backgroundColor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <CalendarMonth />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Next Billing Date
                                    </Typography>

                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                    >
                                        {billingDate}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>


                <Grid
                    item
                    xs={12}
                    sm={4}
                >
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        backgroundColor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <Payment />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Payment Method
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        fontWeight={700}
                                    >
                                        {paymentMethod}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* =====================================================
                PLAN FEATURES
            ====================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>

                    <Stack spacing={2.5}>

                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Included in your{" "}
                                {currentPlan?.name} plan
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Features currently available
                                to your library.
                            </Typography>
                        </Box>

                        <Divider />

                        <Grid
                            container
                            spacing={1.5}
                        >
                            {currentPlan?.features.map(
                                (feature) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={4}
                                        key={feature}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <CheckCircle
                                                sx={{
                                                    fontSize: 19,
                                                    color:
                                                        "success.main",
                                                }}
                                            />

                                            <Typography variant="body2">
                                                {feature}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                )
                            )}
                        </Grid>
                    </Stack>
                </CardContent>
            </Card>


            {/* =====================================================
                BILLING HISTORY
            ====================================================== */}

            <Card>
                <CardContent sx={{ p: 3 }}>

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
                        mb={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Billing History
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Your recent LibraryHub
                                subscription invoices.
                            </Typography>
                        </Box>

                        <Button
                            size="small"
                            onClick={() =>
                                setShowAllInvoices(
                                    (previous) =>
                                        !previous
                                )
                            }
                        >
                            {showAllInvoices
                                ? "Show Less"
                                : "View All"}
                        </Button>
                    </Stack>

                    <TableContainer>
                        <Table>

                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Invoice
                                    </TableCell>

                                    <TableCell>
                                        Date
                                    </TableCell>

                                    <TableCell>
                                        Description
                                    </TableCell>

                                    <TableCell align="right">
                                        Amount
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell align="right">
                                        Invoice
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {displayedInvoices.map(
                                    (invoice) => (
                                        <TableRow
                                            key={
                                                invoice.id
                                            }
                                            hover
                                        >
                                            <TableCell>
                                                <Typography
                                                    fontWeight={
                                                        600
                                                    }
                                                >
                                                    {
                                                        invoice.id
                                                    }
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    invoice.date
                                                }
                                            </TableCell>

                                            <TableCell>
                                                {
                                                    invoice.description
                                                }
                                            </TableCell>

                                            <TableCell align="right">
                                                ₹
                                                {invoice.amount.toLocaleString(
                                                    "en-IN"
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={
                                                        invoice.status
                                                    }
                                                    color="success"
                                                    size="small"
                                                />
                                            </TableCell>

                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    startIcon={
                                                        <Download />
                                                    }
                                                    onClick={() =>
                                                        console.log(
                                                            "Download invoice:",
                                                            invoice.id
                                                        )
                                                    }
                                                >
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            </TableBody>

                        </Table>
                    </TableContainer>

                </CardContent>
            </Card>
        </Box>
    );
}

export default SubscriptionBilling;