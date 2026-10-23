import {
  AccessTime,
  ArrowForward,
  AutoAwesomeRounded,
  BoltOutlined,
  CheckCircleOutlineOutlined,
  DashboardCustomizeOutlined,
  ErrorOutlineOutlined,
  EventSeat,
  Groups,
  History,
  LibraryBooks,
  LocalLibraryOutlined,
  Payments,
  PersonAddAlt1,
  RadioButtonUnchecked,
  ReceiptLongOutlined,
  Settings,
  TrendingDown,
  TrendingUp,
  TuneRounded,
  VerifiedRounded,
  WarningAmberOutlined,
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
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { alpha, useTheme } from "@mui/material/styles";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import ownerDashboardApi from "../../api/ownerDashboardApi";

import libraryRevenueApi from "../../api/libraryRevenueApi";

import automationApi from "../../api/automationApi";

import libraryApi from "../../api/libraryApi";

import getImageUrl from "../../utility/imageUrl";

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

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",

    month: "short",

    hour: "2-digit",

    minute: "2-digit",
  });
};

const formatActivityLabel = (item, fallback = "Activity") =>
  item?.title ||
  item?.message ||
  item?.description ||
  item?.studentName ||
  item?.memberName ||
  item?.customerName ||
  fallback;

// ============================================================
// LIBRARY PROFILE IMAGE
// ============================================================

