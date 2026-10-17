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
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  AssignmentIndOutlined,
  BusinessOutlined,
  CheckCircleOutlineOutlined,
  ForumOutlined,
  LibraryBooksOutlined,
  LockOutlined,
  PersonOutlineOutlined,
  Refresh,
  SendOutlined,
  SupportAgent,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
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
    label: "Waiting for User",
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
// STATUS META
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
// PRIORITY META
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

function MessageBubble({ message }) {
  const isAdmin = message?.senderRole === "ADMIN";

  const isOwner = message?.senderRole === "LIBRARY_OWNER";

  const isStudent = message?.senderRole === "USER";

  const isInternal = Boolean(message?.internalNote);

  let senderLabel = message?.senderName || "User";

  if (isAdmin) {
    senderLabel = isInternal ? "Internal Note" : "LibraryHub Support";
  } else if (isOwner) {
    senderLabel = message?.senderName || "Library Owner";
  } else if (isStudent) {
    senderLabel = message?.senderName || "Student";
  }

  // ==========================================================
  // INTERNAL NOTE
  // ==========================================================

  if (isInternal) {
    return (
      <Box
        sx={{
          border: "1px solid",
          borderColor: "warning.light",
          bgcolor: "rgba(245,158,11,0.07)",
          borderRadius: 3,
          p: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mb: 1,
          }}
        >
          <LockOutlined fontSize="small" color="warning" />

          <Typography variant="body2" fontWeight={800}>
            Internal Note
          </Typography>

          <Chip
            size="small"
            label="Admins only"
            color="warning"
            variant="outlined"
          />
        </Stack>

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

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{
            mt: 1,
          }}
        >
          {message?.senderName || "Admin"} •{" "}
          {formatDateTime(message?.createdAt)}
        </Typography>
      </Box>
    );
  }

  // ==========================================================
  // PUBLIC MESSAGE
  // ==========================================================

  const isCurrentSide = isAdmin;

  return (
    <Stack
      direction="row"
      justifyContent={isCurrentSide ? "flex-end" : "flex-start"}
      spacing={1.2}
      alignItems="flex-start"
    >
      {!isCurrentSide && (
        <Avatar
          sx={{
            width: 38,
            height: 38,

            bgcolor: isOwner
              ? "rgba(14,165,233,0.12)"
              : "rgba(245,158,11,0.14)",

            color: isOwner ? "info.main" : "warning.dark",
          }}
        >
          {isOwner ? <BusinessOutlined /> : <PersonOutline />}
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
          sx={{
            width: 38,
            height: 38,
            bgcolor: "rgba(79,70,229,0.10)",
            color: "primary.main",
          }}
        >
          <SupportAgent />
        </Avatar>
      )}
    </Stack>
  );
}

// ============================================================
// SUPPORT TICKET DETAILS
// ============================================================

