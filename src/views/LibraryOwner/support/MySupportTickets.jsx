import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Add,
  ArrowBack,
  ArrowForward,
  BusinessOutlined,
  CheckCircleOutlineOutlined,
  FilterAltOff,
  ForumOutlined,
  HourglassTop,
  MarkChatUnreadOutlined,
  Refresh,
  Search,
  Sort,
  SupportAgent,
  TaskAlt,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import libraryApi from "../../../api/libraryApi";
import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Tickets" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "WAITING_FOR_USER", label: "Waiting for You" },
  { value: "WAITING_FOR_SUPPORT", label: "Waiting for Support" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const STATUS_META = {
  OPEN: {
    label: "Open",
    color: "info",
    accent: "info.main",
    soft: "rgba(2, 136, 209, 0.08)",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "primary",
    accent: "primary.main",
    soft: "rgba(79, 70, 229, 0.08)",
  },
  WAITING_FOR_USER: {
    label: "Waiting for You",
    color: "warning",
    accent: "warning.main",
    soft: "rgba(237, 108, 2, 0.09)",
  },
  WAITING_FOR_SUPPORT: {
    label: "Waiting for Support",
    color: "secondary",
    accent: "secondary.main",
    soft: "rgba(156, 39, 176, 0.08)",
  },
  RESOLVED: {
    label: "Resolved",
    color: "success",
    accent: "success.main",
    soft: "rgba(46, 125, 50, 0.08)",
  },
  CLOSED: {
    label: "Closed",
    color: "default",
    accent: "text.secondary",
    soft: "rgba(100, 116, 139, 0.08)",
  },
};

// ============================================================
// HELPERS
// ============================================================

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.libraries)) return response.libraries;
  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
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
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTicketTime(ticket) {
  const value = ticket?.updatedAt || ticket?.lastMessageAt || ticket?.createdAt;
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
}

function ticketBelongsToLibrary(ticket, library) {
  if (!library) return true;

  const ticketLibraryId = Number(ticket?.libraryId);
  const selectedLibraryId = Number(library?.id);

  if (Number.isFinite(ticketLibraryId) && Number.isFinite(selectedLibraryId)) {
    return ticketLibraryId === selectedLibraryId;
  }

  if (ticket?.libraryName && library?.name) {
    return (
      String(ticket.libraryName).trim().toLowerCase() ===
      String(library.name).trim().toLowerCase()
    );
  }

  // Keep older ticket payloads visible when library identity was not returned.
  return ticket?.libraryId == null && !ticket?.libraryName;
}