const resolveLibraryProfileImageUrl = (libraryDetails) => {
  if (!libraryDetails) {
    return "";
  }

  // ==========================================================
  // FIRST PRIORITY
  // SYNCHRONIZED PROFILE IMAGE URL
  // ==========================================================

  if (libraryDetails.profileImageUrl) {
    return libraryDetails.profileImageUrl;
  }

  // ==========================================================
  // SECOND PRIORITY
  // PROFILE IMAGE FROM LIBRARY IMAGE COLLECTION
  // ==========================================================

  const images = Array.isArray(libraryDetails.images)
    ? libraryDetails.images
    : [];

  const profileImage = images.find((image) => {
    const role = image?.imageRole || (image?.profile ? "PROFILE" : null);

    return role === "PROFILE";
  });

  return profileImage?.imageUrl || "";
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

function OperationalOwnerDashboard({
  context,
  dashboard,
  revenueData,
  automationSummary,
  automationExecutions,
  generatedReports,
  libraryProfileImageUrl,
  navigate,
}) {
  const theme = useTheme();

  const statistics = dashboard?.overview?.statistics ?? {};

  const activity = dashboard?.activity ?? {};

  const actions = dashboard?.actions ?? {};

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

  const pendingPayments = Number(statistics.pendingPayments ?? 0);

  const failedPayments = Number(statistics.failedPayments ?? 0);

  const membersInside = Math.max(
    checkedInStudents > 0 ? checkedInStudents : todayCheckIns - todayCheckOuts,

    0,
  );

  const finance = revenueData?.summary ?? {};

  const grossRevenue = Number(
    finance.grossRevenue ?? statistics.totalRevenue ?? 0,
  );

  const refundedAmount = Number(finance.refundedAmount ?? 0);

  const revenueAfterRefunds = Number(
    finance.revenueAfterRefunds ?? grossRevenue - refundedAmount,
  );

  const totalExpenses = Number(finance.totalExpenses ?? 0);

  const netRevenue = Number(
    finance.netRevenue ?? revenueAfterRefunds - totalExpenses,
  );

  const monthlyRevenue = Number(
    finance.monthlyRevenue ?? statistics.monthlyRevenue ?? 0,
  );

  const monthlyExpenses = Number(finance.monthlyExpenses ?? 0);

  const monthlyNetRevenue = Number(
    finance.monthlyNetRevenue ?? monthlyRevenue - monthlyExpenses,
  );

  const expenseRatio = Number(finance.expenseRatio ?? 0);

  const todayNetRevenue = Number(
    finance.todayNetRevenue ??
      finance.todayRevenue ??
      statistics.todayRevenue ??
      0,
  );

  const executionList = Array.isArray(automationExecutions)
    ? automationExecutions
    : [];

  const activeAutomationRules = Number(automationSummary?.activeRules ?? 0);

  const inactiveAutomationRules = Number(automationSummary?.inactiveRules ?? 0);

  const successfulExecutions = executionList.filter(
    (item) => item?.status === "SUCCESS",
  ).length;

  const failedExecutions = executionList.filter(
    (item) => item?.status === "FAILED",
  ).length;

  const skippedExecutions = executionList.filter(
    (item) => item?.status === "SKIPPED",
  ).length;

  const processingExecutions = executionList.filter(
    (item) =>
      item?.status && !["SUCCESS", "FAILED", "SKIPPED"].includes(item.status),
  ).length;

  const completedExecutions =
    successfulExecutions + failedExecutions + skippedExecutions;

  const automationSuccessRate =
    completedExecutions > 0
      ? (successfulExecutions / completedExecutions) * 100
      : 0;

  const reportCount = Array.isArray(generatedReports)
    ? generatedReports.length
    : 0;

  const recentBookings = Array.isArray(activity.recentBookings)
    ? activity.recentBookings
    : [];

  const recentPayments = Array.isArray(activity.recentPayments)
    ? activity.recentPayments
    : [];

  const recentActivities = Array.isArray(activity.recentActivities)
    ? activity.recentActivities
    : [];

  const backendAlerts = Array.isArray(actions.alerts) ? actions.alerts : [];

  const attentionItems = [
    ...(expiringIn7Days > 0
      ? [
          {
            key: "expiring-memberships",

            severity: "warning",

            icon: <LibraryBooks fontSize="small" />,

            title: `${formatNumber(expiringIn7Days)} membership${
              expiringIn7Days === 1 ? "" : "s"
            } expiring within 7 days`,

            action: "View Members",

            path: "/owner/members",
          },
        ]
      : []),

    ...(pendingSeatRequests > 0
      ? [
          {
            key: "seat-change",

            severity: "warning",

            icon: <EventSeat fontSize="small" />,

            title: `${formatNumber(
              pendingSeatRequests,
            )} pending seat-change request${
              pendingSeatRequests === 1 ? "" : "s"
            }`,

            action: "Review Requests",

            path: "/owner/seat-change-requests",
          },
        ]
      : []),

    ...(pendingPayments > 0
      ? [
          {
            key: "pending-payments",

            severity: "info",

            icon: <Payments fontSize="small" />,

            title: `${formatNumber(pendingPayments)} payment${
              pendingPayments === 1 ? "" : "s"
            } pending`,

            action: "View Payments",

            path: "/owner/payments",
          },
        ]
      : []),

    ...(failedPayments > 0
      ? [
          {
            key: "failed-payments",

            severity: "error",

            icon: <ErrorOutlineOutlined fontSize="small" />,

            title: `${formatNumber(failedPayments)} failed payment${
              failedPayments === 1 ? "" : "s"
            } need review`,

            action: "Inspect Payments",

            path: "/owner/payments",
          },
        ]
      : []),

    ...(failedExecutions > 0
      ? [
          {
            key: "failed-automation",

            severity: "error",

            icon: <BoltOutlined fontSize="small" />,

            title: `${formatNumber(failedExecutions)} automation execution${
              failedExecutions === 1 ? "" : "s"
            } failed`,

            action: "Open Automation",

            path: "/owner/automation",
          },
        ]
      : []),

    ...backendAlerts.slice(0, 4).map((alert, index) => ({
      key: `backend-${alert?.id ?? index}`,

      severity:
        String(alert?.type ?? alert?.severity ?? "INFO").toUpperCase() ===
        "CRITICAL"
          ? "error"
          : String(alert?.type ?? alert?.severity ?? "INFO").toUpperCase() ===
              "WARNING"
            ? "warning"
            : "info",

      icon: <WarningAmberOutlined fontSize="small" />,

      title: alert?.message ?? alert?.title ?? "Dashboard alert",
    })),
  ];

  const recentFeed = [
    ...recentBookings.slice(0, 2).map((item, index) => ({
      key: `booking-${item?.id ?? index}`,

      icon: <EventSeat fontSize="small" />,

      title:
        item?.studentName || item?.memberName
          ? `${item.studentName ?? item.memberName} booking activity`
          : formatActivityLabel(item, "Booking activity"),

      subtitle:
        [item?.seatNumber, item?.slotName, item?.membershipPlanName]
          .filter(Boolean)
          .join(" · ") ||
        item?.description ||
        "Latest booking update",

      at: item?.createdAt ?? item?.bookingDate ?? item?.updatedAt,

      path: "/owner/bookings",
    })),

    ...recentPayments.slice(0, 2).map((item, index) => ({
      key: `payment-${item?.id ?? index}`,

      icon: <Payments fontSize="small" />,

      title:
        item?.amount != null
          ? `${formatMoney(item.amount)} payment recorded`
          : formatActivityLabel(item, "Payment activity"),

      subtitle:
        [item?.paymentMethod, item?.status, item?.customerName]
          .filter(Boolean)
          .join(" · ") ||
        item?.description ||
        "Latest payment update",

      at: item?.createdAt ?? item?.transactionDate ?? item?.updatedAt,

      path: "/owner/payments",
    })),

    ...recentActivities.slice(0, 3).map((item, index) => ({
      key: `activity-${item?.id ?? index}`,

      icon: <History fontSize="small" />,

      title: formatActivityLabel(item, "Library activity"),

      subtitle:
        item?.description && item?.description !== item?.title
          ? item.description
          : item?.type || item?.activityType || "Operational event",

      at: item?.createdAt ?? item?.timestamp ?? item?.updatedAt,
    })),
  ].slice(0, 6);

  const quickActions = [
    {
      label: "Create Booking",

      description: "Create a walk-in or assisted booking.",

      icon: <EventSeat />,

      path: "/owner/bookings/create",
    },

    {
      label: "Members",

      description: "View members and memberships.",

      icon: <PersonAddAlt1 />,

      path: "/owner/members",
    },

    {
      label: "Add Expense",

      description: "Record a library operating cost.",

      icon: <ReceiptLongOutlined />,

      path: "/owner/expenses",
    },

    {
      label: "Payments",

      description: "Review payment transactions.",

      icon: <Payments />,

      path: "/owner/payments",
    },

    {
      label: "Seat Availability",

      description: "Check dynamic seat occupancy.",

      icon: <EventSeat />,

      path: "/owner/seat-availability",
    },

    {
      label: "Automation",

      description: "Manage workflows and execution health.",

      icon: <BoltOutlined />,

      path: "/owner/automation",
    },
  ];

  // ==========================================================
  // LIBRARY DISPLAY INFORMATION
  // ==========================================================

  const libraryName =
    statistics.libraryName || context?.libraryName || "Your Library";

  const libraryInitial = libraryName?.trim()?.charAt(0)?.toUpperCase() || "L";

  const dashboardProfileImage = libraryProfileImageUrl
    ? getImageUrl(libraryProfileImageUrl)
    : undefined;

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1440,

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

          background: `linear-gradient(
              135deg,
              ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.2 : 0.1,
              )} 0%,
              ${alpha(theme.palette.background.paper, 0.99)} 54%,
              ${alpha(theme.palette.success.main, 0.035)} 100%
            )`,

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

              lg: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",

              lg: "center",
            }}
            spacing={3}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              {/* ================================================= */}
              {/* LIBRARY PROFILE IMAGE */}
              {/* ================================================= */}

              <Avatar
                src={dashboardProfileImage}
                alt={libraryName}
                sx={{
                  width: 72,

                  height: 72,

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  fontWeight: 900,

                  fontSize: 24,

                  border: "3px solid",

                  borderColor: "background.paper",

                  boxShadow: `0 10px 28px ${alpha(
                    theme.palette.common.black,
                    theme.palette.mode === "dark" ? 0.3 : 0.18,
                  )}`,

                  flexShrink: 0,

                  "& img": {
                    width: "100%",

                    height: "100%",

                    objectFit: "cover",
                  },
                }}
              >
                {libraryInitial}
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
                  {libraryName}
                  {" · "}
                  Live operational, financial and automation overview.
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={1.4}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip label="Operational" color="success" size="small" />

                  <Chip
                    label={context?.libraryStatus || "ACTIVE"}
                    color="success"
                    variant="outlined"
                    size="small"
                  />

                  <Chip
                    label={`${formatNumber(
                      attentionItems.length,
                    )} attention item${attentionItems.length === 1 ? "" : "s"}`}
                    color={attentionItems.length > 0 ? "warning" : "default"}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
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
                sx={{
                  minHeight: 44,

                  borderRadius: 2.5,

                  textTransform: "none",

                  fontWeight: 800,
                }}
              >
                Library Profile
              </Button>

              <Button
                variant="contained"
                startIcon={<EventSeat />}
                onClick={() => navigate("/owner/bookings/create")}
                sx={{
                  minHeight: 44,

                  borderRadius: 2.5,

                  textTransform: "none",

                  fontWeight: 800,
                }}
              >
                Create Booking
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* PRIMARY KPI */}
      {/* ====================================================== */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <StatCard
            title="Members Inside"
            value={formatNumber(membersInside)}
            subtitle={`${formatNumber(
              todayCheckIns,
            )} check-ins · ${formatNumber(todayCheckOuts)} check-outs today`}
            icon={<Groups />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <StatCard
            title="Seat Occupancy"
            value={formatPercentage(occupancyPercentage)}
            subtitle={`${formatNumber(occupiedSeats)} occupied · ${formatNumber(
              availableSeats,
            )} available`}
            icon={<EventSeat />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <StatCard
            title="Today's Net Revenue"
            value={formatMoney(todayNetRevenue)}
            subtitle="After refunds and operating expenses"
            icon={todayNetRevenue >= 0 ? <TrendingUp /> : <TrendingDown />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <StatCard
            title="Needs Attention"
            value={formatNumber(attentionItems.length)}
            subtitle={`${formatNumber(
              unreadNotifications,
            )} unread notifications`}
            icon={<WarningAmberOutlined />}
          />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* SEAT UTILIZATION */}
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
                    Seat Utilization
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Live seat occupancy with direct access to availability and
                    layout.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="primary.main"
                  >
                    {formatPercentage(occupancyPercentage)}
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      occupancyPercentage >= 85
                        ? "High utilization"
                        : occupancyPercentage >= 60
                          ? "Healthy"
                          : "Capacity available"
                    }
                    color={occupancyPercentage >= 85 ? "warning" : "success"}
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(
                  100,

                  Math.max(0, occupancyPercentage),
                )}
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
                  label="Seat Requests"
                  value={formatNumber(pendingSeatRequests)}
                />
              </Grid>

              <Stack
                direction={{
                  xs: "column",

                  sm: "row",
                }}
                spacing={1.2}
                mt={2.5}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/owner/seat-availability")}
                  sx={{
                    textTransform: "none",

                    fontWeight: 800,

                    borderRadius: 2.5,
                  }}
                >
                  View Availability
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/owner/seat-mapping")}
                  sx={{
                    textTransform: "none",

                    fontWeight: 800,

                    borderRadius: 2.5,
                  }}
                >
                  Manage Layout
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ==================================================== */}
        {/* TODAY */}
        {/* ==================================================== */}

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
                Today at a Glance
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,

                  mb: 2,
                }}
              >
                Live operating counts for your library.
              </Typography>

              <Stack spacing={1.25}>
                <OperationMetric label="Check-ins" value={todayCheckIns} />

                <OperationMetric label="Check-outs" value={todayCheckOuts} />

                <OperationMetric label="Members Inside" value={membersInside} />

                <OperationMetric
                  label="Pending Seat Requests"
                  value={pendingSeatRequests}
                />

                <OperationMetric
                  label="Unread Notifications"
                  value={unreadNotifications}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* FINANCIAL HEALTH */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

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

              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",

              md: "center",
            }}
            spacing={2}
            mb={2.5}
          >
            <Box>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Payments color="primary" />

                <Typography variant="h6" fontWeight={900}>
                  Financial Health
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Revenue, refunds and operating expenses combined into one
                business view.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/owner/revenue")}
              sx={{
                textTransform: "none",

                fontWeight: 800,

                borderRadius: 2.5,
              }}
            >
              Revenue Center
            </Button>
          </Stack>

          <Grid container spacing={1.5}>
            <Grid
              size={{
                xs: 12,

                sm: 6,

                lg: 2.4,
              }}
            >
              <FinancialMetric
                label="Gross Revenue"
                value={formatMoney(grossRevenue)}
                tone="primary"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,

                lg: 2.4,
              }}
            >
              <FinancialMetric
                label="Refunds"
                value={`-${formatMoney(refundedAmount)}`}
                tone="warning"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,

                lg: 2.4,
              }}
            >
              <FinancialMetric
                label="After Refunds"
                value={formatMoney(revenueAfterRefunds)}
                tone="info"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,

                lg: 2.4,
              }}
            >
              <FinancialMetric
                label="Expenses"
                value={`-${formatMoney(totalExpenses)}`}
                tone="error"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,

                lg: 2.4,
              }}
            >
              <FinancialMetric
                label="Net Revenue"
                value={formatMoney(netRevenue)}
                tone={netRevenue >= 0 ? "success" : "error"}
                strong
              />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} mt={0.25}>
            <Grid
              size={{
                xs: 12,

                md: 4,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,

                  borderRadius: 3,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Monthly Revenue
                </Typography>

                <Typography variant="h6" fontWeight={900} mt={0.4}>
                  {formatMoney(monthlyRevenue)}
                </Typography>
              </Paper>
            </Grid>

            <Grid
              size={{
                xs: 12,

                md: 4,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,

                  borderRadius: 3,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Monthly Expenses
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={900}
                  color="error.main"
                  mt={0.4}
                >
                  {formatMoney(monthlyExpenses)}
                </Typography>
              </Paper>
            </Grid>

            <Grid
              size={{
                xs: 12,

                md: 4,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,

                  borderRadius: 3,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Monthly Net
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={900}
                      color={
                        monthlyNetRevenue >= 0 ? "success.main" : "error.main"
                      }
                      mt={0.4}
                    >
                      {formatMoney(monthlyNetRevenue)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={`${expenseRatio.toFixed(1)}% expense ratio`}
                    color="warning"
                    variant="outlined"
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* MEMBERSHIP + AUTOMATION */}
      {/* ====================================================== */}

      <Grid container spacing={2.5} mb={3}>
        <Grid
          size={{
            xs: 12,

            lg: 5,
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
              <Stack direction="row" spacing={1.2} alignItems="center" mb={2}>
                <LibraryBooks color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Membership Health
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Active members, memberships and renewal risk.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={1.5}>
                <MetricCard
                  label="Active Members"
                  value={formatNumber(activeStudents)}
                />

                <MetricCard
                  label="Active Memberships"
                  value={formatNumber(activeSubscriptions)}
                />

                <MetricCard
                  label="Expiring in 7 Days"
                  value={formatNumber(expiringIn7Days)}
                />

                <MetricCard
                  label="Currently Inside"
                  value={formatNumber(membersInside)}
                />
              </Grid>

              {expiringIn7Days > 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    mt: 2,

                    borderRadius: 2.5,
                  }}
                >
                  {formatNumber(expiringIn7Days)} membership
                  {expiringIn7Days === 1 ? "" : "s"} may require renewal
                  follow-up.
                </Alert>
              )}

              <Button
                variant="outlined"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/owner/members")}
                sx={{
                  mt: 2,

                  textTransform: "none",

                  fontWeight: 800,

                  borderRadius: 2.5,
                }}
              >
                View Members
              </Button>
            </CardContent>
          </Card>
        </Grid>

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
                mb={2.2}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <BoltOutlined color="primary" />

                  <Box>
                    <Typography variant="h6" fontWeight={900}>
                      Automation Health
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Workflow availability and recent execution reliability.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/owner/automation")}
                  sx={{
                    textTransform: "none",

                    fontWeight: 800,

                    borderRadius: 2.5,
                  }}
                >
                  Automation Center
                </Button>
              </Stack>

              <Grid container spacing={1.5}>
                <MetricCard
                  label="Active Rules"
                  value={formatNumber(activeAutomationRules)}
                />

                <MetricCard
                  label="Inactive Rules"
                  value={formatNumber(inactiveAutomationRules)}
                />

                <MetricCard
                  label="Executions"
                  value={formatNumber(executionList.length)}
                />

                <MetricCard label="Reports" value={formatNumber(reportCount)} />
              </Grid>

              <Stack
                direction="row"
                justifyContent="space-between"
                mt={2.4}
                mb={0.8}
              >
                <Typography variant="body2" fontWeight={800}>
                  Execution success rate
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={900}
                  color={failedExecutions > 0 ? "warning.main" : "success.main"}
                >
                  {formatPercentage(automationSuccessRate)}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(
                  100,

                  Math.max(0, automationSuccessRate),
                )}
                color={failedExecutions > 0 ? "warning" : "success"}
                sx={{
                  height: 9,

                  borderRadius: 99,
                }}
              />

              <Stack
                direction="row"
                spacing={1}
                mt={1.6}
                flexWrap="wrap"
                useFlexGap
              >
                <Chip
                  size="small"
                  color="success"
                  label={`${successfulExecutions} successful`}
                />

                <Chip
                  size="small"
                  color="error"
                  label={`${failedExecutions} failed`}
                />

                <Chip
                  size="small"
                  color="info"
                  label={`${skippedExecutions} skipped`}
                />

                {processingExecutions > 0 && (
                  <Chip
                    size="small"
                    label={`${processingExecutions} processing`}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* ATTENTION + ACTIVITY */}
      {/* ====================================================== */}

      <Grid container spacing={2.5} mb={3}>
        <Grid
          size={{
            xs: 12,

            lg: 5,
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
                direction="row"
                justifyContent="space-between"
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Needs Attention
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Operational items that may require owner action.
                  </Typography>
                </Box>

                <Chip
                  label={formatNumber(attentionItems.length)}
                  color={attentionItems.length > 0 ? "warning" : "success"}
                  variant="outlined"
                />
              </Stack>

              {attentionItems.length > 0 ? (
                <Stack spacing={1.1}>
                  {attentionItems.slice(0, 6).map((item) => (
                    <Paper
                      key={item.key}
                      variant="outlined"
                      sx={{
                        p: 1.4,

                        borderRadius: 2.5,

                        borderColor:
                          item.severity === "error"
                            ? alpha(theme.palette.error.main, 0.25)
                            : item.severity === "warning"
                              ? alpha(theme.palette.warning.main, 0.25)
                              : "divider",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1.5}
                      >
                        <Stack
                          direction="row"
                          spacing={1.1}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 34,

                              height: 34,

                              borderRadius: 2,

                              display: "grid",

                              placeItems: "center",

                              color:
                                item.severity === "error"
                                  ? "error.main"
                                  : item.severity === "warning"
                                    ? "warning.main"
                                    : "info.main",
                            }}
                          >
                            {item.icon}
                          </Box>

                          <Typography variant="body2" fontWeight={750}>
                            {item.title}
                          </Typography>
                        </Stack>

                        {item.path && (
                          <Button
                            size="small"
                            onClick={() => navigate(item.path)}
                            sx={{
                              textTransform: "none",

                              fontWeight: 800,

                              flexShrink: 0,
                            }}
                          >
                            {item.action || "View"}
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    py: 4,

                    textAlign: "center",
                  }}
                >
                  <CheckCircleOutlineOutlined
                    color="success"
                    sx={{
                      fontSize: 42,
                    }}
                  />

                  <Typography fontWeight={850} mt={1}>
                    Everything looks good
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.4}>
                    No urgent operational items need attention right now.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

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
                p: 3,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
                mb={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Recent Activity
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Latest booking, payment and operational events.
                  </Typography>
                </Box>

                <History color="primary" />
              </Stack>

              {recentFeed.length > 0 ? (
                <Stack spacing={0}>
                  {recentFeed.map((item, index) => (
                    <Box key={item.key}>
                      <Stack
                        direction="row"
                        spacing={1.4}
                        alignItems="flex-start"
                        py={1.35}
                      >
                        <Box
                          sx={{
                            width: 38,

                            height: 38,

                            display: "grid",

                            placeItems: "center",

                            borderRadius: 2.2,

                            color: "primary.main",

                            bgcolor: alpha(theme.palette.primary.main, 0.075),

                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </Box>

                        <Box
                          sx={{
                            flex: 1,

                            minWidth: 0,
                          }}
                        >
                          <Stack
                            direction={{
                              xs: "column",

                              sm: "row",
                            }}
                            justifyContent="space-between"
                            spacing={0.6}
                          >
                            <Typography variant="body2" fontWeight={800}>
                              {item.title}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              flexShrink={0}
                            >
                              {formatDateTime(item.at)}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                            }}
                          >
                            {item.subtitle}
                          </Typography>
                        </Box>

                        {item.path && (
                          <Button
                            size="small"
                            onClick={() => navigate(item.path)}
                            sx={{
                              minWidth: 36,

                              px: 0.5,
                            }}
                          >
                            <ArrowForward fontSize="small" />
                          </Button>
                        )}
                      </Stack>

                      {index < recentFeed.length - 1 && <Divider />}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  py={4}
                  textAlign="center"
                >
                  No recent activity is available yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* QUICK ACTIONS */}
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
          <Stack direction="row" spacing={1.3} alignItems="center" mb={2.3}>
            <DashboardCustomizeOutlined color="primary" />

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Quick Actions
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Jump directly to the most common owner workflows.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={1.5}>
            {quickActions.map((action) => (
              <Grid
                key={action.label}
                size={{
                  xs: 12,

                  sm: 6,

                  lg: 4,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(action.path)}
                  sx={{
                    minHeight: 72,

                    px: 2,

                    justifyContent: "flex-start",

                    borderRadius: 3,

                    textTransform: "none",

                    borderColor: "divider",

                    color: "text.primary",

                    "& .MuiButton-startIcon": {
                      color: "primary.main",
                    },

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
                  <Box textAlign="left">
                    <Typography variant="body2" fontWeight={850}>
                      {action.label}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
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
// FINANCIAL METRIC
// ============================================================

function FinancialMetric({ label, value, tone = "primary", strong = false }) {
  const theme = useTheme();

  const toneColor =
    {
      primary: theme.palette.primary.main,

      success: theme.palette.success.main,

      warning: theme.palette.warning.main,

      error: theme.palette.error.main,

      info: theme.palette.info.main,
    }[tone] || theme.palette.primary.main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,

        borderRadius: 3,

        height: "100%",

        borderColor: alpha(toneColor, 0.16),

        background: `linear-gradient(
            145deg,
            ${alpha(toneColor, 0.055)},
            ${theme.palette.background.paper} 72%
          )`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant={strong ? "h5" : "h6"}
        fontWeight={strong ? 950 : 850}
        color={toneColor}
        sx={{
          mt: 0.5,

          letterSpacing: "-0.025em",
        }}
      >
        {value}
      </Typography>
    </Paper>
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

  // ==========================================================
  // STATE
  // ==========================================================

  const [context, setContext] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [revenueData, setRevenueData] = useState(null);

  // ==========================================================
  // LIBRARY PROFILE IMAGE
  // ==========================================================

  const [libraryProfileImageUrl, setLibraryProfileImageUrl] = useState("");

  const [automationSummary, setAutomationSummary] = useState({
    totalRules: 0,

    activeRules: 0,

    inactiveRules: 0,

    customRules: 0,
  });

  const [automationExecutions, setAutomationExecutions] = useState([]);

  const [generatedReports, setGeneratedReports] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DASHBOARD
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

        setRevenueData(null);

        setLibraryProfileImageUrl("");

        setAutomationExecutions([]);

        setGeneratedReports([]);

        return;
      }

      // ==================================================
      // SAVE SELECTED LIBRARY
      // ==================================================

      localStorage.setItem(
        "ownerSelectedLibraryId",
        String(ownerContext.libraryId),
      );

      const libraryId = ownerContext.libraryId;

      // ==================================================
      // NON-OPERATIONAL LIBRARY
      // ==========================================================

      if (!ownerContext?.operationalDashboardAvailable) {
        /*
         * Load library details independently so the
         * profile image remains available during setup.
         */

        try {
          const libraryDetails =
            await libraryApi.getOwnerLibraryDetails(libraryId);

          setLibraryProfileImageUrl(
            resolveLibraryProfileImageUrl(libraryDetails),
          );
        } catch (libraryProfileError) {
          console.warn(
            "Unable to load library profile image:",
            libraryProfileError,
          );

          setLibraryProfileImageUrl("");
        }

        setDashboard(null);

        setRevenueData(null);

        setAutomationExecutions([]);

        setGeneratedReports([]);

        return;
      }

      // ==================================================
      // INITIALIZE AUTOMATION RULES
      // ==========================================================

      try {
        await automationApi.getRules(libraryId);
      } catch (automationInitError) {
        console.warn(
          "Unable to initialize dashboard automation rules:",
          automationInitError,
        );
      }

      // ==================================================
      // LOAD OPERATIONAL DASHBOARD DATA
      // ==========================================================

      const [
        dashboardResult,
        revenueResult,
        automationSummaryResult,
        automationExecutionResult,
        generatedReportResult,
        libraryDetailsResult,
      ] = await Promise.allSettled([
        ownerDashboardApi.getDashboard(libraryId),

        libraryRevenueApi.getRevenue(libraryId, 30),

        automationApi.getSummary(libraryId),

        automationApi.getExecutions(libraryId),

        automationApi.getGeneratedReports(libraryId),

        libraryApi.getOwnerLibraryDetails(libraryId),
      ]);

      // ==================================================
      // DASHBOARD IS REQUIRED
      // ==========================================================

      if (dashboardResult.status !== "fulfilled") {
        throw dashboardResult.reason;
      }

      setDashboard(dashboardResult.value ?? null);

      // ==================================================
      // PROFILE IMAGE
      // ==========================================================

      if (libraryDetailsResult.status === "fulfilled") {
        setLibraryProfileImageUrl(
          resolveLibraryProfileImageUrl(libraryDetailsResult.value),
        );
      } else {
        console.warn(
          "Unable to load library profile image:",
          libraryDetailsResult.reason,
        );

        setLibraryProfileImageUrl("");
      }

      // ==================================================
      // REVENUE
      // ==========================================================

      setRevenueData(
        revenueResult.status === "fulfilled"
          ? (revenueResult.value ?? null)
          : null,
      );

      // ==================================================
      // AUTOMATION SUMMARY
      // ==========================================================

      setAutomationSummary(
        automationSummaryResult.status === "fulfilled"
          ? {
              totalRules: Number(
                automationSummaryResult.value?.totalRules ?? 0,
              ),

              activeRules: Number(
                automationSummaryResult.value?.activeRules ?? 0,
              ),

              inactiveRules: Number(
                automationSummaryResult.value?.inactiveRules ?? 0,
              ),

              customRules: Number(
                automationSummaryResult.value?.customRules ?? 0,
              ),
            }
          : {
              totalRules: 0,

              activeRules: 0,

              inactiveRules: 0,

              customRules: 0,
            },
      );

      // ==================================================
      // AUTOMATION EXECUTIONS
      // ==========================================================

      setAutomationExecutions(
        automationExecutionResult.status === "fulfilled" &&
          Array.isArray(automationExecutionResult.value)
          ? automationExecutionResult.value
          : [],
      );

      // ==================================================
      // GENERATED REPORTS
      // ==========================================================

      setGeneratedReports(
        generatedReportResult.status === "fulfilled" &&
          Array.isArray(generatedReportResult.value)
          ? generatedReportResult.value
          : [],
      );
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
        revenueData={revenueData}
        automationSummary={automationSummary}
        automationExecutions={automationExecutions}
        generatedReports={generatedReports}
        libraryProfileImageUrl={libraryProfileImageUrl}
        navigate={navigate}
      />
    );
  }

  // ==========================================================
  // UNKNOWN STATE
  // ==========================================================

  return (
    <DashboardError
      message="Unable to determine dashboard state."
      onRetry={loadDashboard}
    />
  );
}

export default OwnerDashboard;
