import {
  AccountCircleOutlined,
  AnalyticsOutlined,
  ArrowForward,
  AutoAwesomeOutlined,
  BookOutlined,
  CreditCardOutlined,
  EventSeatOutlined,
  ExpandMore,
  GroupsOutlined,
  HelpOutlineOutlined,
  LibraryBooksOutlined,
  ManageAccountsOutlined,
  PaymentsOutlined,
  QrCode2Outlined,
  Search,
  SettingsOutlined,
  SupportAgentOutlined,
  TuneOutlined,
} from "@mui/icons-material";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


// ============================================================
// DOCUMENTATION DATA
// ============================================================

const DOC_CATEGORIES = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Understand the LibraryHub owner workspace and essential setup flow.",
    icon: LibraryBooksOutlined,
    articles: [
      "Owner dashboard overview",
      "Complete your library profile",
      "Configure amenities",
      "Understand library status",
    ],
  },
  {
    id: "members",
    title: "Members",
    description:
      "Manage member records, memberships and seat assignments.",
    icon: GroupsOutlined,
    articles: [
      "Add and manage members",
      "Assign memberships",
      "Transfer member seats",
      "View member activity",
    ],
  },
  {
    id: "seats",
    title: "Seats & Layout",
    description:
      "Configure floors, seats, availability and booking slots.",
    icon: EventSeatOutlined,
    articles: [
      "Create a floor layout",
      "Configure seat numbering",
      "Manage seat availability",
      "Create booking slots",
    ],
  },
  {
    id: "plans",
    title: "Membership Plans",
    description:
      "Create pricing plans and control what students can purchase.",
    icon: ManageAccountsOutlined,
    articles: [
      "Create a membership plan",
      "Configure plan duration",
      "Set seat-based pricing",
      "Activate or disable a plan",
    ],
  },
  {
    id: "bookings",
    title: "Bookings",
    description:
      "Understand booking creation, seat allocation and status handling.",
    icon: BookOutlined,
    articles: [
      "Create a booking",
      "Manage active bookings",
      "Handle seat-change requests",
      "Cancel or update a booking",
    ],
  },
  {
    id: "payments",
    title: "Payments & Revenue",
    description:
      "Track collections, payment statuses and revenue.",
    icon: PaymentsOutlined,
    articles: [
      "Record offline payments",
      "Understand online payments",
      "View payment status",
      "Track revenue and refunds",
    ],
  },
  {
    id: "automation",
    title: "Automation",
    description:
      "Use reminders, notifications and scheduled operational rules.",
    icon: AutoAwesomeOutlined,
    articles: [
      "Create an automation rule",
      "Subscription reminders",
      "Payment notifications",
      "Review automation history",
    ],
  },
  {
    id: "profile",
    title: "Public Profile & QR",
    description:
      "Control how students discover and view your library.",
    icon: QrCode2Outlined,
    articles: [
      "Manage profile and cover images",
      "Publish gallery images",
      "Generate your library QR",
      "Review your public profile",
    ],
  },
  {
    id: "settings",
    title: "Settings",
    description:
      "Manage owner preferences, security and operational configuration.",
    icon: SettingsOutlined,
    articles: [
      "Library settings overview",
      "Notification preferences",
      "Security and account access",
      "Platform subscription settings",
    ],
  },
];

const FAQS = [
  {
    question: "How do I change a seat number without moving the seat?",
    answer:
      "Use Seat Mapping and edit the seat number. Seat number and physical row/column position are independent in LibraryHub.",
  },
  {
    question: "Can I create more than one floor?",
    answer:
      "Yes. Each library can have multiple floors, and each floor can maintain its own layout configuration, seats and blank spaces.",
  },
  {
    question: "How do I update my public library information?",
    answer:
      "Open Library Profile from the owner sidebar. You can update library information, profile image, cover image and public gallery content there.",
  },
  {
    question: "Can I change membership plan pricing later?",
    answer:
      "Yes. Membership plans can be updated by the library owner. Existing subscriptions should continue to use their persisted subscription/payment records.",
  },
  {
    question: "What happens when a member requests a seat change?",
    answer:
      "The request appears in Seat Change Requests. The owner can review the current seat, requested seat and reason before approving or rejecting it.",
  },
  {
    question: "Where can I review failed or pending payments?",
    answer:
      "Use the Payments area and dashboard financial summaries to review transaction status and follow-up items.",
  },
];


// ============================================================
// COMPONENT
// ============================================================

