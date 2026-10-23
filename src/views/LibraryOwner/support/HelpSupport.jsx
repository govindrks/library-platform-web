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
  alpha,
  useTheme,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  BusinessOutlined,
  ChatBubbleOutlineOutlined,
  CheckCircleOutlineOutlined,
  EmailOutlined,
  ExpandMore,
  ForumOutlined,
  HelpOutlineOutlined,
  HourglassTop,
  LibraryBooksOutlined,
  OpenInNew,
  PaymentsOutlined,
  Refresh,
  Search,
  SendOutlined,
  SettingsOutlined,
  SupportAgent,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// CONSTANTS
// ============================================================
const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const faqData = [
  {
    id: 1,

    category: "Library Setup",

    question: "How can I update my library information?",

    answer:
      "Open the library settings or profile section from the owner dashboard to update supported library details.",
  },

  {
    id: 2,

    category: "Payments",

    question: "What should I do if a successful payment remains pending?",

    answer:
      "Check the payment details and webhook status first. If the payment still does not reconcile, create a LibraryHub support ticket with the payment and transaction details.",
  },

  {
    id: 3,

    category: "Membership Plans",

    question: "Where can I manage membership plans?",

    answer:
      "Use the Membership Plans section in the owner dashboard to create, update, activate or deactivate plans for your library.",
  },

  {
    id: 4,

    category: "Automation",

    question: "What should I do if an automation rule is not running?",

    answer:
      "Check whether the automation rule is enabled and review its trigger or schedule. If the issue persists, create a technical support ticket.",
  },

  {
    id: 5,

    category: "Billing",

    question: "Where can I get help with LibraryHub platform billing?",

    answer:
      "Create a LibraryHub support request and select Platform Billing as the category.",
  },

  {
    id: 6,

    category: "Student Support",

    question: "Where do I handle support requests submitted by my students?",

    answer:
      "Open Student Support from the owner support area. Only tickets belonging to your own library are available there.",
  },
];

// ============================================================
// OWNER DOCUMENTATION
// ============================================================

const documentationData = [
  {
    id: "getting-started",
    title: "Getting Started",
    description:
      "Understand the owner workspace and the core setup required to operate your library.",
    icon: LibraryBooksOutlined,
    topics: [
      "Owner dashboard overview",
      "Complete your library profile",
      "Configure amenities",
      "Understand library operational status",
    ],
  },
  {
    id: "library-management",
    title: "Library Management",
    description:
      "Manage public-facing library information, amenities and membership configuration.",
    icon: BusinessOutlined,
    topics: [
      "Update library information",
      "Manage profile and cover images",
      "Publish gallery images",
      "Configure membership plans",
    ],
  },
  {
    id: "seat-management",
    title: "Seats & Slots",
    description:
      "Design physical layouts and control seat and booking-slot availability.",
    icon: LibraryBooksOutlined,
    topics: [
      "Create floors and seat layouts",
      "Configure seat numbering",
      "Manage blank spaces and seat positions",
      "Create and manage booking slots",
    ],
  },
  {
    id: "members-bookings",
    title: "Members & Bookings",
    description:
      "Manage members, subscriptions, bookings and seat-change requests.",
    icon: ForumOutlined,
    topics: [
      "Add and manage members",
      "Create and manage bookings",
      "Assign or transfer seats",
      "Review seat-change requests",
    ],
  },
  {
    id: "payments",
    title: "Payments & Revenue",
    description:
      "Understand payment states, collections, billing and settlement-related workflows.",
    icon: PaymentsOutlined,
    topics: [
      "Record and review payments",
      "Understand pending payment states",
      "Review revenue activity",
      "Platform billing and settlement support",
    ],
  },
  {
    id: "automation",
    title: "Automation",
    description:
      "Configure recurring rules, reminders and operational notifications.",
    icon: AutoAwesome,
    topics: [
      "Create automation rules",
      "Enable or disable rules",
      "Review execution history",
      "Troubleshoot scheduled automations",
    ],
  },
  {
    id: "support",
    title: "Support Workflows",
    description:
      "Learn when to create LibraryHub support requests and how to manage student support.",
    icon: SupportAgent,
    topics: [
      "Create a LibraryHub support request",
      "Track your support tickets",
      "Reply to LibraryHub support",
      "Handle student support requests",
    ],
  },
  {
    id: "settings",
    title: "Settings & Account",
    description:
      "Manage owner preferences, notifications and platform configuration.",
    icon: SettingsOutlined,
    topics: [
      "Owner account settings",
      "Notification preferences",
      "Platform subscription settings",
      "Security and access guidance",
    ],
  },
];

