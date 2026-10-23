import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
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
  ArrowForward,
  AssignmentIndOutlined,
  BusinessOutlined,
  CheckCircleOutlineOutlined,
  FilterAltOff,
  ForumOutlined,
  PendingActionsOutlined,
  PersonOutlineOutlined,
  PriorityHighOutlined,
  Refresh,
  Search,
  SupportAgent,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// FILTER OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_USER", label: "Waiting for User" },
  { value: "WAITING_FOR_SUPPORT", label: "Waiting for Support" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const SCOPE_OPTIONS = [
  { value: "ALL", label: "All Scopes" },
  { value: "PLATFORM", label: "Platform Support" },
  { value: "LIBRARY", label: "Library Support" },
];

const ROLE_OPTIONS = [
  { value: "ALL", label: "All Requesters" },
  { value: "USER", label: "Student" },
  { value: "LIBRARY_OWNER", label: "Library Owner" },
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const ASSIGNMENT_OPTIONS = [
  { value: "ALL", label: "All Assignments" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "UNASSIGNED", label: "Unassigned" },
];

// ============================================================
// META
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

function getAgeHours(ticket) {
  const value = ticket?.updatedAt || ticket?.lastMessageAt || ticket?.createdAt;

  if (!value) return null;

  const time = new Date(value).getTime();

  if (!Number.isFinite(time)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - time) / (1000 * 60 * 60)));
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
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone = "primary",
  active = false,
  onClick,
}) {
  const theme = useTheme();

  const palette =
    tone === "success"
      ? theme.palette.success
      : tone === "warning"
        ? theme.palette.warning
        : tone === "error"
          ? theme.palette.error
          : tone === "info"
            ? theme.palette.info
            : tone === "secondary"
              ? theme.palette.secondary
              : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        p: 2.3,
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: active
          ? alpha(palette.main, 0.42)
          : alpha(palette.main, 0.12),
        borderRadius: 3.5,
        background: active
          ? `linear-gradient(
              145deg,
              ${alpha(palette.main, 0.09)} 0%,
              ${alpha(palette.main, 0.035)} 100%
            )`
          : `linear-gradient(
              145deg,
              ${theme.palette.background.paper} 0%,
              ${alpha(palette.main, 0.035)} 100%
            )`,
        transition:
          "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              borderColor: alpha(palette.main, 0.28),
              boxShadow: "0 16px 34px rgba(15,23,42,.07)",
            }
          : {},
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 88,
          height: 88,
          borderRadius: "50%",
          right: -30,
          top: -34,
          bgcolor: alpha(palette.main, 0.065),
        }}
      />

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={750}>
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.55,
              fontWeight: 900,
              letterSpacing: "-0.035em",
            }}
          >
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.3,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(palette.main, 0.1),
            color: palette.main,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// TICKET CARD
// ============================================================

