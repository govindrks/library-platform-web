import {
  AnalyticsOutlined,
  ArrowBack,
  ArrowForward,
  AutoAwesomeOutlined,
  CampaignOutlined,
  EventSeatOutlined,
  GroupsOutlined,
  InsightsOutlined,
  NotificationsActiveOutlined,
  PaymentsOutlined,
  QrCode2Outlined,
  ScheduleOutlined,
  ShieldOutlined,
  SpaceDashboardOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";
import usePlatformConfig from "../../api/usePlatformConfig";


// ============================================================
// OWNER FEATURE SLIDES
// ============================================================

const OWNER_FEATURE_SLIDES = [
  {
    id: "dashboard",
    eyebrow: "SMART OPERATIONS",
    title: "Run your entire library from one dashboard.",
    description:
      "See seats, members, bookings, payments and important activity from one powerful workspace.",
    icon: SpaceDashboardOutlined,
    accentLabel: "Owner Dashboard",
    highlights: [
      {
        icon: EventSeatOutlined,
        title: "Live Seat Overview",
        description:
          "See available, occupied and inactive seats instantly.",
      },
      {
        icon: GroupsOutlined,
        title: "Active Members",
        description:
          "Track current members, subscriptions and attendance.",
      },
      {
        icon: InsightsOutlined,
        title: "Business Insights",
        description:
          "Understand occupancy, revenue and library performance.",
      },
    ],
  },

  {
    id: "seats",
    eyebrow: "SEAT MANAGEMENT",
    title: "Design your library exactly the way it exists.",
    description:
      "Create floors, rows, seats and blank spaces visually while keeping complete control over seat numbering and configuration.",
    icon: EventSeatOutlined,
    accentLabel: "Visual Seat Mapping",
    highlights: [
      {
        icon: EventSeatOutlined,
        title: "Dynamic Seat Layout",
        description:
          "Create rows, columns, spaces and custom seat positions.",
      },
      {
        icon: ScheduleOutlined,
        title: "Seat Availability",
        description:
          "Control physical seat status and slot-based availability.",
      },
      {
        icon: WorkspacePremiumOutlined,
        title: "Seat Categories",
        description:
          "Configure normal, premium and feature-based seating.",
      },
    ],
  },

  {
    id: "members",
    eyebrow: "MEMBER MANAGEMENT",
    title: "Manage every member from joining to renewal.",
    description:
      "Keep member profiles, seat assignments, membership plans and renewals organized in one place.",
    icon: GroupsOutlined,
    accentLabel: "Member Management",
    highlights: [
      {
        icon: GroupsOutlined,
        title: "Member Profiles",
        description:
          "Maintain member contact and membership information.",
      },
      {
        icon: WorkspacePremiumOutlined,
        title: "Membership Plans",
        description:
          "Create flexible daily, monthly or custom plans.",
      },
      {
        icon: EventSeatOutlined,
        title: "Seat Assignment",
        description:
          "Assign and transfer seats without losing history.",
      },
    ],
  },

  {
    id: "booking",
    eyebrow: "BOOKING & SLOTS",
    title: "Let students discover and reserve available seats.",
    description:
      "Configure booking slots and let students see live seat availability before they choose where to study.",
    icon: ScheduleOutlined,
    accentLabel: "Online Booking",
    highlights: [
      {
        icon: ScheduleOutlined,
        title: "Flexible Slots",
        description:
          "Create library-specific operating and booking slots.",
      },
      {
        icon: EventSeatOutlined,
        title: "Live Availability",
        description:
          "Show seats based on floor, date and selected slot.",
      },
      {
        icon: ShieldOutlined,
        title: "Controlled Booking",
        description:
          "Keep seat availability and booking rules synchronized.",
      },
    ],
  },

  {
    id: "payments",
    eyebrow: "PAYMENTS & REVENUE",
    title: "Track every payment without losing visibility.",
    description:
      "Manage online and offline payments, membership collections, receipts and revenue reporting from one system.",
    icon: PaymentsOutlined,
    accentLabel: "Payments & Billing",
    highlights: [
      {
        icon: PaymentsOutlined,
        title: "Payment Tracking",
        description:
          "Track successful, pending and failed transactions.",
      },
      {
        icon: WorkspacePremiumOutlined,
        title: "Membership Payments",
        description:
          "Connect payments directly with memberships.",
      },
      {
        icon: AnalyticsOutlined,
        title: "Revenue Reports",
        description:
          "See daily, monthly and overall collection performance.",
      },
    ],
  },

  {
    id: "automation",
    eyebrow: "AUTOMATION",
    title: "Automate repetitive library operations.",
    description:
      "Use reminders, notifications and scheduled rules so your team spends less time on repetitive operational work.",
    icon: AutoAwesomeOutlined,
    accentLabel: "Automation Center",
    highlights: [
      {
        icon: NotificationsActiveOutlined,
        title: "Smart Notifications",
        description:
          "Send important booking, payment and membership updates.",
      },
      {
        icon: AutoAwesomeOutlined,
        title: "Automation Rules",
        description:
          "Configure operational rules for your library.",
      },
      {
        icon: ScheduleOutlined,
        title: "Scheduled Actions",
        description:
          "Run recurring workflows without manual follow-up.",
      },
    ],
  },

  {
    id: "communication",
    eyebrow: "COMMUNICATION",
    title: "Keep members informed through familiar channels.",
    description:
      "{platformName} is designed to support secure WhatsApp OTP, payment confirmations and important library notifications.",
    icon: CampaignOutlined,
    accentLabel: "Member Communication",
    highlights: [
      {
        icon: ShieldOutlined,
        title: "Secure OTP",
        description:
          "Support secure mobile verification and sign-in.",
      },
      {
        icon: NotificationsActiveOutlined,
        title: "Payment Confirmation",
        description:
          "Send important transaction confirmation messages.",
      },
      {
        icon: CampaignOutlined,
        title: "Member Updates",
        description:
          "Keep communication connected with library operations.",
      },
    ],
  },

  {
    id: "growth",
    eyebrow: "DISCOVERY & GROWTH",
    title: "Make your library easier to discover and join.",
    description:
      "Build a professional public library profile with your images, amenities, membership plans, availability and QR-based discovery.",
    icon: QrCode2Outlined,
    accentLabel: "Public Library Profile",
    highlights: [
      {
        icon: QrCode2Outlined,
        title: "Library QR",
        description:
          "Generate QR access to your public library profile.",
      },
      {
        icon: WorkspacePremiumOutlined,
        title: "Plans & Amenities",
        description:
          "Show what your library offers before students visit.",
      },
      {
        icon: InsightsOutlined,
        title: "Better Discovery",
        description:
          "Help students find the right study space faster.",
      },
    ],
  },
];


// ============================================================
// LIBRARY OWNER FEATURES
// ============================================================

function LibraryOwnerFeatures() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeSlide = OWNER_FEATURE_SLIDES[activeIndex];
  const ActiveIcon = activeSlide.icon;

  const { platformName } = usePlatformConfig();

  // ==========================================================
  // AUTO SLIDE
  // ==========================================================

  useEffect(() => {
    if (paused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex(
        (previous) =>
          (previous + 1) % OWNER_FEATURE_SLIDES.length,
      );
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [paused]);

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress = useMemo(
    () =>
      ((activeIndex + 1) / OWNER_FEATURE_SLIDES.length) * 100,
    [activeIndex],
  );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handlePrevious = () => {
    setActiveIndex((previous) =>
      previous === 0
        ? OWNER_FEATURE_SLIDES.length - 1
        : previous - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex(
      (previous) =>
        (previous + 1) % OWNER_FEATURE_SLIDES.length,
    );
  };

  const handleContinue = () => {
    navigate("/register-library/start");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 80px)",
        bgcolor: "#F6F7FF",
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* ================================================== */}
        {/* INTRO */}
        {/* ================================================== */}

        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{
            mb: {
              xs: 3,
              md: 4,
            },
          }}
        >
          <Chip
            label="{platformName} FOR OWNERS"
            size="small"
            sx={{
              fontWeight: 850,
              letterSpacing: 0.9,
              bgcolor: alpha(
                theme.palette.primary.main,
                0.08,
              ),
              color: "primary.main",
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.045em",
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
            }}
          >
            Everything you need to run your library better.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 760,
              lineHeight: 1.75,
            }}
          >
            Before you create your library, take a quick look at
            the tools {platformName} gives you to manage operations,
            members and growth.
          </Typography>
        </Stack>

        {/* ================================================== */}
        {/* FEATURE SLIDER */}
        {/* ================================================== */}

        <Paper
          elevation={0}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: {
              xs: 4,
              md: 6,
            },
            border: "1px solid",
            borderColor: alpha(
              theme.palette.primary.main,
              0.12,
            ),
            boxShadow:
              "0 28px 80px rgba(39,42,120,0.12)",
            background:
              "linear-gradient(135deg, #231F72 0%, #4E46E5 52%, #2563EB 100%)",
            color: "#fff",
            minHeight: {
              xs: 650,
              md: 510,
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              right: -90,
              top: -110,
              bgcolor: "rgba(255,255,255,0.07)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: "50%",
              right: 100,
              bottom: -120,
              bgcolor: "rgba(255,255,255,0.05)",
            }}
          />

          <Grid
            container
            sx={{
              minHeight: {
                md: 510,
              },
            }}
          >
            {/* ============================================== */}
            {/* LEFT */}
            {/* ============================================== */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack
                justifyContent="center"
                sx={{
                  height: "100%",
                  px: {
                    xs: 3,
                    sm: 5,
                    md: 7,
                  },
                  py: {
                    xs: 5,
                    md: 6,
                  },
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Chip
                  label={activeSlide.eyebrow}
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    mb: 2.5,
                    bgcolor: "rgba(255,255,255,0.13)",
                    color: "#fff",
                    border:
                      "1px solid rgba(255,255,255,0.17)",
                    fontWeight: 850,
                    letterSpacing: 0.8,
                  }}
                />

                <Typography
                  key={`${activeSlide.id}-title`}
                  variant="h2"
                  sx={{
                    maxWidth: 650,
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                    fontSize: {
                      xs: "2.25rem",
                      md: "3.35rem",
                    },
                    lineHeight: 1.04,
                    animation:
                      "featureTextFade .4s ease",
                    "@keyframes featureTextFade": {
                      from: {
                        opacity: 0,
                        transform: "translateY(8px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  {activeSlide.title}
                </Typography>

                <Typography
                  key={`${activeSlide.id}-description`}
                  sx={{
                    mt: 2.25,
                    maxWidth: 640,
                    color:
                      "rgba(255,255,255,0.82)",
                    lineHeight: 1.8,
                    fontSize: {
                      xs: "0.98rem",
                      md: "1.08rem",
                    },
                  }}
                >
                  {activeSlide.description}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.2}
                  sx={{
                    mt: 4,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor:
                        "rgba(255,255,255,0.12)",
                    }}
                  >
                    <ActiveIcon />
                  </Box>

                  <Typography fontWeight={800}>
                    {activeSlide.accentLabel}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* ============================================== */}
            {/* RIGHT */}
            {/* ============================================== */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Stack
                spacing={1.5}
                justifyContent="center"
                sx={{
                  height: "100%",
                  px: {
                    xs: 3,
                    sm: 5,
                    md: 6,
                  },
                  pb: {
                    xs: 5,
                    md: 6,
                  },
                  pt: {
                    xs: 0,
                    md: 6,
                  },
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {activeSlide.highlights.map(
                  (feature, index) => {
                    const FeatureIcon = feature.icon;

                    return (
                      <Paper
                        key={`${activeSlide.id}-${feature.title}`}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor:
                            "rgba(255,255,255,0.11)",
                          border:
                            "1px solid rgba(255,255,255,0.14)",
                          backdropFilter:
                            "blur(10px)",
                          color: "#fff",
                          animation:
                            `featureCardIn .42s ease ${
                              index * 0.06
                            }s both`,
                          "@keyframes featureCardIn": {
                            from: {
                              opacity: 0,
                              transform:
                                "translateX(15px)",
                            },
                            to: {
                              opacity: 1,
                              transform:
                                "translateX(0)",
                            },
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              flexShrink: 0,
                              borderRadius: 2.4,
                              display: "grid",
                              placeItems: "center",
                              bgcolor:
                                "rgba(255,255,255,0.12)",
                            }}
                          >
                            <FeatureIcon />
                          </Box>

                          <Box>
                            <Typography fontWeight={850}>
                              {feature.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.4,
                                color:
                                  "rgba(255,255,255,0.72)",
                                lineHeight: 1.6,
                              }}
                            >
                              {feature.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  },
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* ============================================== */}
          {/* ARROWS */}
          {/* ============================================== */}

          <IconButton
            aria-label="Previous feature"
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.92)",
              color: "primary.main",
              zIndex: 4,
              display: {
                xs: "none",
                md: "inline-flex",
              },
              "&:hover": {
                bgcolor: "#fff",
              },
            }}
          >
            <ArrowBack />
          </IconButton>

          <IconButton
            aria-label="Next feature"
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 18,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.92)",
              color: "primary.main",
              zIndex: 4,
              display: {
                xs: "none",
                md: "inline-flex",
              },
              "&:hover": {
                bgcolor: "#fff",
              },
            }}
          >
            <ArrowForward />
          </IconButton>
        </Paper>

        {/* ================================================== */}
        {/* SLIDE CONTROLS */}
        {/* ================================================== */}

        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            mt: 3,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
          >
            {OWNER_FEATURE_SLIDES.map(
              (slide, index) => (
                <Box
                  key={slide.id}
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  sx={{
                    width:
                      activeIndex === index
                        ? 28
                        : 9,
                    height: 9,
                    borderRadius: 10,
                    bgcolor:
                      activeIndex === index
                        ? "primary.main"
                        : alpha(
                            theme.palette.primary.main,
                            0.18,
                          ),
                    cursor: "pointer",
                    transition:
                      "all 0.25s ease",
                  }}
                />
              ),
            )}
          </Stack>

          <Box
            sx={{
              width: {
                xs: "100%",
                sm: 360,
              },
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5,
                borderRadius: 10,
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.08,
                ),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 10,
                },
              }}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
          >
            {activeIndex + 1} of{" "}
            {OWNER_FEATURE_SLIDES.length}
          </Typography>
        </Stack>

        {/* ================================================== */}
        {/* CONTINUE */}
        {/* ================================================== */}

        <Stack
          alignItems="center"
          sx={{
            mt: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={handleContinue}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 260,
              },
              minHeight: 56,
              borderRadius: 3,
              px: 4,
              fontSize: "1rem",
              fontWeight: 850,
              textTransform: "none",
              boxShadow:
                "0 14px 35px rgba(79,70,229,0.25)",
            }}
          >
            Let's Continue
          </Button>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 1.5,
            }}
          >
            Registration takes only a few guided steps.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}


export default LibraryOwnerFeatures;
