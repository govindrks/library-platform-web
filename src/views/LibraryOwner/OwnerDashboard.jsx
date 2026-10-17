import {
  AccessTime,
  ArrowForward,
  AutoAwesomeRounded,
  CheckCircleOutlineOutlined,
  DashboardCustomizeOutlined,
  EventSeat,
  Groups,
  LibraryBooks,
  LocalLibraryOutlined,
  Payments,
  RadioButtonUnchecked,
  Settings,
  TrendingUp,
  TuneRounded,
  VerifiedRounded,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import ownerDashboardApi from "../../api/ownerDashboardApi";

// ============================================================
// ONBOARDING STEP CONFIGURATION
// ============================================================

const onboardingSteps = [
  {
    key: "OWNER_ACCOUNT",
    label: "Owner Account",
  },
  {
    key: "LIBRARY_DETAILS",
    label: "Library Details",
  },
  {
    key: "AMENITIES",
    label: "Amenities",
  },
  {
    key: "SEATS_AND_SLOTS",
    label: "Seats & Layout",
  },
  {
    key: "PLATFORM_PLAN",
    label: "LibraryHub Plan",
  },
  {
    key: "REVIEW",
    label: "Review & Activate",
  },
];

const onboardingOrder = {
  LIBRARY_DETAILS: 1,
  AMENITIES: 2,
  SEATS_AND_SLOTS: 3,
  PLATFORM_PLAN: 4,
  REVIEW: 5,
  COMPLETED: 6,
};

// ============================================================
// FORMATTERS
// ============================================================

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(number);
};

const formatMoney = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const formatPercentage = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${number.toFixed(1)}%`;
};

// ============================================================
// SHARED CARD STYLE
// ============================================================

const getPremiumCardSx = (theme) => ({
  border: "1px solid",

  borderColor: alpha(theme.palette.divider, 0.85),

  borderRadius: 4,

  boxShadow: `0 10px 34px ${alpha(
    theme.palette.common.black,
    theme.palette.mode === "dark" ? 0.14 : 0.035,
  )}`,
});

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, subtitle, icon }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        ...getPremiumCardSx(theme),

        position: "relative",

        overflow: "hidden",

        transition: "all 0.22s ease",

        "&::after": {
          content: '""',

          position: "absolute",

          width: 100,

          height: 100,

          borderRadius: "50%",

          top: -55,

          right: -40,

          bgcolor: alpha(theme.palette.primary.main, 0.045),
        },

        "&:hover": {
          transform: "translateY(-3px)",

          borderColor: alpha(theme.palette.primary.main, 0.2),

          boxShadow: `0 16px 42px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.2 : 0.07,
          )}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                mt: 0.8,

                letterSpacing: "-0.035em",
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{
                mt: 0.7,
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,

              height: 48,

              display: "grid",

              placeItems: "center",

              borderRadius: 2.8,

              bgcolor: alpha(theme.palette.primary.main, 0.085),

              color: "primary.main",

              position: "relative",

              zIndex: 1,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DASHBOARD LOADING
// ============================================================

function DashboardLoading() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: 480,

        display: "grid",

        placeItems: "center",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 72,

            height: 72,

            display: "grid",

            placeItems: "center",

            borderRadius: "50%",

            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <CircularProgress size={34} />
        </Box>

        <Box textAlign="center">
          <Typography fontWeight={900}>Preparing your dashboard</Typography>

          <Typography
            color="text.secondary"
            variant="body2"
            sx={{
              mt: 0.4,
            }}
          >
            Loading your LibraryHub workspace.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ============================================================
// DASHBOARD ERROR
// ============================================================

function DashboardError({ message, onRetry }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        ...getPremiumCardSx(theme),

        p: 3,
      }}
    >
      <Alert
        severity="error"
        sx={{
          mb: 2,

          borderRadius: 3,
        }}
      >
        {message}
      </Alert>

      <Button
        variant="contained"
        onClick={onRetry}
        sx={{
          borderRadius: 2.5,

          textTransform: "none",

          fontWeight: 800,
        }}
      >
        Try Again
      </Button>
    </Card>
  );
}