function SupportTicketDetails() {
  const navigate = useNavigate();

  const { ticketId } = useParams();

  // ==========================================================
  // TICKET STATE
  // ==========================================================

  const [ticket, setTicket] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // REPLY
  // ==========================================================

  const [reply, setReply] = useState("");

  const [sendingReply, setSendingReply] = useState(false);

  // ==========================================================
  // INTERNAL NOTE
  // ==========================================================

  const [internalNote, setInternalNote] = useState("");

  const [addingNote, setAddingNote] = useState(false);

  // ==========================================================
  // STATUS
  // ==========================================================

  const [selectedStatus, setSelectedStatus] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ==========================================================
  // ASSIGNMENT
  // ==========================================================

  const [assignedToUserId, setAssignedToUserId] = useState("");

  const [assigning, setAssigning] = useState(false);

  // ==========================================================
  // FEEDBACK
  // ==========================================================

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

  const publicMessages = useMemo(
    () => messages.filter((message) => !message.internalNote),
    [messages],
  );

  const internalNotes = useMemo(
    () => messages.filter((message) => message.internalNote),
    [messages],
  );

  const isClosed = ticket?.status === "CLOSED";

  // ==========================================================
  // LOAD
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

      const data = await supportTicketApi.getAdminTicket(ticketId);

      setTicket(data);

      setSelectedStatus(data?.status || "");

      setAssignedToUserId(
        data?.assignedToUserId ? String(data.assignedToUserId) : "",
      );
    } catch (requestError) {
      console.error("Failed to load admin support ticket:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to load this support ticket.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // ==========================================================
  // PUBLIC REPLY
  // ==========================================================

  const handleSendReply = async (event) => {
    event.preventDefault();

    setSuccess("");
    setActionError("");

    const normalized = reply.trim();

    if (!normalized) {
      setActionError("Please enter a reply.");

      return;
    }

    if (isClosed) {
      setActionError("This ticket is closed.");

      return;
    }

    try {
      setSendingReply(true);

      await supportTicketApi.sendAdminMessage(ticketId, {
        message: normalized,
      });

      setReply("");

      setSuccess("Reply sent successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to send admin support reply:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to send the reply.";

      setActionError(message);
    } finally {
      setSendingReply(false);
    }
  };

  // ==========================================================
  // INTERNAL NOTE
  // ==========================================================

  const handleAddInternalNote = async (event) => {
    event.preventDefault();

    setSuccess("");
    setActionError("");

    const normalized = internalNote.trim();

    if (!normalized) {
      setActionError("Please enter an internal note.");

      return;
    }

    try {
      setAddingNote(true);

      await supportTicketApi.addAdminInternalNote(ticketId, {
        message: normalized,
      });

      setInternalNote("");

      setSuccess("Internal note added successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to add internal note:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to add the internal note.";

      setActionError(message);
    } finally {
      setAddingNote(false);
    }
  };

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const handleUpdateStatus = async () => {
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

      await supportTicketApi.updateAdminTicketStatus(ticketId, selectedStatus);

      setSuccess("Ticket status updated successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to update admin ticket status:", requestError);

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
  // ASSIGN
  // ==========================================================

  const handleAssign = async () => {
    const id = Number(assignedToUserId);

    if (!assignedToUserId || !Number.isInteger(id) || id <= 0) {
      setActionError("Enter a valid admin user ID.");

      return;
    }

    try {
      setAssigning(true);

      setSuccess("");
      setActionError("");

      await supportTicketApi.assignAdminTicket(ticketId, id);

      setSuccess("Ticket assigned successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to assign support ticket:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to assign the support ticket.";

      setActionError(message);
    } finally {
      setAssigning(false);
    }
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
            borderRadius: 4,
            mb: 3,
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
              height={520}
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
              height={420}
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
          onClick={() => navigate("/admin/support/tickets")}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Back to Support Tickets
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
        onClick={() => navigate("/admin/support/tickets")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Back to Support Tickets
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
                }}
              >
                <ForumOutlined />
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
                  Submitted by {ticket.requesterName || "Unknown requester"}
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

              <Button
                size="small"
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadTicket}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.4,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* FEEDBACK */}
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
                The description originally submitted by the requester.
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
          {/* PUBLIC CONVERSATION */}
          {/* ================================================= */}

          <Card
            elevation={0}
            sx={{
              mb: 3,
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
                    Messages visible to the requester.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  variant="outlined"
                  label={`${publicMessages.length} ${
                    publicMessages.length === 1 ? "Message" : "Messages"
                  }`}
                />
              </Stack>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              {publicMessages.length === 0 ? (
                <Box
                  sx={{
                    py: 5,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "rgba(248,250,252,0.75)",
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
                    No conversation yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Send a response to start the support conversation.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  {publicMessages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </Stack>
              )}

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
                      Public Reply
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      disabled={sendingReply}
                      placeholder="Type a reply that will be visible to the requester..."
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
                      disabled={sendingReply || !reply.trim()}
                      startIcon={
                        sendingReply ? (
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
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </Button>
                  </Box>
                </>
              )}

              {isClosed && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 3,
                    borderRadius: 2.5,
                  }}
                >
                  This ticket is closed. Public replies are no longer accepted.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* ================================================= */}
          {/* INTERNAL NOTES */}
          {/* ================================================= */}

          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "warning.light",
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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LockOutlined color="warning" fontSize="small" />

                    <Typography variant="h6" fontWeight={800}>
                      Internal Notes
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.4,
                    }}
                  >
                    Visible only to platform administrators.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${internalNotes.length} ${
                    internalNotes.length === 1 ? "Note" : "Notes"
                  }`}
                />
              </Stack>

              <Divider
                sx={{
                  mb: 3,
                }}
              />

              {internalNotes.length > 0 && (
                <Stack
                  spacing={1.5}
                  sx={{
                    mb: 3,
                  }}
                >
                  {internalNotes.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </Stack>
              )}

              <Box component="form" onSubmit={handleAddInternalNote}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  value={internalNote}
                  onChange={(event) => setInternalNote(event.target.value)}
                  disabled={addingNote}
                  label="Add Internal Note"
                  placeholder="Add investigation details, handover notes or internal context..."
                  slotProps={{
                    htmlInput: {
                      maxLength: 3000,
                    },
                  }}
                  helperText={`${internalNote.length}/3000`}
                />

                <Button
                  type="submit"
                  variant="outlined"
                  color="warning"
                  disabled={addingNote || !internalNote.trim()}
                  startIcon={
                    addingNote ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <LockOutlined />
                    )
                  }
                  sx={{
                    mt: 1.5,
                    minHeight: 42,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  {addingNote ? "Adding..." : "Add Internal Note"}
                </Button>
              </Box>
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
                    label="Scope"
                    value={
                      ticket.scope === "LIBRARY"
                        ? "Library Support"
                        : "Platform Support"
                    }
                    icon={
                      ticket.scope === "LIBRARY" ? (
                        <LibraryBooksOutlined fontSize="small" />
                      ) : (
                        <SupportAgent fontSize="small" />
                      )
                    }
                  />

                  <InfoItem
                    label="Category"
                    value={formatEnumLabel(ticket.category)}
                  />

                  <InfoItem
                    label="Requester"
                    value={ticket.requesterName}
                    icon={<PersonOutlineOutlined fontSize="small" />}
                  />

                  <InfoItem
                    label="Requester Email"
                    value={ticket.requesterEmail}
                  />

                  <InfoItem
                    label="Requester Role"
                    value={
                      ticket.requesterRole === "USER"
                        ? "Student"
                        : ticket.requesterRole === "LIBRARY_OWNER"
                          ? "Library Owner"
                          : formatEnumLabel(ticket.requesterRole)
                    }
                  />

                  {ticket.libraryName && (
                    <InfoItem
                      label="Library"
                      value={ticket.libraryName}
                      icon={<BusinessOutlined fontSize="small" />}
                    />
                  )}

                  <InfoItem
                    label="Assigned To"
                    value={ticket.assignedToName || "Unassigned"}
                    icon={<AssignmentIndOutlined fontSize="small" />}
                  />

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
            {/* STATUS */}
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
                  Update the lifecycle state of this support ticket.
                </Typography>

                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={updatingStatus || selectedStatus === ticket.status}
                  onClick={handleUpdateStatus}
                  startIcon={
                    updatingStatus ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <CheckCircleOutlineOutlined />
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

            {/* =============================================== */}
            {/* ASSIGNMENT */}
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
                <Typography fontWeight={800}>Assignment</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.6,
                    mb: 2,
                    lineHeight: 1.6,
                  }}
                >
                  Assign this ticket to a platform administrator.
                </Typography>

                {ticket.assignedToName && (
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2,
                      borderRadius: 2.5,
                    }}
                  >
                    Currently assigned to{" "}
                    <strong>{ticket.assignedToName}</strong>.
                  </Alert>
                )}

                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Admin User ID"
                  value={assignedToUserId}
                  onChange={(event) => setAssignedToUserId(event.target.value)}
                  placeholder="Enter admin user ID"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                  helperText="Temporary assignment input until the admin-user lookup endpoint is added."
                />

                <Button
                  fullWidth
                  variant="outlined"
                  disabled={assigning || !assignedToUserId}
                  onClick={handleAssign}
                  startIcon={
                    assigning ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <AssignmentIndOutlined />
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
                  {assigning ? "Assigning..." : "Assign Ticket"}
                </Button>
              </CardContent>
            </Card>

            {/* =============================================== */}
            {/* STATUS HELP */}
            {/* =============================================== */}

            {ticket.status === "WAITING_FOR_SUPPORT" && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 3,
                }}
              >
                The requester has replied and is waiting for support.
              </Alert>
            )}

            {ticket.status === "WAITING_FOR_USER" && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                Support has replied and is waiting for the requester.
              </Alert>
            )}

            {ticket.status === "RESOLVED" && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: 3,
                }}
              >
                This ticket has been marked as resolved.
              </Alert>
            )}

            {ticket.status === "CLOSED" && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                This ticket is closed.
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SupportTicketDetails;
