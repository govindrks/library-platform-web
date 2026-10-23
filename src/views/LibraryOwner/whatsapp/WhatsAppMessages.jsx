import {
  Refresh,
  Search,
  VisibilityOutlined,
  WhatsApp,
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
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import whatsappMessagesApi from "../../../api/whatsappMessagesApi";

import WhatsAppDeliveryStatusChip from "../../../components/whatsapp/WhatsAppDeliveryStatusChip";

import WhatsAppMessageDetailsDialog from "../../../components/whatsapp/WhatsAppMessageDetailsDialog";

import WhatsAppRetryDialog from "../../../components/whatsapp/WhatsAppRetryDialog";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },

  {
    value: "PENDING",
    label: "Pending",
  },

  {
    value: "SENDING",
    label: "Sending",
  },

  {
    value: "SENT",
    label: "Sent",
  },

  {
    value: "DELIVERED",
    label: "Delivered",
  },

  {
    value: "READ",
    label: "Read",
  },

  {
    value: "FAILED",
    label: "Failed",
  },
];

const TYPE_OPTIONS = [
  {
    value: "",
    label: "All notification types",
  },

  {
    value: "PAYMENT_INVOICE",
    label: "Payment Invoice",
  },

  {
    value: "BOOKING_CONFIRMATION",
    label: "Booking Confirmation",
  },

  {
    value: "SUBSCRIPTION_EXPIRY_REMINDER",
    label: "Expiry Reminder",
  },

  {
    value: "SEAT_CHANGE_APPROVED",
    label: "Seat Change Approved",
  },

  {
    value: "SEAT_CHANGE_REJECTED",
    label: "Seat Change Rejected",
  },

  {
    value: "PROMOTIONAL_MESSAGE",
    label: "Promotional Message",
  },
];

// ============================================================
// HELPERS
// ============================================================

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