const supportCategories = [
  { value: "LIBRARY_SETUP", label: "Library Setup" },

  { value: "MEMBERS", label: "Members" },

  { value: "MEMBERSHIP_PLAN", label: "Membership Plan" },

  { value: "BOOKING_MANAGEMENT", label: "Booking Management" },

  { value: "PAYMENT_CONFIGURATION", label: "Payment Configuration" },

  { value: "SETTLEMENT", label: "Settlement" },

  { value: "AUTOMATION", label: "Automation" },

  { value: "REPORTS", label: "Reports" },

  { value: "BILLING", label: "Platform Billing" },

  { value: "ACCOUNT", label: "Account" },

  { value: "NOTIFICATION", label: "Notification" },

  { value: "TECHNICAL", label: "Technical" },

  { value: "OTHER", label: "Other" },
];

const ticketStatusMeta = {
  OPEN: { label: "Open", color: "info" },

  IN_PROGRESS: { label: "In Progress", color: "primary" },

  WAITING_FOR_USER: { label: "Waiting for You", color: "warning" },

  WAITING_FOR_SUPPORT: { label: "Waiting for Support", color: "secondary" },

  RESOLVED: { label: "Resolved", color: "success" },

  CLOSED: { label: "Closed", color: "default" },
};

const ticketFilterOptions = [
  { value: "ALL", label: "All" },

  { value: "OPEN", label: "Open" },

  { value: "IN_PROGRESS", label: "In Progress" },

  { value: "WAITING_FOR_USER", label: "Waiting for You" },

  { value: "WAITING_FOR_SUPPORT", label: "Waiting for Support" },

  { value: "RESOLVED", label: "Resolved" },
];

// ============================================================
// HELPERS
// ============================================================
function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
}

function formatEnumLabel(value) {
  if (!value) return "Other";

  return value

    .replaceAll("_", " ")

    .toLowerCase()

    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) return null;

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

function storeLibraryId(libraryId) {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) return;

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.content)) return response.content;

  if (Array.isArray(response?.libraries)) return response.libraries;

  if (Array.isArray(response?.data)) return response.data;

  return [];
}

