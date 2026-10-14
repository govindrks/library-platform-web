import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  EmailOutlined,
  ExpandMore,
  LibraryBooksOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  Search,
  SendOutlined,
  SupportAgent,
  SwapHoriz,
  EventSeatOutlined,
  ChatBubbleOutlineOutlined,
  HelpOutlineOutlined,
} from "@mui/icons-material";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

// ============================================================
// FAQ DATA
// ============================================================

const faqData = [
  {
    id: 1,
    category: "Membership",
    question: "How can I view my active membership?",
    answer:
      "Open My Membership from the left sidebar. You can view your current library, membership plan, assigned seat, membership validity and remaining days.",
  },

  {
    id: 2,
    category: "Bookings",
    question: "Where can I see my seat bookings?",
    answer:
      "Open My Bookings from the sidebar. Your active, pending, completed and cancelled bookings are available there.",
  },

  {
    id: 3,
    category: "Seat Change",
    question: "How can I request a seat change?",
    answer:
      "Open your active membership or booking and choose Request Seat Change. Select the preferred available seat, enter the reason and submit your request.",
  },

  {
    id: 4,
    category: "Payments",
    question: "Where can I check my payment status?",
    answer:
      "Open Payments from the Finance section. You can view transaction status, amount, gateway, payment method, receipt number and payment date.",
  },

  {
    id: 5,
    category: "Invoices",
    question: "How can I download my invoice?",
    answer:
      "Open Invoices from the Finance section. Select the required invoice and use the available download option.",
  },

  {
    id: 6,
    category: "Payments",
    question:
      "What should I do if payment is deducted but the booking is still pending?",
    answer:
      "Refresh the payment and booking pages first. If the status still does not update after some time, submit a support request with the payment transaction details.",
  },

  {
    id: 7,
    category: "Profile",
    question: "How can I update my profile information?",
    answer:
      "Open My Profile from the Account section. You can update your personal information and profile picture there.",
  },
];

// ============================================================
// SUPPORT CHANNEL CARD
// ============================================================