// ============================================================
// SETUP PROGRESS
// ============================================================

function SetupProgress({ onboardingStep }) {
  const theme = useTheme();

  const currentIndex = onboardingOrder[onboardingStep] ?? 1;

  const progress = Math.min(
    100,

    Math.round((currentIndex / onboardingSteps.length) * 100),
  );

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        ...getPremiumCardSx(theme),
      }}
    >
      <CardContent
        sx={{
          p: 3,

          "&:last-child": {
            pb: 3,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Setup Progress
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              Your path to becoming operational.
            </Typography>
          </Box>

          <Box
            sx={{
              width: 56,

              height: 56,

              borderRadius: "50%",

              display: "grid",

              placeItems: "center",

              bgcolor: alpha(theme.palette.primary.main, 0.08),

              border: "5px solid",

              borderColor: alpha(theme.palette.primary.main, 0.14),
            }}
          >
            <Typography fontWeight={900} color="primary.main" variant="body2">
              {progress}%
            </Typography>
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 9,

            borderRadius: 5,

            mb: 3,

            bgcolor: alpha(theme.palette.primary.main, 0.08),
          }}
        />

        <Stack spacing={1}>
          {onboardingSteps.map((step, index) => {
            const stepPosition = index;

            const completed =
              step.key === "OWNER_ACCOUNT" || stepPosition < currentIndex;

            const current = step.key === onboardingStep;

            return (
              <Box
                key={step.key}
                sx={{
                  px: 1.5,

                  py: 1.25,

                  borderRadius: 2.5,

                  bgcolor: current
                    ? alpha(theme.palette.primary.main, 0.06)
                    : "transparent",
                }}
              >
                <Stack direction="row" spacing={1.3} alignItems="center">
                  {completed ? (
                    <CheckCircleOutlineOutlined
                      color="success"
                      fontSize="small"
                    />
                  ) : (
                    <RadioButtonUnchecked
                      color={current ? "primary" : "disabled"}
                      fontSize="small"
                    />
                  )}

                  <Box
                    sx={{
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={current ? 800 : completed ? 650 : 500}
                      color={current ? "primary.main" : "text.primary"}
                    >
                      {step.label}
                    </Typography>
                  </Box>

                  {current && (
                    <Chip
                      size="small"
                      label="Current"
                      color="primary"
                      variant="outlined"
                      sx={{
                        height: 24,

                        fontWeight: 700,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// NO LIBRARY STATE
// ============================================================

function NoLibrarySetup({ context, navigate }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        maxWidth: 1200,

        mx: "auto",
      }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 3,

          position: "relative",

          overflow: "hidden",

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.14),

          background: `linear-gradient(
              135deg,
              ${alpha(theme.palette.primary.main, 0.1)},
              ${alpha(theme.palette.background.paper, 0.98)} 58%
            )`,

          boxShadow: `0 18px 50px ${alpha(theme.palette.common.black, 0.055)}`,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
          }}
        >
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 62,

                  height: 62,

                  display: "grid",

                  placeItems: "center",

                  borderRadius: 3,

                  bgcolor: alpha(theme.palette.primary.main, 0.1),

                  color: "primary.main",
                }}
              >
                <LocalLibraryOutlined
                  sx={{
                    fontSize: 32,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{
                    letterSpacing: "-0.035em",
                  }}
                >
                  Welcome
                  {context?.ownerName ? `, ${context.ownerName}` : ""}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.6,
                  }}
                >
                  Your LibraryHub Owner workspace is ready.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label="Setup Required"
              color="warning"
              variant="outlined"
              sx={{
                fontWeight: 800,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Alert
        severity="info"
        sx={{
          mb: 3,

          borderRadius: 3,
        }}
      >
        Complete your library setup to unlock bookings, members, payments,
        analytics and operational tools.
      </Alert>

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              ...getPremiumCardSx(theme),
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
              }}
            >
              <Chip
                icon={<AutoAwesomeRounded />}
                label="Guided Onboarding"
                size="small"
                sx={{
                  mb: 2,

                  bgcolor: alpha(theme.palette.primary.main, 0.07),

                  color: "primary.main",

                  fontWeight: 700,
                }}
              />

              <Typography variant="h5" fontWeight={900}>
                Build your LibraryHub workspace
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,

                  maxWidth: 600,

                  lineHeight: 1.7,
                }}
              >
                Add your library information, configure amenities, create the
                seat layout, define slots and activate your LibraryHub plan.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/register-library")}
                  sx={{
                    minHeight: 46,

                    px: 2.5,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,
                  }}
                >
                  Start Guided Setup
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate("/owner/library")}
                  sx={{
                    minHeight: 46,

                    px: 2.4,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,
                  }}
                >
                  Library Configuration
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <SetupProgress
            onboardingStep={context?.onboardingStep || "LIBRARY_DETAILS"}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

// ============================================================
// DRAFT LIBRARY STATE
// ============================================================

function DraftLibrarySetup({ context, navigate }) {
  const theme = useTheme();

  const currentStepLabel =
    onboardingSteps.find((step) => step.key === context?.onboardingStep)
      ?.label || "Library Setup";

  const configurationItems = [
    {
      title: "Library Details",

      icon: <LocalLibraryOutlined />,

      path: "/owner/library",
    },
    {
      title: "Amenities",

      icon: <AutoAwesomeRounded />,

      path: "/owner/amenities",
    },
    {
      title: "Seat Mapping",

      icon: <EventSeat />,

      path: "/owner/seat-mapping",
    },
    {
      title: "Slots",

      icon: <AccessTime />,

      path: "/owner/slots",
    },
    {
      title: "Membership Plans",

      icon: <LibraryBooks />,

      path: "/owner/membership-plans",
    },
    {
      title: "Subscription & Billing",

      icon: <Payments />,

      path: "/owner/subscription",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1200,

        mx: "auto",
      }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 3,

          ...getPremiumCardSx(theme),

          background: `linear-gradient(
              135deg,
              ${alpha(theme.palette.warning.main, 0.06)},
              ${theme.palette.background.paper}
            )`,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
          }}
        >
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
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  letterSpacing: "-0.035em",
                }}
              >
                {context?.libraryName || "Your Library"}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.7,
                }}
              >
                Continue building your LibraryHub workspace.
              </Typography>
            </Box>

            <Chip
              label={context?.libraryStatus || "DRAFT"}
              color="warning"
              variant="outlined"
              sx={{
                fontWeight: 800,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Alert
        severity="warning"
        sx={{
          mb: 3,

          borderRadius: 3,
        }}
      >
        Your library setup is not complete yet. Operational features become
        available after activation.
      </Alert>

      <Grid container spacing={3} mb={3}>
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              ...getPremiumCardSx(theme),
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
              }}
            >
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight={900}
                sx={{
                  letterSpacing: "0.08em",
                }}
              >
                CURRENT STEP
              </Typography>

              <Typography
                variant="h5"
                fontWeight={900}
                sx={{
                  mt: 0.7,
                }}
              >
                {currentStepLabel}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,

                  lineHeight: 1.7,
                }}
              >
                Continue from where you stopped. Your existing setup progress is
                preserved automatically.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
                sx={{
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/register-library")}
                  sx={{
                    minHeight: 46,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,
                  }}
                >
                  Continue Guided Setup
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/owner/library")}
                  sx={{
                    minHeight: 46,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,
                  }}
                >
                  Library Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <SetupProgress onboardingStep={context?.onboardingStep} />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* DIRECT CONFIGURATION */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          ...getPremiumCardSx(theme),
        }}
      >
        <CardContent
          sx={{
            p: 3,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                width: 46,

                height: 46,

                display: "grid",

                placeItems: "center",

                borderRadius: 2.5,

                bgcolor: alpha(theme.palette.primary.main, 0.08),

                color: "primary.main",
              }}
            >
              <TuneRounded />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Library Configuration
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Jump directly to any setup section.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={1.5}>
            {configurationItems.map((item) => (
              <Grid
                key={item.title}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={item.icon}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 58,

                    px: 2,

                    justifyContent: "flex-start",

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 750,

                    borderColor: "divider",

                    color: "text.primary",

                    "& .MuiButton-endIcon": {
                      ml: "auto",
                    },

                    "&:hover": {
                      borderColor: "primary.main",

                      bgcolor: alpha(theme.palette.primary.main, 0.035),

                      color: "primary.main",
                    },
                  }}
                >
                  {item.title}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================
// ACTIVE / OPERATIONAL DASHBOARD
// ============================================================

function OperationalOwnerDashboard({ context, dashboard, navigate }) {
  const theme = useTheme();

  // ==========================================================
  // REAL DASHBOARD DATA
  // ==========================================================

  const statistics = dashboard?.overview?.statistics ?? {};

  const activity = dashboard?.activity ?? {};

  const actions = dashboard?.actions ?? {};

  const analytics = dashboard?.analytics ?? null;

  // ==========================================================
  // REAL STATISTICS
  // ==========================================================

  const totalSeats = Number(statistics.totalSeats ?? 0);

  const occupiedSeats = Number(statistics.occupiedSeats ?? 0);

  const availableSeats = Number(statistics.availableSeats ?? 0);

  const occupancyPercentage = Number(statistics.occupancyPercentage ?? 0);

  const activeStudents = Number(statistics.activeStudents ?? 0);

  const checkedInStudents = Number(statistics.checkedInStudents ?? 0);

  const activeSubscriptions = Number(statistics.activeSubscriptions ?? 0);

  const expiringIn7Days = Number(statistics.expiringIn7Days ?? 0);

  const pendingSeatRequests = Number(statistics.pendingSeatRequests ?? 0);

  const todayCheckIns = Number(statistics.todayCheckIns ?? 0);

  const todayCheckOuts = Number(statistics.todayCheckOuts ?? 0);

  const unreadNotifications = Number(statistics.unreadNotifications ?? 0);

  const todayRevenue = Number(statistics.todayRevenue ?? 0);

  const monthlyRevenue = Number(statistics.monthlyRevenue ?? 0);

  const totalRevenue = Number(statistics.totalRevenue ?? 0);

  const successfulPayments = Number(statistics.successfulPayments ?? 0);

  const pendingPayments = Number(statistics.pendingPayments ?? 0);

  const failedPayments = Number(statistics.failedPayments ?? 0);

  const averageTransactionValue = Number(
    statistics.averageTransactionValue ?? 0,
  );

  const totalTransactions = Number(statistics.totalTransactions ?? 0);

  // ==========================================================
  // KPI CARDS
  // ==========================================================

  const statCards = [
    {
      title: "Total Seats",

      value: formatNumber(totalSeats),

      subtitle: `${formatNumber(occupiedSeats)} occupied · ${formatNumber(
        availableSeats,
      )} available`,

      icon: <EventSeat />,
    },

    {
      title: "Active Members",

      value: formatNumber(activeStudents),

      subtitle: `${formatNumber(checkedInStudents)} currently checked in`,

      icon: <Groups />,
    },

    {
      title: "Active Memberships",

      value: formatNumber(activeSubscriptions),

      subtitle: `${formatNumber(expiringIn7Days)} expiring within 7 days`,

      icon: <LibraryBooks />,
    },

    {
      title: "Today's Revenue",

      value: formatMoney(todayRevenue),

      subtitle: `${formatNumber(successfulPayments)} successful payments`,

      icon: <Payments />,
    },
  ];

  // ==========================================================
  // REAL ACTIVITY / ACTION DATA
  // ==========================================================

  const recentBookings = Array.isArray(activity.recentBookings)
    ? activity.recentBookings
    : [];

  const expiringSubscriptions = Array.isArray(activity.expiringSubscriptions)
    ? activity.expiringSubscriptions
    : [];

  const recentPayments = Array.isArray(activity.recentPayments)
    ? activity.recentPayments
    : [];

  const recentActivities = Array.isArray(activity.recentActivities)
    ? activity.recentActivities
    : [];

  const backendQuickActions = Array.isArray(actions.quickActions)
    ? actions.quickActions
    : [];

  const alerts = Array.isArray(actions.alerts) ? actions.alerts : [];

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1280,

        mx: "auto",

        pb: 5,
      }}
    >
      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",

          overflow: "hidden",

          mb: 3,

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.14),

          background: `
            linear-gradient(
              135deg,
              ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.21 : 0.1,
              )} 0%,
              ${alpha(theme.palette.background.paper, 0.99)} 54%,
              ${alpha(theme.palette.primary.main, 0.02)} 100%
            )
          `,

          boxShadow: `0 20px 56px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.22 : 0.06,
          )}`,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 4,
            },
          }}
        >
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 64,

                  height: 64,

                  bgcolor: "primary.main",

                  fontWeight: 900,

                  fontSize: 22,
                }}
              >
                {context?.ownerName?.charAt(0)?.toUpperCase() || "O"}
              </Avatar>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="h4" fontWeight={900}>
                    Welcome back
                    {context?.ownerName ? `, ${context.ownerName}` : ""}
                  </Typography>

                  <VerifiedRounded color="primary" />
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                  }}
                >
                  Live operational overview for your library.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <Button
                variant="outlined"
                startIcon={<LocalLibraryOutlined />}
                onClick={() => navigate("/owner/library")}
              >
                Library Profile
              </Button>

              <Button
                variant="contained"
                startIcon={<EventSeat />}
                onClick={() => navigate("/owner/seat-mapping")}
              >
                Manage Seats
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* LIBRARY SUMMARY */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          ...getPremiumCardSx(theme),
        }}
      >
        <CardContent>
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
            <Box>
              <Typography variant="h6" fontWeight={900}>
                {statistics.libraryName ||
                  context?.libraryName ||
                  "Your Library"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Library ID #{context?.libraryId}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip label="Operational" color="success" size="small" />

              <Chip
                label={context?.libraryStatus || "ACTIVE"}
                color="success"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* REAL KPI CARDS */}
      {/* ====================================================== */}

      <Grid container spacing={2} mb={3}>
        {statCards.map((stat) => (
          <Grid
            key={stat.title}
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ====================================================== */}
      {/* OCCUPANCY + OPERATIONS */}
      {/* ====================================================== */}

      <Grid container spacing={2.5} mb={3}>
        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              ...getPremiumCardSx(theme),
            }}
          >
            <CardContent
              sx={{
                p: 3,
              }}
            >
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
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Seat Occupancy
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Live utilization from dashboard statistics.
                  </Typography>
                </Box>

                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {formatPercentage(occupancyPercentage)}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, occupancyPercentage))}
                sx={{
                  height: 12,

                  borderRadius: 10,

                  my: 3,
                }}
              />

              <Grid container spacing={1.5}>
                <MetricCard
                  label="Total Seats"
                  value={formatNumber(totalSeats)}
                />

                <MetricCard
                  label="Occupied"
                  value={formatNumber(occupiedSeats)}
                />

                <MetricCard
                  label="Available"
                  value={formatNumber(availableSeats)}
                />

                <MetricCard
                  label="Pending Seat Requests"
                  value={formatNumber(pendingSeatRequests)}
                />
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              ...getPremiumCardSx(theme),
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Today's Activity
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  mb: 2,
                }}
              >
                Real-time operational counts.
              </Typography>

              <Stack spacing={1.4}>
                <OperationMetric label="Check-ins" value={todayCheckIns} />

                <OperationMetric label="Check-outs" value={todayCheckOuts} />

                <OperationMetric
                  label="Unread Notifications"
                  value={unreadNotifications}
                />

                <OperationMetric
                  label="Pending Payments"
                  value={pendingPayments}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* REVENUE / PAYMENT METRICS */}
      {/* ====================================================== */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Monthly Revenue"
            value={formatMoney(monthlyRevenue)}
            subtitle="Current month"
            icon={<TrendingUp />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Total Revenue"
            value={formatMoney(totalRevenue)}
            subtitle="Recorded revenue"
            icon={<Payments />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Transactions"
            value={formatNumber(totalTransactions)}
            subtitle={`${formatNumber(failedPayments)} failed payments`}
            icon={<Payments />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <StatCard
            title="Avg. Transaction"
            value={formatMoney(averageTransactionValue)}
            subtitle="Average successful transaction value"
            icon={<TrendingUp />}
          />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* BACKEND ACTIVITY SUMMARY */}
      {/* ====================================================== */}

      <Grid container spacing={2.5} mb={3}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActivitySummaryCard
            title="Recent Bookings"
            count={recentBookings.length}
            description="Latest booking activity returned by the dashboard service."
            actionLabel="View Bookings"
            onAction={() => navigate("/owner/bookings")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActivitySummaryCard
            title="Recent Payments"
            count={recentPayments.length}
            description="Latest payment transactions available from the dashboard."
            actionLabel="View Payments"
            onAction={() => navigate("/owner/payments")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActivitySummaryCard
            title="Expiring Memberships"
            count={expiringSubscriptions.length}
            description="Memberships nearing expiry according to dashboard activity."
            actionLabel="View Members"
            onAction={() => navigate("/owner/members")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ActivitySummaryCard
            title="Recent Activity"
            count={recentActivities.length}
            description="Recent operational events recorded for this library."
          />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* ALERTS */}
      {/* ====================================================== */}

      {alerts.length > 0 && (
        <Card
          elevation={0}
          sx={{
            mb: 3,

            ...getPremiumCardSx(theme),
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{
                mb: 2,
              }}
            >
              Alerts
            </Typography>

            <Stack spacing={1.2}>
              {alerts.map((alert, index) => (
                <Alert
                  key={alert?.id ?? index}
                  severity={
                    String(
                      alert?.type ?? alert?.severity ?? "INFO",
                    ).toLowerCase() === "critical"
                      ? "error"
                      : String(
                            alert?.type ?? alert?.severity ?? "INFO",
                          ).toLowerCase() === "warning"
                        ? "warning"
                        : "info"
                  }
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  {alert?.message ?? alert?.title ?? "Dashboard alert"}
                </Alert>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ====================================================== */}
      {/* BACKEND QUICK ACTIONS */}
      {/* ====================================================== */}

      {backendQuickActions.length > 0 && (
        <Card
          elevation={0}
          sx={{
            ...getPremiumCardSx(theme),
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
              sx={{
                mb: 2,
              }}
            >
              <DashboardCustomizeOutlined color="primary" />

              <Typography variant="h6" fontWeight={900}>
                Recommended Actions
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {backendQuickActions.map((action, index) => (
                <Grid
                  key={action?.id ?? action?.label ?? index}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Box
                    sx={{
                      p: 2,

                      border: "1px solid",

                      borderColor: "divider",

                      borderRadius: 3,

                      height: "100%",
                    }}
                  >
                    <Typography fontWeight={800}>
                      {action?.label ?? action?.title ?? "Action"}
                    </Typography>

                    {(action?.description || action?.message) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {action?.description ?? action?.message}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ====================================================== */}
      {/* ANALYTICS PRESERVED FOR NEXT ANALYTICS UI */}
      {/* ====================================================== */}

      {analytics ? null : null}
    </Box>
  );
}

// ============================================================
// SIMPLE METRIC CARD
// ============================================================

function MetricCard({ label, value }) {
  const theme = useTheme();

  return (
    <Grid
      size={{
        xs: 6,
        sm: 3,
      }}
    >
      <Box
        sx={{
          p: 1.7,

          borderRadius: 2.5,

          border: "1px solid",

          borderColor: "divider",

          bgcolor: alpha(theme.palette.background.default, 0.4),

          height: "100%",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography
          variant="h6"
          fontWeight={900}
          sx={{
            mt: 0.3,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Grid>
  );
}

// ============================================================
// OPERATION METRIC
// ============================================================

function OperationMetric({ label, value }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 1.4,

        borderRadius: 2.5,

        bgcolor: alpha(theme.palette.background.default, 0.45),

        border: "1px solid",

        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>

      <Typography fontWeight={900}>{formatNumber(value)}</Typography>
    </Stack>
  );
}

// ============================================================
// ACTIVITY SUMMARY CARD
// ============================================================

function ActivitySummaryCard({
  title,
  count,
  description,
  actionLabel,
  onAction,
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        ...getPremiumCardSx(theme),
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              sx={{
                mt: 0.6,
              }}
            >
              {formatNumber(count)}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",

                mt: 0.7,
              }}
            >
              {description}
            </Typography>
          </Box>

          {actionLabel && onAction && (
            <Button
              endIcon={<ArrowForward />}
              onClick={onAction}
              sx={{
                textTransform: "none",

                fontWeight: 800,
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// OWNER DASHBOARD COORDINATOR
// ============================================================

function OwnerDashboard() {
  const navigate = useNavigate();

  const [context, setContext] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD OWNER DASHBOARD
  // ==========================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      // ==================================================
      // OWNER CONTEXT
      // ==================================================

      const ownerContext = await ownerDashboardApi.getContext();

      setContext(ownerContext);

      // ==================================================
      // NO LIBRARY
      // ==================================================

      if (!ownerContext?.libraryId) {
        setDashboard(null);

        return;
      }

      // ==================================================
      // LIBRARY NOT OPERATIONAL
      // ==================================================

      if (!ownerContext?.operationalDashboardAvailable) {
        setDashboard(null);

        return;
      }

      // ==================================================
      // ACTIVE LIBRARY - REAL DASHBOARD
      // ==================================================

      const dashboardData = await ownerDashboardApi.getDashboard(
        ownerContext.libraryId,
      );

      setDashboard(dashboardData ?? null);
    } catch (err) {
      console.error("Failed to load owner dashboard:", err);

      setError(
        err?.response?.data?.message || "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ==========================================================
  // DASHBOARD STATE
  // ==========================================================

  const dashboardState = useMemo(() => {
    if (!context) {
      return "UNKNOWN";
    }

    if (!context.libraryId) {
      return "NO_LIBRARY";
    }

    if (
      context.libraryStatus !== "ACTIVE" ||
      !context.operationalDashboardAvailable
    ) {
      return "SETUP";
    }

    return "ACTIVE";
  }, [context]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <DashboardLoading />;
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return <DashboardError message={error} onRetry={loadDashboard} />;
  }

  // ==========================================================
  // NO LIBRARY
  // ==========================================================

  if (dashboardState === "NO_LIBRARY") {
    return <NoLibrarySetup context={context} navigate={navigate} />;
  }

  // ==========================================================
  // SETUP
  // ==========================================================

  if (dashboardState === "SETUP") {
    return <DraftLibrarySetup context={context} navigate={navigate} />;
  }

  // ==========================================================
  // ACTIVE
  // ==========================================================

  if (dashboardState === "ACTIVE") {
    if (!dashboard) {
      return (
        <DashboardError
          message="Dashboard data is unavailable for this library."
          onRetry={loadDashboard}
        />
      );
    }

    return (
      <OperationalOwnerDashboard
        context={context}
        dashboard={dashboard}
        navigate={navigate}
      />
    );
  }

  // ==========================================================
  // FALLBACK
  // ==========================================================

  return (
    <DashboardError
      message="Unable to determine dashboard state."
      onRetry={loadDashboard}
    />
  );
}

export default OwnerDashboard;
