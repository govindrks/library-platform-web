import React, { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useNavigate } from "react-router-dom";

import platformPlans from "../../utility/platformPlans";

const planIcons = {
    STARTER: GroupsIcon,
    GROWTH: TrendingUpIcon,
    STANDARD: WorkspacePremiumIcon,
    PROFESSIONAL: WorkspacePremiumIcon,
    BUSINESS: WorkspacePremiumIcon,
    ENTERPRISE: WorkspacePremiumIcon,
};

const comparisonFeatures = [
    "Library Profile",
    "Member Management",
    "Seat Management",
    "Slot Management",
    "Booking Management",
    "Payment Management",
    "Notifications",
    "Seat Change Requests",
    "Analytics",
    "Revenue Dashboard",
    "Reports",
    "Automated Reminders",
    "Automated Invoices",
    "Payment Automation",
    "Multiple Admin Users",
    "Advanced Automation",
    "API Access",
    "Multi-library Management",
];

const featureAvailability = {
    "Library Profile": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Member Management": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Seat Management": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Slot Management": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Booking Management": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Payment Management": [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    Notifications: [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Seat Change Requests": [
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    Analytics: [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Revenue Dashboard": [
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    Reports: [
        "STARTER",
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Automated Reminders": [
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Automated Invoices": [
        "GROWTH",
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Payment Automation": [
        "STANDARD",
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Multiple Admin Users": [
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Advanced Automation": [
        "PROFESSIONAL",
        "BUSINESS",
        "ENTERPRISE",
    ],

    "API Access": [
        "BUSINESS",
        "ENTERPRISE",
    ],

    "Multi-library Management": [
        "ENTERPRISE",
    ],
};

function PlatformPlans() {
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] =
        useState("GROWTH");

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan.id);

        navigate("/register-library", {
            state: {
                selectedPlanId: plan.id,
            },
        });
    };

    const isFeatureAvailable = (
        feature,
        planId
    ) => {
        return (
            featureAvailability[feature]?.includes(
                planId
            ) ?? false
        );
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "background.default",
                py: {
                    xs: 5,
                    md: 8,
                },
            }}
        >
            <Container maxWidth="xl">

                {/* =====================================================
                    HERO
                ====================================================== */}

                <Stack
                    alignItems="center"
                    textAlign="center"
                    spacing={2}
                    mb={6}
                >
                    <Chip
                        icon={<WorkspacePremiumIcon />}
                        label="LibraryHub for Libraries"
                        color="primary"
                        variant="outlined"
                    />

                    <Typography
                        variant="h2"
                        fontWeight={800}
                        sx={{
                            maxWidth: 850,
                            fontSize: {
                                xs: "2rem",
                                sm: "2.5rem",
                                md: "3rem",
                            },
                        }}
                    >
                        Choose the right capacity
                        for your library
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            maxWidth: 760,
                        }}
                    >
                        Manage your entire library from
                        one platform. Choose your
                        LibraryHub plan based on the
                        number of active members your
                        library needs to manage.
                    </Typography>
                </Stack>

                {/* =====================================================
                    PLAN CARDS
                ====================================================== */}

                <Grid
                    container
                    spacing={2.5}
                    alignItems="stretch"
                >
                    {platformPlans.map((plan) => {
                        const Icon =
                            planIcons[plan.id] ||
                            WorkspacePremiumIcon;

                        const isSelected =
                            selectedPlan === plan.id;

                        return (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                lg={4}
                                xl={2}
                                key={plan.id}
                                sx={{
                                    display: "flex",
                                }}
                            >
                                <Card
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        position:
                                            "relative",
                                        border:
                                            isSelected
                                                ? "2px solid"
                                                : "1px solid",
                                        borderColor:
                                            isSelected
                                                ? "primary.main"
                                                : "divider",
                                        transition:
                                            "all 0.2s ease",
                                        "&:hover": {
                                            transform:
                                                "translateY(-4px)",
                                            boxShadow:
                                                "0 12px 30px rgba(15, 23, 42, 0.08)",
                                        },
                                    }}
                                >
                                    {plan.popular && (
                                        <Chip
                                            label="Most Popular"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                position:
                                                    "absolute",
                                                top: 14,
                                                right: 14,
                                            }}
                                        />
                                    )}

                                    <CardContent
                                        sx={{
                                            p: 3,
                                            height: "100%",
                                        }}
                                    >
                                        <Stack
                                            spacing={2.5}
                                            height="100%"
                                        >
                                            <Box>
                                                <Box
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 2,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        backgroundColor:
                                                            "primary.light",
                                                        color:
                                                            "primary.main",
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Icon />
                                                </Box>

                                                <Typography
                                                    variant="h5"
                                                    fontWeight={700}
                                                >
                                                    {
                                                        plan.name
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={0.5}
                                                    minHeight={
                                                        42
                                                    }
                                                >
                                                    {
                                                        plan.description
                                                    }
                                                </Typography>
                                            </Box>

                                            {/* Price */}
                                            <Box>
                                                <Typography
                                                    variant="h4"
                                                    fontWeight={
                                                        800
                                                    }
                                                >
                                                    {plan.price
                                                        ? `₹${plan.price.toLocaleString(
                                                              "en-IN"
                                                          )}`
                                                        : "Custom"}
                                                </Typography>

                                                {plan.price && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        per month
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Capacity */}
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Member
                                                    capacity
                                                </Typography>

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={
                                                        700
                                                    }
                                                    color="primary.main"
                                                >
                                                    {plan.maxMembers
                                                        ? `1–${plan.maxMembers} members`
                                                        : "1,000+ members"}
                                                </Typography>
                                            </Box>

                                            <Divider />

                                            {/* Features */}
                                            <Stack
                                                spacing={1.2}
                                                flexGrow={1}
                                            >
                                                {plan.features
                                                    .slice(
                                                        0,
                                                        8
                                                    )
                                                    .map(
                                                        (
                                                            feature
                                                        ) => (
                                                            <Stack
                                                                key={
                                                                    feature
                                                                }
                                                                direction="row"
                                                                spacing={
                                                                    1
                                                                }
                                                                alignItems="flex-start"
                                                            >
                                                                <CheckCircleIcon
                                                                    sx={{
                                                                        fontSize: 18,
                                                                        color: "success.main",
                                                                        mt: "2px",
                                                                    }}
                                                                />

                                                                <Typography
                                                                    variant="body2"
                                                                >
                                                                    {
                                                                        feature
                                                                    }
                                                                </Typography>
                                                            </Stack>
                                                        )
                                                    )}
                                            </Stack>

                                            <Button
                                                fullWidth
                                                variant={
                                                    isSelected
                                                        ? "contained"
                                                        : "outlined"
                                                }
                                                endIcon={
                                                    <ArrowForwardIcon />
                                                }
                                                onClick={() =>
                                                    handleSelectPlan(
                                                        plan
                                                    )
                                                }
                                            >
                                                {plan.id ===
                                                "ENTERPRISE"
                                                    ? "Contact Us"
                                                    : "Choose Plan"}
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* =====================================================
                    FEATURE COMPARISON
                ====================================================== */}

                <Box mt={8}>
                    <Stack
                        alignItems="center"
                        textAlign="center"
                        spacing={1}
                        mb={4}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={700}
                        >
                            Compare platform features
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Every plan includes the core
                            tools required to run a modern
                            library.
                        </Typography>
                    </Stack>

                    <Card>
                        <Box
                            sx={{
                                overflowX: "auto",
                            }}
                        >
                            <Box
                                sx={{
                                    minWidth: 1050,
                                }}
                            >
                                {/* Header */}
                                <Grid
                                    container
                                    sx={{
                                        backgroundColor:
                                            "background.default",
                                        borderBottom:
                                            "1px solid",
                                        borderColor:
                                            "divider",
                                    }}
                                >
                                    <Grid
                                        item
                                        xs={3}
                                        sx={{
                                            p: 2,
                                        }}
                                    >
                                        <Typography
                                            fontWeight={700}
                                        >
                                            Feature
                                        </Typography>
                                    </Grid>

                                    {platformPlans.map(
                                        (plan) => (
                                            <Grid
                                                item
                                                xs
                                                key={
                                                    plan.id
                                                }
                                                sx={{
                                                    p: 2,
                                                    textAlign:
                                                        "center",
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    {
                                                        plan.name
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {plan.maxMembers
                                                        ? `1–${plan.maxMembers}`
                                                        : "1,000+"}
                                                </Typography>
                                            </Grid>
                                        )
                                    )}
                                </Grid>

                                {/* Feature rows */}
                                {comparisonFeatures.map(
                                    (feature) => (
                                        <Grid
                                            container
                                            key={feature}
                                            sx={{
                                                borderBottom:
                                                    "1px solid",
                                                borderColor:
                                                    "divider",
                                                "&:last-child":
                                                    {
                                                        borderBottom:
                                                            "none",
                                                    },
                                            }}
                                        >
                                            <Grid
                                                item
                                                xs={3}
                                                sx={{
                                                    p: 2,
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {
                                                        feature
                                                    }
                                                </Typography>
                                            </Grid>

                                            {platformPlans.map(
                                                (
                                                    plan
                                                ) => {
                                                    const available =
                                                        isFeatureAvailable(
                                                            feature,
                                                            plan.id
                                                        );

                                                    return (
                                                        <Grid
                                                            item
                                                            xs
                                                            key={`${plan.id}-${feature}`}
                                                            sx={{
                                                                p: 2,
                                                                display:
                                                                    "flex",
                                                                justifyContent:
                                                                    "center",
                                                                alignItems:
                                                                    "center",
                                                            }}
                                                        >
                                                            {available ? (
                                                                <CheckCircleIcon
                                                                    sx={{
                                                                        color: "success.main",
                                                                        fontSize: 20,
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Typography
                                                                    color="text.disabled"
                                                                >
                                                                    —
                                                                </Typography>
                                                            )}
                                                        </Grid>
                                                    );
                                                }
                                            )}
                                        </Grid>
                                    )
                                )}
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* =====================================================
                    BOTTOM CTA
                ====================================================== */}

                <Card
                    sx={{
                        mt: 5,
                        backgroundColor:
                            "primary.light",
                        borderColor:
                            "primary.main",
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
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
                            spacing={3}
                        >
                            <Box>
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    Need more than 1,000
                                    members?
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Contact our team for a
                                    custom LibraryHub plan.
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                endIcon={
                                    <ArrowForwardIcon />
                                }
                                onClick={() =>
                                    navigate(
                                        "/register-library"
                                    )
                                }
                            >
                                Register Your Library
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
}

export default PlatformPlans;