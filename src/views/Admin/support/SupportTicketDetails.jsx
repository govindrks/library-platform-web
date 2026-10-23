import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
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
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import adminApi from "../../../api/adminApi";
import supportTicketApi from "../../../api/supportTicketApi";
import usePlatformConfig from "../../../api/usePlatformConfig";

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_USER", label: "Waiting for User" },
  { value: "WAITING_FOR_SUPPORT", label: "Waiting for Support" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

// ============================================================
// STATUS / PRIORITY META
// ============================================================

const STATUS_META = {
  OPEN: { label: "Open", color: "info" },
  IN_PROGRESS: { label: "In Progress", color: "primary" },
  WAITING_FOR_USER: { label: "Waiting for User", color: "warning" },
  WAITING_FOR_SUPPORT: { label: "Waiting for Support", color: "secondary" },
  RESOLVED: { label: "Resolved", color: "success" },
  CLOSED: { label: "Closed", color: "default" },
};

const PRIORITY_META = {
  LOW: { label: "Low", color: "default" },
  MEDIUM: { label: "Medium", color: "info" },
  HIGH: { label: "High", color: "warning" },
  URGENT: { label: "Urgent", color: "error" },
};

// ============================================================
// HELPERS
// ============================================================

function formatEnumLabel(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value) {
  if (!value) return "—";

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

function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value, icon }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.7,
        height: "100%",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.08),
        bgcolor: alpha(theme.palette.primary.main, 0.015),
      }}
    >
      <Stack direction="row" spacing={0.8} alignItems="center">
        {icon && (
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.6,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {label}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={800}
            sx={{ mt: 0.2, wordBreak: "break-word" }}
          >
            {value || "—"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// MESSAGE BUBBLE
// ============================================================

function MessageBubble({ message }) {
  const theme = useTheme();

  const isAdmin = message?.senderRole === "ADMIN";
  const isOwner = message?.senderRole === "LIBRARY_OWNER";
  const isInternal = Boolean(message?.internalNote);

  if (isInternal) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: alpha(theme.palette.warning.main, 0.26),
          bgcolor: alpha(theme.palette.warning.main, 0.055),
          borderRadius: 3,
          p: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <LockOutlined fontSize="small" color="warning" />

          <Typography variant="body2" fontWeight={850}>
            Internal Note
          </Typography>

          <Chip
            size="small"
            label="Admins only"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 750 }}
          />
        </Stack>

        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message?.message}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          {message?.senderName || "Admin"} •{" "}
          {formatDateTime(message?.createdAt)}
        </Typography>
      </Paper>
    );
  }

  const senderLabel = isAdmin
    ? "{platformName} Support"
    : message?.senderName || (isOwner ? "Library Owner" : "Student");

  return (
    <Stack
      direction="row"
      justifyContent={isAdmin ? "flex-end" : "flex-start"}
      spacing={1.2}
      alignItems="flex-start"
    >
      {!isAdmin && (
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: isOwner
              ? alpha(theme.palette.info.main, 0.12)
              : alpha(theme.palette.warning.main, 0.13),
            color: isOwner ? "info.main" : "warning.dark",
          }}
        >
          {isOwner ? <BusinessOutlined /> : <PersonOutlineOutlined />}
        </Avatar>
      )}

      <Box sx={{ maxWidth: { xs: "88%", md: "72%" } }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent={isAdmin ? "flex-end" : "flex-start"}
          sx={{ mb: 0.5 }}
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
            bgcolor: isAdmin
              ? "primary.main"
              : alpha(theme.palette.text.primary, 0.045),
            color: isAdmin ? "primary.contrastText" : "text.primary",
            border: isAdmin ? "none" : "1px solid",
            borderColor: "divider",
            boxShadow: isAdmin ? "0 10px 26px rgba(79,70,229,.12)" : "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message?.message}
          </Typography>
        </Box>
      </Box>

      {isAdmin && (
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
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
  const theme = useTheme();

  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [internalNote, setInternalNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // =========================================================
  // DERIVED
  // =========================================================

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

  const { platformName } = usePlatformConfig();

  const selectedAdmin = useMemo(
    () =>
      admins.find((admin) => String(admin.id) === String(assignedToUserId)) ||
      null,
    [admins, assignedToUserId],
  );

  // =========================================================
  // LOAD TICKET
  // =========================================================

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

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to load this support ticket.",
      );
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // =========================================================
  // LOAD REAL ADMIN USERS
  // =========================================================

  const loadAdmins = useCallback(async () => {
    try {
      setAdminsLoading(true);

      const response = await adminApi.getUsers({
        role: "ADMIN",
      });

      setAdmins(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Failed to load admin users:", requestError);

      setAdmins([]);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTicket();
    loadAdmins();
  }, [loadTicket, loadAdmins]);

  // =========================================================
  // PUBLIC REPLY
  // =========================================================

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

      setActionError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to send the reply.",
      );
    } finally {
      setSendingReply(false);
    }
  };

  // =========================================================
  // INTERNAL NOTE
  // =========================================================

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

      setActionError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to add the internal note.",
      );
    } finally {
      setAddingNote(false);
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

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

      setActionError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to update the ticket status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================================================
  // ASSIGNMENT
  // =========================================================

  const handleAssign = async () => {
    const id = Number(assignedToUserId);

    if (!assignedToUserId || !Number.isInteger(id) || id <= 0) {
      setActionError("Please select a platform administrator.");
      return;
    }

    try {
      setAssigning(true);
      setSuccess("");
      setActionError("");

      await supportTicketApi.assignAdminTicket(ticketId, id);

      setSuccess(
        selectedAdmin?.fullName
          ? `Ticket assigned to ${selectedAdmin.fullName}.`
          : "Ticket assigned successfully.",
      );

      await loadTicket();
    } catch (requestError) {
      console.error("Failed to assign support ticket:", requestError);

      setActionError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to assign the support ticket.",
      );
    } finally {
      setAssigning(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box sx={{ width: "100%", pb: 5 }}>
        <Skeleton
          variant="rounded"
          height={170}
          sx={{ borderRadius: 4, mb: 3 }}
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton variant="rounded" height={560} sx={{ borderRadius: 4 }} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rounded" height={460} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !ticket) {
    return (
      <Box sx={{ width: "100%", pb: 5 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/admin/support/tickets")}
          sx={{ mb: 2, textTransform: "none", fontWeight: 750 }}
        >
          Back to Support Tickets
        </Button>

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || "Support ticket could not be found."}
        </Alert>
      </Box>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/support/tickets")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 750 }}
      >
        Back to Support Tickets
      </Button>

      {/* =================================================== */}
      {/* PREMIUM HERO */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 2.6, md: 3.3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #F3F1FF 48%, #EEF5FF 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -75,
            top: -105,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          spacing={2.5}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 56,
                height: 56,
                minWidth: 56,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 26px rgba(79,70,229,.20)",
              }}
            >
              <ForumOutlined />
            </Box>

            <Box>
              <Chip
                label="SUPPORT CASE"
                size="small"
                icon={<WorkspacePremiumOutlined />}
                sx={{
                  mb: 1,
                  fontWeight: 850,
                  letterSpacing: 0.6,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={800}
              >
                {ticket.ticketNumber || `Ticket #${ticket.id}`}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.35,
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                  maxWidth: 780,
                }}
              >
                {ticket.subject}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.8 }}
              >
                Submitted by {ticket.requesterName || "Unknown requester"}
                {ticket.libraryName ? ` · ${ticket.libraryName}` : ""}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            justifyContent={{ md: "flex-end" }}
          >
            <Chip
              label={status.label}
              color={status.color}
              sx={{ fontWeight: 800 }}
            />

            <Chip
              label={`${priority.label} Priority`}
              color={priority.color}
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />

            {!ticket.assignedToUserId && !isClosed && (
              <Chip
                icon={<WarningAmberOutlined />}
                label="Unassigned"
                color="error"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            )}

            <Button
              size="small"
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadTicket}
              sx={{
                minHeight: 36,
                borderRadius: 2.2,
                textTransform: "none",
                fontWeight: 750,
                bgcolor: "#FFFFFF",
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* FEEDBACK */}
      {/* =================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {success}
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          onClose={() => setActionError("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {actionError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <Grid size={{ xs: 12, lg: 8 }}>
          {/* ORIGINAL REQUEST */}

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 2.4, md: 3 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h6" fontWeight={900}>
              Original Request
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              The description originally submitted by the requester.
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography
              sx={{
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {ticket.description}
            </Typography>
          </Paper>

          {/* PUBLIC CONVERSATION */}

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                px: { xs: 2.4, md: 3 },
                py: 2.2,
                bgcolor: alpha(theme.palette.primary.main, 0.018),
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Conversation
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.35 }}
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
                  sx={{ fontWeight: 750 }}
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2.4, md: 3 } }}>
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
                    sx={{ fontSize: 44, color: "text.disabled" }}
                  />

                  <Typography fontWeight={850} sx={{ mt: 1 }}>
                    No conversation yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
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
                  <Divider sx={{ my: 3 }} />

                  <Box component="form" onSubmit={handleSendReply}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" fontWeight={850}>
                        Public Reply
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Visible to requester
                      </Typography>
                    </Stack>

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
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2.8,
                          bgcolor: alpha(theme.palette.primary.main, 0.012),
                        },
                      }}
                    />

                    <Stack direction="row" justifyContent="flex-end">
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
                          fontWeight: 800,
                        }}
                      >
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}

              {isClosed && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2.5 }}>
                  This ticket is closed. Public replies are no longer accepted.
                </Alert>
              )}
            </Box>
          </Paper>

          {/* INTERNAL NOTES */}

          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.24),
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: alpha(theme.palette.warning.main, 0.018),
            }}
          >
            <Box
              sx={{
                px: { xs: 2.4, md: 3 },
                py: 2.2,
                borderBottom: "1px solid",
                borderColor: alpha(theme.palette.warning.main, 0.16),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LockOutlined color="warning" fontSize="small" />

                    <Typography variant="h6" fontWeight={900}>
                      Internal Notes
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.35 }}
                  >
                    Private investigation notes visible only to platform
                    administrators.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${internalNotes.length} ${
                    internalNotes.length === 1 ? "Note" : "Notes"
                  }`}
                  sx={{ fontWeight: 750 }}
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2.4, md: 3 } }}>
              {internalNotes.length > 0 && (
                <Stack spacing={1.5} sx={{ mb: 3 }}>
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.8,
                      bgcolor: "#FFFFFF",
                    },
                  }}
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
                    fontWeight: 800,
                  }}
                >
                  {addingNote ? "Adding..." : "Add Internal Note"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ================================================= */}
        {/* RIGHT */}
        {/* ================================================= */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* DETAILS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                Ticket Details
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Requester and case context.
              </Typography>

              <Grid container spacing={1.2} sx={{ mt: 1.5 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Ticket Number"
                    value={ticket.ticketNumber}
                    icon={<ForumOutlined fontSize="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
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
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Category"
                    value={formatEnumLabel(ticket.category)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Requester"
                    value={ticket.requesterName}
                    icon={<PersonOutlineOutlined fontSize="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Requester Email"
                    value={ticket.requesterEmail}
                  />
                </Grid>

                {ticket.libraryName && (
                  <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                    <InfoItem
                      label="Library"
                      value={ticket.libraryName}
                      icon={<BusinessOutlined fontSize="small" />}
                    />
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Assigned To"
                    value={ticket.assignedToName || "Unassigned"}
                    icon={<AssignmentIndOutlined fontSize="small" />}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Created"
                    value={formatDateTime(ticket.createdAt)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 12 }}>
                  <InfoItem
                    label="Last Updated"
                    value={formatDateTime(
                      ticket.updatedAt || ticket.lastMessageAt,
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* STATUS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 4,
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography fontWeight={900}>Manage Status</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, mb: 2, lineHeight: 1.6 }}
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
                  fontWeight: 800,
                }}
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </Paper>

            {/* REAL ADMIN ASSIGNMENT */}

            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: ticket.assignedToUserId
                  ? alpha(theme.palette.success.main, 0.16)
                  : alpha(theme.palette.warning.main, 0.2),
                borderRadius: 4,
                bgcolor: ticket.assignedToUserId
                  ? alpha(theme.palette.success.main, 0.018)
                  : alpha(theme.palette.warning.main, 0.02),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentIndOutlined color="primary" />

                <Typography fontWeight={900}>Assignment</Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.6, mb: 2, lineHeight: 1.6 }}
              >
                Assign this case to a real platform administrator.
              </Typography>

              {ticket.assignedToName && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2.5 }}>
                  Currently assigned to <strong>{ticket.assignedToName}</strong>
                  .
                </Alert>
              )}

              <TextField
                select
                fullWidth
                size="small"
                label="Platform Administrator"
                value={assignedToUserId}
                onChange={(event) => setAssignedToUserId(event.target.value)}
                disabled={adminsLoading || assigning}
                helperText={
                  adminsLoading
                    ? "Loading administrators..."
                    : admins.length > 0
                      ? `${admins.length} administrator${
                          admins.length === 1 ? "" : "s"
                        } available`
                      : "No administrator accounts were returned."
                }
              >
                <MenuItem value="">
                  <em>Select administrator</em>
                </MenuItem>

                {admins.map((admin) => (
                  <MenuItem key={admin.id} value={String(admin.id)}>
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          fontWeight: 800,
                        }}
                      >
                        {getInitials(admin.fullName)}
                      </Avatar>

                      <Box>
                        <Typography variant="body2" fontWeight={750}>
                          {admin.fullName || `Admin #${admin.id}`}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {admin.email || "No email"}
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>

              <Button
                fullWidth
                variant="outlined"
                disabled={
                  assigning ||
                  !assignedToUserId ||
                  String(ticket.assignedToUserId || "") ===
                    String(assignedToUserId)
                }
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
                  fontWeight: 800,
                }}
              >
                {assigning ? "Assigning..." : "Assign Ticket"}
              </Button>
            </Paper>

            {/* STATUS HELP */}

            {ticket.status === "WAITING_FOR_SUPPORT" && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                The requester has replied and is waiting for support.
              </Alert>
            )}

            {ticket.status === "WAITING_FOR_USER" && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Support has replied and is waiting for the requester.
              </Alert>
            )}

            {ticket.status === "RESOLVED" && (
              <Alert severity="success" sx={{ borderRadius: 3 }}>
                This ticket has been marked as resolved.
              </Alert>
            )}

            {ticket.status === "CLOSED" && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
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