function formatEnumLabel(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// ============================================================
// WHATSAPP MESSAGES PAGE
// ============================================================

function WhatsAppMessages() {
  // ==========================================================
  // LIBRARY
  // ==========================================================

  const libraryId = useMemo(() => getStoredLibraryId(), []);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [status, setStatus] = useState("");

  const [notificationType, setNotificationType] = useState("");

  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 20;

  // ==========================================================
  // DATA
  // ==========================================================

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // DETAILS DIALOG
  // ==========================================================

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);

  // ==========================================================
  // RETRY DIALOG
  // ==========================================================

  const [retryOpen, setRetryOpen] = useState(false);

  const [retryLoading, setRetryLoading] = useState(false);

  // ==========================================================
  // SEARCH DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPage(0);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  // ==========================================================
  // LOAD MESSAGES
  // ==========================================================

  const loadMessages = useCallback(async () => {
    if (!libraryId) {
      setMessages([]);

      setError("No library is currently selected.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await whatsappMessagesApi.getLibraryMessages({
        libraryId,
        page,
        size: pageSize,
        status,
        notificationType,
        search: debouncedSearch,
      });

      const data = response?.data ?? response ?? {};

      /*
       * Supports:
       *
       * Spring Page:
       * {
       *   content: [],
       *   totalPages: 1
       * }
       *
       * or:
       *
       * {
       *   messages: [],
       *   totalPages: 1
       * }
       */

      const content = Array.isArray(data)
        ? data
        : (data.content ?? data.messages ?? []);

      const backendTotalPages = Number(data.totalPages ?? 1);

      setMessages(content);

      setTotalPages(
        Number.isFinite(backendTotalPages) && backendTotalPages > 0
          ? backendTotalPages
          : 1,
      );
    } catch (exception) {
      setMessages([]);

      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to load WhatsApp messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [libraryId, page, status, notificationType, debouncedSearch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ==========================================================
  // DETAILS
  // ==========================================================

  const openDetails = (message) => {
    setSelectedMessage(message);

    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);

    setSelectedMessage(null);
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const openRetry = (message) => {
    setSelectedMessage(message);

    setRetryOpen(true);
  };

  const closeRetry = () => {
    if (retryLoading) {
      return;
    }

    setRetryOpen(false);

    setSelectedMessage(null);
  };

  const handleRetry = async ({ messageId, note }) => {
    try {
      setRetryLoading(true);

      await whatsappMessagesApi.retryMessage(messageId, {
        note,
      });

      setRetryOpen(false);

      setSelectedMessage(null);

      await loadMessages();
    } finally {
      setRetryLoading(false);
    }
  };

  // ==========================================================
  // FILTER CHANGES
  // ==========================================================

  const handleStatusChange = (event) => {
    setStatus(event.target.value);

    setPage(0);
  };

  const handleTypeChange = (event) => {
    setNotificationType(event.target.value);

    setPage(0);
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        p: {
          xs: 2,

          md: 3,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "flex-start",

            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WhatsApp
              sx={{
                color: "#25D366",

                fontSize: 30,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Messages
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Review WhatsApp notification history and delivery status.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            disabled={loading}
            onClick={loadMessages}
          >
            Refresh
          </Button>
        </Stack>

        {/* ================================================= */}
        {/* DEVELOPMENT INFO */}
        {/* ================================================= */}

        <Alert severity="info">
          Live Meta message delivery is not enabled yet. This page is ready for
          integration with your WhatsApp message history backend.
        </Alert>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction={{
                xs: "column",

                md: "row",
              }}
              spacing={2}
            >
              <TextField
                fullWidth
                placeholder="Search phone, recipient or reference..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                      }}
                    />
                  ),
                }}
              />

              <TextField
                select
                label="Status"
                value={status}
                onChange={handleStatusChange}
                sx={{
                  minWidth: 180,
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Notification type"
                value={notificationType}
                onChange={handleTypeChange}
                sx={{
                  minWidth: 230,
                }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <Box
            sx={{
              display: "flex",

              justifyContent: "center",

              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading && messages.length === 0 && !error && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid",

              borderColor: "divider",

              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                py: 6,

                textAlign: "center",
              }}
            >
              <WhatsApp
                sx={{
                  fontSize: 46,

                  color: "text.disabled",

                  mb: 1,
                }}
              />

              <Typography variant="h6" fontWeight={700}>
                No WhatsApp messages
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                No messages match the selected filters.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ================================================= */}
        {/* MESSAGES */}
        {/* ================================================= */}

        {!loading &&
          messages.map((message) => {
            const messageId = message.id ?? message.messageId;

            const recipient =
              message.recipientName ||
              message.customerName ||
              message.userName ||
              "Member";

            const phone = message.recipientPhone || message.phone || "—";

            const type = message.notificationType || message.type;

            const currentStatus = message.status || message.messageStatus;

            const createdAt = message.createdAt;

            const lastError =
              message.lastError ||
              message.errorMessage ||
              message.failureReason;

            const retryable =
              currentStatus === "FAILED" || message.retryable === true;

            return (
              <Card
                key={messageId}
                elevation={0}
                sx={{
                  border: "1px solid",

                  borderColor: "divider",

                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack
                    direction={{
                      xs: "column",

                      md: "row",
                    }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",

                          sm: "row",
                        }}
                        spacing={1}
                        alignItems={{
                          xs: "flex-start",

                          sm: "center",
                        }}
                      >
                        <Typography variant="h6" fontWeight={800}>
                          {recipient}
                        </Typography>

                        <WhatsAppDeliveryStatusChip status={currentStatus} />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                        }}
                      >
                        {phone}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{
                          mt: 1.5,

                          gap: 1,
                        }}
                      >
                        <Chip size="small" label={formatEnumLabel(type)} />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={formatDateTime(createdAt)}
                        />
                      </Stack>

                      {lastError && (
                        <Typography
                          variant="body2"
                          color="error.main"
                          sx={{
                            mt: 1.5,

                            maxWidth: 650,
                          }}
                        >
                          {lastError}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="View details">
                        <IconButton onClick={() => openDetails(message)}>
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>

                      {retryable && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<Refresh />}
                          onClick={() => openRetry(message)}
                        >
                          Retry
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

        {/* ================================================= */}
        {/* PAGINATION */}
        {/* ================================================= */}

        {!loading && totalPages > 1 && (
          <>
            <Divider />

            <Box
              sx={{
                display: "flex",

                justifyContent: "center",

                py: 1,
              }}
            >
              <Pagination
                page={page + 1}
                count={totalPages}
                color="primary"
                onChange={(event, value) => {
                  setPage(value - 1);
                }}
              />
            </Box>
          </>
        )}
      </Stack>

      {/* ===================================================== */}
      {/* DETAILS DIALOG */}
      {/* ===================================================== */}

      <WhatsAppMessageDetailsDialog
        open={detailsOpen}
        message={selectedMessage}
        onClose={closeDetails}
      />

      {/* ===================================================== */}
      {/* RETRY DIALOG */}
      {/* ===================================================== */}

      <WhatsAppRetryDialog
        open={retryOpen}
        message={selectedMessage}
        loading={retryLoading}
        onClose={closeRetry}
        onRetry={handleRetry}
      />
    </Box>
  );
}

export default WhatsAppMessages;
