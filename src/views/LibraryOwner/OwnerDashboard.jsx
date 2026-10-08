import {
  AccessTime,
  ArrowForward,
  CheckCircleOutlineOutlined,
  EventSeat,
  Groups,
  LibraryBooks,
  Payments,
  RadioButtonUnchecked,
  Settings,
  TrendingUp,
} from "@mui/icons-material";

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
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import ownerDashboardApi from "../../api/ownerDashboardApi";

// ============================================================
// TEMPORARY ACTIVE DASHBOARD MOCK DATA
// ============================================================
//
// These values are intentionally retained from the existing
// OwnerDashboard.
//
// Once the owner-context flow is working correctly, these will
// be replaced by DashboardResponse from the backend.
// ============================================================

const stats = [
  {
    title: "Total Seats",
    value: "120",
    subtitle: "Configured seats",
    icon: <EventSeat />,
  },
  {
    title: "Available Seats",
    value: "84",
    subtitle: "70% available",
    icon: <LibraryBooks />,
  },
  {
    title: "Today's Bookings",
    value: "36",
    subtitle: "12 upcoming",
    icon: <Groups />,
  },
  {
    title: "Today's Revenue",
    value: "₹8,450",
    subtitle: "+12.5% from yesterday",
    icon: <Payments />,
  },
];

const recentBookings = [
  {
    id: "#BK1001",
    member: "Rahul Kumar",
    seat: "A-12",
    plan: "Monthly",
    time: "09:00 AM",
    status: "Confirmed",
  },
  {
    id: "#BK1002",
    member: "Amit Singh",
    seat: "B-04",
    plan: "Daily Pass",
    time: "10:30 AM",
    status: "Confirmed",
  },
  {
    id: "#BK1003",
    member: "Priya Sharma",
    seat: "C-08",
    plan: "Monthly",
    time: "12:00 PM",
    status: "Upcoming",
  },
  {
    id: "#BK1004",
    member: "Ankit Raj",
    seat: "A-18",
    plan: "Quarterly",
    time: "02:30 PM",
    status: "Confirmed",
  },
];

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
// STAT CARD
// ============================================================