// ============================================================
// PREMIUM SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  description,
  icon,
  active = false,
  onClick,
}) {
  return (
    <Card
      elevation={0}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        borderRadius: 3.5,
        background: active
          ? "linear-gradient(145deg, rgba(79,70,229,0.095), rgba(255,255,255,1))"
          : "linear-gradient(145deg, #ffffff, rgba(248,250,252,0.88))",
        boxShadow: active ? "0 10px 26px rgba(79,70,229,0.09)" : "none",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              borderColor: "primary.light",
              boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
            }
          : undefined,
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <CardContent sx={{ p: 2.4, "&:last-child": { pb: 2.4 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {label}
            </Typography>

            <Typography variant="h4" fontWeight={850} sx={{ mt: 0.45 }}>
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
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: active ? "primary.main" : "rgba(79,70,229,0.08)",
              color: active ? "primary.contrastText" : "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// PREMIUM TICKET CARD
// ============================================================

function TicketCard({ ticket, onClick }) {
  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;
  const needsOwnerReply = ticket?.status === "WAITING_FOR_USER";

  return (
    <Card
      elevation={0}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      sx={{
        height: "100%",
        cursor: "pointer",
        border: "1px solid",
        borderColor: needsOwnerReply ? "warning.light" : "divider",
        borderRadius: 3.5,
        overflow: "hidden",
        background: needsOwnerReply
          ? "linear-gradient(145deg, rgba(255,248,235,0.9), #fff 55%)"
          : "linear-gradient(145deg, #fff, rgba(248,250,252,0.72))",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: needsOwnerReply ? "warning.main" : "primary.light",
          boxShadow: "0 14px 32px rgba(15,23,42,0.08)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ height: 4, bgcolor: status.accent }} />

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={800}
                >
                  {ticket.ticketNumber || `Ticket #${ticket.id}`}
                </Typography>

                {needsOwnerReply && (
                  <Chip
                    size="small"
                    icon={
                      <MarkChatUnreadOutlined
                        sx={{ fontSize: "15px !important" }}
                      />
                    }
                    label="Action needed"
                    color="warning"
                    sx={{ height: 24, fontWeight: 800 }}
                  />
                )}
              </Stack>

              <Typography
                variant="h6"
                fontWeight={850}
                sx={{ mt: 0.55, lineHeight: 1.35, overflowWrap: "anywhere" }}
              >
                {ticket.subject || "Support request"}
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
                icon={<BusinessOutlined sx={{ fontSize: "15px !important" }} />}
                label={ticket.libraryName}
              />
            )}
          </Stack>

          {ticket.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.65,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {ticket.description}
            </Typography>
          )}

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Last activity
              </Typography>

              <Typography variant="body2" fontWeight={700}>
                {formatDateTime(
                  ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
                )}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ color: "primary.main" }}
            >
              <Typography variant="body2" fontWeight={850}>
                Open ticket
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
// OWNER MY SUPPORT TICKETS
// ============================================================

function MySupportTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [librariesLoading, setLibrariesLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("UPDATED_DESC");

  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLibrariesLoading(true);

      const response = await libraryApi.getMyLibraries();
      const list = normalizeListResponse(response);

      setLibraries(list);

      if (list.length === 0) {
        setSelectedLibraryId("");
        return;
      }

      const storedLibraryId = getStoredLibraryId();
      const storedLibrary =
        storedLibraryId != null
          ? list.find((library) => Number(library?.id) === storedLibraryId)
          : null;

      const selectedLibrary = storedLibrary || list[0];
      const nextId = String(selectedLibrary.id);

      setSelectedLibraryId(nextId);
      storeLibraryId(nextId);
    } catch (requestError) {
      console.error("Failed to load owner libraries:", requestError);
      setLibraries([]);
      setSelectedLibraryId("");
      setError(getErrorMessage(requestError, "Unable to load your libraries."));
    } finally {
      setLibrariesLoading(false);
    }
  }, []);

  // ==========================================================
  // LOAD TICKETS
  // ==========================================================

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await supportTicketApi.getOwnerTickets();
      setTickets(normalizeListResponse(data));
    } catch (requestError) {
      console.error("Failed to load owner support tickets:", requestError);
      setError(
        getErrorMessage(requestError, "Unable to load support tickets."),
      );
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibraries();
    loadTickets();
  }, [loadLibraries, loadTickets]);

  // Keep this screen synchronized with the working library used
  // across Members, Payments, Billing, Coupons and Help & Support.
  useEffect(() => {
    const handleLibraryChanged = (event) => {
      const nextLibraryId = Number(event?.detail?.libraryId);
      if (!Number.isFinite(nextLibraryId)) return;

      const exists = libraries.some(
        (library) => Number(library?.id) === nextLibraryId,
      );

      if (!exists) return;

      setSelectedLibraryId(String(nextLibraryId));
      storeLibraryId(nextLibraryId);
      setSearch("");
      setStatusFilter("ALL");
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, [libraries]);

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library?.id) === String(selectedLibraryId),
      ) ?? null,
    [libraries, selectedLibraryId],
  );

  // ==========================================================
  // LIBRARY-SCOPED TICKETS
  // ==========================================================

  const libraryTickets = useMemo(
    () =>
      tickets.filter((ticket) =>
        ticketBelongsToLibrary(ticket, selectedLibrary),
      ),
    [tickets, selectedLibrary],
  );

  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    const total = libraryTickets.length;
    const open = libraryTickets.filter(
      (ticket) => ticket.status === "OPEN",
    ).length;
    const needsReply = libraryTickets.filter(
      (ticket) => ticket.status === "WAITING_FOR_USER",
    ).length;
    const active = libraryTickets.filter((ticket) =>
      ["IN_PROGRESS", "WAITING_FOR_USER", "WAITING_FOR_SUPPORT"].includes(
        ticket.status,
      ),
    ).length;
    const resolved = libraryTickets.filter((ticket) =>
      ["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    return { total, open, needsReply, active, resolved };
  }, [libraryTickets]);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = libraryTickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesSearch =
        !keyword ||
        [
          ticket.ticketNumber,
          ticket.subject,
          ticket.description,
          ticket.category,
          ticket.libraryName,
          ticket.status,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword),
        );

      return matchesStatus && matchesSearch;
    });

    return [...result].sort((first, second) => {
      if (sortOrder === "UPDATED_ASC") {
        return getTicketTime(first) - getTicketTime(second);
      }

      if (sortOrder === "CREATED_DESC") {
        const firstTime = first?.createdAt
          ? new Date(first.createdAt).getTime()
          : 0;
        const secondTime = second?.createdAt
          ? new Date(second.createdAt).getTime()
          : 0;
        return secondTime - firstTime;
      }

      if (sortOrder === "ATTENTION") {
        const priority = (ticket) => {
          if (ticket?.status === "WAITING_FOR_USER") return 0;
          if (ticket?.status === "OPEN") return 1;
          if (ticket?.status === "IN_PROGRESS") return 2;
          if (ticket?.status === "WAITING_FOR_SUPPORT") return 3;
          return 4;
        };

        const priorityDiff = priority(first) - priority(second);
        return priorityDiff !== 0
          ? priorityDiff
          : getTicketTime(second) - getTicketTime(first);
      }

      return getTicketTime(second) - getTicketTime(first);
    });
  }, [libraryTickets, search, statusFilter, sortOrder]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== "ALL" ||
    sortOrder !== "UPDATED_DESC";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSortOrder("UPDATED_DESC");
  };

  const handleLibraryChange = (event) => {
    const nextId = String(event.target.value);

    setSelectedLibraryId(nextId);
    storeLibraryId(nextId);
    setSearch("");
    setStatusFilter("ALL");
    setError("");

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: Number(nextId) },
      }),
    );
  };

  const handleCreateRequest = () => {
    navigate("/owner/help-support", {
      state: {
        scrollToSupportForm: true,
        libraryId: selectedLibraryId ? Number(selectedLibraryId) : null,
      },
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      {/* BACK */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/owner/help-support")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 750 }}
      >
        Back to Help & Support
      </Button>

      {/* PREMIUM HERO */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.13)",
          borderRadius: 4,
          mb: 3,
          overflow: "hidden",
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.115), rgba(255,255,255,1) 56%, rgba(99,102,241,0.055))",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            width: 250,
            height: 250,
            borderRadius: "50%",
            right: -95,
            top: -125,
            bgcolor: "rgba(79,70,229,0.055)",
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
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 12px 30px rgba(79,70,229,0.24)",
                }}
              >
                <SupportAgent />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={850}
                  sx={{ letterSpacing: "-0.025em" }}
                >
                  My Support Tickets
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Track conversations with LibraryHub support and quickly spot
                  requests that need your attention.
                </Typography>

                {selectedLibrary && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <BusinessOutlined
                      sx={{ fontSize: 17, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Working library: <strong>{selectedLibrary.name}</strong>
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 240 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "background.paper",
                    borderRadius: 2.5,
                  },
                }}
              >
                <InputLabel>Working Library</InputLabel>
                <Select
                  value={selectedLibraryId}
                  label="Working Library"
                  disabled={librariesLoading || libraries.length === 0}
                  onChange={handleLibraryChange}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name || `Library #${library.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Add />}
                disabled={!selectedLibraryId}
                onClick={handleCreateRequest}
                sx={{
                  minHeight: 40,
                  px: 2.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 750,
                  whiteSpace: "nowrap",
                }}
              >
                New Support Request
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {counts.needsReply > 0 && !loading && (
        <Alert
          severity="warning"
          icon={<MarkChatUnreadOutlined />}
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setStatusFilter("WAITING_FOR_USER")}
              sx={{ fontWeight: 800 }}
            >
              Review now
            </Button>
          }
        >
          {counts.needsReply === 1
            ? "1 support ticket is waiting for your response."
            : `${counts.needsReply} support tickets are waiting for your response.`}
        </Alert>
      )}

      {/* INTERACTIVE SUMMARY */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Total Tickets"
            value={counts.total}
            description="For this working library"
            icon={<ForumOutlined />}
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Open"
            value={counts.open}
            description="Newly submitted requests"
            icon={<HourglassTop />}
            active={statusFilter === "OPEN"}
            onClick={() => setStatusFilter("OPEN")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Waiting for You"
            value={counts.needsReply}
            description="Support needs your response"
            icon={<MarkChatUnreadOutlined />}
            active={statusFilter === "WAITING_FOR_USER"}
            onClick={() => setStatusFilter("WAITING_FOR_USER")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Resolved"
            value={counts.resolved}
            description="Resolved or closed requests"
            icon={<TaskAlt />}
            active={statusFilter === "RESOLVED"}
            onClick={() => setStatusFilter("RESOLVED")}
          />
        </Grid>
      </Grid>

      {/* FILTER WORKSPACE */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.4, "&:last-child": { pb: 2.4 } }}>
          <Stack
            direction={{ xs: "column", xl: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", xl: "center" }}
            spacing={2}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket number, subject, message, category or status"
              sx={{
                width: { xs: "100%", xl: 520 },
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.3}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{
                  minWidth: 190,
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
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
                size="small"
                label="Sort"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                sx={{
                  minWidth: 190,
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                }}
                InputProps={{
                  startAdornment: (
                    <Sort sx={{ mr: 0.75, color: "text.secondary" }} />
                  ),
                }}
              >
                <MenuItem value="UPDATED_DESC">Recently updated</MenuItem>
                <MenuItem value="UPDATED_ASC">Oldest activity</MenuItem>
                <MenuItem value="CREATED_DESC">Newest created</MenuItem>
                <MenuItem value="ATTENTION">Needs attention first</MenuItem>
              </TextField>

              {hasActiveFilters && (
                <Button
                  variant="text"
                  startIcon={<FilterAltOff />}
                  onClick={clearFilters}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Clear
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <Refresh />
                }
                disabled={loading}
                onClick={loadTickets}
                sx={{
                  minHeight: 40,
                  textTransform: "none",
                  fontWeight: 750,
                  borderRadius: 2.5,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 3, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {/* DIRECTORY HEADER */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={850}>
            Support conversations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loading
              ? "Loading your tickets..."
              : `${filteredTickets.length} of ${libraryTickets.length} tickets shown`}
          </Typography>
        </Box>

        {!loading && counts.active > 0 && (
          <Chip
            icon={<CheckCircleOutlineOutlined sx={{ fontSize: "17px !important" }} />}
            label={`${counts.active} active`}
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Stack>

      {/* TICKET LIST */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid key={item} size={{ xs: 12, md: 6, xl: 4 }}>
              <Skeleton
                variant="rounded"
                height={245}
                sx={{ borderRadius: 3.5 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredTickets.length === 0 ? (
        <Card
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 4 }}
        >
          <CardContent>
            <Box sx={{ py: 7, textAlign: "center" }}>
              <SupportAgent sx={{ fontSize: 54, color: "text.disabled" }} />

              <Typography variant="h6" fontWeight={850} sx={{ mt: 1.2 }}>
                {libraryTickets.length === 0
                  ? "No support tickets for this library"
                  : "No matching tickets"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.6, maxWidth: 500, mx: "auto" }}
              >
                {libraryTickets.length === 0
                  ? "Create a LibraryHub support request whenever you need help with platform, payment, billing or technical issues."
                  : "Try changing the search, status filter or sort option."}
              </Typography>

              {libraryTickets.length === 0 ? (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateRequest}
                  sx={{
                    mt: 2.5,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 750,
                  }}
                >
                  Create Support Request
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOff />}
                  onClick={clearFilters}
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
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredTickets.map((ticket) => (
            <Grid key={ticket.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <TicketCard
                ticket={ticket}
                onClick={() => navigate(`/owner/support/tickets/${ticket.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MySupportTickets;
