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
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CheckCircleOutlineOutlined,
  Close,
  ForumOutlined,
  LibraryBooksOutlined,
  PersonOutlineOutlined,
  Refresh,
  SendOutlined,
  SupportAgent,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// STATUS CONFIG
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
// PRIORITY CONFIG
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
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>
      </Stack>

      <Typography variant="body2" fontWeight={700}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

function MessageBubble({ message, requesterId }) {
  const isStudent = message?.senderId === requesterId;

  const isOwner = message?.senderRole === "LIBRARY_OWNER";

  const isAdmin = message?.senderRole === "ADMIN";

  const senderLabel = isStudent
    ? "You"
    : isOwner
      ? "Library Support"
      : isAdmin
        ? "LibraryHub Support"
        : message?.senderName || "Support";

  const icon = isStudent ? <PersonOutline /> : <SupportAgent />;

  return (
    <Stack
      direction="row"
      justifyContent={isStudent ? "flex-end" : "flex-start"}
      spacing={1.2}
      alignItems="flex-start"
    >
      {!isStudent && (
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: isOwner ? "warning.light" : "primary.light",
            color: isOwner ? "warning.dark" : "primary.dark",
          }}
        >
          {icon}
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
          justifyContent={isStudent ? "flex-end" : "flex-start"}
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
            bgcolor: isStudent ? "primary.main" : "rgba(15,23,42,0.045)",
            color: isStudent ? "primary.contrastText" : "text.primary",
            border: isStudent ? "none" : "1px solid",
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

      {isStudent && (
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: "rgba(79,70,229,0.10)",
            color: "primary.main",
          }}
        >
          <PersonOutlineOutlined />
        </Avatar>
      )}
    </Stack>
  );
}

// ============================================================
// STUDENT SUPPORT TICKET DETAILS
// ============================================================

function StudentSupportTicketDetails() {
  const navigate = useNavigate();

  const { ticketId } = useParams();

  // ==========================================================
  // STATE
  // ==========================================================

  const [ticket, setTicket] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reply, setReply] = useState("");

  const [sending, setSending] = useState(false);

  const [closing, setClosing] = useState(false);

  const [actionError, setActionError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // DERIVED
  // ==========================================================

  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  const priority = PRIORITY_META[ticket?.priority] || PRIORITY_META.MEDIUM;

  const isClosed = ticket?.status === "CLOSED";

  const messages = useMemo(() => {
    return Array.isArray(ticket?.messages) ? ticket.messages : [];
  }, [ticket]);

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

      const data = await supportTicketApi.getStudentTicket(ticketId);

      setTicket(data);
    } catch (requestError) {
      console.error("Failed to load support ticket:", requestError);

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

      await supportTicketApi.sendStudentMessage(ticketId, {
        message: normalized,
      });

      setReply("");

      setSuccess("Your reply has been sent.");

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
  // CLOSE TICKET
  // ==========================================================

  const handleCloseTicket = async () => {
    if (isClosed) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to close this support ticket? You will not be able to send additional messages after closing it.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setClosing(true);

      setActionError("");

      setSuccess("");

      await supportTicketApi.closeStudentTicket(ticketId);

      setSuccess("Support ticket closed successfully.");

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to close support ticket:", requestError);

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
              height={420}
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
              height={320}
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
  // LOAD ERROR
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
          onClick={() => navigate("/student/help-support")}
          sx={{
            mb: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Back to Help & Support
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
        onClick={() => navigate("/student/help-support")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Back to Help & Support
      </Button>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          mb: 3,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.14)",
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
            spacing={2}
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
                  Created {formatDateTime(ticket.createdAt)}
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
                  borderRadius: 2.2,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* ACTION ALERTS */}
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
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
              mb: 3,
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
                The information you provided when this ticket was created.
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
                    Continue the conversation with support.
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
                    Support replies will appear here.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2.5}>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      requesterId={ticket.requesterId}
                    />
                  ))}
                </Stack>
              )}

              {/* ============================================= */}
              {/* REPLY FORM */}
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
                      Reply to Support
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="Type your message..."
                      disabled={sending}
                      slotProps={{
                        htmlInput: {
                          maxLength: 3000,
                        },
                      }}
                      helperText={`${reply.length}/3000`}
                    />

                    <Box
                      sx={{
                        mt: 1.5,
                      }}
                    >
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
                  </Box>
                </>
              )}

              {isClosed && (
                <Alert
                  severity="info"
                  icon={<CheckCircleOutlineOutlined />}
                  sx={{
                    mt: 3,
                    borderRadius: 2.5,
                  }}
                >
                  This support ticket is closed. New replies are no longer
                  accepted.
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
            {/* ================================================= */}
            {/* TICKET DETAILS */}
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
                      ticket.scope === "LIBRARY"
                        ? "Library Support"
                        : "LibraryHub Support"
                    }
                    icon={
                      ticket.scope === "LIBRARY" ? (
                        <LibraryBooksOutlined fontSize="small" />
                      ) : (
                        <SupportAgent fontSize="small" />
                      )
                    }
                  />

                  {ticket.libraryName && (
                    <InfoItem label="Library" value={ticket.libraryName} />
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

            {/* ================================================= */}
            {/* STATUS HELP */}
            {/* ================================================= */}

            {ticket.status === "WAITING_FOR_USER" && (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: 3,
                }}
              >
                Support is waiting for your response. Review the latest message
                and reply when ready.
              </Alert>
            )}

            {ticket.status === "WAITING_FOR_SUPPORT" && (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 3,
                }}
              >
                Your latest message has been sent. Support will respond when
                they review the ticket.
              </Alert>
            )}

            {ticket.status === "RESOLVED" && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: 3,
                }}
              >
                Support marked this issue as resolved. You can close the ticket
                if everything is working correctly.
              </Alert>
            )}

            {/* ================================================= */}
            {/* CLOSE */}
            {/* ================================================= */}

            {!isClosed && (
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
                      lineHeight: 1.65,
                    }}
                  >
                    Close the ticket once you no longer need assistance.
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={
                      closing ? (
                        <CircularProgress size={17} color="inherit" />
                      ) : (
                        <Close />
                      )
                    }
                    disabled={closing}
                    onClick={handleCloseTicket}
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
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentSupportTicketDetails;