function ActionCard({ icon, title, description, actionLabel, onClick }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid",

        borderColor: "divider",

        borderRadius: 4,

        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
          theme.palette.primary.main,

          0.025,
        )} 100%)`,

        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          borderColor: alpha(theme.palette.primary.main, 0.28),

          boxShadow: `0 16px 34px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.6, height: "100%", "&:last-child": { pb: 2.6 } }}>
        <Stack spacing={1.8} sx={{ height: "100%" }}>
          <Box
            sx={{
              width: 52,

              height: 52,

              borderRadius: 3,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              bgcolor: alpha(theme.palette.primary.main, 0.09),

              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.7, lineHeight: 1.65 }}
            >
              {description}
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={onClick}
            sx={{
              px: 0,

              alignSelf: "flex-start",

              textTransform: "none",

              fontWeight: 800,
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DocumentationCard({ icon, title, description, topics }) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(theme.palette.primary.main, 0.025)} 100%
        )`,
        transition: "all 0.22s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(theme.palette.primary.main, 0.28),
          boxShadow: `0 14px 32px ${alpha(theme.palette.common.black, 0.07)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          height: "100%",
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack spacing={1.7} sx={{ height: "100%" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.6,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.09),
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={850}>
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

          <Divider />

          <Stack spacing={0.9}>
            {topics.map((topic) => (
              <Stack
                key={topic}
                direction="row"
                spacing={0.9}
                alignItems="flex-start"
              >
                <CheckCircleOutlineOutlined
                  sx={{
                    mt: 0.15,
                    fontSize: 17,
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.55,
                  }}
                >
                  {topic}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,

  value,

  subtitle,

  icon,

  tone = "primary",

  onClick,
}) {
  const theme = useTheme();

  const toneColor = theme.palette[tone]?.main ?? theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",

        border: "1px solid",

        borderColor: alpha(toneColor, 0.16),

        borderRadius: 4,

        cursor: onClick ? "pointer" : "default",

        transition: "all 0.2s ease",

        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(
          toneColor,

          0.03,
        )} 100%)`,

        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",

              borderColor: alpha(toneColor, 0.34),

              boxShadow: `0 12px 26px ${alpha(theme.palette.common.black, 0.06)}`,
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: 2.2, "&:last-child": { pb: 2.2 } }}>
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
              fontWeight={850}
              sx={{ mt: 0.3, letterSpacing: "-0.03em" }}
            >
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,

              height: 44,

              borderRadius: 2.5,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              color: toneColor,

              bgcolor: alpha(toneColor, 0.1),
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function TicketCard({ ticket, onClick }) {
  const theme = useTheme();

  const status = ticketStatusMeta[ticket?.status] || ticketStatusMeta.OPEN;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",

        cursor: "pointer",

        border: "1px solid",

        borderColor: "divider",

        borderRadius: 4,

        overflow: "hidden",

        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          borderColor: alpha(theme.palette.primary.main, 0.28),

          boxShadow: `0 14px 30px ${alpha(theme.palette.common.black, 0.07)}`,
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
                : ticket.status === "WAITING_FOR_USER"
                  ? "warning.main"
                  : "primary.main",
        }}
      />

      <CardContent sx={{ p: 2.4, "&:last-child": { pb: 2.4 } }}>
        <Stack spacing={1.8}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                {ticket.ticketNumber || `Ticket #${ticket.id}`}
              </Typography>

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ mt: 0.3, lineHeight: 1.35 }}
              >
                {ticket.subject}
              </Typography>
            </Box>

            <Chip
              size="small"
              label={status.label}
              color={status.color}
              sx={{ flexShrink: 0, fontWeight: 700 }}
            />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={formatEnumLabel(ticket.category)}
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
            spacing={1}
          >
            <Typography variant="caption" color="text.secondary">
              Updated{" "}
              {formatDateTime(
                ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
              )}
            </Typography>

            <Stack
              direction="row"
              spacing={0.4}
              alignItems="center"
              sx={{ color: "primary.main" }}
            >
              <Typography variant="body2" fontWeight={800}>
                Open
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
// MAIN PAGE
// ============================================================
function HelpSupport() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [ticketFilter, setTicketFilter] = useState("ALL");

  const [form, setForm] = useState({
    libraryId: "",

    category: "",

    subject: "",

    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const [createdTicket, setCreatedTicket] = useState(null);

  const [libraries, setLibraries] = useState([]);

  const [librariesLoading, setLibrariesLoading] = useState(true);

  const [librariesError, setLibrariesError] = useState("");

  const [tickets, setTickets] = useState([]);

  const [ticketsLoading, setTicketsLoading] = useState(true);

  const [ticketsError, setTicketsError] = useState("");

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(form.libraryId),
      ) ?? null,

    [libraries, form.libraryId],
  );

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return faqData;

    return faqData.filter(
      (item) =>
        item.question.toLowerCase().includes(keyword) ||
        item.answer.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword),
    );
  }, [search]);

  const filteredDocumentation = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return documentationData;
    }

    return documentationData.filter((item) => {
      const matchesModule =
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword);

      const matchesTopic = item.topics.some((topic) =>
        topic.toLowerCase().includes(keyword),
      );

      return matchesModule || matchesTopic;
    });
  }, [search]);

  const workingLibraryTickets = useMemo(() => {
    if (!form.libraryId) return tickets;

    return tickets.filter((ticket) => {
      if (ticket?.libraryId != null) {
        return Number(ticket.libraryId) === Number(form.libraryId);
      }

      if (ticket?.library?.id != null) {
        return Number(ticket.library.id) === Number(form.libraryId);
      }

      // Older ticket responses may expose only libraryName.
      if (ticket?.libraryName && selectedLibrary?.name) {
        return ticket.libraryName === selectedLibrary.name;
      }

      // Keep backwards compatibility when no library identifier is exposed.
      return true;
    });
  }, [tickets, form.libraryId, selectedLibrary]);

  const ticketSummary = useMemo(() => {
    const openLike = new Set([
      "OPEN",

      "IN_PROGRESS",

      "WAITING_FOR_USER",

      "WAITING_FOR_SUPPORT",
    ]);

    return {
      total: workingLibraryTickets.length,

      open: workingLibraryTickets.filter((ticket) =>
        openLike.has(ticket.status),
      ).length,

      waitingForUser: workingLibraryTickets.filter(
        (ticket) => ticket.status === "WAITING_FOR_USER",
      ).length,

      resolved: workingLibraryTickets.filter(
        (ticket) => ticket.status === "RESOLVED",
      ).length,
    };
  }, [workingLibraryTickets]);

  const visibleTickets = useMemo(() => {
    const list =
      ticketFilter === "ALL"
        ? workingLibraryTickets
        : workingLibraryTickets.filter(
            (ticket) => ticket.status === ticketFilter,
          );

    return list.slice(0, 6);
  }, [workingLibraryTickets, ticketFilter]);

  const loadLibraries = useCallback(async () => {
    try {
      setLibrariesLoading(true);

      setLibrariesError("");

      const response = await api.get("/api/libraries/my");

      const normalized = normalizeListResponse(response?.data ?? response);

      setLibraries(normalized);

      setForm((current) => {
        if (normalized.length === 0) {
          return { ...current, libraryId: "" };
        }

        const storedLibraryId = getStoredLibraryId();

        const storedLibrary =
          storedLibraryId != null
            ? normalized.find(
                (library) => Number(library.id) === storedLibraryId,
              )
            : null;

        const nextLibraryId = String(storedLibrary?.id ?? normalized[0].id);

        storeLibraryId(nextLibraryId);

        return {
          ...current,

          libraryId: nextLibraryId,
        };
      });
    } catch (requestError) {
      console.error("Failed to load owner libraries:", requestError);

      setLibraries([]);

      setLibrariesError("Unable to load your libraries.");
    } finally {
      setLibrariesLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    try {
      setTicketsLoading(true);

      setTicketsError("");

      const data = await supportTicketApi.getOwnerTickets();

      setTickets(Array.isArray(data) ? data : normalizeListResponse(data));
    } catch (requestError) {
      console.error("Failed to load owner support tickets:", requestError);

      setTickets([]);

      setTicketsError("Unable to load your support tickets.");
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibraries();

    loadTickets();
  }, [loadLibraries, loadTickets]);

  useEffect(() => {
    const handleLibraryChanged = (event) => {
      const nextId = Number(event?.detail?.libraryId);

      if (!Number.isFinite(nextId)) return;

      setForm((current) => ({
        ...current,

        libraryId: String(nextId),
      }));

      storeLibraryId(nextId);

      setTicketFilter("ALL");

      setError("");

      setSuccess("");
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, []);

  const handleLibraryChange = (event) => {
    const nextId = String(event.target.value);

    setForm((current) => ({
      ...current,

      libraryId: nextId,
    }));

    storeLibraryId(nextId);

    setTicketFilter("ALL");

    setError("");

    setSuccess("");

    setCreatedTicket(null);

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: Number(nextId) },
      }),
    );
  };

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,

      [field]: event.target.value,
    }));

    setError("");

    setSuccess("");

    setCreatedTicket(null);
  };

  const handleRefresh = async () => {
    await Promise.all([loadLibraries(), loadTickets()]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");

    setError("");

    setCreatedTicket(null);

    if (!form.libraryId) {
      setError("Please select a library.");

      return;
    }

    if (!form.category) {
      setError("Please select an issue category.");

      return;
    }

    if (!form.subject.trim()) {
      setError("Please enter a subject.");

      return;
    }

    if (!form.message.trim()) {
      setError("Please describe your issue.");

      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        scope: "PLATFORM",

        libraryId: Number(form.libraryId),

        category: form.category,

        subject: form.subject.trim(),

        description: form.message.trim(),
      };

      const ticket = await supportTicketApi.createOwnerTicket(payload);

      setCreatedTicket(ticket);

      setSuccess(
        ticket?.ticketNumber
          ? `Your LibraryHub support request has been created. Ticket: ${ticket.ticketNumber}`
          : "Your LibraryHub support request has been created.",
      );

      setForm((current) => ({
        libraryId: current.libraryId,

        category: "",

        subject: "",

        message: "",
      }));

      await loadTickets();
    } catch (requestError) {
      console.error("Failed to create owner support ticket:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to create your support request.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      {/* PREMIUM HERO */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 5,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.13),

          overflow: "hidden",

          position: "relative",

          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.11)}, ${
            theme.palette.background.paper
          } 56%, ${alpha(theme.palette.info.main, 0.05)})`,

          "&::after": {
            content: '""',

            position: "absolute",

            right: -65,

            top: -105,

            width: 245,

            height: 245,

            borderRadius: "50%",

            bgcolor: alpha(theme.palette.primary.main, 0.055),
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: { xs: 2.5, md: 3.5 },

            "&:last-child": { pb: { xs: 2.5, md: 3.5 } },
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 60,

                  height: 60,

                  minWidth: 60,

                  borderRadius: 3.2,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.26)}`,
                }}
              >
                <SupportAgent />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Typography
                    variant="h4"
                    fontWeight={850}
                    sx={{ letterSpacing: "-0.025em" }}
                  >
                    Help & Support
                  </Typography>

                  <Chip
                    size="small"
                    icon={<AutoAwesome />}
                    label="Owner Support Center"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                  />
                </Stack>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Get help, track LibraryHub requests, and manage student
                  support from one workspace.
                </Typography>

                {selectedLibrary && (
                  <Chip
                    size="small"
                    label={selectedLibrary.name}
                    variant="outlined"
                    sx={{ mt: 1, fontWeight: 700, bgcolor: "background.paper" }}
                  />
                )}
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.3}
              alignItems="stretch"
            >
              <TextField
                select
                size="small"
                label="Working Library"
                value={form.libraryId}
                onChange={handleLibraryChange}
                disabled={librariesLoading || libraries.length === 0}
                sx={{
                  minWidth: { xs: "100%", sm: 240 },

                  bgcolor: "background.paper",

                  borderRadius: 2.5,
                }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name || `Library #${library.id}`}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={
                  ticketsLoading || librariesLoading ? (
                    <CircularProgress size={17} />
                  ) : (
                    <Refresh />
                  )
                }
                onClick={handleRefresh}
                disabled={ticketsLoading || librariesLoading}
                sx={{
                  minHeight: 44,

                  px: 2.2,

                  borderRadius: 2.5,

                  fontWeight: 800,

                  bgcolor: "background.paper",
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {librariesError && (
        <Alert severity="warning" sx={{ mb: 2.5 }}>
          {librariesError}
        </Alert>
      )}

      {/* SUPPORT METRICS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Support Tickets"
            value={ticketSummary.total}
            subtitle="for current working library"
            icon={<ForumOutlined />}
            onClick={() => setTicketFilter("ALL")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Open Attention"
            value={ticketSummary.open}
            subtitle="active conversations"
            icon={<SupportAgent />}
            tone="info"
            onClick={() => setTicketFilter("OPEN")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Waiting for You"
            value={ticketSummary.waitingForUser}
            subtitle="response needed"
            icon={<HourglassTop />}
            tone="warning"
            onClick={() => setTicketFilter("WAITING_FOR_USER")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Resolved"
            value={ticketSummary.resolved}
            subtitle="successfully completed"
            icon={<CheckCircleOutlineOutlined />}
            tone="success"
            onClick={() => setTicketFilter("RESOLVED")}
          />
        </Grid>
      </Grid>

      {/* QUICK ACTIONS */}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={850}>
            Support Center
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Choose where you want to go next.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <ActionCard
            icon={<ChatBubbleOutlineOutlined />}
            title="Create Support Request"
            description="Report a LibraryHub platform, payment, billing, settlement or technical issue."
            actionLabel="Create Request"
            onClick={() =>
              document

                .getElementById("owner-support-form")

                ?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <ActionCard
            icon={<SupportAgent />}
            title="My Support Tickets"
            description="Track requests you have submitted to the LibraryHub support team and continue conversations."
            actionLabel="View Tickets"
            onClick={() => navigate("/owner/support/tickets")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <ActionCard
            icon={<LibraryBooksOutlined />}
            title="Student Support"
            description="View and respond to support requests submitted by students for your libraries."
            actionLabel="Open Student Support"
            onClick={() => navigate("/owner/student-support")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, xl: 3 }}>
          <ActionCard
            icon={<HelpOutlineOutlined />}
            title="Help & Documentation"
            description="Browse module guides, common workflows and owner documentation without leaving the Support Center."
            actionLabel="Browse Documentation"
            onClick={() =>
              document.getElementById("owner-documentation")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
          />
        </Grid>
      </Grid>

      {/* RECENT TICKETS */}

      <Card
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
            p: { xs: 2.4, md: 3 },

            "&:last-child": { pb: { xs: 2.4, md: 3 } },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Recent Support Tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4 }}
              >
                Latest LibraryHub requests for{" "}
                {selectedLibrary?.name || "your working library"}.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                select
                size="small"
                label="Ticket Status"
                value={ticketFilter}
                onChange={(event) => setTicketFilter(event.target.value)}
                sx={{ minWidth: 180 }}
              >
                {ticketFilterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadTickets}
                disabled={ticketsLoading}
                sx={{ fontWeight: 700, borderRadius: 2.3 }}
              >
                Refresh
              </Button>

              <Button
                size="small"
                endIcon={<OpenInNew />}
                onClick={() => navigate("/owner/support/tickets")}
                sx={{ fontWeight: 700 }}
              >
                View All
              </Button>
            </Stack>
          </Stack>

          {ticketsError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
              {ticketsError}
            </Alert>
          )}

          {ticketsLoading ? (
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid key={item} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Skeleton
                    variant="rounded"
                    height={190}
                    sx={{ borderRadius: 3 }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : visibleTickets.length === 0 ? (
            <Box
              sx={{
                py: 5,

                textAlign: "center",

                bgcolor: alpha(theme.palette.grey[100], 0.6),

                borderRadius: 3,
              }}
            >
              <SupportAgent sx={{ fontSize: 44, color: "text.disabled" }} />

              <Typography fontWeight={800} sx={{ mt: 1 }}>
                No matching support tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Create a request whenever you need assistance from LibraryHub.
              </Typography>

              <Button
                size="small"
                sx={{ mt: 1.5, fontWeight: 700 }}
                onClick={() =>
                  document

                    .getElementById("owner-support-form")

                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Create Request
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {visibleTickets.map((ticket) => (
                <Grid key={ticket.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <TicketCard
                    ticket={ticket}
                    onClick={() =>
                      navigate(`/owner/support/tickets/${ticket.id}`)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* DOCUMENTATION */}
      <Card
        id="owner-documentation"
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          mb: 4,
          scrollMarginTop: 96,
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
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                useFlexGap
                flexWrap="wrap"
              >
                <Typography variant="h6" fontWeight={850}>
                  Help & Documentation
                </Typography>

                <Chip
                  size="small"
                  icon={<LibraryBooksOutlined />}
                  label={`${filteredDocumentation.length} modules`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  maxWidth: 720,
                  lineHeight: 1.65,
                }}
              >
                Browse owner guides for setup, seats, members, bookings,
                payments, automation and support workflows.
              </Typography>
            </Box>

            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documentation"
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

          <Divider sx={{ mb: 2.5 }} />

          {filteredDocumentation.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <LibraryBooksOutlined
                sx={{
                  fontSize: 46,
                  color: "text.disabled",
                }}
              />

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  mt: 1,
                }}
              >
                No documentation found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Try a broader search or review the FAQs below.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredDocumentation.map((item) => {
                const DocumentationIcon = item.icon;

                return (
                  <Grid
                    key={item.id}
                    size={{
                      xs: 12,
                      md: 6,
                      xl: 3,
                    }}
                  >
                    <DocumentationCard
                      icon={<DocumentationIcon />}
                      title={item.title}
                      description={item.description}
                      topics={item.topics}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}

      <Card
        id="owner-support-faq"
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 4,

          mb: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 2.4, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Frequently Asked Questions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.4 }}
              >
                Find answers for common owner and platform issues before opening
                a ticket.
              </Typography>
            </Box>

            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search FAQs"
              sx={{
                width: { xs: "100%", md: 350 },

                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
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

          <Divider />

          {filteredFaqs.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <HelpOutlineOutlined
                sx={{ fontSize: 44, color: "text.disabled" }}
              />

              <Typography fontWeight={800} sx={{ mt: 1 }}>
                No help articles found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Try a broader search or submit a support request below.
              </Typography>
            </Box>
          ) : (
            filteredFaqs.map((item) => (
              <Accordion
                key={item.id}
                disableGutters
                elevation={0}
                sx={{
                  "&:before": { display: "none" },

                  borderBottom: "1px solid",

                  borderColor: "divider",
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Chip
                      size="small"
                      label={item.category}
                      color="primary"
                      variant="outlined"
                    />

                    <Typography fontWeight={700}>{item.question}</Typography>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 0, pb: 2.5 }}>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* CREATE REQUEST */}

      <Card
        id="owner-support-form"
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.18),

          borderRadius: 4,

          overflow: "hidden",
        }}
      >
        <Grid container>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box
              sx={{
                height: "100%",

                p: { xs: 2.8, md: 3.5 },

                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.11)}, ${alpha(theme.palette.primary.main, 0.025)})`,
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
                <SettingsOutlined />
              </Box>

              <Typography variant="h5" fontWeight={850}>
                Need platform help?
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.7 }}
              >
                Submit a tracked request to the LibraryHub platform support
                team. Your current working library is preselected automatically.
              </Typography>

              <Stack spacing={1.4} sx={{ mt: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentsOutlined color="primary" fontSize="small" />

                  <Typography variant="body2">
                    Payment & settlement issues
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <SettingsOutlined color="primary" fontSize="small" />

                  <Typography variant="body2">
                    Platform configuration
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <LibraryBooksOutlined color="primary" fontSize="small" />

                  <Typography variant="body2">
                    Library management issues
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" fontWeight={700}>
                Email support
              </Typography>

              <Button
                size="small"
                startIcon={<EmailOutlined />}
                onClick={() => {
                  window.location.href = "mailto:support\@libraryhub.in";
                }}
                sx={{ mt: 0.7, px: 0, textTransform: "none", fontWeight: 700 }}
              >
                support\@libraryhub.in
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={850}>
                    Submit a LibraryHub Support Request
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Provide enough information for the LibraryHub team to
                    investigate efficiently.
                  </Typography>
                </Box>

                {selectedLibrary && (
                  <Chip
                    size="small"
                    icon={<BusinessOutlined />}
                    label={selectedLibrary.name}
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              {success && (
                <Alert
                  severity="success"
                  onClose={() => {
                    setSuccess("");

                    setCreatedTicket(null);
                  }}
                  sx={{ mb: 2.5, borderRadius: 2.5 }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {success}
                  </Typography>

                  {createdTicket?.ticketNumber && (
                    <Typography variant="caption" color="inherit">
                      Keep this ticket number for future reference.
                    </Typography>
                  )}
                </Alert>
              )}

              {error && (
                <Alert
                  severity="error"
                  onClose={() => setError("")}
                  sx={{ mb: 2.5, borderRadius: 2.5 }}
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
                    label="Library"
                    value={form.libraryId}
                    onChange={handleLibraryChange}
                    disabled={librariesLoading}
                    helperText={
                      librariesError ||
                      "Selected from your current owner workspace."
                    }
                  >
                    {librariesLoading && (
                      <MenuItem disabled>
                        <CircularProgress size={18} sx={{ mr: 1 }} />
                        Loading libraries...
                      </MenuItem>
                    )}

                    {!librariesLoading && libraries.length === 0 && (
                      <MenuItem disabled>No libraries available</MenuItem>
                    )}

                    {libraries.map((library) => (
                      <MenuItem key={library.id} value={String(library.id)}>
                        {library.name || `Library #${library.id}`}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    required
                    label="Issue Category"
                    value={form.category}
                    onChange={handleChange("category")}
                  >
                    {supportCategories.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    required
                    label="Subject"
                    value={form.subject}
                    onChange={handleChange("subject")}
                    placeholder="Briefly describe the issue"
                    slotProps={{ htmlInput: { maxLength: 150 } }}
                    helperText={`${form.subject.length}/150`}
                  />

                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={5}
                    maxRows={8}
                    label="Describe your issue"
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Explain what happened, what you expected, and include relevant payment, settlement, configuration or technical details."
                    slotProps={{ htmlInput: { maxLength: 2000 } }}
                    helperText={`${form.message.length}/2000`}
                  />

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={1.5}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Requests are saved against the selected library and can be
                      tracked from My Support Tickets.
                    </Typography>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting || librariesLoading}
                      startIcon={
                        submitting ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <SendOutlined />
                        )
                      }
                      sx={{
                        minHeight: 46,

                        px: 3,

                        borderRadius: 2.5,

                        textTransform: "none",

                        fontWeight: 800,

                        whiteSpace: "nowrap",
                      }}
                    >
                      {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                  </Stack>
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