function TicketCard({ ticket, onClick }) {
  const theme = useTheme();

  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  const priority = PRIORITY_META[ticket?.priority] || PRIORITY_META.MEDIUM;

  const ageHours = getAgeHours(ticket);

  const needsAttention =
    !["RESOLVED", "CLOSED"].includes(ticket?.status) &&
    (!ticket?.assignedToUserId ||
      ticket?.status === "WAITING_FOR_SUPPORT" ||
      ticket?.priority === "URGENT");

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid",
        borderColor: needsAttention
          ? alpha(theme.palette.warning.main, 0.22)
          : "divider",
        borderRadius: 3.5,
        bgcolor: needsAttention
          ? alpha(theme.palette.warning.main, 0.014)
          : "#FFFFFF",
        transition:
          "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: "primary.light",
          boxShadow: "0 18px 38px rgba(15,23,42,.08)",
        },
      }}
    >
      <Box
        sx={{
          height: 5,
          bgcolor:
            ticket.priority === "URGENT"
              ? "error.main"
              : ticket.status === "RESOLVED"
                ? "success.main"
                : ticket.status === "CLOSED"
                  ? "grey.400"
                  : ticket.status === "WAITING_FOR_SUPPORT"
                    ? "secondary.main"
                    : "primary.main",
        }}
      />

      <Box sx={{ p: 2.45 }}>
        <Stack spacing={1.7}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.4}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={0.7}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={750}
                >
                  {ticket.ticketNumber || `Ticket #${ticket.id}`}
                </Typography>

                {needsAttention && (
                  <Chip
                    size="small"
                    icon={<WarningAmberOutlined />}
                    label="Needs Attention"
                    color="warning"
                    variant="outlined"
                    sx={{
                      height: 21,
                      fontSize: 9.5,
                      fontWeight: 800,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="h6"
                fontWeight={900}
                sx={{
                  mt: 0.55,
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
              variant={ticket.status === "RESOLVED" ? "filled" : "outlined"}
              sx={{
                flexShrink: 0,
                fontWeight: 800,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={formatEnumLabel(ticket.category)}
            />

            <Chip
              size="small"
              variant="outlined"
              label={ticket.scope === "LIBRARY" ? "Library" : "Platform"}
            />

            <Chip
              size="small"
              variant="outlined"
              color={priority.color}
              label={`${priority.label} Priority`}
              sx={{ fontWeight: 700 }}
            />

            {ticket.requesterRole && (
              <Chip
                size="small"
                variant="outlined"
                label={
                  ticket.requesterRole === "USER"
                    ? "Student"
                    : ticket.requesterRole === "LIBRARY_OWNER"
                      ? "Library Owner"
                      : formatEnumLabel(ticket.requesterRole)
                }
              />
            )}
          </Stack>

          <Stack direction="row" spacing={1.2} alignItems="center">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                fontSize: 12,
                fontWeight: 850,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              {getInitials(ticket.requesterName)}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={800} noWrap>
                {ticket.requesterName || "Unknown requester"}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap>
                {ticket.requesterEmail || "No email"}
              </Typography>
            </Box>
          </Stack>

          {ticket.libraryName && (
            <Paper
              elevation={0}
              sx={{
                p: 1.2,
                borderRadius: 2.2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.08),
                bgcolor: alpha(theme.palette.primary.main, 0.018),
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <BusinessOutlined sx={{ fontSize: 18 }} color="action" />

                <Typography variant="body2" fontWeight={750} noWrap>
                  {ticket.libraryName}
                </Typography>
              </Stack>
            </Paper>
          )}

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography
                variant="caption"
                color={ticket.assignedToName ? "text.secondary" : "error.main"}
                fontWeight={ticket.assignedToName ? 500 : 750}
              >
                {ticket.assignedToName
                  ? `Assigned to ${ticket.assignedToName}`
                  : "Unassigned"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block" }}
              >
                Updated{" "}
                {formatDateTime(
                  ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
                )}
              </Typography>

              {ageHours !== null && (
                <Typography
                  variant="caption"
                  color={ageHours >= 24 ? "warning.main" : "text.disabled"}
                  sx={{
                    display: "block",
                    mt: 0.15,
                    fontWeight: ageHours >= 24 ? 700 : 500,
                  }}
                >
                  {ageHours < 1
                    ? "Activity within the last hour"
                    : `${ageHours}h since last activity`}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                color: "primary.main",
              }}
            >
              <ArrowForward fontSize="small" />
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

// ============================================================
// ADMIN SUPPORT TICKETS
// ============================================================

function SupportTickets() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL",
  );

  const [scopeFilter, setScopeFilter] = useState(
    searchParams.get("scope") || "ALL",
  );

  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "ALL",
  );

  const [priorityFilter, setPriorityFilter] = useState(
    searchParams.get("priority") || "ALL",
  );

  const [assignmentFilter, setAssignmentFilter] = useState(
    searchParams.get("assignment") || "ALL",
  );

  // =========================================================
  // LOAD
  // =========================================================

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await supportTicketApi.getAdminTickets();

      setTickets(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load admin support tickets:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.response?.data?.detail ||
          "Unable to load support tickets.",
      );

      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // =========================================================
  // QUERY PARAM SYNC
  // =========================================================

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (statusFilter !== "ALL") {
      nextParams.set("status", statusFilter);
    }

    if (scopeFilter !== "ALL") {
      nextParams.set("scope", scopeFilter);
    }

    if (roleFilter !== "ALL") {
      nextParams.set("role", roleFilter);
    }

    if (priorityFilter !== "ALL") {
      nextParams.set("priority", priorityFilter);
    }

    if (assignmentFilter !== "ALL") {
      nextParams.set("assignment", assignmentFilter);
    }

    setSearchParams(nextParams, {
      replace: true,
    });
  }, [
    statusFilter,
    scopeFilter,
    roleFilter,
    priorityFilter,
    assignmentFilter,
    setSearchParams,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;

    const inProgress = tickets.filter(
      (ticket) => ticket.status === "IN_PROGRESS",
    ).length;

    const waiting = tickets.filter(
      (ticket) => ticket.status === "WAITING_FOR_SUPPORT",
    ).length;

    const urgent = tickets.filter(
      (ticket) =>
        ticket.priority === "URGENT" &&
        !["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    const unassigned = tickets.filter(
      (ticket) =>
        !ticket.assignedToUserId &&
        !["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    const resolved = tickets.filter((ticket) =>
      ["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      open,
      inProgress,
      waiting,
      urgent,
      unassigned,
      resolved,
      resolutionRate,
    };
  }, [tickets]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesScope =
        scopeFilter === "ALL" || ticket.scope === scopeFilter;

      const matchesRole =
        roleFilter === "ALL" || ticket.requesterRole === roleFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      const matchesAssignment =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "ASSIGNED" && Boolean(ticket.assignedToUserId)) ||
        (assignmentFilter === "UNASSIGNED" && !ticket.assignedToUserId);

      const matchesSearch =
        !keyword ||
        ticket.ticketNumber?.toLowerCase().includes(keyword) ||
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.category?.toLowerCase().includes(keyword) ||
        ticket.requesterName?.toLowerCase().includes(keyword) ||
        ticket.requesterEmail?.toLowerCase().includes(keyword) ||
        ticket.libraryName?.toLowerCase().includes(keyword) ||
        ticket.assignedToName?.toLowerCase().includes(keyword);

      return (
        matchesStatus &&
        matchesScope &&
        matchesRole &&
        matchesPriority &&
        matchesAssignment &&
        matchesSearch
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    scopeFilter,
    roleFilter,
    priorityFilter,
    assignmentFilter,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setScopeFilter("ALL");
    setRoleFilter("ALL");
    setPriorityFilter("ALL");
    setAssignmentFilter("ALL");
  };

  const activeFilterCount =
    [
      statusFilter,
      scopeFilter,
      roleFilter,
      priorityFilter,
      assignmentFilter,
    ].filter((value) => value !== "ALL").length + (search.trim() ? 1 : 0);

  // =========================================================
  // QUICK KPI FILTERS
  // =========================================================

  const applySummaryFilter = (type) => {
    if (type === "ALL") {
      handleResetFilters();
      return;
    }

    if (type === "OPEN") {
      setStatusFilter("OPEN");
      setAssignmentFilter("ALL");
      setPriorityFilter("ALL");
      return;
    }

    if (type === "WAITING") {
      setStatusFilter("WAITING_FOR_SUPPORT");
      setAssignmentFilter("ALL");
      setPriorityFilter("ALL");
      return;
    }

    if (type === "URGENT") {
      setPriorityFilter("URGENT");
      setStatusFilter("ALL");
      setAssignmentFilter("ALL");
      return;
    }

    if (type === "UNASSIGNED") {
      setAssignmentFilter("UNASSIGNED");
      setStatusFilter("ALL");
      setPriorityFilter("ALL");
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/support")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 750,
        }}
      >
        Back to Support Dashboard
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
          p: {
            xs: 2.6,
            md: 3.3,
          },
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
            width: 230,
            height: 230,
            borderRadius: "50%",
            right: -80,
            top: -115,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          spacing={2.5}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                minWidth: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 26px rgba(79,70,229,.22)",
              }}
            >
              <SupportAgent />
            </Box>

            <Box>
              <Chip
                label="SUPPORT OPERATIONS"
                size="small"
                icon={<WorkspacePremiumOutlined />}
                sx={{
                  mb: 1,
                  fontWeight: 850,
                  letterSpacing: 0.6,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                }}
              >
                Support Tickets
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.45,
                  lineHeight: 1.65,
                }}
              >
                Search, triage and manage live LibraryHub support requests.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={`${summary.resolutionRate}% resolution`}
              color={
                summary.resolutionRate >= 80
                  ? "success"
                  : summary.resolutionRate >= 50
                    ? "warning"
                    : "error"
              }
              variant="outlined"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFFFFF",
              }}
            />

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              disabled={loading}
              onClick={loadTickets}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
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
      {/* SUMMARY */}
      {/* =================================================== */}

      {loading ? (
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                sm: 6,
                lg: 2.4,
              }}
            >
              <Skeleton
                variant="rounded"
                height={145}
                sx={{
                  borderRadius: 3.5,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <SummaryCard
              label="Total"
              value={summary.total}
              description="All support requests"
              icon={<ForumOutlined />}
              active={activeFilterCount === 0}
              onClick={() => applySummaryFilter("ALL")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <SummaryCard
              label="Open"
              value={summary.open}
              description="New tickets"
              icon={<PendingActionsOutlined />}
              tone="info"
              active={statusFilter === "OPEN"}
              onClick={() => applySummaryFilter("OPEN")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <SummaryCard
              label="Waiting"
              value={summary.waiting}
              description="Needs support response"
              icon={<SupportAgent />}
              tone="secondary"
              active={statusFilter === "WAITING_FOR_SUPPORT"}
              onClick={() => applySummaryFilter("WAITING")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <SummaryCard
              label="Urgent"
              value={summary.urgent}
              description="Urgent active cases"
              icon={<PriorityHighOutlined />}
              tone="error"
              active={priorityFilter === "URGENT"}
              onClick={() => applySummaryFilter("URGENT")}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <SummaryCard
              label="Unassigned"
              value={summary.unassigned}
              description="Needs ownership"
              icon={<AssignmentIndOutlined />}
              tone="warning"
              active={assignmentFilter === "UNASSIGNED"}
              onClick={() => applySummaryFilter("UNASSIGNED")}
            />
          </Grid>
        </Grid>
      )}

      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* =================================================== */}
      {/* FILTERS */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: 3.5,
          bgcolor: "#FFFFFF",
          boxShadow: "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack spacing={1.5}>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.25}
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
          >
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket, requester, subject, library or assignee..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 48,
                  borderRadius: 2.7,
                  bgcolor: "#FFFFFF",
                  "& fieldset": {
                    borderColor: alpha(theme.palette.divider, 0.95),
                  },
                  "&:hover fieldset": {
                    borderColor: alpha(theme.palette.primary.main, 0.32),
                  },
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(
                      theme.palette.primary.main,
                      0.08,
                    )}`,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 1,
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.8,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.06),
                          color: "primary.main",
                        }}
                      >
                        <Search
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </Box>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<FilterAltOff />}
                onClick={handleResetFilters}
                sx={{
                  height: 48,
                  minWidth: 155,
                  borderRadius: 2.7,
                  textTransform: "none",
                  fontWeight: 750,
                }}
              >
                Clear ({activeFilterCount})
              </Button>
            )}
          </Stack>

          <Grid container spacing={1.2}>
            {[
              {
                label: "Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: STATUS_OPTIONS,
              },
              {
                label: "Scope",
                value: scopeFilter,
                onChange: setScopeFilter,
                options: SCOPE_OPTIONS,
              },
              {
                label: "Requester",
                value: roleFilter,
                onChange: setRoleFilter,
                options: ROLE_OPTIONS,
              },
              {
                label: "Priority",
                value: priorityFilter,
                onChange: setPriorityFilter,
                options: PRIORITY_OPTIONS,
              },
              {
                label: "Assignment",
                value: assignmentFilter,
                onChange: setAssignmentFilter,
                options: ASSIGNMENT_OPTIONS,
              },
            ].map((filter) => (
              <Grid
                key={filter.label}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={filter.label}
                  value={filter.value}
                  onChange={(event) => filter.onChange(event.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.4,
                      bgcolor: "#FFFFFF",
                    },
                  }}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* RESULT BAR */}
      {/* =================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        spacing={1}
        sx={{
          mb: 2,
        }}
      >
        <Box>
          <Typography fontWeight={850}>Ticket Queue</Typography>

          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredTickets.length}</strong> of{" "}
            <strong>{tickets.length}</strong> support tickets
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
          {activeFilterCount > 0 && (
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`${activeFilterCount} active ${
                activeFilterCount === 1 ? "filter" : "filters"
              }`}
              sx={{
                fontWeight: 750,
              }}
            />
          )}

          {summary.resolved > 0 && (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckCircleOutlineOutlined />}
              label={`${summary.resolved} resolved/closed`}
              sx={{
                fontWeight: 750,
              }}
            />
          )}
        </Stack>
      </Stack>

      {/* =================================================== */}
      {/* TICKETS */}
      {/* =================================================== */}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                md: 6,
                xl: 4,
              }}
            >
              <Skeleton
                variant="rounded"
                height={330}
                sx={{
                  borderRadius: 3.5,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredTickets.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            py: 7,
            px: 3,
            textAlign: "center",
            bgcolor: "#FFFFFF",
          }}
        >
          <SupportAgent
            sx={{
              fontSize: 52,
              color: "text.disabled",
            }}
          />

          <Typography
            variant="h6"
            fontWeight={850}
            sx={{
              mt: 1,
            }}
          >
            {tickets.length === 0
              ? "No support tickets"
              : "No matching tickets"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.6,
              maxWidth: 500,
              mx: "auto",
            }}
          >
            {tickets.length === 0
              ? "New student and library-owner support requests will appear here."
              : "Try changing your search term or clearing one of the active filters."}
          </Typography>

          {activeFilterCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<FilterAltOff />}
              onClick={handleResetFilters}
              sx={{
                mt: 2.5,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              Clear Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredTickets.map((ticket) => (
            <Grid
              key={ticket.id}
              size={{
                xs: 12,
                md: 6,
                xl: 4,
              }}
            >
              <TicketCard
                ticket={ticket}
                onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default SupportTickets;
