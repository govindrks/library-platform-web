import {
    ErrorOutlineOutlined,
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
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import whatsappAdminApi from "../../../api/whatsappAdminApi";

import WhatsAppDeliveryStatusChip from "../../../components/whatsapp/WhatsAppDeliveryStatusChip";

import WhatsAppMessageDetailsDialog from "../../../components/whatsapp/WhatsAppMessageDetailsDialog";

import WhatsAppRetryDialog from "../../../components/whatsapp/WhatsAppRetryDialog";

// ============================================================
// FILTER OPTIONS
// ============================================================

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
// WHATSAPP FAILURES
// ============================================================

function WhatsAppFailures() {
  // ==========================================================
  // FILTER STATE
  // ==========================================================

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

  const [failures, setFailures] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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
  // LOAD FAILURES
  // ==========================================================

  const loadFailures = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await whatsappAdminApi.getFailures({
        page,
        size: pageSize,
        notificationType,
        search: debouncedSearch,
      });

      const data = response?.data ?? response ?? {};

      const content = Array.isArray(data)
        ? data
        : (data.content ?? data.failures ?? data.messages ?? []);

      const backendTotalPages = Number(data.totalPages ?? 1);

      setFailures(content);

      setTotalPages(
        Number.isFinite(backendTotalPages) && backendTotalPages > 0
          ? backendTotalPages
          : 1,
      );
    } catch (exception) {
      setFailures([]);

      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to load WhatsApp failures.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, notificationType, debouncedSearch]);

  useEffect(() => {
    loadFailures();
  }, [loadFailures]);

  // ==========================================================
  // DETAILS
  // ==========================================================

  const handleOpenDetails = (message) => {
    setSelectedMessage(message);

    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);

    setSelectedMessage(null);
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleOpenRetry = (message) => {
    setSelectedMessage(message);

    setRetryOpen(true);
  };

  const handleCloseRetry = () => {
    if (retryLoading) {
      return;
    }

    setRetryOpen(false);

    setSelectedMessage(null);
  };

  const handleRetry = async ({ messageId, note }) => {
    try {
      setRetryLoading(true);

      setError("");
      setSuccess("");

      await whatsappAdminApi.retryFailure(messageId, {
        note,
      });

      setRetryOpen(false);

      setSelectedMessage(null);

      setSuccess("Retry request submitted successfully.");

      await loadFailures();
    } catch (exception) {
      const message =
        exception?.response?.data?.message ||
        exception?.response?.data?.error ||
        exception?.message ||
        "Unable to retry the WhatsApp message.";

      setError(message);

      throw exception;
    } finally {
      setRetryLoading(false);
    }
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
            <ErrorOutlineOutlined
              color="error"
              sx={{
                fontSize: 31,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Failures
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Review failed WhatsApp deliveries and safely retry eligible
                messages.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            disabled={loading}
            startIcon={<Refresh />}
            onClick={loadFailures}
          >
            Refresh
          </Button>
        </Stack>

        {/* ================================================= */}
        {/* SAFETY */}
        {/* ================================================= */}

        <Alert severity="warning">
          A failed message and an uncertain provider submission are not the same
          thing. Retry should only be available when the backend has confirmed
          that another send is safe.
        </Alert>

        {/* ================================================= */}
        {/* SUCCESS */}
        {/* ================================================= */}

        {success && (
          <Alert severity="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

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
                placeholder="Search phone, recipient, library or reference..."
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
                label="Notification type"
                value={notificationType}
                onChange={(event) => {
                  setNotificationType(event.target.value);

                  setPage(0);
                }}
                sx={{
                  minWidth: 240,
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

        {!loading && !error && failures.length === 0 && (
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
                  fontSize: 48,

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
                No failed messages
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                No WhatsApp failures match the current filters.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ================================================= */}
        {/* FAILURES */}
        {/* ================================================= */}

        {!loading &&
          failures.map((failure) => {
            const messageId = failure.id ?? failure.messageId;

            const recipient =
              failure.recipientName ||
              failure.customerName ||
              failure.userName ||
              "Member";

            const phone =
              failure.recipientPhone || failure.phone || failure.to || "—";

            const libraryName =
              failure.libraryName || failure.library?.name || "—";

            const type = failure.notificationType || failure.type;

            const status = failure.status || failure.messageStatus || "FAILED";

            const failureReason =
              failure.failureReason ||
              failure.lastError ||
              failure.errorMessage ||
              "Failure reason unavailable.";

            const attemptCount = failure.attemptCount ?? failure.attempts ?? 0;

            const failedAt =
              failure.failedAt || failure.updatedAt || failure.createdAt;

            const retryable = failure.retryable === true;

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

                        <WhatsAppDeliveryStatusChip status={status} />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.4,
                        }}
                      >
                        {phone}
                      </Typography>

                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        sx={{
                          mt: 1.5,
                        }}
                      >
                        <Chip size="small" label={formatEnumLabel(type)} />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Library: ${libraryName}`}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={`Attempts: ${attemptCount}`}
                        />

                        <Chip
                          size="small"
                          variant="outlined"
                          label={formatDateTime(failedAt)}
                        />
                      </Stack>

                      <Box
                        sx={{
                          mt: 1.75,

                          p: 1.5,

                          borderRadius: 2,

                          backgroundColor: "rgba(211, 47, 47, 0.05)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={700}
                        >
                          Failure reason
                        </Typography>

                        <Typography
                          variant="body2"
                          color="error.main"
                          sx={{
                            mt: 0.25,

                            wordBreak: "break-word",
                          }}
                        >
                          {failureReason}
                        </Typography>
                      </Box>
                    </Box>

                    {/* ===================================== */}
                    {/* ACTIONS */}
                    {/* ===================================== */}

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="View details">
                        <IconButton onClick={() => handleOpenDetails(failure)}>
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>

                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        startIcon={<Refresh />}
                        disabled={!retryable}
                        onClick={() => handleOpenRetry(failure)}
                      >
                        Retry
                      </Button>
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
          <Box
            sx={{
              display: "flex",

              justifyContent: "center",

              pt: 1,
            }}
          >
            <Pagination
              page={page + 1}
              count={totalPages}
              color="primary"
              onChange={(event, value) => setPage(value - 1)}
            />
          </Box>
        )}
      </Stack>

      {/* ===================================================== */}
      {/* DETAILS */}
      {/* ===================================================== */}

      <WhatsAppMessageDetailsDialog
        open={detailsOpen}
        message={selectedMessage}
        onClose={handleCloseDetails}
      />

      {/* ===================================================== */}
      {/* RETRY */}
      {/* ===================================================== */}

      <WhatsAppRetryDialog
        open={retryOpen}
        message={selectedMessage}
        loading={retryLoading}
        onClose={handleCloseRetry}
        onRetry={handleRetry}
      />
    </Box>
  );
}

export default WhatsAppFailures;