function OwnerHelpDocumentation() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedQuery) {
      return DOC_CATEGORIES;
    }

    return DOC_CATEGORIES.filter((category) => {
      const categoryMatch =
        category.title.toLowerCase().includes(normalizedQuery) ||
        category.description.toLowerCase().includes(normalizedQuery);

      const articleMatch = category.articles.some((article) =>
        article.toLowerCase().includes(normalizedQuery),
      );

      return categoryMatch || articleMatch;
    });
  }, [normalizedQuery]);

  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) {
      return FAQS;
    }

    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: "#F7F8FC",
        py: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            p: {
              xs: 3,
              md: 4,
            },
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(
              theme.palette.primary.main,
              0.12,
            ),
            background:
              "linear-gradient(135deg, #312E81 0%, #4F46E5 56%, #2563EB 100%)",
            color: "#FFFFFF",
            boxShadow:
              "0 20px 60px rgba(79,70,229,0.14)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 230,
              height: 230,
              borderRadius: "50%",
              right: -70,
              top: -100,
              bgcolor: "rgba(255,255,255,.07)",
            }}
          />

          <Stack
            spacing={1.5}
            sx={{
              position: "relative",
              zIndex: 1,
              maxWidth: 820,
            }}
          >
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.4,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,255,255,.14)",
                  border:
                    "1px solid rgba(255,255,255,.16)",
                }}
              >
                <HelpOutlineOutlined />
              </Box>

              <Chip
                label="OWNER HELP CENTER"
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,.13)",
                  color: "#FFFFFF",
                  fontWeight: 850,
                  letterSpacing: 0.7,
                }}
              />
            </Stack>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.04em",
                fontSize: {
                  xs: "2rem",
                  md: "2.8rem",
                },
              }}
            >
              Help & Documentation
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,.78)",
                lineHeight: 1.75,
                maxWidth: 720,
              }}
            >
              Learn how to manage your library, seats, members,
              bookings, payments and LibraryHub settings.
            </Typography>

            <TextField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help articles, features or common questions..."
              fullWidth
              sx={{
                mt: 1,
                maxWidth: 720,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#FFFFFF",
                  borderRadius: 2.5,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Paper>

        {/* ================================================== */}
        {/* QUICK ACTIONS */}
        {/* ================================================== */}

        <Grid
          container
          spacing={2}
          sx={{ mt: 0.5 }}
        >
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.4}>
                <TuneOutlined color="primary" />

                <Box>
                  <Typography fontWeight={850}>
                    Setup guides
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.4 }}
                  >
                    Review the most important operational setup steps.
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() =>
                      navigate("/owner/library-profile")
                    }
                    sx={{
                      mt: 1,
                      px: 0,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Open library profile
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.4}>
                <AccountCircleOutlined color="primary" />

                <Box>
                  <Typography fontWeight={850}>
                    Account & settings
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.4 }}
                  >
                    Manage owner preferences and library configuration.
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() =>
                      navigate("/owner/settings")
                    }
                    sx={{
                      mt: 1,
                      px: 0,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    Open settings
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.4}>
                <SupportAgentOutlined color="primary" />

                <Box>
                  <Typography fontWeight={850}>
                    Still need assistance?
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.4 }}
                  >
                    Review FAQs and troubleshooting below before contacting support.
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() => {
                      document
                        .getElementById("owner-help-faq")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    sx={{
                      mt: 1,
                      px: 0,
                      textTransform: "none",
                      fontWeight: 800,
                    }}
                  >
                    View FAQs
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* ================================================== */}
        {/* DOCUMENTATION CATEGORIES */}
        {/* ================================================== */}

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          spacing={1}
          sx={{
            mt: 4,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={900}
            >
              Documentation
            </Typography>

            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ mt: 0.5 }}
            >
              Browse LibraryHub owner features by module.
            </Typography>
          </Box>

          <Chip
            label={`${filteredCategories.length} categories`}
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          />
        </Stack>

        {filteredCategories.length === 0 ? (
          <Alert severity="info">
            No documentation matched “{query}”.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;

              return (
                <Grid
                  key={category.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition:
                        "transform .2s ease, box-shadow .2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow:
                          "0 16px 36px rgba(15,23,42,.08)",
                      },
                    }}
                  >
                    <Stack spacing={1.6}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(
                            theme.palette.primary.main,
                            0.08,
                          ),
                          color: "primary.main",
                        }}
                      >
                        <CategoryIcon />
                      </Box>

                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={900}
                        >
                          {category.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.4,
                            lineHeight: 1.65,
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>

                      <Stack spacing={0.8}>
                        {category.articles.map((article) => (
                          <Stack
                            key={article}
                            direction="row"
                            spacing={0.8}
                            alignItems="center"
                          >
                            <ArrowForward
                              sx={{
                                fontSize: 15,
                                color: "primary.main",
                              }}
                            />

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {article}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* ================================================== */}
        {/* FAQ */}
        {/* ================================================== */}

        <Box
          id="owner-help-faq"
          sx={{
            mt: 5,
            scrollMarginTop: 100,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={900}
          >
            Frequently Asked Questions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 2,
            }}
          >
            Quick answers to common owner questions.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            {filteredFaqs.length === 0 ? (
              <Box sx={{ p: 2.5 }}>
                <Typography color="text.secondary">
                  No FAQs matched your search.
                </Typography>
              </Box>
            ) : (
              filteredFaqs.map((faq) => (
                <Accordion
                  key={faq.question}
                  disableGutters
                  elevation={0}
                  sx={{
                    "&:before": {
                      display: "none",
                    },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                  >
                    <Typography fontWeight={800}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.75,
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Paper>
        </Box>

        {/* ================================================== */}
        {/* SUPPORT NOTE */}
        {/* ================================================== */}

        <Alert
          severity="info"
          icon={<SupportAgentOutlined />}
          sx={{
            mt: 3,
            borderRadius: 3,
          }}
        >
          Official LibraryHub support contact details can be added here once
          your production support email, WhatsApp number or ticketing workflow
          is finalized.
        </Alert>
      </Container>
    </Box>
  );
}


export default OwnerHelpDocumentation;