function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.75}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.light",
              color: "primary.main",
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
  return (
    <Box
      sx={{
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack alignItems="center" spacing={2}>
        <CircularProgress />

        <Typography color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================================
// DASHBOARD ERROR
// ============================================================

function DashboardError({ message, onRetry }) {
  return (
    <Box>
      <Alert severity="error" sx={{ mb: 2 }}>
        {message}
      </Alert>

      <Button variant="contained" onClick={onRetry}>
        Try Again
      </Button>
    </Box>
  );
}

// ============================================================
// SETUP PROGRESS
// ============================================================

function SetupProgress({ onboardingStep }) {
  const currentIndex = onboardingOrder[onboardingStep] ?? 1;

  const progress = Math.min(
    100,
    Math.round((currentIndex / onboardingSteps.length) * 100),
  );

  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Setup Progress
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Complete the remaining steps to activate your library.
            </Typography>
          </Box>

          <Typography fontWeight={700} color="primary.main">
            {progress}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 3,
          }}
        />

        <Stack spacing={1.5}>
          {onboardingSteps.map((step, index) => {
            const stepPosition = index;

            const completed =
              step.key === "OWNER_ACCOUNT" || stepPosition < currentIndex;

            const current = step.key === onboardingStep;

            return (
              <Stack
                key={step.key}
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                {completed ? (
                  <CheckCircleOutlineOutlined color="success" fontSize="small" />
                ) : (
                  <RadioButtonUnchecked
                    color={current ? "primary" : "disabled"}
                    fontSize="small"
                  />
                )}

                <Typography
                  variant="body2"
                  fontWeight={current ? 700 : 400}
                  color={current ? "primary.main" : "text.primary"}
                >
                  {step.label}

                  {current && " — Current Step"}
                </Typography>
              </Stack>
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
  return (
    <Box>
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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back
            {context?.ownerName ? `, ${context.ownerName}` : ""}
            👋
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Your Library Owner account is ready.
          </Typography>
        </Box>

        <Chip label="Setup Required" color="warning" variant="outlined" />
      </Stack>

      <Alert severity="info" sx={{ mb: 3 }}>
        Complete your library setup before operational features such as
        bookings, members and payments become available.
      </Alert>

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h5" fontWeight={700} mb={1}>
                Complete Your Library Setup
              </Typography>

              <Typography color="text.secondary" mb={3}>
                Start by adding your library details. Your progress will be
                saved as you complete each step.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/register-library")}
                >
                  Continue Guided Setup
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => navigate("/owner/library")}
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
  const currentStepLabel =
    onboardingSteps.find((step) => step.key === context?.onboardingStep)
      ?.label || "Library Setup";

  return (
    <Box>
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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {context?.libraryName || "Your Library"}
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Continue configuring your library.
          </Typography>
        </Box>

        <Chip
          label={context?.libraryStatus || "DRAFT"}
          color="warning"
          variant="outlined"
        />
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Your library is currently in DRAFT status. Setup and configuration pages
        remain available, but operational features will become available after
        activation.
      </Alert>

      <Grid container spacing={3} mb={3}>
        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                CURRENT STEP
              </Typography>

              <Typography variant="h5" fontWeight={700} mt={0.5} mb={1}>
                {currentStepLabel}
              </Typography>

              <Typography color="text.secondary" mb={3}>
                Continue from where you stopped, or configure your library
                directly using the dashboard options.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.5}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/register-library")}
                >
                  Continue Guided Setup
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate("/owner/library")}
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

      {/* Direct Configuration */}

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={0.5}>
            Library Configuration
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2.5}>
            You can configure these sections directly from your dashboard.
          </Typography>

          <Grid container spacing={1.5}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/library")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Library Details
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/amenities")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Amenities
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/seat-mapping")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Seat Mapping
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/slots")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Slots
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/membership-plans")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Membership Plans
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/owner/subscription")}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.3,
                }}
              >
                Subscription & Billing
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

// ============================================================
// ACTIVE / OPERATIONAL DASHBOARD
// ============================================================

function OperationalOwnerDashboard({ context, navigate }) {
  // ---------------------------------------------------------
  // Temporary values retained from existing dashboard.
  // Backend dashboard data will replace these next.
  // ---------------------------------------------------------

  const occupiedSeats = 36;
  const totalSeats = 120;

  const occupancy =
    totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  return (
    <Box>
      {/* ==================================================
                PAGE HEADER
            ================================================== */}

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Welcome back
            {context?.ownerName ? `, ${context.ownerName}` : ""}
            👋
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Manage your library and monitor today's activity.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/owner/library")}>
            Library Profile
          </Button>

          <Button
            variant="contained"
            onClick={() => navigate("/owner/seat-mapping")}
          >
            Manage Seats
          </Button>
        </Stack>
      </Stack>

      {/* ==================================================
                LIBRARY SUMMARY
            ================================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
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
              <Typography variant="h6" fontWeight={700}>
                {context?.libraryName || "Your Library"}
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Library ID: {context?.libraryId}
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

      {/* ==================================================
                STATS
            ================================================== */}

      <Grid container spacing={2} mb={3}>
        {stats.map((stat) => (
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

      {/* ==================================================
                ANALYTICS
            ================================================== */}

      <Grid container spacing={2} mb={3}>
        {/* OCCUPANCY */}

        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Today's Occupancy
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Current seat utilization
                  </Typography>
                </Box>

                <Typography variant="h5" fontWeight={700} color="primary">
                  {occupancy}%
                </Typography>
              </Stack>

              <Box mb={3}>
                <LinearProgress
                  variant="determinate"
                  value={occupancy}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                  }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    120
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Occupied
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    36
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    84
                  </Typography>
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    sm: 3,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Peak Time
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    6–9 PM
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* QUICK ACTIONS */}

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Card
            sx={{
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Quick Actions
              </Typography>

              <Stack spacing={1.2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventSeat />}
                  onClick={() => navigate("/owner/seat-mapping")}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.2,
                  }}
                >
                  Configure Seat Mapping
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccessTime />}
                  onClick={() => navigate("/owner/slots")}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.2,
                  }}
                >
                  Manage Slots
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Payments />}
                  onClick={() => navigate("/owner/payments")}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.2,
                  }}
                >
                  View Payments
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUp />}
                  onClick={() => navigate("/owner/reports")}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1.2,
                  }}
                >
                  View Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ==================================================
                RECENT BOOKINGS
            ================================================== */}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Recent Bookings
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Latest reservations in your library
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate("/owner/bookings")}
            >
              View All
            </Button>
          </Box>

          <Divider />

          <Box
            sx={{
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                minWidth: 800,
              }}
            >
              {recentBookings.map((booking, index) => (
                <Box key={booking.id}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1.5fr 1fr 1fr 1.2fr 1fr",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {booking.id}
                    </Typography>

                    <Box>
                      <Typography variant="body2">{booking.member}</Typography>
                    </Box>

                    <Typography variant="body2">{booking.seat}</Typography>

                    <Typography variant="body2">{booking.plan}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {booking.time}
                    </Typography>

                    <Chip
                      label={booking.status}
                      size="small"
                      color={
                        booking.status === "Confirmed" ? "success" : "info"
                      }
                      variant="outlined"
                    />
                  </Box>

                  {index < recentBookings.length - 1 && <Divider />}
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
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

  // ========================================================
  // LOAD OWNER DASHBOARD
  // ========================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------
      // 1. Load authenticated Library Owner context
      // ------------------------------------------------

      const ownerContext = await ownerDashboardApi.getContext();

      setContext(ownerContext);

      // ------------------------------------------------
      // 2. No library exists yet
      // ------------------------------------------------

      if (!ownerContext?.libraryId) {
        setDashboard(null);

        return;
      }

      // ------------------------------------------------
      // 3. Library exists but is not ACTIVE
      // ------------------------------------------------

      if (!ownerContext?.operationalDashboardAvailable) {
        setDashboard(null);

        return;
      }

      // ------------------------------------------------
      // 4. ACTIVE library
      //
      // Load actual dashboard response now.
      // We store it already even though the current
      // operational UI still contains some mock values.
      // ------------------------------------------------

      const dashboardData = await ownerDashboardApi.getDashboard(
        ownerContext.libraryId,
      );

      setDashboard(dashboardData);
    } catch (err) {
      console.error("Failed to load owner dashboard:", err);

      setError(
        err?.response?.data?.message || "Unable to load your dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ========================================================
  // DASHBOARD STATE
  // ========================================================

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

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return <DashboardLoading />;
  }

  // ========================================================
  // ERROR
  // ========================================================

  if (error) {
    return <DashboardError message={error} onRetry={loadDashboard} />;
  }

  // ========================================================
  // OWNER HAS NO LIBRARY
  // ========================================================

  if (dashboardState === "NO_LIBRARY") {
    return <NoLibrarySetup context={context} navigate={navigate} />;
  }

  // ========================================================
  // OWNER HAS DRAFT / INCOMPLETE LIBRARY
  // ========================================================

  if (dashboardState === "SETUP") {
    return <DraftLibrarySetup context={context} navigate={navigate} />;
  }

  // ========================================================
  // ACTIVE LIBRARY
  // ========================================================

  if (dashboardState === "ACTIVE") {
    return (
      <OperationalOwnerDashboard
        context={context}
        dashboard={dashboard}
        navigate={navigate}
      />
    );
  }

  // ========================================================
  // FALLBACK
  // ========================================================

  return (
    <DashboardError
      message="Unable to determine dashboard state."
      onRetry={loadDashboard}
    />
  );
}

export default OwnerDashboard;
