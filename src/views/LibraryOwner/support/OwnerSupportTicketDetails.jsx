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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AccessTimeRounded,
  AutoAwesomeRounded,
  BusinessOutlined,
  CheckCircleOutlineRounded,
  Close,
  ForumOutlined,
  LibraryBooksOutlined,
  PersonOutlineOutlined,
  Refresh,
  SendOutlined,
  SupportAgent,
  WarningAmberRounded,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// OWNER WORKSPACE
// ============================================================
const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

function storeOwnerLibraryId(libraryId) {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));

  window.dispatchEvent(
    new CustomEvent("owner-library-changed", {
      detail: { libraryId: id },
    }),
  );
}

function getInitials(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return "?";
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// ============================================================
// STATUS CONFIGURATION
// ============================================================
const STATUS_META = {
  OPEN: {
    label: "Open",

    color: "info",
  },

  IN_PROGRESS: {
    label: "In Progress",

    color: "primary",
  },

  WAITING_FOR_USER: {
    label: "Waiting for User",

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
// OWNER STATUS OPTIONS
// ============================================================
const LIBRARY_TICKET_STATUS_OPTIONS = [
  {
    value: "OPEN",

    label: "Open",
  },

  {
    value: "IN_PROGRESS",

    label: "In Progress",
  },

  {
    value: "WAITING_FOR_USER",

    label: "Waiting for Student",
  },

  {
    value: "WAITING_FOR_SUPPORT",

    label: "Waiting for Support",
  },

  {
    value: "RESOLVED",

    label: "Resolved",
  },

  {
    value: "CLOSED",

    label: "Closed",
  },
];

// ============================================================
// PRIORITY CONFIGURATION
// ============================================================
const PRIORITY_META = {
  LOW: {
    label: "Low",

    color: "default",
  },

  MEDIUM: {
    label: "Medium",

    color: "info",
  },

  HIGH: {
    label: "High",

    color: "warning",
  },

  URGENT: {
    label: "Urgent",

    color: "error",
  },
};

// ============================================================
// HELPERS
// ============================================================
function formatEnumLabel(value) {
  if (!value) {
    return "—";
  }

  return value

    .replaceAll("_", " ")

    .toLowerCase()

    .replace(/\b\w/g, (character) => character.toUpperCase());
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
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(date);
}

// ============================================================
// INFO ITEM
// ============================================================
function InfoItem({ label, value, icon }) {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.8}
        alignItems="center"
        sx={{
          mb: 0.5,
        }}
      >
        {icon && (
          <Box
            sx={{
              display: "flex",

              alignItems: "center",

              color: "text.secondary",
            }}
          >
            {icon}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        fontWeight={700}
        sx={{
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================
function MessageBubble({ message, mode, ownerId }) {
  const isOwner =
    message?.senderRole === "LIBRARY_OWNER" ||
    (ownerId && message?.senderId === ownerId);

  const isStudent = message?.senderRole === "USER";

  const isAdmin = message?.senderRole === "ADMIN";

  const isCurrentSide = isOwner;

  const profileImageUrl =
    message?.senderProfileImageUrl || message?.profileImageUrl || null;

  let senderLabel = message?.senderName || "Support";

  if (isOwner) {
    senderLabel = "You";
  } else if (isAdmin) {
    senderLabel = "LibraryHub Support";
  } else if (isStudent) {
    senderLabel =
      mode === "LIBRARY" ? message?.senderName || "Student" : "User";
  }

  return (
    <Stack
      direction="row"
      justifyContent={isCurrentSide ? "flex-end" : "flex-start"}
      spacing={1.2}
      alignItems="flex-start"
    >
      {!isCurrentSide && (
        <Avatar
          src={profileImageUrl || undefined}
          alt={senderLabel}
          sx={{
            width: 38,

            height: 38,

            bgcolor: isAdmin ? "primary.light" : "rgba(245,158,11,0.15)",

            color: isAdmin ? "primary.dark" : "warning.dark",
          }}
        >
          {!profileImageUrl &&
            (isAdmin ? <SupportAgent /> : getInitials(senderLabel))}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: {
            xs: "88%",

            md: "72%",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={isCurrentSide ? "flex-end" : "flex-start"}
          sx={{
            mb: 0.5,
          }}
        >
          <Typography variant="caption" fontWeight={800}>
            {senderLabel}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {formatDateTime(message?.createdAt)}
          </Typography>
        </Stack>

        <Box
          sx={{
            px: 2,

            py: 1.5,

            borderRadius: 3,

            bgcolor: isCurrentSide ? "primary.main" : "rgba(15,23,42,0.045)",

            color: isCurrentSide ? "primary.contrastText" : "text.primary",

            border: isCurrentSide ? "none" : "1px solid",

            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.7,

              whiteSpace: "pre-wrap",

              wordBreak: "break-word",
            }}
          >
            {message?.message}
          </Typography>
        </Box>
      </Box>

      {isCurrentSide && (
        <Avatar
          src={profileImageUrl || undefined}
          alt={senderLabel}
          sx={{
            width: 38,
            height: 38,
            bgcolor: "rgba(79,70,229,0.10)",
            color: "primary.main",
          }}
        >
          {!profileImageUrl && <BusinessOutlined />}
        </Avatar>
      )}
    </Stack>
  );
}

// ============================================================
// OWNER SUPPORT TICKET DETAILS
// ============================================================
function OwnerSupportTicketDetails() {
  const navigate = useNavigate();

  const { ticketId, libraryId } = useParams();

  // ==========================================================
  // MODE
  // ==========================================================
  const isLibraryTicket = Boolean(libraryId);

  const mode = isLibraryTicket ? "LIBRARY" : "PLATFORM";

  // ==========================================================
  // STATE
  // ==========================================================
  const [ticket, setTicket] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reply, setReply] = useState("");

  const [sending, setSending] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [closing, setClosing] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const conversationEndRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [success, setSuccess] = useState("");

  const [actionError, setActionError] = useState("");

  // ==========================================================
  // DERIVED
  // ==========================================================
  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  const priority = PRIORITY_META[ticket?.priority] || PRIORITY_META.MEDIUM;

  const messages = useMemo(
    () => (Array.isArray(ticket?.messages) ? ticket.messages : []),
    [ticket],
  );

  useEffect(() => {
    if (!messages.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      conversationEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [messages.length]);

  const isClosed = ticket?.status === "CLOSED";

  // ==========================================================
  // LOAD TICKET
  // ==========================================================
  const loadTicket = useCallback(async () => {
    if (!ticketId) {
      setError("Support ticket ID is missing.");

      setLoading(false);

      return;
    }

    try {
      setLoading(true);

      setError("");

      let data;

      if (isLibraryTicket) {
        data = await supportTicketApi.getLibrarySupportTicket(
          libraryId,

          ticketId,
        );
      } else {
        data = await supportTicketApi.getOwnerTicket(ticketId);
      }

      setTicket(data);

      setSelectedStatus(data?.status || "");

      const resolvedLibraryId = Number(data?.libraryId ?? libraryId);

      if (Number.isFinite(resolvedLibraryId)) {
        storeOwnerLibraryId(resolvedLibraryId);
      }
    } catch (requestError) {
      console.error("Failed to load owner support ticket:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to load this support ticket.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticketId, libraryId, isLibraryTicket]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // ==========================================================
  // SEND REPLY
  // ==========================================================
  const handleSendReply = async (event) => {
    event.preventDefault();

    setActionError("");

    setSuccess("");

    const normalized = reply.trim();

    if (!normalized) {
      setActionError("Please enter a message.");

      return;
    }

    if (isClosed) {
      setActionError("This ticket is closed and cannot receive new messages.");

      return;
    }

    try {
      setSending(true);

      if (isLibraryTicket) {
        await supportTicketApi.replyToStudentTicket(libraryId, ticketId, {
          message: normalized,
        });
      } else {
        await supportTicketApi.sendOwnerMessage(ticketId, {
          message: normalized,
        });
      }

      setReply("");

      setSuccess(
        isLibraryTicket
          ? "Reply sent to the student."
          : "Your reply has been sent to LibraryHub support.",
      );

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to send support reply:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to send your reply.";

      setActionError(message);
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // UPDATE LIBRARY TICKET STATUS
  // ==========================================================
  const handleUpdateStatus = async () => {
    if (!isLibraryTicket) {
      return;
    }

    if (!selectedStatus) {
      setActionError("Please select a status.");

      return;
    }

    if (selectedStatus === ticket?.status) {
      return;
    }

    try {
      setUpdatingStatus(true);

      setSuccess("");

      setActionError("");

      await supportTicketApi.updateLibraryTicketStatus(
        libraryId,

        ticketId,

        selectedStatus,
      );

      setSuccess("Ticket status updated successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to update support ticket status:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to update the ticket status.";

      setActionError(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================================
  // CLOSE OWNER'S PLATFORM TICKET
  // ==========================================================
  const handleCloseTicket = async () => {
    if (isLibraryTicket || isClosed) {
      return;
    }

    try {
      setClosing(true);

      setSuccess("");

      setActionError("");

      await supportTicketApi.closeOwnerTicket(ticketId);

      setSuccess("Support ticket closed successfully.");

      setCloseDialogOpen(false);

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to close owner support ticket:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to close this support ticket.";

      setActionError(message);
    } finally {
      setClosing(false);
    }
  };

  // ==========================================================
  // BACK
  // ==========================================================
  const handleBack = () => {
    if (isLibraryTicket) {
      navigate("/owner/student-support");

      return;
    }

    navigate("/owner/support/tickets");
  };

  // ==========================================================
  // LOADING
  // ==========================================================
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",

          pb: 5,
        }}
      >
        <Skeleton
          variant="rounded"
          height={170}
          sx={{
            mb: 3,

            borderRadius: 4,
          }}
        />

        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,

              lg: 8,
            }}
          >
            <Skeleton
              variant="rounded"
              height={480}
              sx={{
                borderRadius: 4,
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,

              lg: 4,
            }}
          >
            <Skeleton
              variant="rounded"
              height={360}
              sx={{
                borderRadius: 4,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================
  if (error || !ticket) {
    return (
      <Box
        sx={{
          width: "100%",

          pb: 5,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            mb: 2,

            textTransform: "none",

            fontWeight: 700,
          }}
        >
          Back
        </Button>

        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
          }}
        >
          {error || "Support ticket could not be found."}
        </Alert>
      </Box>
    );
  }

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

      {/* BACK */}

      {/* ===================================================== */}

      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{
          mb: 2,

          textTransform: "none",

          fontWeight: 700,
        }}
      >
        {isLibraryTicket
          ? "Back to Student Support"
          : "Back to My Support Tickets"}
      </Button>

      {/* ===================================================== */}

      {/* HERO */}

      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 4,

          border: "1px solid",

          borderColor: "rgba(79,70,229,0.13)",

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 60%, rgba(99,102,241,0.05))",

          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
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

              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",

              md: "flex-start",
            }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 56,

                  height: 56,

                  minWidth: 56,

                  borderRadius: 3,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  boxShadow: "0 10px 24px rgba(79,70,229,0.24)",
                }}
              >
                {isLibraryTicket ? <LibraryBooksOutlined /> : <SupportAgent />}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={800}
                >
                  {ticket.ticketNumber || `Ticket #${ticket.id}`}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    mt: 0.4,

                    letterSpacing: "-0.02em",
                  }}
                >
                  {ticket.subject}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.8,
                  }}
                >
                  {isLibraryTicket
                    ? `Student support request${ticket.requesterName ? ` from ${ticket.requesterName}` : ""}`
                    : "Your request to LibraryHub support"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                label={status.label}
                color={status.color}
                sx={{
                  fontWeight: 700,
                }}
              />

              <Chip
                label={`${priority.label} Priority`}
                color={priority.color}
                variant="outlined"
                sx={{
                  fontWeight: 700,
                }}
              />

              <Chip
                icon={<ForumOutlined />}
                label={`${messages.length} ${messages.length === 1 ? "message" : "messages"}`}
                variant="outlined"
                sx={{ fontWeight: 700, bgcolor: "background.paper" }}
              />

              <Chip
                icon={<AccessTimeRounded />}
                label={`Updated ${formatDateTime(ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt)}`}
                variant="outlined"
                sx={{ fontWeight: 700, bgcolor: "background.paper" }}
              />

              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadTicket}
                sx={{
                  textTransform: "none",

                  fontWeight: 700,

                  borderRadius: 2.3,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}

      {/* ALERTS */}

      {/* ===================================================== */}

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

      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{
            mb: 2.5,

            borderRadius: 2.5,
          }}
        >
          {actionError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* =================================================== */}

        {/* LEFT */}

        {/* =================================================== */}

        <Grid
          size={{
            xs: 12,

            lg: 8,
          }}
        >
          {/* ================================================= */}

          {/* ORIGINAL REQUEST */}

          {/* ================================================= */}

          <Card
            elevation={0}
            sx={{
              mb: 3,

              border: "1px solid",

              borderColor: "divider",
              borderRadius: 4,
              background:
                "linear-gradient(180deg, #FFFFFF 0%, rgba(248,250,252,0.72) 100%)",
              boxShadow: "0 14px 34px rgba(15,23,42,0.045)",
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
              <Typography variant="h6" fontWeight={800}>
                Original Request
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,

                  mb: 2,
                }}
              >
                {isLibraryTicket
                  ? "The issue originally submitted by the student."
                  : "The information you provided when creating this support request."}
              </Typography>

              <Divider
                sx={{
                  mb: 2,
                }}
              />

              <Typography
                sx={{
                  lineHeight: 1.75,

                  whiteSpace: "pre-wrap",

                  wordBreak: "break-word",
                }}
              >
                {ticket.description}
              </Typography>
            </CardContent>
          </Card>

          {/* ================================================= */}

          {/* CONVERSATION */}

          {/* ================================================= */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid",

              borderColor: "divider",

              borderRadius: 4,
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
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Conversation
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.4,
                    }}
                  >
                    {isLibraryTicket
                      ? "Conversation with the student."
                      : "Conversation with LibraryHub support."}
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  variant="outlined"
                  label={`${messages.length} ${
                    messages.length === 1 ? "Message" : "Messages"
                  }`}
                />
              </Stack>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              {messages.length === 0 ? (
                <Box
                  sx={{
                    py: 5,

                    textAlign: "center",

                    bgcolor: "rgba(248,250,252,0.75)",

                    borderRadius: 3,
                  }}
                >
                  <ForumOutlined
                    sx={{
                      fontSize: 44,

                      color: "text.disabled",
                    }}
                  />

                  <Typography
                    fontWeight={800}
                    sx={{
                      mt: 1,
                    }}
                  >
                    No replies yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Messages will appear here as the conversation continues.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      mode={mode}
                      ownerId={!isLibraryTicket ? ticket.requesterId : null}
                    />
                  ))}
                </Stack>
              )}

              {/* ============================================= */}

              {/* REPLY */}

              {/* ============================================= */}

              {!isClosed && (
                <>
                  <Divider
                    sx={{
                      my: 3,
                    }}
                  />

                  <Box component="form" onSubmit={handleSendReply}>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{
                        mb: 1,
                      }}
                    >
                      {isLibraryTicket
                        ? "Reply to Student"
                        : "Reply to LibraryHub Support"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ mb: 1.5 }}
                    >
                      {(isLibraryTicket
                        ? [
                            "Thanks for the update. I’m checking this now.",
                            "Could you share a little more detail so I can investigate?",
                          ]
                        : [
                            "Thanks for the update. I’ll review this and get back to you.",
                            "Could you please share the next steps?",
                          ]
                      ).map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          size="small"
                          variant="outlined"
                          startIcon={<AutoAwesomeRounded />}
                          onClick={() => setReply(suggestion)}
                          disabled={sending}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 700,
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </Stack>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      disabled={sending}
                      placeholder={
                        isLibraryTicket
                          ? "Type your response to the student..."
                          : "Type your message to LibraryHub support..."
                      }
                      slotProps={{
                        htmlInput: {
                          maxLength: 3000,
                        },
                      }}
                      helperText={`${reply.length}/3000`}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={sending || !reply.trim()}
                      startIcon={
                        sending ? (
                          <CircularProgress size={17} color="inherit" />
                        ) : (
                          <SendOutlined />
                        )
                      }
                      sx={{
                        mt: 1.5,

                        minHeight: 44,

                        px: 2.8,

                        borderRadius: 2.5,

                        textTransform: "none",

                        fontWeight: 700,
                      }}
                    >
                      {sending ? "Sending..." : "Send Reply"}
                    </Button>
                  </Box>
                </>
              )}

              {isClosed && (
                <Alert
                  severity="info"
                  icon={<CheckCircleOutline />}
                  sx={{
                    mt: 3,

                    borderRadius: 2.5,
                  }}
                >
                  This ticket is closed. New replies are no longer accepted.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================== */}

        {/* RIGHT */}

        {/* =================================================== */}

        <Grid
          size={{
            xs: 12,

            lg: 4,
          }}
        >
          <Stack spacing={3}>
            {/* =============================================== */}

            {/* DETAILS */}

            {/* =============================================== */}

            <Card
              elevation={0}
              sx={{
                border: "1px solid",

                borderColor: "divider",

                borderRadius: 4,
              }}
            >
              <CardContent
                sx={{
                  p: 2.6,

                  "&:last-child": {
                    pb: 2.6,
                  },
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  Ticket Details
                </Typography>

                <Divider
                  sx={{
                    my: 2,
                  }}
                />

                <Stack spacing={2.3}>
                  <InfoItem label="Ticket Number" value={ticket.ticketNumber} />

                  <InfoItem
                    label="Category"
                    value={formatEnumLabel(ticket.category)}
                  />

                  <InfoItem
                    label="Support Type"
                    value={
                      isLibraryTicket
                        ? "Student Library Support"
                        : "LibraryHub Platform Support"
                    }
                    icon={
                      isLibraryTicket ? (
                        <LibraryBooksOutlined fontSize="small" />
                      ) : (
                        <SupportAgent fontSize="small" />
                      )
                    }
                  />

                  {ticket.libraryName && (
                    <InfoItem label="Library" value={ticket.libraryName} />
                  )}

                  {isLibraryTicket && ticket.requesterName && (
                    <InfoItem
                      label="Student"
                      value={ticket.requesterName}
                      icon={<PersonOutlineOutlined fontSize="small" />}
                    />
                  )}

                  {isLibraryTicket && ticket.requesterEmail && (
                    <InfoItem
                      label="Student Email"
                      value={ticket.requesterEmail}
                    />
                  )}

                  <InfoItem
                    label="Created"
                    value={formatDateTime(ticket.createdAt)}
                  />

                  <InfoItem
                    label="Last Updated"
                    value={formatDateTime(
                      ticket.updatedAt || ticket.lastMessageAt,
                    )}
                  />

                  {ticket.resolvedAt && (
                    <InfoItem
                      label="Resolved"
                      value={formatDateTime(ticket.resolvedAt)}
                    />
                  )}

                  {ticket.closedAt && (
                    <InfoItem
                      label="Closed"
                      value={formatDateTime(ticket.closedAt)}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* =============================================== */}

            {/* LIBRARY TICKET STATUS MANAGEMENT */}

            {/* =============================================== */}

            {isLibraryTicket && !isClosed && (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",

                  borderColor: "divider",

                  borderRadius: 4,
                }}
              >
                <CardContent
                  sx={{
                    p: 2.6,

                    "&:last-child": {
                      pb: 2.6,
                    },
                  }}
                >
                  <Typography fontWeight={800}>Manage Status</Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.6,

                      mb: 2,

                      lineHeight: 1.6,
                    }}
                  >
                    Update the progress of this student's support request.
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                      },
                    }}
                  >
                    {LIBRARY_TICKET_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    fullWidth
                    variant="contained"
                    disabled={
                      updatingStatus || selectedStatus === ticket.status
                    }
                    onClick={handleUpdateStatus}
                    startIcon={
                      updatingStatus ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <CheckCircleOutlineOutlinedd />
                      )
                    }
                    sx={{
                      mt: 1.5,

                      minHeight: 44,

                      borderRadius: 2.5,

                      textTransform: "none",

                      fontWeight: 700,
                    }}
                  >
                    {updatingStatus ? "Updating..." : "Update Status"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* =============================================== */}

            {/* PLATFORM TICKET CLOSE */}

            {/* =============================================== */}

            {!isLibraryTicket && !isClosed && (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",

                  borderColor: "divider",

                  borderRadius: 4,
                }}
              >
                <CardContent
                  sx={{
                    p: 2.6,

                    "&:last-child": {
                      pb: 2.6,
                    },
                  }}
                >
                  <Typography fontWeight={800}>Issue resolved?</Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.7,

                      mb: 2,

                      lineHeight: 1.6,
                    }}
                  >
                    Close this ticket once you no longer need assistance from
                    LibraryHub.
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    disabled={closing}
                    onClick={() => setCloseDialogOpen(true)}
                    startIcon={
                      closing ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <Close />
                      )
                    }
                    sx={{
                      minHeight: 44,

                      borderRadius: 2.5,

                      textTransform: "none",

                      fontWeight: 700,
                    }}
                  >
                    {closing ? "Closing..." : "Close Ticket"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* =============================================== */}

            {/* STATUS INFORMATION */}

            {/* =============================================== */}

            {isLibraryTicket && ticket.status === "WAITING_FOR_SUPPORT" && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 3,
                }}
              >
                The student has replied and is waiting for your response.
              </Alert>
            )}

            {isLibraryTicket && ticket.status === "WAITING_FOR_USER" && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                You have replied and are currently waiting for the student.
              </Alert>
            )}

            {!isLibraryTicket && ticket.status === "WAITING_FOR_USER" && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 3,
                }}
              >
                LibraryHub support is waiting for your response.
              </Alert>
            )}

            {!isLibraryTicket && ticket.status === "WAITING_FOR_SUPPORT" && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                Your latest message has been sent. LibraryHub support will
                review it.
              </Alert>
            )}

            {ticket.status === "RESOLVED" && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: 3,
                }}
              >
                This issue has been marked as resolved.
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={closeDialogOpen}
        onClose={() => {
          if (!closing) {
            setCloseDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: 4, overflow: "hidden" },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "rgba(239,68,68,0.10)",
                color: "error.main",
                width: 42,
                height: 42,
              }}
            >
              <WarningAmberRounded />
            </Avatar>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                Close support ticket?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action ends the conversation.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: "12px !important" }}>
          <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
            After closing this ticket, you will not be able to send additional
            messages. Close it only when the issue is fully resolved.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={() => setCloseDialogOpen(false)} disabled={closing}>
            Keep Open
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleCloseTicket}
            disabled={closing}
            startIcon={
              closing ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <Close />
              )
            }
          >
            {closing ? "Closing..." : "Close Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OwnerSupportTicketDetails;
