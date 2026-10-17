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
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  ChatBubbleOutlineOutlined,
  EmailOutlined,
  EventSeatOutlined,
  ExpandMore,
  HelpOutlineOutlined,
  LibraryBooksOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  Refresh,
  Search,
  SendOutlined,
  SupportAgent,
  SwapHoriz,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";
import supportTicketApi from "../../../api/supportTicketApi";


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

  {
    id: 8,
    category: "Support",
    question:
      "What is the difference between Library Support and LibraryHub Support?",
    answer:
      "Choose Library Support for issues related to a specific library, such as seats, bookings, memberships or library facilities. Choose LibraryHub Support for account, technical or platform-level issues.",
  },
];


// ============================================================
// SUPPORT CATEGORIES
// ============================================================

const supportCategories = [
  {
    value: "BOOKING",
    label: "Booking",
  },
  {
    value: "MEMBERSHIP",
    label: "Membership",
  },
  {
    value: "SEAT",
    label: "Seat",
  },
  {
    value: "SEAT_CHANGE",
    label: "Seat Change",
  },
  {
    value: "PAYMENT",
    label: "Payment",
  },
  {
    value: "INVOICE",
    label: "Invoice",
  },
  {
    value: "ACCOUNT",
    label: "Account",
  },
  {
    value: "NOTIFICATION",
    label: "Notification",
  },
  {
    value: "TECHNICAL",
    label: "Technical",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];


// ============================================================
// SUPPORT SCOPE OPTIONS
// ============================================================

const supportScopeOptions = [
  {
    value: "LIBRARY",
    title: "Library Support",
    description:
      "For booking, seat, membership and other issues related to a specific library.",
  },
  {
    value: "PLATFORM",
    title: "LibraryHub Support",
    description:
      "For account, technical, notification or LibraryHub platform-related issues.",
  },
];


// ============================================================
// STATUS META
// ============================================================

const ticketStatusMeta = {
  OPEN: {
    label: "Open",
    color: "info",
  },

  IN_PROGRESS: {
    label: "In Progress",
    color: "primary",
  },

  WAITING_FOR_USER: {
    label: "Waiting for You",
    color: "warning",
  },

  WAITING_FOR_SUPPORT: {
    label: "Waiting for Support",
    color: "secondary",
  },

  RESOLVED: {
    label: "Resolved",
    color: "success",
  },

  CLOSED: {
    label: "Closed",
    color: "default",
  },
};


// ============================================================
// DATE FORMATTER
// ============================================================

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


// ============================================================
// CATEGORY FORMATTER
// ============================================================

function formatEnumLabel(value) {
  if (!value) {
    return "Other";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}


// ============================================================
// SUPPORT CHANNEL CARD
// ============================================================

function SupportChannelCard({
  icon,
  title,
  description,
  action,
  actionLabel,
}) {
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
          boxShadow:
            "0 12px 30px rgba(15,23,42,0.08)",
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
            <Typography
              variant="h6"
              fontWeight={800}
            >
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

function SelfServiceCard({
  icon,
  title,
  description,
  onClick,
}) {
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
          boxShadow:
            "0 10px 26px rgba(15,23,42,0.07)",
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
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
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
            <Typography fontWeight={800}>
              {title}
            </Typography>

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
// TICKET CARD
// ============================================================

function SupportTicketCard({
  ticket,
  onClick,
}) {
  const status =
    ticketStatusMeta[ticket?.status] ||
    ticketStatusMeta.OPEN;

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
        overflow: "hidden",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.light",
          boxShadow:
            "0 12px 28px rgba(15,23,42,0.08)",
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          bgcolor:
            ticket.status === "RESOLVED"
              ? "success.main"
              : ticket.status === "CLOSED"
                ? "grey.400"
                : ticket.status ===
                    "WAITING_FOR_USER"
                  ? "warning.main"
                  : "primary.main",
        }}
      />

      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                {ticket.ticketNumber ||
                  `Ticket #${ticket.id}`}
              </Typography>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                  lineHeight: 1.35,
                }}
              >
                {ticket.subject}
              </Typography>
            </Box>

            <Chip
              size="small"
              label={status.label}
              color={status.color}
              sx={{
                flexShrink: 0,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip
              size="small"
              variant="outlined"
              label={formatEnumLabel(
                ticket.category,
              )}
            />

            <Chip
              size="small"
              variant="outlined"
              label={
                ticket.scope === "LIBRARY"
                  ? "Library Support"
                  : "LibraryHub Support"
              }
            />

            {ticket.libraryName && (
              <Chip
                size="small"
                variant="outlined"
                label={ticket.libraryName}
              />
            )}
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Updated{" "}
              {formatDateTime(
                ticket.updatedAt ||
                  ticket.lastMessageAt ||
                  ticket.createdAt,
              )}
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                color: "primary.main",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={800}
              >
                View
              </Typography>

              <ArrowForward fontSize="small" />
            </Stack>
          </Stack>
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


  // ==========================================================
  // FAQ
  // ==========================================================

  const [search, setSearch] =
    useState("");


  // ==========================================================
  // SUPPORT FORM
  // ==========================================================

  const [form, setForm] = useState({
    scope: "LIBRARY",
    libraryId: "",
    category: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [createdTicket, setCreatedTicket] =
    useState(null);


  // ==========================================================
  // LIBRARIES
  // ==========================================================

  const [libraries, setLibraries] =
    useState([]);

  const [librariesLoading, setLibrariesLoading] =
    useState(false);

  const [librariesError, setLibrariesError] =
    useState("");


  // ==========================================================
  // TICKETS
  // ==========================================================

  const [tickets, setTickets] =
    useState([]);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [ticketsError, setTicketsError] =
    useState("");


  // ==========================================================
  // FILTER FAQS
  // ==========================================================

  const filteredFaqs = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return faqData;
    }

    return faqData.filter(
      (item) =>
        item.question
          .toLowerCase()
          .includes(keyword) ||
        item.answer
          .toLowerCase()
          .includes(keyword) ||
        item.category
          .toLowerCase()
          .includes(keyword),
    );
  }, [search]);


  // ==========================================================
  // NORMALIZE LIBRARY RESPONSE
  // ==========================================================

  const normalizeLibraries =
    useCallback((data) => {
      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.content)) {
        return data.content;
      }

      if (Array.isArray(data?.libraries)) {
        return data.libraries;
      }

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      return [];
    }, []);


  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries =
    useCallback(async () => {
      try {
        setLibrariesLoading(true);
        setLibrariesError("");

        const response =
          await api.get(
            "/api/libraries",
          );

        setLibraries(
          normalizeLibraries(
            response.data,
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load libraries:",
          requestError,
        );

        setLibraries([]);

        setLibrariesError(
          "Unable to load libraries right now.",
        );
      } finally {
        setLibrariesLoading(false);
      }
    }, [normalizeLibraries]);


  // ==========================================================
  // LOAD SUPPORT TICKETS
  // ==========================================================

  const loadTickets =
    useCallback(async () => {
      try {
        setTicketsLoading(true);
        setTicketsError("");

        const data =
          await supportTicketApi.getStudentTickets();

        setTickets(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (requestError) {
        console.error(
          "Failed to load support tickets:",
          requestError,
        );

        setTickets([]);

        setTicketsError(
          "Unable to load your support tickets.",
        );
      } finally {
        setTicketsLoading(false);
      }
    }, []);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLibraries();
    loadTickets();
  }, [
    loadLibraries,
    loadTickets,
  ]);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange =
    (field) => (event) => {
      const value =
        event.target.value;

      setForm((current) => ({
        ...current,
        [field]: value,
      }));

      setError("");
      setSuccess("");
      setCreatedTicket(null);
    };


  // ==========================================================
  // SCOPE CHANGE
  // ==========================================================

  const handleScopeChange = (
    scope,
  ) => {
    setForm((current) => ({
      ...current,
      scope,

      /*
       * Platform-level support does not require a library.
       */
      libraryId:
        scope === "PLATFORM"
          ? ""
          : current.libraryId,
    }));

    setError("");
    setSuccess("");
    setCreatedTicket(null);
  };


  // ==========================================================
  // SUBMIT SUPPORT REQUEST
  // ==========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setSuccess("");
      setError("");
      setCreatedTicket(null);


      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!form.scope) {
        setError(
          "Please select where you need support.",
        );

        return;
      }


      if (
        form.scope === "LIBRARY" &&
        !form.libraryId
      ) {
        setError(
          "Please select the library related to your issue.",
        );

        return;
      }


      if (!form.category) {
        setError(
          "Please select an issue category.",
        );

        return;
      }


      if (!form.subject.trim()) {
        setError(
          "Please enter a subject.",
        );

        return;
      }


      if (!form.message.trim()) {
        setError(
          "Please describe your issue.",
        );

        return;
      }


      // ------------------------------------------------------
      // CREATE REQUEST
      // ------------------------------------------------------

      try {
        setSubmitting(true);

        const payload = {
          scope: form.scope,

          libraryId:
            form.scope === "LIBRARY"
              ? Number(
                  form.libraryId,
                )
              : null,

          category:
            form.category,

          subject:
            form.subject.trim(),

          description:
            form.message.trim(),
        };


        const ticket =
          await supportTicketApi.createStudentTicket(
            payload,
          );


        setCreatedTicket(
          ticket,
        );

        setSuccess(
          ticket?.ticketNumber
            ? `Your support request has been created successfully. Ticket: ${ticket.ticketNumber}`
            : "Your support request has been created successfully.",
        );


        setForm({
          scope: "LIBRARY",
          libraryId: "",
          category: "",
          subject: "",
          message: "",
        });


        await loadTickets();


        /*
         * Keep the confirmation visible.
         */

        window.setTimeout(() => {
          document
            .getElementById(
              "my-support-tickets",
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 250);
      } catch (requestError) {
        console.error(
          "Failed to create support ticket:",
          requestError,
        );


        const message =
          requestError?.response
            ?.data?.message ||
          requestError?.response
            ?.data?.error ||
          requestError?.response
            ?.data?.detail ||
          "Unable to create your support request. Please try again.";


        setError(message);
      } finally {
        setSubmitting(false);
      }
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
          borderColor:
            "rgba(79,70,229,0.12)",
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
            background:
              "rgba(79,70,229,0.07)",
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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  minWidth: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  bgcolor: "primary.main",
                  color:
                    "primary.contrastText",
                  boxShadow:
                    "0 10px 26px rgba(79,70,229,0.24)",
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
                    letterSpacing:
                      "-0.02em",
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
                  Find quick answers,
                  contact your library or
                  reach LibraryHub support.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Chip
                icon={
                  <SupportAgent />
                }
                label="LibraryHub Support"
                color="primary"
                variant="outlined"
                sx={{
                  bgcolor:
                    "background.paper",
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              />

              {tickets.length > 0 && (
                <Chip
                  label={`${tickets.length} ${
                    tickets.length === 1
                      ? "Ticket"
                      : "Tickets"
                  }`}
                  sx={{
                    bgcolor:
                      "background.paper",
                    fontWeight: 700,
                  }}
                />
              )}
            </Stack>
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
        Choose the support option that
        works best for you.
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
            icon={
              <ChatBubbleOutlineOutlined />
            }
            title="Support Request"
            description="Create a tracked support ticket for your library or for the LibraryHub platform."
            actionLabel="Create Request"
            action={() => {
              document
                .getElementById(
                  "support-request-form",
                )
                ?.scrollIntoView({
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
            icon={<SupportAgent />}
            title="My Support Tickets"
            description="Track your requests, current status and support conversations."
            actionLabel="View Tickets"
            action={() => {
              document
                .getElementById(
                  "my-support-tickets",
                )
                ?.scrollIntoView({
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
            icon={
              <HelpOutlineOutlined />
            }
            title="FAQs"
            description="Find answers to common membership, booking, payment and seat-related questions."
            actionLabel="Browse FAQs"
            action={() => {
              document
                .getElementById(
                  "student-support-faq",
                )
                ?.scrollIntoView({
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
        Many common issues can be
        resolved directly from your
        account.
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
            icon={
              <LibraryBooksOutlined />
            }
            title="Membership"
            description="Check plan and validity"
            onClick={() =>
              navigate(
                "/student/membership",
              )
            }
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
            icon={
              <EventSeatOutlined />
            }
            title="Bookings"
            description="View your seat bookings"
            onClick={() =>
              navigate(
                "/student/bookings",
              )
            }
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
            icon={
              <PaymentsOutlined />
            }
            title="Payments"
            description="Check payment status"
            onClick={() =>
              navigate(
                "/student/payments",
              )
            }
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
            icon={
              <ReceiptLongOutlined />
            }
            title="Invoices"
            description="View payment invoices"
            onClick={() =>
              navigate(
                "/student/invoices",
              )
            }
          />
        </Grid>
      </Grid>


      {/* ===================================================== */}
      {/* MY SUPPORT TICKETS */}
      {/* ===================================================== */}

      <Card
        id="my-support-tickets"
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

            "&:last-child": {
              pb: {
                xs: 2.4,
                md: 3,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
            sx={{
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                My Support Tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Track your submitted
                requests and continue
                conversations with support.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={
                ticketsLoading ? (
                  <CircularProgress
                    size={16}
                  />
                ) : (
                  <Refresh />
                )
              }
              disabled={ticketsLoading}
              onClick={loadTickets}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2.5,
                alignSelf: {
                  xs: "flex-start",
                  sm: "center",
                },
              }}
            >
              Refresh
            </Button>
          </Stack>

          {ticketsError && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: 2.5,
              }}
            >
              {ticketsError}
            </Alert>
          )}

          {ticketsLoading ? (
            <Grid
              container
              spacing={2}
            >
              {[1, 2, 3].map(
                (item) => (
                  <Grid
                    key={item}
                    size={{
                      xs: 12,
                      md: 6,
                      xl: 4,
                    }}
                  >
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                      }}
                    >
                      <CardContent>
                        <Skeleton
                          width="40%"
                        />
                        <Skeleton
                          height={32}
                          width="80%"
                        />

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            mt: 1.5,
                          }}
                        >
                          <Skeleton
                            variant="rounded"
                            width={80}
                            height={26}
                          />

                          <Skeleton
                            variant="rounded"
                            width={100}
                            height={26}
                          />
                        </Stack>

                        <Skeleton
                          sx={{
                            mt: 2,
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ),
              )}
            </Grid>
          ) : tickets.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
                borderRadius: 3,
                bgcolor:
                  "rgba(248,250,252,0.75)",
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  mx: "auto",
                  mb: 1.5,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  bgcolor:
                    "rgba(79,70,229,0.08)",
                  color:
                    "primary.main",
                }}
              >
                <SupportAgent />
              </Box>

              <Typography
                fontWeight={800}
              >
                No support tickets yet
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mb: 2,
                }}
              >
                When you need help, create
                a support request and track
                it here.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => {
                  document
                    .getElementById(
                      "support-request-form",
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                }}
              >
                Create Support Request
              </Button>
            </Box>
          ) : (
            <Grid
              container
              spacing={2}
            >
              {tickets.map(
                (ticket) => (
                  <Grid
                    key={ticket.id}
                    size={{
                      xs: 12,
                      md: 6,
                      xl: 4,
                    }}
                  >
                    <SupportTicketCard
                      ticket={ticket}
                      onClick={() =>
                        navigate(
                          `/student/support/tickets/${ticket.id}`,
                        )
                      }
                    />
                  </Grid>
                ),
              )}
            </Grid>
          )}
        </CardContent>
      </Card>


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
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Frequently Asked Questions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Search common LibraryHub
                questions and solutions.
              </Typography>
            </Box>

            <TextField
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search help articles"
              sx={{
                width: {
                  xs: "100%",
                  md: 350,
                },

                "& .MuiOutlinedInput-root":
                  {
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

          {filteredFaqs.length ===
          0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <HelpOutlineOutlined
                sx={{
                  fontSize: 46,
                  color:
                    "text.disabled",
                  mb: 1,
                }}
              />

              <Typography
                fontWeight={800}
              >
                No help articles found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Try searching with another
                keyword.
              </Typography>
            </Box>
          ) : (
            filteredFaqs.map(
              (item) => (
                <Accordion
                  key={item.id}
                  disableGutters
                  elevation={0}
                  sx={{
                    "&:before": {
                      display: "none",
                    },

                    borderBottom:
                      "1px solid",

                    borderColor:
                      "divider",
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMore />
                    }
                    sx={{
                      px: 0,

                      "& .MuiAccordionSummary-content":
                        {
                          py: 1,
                        },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.3}
                      alignItems="center"
                    >
                      <Chip
                        size="small"
                        label={
                          item.category
                        }
                        color="primary"
                        variant="outlined"
                        sx={{
                          minWidth: 90,
                          fontWeight: 700,
                        }}
                      />

                      <Typography
                        fontWeight={700}
                      >
                        {item.question}
                      </Typography>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails
                    sx={{
                      px: 0,
                      pb: 2.5,
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      lineHeight={1.7}
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ),
            )
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
                  justifyContent:
                    "center",
                  bgcolor: "primary.main",
                  color:
                    "primary.contrastText",
                  mb: 2,
                }}
              >
                <SupportAgent />
              </Box>

              <Typography
                variant="h5"
                fontWeight={800}
              >
                Need more help?
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                Create a tracked request
                for your library or the
                LibraryHub support team.
              </Typography>

              <Stack
                spacing={1.4}
                sx={{
                  mt: 3,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  Common support areas
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <EventSeatOutlined
                    fontSize="small"
                    color="primary"
                  />

                  <Typography variant="body2">
                    Booking & seat issues
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <PaymentsOutlined
                    fontSize="small"
                    color="primary"
                  />

                  <Typography variant="body2">
                    Payment problems
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <SwapHoriz
                    fontSize="small"
                    color="primary"
                  />

                  <Typography variant="body2">
                    Seat change requests
                  </Typography>
                </Stack>
              </Stack>

              <Divider
                sx={{
                  my: 3,
                }}
              />

              <Typography
                variant="body2"
                fontWeight={700}
              >
                Need to contact us by
                email?
              </Typography>

              <Button
                size="small"
                startIcon={
                  <EmailOutlined />
                }
                onClick={() => {
                  window.location.href =
                    "mailto:support@libraryhub.in";
                }}
                sx={{
                  mt: 0.7,
                  px: 0,
                  textTransform: "none",
                  fontWeight: 700,

                  "&:hover": {
                    background:
                      "transparent",
                  },
                }}
              >
                support@libraryhub.in
              </Button>
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
              <Typography
                variant="h6"
                fontWeight={800}
              >
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
                Tell us what happened and
                choose whether the request
                should go to the library or
                LibraryHub.
              </Typography>


              {success && (
                <Alert
                  severity="success"
                  onClose={() => {
                    setSuccess("");
                    setCreatedTicket(
                      null,
                    );
                  }}
                  sx={{
                    mb: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      {success}
                    </Typography>

                    {createdTicket?.ticketNumber && (
                      <Typography
                        variant="caption"
                        color="inherit"
                      >
                        Keep this ticket
                        number for future
                        reference.
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              )}


              {error && (
                <Alert
                  severity="error"
                  onClose={() =>
                    setError("")
                  }
                  sx={{
                    mb: 2.5,
                    borderRadius: 2.5,
                  }}
                >
                  {error}
                </Alert>
              )}


              <Box
                component="form"
                onSubmit={handleSubmit}
              >
                <Stack spacing={2.2}>

                  {/* ========================================= */}
                  {/* SUPPORT DESTINATION */}
                  {/* ========================================= */}

                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        mb: 1.2,
                      }}
                    >
                      Where do you need
                      support?
                    </Typography>

                    <Grid
                      container
                      spacing={1.5}
                    >
                      {supportScopeOptions.map(
                        (option) => {
                          const selected =
                            form.scope ===
                            option.value;

                          return (
                            <Grid
                              key={
                                option.value
                              }
                              size={{
                                xs: 12,
                                md: 6,
                              }}
                            >
                              <Card
                                elevation={0}
                                onClick={() =>
                                  handleScopeChange(
                                    option.value,
                                  )
                                }
                                sx={{
                                  height:
                                    "100%",
                                  cursor:
                                    "pointer",
                                  p: 2,
                                  border:
                                    "1px solid",
                                  borderColor:
                                    selected
                                      ? "primary.main"
                                      : "divider",
                                  bgcolor:
                                    selected
                                      ? "rgba(79,70,229,0.045)"
                                      : "background.paper",
                                  borderRadius:
                                    2.5,
                                  transition:
                                    "all 0.2s ease",

                                  "&:hover": {
                                    borderColor:
                                      "primary.light",
                                  },
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                  spacing={1}
                                >
                                  <Box>
                                    <Typography
                                      fontWeight={
                                        800
                                      }
                                    >
                                      {
                                        option.title
                                      }
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        mt: 0.5,
                                        lineHeight:
                                          1.55,
                                      }}
                                    >
                                      {
                                        option.description
                                      }
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      mt: 0.5,
                                      width: 18,
                                      height: 18,
                                      minWidth:
                                        18,
                                      borderRadius:
                                        "50%",
                                      border:
                                        "2px solid",
                                      borderColor:
                                        selected
                                          ? "primary.main"
                                          : "divider",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                    }}
                                  >
                                    {selected && (
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius:
                                            "50%",
                                          bgcolor:
                                            "primary.main",
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Stack>
                              </Card>
                            </Grid>
                          );
                        },
                      )}
                    </Grid>
                  </Box>


                  {/* ========================================= */}
                  {/* LIBRARY */}
                  {/* ========================================= */}

                  {form.scope ===
                    "LIBRARY" && (
                    <TextField
                      select
                      fullWidth
                      required
                      label="Library"
                      value={
                        form.libraryId
                      }
                      onChange={handleFormChange(
                        "libraryId",
                      )}
                      disabled={
                        librariesLoading
                      }
                      helperText={
                        librariesError ||
                        "Select the library related to this support request."
                      }
                      slotProps={{
                        select: {
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                maxHeight:
                                  320,
                              },
                            },
                          },
                        },
                      }}
                    >
                      {librariesLoading && (
                        <MenuItem disabled>
                          <CircularProgress
                            size={18}
                            sx={{
                              mr: 1.3,
                            }}
                          />
                          Loading
                          libraries...
                        </MenuItem>
                      )}

                      {!librariesLoading &&
                        libraries.length ===
                          0 && (
                          <MenuItem
                            disabled
                          >
                            No libraries
                            available
                          </MenuItem>
                        )}

                      {libraries.map(
                        (library) => (
                          <MenuItem
                            key={
                              library.id
                            }
                            value={
                              library.id
                            }
                          >
                            {library.name ||
                              `Library #${library.id}`}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  )}


                  {/* ========================================= */}
                  {/* CATEGORY */}
                  {/* ========================================= */}

                  <TextField
                    select
                    fullWidth
                    required
                    label="Issue Category"
                    value={form.category}
                    onChange={handleFormChange(
                      "category",
                    )}
                  >
                    {supportCategories.map(
                      (item) => (
                        <MenuItem
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                        >
                          {item.label}
                        </MenuItem>
                      ),
                    )}
                  </TextField>


                  {/* ========================================= */}
                  {/* SUBJECT */}
                  {/* ========================================= */}

                  <TextField
                    fullWidth
                    required
                    label="Subject"
                    value={form.subject}
                    onChange={handleFormChange(
                      "subject",
                    )}
                    placeholder="Briefly describe your issue"
                    slotProps={{
                      htmlInput: {
                        maxLength: 150,
                      },
                    }}
                    helperText={`${form.subject.length}/150`}
                  />


                  {/* ========================================= */}
                  {/* DESCRIPTION */}
                  {/* ========================================= */}

                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={5}
                    maxRows={8}
                    label="Describe your issue"
                    value={form.message}
                    onChange={handleFormChange(
                      "message",
                    )}
                    placeholder="Explain what happened, what you expected and any relevant payment, booking, seat or membership information."
                    slotProps={{
                      htmlInput: {
                        maxLength: 2000,
                      },
                    }}
                    helperText={`${form.message.length}/2000`}
                  />


                  {/* ========================================= */}
                  {/* SUBMIT */}
                  {/* ========================================= */}

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={
                        submitting ||
                        (form.scope ===
                          "LIBRARY" &&
                          librariesLoading)
                      }
                      startIcon={
                        submitting ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        ) : (
                          <SendOutlined />
                        )
                      }
                      sx={{
                        minHeight: 46,
                        px: 3,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 700,
                        boxShadow:
                          "0 7px 18px rgba(79,70,229,0.20)",
                      }}
                    >
                      {submitting
                        ? "Submitting..."
                        : "Submit Request"}
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