function SupportChannelCard({ icon, title, description, action, actionLabel }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        background:
          "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.9) 100%)",
        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "primary.light",
          boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.6,
          height: "100%",

          "&:last-child": {
            pb: 2.6,
          },
        }}
      >
        <Stack
          spacing={1.8}
          sx={{
            height: "100%",
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.13), rgba(99,102,241,0.05))",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.6,
                lineHeight: 1.65,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={action}
            sx={{
              alignSelf: "flex-start",
              px: 0,
              textTransform: "none",
              fontWeight: 700,

              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SELF SERVICE CARD
// ============================================================

function SelfServiceCard({ icon, title, description, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.light",
          boxShadow: "0 10px 26px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.3,

          "&:last-child": {
            pb: 2.3,
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              minWidth: 46,
              borderRadius: 2.3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(79,70,229,0.08)",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography fontWeight={800}>{title}</Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              {description}
            </Typography>
          </Box>

          <ArrowForward
            sx={{
              color: "primary.main",
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// HELP & SUPPORT
// ============================================================

function HelpSupport() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [subject, setSubject] = useState("");

  const [category, setCategory] = useState("");

  const [message, setMessage] = useState("");

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // ==========================================================
  // FILTER FAQS
  // ==========================================================

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return faqData;
    }

    return faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword),
    );
  }, [search]);

  // ==========================================================
  // SUBMIT SUPPORT REQUEST
  // ==========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!category || !subject.trim() || !message.trim()) {
      setError("Please complete all required fields.");

      return;
    }

    /*
     * Temporary frontend-only implementation.
     *
     * Later this will call:
     *
     * supportTicketApi.createTicket(...)
     */

    console.log("Support request:", {
      category,
      subject: subject.trim(),
      message: message.trim(),
    });

    setSuccess("Your support request has been submitted successfully.");

    setCategory("");
    setSubject("");
    setMessage("");
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.12)",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,1) 52%, rgba(99,102,241,0.055) 100%)",
          position: "relative",

          "&::before": {
            content: '""',
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -80,
            top: -110,
            background: "rgba(79,70,229,0.07)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",
            zIndex: 1,
            p: {
              xs: 2.5,
              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.5,
              },
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
              xs: "stretch",
              lg: "center",
            }}
            spacing={3}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  minWidth: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
                }}
              >
                <SupportAgent
                  sx={{
                    fontSize: 31,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  Help & Support
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.55,
                  }}
                >
                  Find quick answers or contact LibraryHub support.
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<SupportAgent />}
              label="LibraryHub Support"
              color="primary"
              variant="outlined"
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  lg: "center",
                },
                bgcolor: "background.paper",
                fontWeight: 700,
                borderRadius: 2,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SUPPORT CHANNELS */}
      {/* ===================================================== */}

      <Typography
        variant="h6"
        fontWeight={800}
        sx={{
          mb: 0.4,
        }}
      >
        How can we help?
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        Choose the support option that works best for you.
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <SupportChannelCard
            icon={<ChatBubbleOutlineOutlined />}
            title="Support Request"
            description="Describe your issue and submit a support request directly from LibraryHub."
            actionLabel="Create Request"
            action={() => {
              document.getElementById("support-request-form")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <SupportChannelCard
            icon={<EmailOutlined />}
            title="Email Support"
            description="Use email for questions that require additional details or documents."
            actionLabel="Email Support"
            action={() => {
              window.location.href = "mailto:support@libraryhub.in";
            }}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <SupportChannelCard
            icon={<HelpOutlineOutlined />}
            title="FAQs"
            description="Find answers to common membership, booking, payment and seat-related questions."
            actionLabel="Browse FAQs"
            action={() => {
              document.getElementById("student-support-faq")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* SELF SERVICE */}
      {/* ===================================================== */}

      <Typography
        variant="h6"
        fontWeight={800}
        sx={{
          mb: 0.4,
        }}
      >
        Quick Self-Service
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 2,
        }}
      >
        Many common issues can be resolved directly from your account.
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SelfServiceCard
            icon={<LibraryBooksOutlined />}
            title="Membership"
            description="Check plan and validity"
            onClick={() => navigate("/student/membership")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SelfServiceCard
            icon={<EventSeatOutlined />}
            title="Bookings"
            description="View your seat bookings"
            onClick={() => navigate("/student/bookings")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SelfServiceCard
            icon={<PaymentsOutlined />}
            title="Payments"
            description="Check payment status"
            onClick={() => navigate("/student/payments")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <SelfServiceCard
            icon={<ReceiptLongOutlined />}
            title="Invoices"
            description="View payment invoices"
            onClick={() => navigate("/student/invoices")}
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* FAQ */}
      {/* ===================================================== */}

      <Card
        id="student-support-faq"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          mb: 4,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.4,
              md: 3,
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
              xs: "stretch",
              md: "center",
            }}
            spacing={2}
            sx={{
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Frequently Asked Questions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Search common LibraryHub questions and solutions.
              </Typography>
            </Box>

            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search help articles"
              sx={{
                width: {
                  xs: "100%",
                  md: 350,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Divider
            sx={{
              mb: 1,
            }}
          />

          {filteredFaqs.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <HelpOutline
                sx={{
                  fontSize: 46,
                  color: "text.disabled",
                  mb: 1,
                }}
              />

              <Typography fontWeight={800}>No help articles found</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Try searching with another keyword.
              </Typography>
            </Box>
          ) : (
            filteredFaqs.map((item) => (
              <Accordion
                key={item.id}
                disableGutters
                elevation={0}
                sx={{
                  "&:before": {
                    display: "none",
                  },

                  borderBottom: "1px solid",

                  borderColor: "divider",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 0,

                    "& .MuiAccordionSummary-content": {
                      py: 1,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.3} alignItems="center">
                    <Chip
                      size="small"
                      label={item.category}
                      color="primary"
                      variant="outlined"
                      sx={{
                        minWidth: 90,
                        fontWeight: 700,
                      }}
                    />

                    <Typography fontWeight={700}>{item.question}</Typography>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    px: 0,
                    pb: 2.5,
                  }}
                >
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SUPPORT REQUEST FORM */}
      {/* ===================================================== */}

      <Card
        id="support-request-form"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Grid container>
          {/* ================================================= */}
          {/* INFO */}
          {/* ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <Box
              sx={{
                height: "100%",
                p: {
                  xs: 2.8,
                  md: 3.5,
                },
                background:
                  "linear-gradient(145deg, rgba(79,70,229,0.10), rgba(99,102,241,0.035))",
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  mb: 2,
                }}
              >
                <SupportAgent />
              </Box>

              <Typography variant="h5" fontWeight={800}>
                Need more help?
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                Send us the details of your issue and the LibraryHub support
                team will review your request.
              </Typography>

              <Stack
                spacing={1.4}
                sx={{
                  mt: 3,
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  Common support areas
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <EventSeatOutlined fontSize="small" color="primary" />

                  <Typography variant="body2">Booking & seat issues</Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentsOutlined fontSize="small" color="primary" />

                  <Typography variant="body2">Payment problems</Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <SwapHoriz fontSize="small" color="primary" />

                  <Typography variant="body2">Seat change requests</Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3.5,
                },
              }}
            >
              <Typography variant="h6" fontWeight={800}>
                Submit a Support Request
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 2.5,
                }}
              >
                Tell us what happened and include enough information for us to
                investigate.
              </Typography>

              {success && (
                <Alert
                  severity="success"
                  onClose={() => setSuccess("")}
                  sx={{
                    mb: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  {success}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{
                    mb: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.2}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Issue Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <MenuItem value="BOOKING">Booking</MenuItem>

                    <MenuItem value="MEMBERSHIP">Membership</MenuItem>

                    <MenuItem value="PAYMENT">Payment</MenuItem>

                    <MenuItem value="INVOICE">Invoice</MenuItem>

                    <MenuItem value="SEAT_CHANGE">Seat Change</MenuItem>

                    <MenuItem value="ACCOUNT">Account</MenuItem>

                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    required
                    label="Subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Briefly describe your issue"
                    slotProps={{
                      htmlInput: {
                        maxLength: 150,
                      },
                    }}
                    helperText={`${subject.length}/150`}
                  />

                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={5}
                    maxRows={8}
                    label="Describe your issue"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Explain what happened, what you expected and any relevant payment or booking information."
                    slotProps={{
                      htmlInput: {
                        maxLength: 2000,
                      },
                    }}
                    helperText={`${message.length}/2000`}
                  />

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<SendOutlined />}
                      sx={{
                        minHeight: 46,
                        px: 3,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow: "0 7px 18px rgba(79,70,229,0.20)",
                      }}
                    >
                      Submit Request
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default HelpSupport;
